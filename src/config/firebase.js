/**
 * ============================================================================
 * CONFIGURAÇÃO DO FIREBASE (Authentication & Cloud Firestore)
 * ============================================================================
 * 
 * Este arquivo inicializa a conexão com o Firebase.
 * Você pode fornecer as credenciais via variáveis de ambiente (.env) ou substituindo
 * os valores no objeto `firebaseConfig` abaixo.
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

// Configuração base do Firebase (pode ser sobrescrita pelo arquivo .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyCRMClaudemarModas_001",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crm-claudemar-modas.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crm-claudemar-modas",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crm-claudemar-modas.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Detectar se estamos em Modo Demo (para testar o app imediatamente sem precisar de uma chave real do Firebase)
export const USE_DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let app;
let auth;
let db;

let analytics;

try {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Aviso na inicialização do Firebase. Usando modo simulação de demonstração.", error);
}

export { app, auth, db };
