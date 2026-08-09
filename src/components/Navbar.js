/**
 * ============================================================================
 * COMPONENTE DE NAVEGAÇÃO SUPERIOR (NAVBAR - TAILWIND REFACTOR)
 * ============================================================================
 */

import { USE_DEMO_MODE } from '../config/firebase.js';
import { showToast } from './Toast.js';

let deferredPrompt = null;

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

        ${user && user.role !== 'pending' ? `
          <nav class="hidden lg:flex items-center gap-1">
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
            <a href="#cobrancas" data-nav="cobrancas" class="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${getActiveClasses('cobrancas')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Receitas
            </a>
            <a href="#despesas" data-nav="despesas" class="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${getActiveClasses('despesas')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
              Despesas
            </a>
            ${user.role === 'admin' ? `
            <a href="#equipe" data-nav="equipe" class="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${getActiveClasses('equipe')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Acessos
            </a>
            ` : ''}
          </nav>
        ` : ''}
      </div>

      <div class="flex items-center gap-3">
        <button id="btn-install-pwa" class="${deferredPrompt ? '' : 'hidden'} px-3 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-1 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Instalar App
        </button>

        ${user ? `
          <div class="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                ${(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            
            ${user.role !== 'pending' ? `
            <button id="btn-mobile-menu" class="p-2 text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-2 bg-slate-100 rounded-lg border border-slate-200">
              <span class="text-sm font-semibold">Menu</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            ` : ''}
            
            <button id="btn-logout" class="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded">Sair</button>
          </div>
        ` : `
          <a href="#cadastro" class="px-4 py-2 bg-brand-50 text-brand-700 font-medium text-sm rounded-lg hover:bg-brand-100 transition-colors ml-2">
            Formulário Cliente
          </a>
        `}
      </div>
    </header>
    
    <!-- Mobile Menu Overlay -->
    ${user && user.role !== 'pending' ? `
      <div id="mobile-menu-overlay" class="fixed inset-0 bg-slate-900/50 z-50 hidden transition-opacity">
        <div id="mobile-menu-panel" class="absolute top-0 right-0 w-64 h-full bg-white shadow-xl transform translate-x-full transition-transform duration-300 flex flex-col">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
             <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  ${(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span class="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                  ${user.displayName || user.email.split('@')[0]}
                </span>
             </div>
             <button id="btn-close-mobile-menu" class="p-2 text-slate-400 hover:text-slate-600">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
          </div>
          
          <nav class="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
            <a href="#admin" class="p-3 rounded-lg flex items-center gap-3 ${currentView === 'admin' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              Clientes
            </a>
            <a href="#mapa" class="p-3 rounded-lg flex items-center gap-3 ${currentView === 'mapa' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              Mapa
            </a>
            <div class="pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Finanças</div>
            <a href="#cobrancas" class="p-3 rounded-lg flex items-center gap-3 ${currentView === 'cobrancas' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Receitas / Cobranças
            </a>
            <a href="#despesas" class="p-3 rounded-lg flex items-center gap-3 ${currentView === 'despesas' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
              Despesas a Pagar
            </a>
            
            ${user.role === 'admin' ? `
            <div class="pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Gestão</div>
            <a href="#equipe" class="p-3 rounded-lg flex items-center gap-3 ${currentView === 'equipe' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Acessos
            </a>
            ` : ''}
            
            <div class="pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</div>
            <button id="btn-copy-public-link-mobile" data-uid="${user.uid}" class="w-full p-3 rounded-lg flex items-center gap-3 text-slate-600 hover:bg-slate-50 text-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Link do Formulário
            </button>
            <button id="btn-logout-mobile" class="w-full p-3 rounded-lg flex items-center gap-3 text-red-600 hover:bg-red-50 text-left mt-auto border border-red-100">
              Sair da Conta
            </button>
          </nav>
        </div>
      </div>
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

  const logoutMobileBtn = document.getElementById('btn-logout-mobile');
  if (logoutMobileBtn) {
    logoutMobileBtn.addEventListener('click', () => {
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

  const copyLinkLogic = (e) => {
    const uid = e.currentTarget.getAttribute('data-uid') || '';
    const publicUrl = window.location.origin + window.location.pathname + '#cadastro' + (uid ? '?ref=' + uid : '');
    navigator.clipboard?.writeText(publicUrl);
    showToast('Seu link exclusivo copiado: ' + publicUrl, 'success');
  };

  const copyLinkBtn = document.getElementById('btn-copy-public-link');
  if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyLinkLogic);
  
  const copyLinkBtnMobile = document.getElementById('btn-copy-public-link-mobile');
  if (copyLinkBtnMobile) copyLinkBtnMobile.addEventListener('click', copyLinkLogic);
  
  // Lógica do Menu Mobile
  const overlay = document.getElementById('mobile-menu-overlay');
  const panel = document.getElementById('mobile-menu-panel');
  const openMenuBtn = document.getElementById('btn-mobile-menu');
  const closeMenuBtn = document.getElementById('btn-close-mobile-menu');
  
  const openMenu = () => {
    if (overlay && panel) {
      overlay.classList.remove('hidden');
      setTimeout(() => panel.classList.remove('translate-x-full'), 10); // animation tick
    }
  };
  
  const closeMenu = () => {
    if (overlay && panel) {
      panel.classList.add('translate-x-full');
      setTimeout(() => overlay.classList.add('hidden'), 300);
    }
  };
  
  if (openMenuBtn) openMenuBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
  });
  
  // Fecha ao clicar num link
  if (panel) {
    panel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }
}
