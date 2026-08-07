import { db, USE_DEMO_MODE } from '../config/firebase.js';
import { collection, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';

export async function updateTeamMember(userId, data) {
  if (USE_DEMO_MODE) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
}

export function subscribeTeamMembers(callback) {
  if (USE_DEMO_MODE) {
    callback([
      { id: 'demo-seller-001', name: 'Vendedor Demo', email: 'vendedor@netomodas.com', role: 'seller', status: 'approved' },
      { id: 'demo-admin-claudemar-001', name: 'Gestor Claudemar', email: 'admin@netomodas.com', role: 'admin', status: 'approved' }
    ]);
    return () => {};
  }

  const usersCol = collection(db, 'users');
  return onSnapshot(usersCol, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(users);
  }, (error) => {
    console.error("Erro ao buscar equipe:", error);
    callback([]);
  });
}
