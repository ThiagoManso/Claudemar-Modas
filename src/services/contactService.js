/**
 * ============================================================================
 * SERVIÇO DE CONTATOS / CLIENTES (Cloud Firestore + CEP + Geocodificação)
 * ============================================================================
 */

import { db, USE_DEMO_MODE } from '../config/firebase.js';
import { 
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

// Base de Clientes de Demonstração (com coordenadas para visualização imediata no mapa)
let demoContacts = [
  {
    id: "cliente-001",
    fullName: "Mariana Souza Silva",
    phone: "(11) 98765-4321",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
    street: "Av. Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    cep: "01310-100",
    document: "458.123.789-00",
    birthDate: "1992-05-14",
    lat: -23.561684,
    lng: -46.655981,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "cliente-002",
    fullName: "Carlos Eduardo de Andrade",
    phone: "(11) 97654-3210",
    address: "Rua Oscar Freire, 750 - Cerqueira César, São Paulo - SP, 01426-001",
    street: "Rua Oscar Freire",
    number: "750",
    neighborhood: "Cerqueira César",
    city: "São Paulo",
    state: "SP",
    cep: "01426-001",
    document: "321.654.987-11",
    birthDate: "1985-11-20",
    lat: -23.562947,
    lng: -46.668582,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "cliente-003",
    fullName: "Fernanda Costa Lemos",
    phone: "(11) 99123-4567",
    address: "Rua Augusta, 1500 - Consolação, São Paulo - SP, 01304-001",
    street: "Rua Augusta",
    number: "1500",
    neighborhood: "Consolação",
    city: "São Paulo",
    state: "SP",
    cep: "01304-001",
    document: "159.753.486-22",
    birthDate: "1998-03-08",
    lat: -23.555811,
    lng: -46.662194,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "cliente-004",
    fullName: "Lucas Mendonça Ferreira",
    phone: "(11) 98111-2233",
    address: "Av. Brigadeiro Faria Lima, 2200 - Jardim Paulistano, São Paulo - SP, 01451-000",
    street: "Av. Brigadeiro Faria Lima",
    number: "2200",
    neighborhood: "Jardim Paulistano",
    city: "São Paulo",
    state: "SP",
    cep: "01451-000",
    document: "789.456.123-55",
    birthDate: "1990-08-30",
    lat: -23.578135,
    lng: -46.687452,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const subscribers = [];

/**
 * Consulta CEP na API pública ViaCEP
 */
export async function fetchCepAddress(cep) {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf
    };
  } catch (err) {
    console.error("Erro na busca de CEP:", err);
    return null;
  }
}

/**
 * Gera coordenadas precisas buscando o endereço na API de Geocoding do Google Maps
 */
async function geocodeAddress(contactData) {
  let lat = null;
  let lng = null;

  try {
    if (GOOGLE_MAPS_API_KEY) {
      // Cria a string do endereço ignorando partes vazias
      const parts = [
        contactData.street,
        contactData.number,
        contactData.neighborhood,
        contactData.city,
        contactData.state,
        "Brasil"
      ].filter(p => p && p.toString().trim() !== '');
      
      const addressString = parts.join(', ');
      
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        lat = data.results[0].geometry.location.lat;
        lng = data.results[0].geometry.location.lng;
      } else {
        console.warn("Geocoding não retornou OK. Status:", data.status, "Mensagem:", data.error_message, "Endereço buscado:", addressString);
      }
    }
  } catch (error) {
    console.warn("Erro ao fazer fetch na API de Geocoding do Google:", error);
  }

  // Tenta o fallback do Nominatim (OpenStreetMap) se o Google falhar ou não retornar resultados
  if (!lat || !lng) {
    try {
      const parts = [
        contactData.street,
        contactData.number,
        contactData.city,
        contactData.state,
        "Brasil"
      ].filter(p => p && p.toString().trim() !== '');
      
      if (parts.length >= 2) {
        const addressString = parts.join(', ');
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        } else {
          console.warn("Nominatim não encontrou coordenadas para:", addressString);
        }
      }
    } catch (error) {
      console.warn("Erro ao fazer fetch na API do Nominatim:", error);
    }
  }

  // Fallback visual espalhado caso tudo falhe (endereço totalmente inválido/vazio)
  if (!lat || !lng) {
    const cepNum = parseInt((contactData.cep || '').replace(/\D/g, '')) || 0;
    lat = -23.55 + ((cepNum % 1000) * 0.0001);
    lng = -46.63 + ((cepNum % 1000) * 0.0001);
  }

  return { lat, lng };
}

/**
 * Adiciona um novo contato / cliente ao banco (Usado pelo Formulário Público e Painel)
 */
export async function addContact(contactData) {
  const coords = await geocodeAddress(contactData);
  
  const formattedParts = [contactData.street, contactData.number, contactData.neighborhood, contactData.city, contactData.state, contactData.cep].filter(Boolean);
  const formattedAddress = formattedParts.join(', ');

  const payload = {
    ...contactData,
    address: formattedAddress,
    lat: coords.lat,
    lng: coords.lng,
    createdAt: new Date().toISOString()
  };

  if (USE_DEMO_MODE) {
    const newContact = {
      id: "cliente-" + Math.floor(Math.random() * 90000 + 10000),
      ...payload
    };
    demoContacts.unshift(newContact);
    subscribers.forEach(cb => cb([...demoContacts]));
    return newContact;
  }

  try {
    const contactsRef = collection(db, 'contacts');
    const docRef = await addDoc(contactsRef, {
      ...payload,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error("Erro ao salvar no Firestore:", error);
    throw error;
  }
}

/**
 * Retorna todos os contatos (Acesso restrito ao Gestor)
 */
export async function getContacts() {
  if (USE_DEMO_MODE) {
    return [...demoContacts];
  }

  try {
    const contactsRef = collection(db, 'contacts');
    const q = query(contactsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("Erro ao buscar contatos no Firestore:", error);
    return [...demoContacts];
  }
}

/**
 * Inscreve-se em atualizações em tempo real (onSnapshot do Firestore)
 */
export function subscribeContacts(callback) {
  if (USE_DEMO_MODE) {
    subscribers.push(callback);
    setTimeout(() => callback([...demoContacts]), 50);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) subscribers.splice(index, 1);
    };
  }

  try {
    const contactsRef = collection(db, 'contacts');
    const q = query(contactsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      callback(contacts);
    }, (err) => {
      console.error("Erro em snapshot do Firestore:", err);
      callback([...demoContacts]);
    });
  } catch (err) {
    console.error("Erro em subscribeContacts:", err);
    callback([...demoContacts]);
    return () => {};
  }
}

/**
 * Exclui um contato do Firestore (Restrito ao Gestor)
 */
export async function deleteContact(id) {
  if (USE_DEMO_MODE) {
    demoContacts = demoContacts.filter(c => c.id !== id);
    subscribers.forEach(cb => cb([...demoContacts]));
    return true;
  }

  try {
    await deleteDoc(doc(db, 'contacts', id));
    return true;
  } catch (err) {
    console.error("Erro ao deletar contato no Firestore:", err);
    throw err;
  }
}

/**
 * Formata uma string de CEP (ex: 01310100 -> 01310-100)
 */
export function formatCEP(cep) {
  if (!cep) return '';
  const clean = cep.replace(/\D/g, '');
  if (clean.length === 8) return clean.replace(/^(\d{5})(\d{3})/, "$1-$2");
  return cep;
}
