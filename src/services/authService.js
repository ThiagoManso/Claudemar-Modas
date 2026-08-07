/**
 * ============================================================================
 * SERVIÇO DE AUTENTICAÇÃO E PERFIS (Firebase Auth + Firestore)
 * ============================================================================
 */

import { auth, db, USE_DEMO_MODE } from '../config/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Estado em Modo Demo
let demoUser = null;
const authListeners = [];

export async function loginWithEmail(email, password) {
  if (USE_DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 600)); // simula delay de rede
    if (email && password.length >= 4) {
      demoUser = {
        uid: email.includes('vendedor') ? "demo-seller-001" : "demo-admin-claudemar-001",
        email: email,
        displayName: email.includes('vendedor') ? "Vendedor Demo" : "Gestor Claudemar",
        role: email.includes('vendedor') ? 'seller' : 'admin'
      };
      authListeners.forEach(cb => cb(demoUser));
      return { user: demoUser };
    }
    throw new Error("Credenciais inválidas no modo demo.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Erro no login Firebase:", error);
    throw error;
  }
}

export async function registerWithEmail(email, password, name) {
  if (USE_DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { user: { uid: 'demo-new-user' } };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Criar perfil padrão de vendedor no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      role: 'seller', // Por padrão, entra como vendedor
      createdAt: new Date().toISOString()
    });

    return userCredential;
  } catch (error) {
    console.error("Erro no cadastro Firebase:", error);
    throw error;
  }
}

export async function logout() {
  if (USE_DEMO_MODE) {
    demoUser = null;
    authListeners.forEach(cb => cb(null));
    return;
  }
  return await signOut(auth);
}

export function onAuthChange(callback) {
  if (USE_DEMO_MODE) {
    authListeners.push(callback);
    setTimeout(() => callback(demoUser), 10);
    return () => {
      const idx = authListeners.indexOf(callback);
      if (idx > -1) authListeners.splice(idx, 1);
    };
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Buscar o perfil do usuário para saber se é admin ou seller
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          user.role = data.role || 'seller';
          user.displayName = data.name || user.email;
        } else {
          user.role = 'admin'; // Se não tem perfil, assume que é o admin legado para não quebrar o sistema atual
        }
      } catch (err) {
        console.error("Erro ao buscar perfil do usuário", err);
        user.role = 'seller'; // Fallback
      }
    }
    callback(user);
  });
}

export function getCurrentUser() {
  if (USE_DEMO_MODE) return demoUser;
  return auth?.currentUser || null;
}
