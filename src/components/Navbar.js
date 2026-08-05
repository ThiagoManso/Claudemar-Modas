/**
 * ============================================================================
 * COMPONENTE DE NAVEGAÇÃO SUPERIOR (NAVBAR - TAILWIND REFACTOR)
 * ============================================================================
 */

import { USE_DEMO_MODE } from '../config/firebase.js';
import { showToast } from './Toast.js';

let deferredPrompt = null;

// Escuta o evento de instalação nativo do Android / Chrome
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) installBtn.classList.remove('hidden');
  });
}

export function renderNavbar(currentView, user, onNavigate, onLogout) {
  const modeText = USE_DEMO_MODE ? "Modo Demo" : "Ao Vivo";
  const modeClass = USE_DEMO_MODE 
    ? "bg-amber-100 text-amber-800 border-amber-200" 
    : "bg-emerald-100 text-emerald-800 border-emerald-200";

  const getActiveClasses = (view) => 
    currentView === view 
      ? "text-brand-700 bg-brand-50" 
      : "text-slate-500 hover:text-brand-600 hover:bg-surface";

  return `
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 h-16 flex items-center justify-between shadow-soft">
      <div class="flex items-center gap-6">
        <a href="#admin" class="flex items-center gap-2 group outline-none" data-nav="admin">
          <img src="/logo.jpg" alt="Neto Modas Logo" class="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
          <span class="font-display font-bold text-lg text-slate-800 hidden sm:block tracking-tight">
            Neto Modas
          </span>
        </a>

        ${user ? `
          <nav class="hidden md:flex items-center gap-1">
            <a href="#admin" data-nav="admin" class="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${getActiveClasses('admin')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              Clientes
            </a>
            <a href="#mapa" data-nav="mapa" class="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${getActiveClasses('mapa')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              Mapa
            </a>
            <button id="btn-copy-public-link" class="px-3 py-2 rounded-lg font-medium text-sm text-slate-500 hover:text-brand-600 hover:bg-surface flex items-center gap-2 transition-colors outline-none" title="Copiar link do formulário">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Link Público
            </button>
          </nav>
        ` : ''}
      </div>

      <div class="flex items-center gap-3">
        <button id="btn-install-pwa" class="${deferredPrompt ? '' : 'hidden'} px-3 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-1 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Instalar App
        </button>

        <span class="px-2 py-1 border text-xs font-semibold rounded-full ${modeClass} hidden sm:block">
          ${modeText}
        </span>

        ${user ? `
          <div class="flex items-center gap-3 pl-3 sm:border-l border-slate-200">
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                ${(user.email || 'G').charAt(0).toUpperCase()}
              </div>
              <span class="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                ${user.displayName || user.email.split('@')[0]}
              </span>
            </div>
            <button id="btn-logout" class="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded">Sair</button>
          </div>
        ` : `
          <a href="#cadastro" class="px-4 py-2 bg-brand-50 text-brand-700 font-medium text-sm rounded-lg hover:bg-brand-100 transition-colors ml-2 hidden sm:block">
            Formulário Cliente
          </a>
        `}
      </div>
    </header>
    
    <!-- Mobile Bottom Nav (visível apenas em telas pequenas e se logado) -->
    ${user ? `
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex items-center justify-around h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <a href="#admin" data-nav="admin" class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${currentView === 'admin' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          <span class="text-[10px] font-medium">Clientes</span>
        </a>
        <a href="#mapa" data-nav="mapa" class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${currentView === 'mapa' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <span class="text-[10px] font-medium">Mapa</span>
        </a>
        <button id="btn-copy-public-link-mobile" class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors text-slate-400 hover:text-brand-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span class="text-[10px] font-medium">Link</span>
        </button>
      </nav>
    ` : ''}
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
          installBtn.classList.add('hidden');
        }
        deferredPrompt = null;
      } else {
        alert("Para adicionar à sua tela inicial no Android: clique nos 3 pontinhos do menu do Chrome (⋮) e selecione 'Adicionar à tela inicial'.");
      }
    });
  }

  const copyLinkLogic = () => {
    const publicUrl = window.location.origin + window.location.pathname + '#cadastro';
    navigator.clipboard?.writeText(publicUrl);
    showToast('Link público copiado: ' + publicUrl, 'success');
  };

  const copyLinkBtn = document.getElementById('btn-copy-public-link');
  if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyLinkLogic);
  
  const copyLinkBtnMobile = document.getElementById('btn-copy-public-link-mobile');
  if (copyLinkBtnMobile) copyLinkBtnMobile.addEventListener('click', copyLinkLogic);
}
