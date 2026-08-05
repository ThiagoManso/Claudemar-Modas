/**
 * ============================================================================
 * COMPONENTE DE TOAST / NOTIFICAÇÃO DO SISTEMA
 * ============================================================================
 */

export function showToast(message, type = 'info', duration = 4000) {
  const toastRoot = document.getElementById('toast-root');
  if (!toastRoot) return;

  const toastEl = document.createElement('div');
  toastEl.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  toastEl.innerHTML = `
    <span style="font-weight: 900; font-size: 1.1rem;">${icon}</span>
    <span>${message}</span>
  `;

  toastRoot.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(15px)';
    toastEl.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 300);
  }, duration);
}
