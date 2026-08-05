/**
 * ============================================================================
 * COMPONENTE DE NAVEGAÇÃO SUPERIOR (NAVBAR COM SUPORTE A INSTALAÇÃO PWA)
 * ============================================================================
 */

import { USE_DEMO_MODE } from '../config/firebase.js';

let deferredPrompt = null;

// Escuta o evento de instalação nativo do Android / Chrome
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) installBtn.style.display = 'inline-flex';
  });
}

export function renderNavbar(currentView, user, onNavigate, onLogout) {
  const modeText = USE_DEMO_MODE ? "Modo Demo" : "Firebase Real";
  const modeClass = USE_DEMO_MODE ? "demo" : "live";

  return `
    <header class="navbar">
      <a href="#admin" class="brand" data-nav="admin">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <span class="brand-title">Claudemar Modas CRM</span>
      </a>

      ${user ? `
        <nav class="nav-links">
          <a class="nav-item ${currentView === 'admin' ? 'active' : ''}" href="#admin" data-nav="admin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            Lista de Clientes
          </a>
          <a class="nav-item ${currentView === 'mapa' ? 'active' : ''}" href="#mapa" data-nav="mapa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            Mapa (Google Maps)
          </a>
          <a class="nav-item" href="#cadastro" target="_blank" title="Abrir formulário para enviar ao cliente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Link Público
          </a>
        </nav>

        <div class="nav-right">
          <button id="btn-install-pwa" class="btn btn-primary btn-sm" style="display: ${deferredPrompt ? 'inline-flex' : 'none'}; background: linear-gradient(135deg, hsl(160, 84%, 39%), hsl(199, 89%, 48%));" title="Adicionar aplicativo à Tela Inicial">
            📲 Instalar App Web
          </button>
          <span class="mode-badge ${modeClass}">${modeText}</span>
          <div class="user-pill">
            <div class="user-avatar">${(user.email || 'G').charAt(0).toUpperCase()}</div>
            <span>${user.displayName || user.email || 'Gestor'}</span>
          </div>
          <button id="btn-logout" class="btn btn-secondary btn-sm">Sair</button>
        </div>
      ` : `
        <div class="nav-right">
          <button id="btn-install-pwa" class="btn btn-primary btn-sm" style="display: ${deferredPrompt ? 'inline-flex' : 'none'}; background: linear-gradient(135deg, hsl(160, 84%, 39%), hsl(199, 89%, 48%));">
            📲 Instalar App Web
          </button>
          <span class="mode-badge ${modeClass}">${modeText}</span>
          <a href="#cadastro" class="btn btn-secondary btn-sm">Formulário Externo</a>
        </div>
      `}
    </header>
  `;
}

export function bindNavbarEvents(onLogout) {
  const logoutBtn = document.getElementById('btn-logout');
  const installBtn = document.getElementById('btn-install-pwa');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (onLogout) onLogout();
    });
  }

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.style.display = 'none';
        }
        deferredPrompt = null;
      } else {
        alert("Para adicionar à sua tela inicial no Android: clique nos 3 pontinhos do menu do Chrome (⋮) e selecione 'Adicionar à tela inicial'.");
      }
    });
  }
}
