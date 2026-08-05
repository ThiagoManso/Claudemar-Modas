/**
 * ============================================================================
 * COMPONENTE DE MODAL DE DETALHES DE CONTATO (TAILWIND REFACTOR)
 * ============================================================================
 */

import { formatCEP } from '../services/contactService.js';
import { addDebt, subscribeToClientDebts, payOffDebt, registerPayment } from '../services/financeService.js';
import { showToast } from './Toast.js';

let unsubscribeClientDebts = null;
let currentClientDebts = [];

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

        <!-- Corpo do Modal (Informações) -->
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5" id="modal-tab-info">
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

        <!-- Seção Financeiro (Consignações) -->
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 hidden" id="modal-tab-finance">
          <div class="bg-brand-50 p-4 rounded-xl border border-brand-100 mb-4">
            <h3 class="text-sm font-semibold text-brand-800 mb-2">Lançar Nova Mercadoria</h3>
            <div class="flex gap-2">
              <input type="number" id="new-debt-amount" placeholder="Valor (Ex: 150,00)" class="flex-1 rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white">
              <button id="btn-add-debt" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                Lançar
              </button>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-slate-700 mb-3 flex justify-between items-center">
              Histórico de Pendências
              <span id="client-total-debt" class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">R$ 0,00</span>
            </h3>
            <div id="client-debts-list" class="space-y-3">
              <div class="text-center text-sm text-slate-400 py-4">Carregando...</div>
            </div>
          </div>
        </div>

        <!-- Rodapé / Ações -->
        <div class="p-4 border-t border-slate-100 bg-surface/50 flex justify-between gap-3">
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button id="tab-info" class="px-4 py-1.5 text-sm font-medium rounded-md bg-white text-slate-800 shadow-sm transition-all">Info</button>
            <button id="tab-finance" class="px-4 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700 transition-all">Financeiro</button>
          </div>
          
          <button id="btn-delete-contact" class="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Excluir
          </button>
        </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Excluir
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-root').innerHTML = modalHtml;
  document.getElementById('modal-root').classList.remove('hidden');

  // Tabs Logic
  const tabInfo = document.getElementById('tab-info');
  const tabFinance = document.getElementById('tab-finance');
  const contentInfo = document.getElementById('modal-tab-info');
  const contentFinance = document.getElementById('modal-tab-finance');

  tabInfo.addEventListener('click', () => {
    tabInfo.className = "px-4 py-1.5 text-sm font-medium rounded-md bg-white text-slate-800 shadow-sm transition-all";
    tabFinance.className = "px-4 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700 transition-all";
    contentInfo.classList.remove('hidden');
    contentFinance.classList.add('hidden');
  });

  tabFinance.addEventListener('click', () => {
    tabFinance.className = "px-4 py-1.5 text-sm font-medium rounded-md bg-white text-slate-800 shadow-sm transition-all";
    tabInfo.className = "px-4 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-700 transition-all";
    contentFinance.classList.remove('hidden');
    contentInfo.classList.add('hidden');
  });

  // Finance Logic
  if (unsubscribeClientDebts) unsubscribeClientDebts();
  
  unsubscribeClientDebts = subscribeToClientDebts(contact.id, (debts) => {
    currentClientDebts = debts;
    renderClientDebtsList();
  });

  document.getElementById('btn-add-debt').addEventListener('click', async () => {
    const input = document.getElementById('new-debt-amount');
    const val = parseFloat(input.value.replace(',', '.'));
    if (!val || val <= 0) {
      return showToast('Insira um valor válido', 'error');
    }
    try {
      await addDebt(contact.id, contact.name, val);
      input.value = '';
      showToast('Mercadoria lançada com sucesso!', 'success');
    } catch(e) {
      showToast('Erro ao lançar valor.', 'error');
    }
  });

  // Event Listeners Genéricos
  const close = () => {
    if (unsubscribeClientDebts) {
      unsubscribeClientDebts();
      unsubscribeClientDebts = null;
    }
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

function renderClientDebtsList() {
  const container = document.getElementById('client-debts-list');
  const totalEl = document.getElementById('client-total-debt');
  if (!container) return;

  let totalPending = 0;
  
  if (currentClientDebts.length === 0) {
    container.innerHTML = `<div class="text-center text-sm text-slate-400 py-4 bg-slate-50 rounded-lg border border-slate-100">Nenhum histórico encontrado.</div>`;
    totalEl.textContent = 'R$ 0,00';
    totalEl.className = "text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full";
    return;
  }

  container.innerHTML = currentClientDebts.map(debt => {
    const remaining = debt.amountTotal - (debt.amountPaid || 0);
    if (debt.status === 'pending') {
      totalPending += remaining;
    }
    
    const diffDays = Math.floor(Math.abs(new Date() - new Date(debt.createdAt)) / (1000 * 60 * 60 * 24));
    
    // Histórico de pagamentos da dívida
    let paymentsHtml = '';
    if (debt.payments && debt.payments.length > 0) {
      paymentsHtml = `
        <div class="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Histórico de Pagamentos</div>
          ${debt.payments.map(p => {
            const pDate = new Date(p.date).toLocaleDateString('pt-BR');
            return `<div class="flex justify-between text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
              <span>${pDate}</span>
              <span class="font-medium text-emerald-600">+ R$ ${parseFloat(p.amount).toFixed(2)}</span>
            </div>`;
          }).join('')}
        </div>
      `;
    }

    if (debt.status === 'paid') {
      return `
        <div class="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50 shadow-sm flex flex-col gap-2 relative opacity-80">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                QUITADO
              </div>
              <div class="text-xs text-slate-500 line-through">Lançado: R$ ${debt.amountTotal.toFixed(2)}</div>
            </div>
          </div>
          ${paymentsHtml}
        </div>
      `;
    }

    return `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm flex flex-col gap-2 relative">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs text-slate-400">Lançado há ${diffDays} dias</div>
            <div class="font-bold text-slate-700 text-lg">R$ ${remaining.toFixed(2)}</div>
            <div class="text-xs text-slate-500 mt-0.5">Total da mercadoria: R$ ${debt.amountTotal.toFixed(2)}</div>
          </div>
          <div class="flex flex-col gap-1.5">
            <button onclick="window.clientModalPayOff('${debt.id}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded shadow-sm transition-colors">QUITAR</button>
            <button onclick="window.clientModalPartial('${debt.id}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium rounded transition-colors border border-slate-200">Parcial</button>
          </div>
        </div>
        ${paymentsHtml}
      </div>
    `;
  }).join('');

  totalEl.textContent = `R$ ${totalPending.toFixed(2)}`;
  totalEl.className = totalPending > 0 
    ? "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
    : "text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full";
}

window.clientModalPayOff = async (id) => {
  if(!confirm('Quitar totalmente?')) return;
  const debt = currentClientDebts.find(d => d.id === id);
  if(debt) {
    await payOffDebt(debt);
    showToast('Quitado!', 'success');
  }
};

window.clientModalPartial = async (id) => {
  const debt = currentClientDebts.find(d => d.id === id);
  if(!debt) return;
  const remaining = debt.amountTotal - (debt.amountPaid || 0);
  const valStr = prompt(`Pagar parcial (Falta R$ ${remaining.toFixed(2)}):`);
  if(!valStr) return;
  const val = parseFloat(valStr.replace(',', '.'));
  if(val && val > 0 && val <= remaining) {
    await registerPayment(debt, val);
    showToast('Baixa parcial registrada', 'success');
  } else {
    showToast('Valor inválido', 'error');
  }
};
