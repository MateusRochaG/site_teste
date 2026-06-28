# Restaurante Dragão Chinês — site (protótipo)

## O que tem aqui dentro

```
dragao-chines-site/
├── index.html              ← página HTML base (não precisa editar)
├── package.json             ← lista de "peças" que o projeto precisa
├── vite.config.js           ← configuração da ferramenta que roda o site
├── tailwind.config.js       ← configuração do estilo visual
├── postcss.config.js        ← suporte ao Tailwind (não precisa editar)
├── .env.example              ← modelo para suas chaves do Supabase (fase 2)
├── .gitignore                ← lista de coisas que NÃO vão pro GitHub
└── src/
    ├── main.jsx              ← arquivo que liga tudo (não precisa editar)
    ├── App.jsx               ← O SITE EM SI (cardápio, cores, textos) — é aqui que você edita
    ├── index.css             ← estilo base
    ├── supabaseClient.js     ← conexão com o Supabase (só usado na fase 2)
    └── data/
        └── cardapio.json     ← o cardápio em formato de dados (referência)
```

Você só vai precisar editar o **`src/App.jsx`** no dia a dia (pra mudar preço, nome de prato, etc).

---

## FASE 1 — Colocar o site no ar (sem Supabase ainda)

### Passo 1 — Testar no seu computador (opcional, mas recomendado)

1. Instale o [Node.js](https://nodejs.org) (versão recomendada na página, é só clicar em "Download" e instalar como qualquer programa).
2. Abra esta pasta `dragao-chines-site` no terminal (ou clique direito → "Abrir terminal aqui").
3. Digite:
   ```
   npm install
   ```
   (isso baixa as peças que faltam — só precisa fazer uma vez)
4. Depois digite:
   ```
   npm run dev
   ```
5. Vai aparecer um link tipo `http://localhost:5173` — abra no navegador. Esse é o seu site rodando.

### Passo 2 — Criar a conta e o repositório no GitHub

1. Crie uma conta em [github.com](https://github.com) se ainda não tiver.
2. Clique no botão verde **"New"** (ou "Novo repositório").
3. Dê um nome, ex: `dragao-chines-site`.
4. Deixe como **Public** ou **Private** (sua escolha — Private é mais discreto).
5. **NÃO** marque "Add a README" (já temos um). Clique em **"Create repository"**.

### Passo 3 — Mandar os arquivos pro GitHub

A forma mais fácil para quem não usa terminal é o **GitHub Desktop**:

1. Baixe e instale: [desktop.github.com](https://desktop.github.com)
2. Abra o programa, faça login com sua conta do GitHub.
3. Clique em **"Add" → "Add Existing Repository"** e selecione a pasta `dragao-chines-site` (a pasta inteira que eu te entreguei, com tudo dentro).
4. Ele vai mostrar todos os arquivos que serão enviados. Confirme que **NÃO** aparece nenhuma pasta `node_modules` na lista (se aparecer, me avise).
5. Escreva uma mensagem como "primeira versão do site" no campo de baixo e clique em **"Commit to main"**.
6. Clique em **"Publish repository"** no topo.

Pronto — os arquivos estão no GitHub. **Você não precisa escolher pastas manualmente**: é a pasta `dragao-chines-site` inteira, do jeito que está, que vai pro repositório.

### Passo 4 — Publicar o site de verdade (link público)

1. Crie uma conta em [vercel.com](https://vercel.com) usando login do GitHub (um clique).
2. Clique em **"Add New" → "Project"**.
3. Selecione o repositório `dragao-chines-site` que você acabou de criar.
4. Deixe as configurações como estão (a Vercel detecta automaticamente que é um projeto Vite/React) e clique em **"Deploy"**.
5. Em ~1 minuto você recebe um link tipo `dragao-chines-site.vercel.app` — esse é o site no ar, de verdade, pra qualquer pessoa acessar.

Toda vez que você editar o `App.jsx` e enviar a alteração pelo GitHub Desktop (Commit + Push), a Vercel atualiza o site sozinha.

---

## FASE 2 — Conectar ao Supabase (mais pra frente, opcional)

Isso é só quando você quiser que o cardápio venha de um banco de dados (pra editar preços sem precisar tocar em código, ou pra salvar pedidos).

1. No painel do Supabase, vá em **Settings → API** e copie:
   - **Project URL** (ex: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / publishable key** (a que você já me mandou: `sb_publishable_...`)
2. Na pasta do projeto, duplique o arquivo `.env.example`, renomeie a cópia para `.env` (sem ".example") e cole esses dois valores nele.
3. Crie as tabelas `categorias` e `pratos` no Supabase (SQL no final deste guia).
4. Me avise quando chegar nessa etapa — eu escrevo o trecho de código que troca os dados fixos do `App.jsx` pela busca no Supabase, e o script que importa o `cardapio.json` para as tabelas automaticamente.

### SQL das tabelas (cole no SQL Editor do Supabase quando for usar)

```sql
create table categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  subtitulo text,
  ordem int default 0
);

create table pratos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorias(id) on delete cascade,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null,
  imagem_url text,
  disponivel boolean default true,
  ordem int default 0
);
```

---

## FASE 3 — Acompanhamento do pedido + Painel da Cozinha

### Passo 1 — Liberar as tabelas de pedidos no Supabase

No SQL Editor do Supabase, rode:

```sql
alter table pedidos enable row level security;
alter table itens_pedido enable row level security;

create policy "Inserir pedido" on pedidos for insert to anon with check (true);
create policy "Ler pedidos" on pedidos for select to anon using (true);
create policy "Atualizar status do pedido" on pedidos for update to anon using (true);

create policy "Inserir itens do pedido" on itens_pedido for insert to anon with check (true);
create policy "Ler itens do pedido" on itens_pedido for select to anon using (true);
```

⚠️ **Importante sobre segurança:** essas regras liberam leitura e atualização de pedidos pra qualquer
um que tenha a chave pública do site (que já é pública por natureza). Isso é aceitável numa fase de
teste, mas antes de operar com clientes reais o ideal é migrar pra autenticação de verdade (Supabase
Auth) com uma conta só pra equipe da cozinha — me avise quando quiser evoluir isso.

### Passo 2 — Painel da Cozinha

Depois de subir esta atualização, o painel fica disponível em:

```
https://SEU-SITE.netlify.app/cozinha
```

PIN padrão de entrada: **1234** (definido no início do arquivo `src/Cozinha.jsx`, na constante
`PIN_COZINHA` — troque por outro número antes de divulgar o link pra equipe). De novo: isso é só uma
trava simples contra acesso por acidente, não é uma senha de verdade.

No painel, cada pedido mostra os itens, cliente, telefone, endereço (se for entrega) e total, com um
botão para avançar o status: Recebido → Preparando → Pronto → Entregue. A lista atualiza sozinha a
cada 5 segundos.

### Como o cliente acompanha o pedido

Depois de fazer o pedido, o site mostra uma tela com 4 etapas (Recebido → Preparando → Pronto →
Entregue) que atualiza automaticamente. Se a pessoa fechar a aba, ao reabrir o site nesse mesmo
aparelho/navegador, uma barra no topo deixa continuar acompanhando.

---



1. Baixe a pasta `dragao-chines-site` (o zip que eu te mandei).
2. Crie um repositório no GitHub.
3. Suba a pasta inteira usando o GitHub Desktop.
4. Conecte esse repositório na Vercel e clique em Deploy.
5. Pronto — você tem um link público do site. O Supabase é só depois, sem pressa.
