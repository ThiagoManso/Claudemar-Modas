/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DA APLICAÇÃO (ROUTER & ESTADO DO SISTEMA)
 * ============================================================================
 */

import './styles/main.css';
import { onAuthChange, logout, loginWithEmail } from './services/authService.js';
import { subscribeContacts, deleteContact, addContact } from './services/contactService.js';
import { subscribeTeamMembers } from './services/teamService.js';
import { renderNavbar, bindNavbarEvents } from './components/Navbar.js';
import { renderLoginView } from './views/LoginView.js';
import { renderContactListView } from './views/ContactListView.js';
import { renderMapView } from './views/MapView.js';
import { renderPublicFormView } from './views/PublicFormView.js';
import { renderFinanceView, destroyFinanceView } from './views/FinanceView.js';
import { renderPayablesView, destroyPayablesView } from './views/PayablesView.js';
import { renderTeamView } from './views/TeamView.js';
import { renderPendingView } from './views/PendingView.js';
import { showToast } from './components/Toast.js';

// Estado global do aplicativo
let currentUser = null;
let currentContacts = [];
let currentTeam = [];
let currentView = 'admin'; // 'admin', 'mapa', 'login', 'cadastro', 'cobrancas', 'despesas', 'equipe', 'pendente'
let unsubscribeContacts = null;
let unsubscribeTeam = null;

const appContainer = document.getElementById('app');

function handleHashChange() {
  const hash = window.location.hash.substring(1) || 'admin';
  
  if (hash === 'cadastro') {
    currentView = 'cadastro';
  } else if (currentUser && currentUser.role === 'pending') {
    currentView = 'pendente';
    if (window.location.hash !== '#pendente') {
      window.location.hash = '#pendente';
    }
  } else if (hash === 'mapa') {
    currentView = !currentUser ? 'login' : 'mapa';
  } else if (hash === 'cobrancas') {
    currentView = !currentUser ? 'login' : 'cobrancas';
  } else if (hash === 'despesas') {
    currentView = !currentUser ? 'login' : 'despesas';
  } else if (hash === 'equipe') {
    currentView = !currentUser || currentUser.role !== 'admin' ? 'admin' : 'equipe';
  } else if (hash === 'login') {
    currentView = currentUser ? 'admin' : 'login';
  } else {
    currentView = !currentUser ? 'login' : 'admin';
  }

  renderCurrentView();
}

/**
 * Inicialização Principal do CRM
 */
function initApp() {
  window.addEventListener('hashchange', handleHashChange);
  
  onAuthChange((user) => {
    currentUser = user;
    
    // Se o usuário está pendente e não está no cadastro, força a view pendente
    if (user && user.role === 'pending' && currentView !== 'cadastro' && currentView !== 'pendente') {
      currentView = 'pendente';
      window.location.hash = '#pendente';
    } 
    // Se não estiver logado e tentar acessar área restrita
    else if (!user && (currentView === 'admin' || currentView === 'mapa' || currentView === 'cobrancas' || currentView === 'despesas' || currentView === 'equipe' || currentView === 'pendente')) {
      currentView = 'login';
      window.location.hash = '#login';
    } 
    // Se estiver logado, não for pending, e tentar acessar o login
    else if (user && user.role !== 'pending' && currentView === 'login') {
      currentView = 'admin';
      window.location.hash = '#admin';
    }

    if (user && !unsubscribeContacts && user.role !== 'pending') {
      unsubscribeContacts = subscribeContacts(user, (contacts) => {
        currentContacts = contacts;
        if (currentView === 'admin' || currentView === 'mapa' || currentView === 'cobrancas' || currentView === 'despesas') {
          renderCurrentView();
        }
      });
    } else if (!user || user.role === 'pending') {
      if (unsubscribeContacts) {
        unsubscribeContacts();
        unsubscribeContacts = null;
      }
      currentContacts = [];
    }

    if (user && user.role === 'admin' && !unsubscribeTeam) {
      unsubscribeTeam = subscribeTeamMembers((team) => {
        currentTeam = team;
        if (currentView === 'equipe') {
          renderCurrentView();
        }
      });
    } else if ((!user || user.role !== 'admin') && unsubscribeTeam) {
      unsubscribeTeam();
      unsubscribeTeam = null;
    }

    renderCurrentView();
  });
  
  // Tratamento inicial se já tiver uma hash ao carregar a página sem estar logado
  if (!window.location.hash) {
    window.location.hash = '#admin';
  } else {
    handleHashChange();
  }
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
  
  if (currentView === 'pendente') {
    renderPendingView(viewContainer, handleLogout);
    return;
  }

  if (currentView === 'mapa') {
    renderMapView(viewContainer, currentContacts);
    return;
  }

  if (currentView === 'cobrancas') {
    renderFinanceView(viewContainer, currentUser, currentTeam);
    return;
  } else {
    destroyFinanceView();
  }

  if (currentView === 'despesas') {
    renderPayablesView(viewContainer, currentUser);
    return;
  } else {
    destroyPayablesView();
  }

  if (currentView === 'equipe' && currentUser.role === 'admin') {
    renderTeamView(viewContainer, currentTeam);
    return;
  }

  renderContactListView(viewContainer, currentContacts, currentUser, currentTeam, async (id) => {
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
  if (unsubscribeTeam) {
    unsubscribeTeam();
    unsubscribeTeam = null;
  }
  await logout();
  showToast('Sessão encerrada com sucesso.', 'info');
  window.location.hash = '#login';
}

function navigateTo(view) {
  window.location.hash = `#${view}`;
}

document.addEventListener('DOMContentLoaded', initApp);
