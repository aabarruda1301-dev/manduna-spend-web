# Manduna Spend — Site na internet (passo a passo)

Este projeto é o seu site Manduna Eco Resort em **Next.js + Supabase**, hospedado de graça em **Vercel** (URL pública na internet, com login).

Tempo estimado: **30 a 45 minutos** para alguém que nunca fez isso. Você vai criar 3 contas (todas grátis), copiar arquivos, e clicar em alguns botões. Não precisa programar nada.

---

## O que você vai precisar instalar

1. **GitHub Desktop** (programa, evita usar terminal): https://desktop.github.com/

   Baixe e instale. É um aplicativo normal, igual qualquer outro.

2. **Editor de texto** (opcional, só se precisar editar): VS Code https://code.visualstudio.com/

> **Você NÃO precisa instalar Node.js, npm, ou nada de terminal.** A Vercel cuida disso.

---

## ETAPA 1 — Criar as 3 contas grátis

### 1.1 GitHub
- Vá em https://github.com/signup
- Crie conta com seu email aabarruda1301@gmail.com (ou outro). Anote a senha.

### 1.2 Supabase (banco de dados)
- Vá em https://supabase.com/dashboard
- Clique **Sign in with GitHub** (logue com a conta que acabou de criar).

### 1.3 Vercel (hospedagem do site)
- Vá em https://vercel.com/signup
- Clique **Continue with GitHub** (mesma conta).

Pronto. Você tem 3 contas conectadas.

---

## ETAPA 2 — Subir os dados no Supabase

### 2.1 Criar projeto

1. No painel do Supabase, clique **New project**.
2. Nome do projeto: `manduna-spend`
3. Database Password: clique no botão de gerar e **copie a senha em algum lugar seguro** (você não vai precisar dela hoje, mas vai precisar no futuro).
4. Region: **South A	merica (São Paulo)** se aparecer; senão deixe o default.
5. Plan: **Free**.
6. Clique **Create new project** e espere 1–2 minutos.

### 2.2 Criar as tabelas

1. No menu da esquerda, clique no ícone **SQL Editor** (parece `</>`).
2. Clique **+ New query**.
3. Abra o arquivo `supabase_setup.sql` (está nesta pasta) num editor de texto.
4. Copie TODO o conteúdo e cole no SQL Editor do Supabase.
5. Clique **Run** (canto inferior direito). Deve aparecer "Success. No rows returned".

### 2.3 Importar os dados (CSV)

1. No menu da esquerda, clique **Table Editor**.
2. Você verá a tabela `transactions` listada. Clique nela.
3. No canto superior direito, clique **Insert** → **Import data from CSV**.
4. Selecione o arquivo `transactions_master.csv` (está em `Financeiro Manduna/base44_csv/transactions_master.csv`).
5. Confirme que as colunas batem (sheet_name, txn_date, supplier etc.). Clique **Import data**.
6. Espere uns 30 segundos. Vai dizer "Successfully imported 6563 rows".
7. Repita para a tabela `suppliers` com o arquivo `suppliers.csv` (mesma pasta).

### 2.4 Pegar as credenciais (você vai usar daqui a pouco)

1. No menu da esquerda, clique **Project Settings** (engrenagem na base) → **API**.
2. Você verá dois valores. **Anote em algum lugar:**
   - **Project URL**: `https://XXXXX.supabase.co`
   - **anon public**: uma string longa começando com `eyJ...`

### 2.5 Criar o usuário que vai logar no site

1. Menu esquerdo → **Authentication** → **Users**.
2. Clique **Add user** → **Create new user**.
3. Email: o seu email (ex: `aabarruda1301@gmail.com`).
4. Password: escolha uma senha (pelo menos 6 caracteres).
5. **Auto Confirm User**: marque sim.
6. Clique **Create user**.

> Para adicionar mais pessoas que possam acessar o site, repita esse passo.

---

## ETAPA 3 — Subir o código no GitHub

### 3.1 Abrir o GitHub Desktop e criar o repositório

1. Abra o **GitHub Desktop**.
2. Login com a conta GitHub se ainda não fez.
3. Menu **File** → **Add Local Repository**.
4. Clique **Choose...** e selecione esta pasta: `Documents/Claude/Projects/Financeiro Manduna/manduna-spend-web`.
5. Vai aparecer "This directory does not appear to be a Git repository". Clique no link **create a repository**.
6. Confirme e clique **Create Repository**.

### 3.2 Publicar no GitHub

1. No GitHub Desktop, no topo, clique **Publish repository**.
2. Name: `manduna-spend-web`
3. **Desmarque** "Keep this code private" se quiser deixar **público** (o site funciona com privado também — Vercel acessa mesmo).
4. Clique **Publish Repository**.

Pronto. Seu código está na nuvem.

---

## ETAPA 4 — Colocar o site no ar (Vercel)

### 4.1 Importar o projeto

1. Vá em https://vercel.com/new
2. Clique **Import** ao lado do repositório `manduna-spend-web` (Vercel já vê os repositórios da sua conta GitHub).
3. Na próxima tela, você verá o nome do projeto. **Não clique em Deploy ainda.**

### 4.2 Configurar as credenciais do Supabase

1. Role até **Environment Variables**.
2. Adicione duas variáveis:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (cole o **Project URL** do Supabase) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (cole o **anon public** key do Supabase) |

3. Clique **Deploy**.

### 4.3 Esperar o deploy

Demora uns 2–3 minutos na primeira vez. A Vercel mostra logs em tempo real. Quando terminar, vai aparecer:

> 🎉 Congratulations! Your project has been successfully deployed.

Clique **Continue to Dashboard** ou **Visit** para ver seu site no ar.

A URL vai ser algo como `https://manduna-spend-web.vercel.app` — esse é o endereço **público** do seu site.

---

## ETAPA 5 — Testar

1. Abra a URL `https://manduna-spend-web.vercel.app` (ou a sua).
2. Você verá a tela de login.
3. Entre com o email e senha que criou no passo **2.5**.
4. Pronto — você está vendo o Dashboard com os dados.

---

## Como atualizar os dados depois

Quando você tiver dados novos no Excel:

1. Gera um novo `transactions_master.csv` (peço pro Claude regerar pra você).
2. No Supabase: **Table Editor** → `transactions` → **Insert** → **Import data from CSV** → seleciona o novo arquivo.

> Dica: o "Import" sempre **adiciona** linhas. Se quiser substituir tudo, antes do import abra o SQL Editor e rode `TRUNCATE public.transactions;` para limpar.

O site não precisa de novo deploy — ele lê do Supabase em tempo real.

---

## Como adicionar um domínio próprio (opcional)

Se você tem um domínio (ex: `manduna.com.br`):

1. No Vercel, abra o projeto → **Settings** → **Domains**.
2. Cole seu domínio e siga as instruções (você vai colar 1 ou 2 registros DNS no painel da empresa que vendeu o domínio).
3. Em ~10 minutos seu site estará em `https://manduna.com.br`.

---

## Problemas comuns

**"Can't reach database server"** ao fazer login: confirme que as variáveis de ambiente no Vercel (passo 4.2) estão certas. Vá em **Settings → Environment Variables** e confira.

**Tela em branco depois do login**: provavelmente o CSV não foi importado direito. Volte ao Supabase, abra a tabela `transactions` no Table Editor, e veja se tem 6.563 linhas.

**"Invalid login credentials"**: o usuário não foi criado, ou a senha está errada. Recrie no passo 2.5.

---

## O que você tem agora

- Um banco de dados PostgreSQL na nuvem (Supabase, free tier — limite de 500 MB, mais que suficiente).
- Um site na internet com URL pública e login (Vercel, free tier — tráfego ilimitado para uso pessoal).
- Atualizações de código automáticas: toda vez que você mudar algo e fizer **Push** no GitHub Desktop, o Vercel faz redeploy automaticamente em 1–2 minutos.

Bem-vindo à internet 🚀
