/**
 * ============================================================================
 * VIEW DE LOGIN DO GESTOR (TAILWIND REFACTOR)
 * ============================================================================
 */

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
          
          <!-- Elementos decorativos (círculos) -->
          <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-200 rounded-full opacity-50 blur-3xl"></div>
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-brand-200 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <!-- Lado Direito (Formulário) -->
        <div class="w-full md:w-1/2 p-8 sm:p-12">
          <div class="mb-8">
            <h2 class="text-2xl font-display font-bold text-slate-800">Acesso ao Painel</h2>
            <p class="text-slate-500 mt-2">Faça login com suas credenciais de gestor.</p>
          </div>

          <form id="login-form" class="space-y-6">
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-slate-700">E-mail Administrativo</label>
              <input type="email" id="email" required placeholder="admin@netomodas.com" 
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

            <button type="submit" id="btn-submit" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-4">
              <span>Entrar no Sistema</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-sm text-slate-500">Esqueceu a senha? Contate o suporte técnico.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const btnSubmit = document.getElementById('btn-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    
    // Feedback visual do botão
    const originalContent = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Autenticando...</span>`;
    btnSubmit.disabled = true;
    btnSubmit.classList.add('opacity-70', 'cursor-not-allowed');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const success = await onLogin(email, password);
    
    if (!success) {
      errorBox.classList.remove('hidden');
      btnSubmit.innerHTML = originalContent;
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('opacity-70', 'cursor-not-allowed');
    }
  });
}
