/**
 * ============================================================================
 * VIEW DO FORMULÁRIO PÚBLICO (TAILWIND REFACTOR)
 * ============================================================================
 */

import { fetchCepAddress } from '../services/contactService.js';
import { showToast } from '../components/Toast.js';

export function renderPublicFormView(container, onSubmit) {
  container.innerHTML = `
    <div class="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div class="w-full max-w-2xl bg-white rounded-3xl shadow-soft overflow-hidden border border-slate-100">
        
        <!-- Cabeçalho do Formulário -->
        <div class="bg-brand-50 p-8 text-center border-b border-brand-100 relative overflow-hidden">
          <div class="absolute -top-12 -left-12 w-32 h-32 bg-brand-200 rounded-full opacity-50 blur-2xl"></div>
          <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-200 rounded-full opacity-50 blur-2xl"></div>
          
          <div class="relative z-10 flex flex-col items-center">
            <div class="w-20 h-20 bg-brand-100 rounded-2xl mb-4 flex items-center justify-center text-brand-600 shadow-sm overflow-hidden">
              <img src="/logo.jpg" alt="Neto Modas Logo" class="w-full h-full object-cover" />
            </div>
            <h1 class="text-3xl font-display font-bold text-brand-800 mb-2">Neto Modas</h1>
            <h2 class="text-xl text-brand-600 font-medium">Cadastro de Cliente / Fornecedor</h2>
            <p class="text-brand-600/80 mt-2 text-sm max-w-lg mx-auto">
              Preencha o formulário abaixo para se cadastrar em nossa base e receber novidades, ofertas e facilitar suas compras.
            </p>
          </div>
        </div>

        <!-- Formulário -->
        <form id="public-form" class="p-8 sm:p-10 space-y-6">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="name" class="block text-sm font-semibold text-slate-700">Nome Completo / Razão Social</label>
              <input type="text" id="name" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" placeholder="Seu nome">
            </div>

            <div class="space-y-2">
              <label for="type" class="block text-sm font-semibold text-slate-700">Tipo de Cadastro</label>
              <div class="relative">
                <select id="type" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none pr-10">
                  <option value="cliente">Sou Cliente</option>
                  <option value="fornecedor">Sou Fornecedor</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="phone" class="block text-sm font-semibold text-slate-700">Celular (WhatsApp)</label>
              <input type="tel" id="phone" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" placeholder="(00) 00000-0000">
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-slate-700">E-mail</label>
              <input type="email" id="email" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" placeholder="seu@email.com">
            </div>
          </div>

          <div class="space-y-2">
            <label for="instagram" class="block text-sm font-semibold text-slate-700">Instagram</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">@</div>
              <input type="text" id="instagram" class="w-full pl-10 pr-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" placeholder="seuperfil">
            </div>
          </div>

          <hr class="border-slate-100 my-8">
          <h3 class="text-lg font-display font-bold text-slate-800 mb-4">Endereço de Entrega</h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label for="cep" class="block text-sm font-semibold text-slate-700">CEP</label>
              <input type="text" id="cep" maxlength="9" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" placeholder="00000-000">
            </div>
            <div class="sm:col-span-2 space-y-2">
              <label for="street" class="block text-sm font-semibold text-slate-700">Logradouro (Rua/Av)</label>
              <input type="text" id="street" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50" placeholder="Ex: Av. Brasil">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label for="number" class="block text-sm font-semibold text-slate-700">Número</label>
              <input type="text" id="number" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" placeholder="123">
            </div>
            <div class="sm:col-span-2 space-y-2">
              <label for="complement" class="block text-sm font-semibold text-slate-700">Complemento</label>
              <input type="text" id="complement" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" placeholder="Apto, Sala, Bloco...">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label for="neighborhood" class="block text-sm font-semibold text-slate-700">Bairro</label>
              <input type="text" id="neighborhood" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50">
            </div>
            <div class="space-y-2">
              <label for="city" class="block text-sm font-semibold text-slate-700">Cidade</label>
              <input type="text" id="city" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50">
            </div>
            <div class="space-y-2">
              <label for="state" class="block text-sm font-semibold text-slate-700">UF</label>
              <input type="text" id="state" maxlength="2" class="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50 uppercase" placeholder="SP">
            </div>
          </div>

          <button type="submit" id="btn-submit" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 mt-8 text-lg">
            <span>Salvar Cadastro</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  `;

  // Máscaras e Eventos
  const cepInput = document.getElementById('cep');
  const phoneInput = document.getElementById('phone');
  const form = document.getElementById('public-form');
  const btnSubmit = document.getElementById('btn-submit');

  const fieldsToAutofill = {
    street: document.getElementById('street'),
    neighborhood: document.getElementById('neighborhood'),
    city: document.getElementById('city'),
    state: document.getElementById('state')
  };

  // Máscara de Telefone simples
  phoneInput.addEventListener('input', (e) => {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  });

  // Autocomplete de CEP via ViaCEP
  cepInput.addEventListener('input', async (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    e.target.value = value;

    const rawCep = value.replace(/\D/g, '');
    if (rawCep.length === 8) {
      const address = await fetchCepAddress(rawCep);
      if (address) {
        fieldsToAutofill.street.value = address.street || '';
        fieldsToAutofill.neighborhood.value = address.neighborhood || '';
        fieldsToAutofill.city.value = address.city || '';
        fieldsToAutofill.state.value = address.state || '';
        document.getElementById('number').focus();
        showToast('Endereço encontrado via CEP', 'success');
      } else {
        showToast('CEP não encontrado', 'error');
      }
    }
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalContent = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Enviando...</span>`;
    btnSubmit.disabled = true;
    btnSubmit.classList.add('opacity-70', 'cursor-not-allowed');

    const contactData = {
      name: document.getElementById('name').value,
      type: document.getElementById('type').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      instagram: document.getElementById('instagram').value,
      cep: document.getElementById('cep').value.replace(/\D/g, ''),
      street: document.getElementById('street').value,
      number: document.getElementById('number').value,
      complement: document.getElementById('complement').value,
      neighborhood: document.getElementById('neighborhood').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value.toUpperCase(),
      createdAt: new Date().toISOString()
    };

    const success = await onSubmit(contactData);
    
    if (success) {
      container.innerHTML = `
        <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
          <div class="bg-white p-10 rounded-3xl shadow-soft text-center max-w-md w-full">
            <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 class="text-3xl font-display font-bold text-slate-800 mb-3">Tudo Certo!</h2>
            <p class="text-slate-600 text-lg">Seu cadastro foi enviado com sucesso. Agradecemos a preferência.</p>
          </div>
        </div>
      `;
    } else {
      showToast('Erro ao salvar cadastro. Tente novamente.', 'error');
      btnSubmit.innerHTML = originalContent;
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('opacity-70', 'cursor-not-allowed');
    }
  });
}
