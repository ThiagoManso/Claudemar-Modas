/**
 * ============================================================================
 * VIEW DE LISTAGEM DE CONTATOS (TAILWIND REFACTOR)
 * ============================================================================
 */

import { formatCEP } from '../services/contactService.js';
import { renderContactModal } from '../components/ContactModal.js';

export function renderContactListView(container, contacts, onDeleteContact) {
  let searchTerm = '';
  
  const updateList = () => {
    const listContainer = document.getElementById('contacts-grid');
    if (!listContainer) return;

    const filtered = contacts.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <p class="text-slate-600 font-medium text-lg">Nenhum contato encontrado.</p>
          <p class="text-slate-400 text-sm mt-1">Tente ajustar os termos da sua pesquisa.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(contact => {
      const isCliente = contact.type === 'cliente';
      const badgeClass = isCliente 
        ? 'bg-blue-50 text-blue-700 border-blue-200' 
        : 'bg-purple-50 text-purple-700 border-purple-200';
      const typeText = isCliente ? 'Cliente' : 'Fornecedor';

      return `
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col h-full cursor-pointer" data-id="${contact.id}">
          
          <div class="flex items-start justify-between mb-4">
            <div class="flex gap-3 items-center">
              <div class="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-display font-bold text-xl">
                ${contact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 class="text-slate-800 font-bold font-display leading-tight truncate max-w-[150px] sm:max-w-[180px]">${contact.name}</h3>
                <span class="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}">
                  ${typeText}
                </span>
              </div>
            </div>
            
            <a href="https://wa.me/55${contact.phone.replace(/\D/g, '')}" target="_blank" class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="WhatsApp" onclick="event.stopPropagation();">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </a>
          </div>

          <div class="space-y-2 mt-auto">
            <p class="text-sm text-slate-600 flex items-center gap-2">
              <svg class="text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              ${contact.phone}
            </p>
            <p class="text-sm text-slate-600 flex items-center gap-2 truncate" title="${contact.city} - ${contact.state}">
              <svg class="text-slate-400 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span class="truncate">${contact.city} - ${contact.state}</span>
            </p>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to open modal
    document.querySelectorAll('#contacts-grid > div').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const contact = contacts.find(c => c.id === id);
        if (contact) {
          renderContactModal(contact, null, onDeleteContact);
        }
      });
    });
  };

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      
      <!-- Cabeçalho e Ações -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-display font-bold text-slate-900">Meus Clientes</h1>
          <p class="text-slate-500 mt-1">Gerencie sua base de clientes e fornecedores (${contacts.length} registros)</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="#cadastro" class="px-4 py-2 bg-brand-600 text-white font-medium text-sm rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo Cadastro
          </a>
          <div class="relative w-full">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="search-input" placeholder="Buscar clientes..." 
              class="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all shadow-sm placeholder-slate-400" />
          </div>
        </div>
      </div>

      <!-- Grid de Contatos -->
      <div id="contacts-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- Renderizado dinamicamente -->
      </div>
      
    </div>
  `;

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    updateList();
  });

  updateList();
}
