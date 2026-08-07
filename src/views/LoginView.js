/**
 * ============================================================================
 * VIEW DE LOGIN E REGISTRO DO GESTOR/EQUIPE
 * ============================================================================
 */

import { registerWithEmail } from '../services/authService.js';
import { showToast } from '../components/Toast.js';

export function renderLoginView(container, onLogin) {
  container.innerHTML = `
    <div class="flex-1 flex min-h-[calc(100vh-64px)] bg-surface items-center justify-center p-4">
      
      <div class="w-full max-w-4xl bg-white rounded-3xl shadow-soft overflow-hidden flex flex-col md:flex-row">
        
        <!-- Lado Esquerdo (Imagem / Branding) -->
        <div class="hidden md:flex md:w-1/2 bg-brand-50 p-12 flex-col justify-between relative overflow-hidden">
          <div class="relative z-10">
            <div class="w-24 h-24 bg-brand-100 rounded-2xl mb-6 flex items-center justify-center text-brand-600 shadow-sm overflow-hidden">
              <img src="/logo.jpg" alt="Neto Modas Logo" class="w-full h-full object-cover" />
            </div>
            <h1 class="text-3xl font-display font-bold text-brand-800 mb-4">Neto Modas</h1>
            <p class="text-brand-600 text-lg leading-relaxed">
              Sistema de gestão exclusivo para controle de clientes e relacionamento em moda e enxovais.
            </p>
          </div>
          
          <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-200 rounded-full opacity-50 blur-3xl"></div>
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-brand-200 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <!-- Lado Direito (Formulário) -->
        <div class="w-full md:w-1/2 p-8 sm:p-12 relative">
          
          <!-- Tabs -->
          <div class="flex gap-4 mb-8 border-b border-slate-100 pb-2">
            <button id="tab-login" class="text-lg font-bold text-brand-600 border-b-2 border-brand-600 pb-2 transition-colors">Entrar</button>
            <button id="tab-register" class="text-lg font-bold text-slate-400 border-b-2 border-transparent pb-2 hover:text-slate-600 transition-colors">Cadastrar-se</button>
          </div>

          <!-- Form Login -->
          <form id="login-form" class="space-y-6">
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-slate-700">E-mail</label>
              <input type="email" id="email" required placeholder="seu@email.com" 
                class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400" />
            </div>

            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-slate-700">Senha</label>
              <input type="password" id="password" required placeholder="••••••••" 
                class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400" />
            </div>

            <div id="login-error" class="hidden text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>Usuário ou senha inválidos.</span>
            </div>

            <button type="submit" id="btn-submit-login" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-4">
              <span>Entrar no Sistema</span>
            </button>
          </form>

          <!-- Form Register -->
          <form id="register-form" class="space-y-6 hidden">
            <div class="space-y-2">
              <label for="reg-name" class="block text-sm font-semibold text-slate-700">Nome Completo</label>
              <input type="text" id="reg-name" required placeholder="João da Silva" 
                class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400" />
            </div>

            <div class="space-y-2">
              <label for="reg-email" class="block text-sm font-semibold text-slate-700">E-mail</label>
              <input type="email" id="reg-email" required placeholder="seu@email.com" 
                class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400" />
            </div>

            <div class="space-y-2">
              <label for="reg-password" class="block text-sm font-semibold text-slate-700">Senha</label>
              <input type="password" id="reg-password" required placeholder="Mínimo 6 caracteres" minlength="6"
                class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400" />
            </div>

            <button type="submit" id="btn-submit-register" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-4">
              <span>Criar Conta</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  `;

  const formLogin = document.getElementById('login-form');
  const formRegister = document.getElementById('register-form');
  const errorBox = document.getElementById('login-error');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const btnSubmitRegister = document.getElementById('btn-submit-register');
  
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  // Toggle Tabs
  tabLogin.addEventListener('click', () => {
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
    tabLogin.classList.add('text-brand-600', 'border-brand-600');
    tabLogin.classList.remove('text-slate-400', 'border-transparent');
    tabRegister.classList.add('text-slate-400', 'border-transparent');
    tabRegister.classList.remove('text-brand-600', 'border-brand-600');
  });

  tabRegister.addEventListener('click', () => {
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
    tabRegister.classList.add('text-brand-600', 'border-brand-600');
    tabRegister.classList.remove('text-slate-400', 'border-transparent');
    tabLogin.classList.add('text-slate-400', 'border-transparent');
    tabLogin.classList.remove('text-brand-600', 'border-brand-600');
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    
    const originalContent = btnSubmitLogin.innerHTML;
    btnSubmitLogin.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;
    btnSubmitLogin.disabled = true;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const success = await onLogin(email, password);
    
    if (!success) {
      errorBox.classList.remove('hidden');
      btnSubmitLogin.innerHTML = originalContent;
      btnSubmitLogin.disabled = false;
    }
  });

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalContent = btnSubmitRegister.innerHTML;
    btnSubmitRegister.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;
    btnSubmitRegister.disabled = true;

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
      await registerWithEmail(email, password, name);
      showToast('Conta criada com sucesso! Aguarde aprovação (ou faça login).', 'success');
      // A própria mudança no onAuthStateChanged (disparada pelo login automático após registro) fará o redirecionamento
    } catch(err) {
      showToast('Erro ao criar conta: ' + err.message, 'error');
      btnSubmitRegister.innerHTML = originalContent;
      btnSubmitRegister.disabled = false;
    }
  });
}
