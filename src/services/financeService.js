import { db, USE_DEMO_MODE } from '../config/firebase.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

const COLLECTION_NAME = 'sales';

// Memória local para o modo DEMO
let demoSales = [];

/**
 * Adiciona uma nova dívida/mercadoria consignada
 */
export async function addDebt(contactId, contactName, amount) {
  const payload = {
    contactId,
    contactName,
    amountTotal: parseFloat(amount),
    amountPaid: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    payments: [] // Histórico opcional
  };

  if (USE_DEMO_MODE) {
    const newDoc = { id: Date.now().toString(), ...payload };
    demoSales.push(newDoc);
    return newDoc;
  }

  const salesCol = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(salesCol, payload);
  return { id: docRef.id, ...payload };
}

/**
 * Registra um pagamento (parcial ou total)
 */
export async function registerPayment(debt, paymentAmount) {
  const newAmountPaid = (debt.amountPaid || 0) + parseFloat(paymentAmount);
  const isPaid = newAmountPaid >= debt.amountTotal;
  
  const updates = {
    amountPaid: newAmountPaid,
    status: isPaid ? 'paid' : 'pending',
    updatedAt: new Date().toISOString()
  };

  if (USE_DEMO_MODE) {
    const index = demoSales.findIndex(d => d.id === debt.id);
    if (index > -1) {
      demoSales[index] = { ...demoSales[index], ...updates };
      demoSales[index].payments.push({ amount: parseFloat(paymentAmount), date: new Date().toISOString() });
    }
    return;
  }

  const debtRef = doc(db, COLLECTION_NAME, debt.id);
  
  // Como o Firestore não tem um array.push nativo tão simples via update sem o arrayUnion (que exige importar do firestore), 
  // e pra evitar complexidade, podemos apenas atualizar os valores numéricos principais
  await updateDoc(debtRef, updates);
}

/**
 * Quita a dívida instantaneamente
 */
export async function payOffDebt(debt) {
  const remaining = debt.amountTotal - (debt.amountPaid || 0);
  return registerPayment(debt, remaining);
}

/**
 * Escuta dívidas de um cliente específico em tempo real
 */
export function subscribeToClientDebts(contactId, callback) {
  if (USE_DEMO_MODE) {
    callback(demoSales.filter(d => d.contactId === contactId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where("contactId", "==", contactId)
  );

  return onSnapshot(q, (snapshot) => {
    const debts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // O Firestore as vezes exige criação de Índice composto se usarmos orderBy + where juntos.
    // Para evitar que a tela quebre por falta de índice no Firebase do cliente, faremos a ordenação no JS.
    debts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(debts);
  }, (error) => {
    console.error("Erro ao escutar dívidas do cliente:", error);
    callback([]);
  });
}

/**
 * Escuta todas as dívidas pendentes do sistema
 */
export function subscribeToPendingDebts(callback) {
  if (USE_DEMO_MODE) {
    callback(demoSales.filter(d => d.status === 'pending').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    const debts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    debts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(debts);
  }, (error) => {
    console.error("Erro ao escutar dívidas pendentes:", error);
    callback([]);
  });
}
