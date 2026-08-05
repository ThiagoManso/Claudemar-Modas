/**
 * ============================================================================
 * COMPONENTE DE MODAL DE DETALHES DE CONTATO (TAILWIND REFACTOR)
 * ============================================================================
 */

import { formatCEP } from '../services/contactService.js';

export function renderContactModal(contact, onClose, onDelete) {
  const isCliente = contact.type === 'cliente';
  const typeText = isCliente ? 'Cliente' : 'Fornecedor';
  const typeClass = isCliente 
    ? 'bg-blue-50 text-blue-700 border-blue-200' 
    : 'bg-purple-50 text-purple-700 border-purple-200';

  const modalHtml = `
    <div class="modal-overlay" id="contact-modal-overlay">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100 opacity-100" id="contact-modal-content">
        
        <!-- Header do Modal -->
        <div class="flex items-start justify-between p-6 border-b border-slate-100 bg-surface/50">
          <div class="flex gap-4">
            <div class="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-display font-bold text-2xl shadow-sm">
              ${contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 class="text-xl font-display font-bold text-slate-800 tracking-tight leading-tight">${contact.name}</h2>
              <span class="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeClass}">
                ${typeText}
              </span>
            </div>
          </div>
          <button id="btn-close-modal" class="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Corpo do Modal -->
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          <!-- WhatsApp Section -->
          <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">WhatsApp</p>
              <p class="text-emerald-900 font-medium text-lg">${contact.phone}</p>
            </div>
            <a href="https://wa.me/55${contact.phone.replace(/\D/g, '')}" target="_blank" class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Conversar
            </a>
          </div>

          <!-- Dados Adicionais -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-surface rounded-xl border border-slate-100">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">E-mail</p>
              <p class="text-slate-800 text-sm font-medium break-words">${contact.email || 'Não informado'}</p>
            </div>
            <div class="p-3 bg-surface rounded-xl border border-slate-100">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Instagram</p>
              <p class="text-slate-800 text-sm font-medium break-words">${contact.instagram || 'Não informado'}</p>
            </div>
          </div>

          <!-- Endereço -->
          <div class="p-4 bg-surface rounded-xl border border-slate-100 space-y-2">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Endereço
            </p>
            <p class="text-sm text-slate-700"><span class="font-medium">CEP:</span> ${formatCEP(contact.cep)}</p>
            <p class="text-sm text-slate-700"><span class="font-medium">Logradouro:</span> ${contact.street}, ${contact.number}</p>
            ${contact.complement ? `<p class="text-sm text-slate-700"><span class="font-medium">Complemento:</span> ${contact.complement}</p>` : ''}
            <p class="text-sm text-slate-700"><span class="font-medium">Bairro:</span> ${contact.neighborhood}</p>
            <p class="text-sm text-slate-700"><span class="font-medium">Cidade/UF:</span> ${contact.city} - ${contact.state}</p>
          </div>
        </div>

        <!-- Rodapé / Ações -->
        <div class="p-4 border-t border-slate-100 bg-surface/50 flex justify-end gap-3">
          <button id="btn-delete-contact" class="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Excluir
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-root').innerHTML = modalHtml;
  document.getElementById('modal-root').classList.remove('hidden');

  // Event Listeners
  const close = () => {
    document.getElementById('modal-root').classList.add('hidden');
    document.getElementById('modal-root').innerHTML = '';
    if (onClose) onClose();
  };

  document.getElementById('btn-close-modal').addEventListener('click', close);
  document.getElementById('contact-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'contact-modal-overlay') close();
  });

  document.getElementById('btn-delete-contact').addEventListener('click', () => {
    if (confirm(`Tem certeza que deseja excluir ${contact.name}?`)) {
      if (onDelete) onDelete(contact.id);
      close();
    }
  });
}
