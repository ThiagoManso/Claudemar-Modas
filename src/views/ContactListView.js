/**
 * ============================================================================
 * TELA INICIAL DO GESTOR: LISTA RESUMIDA DE CONTATOS / CLIENTES
 * ============================================================================
 * Exibe a base em lista contendo APENAS: Nome, Telefone e Endereço.
 * Clique no nome abre o Modal com todos os detalhes (CPF/RG, Nascimento, etc).
 */

import { openContactModal } from '../components/ContactModal.js';
import { showToast } from '../components/Toast.js';

export function renderContactListView(contacts) {
  const totalClients = contacts.length;
  const recentClients = contacts.filter(c => {
    const diff = Date.now() - new Date(c.createdAt || Date.now()).getTime();
    return diff < 86400000 * 7; // últimos 7 dias
  }).length;

  return `
    <div class="view-container">
      <!-- Cabeçalho Principal -->
      <div class="view-header">
        <div class="header-title">
          <h1>Lista de Clientes</h1>
          <p>Visão resumida da base (Nome, Telefone e Endereço) • Clique para ver CPF/RG e mais detalhes</p>
        </div>

        <div class="toolbar">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input id="search-contacts" type="text" placeholder="Buscar por nome, telefone ou endereço..." />
          </div>
          <button id="btn-open-public-link" class="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Copiar Link de Cadastro
          </button>
        </div>
      </div>

      <!-- Resumo Estatístico Rápido -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">👥</div>
          <div class="stat-content">
            <h4>${totalClients}</h4>
            <p>Total de Clientes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✨</div>
          <div class="stat-content">
            <h4>${recentClients}</h4>
            <p>Cadastrados (Últimos 7 dias)</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">📍</div>
          <div class="stat-content">
            <h4>100%</h4>
            <p>Endereços Integrados com Mapa</p>
          </div>
        </div>
      </div>

      <!-- Lista / Grid de Contatos Resumidos -->
      <div id="contacts-list-container" class="contacts-grid">
        ${contacts.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 48px;">
            <p style="color: hsl(var(--text-muted)); font-size: 1.1rem;">Nenhum cliente cadastrado até o momento.</p>
            <a href="#cadastro" class="btn btn-primary btn-sm" style="margin-top: 16px;">Cadastrar Novo Cliente</a>
          </div>
        ` : contacts.map(contact => renderContactCard(contact)).join('')}
      </div>
    </div>
  `;
}

function renderContactCard(contact) {
  const avatarLetter = (contact.fullName || '?').charAt(0).toUpperCase();
  return `
    <div class="card contact-card card-hover" data-id="${contact.id}" title="Clique para visualizar detalhes completos (CPF/RG, Data de Nascimento)">
      <div class="contact-main">
        <div class="contact-avatar">${avatarLetter}</div>
        <div class="contact-name">${contact.fullName || 'Sem nome'}</div>
        <div class="contact-phone">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          ${contact.phone || 'Telefone não informado'}
        </div>
        <div class="contact-address">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${contact.address || 'Endereço não cadastrado'}</span>
        </div>
      </div>
      <div class="contact-footer">
        <span>Cadastrado em: ${new Date(contact.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
        <span style="color: hsl(var(--accent-cyan)); font-weight: 600;">Abrir Detalhes →</span>
      </div>
    </div>
  `;
}

export function bindContactListEvents(contacts, onDeleteContact, onCopyPublicLink) {
  const container = document.getElementById('contacts-list-container');
  const searchInput = document.getElementById('search-contacts');
  const copyBtn = document.getElementById('btn-open-public-link');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const publicUrl = window.location.origin + window.location.pathname + '#cadastro';
      navigator.clipboard?.writeText(publicUrl);
      showToast('Link público copiado: ' + publicUrl, 'success');
    });
  }

  // Evento de clique para abrir o Modal de Detalhes Completo
  const attachCardListeners = () => {
    const cards = container?.querySelectorAll('.contact-card');
    cards?.forEach(card => {
      card.addEventListener('click', () => {
        const contactId = card.getAttribute('data-id');
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          openContactModal(contact, onDeleteContact);
        }
      });
    });
  };

  attachCardListeners();

  // Busca em tempo real na lista
  if (searchInput && container) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      const filtered = contacts.filter(c => {
        const name = (c.fullName || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const address = (c.address || '').toLowerCase();
        return name.includes(query) || phone.includes(query) || address.includes(query);
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 36px;">
            <p style="color: hsl(var(--text-muted));">Nenhum cliente encontrado para a busca "${query}".</p>
          </div>
        `;
      } else {
        container.innerHTML = filtered.map(c => renderContactCard(c)).join('');
        attachCardListeners();
      }
    });
  }
}
