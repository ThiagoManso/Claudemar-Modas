/**
 * ============================================================================
 * TELA DE LOGIN DO GESTOR (PAINEL ADMINISTRATIVO PRIVADO)
 * ============================================================================
 */

import { loginWithEmail } from '../services/authService.js';
import { showToast } from '../components/Toast.js';
import { USE_DEMO_MODE } from '../config/firebase.js';

export function renderLoginView() {
  return `
    <div class="login-wrapper">
      <div class="card login-card">
        <div class="login-header">
          <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: white; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Painel Administrativo</h2>
          <p>Claudemar Modas - CRM de Clientes</p>
        </div>

        <form id="login-form" autocomplete="on">
          <div class="form-group">
            <label class="form-label" for="login-email">E-mail corporativo</label>
            <input 
              id="login-email" 
              type="email" 
              class="form-input" 
              placeholder="gestor@claudemarmodas.com.br" 
              value="${USE_DEMO_MODE ? 'gestor@claudemarmodas.com.br' : ''}"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Senha de acesso</label>
            <input 
              id="login-password" 
              type="password" 
              class="form-input" 
              placeholder="••••••••" 
              value="${USE_DEMO_MODE ? 'admin123' : ''}"
              required 
            />
          </div>

          <button id="btn-submit-login" type="submit" class="btn btn-primary" style="width: 100%; margin-top: 12px;">
            <span>Entrar no Sistema</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        ${USE_DEMO_MODE ? `
          <div class="demo-box">
            <strong>🚀 Modo de Demonstração Ativo</strong>
            As credenciais padrão de demonstração já estão preenchidas. Basta clicar em <em>"Entrar no Sistema"</em> para testar o painel administrativo!
          </div>
        ` : ''}

        <div style="margin-top: 24px; text-align: center; border-top: 1px solid var(--border-glass); padding-top: 16px;">
          <a href="#cadastro" style="color: hsl(var(--accent-cyan)); font-size: 0.85rem; text-decoration: none; font-weight: 600;">
            ← Ir para o Formulário Público de Cadastro
          </a>
        </div>
      </div>
    </div>
  `;
}

export function bindLoginEvents(onLoginSuccess) {
  const form = document.getElementById('login-form');
  const btnSubmit = document.getElementById('btn-submit-login');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      showToast('Por favor, preencha o e-mail e a senha.', 'error');
      return;
    }

    try {
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Autenticando...';
      }

      const credential = await loginWithEmail(email, password);
      showToast('Bem-vindo(a) ao CRM!', 'success');
      if (onLoginSuccess) onLoginSuccess(credential.user);
    } catch (error) {
      console.error(error);
      showToast('Erro ao fazer login: verifique suas credenciais.', 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Entrar no Sistema';
      }
    }
  });
}
