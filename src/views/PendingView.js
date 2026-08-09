export function renderPendingView(container, onLogout) {
  container.innerHTML = `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div class="bg-white p-8 md:p-10 rounded-3xl shadow-soft text-center max-w-md w-full border border-slate-100">
        <div class="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 class="text-2xl md:text-3xl font-display font-bold text-slate-800 mb-3">Sem Permissão</h2>
        <p class="text-slate-600 mb-8">
          Você está logado, mas ainda não possui permissões atribuídas para visualizar os dados do sistema. 
          Por favor, contate o administrador para liberar o seu acesso.
        </p>
        <button id="btn-pending-logout" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors">
          Sair da Conta
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-pending-logout').addEventListener('click', () => {
    if (onLogout) onLogout();
  });
}
