/**
 * ============================================================================
 * VIEW DE EQUIPE (Apenas Admin)
 * ============================================================================
 */

import { updateTeamMember } from '../services/teamService.js';
import { showToast } from '../components/Toast.js';

export function renderTeamView(container, users) {
  const getRegistrationLink = (userId) => {
    const url = new URL(window.location.href);
    return `${url.origin}${url.pathname}#cadastro?ref=${userId}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Link copiado para a área de transferência!', 'success');
    } catch (err) {
      showToast('Falha ao copiar link.', 'error');
    }
  };

  window.handleCopyLink = copyToClipboard;
  window.handleUpdateRole = async (userId, newRole) => {
    try {
      await updateTeamMember(userId, { role: newRole });
      showToast('Perfil atualizado com sucesso.', 'success');
    } catch (err) {
      showToast('Erro ao atualizar perfil.', 'error');
    }
  };

  container.innerHTML = `
    <div class="p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Gestão de Equipe</h1>
          <p class="text-slate-500 mt-1">Gerencie os acessos e gere links de captação de clientes para seus vendedores.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th class="p-4 font-semibold">Nome</th>
                <th class="p-4 font-semibold">E-mail</th>
                <th class="p-4 font-semibold">Perfil</th>
                <th class="p-4 font-semibold text-center">Ações (Link de Cadastro)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${users.map(user => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="p-4">
                    <div class="font-medium text-slate-800">${user.name || 'Sem Nome'}</div>
                  </td>
                  <td class="p-4 text-slate-600">${user.email}</td>
                  <td class="p-4">
                    <select onchange="handleUpdateRole('${user.id}', this.value)"
                      class="bg-surface border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2">
                      <option value="seller" ${user.role === 'seller' ? 'selected' : ''}>Vendedor</option>
                      <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                  </td>
                  <td class="p-4 text-center">
                    <button onclick="handleCopyLink('${getRegistrationLink(user.id)}')" 
                      class="text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      Copiar Link Exclusivo
                    </button>
                  </td>
                </tr>
              `).join('')}
              ${users.length === 0 ? `
                <tr>
                  <td colspan="4" class="p-8 text-center text-slate-500">Nenhum membro encontrado.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
