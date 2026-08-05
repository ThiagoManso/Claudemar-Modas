/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DA APLICAÇÃO (ROUTER & ESTADO DO SISTEMA)
 * ============================================================================
 */

import './styles/main.css';
import { onAuthChange, logout } from './services/authService.js';
import { subscribeContacts, deleteContact } from './services/contactService.js';
import { renderNavbar, bindNavbarEvents } from './components/Navbar.js';
import { renderLoginView, bindLoginEvents } from './views/LoginView.js';
import { renderContactListView, bindContactListEvents } from './views/ContactListView.js';
import { renderMapView, bindMapEvents } from './views/MapView.js';
import { renderPublicFormView, bindPublicFormEvents } from './views/PublicFormView.js';
import { showToast } from './components/Toast.js';

// Estado global do aplicativo
let currentUser = null;
let currentContacts = [];
let currentView = 'admin'; // 'admin', 'mapa', 'login', 'cadastro'
let unsubscribeContacts = null;

const appContainer = document.getElementById('app');

/**
 * Inicialização Principal do CRM
 */
function initApp() {
  // 1. Detectar Rota na URL inicial (#cadastro, #login, #mapa, #admin)
  const hash = window.location.hash.replace('#', '');
  if (hash === 'cadastro') {
    currentView = 'cadastro';
  } else if (hash === 'mapa') {
    currentView = 'mapa';
  } else if (hash === 'login') {
    currentView = 'login';
  } else {
    currentView = 'admin';
  }

  // 2. Monitorar mudanças na barra de endereço (#hash routing)
  window.addEventListener('hashchange', handleHashChange);

  // 3. Monitorar Autenticação do Gestor via Firebase Auth
  onAuthChange((user) => {
    currentUser = user;
    
    // Se não estiver logado e tentar acessar área restrita (admin ou mapa), redireciona para login
    if (!user && (currentView === 'admin' || currentView === 'mapa')) {
      currentView = 'login';
      window.location.hash = '#login';
    } else if (user && currentView === 'login') {
      currentView = 'admin';
      window.location.hash = '#admin';
    }

    // Se estiver logado no painel, escuta atualizações do Firestore em tempo real
    if (user && !unsubscribeContacts) {
      unsubscribeContacts = subscribeContacts((contacts) => {
        currentContacts = contacts;
        if (currentView === 'admin' || currentView === 'mapa') {
          renderCurrentView();
        }
      });
    }

    renderCurrentView();
  });
}

/**
 * Trata navegação por URL (#cadastro, #login, etc)
 */
function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'cadastro') {
    currentView = 'cadastro';
  } else if (hash === 'mapa') {
    currentView = !currentUser ? 'login' : 'mapa';
  } else if (hash === 'login') {
    currentView = currentUser ? 'admin' : 'login';
  } else {
    currentView = !currentUser ? 'login' : 'admin';
  }
  renderCurrentView();
}

/**
 * Renderiza a interface apropriada de acordo com o estado da aplicação
 */
function renderCurrentView() {
  if (!appContainer) return;

  // 1. TELA PÚBLICA DE CADASTRO EXTERNO (#cadastro)
  if (currentView === 'cadastro') {
    appContainer.innerHTML = renderNavbar('cadastro', currentUser, navigateTo, handleLogout) +
                             renderPublicFormView();
    bindNavbarEvents(handleLogout);
    bindPublicFormEvents(appContainer);
    return;
  }

  // 2. TELA DE LOGIN PRIVADA (#login)
  if (currentView === 'login' || !currentUser) {
    appContainer.innerHTML = renderNavbar('login', null, navigateTo, handleLogout) +
                             renderLoginView();
    bindNavbarEvents(handleLogout);
    bindLoginEvents((user) => {
      currentUser = user;
      window.location.hash = '#admin';
    });
    return;
  }

  // 3. ABA DE GOOGLE MAPS DO GESTOR (#mapa)
  if (currentView === 'mapa') {
    appContainer.innerHTML = renderNavbar('mapa', currentUser, navigateTo, handleLogout) +
                             renderMapView(currentContacts);
    bindNavbarEvents(handleLogout);
    bindMapEvents(currentContacts, handleDeleteContact);
    return;
  }

  // 4. LISTA RESUMIDA DE CLIENTES DO GESTOR (#admin / Padrão)
  appContainer.innerHTML = renderNavbar('admin', currentUser, navigateTo, handleLogout) +
                           renderContactListView(currentContacts);
  bindNavbarEvents(handleLogout);
  bindContactListEvents(currentContacts, handleDeleteContact);
}

/**
 * Executa logout e limpa inscrições do Firestore
 */
async function handleLogout() {
  if (unsubscribeContacts) {
    unsubscribeContacts();
    unsubscribeContacts = null;
  }
  await logout();
  showToast('Sessão encerrada com sucesso.', 'info');
  window.location.hash = '#login';
}

/**
 * Permite exclusão de contato pelo gestor
 */
async function handleDeleteContact(contactId) {
  return await deleteContact(contactId);
}

function navigateTo(view) {
  window.location.hash = `#${view}`;
}

// Inicializar aplicativo
document.addEventListener('DOMContentLoaded', initApp);
