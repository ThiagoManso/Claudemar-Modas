/**
 * ============================================================================
 * FORMULÁRIO EXTERNO PÚBLICO DE CADASTRO DO CLIENTE (#cadastro)
 * ============================================================================
 * Link acessível sem login para o próprio cliente preencher seus dados.
 * Ao salvar, grava no Firestore e exibe apenas uma mensagem de sucesso.
 */

import { addContact, fetchCepAddress } from '../services/contactService.js';
import { showToast } from '../components/Toast.js';

export function renderPublicFormView() {
  return `
    <div class="public-container">
      <div class="card public-card">
        <div class="public-header">
          <div class="logo-badge">
            <span>✨ CLAUDEMAR MODAS - CADASTRO DE CLIENTE</span>
          </div>
          <h1>Bem-vindo(a)!</h1>
          <p>Preencha seus dados abaixo para se cadastrar em nossa loja e receber promoções e novidades exclusivas.</p>
        </div>

        <form id="public-client-form">
          <!-- SEÇÃO 1: DADOS PESSOAIS -->
          <div class="form-section-title">
            <span>👤 Dados Pessoais</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="pub-name">Nome Completo *</label>
            <input 
              id="pub-name" 
              type="text" 
              class="form-input" 
              placeholder="Ex: Mariana Souza Silva" 
              required 
              minlength="3" 
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="pub-phone">Telefone / WhatsApp *</label>
              <input 
                id="pub-phone" 
                type="tel" 
                class="form-input" 
                placeholder="(11) 98765-4321" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="pub-document">CPF ou RG *</label>
              <input 
                id="pub-document" 
                type="text" 
                class="form-input" 
                placeholder="000.000.000-00" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="pub-birth">Data de Nascimento *</label>
            <input 
              id="pub-birth" 
              type="date" 
              class="form-input" 
              required 
            />
          </div>

          <!-- SEÇÃO 2: ENDEREÇO COMPLETO -->
          <div class="form-section-title">
            <span>📍 Endereço Completo</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="pub-cep">CEP * (Busca Automática)</label>
              <div class="cep-input-group">
                <input 
                  id="pub-cep" 
                  type="text" 
                  class="form-input" 
                  placeholder="01310-100" 
                  maxlength="9"
                  required 
                />
                <button type="button" id="btn-search-cep" class="btn btn-secondary btn-sm" title="Buscar endereço pelo CEP">
                  Buscar
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="pub-state">Estado (UF) *</label>
              <input 
                id="pub-state" 
                type="text" 
                class="form-input" 
                placeholder="SP" 
                maxlength="2"
                required 
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="pub-city">Cidade *</label>
              <input 
                id="pub-city" 
                type="text" 
                class="form-input" 
                placeholder="São Paulo" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="pub-neighborhood">Bairro *</label>
              <input 
                id="pub-neighborhood" 
                type="text" 
                class="form-input" 
                placeholder="Bela Vista" 
                required 
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="pub-street">Rua / Avenida *</label>
              <input 
                id="pub-street" 
                type="text" 
                class="form-input" 
                placeholder="Av. Paulista" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="pub-number">Número & Complemento *</label>
              <input 
                id="pub-number" 
                type="text" 
                class="form-input" 
                placeholder="1000 - Apto 42" 
                required 
              />
            </div>
          </div>

          <button id="btn-submit-public" type="submit" class="btn btn-success" style="width: 100%; padding: 16px; font-size: 1.05rem; margin-top: 20px;">
            <span>Salvar Meu Cadastro</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>
        </form>

        <!-- Acesso restrito ao gestor -->
        <div style="margin-top: 28px; text-align: center; border-top: 1px solid var(--border-glass); padding-top: 18px;">
          <a href="#login" style="color: hsl(var(--text-muted)); font-size: 0.8rem; text-decoration: none;">
            🔒 Área Restrita para Gestores / Acesso Administrativo
          </a>
        </div>
      </div>
    </div>
  `;
}

export function renderSuccessScreen(fullName, onResetForm) {
  return `
    <div class="public-container">
      <div class="card public-card success-screen">
        <div class="success-icon">✓</div>
        <h2>Cadastro Salvo com Sucesso!</h2>
        <p>
          Obrigado, <strong style="color: #fff;">${fullName}</strong>! Seus dados foram enviados com segurança para o banco de dados da <strong>Claudemar Modas</strong>.
        </p>
        <button id="btn-new-cadastro" class="btn btn-primary" style="margin-top: 12px;">
          Fazer Outro Cadastro
        </button>
      </div>
    </div>
  `;
}

export function bindPublicFormEvents(containerEl) {
  const form = document.getElementById('public-client-form');
  const cepInput = document.getElementById('pub-cep');
  const btnCep = document.getElementById('btn-search-cep');

  // Consulta automática de CEP
  const handleCepSearch = async () => {
    const cepVal = cepInput?.value || '';
    if (cepVal.replace(/\D/g, '').length === 8) {
      if (btnCep) btnCep.innerHTML = 'Buscando...';
      const addressData = await fetchCepAddress(cepVal);
      if (btnCep) btnCep.innerHTML = 'Buscar';

      if (addressData) {
        document.getElementById('pub-street').value = addressData.street || '';
        document.getElementById('pub-neighborhood').value = addressData.neighborhood || '';
        document.getElementById('pub-city').value = addressData.city || '';
        document.getElementById('pub-state').value = addressData.state || '';
        showToast('Endereço preenchido com sucesso pelo CEP!', 'success');
        document.getElementById('pub-number')?.focus();
      } else {
        showToast('CEP não encontrado. Preencha manualmente.', 'error');
      }
    }
  };

  cepInput?.addEventListener('blur', handleCepSearch);
  btnCep?.addEventListener('click', handleCepSearch);

  // Máscara de CEP ao digitar
  cepInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 5) val = val.substring(0, 5) + '-' + val.substring(5, 8);
    e.target.value = val;
  });

  // Envio do formulário (Salvar no Firestore)
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('pub-name').value.trim();
    const phone = document.getElementById('pub-phone').value.trim();
    const documentVal = document.getElementById('pub-document').value.trim();
    const birthDate = document.getElementById('pub-birth').value;
    
    const cep = document.getElementById('pub-cep').value.trim();
    const state = document.getElementById('pub-state').value.trim().toUpperCase();
    const city = document.getElementById('pub-city').value.trim();
    const neighborhood = document.getElementById('pub-neighborhood').value.trim();
    const street = document.getElementById('pub-street').value.trim();
    const number = document.getElementById('pub-number').value.trim();

    const submitBtn = document.getElementById('btn-submit-public');

    const contactData = {
      fullName,
      phone,
      document: documentVal,
      birthDate,
      cep,
      state,
      city,
      neighborhood,
      street,
      number
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Salvando no banco...';
      }

      await addContact(contactData);
      showToast('Seus dados foram enviados com sucesso!', 'success');

      // Exibir tela de sucesso sem acesso à base anterior
      containerEl.innerHTML = renderSuccessScreen(fullName);
      document.getElementById('btn-new-cadastro')?.addEventListener('click', () => {
        window.location.reload();
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar cadastro. Tente novamente.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Salvar Meu Cadastro';
      }
    }
  });
}
