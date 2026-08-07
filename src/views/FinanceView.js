import { subscribeToPendingDebts, payOffDebt, registerPayment } from '../services/financeService.js';
import { showToast } from '../components/Toast.js';

let unsubscribeDebts = null;
let currentDebts = [];
let selectedSeller = 'all';

export function renderFinanceView(container, user, team) {
  let filterHtml = '';
  
  if (user && user.role === 'admin') {
    filterHtml = `
      <div class="mt-4 md:mt-0 flex items-center gap-2">
        <label for="seller-filter" class="text-sm font-medium text-slate-600">Filtrar por Vendedor:</label>
        <select id="seller-filter" class="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none">
          <option value="all">Visão Geral (Todos)</option>
          ${team.map(member => `<option value="${member.id}">${member.name || member.email.split('@')[0]}</option>`).join('')}
        </select>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto pb-24 md:pb-8 w-full">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-800">Cobranças e Consignações</h2>
          <p class="text-sm text-slate-500 mt-1">Controle de mercadorias deixadas com clientes e pagamentos pendentes.</p>
        </div>
        ${filterHtml}
      </div>

      <!-- Sumário Financeiro -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div class="text-sm font-medium text-slate-500 mb-1">Total a Receber</div>
          <div class="text-2xl font-bold text-slate-800" id="finance-total-pending">R$ 0,00</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div class="text-sm font-medium text-slate-500 mb-1">Clientes em Aberto</div>
          <div class="text-2xl font-bold text-brand-600" id="finance-total-clients">0</div>
        </div>
      </div>

      <!-- Lista de Pendências -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 md:p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 class="font-semibold text-slate-700">Dívidas Pendentes</h3>
        </div>
        
        <div id="finance-list-container" class="divide-y divide-slate-100">
          <div class="p-8 text-center text-slate-400">Carregando pendências...</div>
        </div>
      </div>
    </div>
  `;

  if (user && user.role === 'admin') {
    document.getElementById('seller-filter').addEventListener('change', (e) => {
      selectedSeller = e.target.value;
      updateFinanceUI(user, team);
    });
  }

  if (unsubscribeDebts) unsubscribeDebts();
  
  unsubscribeDebts = subscribeToPendingDebts(user, (debts) => {
    currentDebts = debts;
    updateFinanceUI(user, team);
  });
}

function updateFinanceUI(user, team) {
  const listContainer = document.getElementById('finance-list-container');
  const totalPendingEl = document.getElementById('finance-total-pending');
  const totalClientsEl = document.getElementById('finance-total-clients');

  if (!listContainer) return;

  const filteredDebts = selectedSeller === 'all' 
    ? currentDebts 
    : currentDebts.filter(d => d.ownerId === selectedSeller);

  if (filteredDebts.length === 0) {
    listContainer.innerHTML = `
      <div class="p-12 text-center flex flex-col items-center">
        <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 mb-1">Tudo em dia!</h3>
        <p class="text-slate-500 text-sm max-w-sm">Não há nenhum pagamento pendente. Seus clientes não possuem dívidas em aberto.</p>
      </div>
    `;
    totalPendingEl.textContent = 'R$ 0,00';
    totalClientsEl.textContent = '0';
    return;
  }

  let totalValue = 0;
  const uniqueClients = new Set();

  listContainer.innerHTML = filteredDebts.map(debt => {
    const remaining = debt.amountTotal - (debt.amountPaid || 0);
    totalValue += remaining;
    uniqueClients.add(debt.contactId);

    const createdDate = new Date(debt.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let badgeClass = "bg-emerald-100 text-emerald-700";
    if (diffDays > 15) badgeClass = "bg-amber-100 text-amber-700";
    if (diffDays > 30) badgeClass = "bg-red-100 text-red-700";

    let ownerName = '';
    if (user && user.role === 'admin' && debt.ownerId && selectedSeller === 'all') {
      const owner = team.find(u => u.id === debt.ownerId);
      ownerName = owner ? (owner.name || owner.email.split('@')[0]) : debt.ownerId.substring(0, 8);
    }

    return `
      <div class="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold flex-shrink-0">
            ${(debt.contactName || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 class="font-semibold text-slate-800">${debt.contactName}</h4>
            <div class="flex flex-wrap items-center gap-2 mt-1">
              <span class="text-sm text-slate-500">Lançado em ${createdDate.toLocaleDateString('pt-BR')}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
                ${diffDays === 0 ? 'Hoje' : `${diffDays} dias atrás`}
              </span>
              ${ownerName ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200" title="Vendedor">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ${ownerName}
              </span>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="flex flex-col md:items-end bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
          <div class="text-sm text-slate-500 line-through">Total: R$ ${debt.amountTotal.toFixed(2)}</div>
          <div class="text-lg font-bold text-slate-800">Resta: R$ ${remaining.toFixed(2)}</div>
          
          <div class="flex items-center gap-2 mt-2">
            <button onclick="window.financePartialPayment('${debt.id}')" class="px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors">
              Receber Parcial
            </button>
            <button onclick="window.financePayOff('${debt.id}')" class="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Quitar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  totalPendingEl.textContent = `R$ ${totalValue.toFixed(2)}`;
  totalClientsEl.textContent = uniqueClients.size.toString();
}

window.financePayOff = async (debtId) => {
  if (!confirm("Confirmar a quitação total desta mercadoria/dívida?")) return;
  
  const debt = currentDebts.find(d => d.id === debtId);
  if (!debt) return;

  try {
    await payOffDebt(debt);
    showToast('Dívida quitada com sucesso!', 'success');
  } catch(e) {
    console.error(e);
    showToast('Erro ao quitar dívida.', 'error');
  }
};

window.financePartialPayment = async (debtId) => {
  const debt = currentDebts.find(d => d.id === debtId);
  if (!debt) return;
  
  const remaining = debt.amountTotal - (debt.amountPaid || 0);

  const amountStr = prompt(`Informe o valor pago (Restante: R$ ${remaining.toFixed(2)}):`);
  if (!amountStr) return;

  const amount = parseFloat(amountStr.replace(',', '.'));
  if (isNaN(amount) || amount <= 0) {
    return showToast('Valor inválido', 'error');
  }

  if (amount > remaining) {
    return showToast('O valor não pode ser maior que o saldo restante!', 'error');
  }

  try {
    await registerPayment(debt, amount);
    showToast('Pagamento registrado!', 'success');
  } catch(e) {
    console.error(e);
    showToast('Erro ao registrar pagamento.', 'error');
  }
};

export function destroyFinanceView() {
  if (unsubscribeDebts) {
    unsubscribeDebts();
    unsubscribeDebts = null;
  }
}
