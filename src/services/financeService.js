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
  orderBy,
  arrayUnion
} from 'firebase/firestore';

const COLLECTION_NAME = 'sales';

// Memória local para o modo DEMO
let demoSales = [];

/**
 * Adiciona uma nova dívida/mercadoria consignada
 */
export async function addDebt(contactId, contactName, amount, ownerId = null) {
  const payload = {
    contactId,
    contactName,
    amountTotal: parseFloat(amount),
    amountPaid: 0,
    status: 'pending',
    ownerId: ownerId,
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
  
  const newPaid = (debt.amountPaid || 0) + parseFloat(paymentAmount);
  const status = newPaid >= debt.amountTotal ? 'paid' : 'pending';
  
  const newPayment = {
    amount: parseFloat(paymentAmount),
    date: new Date().toISOString(),
    type: 'partial'
  };

  if (USE_DEMO_MODE) {
    const idx = demoSales.findIndex(d => d.id === debt.id);
    if (idx !== -1) {
      demoSales[idx].amountPaid = newPaid;
      demoSales[idx].status = status;
      if (!demoSales[idx].payments) demoSales[idx].payments = [];
      demoSales[idx].payments.push(newPayment);
    }
    return;
  }

  const updates = {
    amountPaid: newPaid,
    status: status,
    payments: arrayUnion(newPayment)
  };

  const debtRef = doc(db, COLLECTION_NAME, debt.id);
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
export function subscribeToPendingDebts(user, callback) {
  if (USE_DEMO_MODE) {
    let filtered = demoSales.filter(d => d.status === 'pending');
    if (user && user.role !== 'admin') {
      filtered = filtered.filter(d => d.ownerId === user.uid);
    }
    callback(filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    return () => {};
  }

  let q;
  if (user && user.role !== 'admin') {
    q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "pending"),
      where("ownerId", "==", user.uid)
    );
  } else {
    q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "pending")
    );
  }

  return onSnapshot(q, (snapshot) => {
    const debts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    debts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(debts);
  }, (error) => {
    console.error("Erro ao escutar dívidas pendentes:", error);
    callback([]);
  });
}
