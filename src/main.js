/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DA APLICAÇÃO (ROUTER & ESTADO DO SISTEMA)
 * ============================================================================
 */

import './styles/main.css';
import { onAuthChange, logout, loginWithEmail } from './services/authService.js';
import { subscribeContacts, deleteContact, addContact } from './services/contactService.js';
import { renderNavbar, bindNavbarEvents } from './components/Navbar.js';
import { renderLoginView } from './views/LoginView.js';
import { renderContactListView } from './views/ContactListView.js';
import { renderMapView } from './views/MapView.js';
import { renderPublicFormView } from './views/PublicFormView.js';
import { renderFinanceView, destroyFinanceView } from './views/FinanceView.js';
import { showToast } from './components/Toast.js';

// Estado global do aplicativo
let currentUser = null;
let currentContacts = [];
let currentView = 'admin'; // 'admin', 'mapa', 'login', 'cadastro', 'financeiro'
let unsubscribeContacts = null;

const appContainer = document.getElementById('app');

/**
 * Inicialização Principal do CRM
 */
function initApp() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'cadastro') {
    currentView = 'cadastro';
  } else if (hash === 'mapa') {
    currentView = 'mapa';
  } else if (hash === 'cobrancas') {
    currentView = 'cobrancas';
  } else if (hash === 'login') {
    currentView = 'login';
  } else {
    currentView = 'admin';
  }

  window.addEventListener('hashchange', handleHashChange);

  onAuthChange((user) => {
    currentUser = user;
    
    if (!user && (currentView === 'admin' || currentView === 'mapa')) {
      currentView = 'login';
      window.location.hash = '#login';
    } else if (user && currentView === 'login') {
      currentView = 'admin';
      window.location.hash = '#admin';
    }

    if (user && !unsubscribeContacts) {
      unsubscribeContacts = subscribeContacts((contacts) => {
        currentContacts = contacts;
        if (currentView === 'admin' || currentView === 'mapa' || currentView === 'cobrancas') {
          renderCurrentView();
        }
      });
    }

    renderCurrentView();
  });
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'cadastro') {
    currentView = 'cadastro';
  } else if (hash === 'mapa') {
    currentView = !currentUser ? 'login' : 'mapa';
  } else if (hash === 'cobrancas') {
    currentView = !currentUser ? 'login' : 'cobrancas';
  } else if (hash === 'login') {
    currentView = currentUser ? 'admin' : 'login';
  } else {
    currentView = !currentUser ? 'login' : 'admin';
  }
  renderCurrentView();
}

/**
 * Renderiza a interface apropriada
 */
function renderCurrentView() {
  if (!appContainer) return;

  appContainer.innerHTML = '';
  
  // Navbar Wrapper
  const navWrapper = document.createElement('div');
  navWrapper.innerHTML = renderNavbar(currentView, currentUser, navigateTo, handleLogout);
  appContainer.appendChild(navWrapper);
  
  // Container de conteúdo para as views
  const viewContainer = document.createElement('div');
  viewContainer.className = 'flex-1 flex flex-col';
  appContainer.appendChild(viewContainer);

  bindNavbarEvents(handleLogout);

  if (currentView === 'cadastro') {
    renderPublicFormView(viewContainer, async (data) => {
      try {
        await addContact(data);
        return true;
      } catch(err) {
        return false;
      }
    });
    return;
  }

  if (currentView === 'login' || !currentUser) {
    renderLoginView(viewContainer, async (email, password) => {
      const result = await loginWithEmail(email, password);
      if (result.user) {
        showToast('Login realizado com sucesso', 'success');
        return true;
      } else {
        return false;
      }
    });
    return;
  }

  if (currentView === 'mapa') {
    renderMapView(viewContainer, currentContacts);
    return;
  }

  if (currentView === 'cobrancas') {
    renderFinanceView(viewContainer);
    return;
  } else {
    destroyFinanceView();
  }

  renderContactListView(viewContainer, currentContacts, async (id) => {
    try {
      await deleteContact(id);
      showToast('Contato excluído', 'success');
    } catch(err) {
      showToast('Erro ao excluir contato', 'error');
    }
  });
}

async function handleLogout() {
  if (unsubscribeContacts) {
    unsubscribeContacts();
    unsubscribeContacts = null;
  }
  await logout();
  showToast('Sessão encerrada com sucesso.', 'info');
  window.location.hash = '#login';
}

function navigateTo(view) {
  window.location.hash = `#${view}`;
}

document.addEventListener('DOMContentLoaded', initApp);
