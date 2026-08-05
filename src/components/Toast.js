/**
 * ============================================================================
 * COMPONENTE DE TOAST / NOTIFICAÇÃO (TAILWIND REFACTOR)
 * ============================================================================
 */

export function showToast(message, type = 'success') {
  const toastRoot = document.getElementById('toast-root');
  if (!toastRoot) return;

  const toast = document.createElement('div');
  
  // Base classes para o toast
  const baseClasses = 'px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3 transform transition-all duration-300 translate-y-4 opacity-0 border';
  
  // Estilos de acordo com o tipo
  let typeClasses = '';
  let iconHtml = '';

  if (type === 'success') {
    typeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    iconHtml = `<svg class="text-emerald-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    typeClasses = 'bg-red-50 text-red-800 border-red-200';
    iconHtml = `<svg class="text-red-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    typeClasses = 'bg-slate-800 text-white border-slate-700';
    iconHtml = `<svg class="text-slate-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.className = `${baseClasses} ${typeClasses}`;
  toast.innerHTML = `
    ${iconHtml}
    <span>${message}</span>
  `;

  toastRoot.appendChild(toast);

  // Animação de entrada
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Animação de saída
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      if (toastRoot.contains(toast)) {
        toastRoot.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
