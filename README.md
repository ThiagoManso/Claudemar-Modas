# CRM Clientes - Claudemar Modas 🚀
**Sistema Full-Stack Multiplataforma (Web, Android e iOS)**

Um gerenciador de contatos (CRM básico) desenvolvido com **HTML5, Modern JavaScript, Vanilla CSS, Firebase (Auth & Cloud Firestore)** e integração com **Google Maps Platform**.

---

## 📌 Funcionalidades Principais

1. **Painel Administrativo Privado (`#admin` e `#mapa`):**
   - Acesso restrito com login/senha (**Firebase Auth**).
   - **Lista de Contatos Resumida:** Exibe apenas Nome, Telefone e Endereço com busca em tempo real.
   - **Detalhes Completos:** Clique sobre o cliente abre modal com CPF/RG, Data de Nascimento, coordenadas e ação rápida para WhatsApp.
   - **Aba Google Maps:** Mapa interativo exibindo marcadores/pinos dos endereços com centralização ao clicar na lista lateral.
2. **Formulário Externo Público (`#cadastro`):**
   - Acessível por link público para o próprio cliente preencher seus dados sem acesso a registros anteriores.
   - **Busca automática de CEP:** Preenche Rua, Bairro, Cidade e Estado ao digitar o CEP via integração com API ViaCEP.
   - Envia diretamente para o **Cloud Firestore** e exibe tela de sucesso.

---

## 🛠️ Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Execute o servidor de desenvolvimento (Vite):**
   ```bash
   npm run dev
   ```
   Acesse no navegador: `http://localhost:5173/`

---

## 📱 Como Compilar para Android e iOS (Capacitor)

Consulte o documento completo [GUIA_ARQUITETURA_CRM.md](file:///c:/Thiago%20Manso/Nova%20pasta/Claudemar%20Modas/GUIA_ARQUITETURA_CRM.md) para ver a arquitetura detalhada e as instruções passo a passo para **Android Studio** (`npx cap add android`) e **Xcode** (`npx cap add ios`).
