# Painel Admin · HB Construtora

Documentação de operação. Guarde isso.

---

## 1. Acesso

URL do painel: **https://hb-construtora.vercel.app/admin**

Login: e-mail + senha (cadastrados manualmente no Supabase — ver seção 3).

---

## 2. O que dá pra editar

| Página | O que faz |
|---|---|
| **Dashboard** | Visão geral: total de leads, serviços, obras, FAQ. Últimos leads recebidos. |
| **Leads** | Tabela de leads recebidos pelo formulário. Botão pra exportar CSV. |
| **Seções** | Reordenar e ocultar/exibir as seções da home (Hero, Serviços, Galeria, etc). |
| **Serviços** | CRUD dos 4 serviços (Casas, Kitnets, etc). Cada um tem foto e textos. |
| **Obras** | CRUD da galeria de obras entregues. Cada obra pode ter várias fotos. |
| **FAQ** | CRUD de perguntas e respostas. |
| **Ajustes** | Vídeo institucional (URL YouTube), textos do Hero, Sobre, número WhatsApp, mensagem padrão. |

**Após salvar qualquer alteração**, clique em **"Publicar alterações"** no topo do painel pra disparar um novo deploy. Em ~1-2min as mudanças aparecem ao vivo no site.

---

## 3. Criar contas de admin

O cadastro **não é público**. Pra adicionar um usuário:

1. Abra o **Supabase Dashboard**: https://supabase.com/dashboard/project/lbihkxjzzdtgzzbyjxpg
2. Menu lateral → **Authentication** → **Users**
3. Botão **"Add user"** → **"Create new user"**
4. Preencha: e-mail, senha (mínimo 6 caracteres), marque **"Auto Confirm User"** (importante!)
5. Pronto. O usuário já consegue fazer login em `/admin/login`.

Pra remover um usuário: mesma tela, clique no `...` ao lado do usuário → "Delete user".

---

## 4. Configurar o botão "Publicar alterações"

O botão precisa de um **Vercel Deploy Hook**. Crie uma vez:

1. Acesse o projeto `hb-construtora` no Vercel: https://vercel.com/pivatodo-1569s-projects/hb-construtora/settings/git
2. Role até **"Deploy Hooks"**
3. Crie um hook: nome `admin-publish`, branch `main` (ou a que estiver em uso). Copie a URL gerada.
4. Em **Settings → Environment Variables** adicione:
   - Nome: `VERCEL_DEPLOY_HOOK`
   - Valor: a URL que você copiou
   - Marque **Production**
5. Faça um redeploy do projeto pra a env var ser carregada (Settings → Deployments → "..." → Redeploy).

A partir daí, clicar em "Publicar alterações" no admin chama esse hook e dispara o build.

---

## 5. Sobre as imagens

- O painel comprime automaticamente toda imagem que você sobe pra ≤400KB e converte pra WebP.
- Imagens vão pro **Supabase Storage** (bucket público `site-media`), pasta de acordo com o tipo (`servicos/`, `obras/`).
- Limite de 5MB por arquivo (antes da compressão). Se uma foto vinda do celular exceder, tira uma com menos resolução.

Pra ver ou apagar imagens manualmente: Supabase Dashboard → **Storage** → `site-media`.

---

## 6. Onde está cada coisa (pro caso de você precisar mexer no banco direto)

Tabelas no Supabase (`lbihkxjzzdtgzzbyjxpg`):

- `leads` — formulário de contato
- `site_sections` — ordem e visibilidade das seções
- `site_settings` — chave/valor (textos do Hero, Sobre, WhatsApp, INSS slides etc)
- `servicos` — 4 cards de serviços
- `obras` — galeria de obras entregues
- `obra_fotos` — fotos relacionadas a cada obra (1-N)
- `faq_items` — perguntas e respostas

Acesso direto: https://supabase.com/dashboard/project/lbihkxjzzdtgzzbyjxpg/editor

---

## 7. Resolução de problemas

**"Nada acontece quando clico em Publicar"** → O `VERCEL_DEPLOY_HOOK` não foi configurado. Veja seção 4.

**"Salvei mas o site não atualizou"** → Após salvar, clique em "Publicar alterações". Aguarde 1-2min.

**"Erro ao logar (e-mail ou senha incorretos)"** → Confira se o usuário existe e tem `Confirmed` marcado no Supabase Authentication.

**"Imagem ficou com tamanho errado"** → O painel força WebP 1600px máx. Pra fotos de capa de obras, prefira proporção 4:3 ou 16:9.

**"O número de WhatsApp não atualizou"** → Salve em `Ajustes`, depois clique em "Publicar alterações" pra rebuild.

---

## 8. Logs e suporte

- Logs do site (erros): https://vercel.com/pivatodo-1569s-projects/hb-construtora/logs
- Logs do banco: https://supabase.com/dashboard/project/lbihkxjzzdtgzzbyjxpg/logs/postgres-logs

---

_Documentação gerada em 04/05/2026._
