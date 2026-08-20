/**
 * ============================================================================
 * SERVIÇO DE AUTENTICAÇÃO E PERFIS (Firebase Auth + Firestore)
 * ============================================================================
 */

import { auth, db, USE_DEMO_MODE } from '../config/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Estado em Modo Demo
let demoUser = null;
const authListeners = [];
let userProfileUnsubscribe = null;

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
    
    const isSuperAdmin = email && email.trim().toLowerCase() === 'thiago.manso@orkestriaos.com.br';
    
    let retries = 3;
    let saved = false;
    
    while (retries > 0 && !saved) {
      try {
        // Criar perfil como pendente no Firestore (ou admin se for super admin)
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
          role: isSuperAdmin ? 'admin' : 'pending', // Usuário aguarda aprovação
          createdAt: new Date().toISOString()
        });
        saved = true;
      } catch (dbError) {
        console.warn(`Tentativa de salvar perfil falhou. Retentativas restantes: ${retries - 1}`, dbError);
        retries--;
        if (retries > 0) {
          // Aguarda 1.5s antes de tentar de novo para dar tempo ao token propagar
          await new Promise(r => setTimeout(r, 1500));
        } else {
          console.error("Não foi possível criar o documento no Firestore após várias tentativas.", dbError);
        }
      }
    }

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
  
  if (userProfileUnsubscribe) {
    userProfileUnsubscribe();
    userProfileUnsubscribe = null;
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
    if (userProfileUnsubscribe) {
      userProfileUnsubscribe();
      userProfileUnsubscribe = null;
    }

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Auto-heal: caso o documento não exista no Firestore (falha no cadastro), cria agora
        try {
          await setDoc(docRef, {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            role: 'pending',
            createdAt: new Date().toISOString()
          });
          console.log("Auto-heal: Documento do usuário recuperado no Firestore.");
        } catch (healError) {
          console.warn("Auto-heal falhou. O usuário está apenas na Auth.", healError);
        }
      }

      // Escutar perfil para atualização de acesso em tempo real
      userProfileUnsubscribe = onSnapshot(docRef, (userDoc) => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          const isSuperAdmin = user.email && user.email.trim().toLowerCase() === 'thiago.manso@orkestriaos.com.br';
          user.role = isSuperAdmin ? 'admin' : (data.role || 'pending');
          user.displayName = data.name || user.email;
          callback(user);
        } else {
          // Se for o admin original/antigo (criado antes do novo sistema de roles) ou o super admin
          const creationDate = new Date(user.metadata.creationTime).getTime();
          const isLegacy = creationDate < new Date('2026-08-01').getTime();
          const isSuperAdmin = user.email && user.email.trim().toLowerCase() === 'thiago.manso@orkestriaos.com.br';
          const assignedRole = (isLegacy || isSuperAdmin) ? 'admin' : 'pending';
          user.role = assignedRole;
          
          // Auto-criar o documento faltante para que ele apareça na Gestão de Equipe
          setDoc(doc(db, 'users', user.uid), {
            name: user.displayName || user.email,
            email: user.email,
            role: assignedRole,
            createdAt: new Date().toISOString()
          }).catch(err => console.error("Erro ao auto-criar documento do usuário:", err));
          
          callback(user);
        }
      }, (err) => {
        console.error("Erro ao escutar perfil do usuário", err);
        const isSuperAdmin = user.email && user.email.trim().toLowerCase() === 'thiago.manso@orkestriaos.com.br';
        user.role = isSuperAdmin ? 'admin' : 'pending';
        callback(user);
      });
    } else {
      callback(null);
    }
  });
}

export function getCurrentUser() {
  if (USE_DEMO_MODE) return demoUser;
  return auth?.currentUser || null;
}
