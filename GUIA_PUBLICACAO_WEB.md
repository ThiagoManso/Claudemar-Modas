# Guia de Acesso via Web Link e Instalação na Tela Inicial (PWA) 📱✨

Este documento explica como utilizar o **CRM Clientes | Claudemar Modas** via navegador (Web) e como **adicionar o ícone à tela inicial do celular Android ou iOS** para que ele abra em tela cheia (como se fosse um aplicativo), mas **rodando 100% na Web**, sem precisar compilar ou instalar por loja de aplicativos.

---

## 1. Como Funciona o Modo Web App (PWA)

O sistema foi configurado como um **Progressive Web App (PWA)** com `manifest.json` e `Service Worker`. Isso significa que:
* **Sem lojas (Play Store / App Store):** Você não precisa gerar `.apk` para rodar no celular.
* **Tela Cheia (Standalone):** Quando você adiciona o link à tela inicial do Android, ele ganha um ícone próprio e, ao ser tocado, abre sem a barra de endereços do navegador, parecendo um app nativo.
* **Atualização Instantânea:** Qualquer mudança no código na Web reflete imediatamente no celular do gestor e do cliente.

---

## 2. Como Instalar na Tela Inicial do Android ("Deixar na Tela")

### Passo a Passo no Celular Android (Google Chrome)
1. Abra o **link público** do seu sistema no navegador Google Chrome no Android.
2. Você verá um botão **"📲 Instalar App Web"** na barra superior (se suportado pelo navegador) ou pode clicar nos **três pontinhos do Chrome (⋮)** no canto superior direito.
3. Selecione a opção **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
4. Confirme o nome **"Claudemar CRM"** e toque em **Adicionar**.
5. **Pronto!** Um ícone do CRM será adicionado à sua tela inicial. Sempre que você clicar nele, o CRM abrirá em modo tela cheia rodando na web.

---

## 3. Como Gerar um Link Público Gratuito em 1 Minuto (Deploy)

Para acessar o link do seu celular de qualquer lugar ou enviar o link `#cadastro` para seus clientes, você pode publicar o projeto gratuitamente em plataformas como **Vercel**, **Netlify** ou **Firebase Hosting**:

### Opção A: Publicar com Vercel (Recomendado - Gratuito e Rápido)
1. Instale a CLI da Vercel (ou conecte seu repositório no [vercel.com](https://vercel.com)):
   ```bash
   npx vercel
   ```
2. Siga as instruções no terminal (pressione Enter para confirmar o padrão).
3. Em segundos, a Vercel gerará um link oficial (ex: `https://crm-claudemar-modas.vercel.app`).
4. Envie `https://crm-claudemar-modas.vercel.app/#cadastro` para seus clientes ou abra `https://crm-claudemar-modas.vercel.app/#login` no seu Android para salvar na tela inicial.

---

### Opção B: Publicar com Firebase Hosting (Oficial do Google)
1. Instale as ferramentas do Firebase:
   ```bash
   npm install -g firebase-tools
   ```
2. Faça login na sua conta Google:
   ```bash
   firebase login
   ```
3. Inicialize o hosting na pasta do projeto (selecione a pasta `dist` como diretório público):
   ```bash
   firebase init hosting
   ```
4. Gere a versão de produção e publique:
   ```bash
   npm run build
   firebase deploy
   ```
5. Você receberá o link oficial do Firebase: `https://crm-claudemar-modas.web.app`.
