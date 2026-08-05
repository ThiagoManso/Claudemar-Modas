/**
 * ============================================================================
 * COMPONENTE DE MODAL DE DETALHES DO CLIENTE
 * ============================================================================
 * Exibe todas as informações completas: CPF/RG, Data de Nascimento e Endereço.
 */

import { showToast } from './Toast.js';

export function openContactModal(contact, onDeleteContact) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const cleanPhone = (contact.phone || '').replace(/\D/g, '');
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

  modalRoot.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">
          <h3>${contact.fullName}</h3>
          <span>ID: ${contact.id}</span>
        </div>
        <button id="modal-btn-close" class="btn-close" title="Fechar">×</button>
      </div>

      <div class="modal-body">
        <div class="detail-grid">
          <div class="detail-group">
            <div class="detail-label">Telefone / Celular</div>
            <div class="detail-value" style="color: hsl(var(--accent-cyan));">${contact.phone || 'Não informado'}</div>
          </div>
          <div class="detail-group">
            <div class="detail-label">Documento (CPF / RG)</div>
            <div class="detail-value">${contact.document || 'Não informado'}</div>
          </div>
          <div class="detail-group">
            <div class="detail-label">Data de Nascimento</div>
            <div class="detail-value">${formatDate(contact.birthDate)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-label">Data de Cadastro</div>
            <div class="detail-value">${new Date(contact.createdAt || Date.now()).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div class="detail-group">
          <div class="detail-label">Endereço Completo</div>
          <div class="detail-value" style="line-height: 1.5;">${contact.address || 'Endereço não cadastrado'}</div>
          ${contact.lat && contact.lng ? `
            <div style="margin-top: 12px;">
              <span class="detail-badge">📍 Coordenadas: ${contact.lat.toFixed(5)}, ${contact.lng.toFixed(5)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="modal-footer">
        ${whatsappUrl ? `
          <a href="${whatsappUrl}" target="_blank" class="btn btn-success btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            WhatsApp
          </a>
        ` : ''}
        <button id="btn-delete-contact" class="btn btn-danger btn-sm">Excluir Cliente</button>
        <button id="modal-btn-ok" class="btn btn-secondary btn-sm">Fechar</button>
      </div>
    </div>
  `;

  modalRoot.classList.remove('hidden');

  const close = () => {
    modalRoot.classList.add('hidden');
    modalRoot.innerHTML = '';
  };

  document.getElementById('modal-btn-close')?.addEventListener('click', close);
  document.getElementById('modal-btn-ok')?.addEventListener('click', close);

  // Excluir contato
  document.getElementById('btn-delete-contact')?.addEventListener('click', async () => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${contact.fullName}"?`)) {
      try {
        if (onDeleteContact) {
          await onDeleteContact(contact.id);
          showToast('Cliente excluído com sucesso.', 'success');
          close();
        }
      } catch (err) {
        showToast('Erro ao excluir cliente: ' + err.message, 'error');
      }
    }
  });

  // Fechar clicando fora da janela do modal
  modalRoot.addEventListener('click', (e) => {
    if (e.target === modalRoot) close();
  });
}
