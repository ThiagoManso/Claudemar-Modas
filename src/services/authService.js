/**
 * ============================================================================
 * SERVIÇO DE AUTENTICAÇÃO (Firebase Auth + Fallback Modo Demo)
 * ============================================================================
 */

import { auth, USE_DEMO_MODE } from '../config/firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Estado em Modo Demo
let demoUser = null;
const authListeners = [];

export async function loginWithEmail(email, password) {
  if (USE_DEMO_MODE) {
    // Simulação do login no painel administrativo para teste local rápido
    await new Promise(resolve => setTimeout(resolve, 600)); // simula delay de rede
    if (email && password.length >= 4) {
      demoUser = {
        uid: "demo-admin-claudemar-001",
        email: email,
        displayName: "Gestor Claudemar"
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

  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  if (USE_DEMO_MODE) return demoUser;
  return auth?.currentUser || null;
}
