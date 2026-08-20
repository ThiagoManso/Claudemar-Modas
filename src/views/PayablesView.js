import { subscribeToPayables, addPayable, payOffPayable, reschedulePayable, deletePayable, getCategories, addCategory } from '../services/payablesService.js';
import { showToast } from '../components/Toast.js';

let unsubscribePayables = null;
let currentPayables = [];
let currentCategories = [];
let selectedSeller = 'all';

export async function renderPayablesView(container, user, team) {
  let filterHtml = '';
  
  if (user && user.role === 'admin' && team) {
    filterHtml = `
      <div class="mt-4 md:mt-0 flex items-center gap-2">
        <label for="payables-seller-filter" class="text-sm font-medium text-slate-600">Filtrar por Vendedor:</label>
        <select id="payables-seller-filter" class="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none">
          <option value="all">Visão Geral (Todos)</option>
          ${team.map(member => `<option value="${member.id}">${member.name || member.email.split('@')[0]}</option>`).join('')}
        </select>
      </div>
    `;
  }

  // Inicialmente renderiza o esqueleto
  container.innerHTML = `
    <div class="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto pb-24 md:pb-8 w-full">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-800">Despesas e Contas a Pagar</h2>
          <p class="text-sm text-slate-500 mt-1">Controle financeiro de despesas programadas.</p>
        </div>
        ${filterHtml}
        <button id="btn-add-payable" class="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nova Conta
        </button>
      </div>

      <!-- Resumo Financeiro -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10">
            <div class="text-sm font-medium text-slate-500 mb-1">Atrasadas</div>
            <div class="text-2xl font-bold text-red-600" id="payables-total-late">R$ 0,00</div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10">
            <div class="text-sm font-medium text-slate-500 mb-1">Vencendo Hoje</div>
            <div class="text-2xl font-bold text-amber-600" id="payables-total-today">R$ 0,00</div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10">
            <div class="text-sm font-medium text-slate-500 mb-1">Total Pendente (Futuro)</div>
            <div class="text-2xl font-bold text-slate-800" id="payables-total-pending">R$ 0,00</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div class="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 class="font-semibold text-slate-700">Contas Pendentes</h3>
        </div>
        <div id="payables-list-container" class="divide-y divide-slate-100">
          <div class="p-8 text-center text-slate-400">Carregando contas...</div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden opacity-75">
        <div class="p-4 md:p-5 border-b border-slate-200 bg-slate-50 cursor-pointer flex items-center justify-between" onclick="document.getElementById('paid-list-container').classList.toggle('hidden')">
          <h3 class="font-semibold text-slate-700">Contas Pagas (Recentes)</h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div id="paid-list-container" class="divide-y divide-slate-100 hidden">
           <div class="p-8 text-center text-slate-400">Nenhuma conta paga recentemente.</div>
        </div>
      </div>
    </div>
  `;

  // Carrega categorias (async)
  currentCategories = await getCategories();

  document.getElementById('btn-add-payable').addEventListener('click', () => {
    openAddPayableModal(user);
  });

  if (user && user.role === 'admin') {
    const filterEl = document.getElementById('payables-seller-filter');
    if (filterEl) {
      filterEl.addEventListener('change', (e) => {
        selectedSeller = e.target.value;
        updatePayablesUI(user, team);
      });
    }
  }

  if (unsubscribePayables) unsubscribePayables();
  
  unsubscribePayables = subscribeToPayables(user, (payables) => {
    currentPayables = payables;
    updatePayablesUI(user, team);
  });
}

function updatePayablesUI(user, team) {
  const listContainer = document.getElementById('payables-list-container');
  const paidListContainer = document.getElementById('paid-list-container');
  const totalLateEl = document.getElementById('payables-total-late');
  const totalTodayEl = document.getElementById('payables-total-today');
  const totalPendingEl = document.getElementById('payables-total-pending');

  if (!listContainer) return;

  const filteredPayables = selectedSeller === 'all' 
    ? currentPayables 
    : currentPayables.filter(p => p.ownerId === selectedSeller);

  const pending = filteredPayables.filter(p => p.status === 'pending');
  const paid = filteredPayables.filter(p => p.status === 'paid').sort((a,b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0)).slice(0, 20); // ultimas 20

  let valLate = 0;
  let valToday = 0;
  let valPending = 0;

  const todayStr = getTodayISO();

  // Função para checar atraso ou hoje
  const checkStatus = (dueDate) => {
    if (!dueDate) return { type: 'future', days: 0 };
    if (dueDate === todayStr) return { type: 'today', days: 0 };
    
    const dDate = new Date(dueDate + 'T12:00:00');
    const tDate = new Date(todayStr + 'T12:00:00');
    const diffTime = tDate - dDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return { type: 'late', days: diffDays };
    return { type: 'future', days: Math.abs(diffDays) };
  };

  if (pending.length === 0) {
    listContainer.innerHTML = `
      <div class="p-12 text-center flex flex-col items-center">
        <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 mb-1">Nenhuma conta pendente!</h3>
        <p class="text-slate-500 text-sm max-w-sm">Todas as despesas programadas estão em dia.</p>
      </div>
    `;
  } else {
    listContainer.innerHTML = pending.map(item => {
      const statusObj = checkStatus(item.dueDate);
      
      let badgeHtml = '';
      if (statusObj.type === 'today') {
        valToday += item.amount;
        badgeHtml = `<span class="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-wider animate-pulse flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Vence Hoje</span>`;
      } else if (statusObj.type === 'late') {
        valLate += item.amount;
        badgeHtml = `<span class="px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Atrasada (${statusObj.days}d)</span>`;
      } else {
        valPending += item.amount;
        badgeHtml = `<span class="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">Em ${statusObj.days} dias</span>`;
      }

      const dateStr = item.dueDate ? item.dueDate.split('-').reverse().join('/') : 'S/ Data';

      return `
        <div class="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
          <div class="flex items-start gap-4">
             <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold flex-shrink-0 border border-brand-100">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
             </div>
             <div>
                <h4 class="font-semibold text-slate-800 text-lg">${item.title}</h4>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span class="text-sm font-medium text-slate-500 bg-white border px-2 py-0.5 rounded-md shadow-sm">${item.category}</span>
                  <span class="text-sm text-slate-500 flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    ${dateStr}
                  </span>
                  ${badgeHtml}
                </div>
             </div>
          </div>
          <div class="flex flex-col md:items-end gap-2 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none">
            <div class="text-xl font-bold text-slate-800">R$ ${item.amount.toFixed(2)}</div>
            <div class="flex items-center gap-2">
              <button onclick="window.payablesReschedule('${item.id}', '${item.dueDate}')" class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1">
                Adiar/Ajustar
              </button>
              <button onclick="window.payablesPayOff('${item.id}')" class="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                Dar Baixa
              </button>
              <button onclick="window.payablesDelete('${item.id}')" class="px-2 py-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (paid.length > 0) {
    paidListContainer.innerHTML = paid.map(item => {
      const dateStr = item.paidAt ? new Date(item.paidAt).toLocaleDateString('pt-BR') : '-';
      return `
        <div class="p-3 px-5 flex items-center justify-between opacity-75">
          <div>
            <div class="font-medium text-slate-700 line-through">${item.title}</div>
            <div class="text-xs text-slate-500">Pago em ${dateStr}</div>
          </div>
          <div class="text-sm font-semibold text-slate-500">R$ ${item.amount.toFixed(2)}</div>
        </div>
      `;
    }).join('');
  }

  totalLateEl.textContent = `R$ ${valLate.toFixed(2)}`;
  totalTodayEl.textContent = `R$ ${valToday.toFixed(2)}`;
  totalPendingEl.textContent = `R$ ${valPending.toFixed(2)}`;
}

// Utilitário para pegar a data de hoje local em ISO YYYY-MM-DD
function getTodayISO() {
  const t = new Date();
  const offset = t.getTimezoneOffset() * 60000;
  return new Date(t.getTime() - offset).toISOString().split('T')[0];
}

function openAddPayableModal(user) {
  const modalId = 'modal-add-payable';
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  const optionsHtml = currentCategories.map(c => `<option value="${c}">${c}</option>`).join('');

  modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in';
  
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="text-lg font-bold text-slate-800">Nova Despesa / Conta</h3>
        <button id="close-payable-modal" class="text-slate-400 hover:text-slate-600 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <form id="form-add-payable" class="p-6 flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Título / Descrição *</label>
          <input type="text" id="pay-title" required class="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none" placeholder="Ex: Conta de Luz">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
          <div class="flex gap-2">
            <select id="pay-category" required class="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none">
              <option value="" disabled selected>Selecione...</option>
              ${optionsHtml}
            </select>
            <button type="button" id="btn-new-category" class="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors" title="Nova Categoria">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Valor (R$) *</label>
            <input type="number" step="0.01" id="pay-amount" required class="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none" placeholder="0.00">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Vencimento *</label>
            <input type="date" id="pay-due-date" required class="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none">
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" id="cancel-payable-modal" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">Salvar Conta</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Set today as default
  document.getElementById('pay-due-date').value = getTodayISO();

  const closeModal = () => modal.remove();
  
  document.getElementById('close-payable-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-payable-modal').addEventListener('click', closeModal);
  
  document.getElementById('btn-new-category').addEventListener('click', async () => {
    const newCat = prompt("Digite o nome da nova categoria:");
    if (newCat && newCat.trim() !== '') {
      try {
        await addCategory(newCat);
        currentCategories = await getCategories();
        
        // Atualiza o select atual
        const select = document.getElementById('pay-category');
        select.innerHTML = `<option value="" disabled>Selecione...</option>` + currentCategories.map(c => `<option value="${c}">${c}</option>`).join('');
        select.value = newCat.trim();
        showToast("Categoria adicionada com sucesso!", "success");
      } catch(e) {
        showToast("Erro ao criar categoria", "error");
      }
    }
  });

  document.getElementById('form-add-payable').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('pay-title').value;
    const cat = document.getElementById('pay-category').value;
    const amount = document.getElementById('pay-amount').value;
    const dueDate = document.getElementById('pay-due-date').value;

    try {
      await addPayable(title, cat, amount, dueDate, user.uid);
      showToast("Despesa agendada com sucesso!", "success");
      closeModal();
    } catch(err) {
      console.error(err);
      showToast("Erro ao salvar despesa", "error");
    }
  });
}

// Global hooks
window.payablesPayOff = async (id) => {
  if(!confirm("Confirmar baixa (pagamento) desta despesa?")) return;
  try {
    await payOffPayable(id);
    showToast("Baixa realizada com sucesso!", "success");
  } catch(e) {
    showToast("Erro ao dar baixa", "error");
  }
};

window.payablesReschedule = async (id, oldDate) => {
  const newDate = prompt("Nova data de vencimento (YYYY-MM-DD):", oldDate);
  if (!newDate) return;
  
  // Validar formato básico YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    return showToast("Formato de data inválido. Use YYYY-MM-DD", "error");
  }

  try {
    await reschedulePayable(id, newDate);
    showToast("Data ajustada com sucesso!", "success");
  } catch(e) {
    showToast("Erro ao ajustar data", "error");
  }
};

window.payablesDelete = async (id) => {
  if(!confirm("Tem certeza que deseja excluir esta conta?")) return;
  try {
    await deletePayable(id);
    showToast("Conta excluída!", "success");
  } catch(e) {
    showToast("Erro ao excluir conta", "error");
  }
};

export function destroyPayablesView() {
  if (unsubscribePayables) {
    unsubscribePayables();
    unsubscribePayables = null;
  }
}
