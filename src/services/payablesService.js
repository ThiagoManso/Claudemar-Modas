import { db, USE_DEMO_MODE } from '../config/firebase.js';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs
} from 'firebase/firestore';

const PAYABLES_COLLECTION = 'payables';
const CATEGORIES_COLLECTION = 'payableCategories';

const DEFAULT_CATEGORIES = [
  'Combustível',
  'Pedágio',
  'Aluguel',
  'Troca de óleo'
];

// Memória local para o modo DEMO
let demoPayables = [];
let demoCategories = [...DEFAULT_CATEGORIES];

export async function addPayable(title, category, amount, dueDate, ownerId) {
  const payload = {
    title,
    category,
    amount: parseFloat(amount),
    dueDate, // YYYY-MM-DD
    status: 'pending',
    ownerId,
    createdAt: new Date().toISOString()
  };

  if (USE_DEMO_MODE) {
    const newDoc = { id: Date.now().toString(), ...payload };
    demoPayables.push(newDoc);
    return newDoc;
  }

  const payablesCol = collection(db, PAYABLES_COLLECTION);
  const docRef = await addDoc(payablesCol, payload);
  return { id: docRef.id, ...payload };
}

export async function payOffPayable(payableId) {
  if (USE_DEMO_MODE) {
    const idx = demoPayables.findIndex(p => p.id === payableId);
    if (idx !== -1) {
      demoPayables[idx].status = 'paid';
      demoPayables[idx].paidAt = new Date().toISOString();
    }
    return;
  }

  const docRef = doc(db, PAYABLES_COLLECTION, payableId);
  await updateDoc(docRef, {
    status: 'paid',
    paidAt: new Date().toISOString()
  });
}

export async function reschedulePayable(payableId, newDate) {
  if (USE_DEMO_MODE) {
    const idx = demoPayables.findIndex(p => p.id === payableId);
    if (idx !== -1) {
      demoPayables[idx].dueDate = newDate;
    }
    return;
  }

  const docRef = doc(db, PAYABLES_COLLECTION, payableId);
  await updateDoc(docRef, {
    dueDate: newDate
  });
}

export async function deletePayable(payableId) {
  if (USE_DEMO_MODE) {
    demoPayables = demoPayables.filter(p => p.id !== payableId);
    return;
  }
  
  const docRef = doc(db, PAYABLES_COLLECTION, payableId);
  await deleteDoc(docRef);
}

export function subscribeToPayables(user, callback) {
  if (USE_DEMO_MODE) {
    // Para simplificar, despesas são visíveis ao dono ou ao admin
    let filtered = demoPayables;
    if (user && user.role !== 'admin') {
      filtered = demoPayables.filter(d => d.ownerId === user.uid);
    }
    callback([...filtered].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)));
    return () => {};
  }

  let q;
  if (user && user.role !== 'admin') {
    q = query(
      collection(db, PAYABLES_COLLECTION),
      where("ownerId", "==", user.uid)
    );
  } else {
    q = query(collection(db, PAYABLES_COLLECTION));
  }

  return onSnapshot(q, (snapshot) => {
    const payables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ordena por vencimento mais próximo
    payables.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    callback(payables);
  }, (error) => {
    console.error("Erro ao escutar despesas:", error);
    callback([]);
  });
}

// Categorias
export async function getCategories() {
  if (USE_DEMO_MODE) {
    return [...demoCategories];
  }

  try {
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const customCats = snap.docs.map(d => d.data().name);
    
    // Mescla padrões e customizadas removendo duplicatas
    const all = new Set([...DEFAULT_CATEGORIES, ...customCats]);
    return Array.from(all);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [...DEFAULT_CATEGORIES];
  }
}

export async function addCategory(name) {
  if (!name || name.trim() === '') return;
  const cleanName = name.trim();

  if (USE_DEMO_MODE) {
    if (!demoCategories.includes(cleanName)) {
      demoCategories.push(cleanName);
    }
    return;
  }

  // Verifica se já existe nas padrões antes de salvar no firebase
  if (DEFAULT_CATEGORIES.includes(cleanName)) return;

  const colRef = collection(db, CATEGORIES_COLLECTION);
  // Não checaremos duplicata no banco para manter simples, mas poderia com um query.
  await addDoc(colRef, { name: cleanName });
}
