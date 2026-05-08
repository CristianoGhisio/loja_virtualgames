# Guia Passo a Passo — Rodar o Projeto no MacBook

Este guia ensina como fazer o projeto **Virtual Games (Loja)** rodar no seu **MacBook** usando Docker, exatamente como está rodando no computador Windows.

---

## Índice

1. [Instalar o Docker no MacBook](#1-instalar-o-docker-no-macbook)
2. [Baixar o Projeto do GitHub](#2-baixar-o-projeto-do-github)
3. [Criar o Arquivo de Configuração (.env.production)](#3-criar-o-arquivo-de-configuração-envproduction)
4. [Iniciar o Projeto com Docker](#4-iniciar-o-projeto-com-docker)
5. [Restaurar o Banco de Dados (com admin já cadastrado)](#5-restaurar-o-banco-de-dados-com-admin-já-cadastrado)
6. [Conectar o WhatsApp](#6-conectar-o-whatsapp)
7. [Acessar o Sistema](#7-acessar-o-sistema)
8. [Comandos Úteis para o Dia a Dia](#8-comandos-úteis-para-o-dia-a-dia)
9. [Problemas Comuns e Soluções](#9-problemas-comuns-e-soluções)
10. [Verificação Final](#10-verificação-final)

---

## 1. Instalar o Docker no MacBook

> **O que é Docker?** É um programa que cria "caixinhas" (chamadas containers) para rodar programas sem precisar instalar nada diretamente no seu computador.

### Passo 1.1 — Baixar o Docker

1. Abra o navegador (Safari ou Chrome) no seu MacBook
2. Acesse: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
3. Clique no botão **"Download for Mac"** (com chip Apple Silicon ou Intel, dependendo do seu Mac)
4. O arquivo `Docker.dmg` será baixado

> **Dica:** Se você tem um MacBook com chip M1, M2, M3 ou M4, escolha a versão **Apple Silicon**. Se for um Mac mais antigo com chip Intel, escolha a versão **Intel Chip**.

### Passo 1.2 — Instalar o Docker

1. Abra o arquivo baixado (`Docker.dmg`)
2. Arraste o ícone do **Docker** para a pasta **Applications**
3. Abra o **Docker** pela primeira vez (vá em Applications e clique em Docker)
4. Uma mensagem pode perguntar: *"Docker is a download from the internet. Are you sure you want to open it?"* — clique em **Open**
5. O Docker vai pedir permissão para instalar componentes — clique em **OK** e digite sua senha do Mac
6. Aguarde o Docker iniciar (aparecerá o ícone de uma baleia na barra superior do Mac)

### Passo 1.3 — Verificar se o Docker está funcionando

1. Abra o **Terminal** do Mac (vá em Applications > Utilitários > Terminal)
2. Digite o comando abaixo e aperte **Enter**:

```bash
docker --version
```

Você deve ver algo como: `Docker version 24.0.0, build xxxxxx`

3. Digite também:

```bash
docker compose version
```

Você deve ver algo como: `Docker Compose version v2.x.x`

---

## 2. Baixar o Projeto do GitHub

> **O que é GitHub?** É um site onde o código do projeto está guardado. Você vai baixar uma cópia para o seu MacBook.

### Passo 2.1 — Baixar o projeto

1. No Terminal do Mac, digite os comandos abaixo UM DE CADA VEZ, apertando **Enter** após cada um:

```bash
cd ~/Desktop
```

```bash
git clone https://github.com/CristianoGhisio/loja.git
```

2. Aguarde o download terminar. Você verá uma mensagem parecida com:

```
Receiving objects: 100% (.../...), done.
```

3. Agora entre na pasta do projeto:

```bash
cd loja
```

---

## 3. Criar o Arquivo de Configuração (.env.production)

> **O que é .env.production?** É um arquivo que guarda senhas e configurações do sistema. Você precisa criá-lo porque ele NÃO está no GitHub por segurança.

### Passo 3.1 — Criar o arquivo

1. No Terminal, dentro da pasta `loja`, digite:

```bash
nano .env.production
```

2. O editor `nano` vai abrir. **Cole o conteúdo abaixo** inteiro (clique com o botão direito e escolha Colar):

```bash
POSTGRES_USER=loja_user
POSTGRES_PASSWORD=loja_pass
POSTGRES_DB=loja_db

DATABASE_URL=postgresql://loja_user:loja_pass@postgres:5432/loja_db

AUTH_SECRET=tDLbenyP7iIN/sQSyXBTUug/x5AkYMZ925ues/9Ho+w=
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_SITE_URL=http://localhost:3000

OS_APPROVAL_SECRET=str8Q6jsSsi1b6Idn800l9Pp7cSIS3PDqI51aCm2Tms=

COSMOS_BASE_URL=https://api.cosmos.bluesoft.com.br
COSMOS_TOKEN=g58DVxF_7VmiQuWqL22AOg
COSMOS_USER_AGENT=Cosmos-API-Request
COSMOS_TIMEOUT_MS=8000


WHATSAPP_BOT_TOKEN=xpqskIm7Jp95dYP/8kmpTqJDI3pw7nE6hUrxAvBDkTM=
WHATSAPP_BOT_BASE_URL=http://127.0.0.1:3333
WHATSAPP_BOT_URL=http://127.0.0.1:3333/send
INTERNAL_API_URL=http://localhost:3000

DB_HOST=postgres
DB_PORT=5432
```

3. **Salvar no nano:** aperte `Control + O` (segure a tecla Control e aperte O), depois aperte **Enter**
4. **Sair do nano:** aperte `Control + X`

---

## 4. Iniciar o Projeto com Docker

### Passo 4.1 — Primeira execução (pode demorar)

A primeira vez que você rodar o projeto, o Docker vai baixar várias coisas e construir o sistema. Isso pode levar de **5 a 15 minutos**, dependendo do seu MacBook e da internet.

No Terminal (dentro da pasta `loja`), digite:

```bash
docker compose up -d --build
```

O que vai acontecer:
1. O Docker vai ler o arquivo `Dockerfile` e começar a construir o container do sistema
2. Você verá muitas linhas passando na tela — é normal
3. Quando terminar, aparecerá:

```
Container loja_postgres  Started
Container loja_app       Started
```

### Passo 4.2 — Verificar se está tudo rodando

Digite:

```bash
docker compose ps
```

Você deve ver duas linhas parecidas com:

```
NAME              STATUS
loja_postgres     Up (healthy)
loja_app          Up (healthy)
```

Se aparecer `Up` ou `Up (healthy)` está funcionando.

### Passo 4.3 — Ver os logs do sistema

Para ver se o sistema iniciou corretamente:

```bash
docker compose logs app
```

No final dos logs você deve ver:

```
▲ Next.js 16.2.4
- Local:         http://localhost:3000
✓ Ready in ...
```

---

## 5. Restaurar o Banco de Dados (com admin já cadastrado)

> ⚠️ **Pule esta seção se for usar o seed padrão (sem admin pré-cadastrado).**
>
> O banco de dados acabou de ser criado vazio. Para ter o admin e todas as configurações já prontas, você precisa restaurar um backup.

O backup do banco está no arquivo `storage/db-dumps/loja_backup.sql`. Ele contém:
- ✅ **Admin:** `admin@virtualgames.com` (já cadastrado)
- ✅ Roles e permissões
- ✅ Configurações da loja

### Passo 5.1 — Restaurar o backup

No Terminal, dentro da pasta `loja`, digite:

```bash
# Restaurar o banco de dados
cat storage/db-dumps/loja_backup.sql | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
```

Se houver erros de permissão ou tabelas já existentes, execute com força total:

```bash
# Reset completo do banco (APAGA tudo e recria)
docker compose exec -T postgres sh -c '
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
'
cat storage/db-dumps/loja_backup.sql | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
```

### Passo 5.2 — Verificar se o admin foi restaurado

```bash
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT email, name FROM \"User\""'
```

Você deve ver na tela:

```
         email          |    name
------------------------+------------
 admin@virtualgames.com | Admin Dono
```

### Passo 5.3 — (Opcional) Criar um backup atualizado

Se você já usou o sistema e quer levar os dados atualizados para outro computador:

```bash
docker compose exec -T postgres sh -c '
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges
' > storage/db-dumps/loja_backup.sql
```

---

## 6. Conectar o WhatsApp

> O bot do WhatsApp precisa ser conectado lendo um QR Code. Como está rodando dentro do Docker, vamos usar o terminal.

### Passo 6.1 — Conectar o WhatsApp

1. Acesse o sistema pelo navegador: `http://localhost:3000/dashboard/configuracoes/whatsapp`
2. Faça login com o usuário cadastrado:
   - **Email:** `admin@virtualgames.com`
   - **Senha:** (a senha definida no seed — se não souber, use a opção "Esqueci a senha" no login)
3. Clique em **"Iniciar Conexão"** ou **"Conectar"**

### Passo 6.2 — Ler o QR Code

Aparecerá um QR Code na tela. Você precisa escaneá-lo com o WhatsApp do seu celular:

1. Abra o **WhatsApp** no seu celular
2. Toque nos **três pontinhos** (Android) ou **Configurações** (iPhone)
3. Vá em **WhatsApp Web / Dispositivos conectados**
4. Toque em **"Conectar um dispositivo"**
5. Aponte a câmera para o QR Code na tela do computador

Pronto! O bot do WhatsApp está conectado.

> **Importante:** O QR Code expira rápido. Se ele sumir, clique em "Reconectar" ou recarregue a página.

---

## 7. Acessar o Sistema

### Passo 7.1 — Abrir o sistema

1. Abra o navegador (Safari, Chrome, etc.)
2. Digite na barra de endereço: `http://localhost:3000`

Você verá a tela de login do sistema.

### Passo 7.2 — Fazer login

Se você restaurou o backup do banco, o admin `admin@virtualgames.com` já está cadastrado. Faça login diretamente.

Se você não restaurou o backup, cadastre-se normalmente:

1. Clique em **"Criar conta"** ou **"Registrar"**
2. Preencha:
   - **Nome:** seu nome
   - **Email:** seu email
   - **Senha:** crie uma senha
3. Clique em **Cadastrar**

Após o login, navegue até `http://localhost:3000/dashboard/atendimento`

### Passo 7.3 — Verificar se está funcionando

Se os cards do funil aparecerem, está tudo funcionando!

---

## 8. Comandos Úteis para o Dia a Dia

| O que fazer | Comando |
|-------------|---------|
| **Ligar o sistema** | `cd ~/Desktop/loja && docker compose up -d` |
| **Desligar o sistema** | `cd ~/Desktop/loja && docker compose down` |
| **Ver o que está rodando** | `docker compose ps` |
| **Ver logs do app** | `docker compose logs app` |
| **Ver logs do banco** | `docker compose logs postgres` |
| **Reiniciar o app** | `cd ~/Desktop/loja && docker compose restart app` |
| **Atualizar com código novo** | `cd ~/Desktop/loja && git pull && docker compose up -d --build` |
| **Parar tudo e apagar dados** | `cd ~/Desktop/loja && docker compose down -v` |
| **Criar backup do banco** | `docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges' > storage/db-dumps/loja_backup.sql` |
| **Restaurar backup do banco** | `cat storage/db-dumps/loja_backup.sql \| docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'` |
| **Ver usuários cadastrados** | `docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT email, name FROM \"User\""'` |

---

## 9. Problemas Comuns e Soluções

### "Cannot connect to the Docker daemon"

**Causa:** O Docker não foi iniciado.

**Solução:**
1. Abra o **Docker Desktop** no Mac (Applications > Docker)
2. Aguarde o ícone da baleia parar de piscar
3. Tente novamente

### "Port 3000 is already in use" / "Port 5432 is already in use"

**Causa:** Outro programa já está usando a porta 3000 ou 5432.

**Solução:**
Opção 1 — Identificar e fechar o programa:
```bash
lsof -i :3000
```
Anote o número do processo (PID) e digite:
```bash
kill -9 <NUMERO_DO_PID>
```

Opção 2 — Desligar o Mac e ligar de novo.

### "Container exited with code 1"

**Causa:** O app tentou iniciar mas deu erro.

**Solução:** Ver os logs para entender o erro:
```bash
docker compose logs app --tail 30
```

Se for erro de banco de dados, pode ser necessário esperar o PostgreSQL terminar de iniciar. O container `app` já reinicia sozinho (tem `restart: always`).

### O WhatsApp bot não conecta

**Causa:** Pode ser que o Chromium precise ser instalado ou a sessão expirou.

**Solução:**
1. Vá em `http://localhost:3000/dashboard/configuracoes/whatsapp`
2. Clique em **"Desconectar"**
3. Clique em **"Conectar"** novamente
4. Escaneie o novo QR Code

### Meu MacBook é Apple Silicon (M1, M2, M3, M4)

O projeto já está configurado para funcionar em Macs com chip Apple Silicon. O Docker Desktop para Mac lida com a compatibilidade automaticamente.

### Como atualizar o projeto quando houver mudanças

Quando o código for atualizado no GitHub, você pode baixar as novidades e atualizar o sistema:

```bash
cd ~/Desktop/loja
git pull
docker compose up -d --build
```

Isso vai:
1. Baixar o código novo do GitHub
2. Reconstruir o container do sistema
3. Reiniciar tudo automaticamente

Se houver mudanças no banco de dados (migrations), elas serão aplicadas automaticamente.

---

## 10. Verificação Final

Depois de seguir todos os passos, faça este checklist:

- [ ] Docker Desktop está aberto e rodando
- [ ] `docker compose ps` mostra os dois containers como "Up"
- [ ] Backup do banco foi restaurado (`docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT email, name FROM \"User\""'`)
- [ ] `http://localhost:3000` abre o sistema no navegador
- [ ] Consigo fazer login com `admin@virtualgames.com`
- [ ] A página de Atendimento carrega corretamente
- [ ] O WhatsApp bot está conectado (verde em Configurações > WhatsApp)

Se tudo isso estiver funcionando, **parabéns!** O projeto está rodando no seu MacBook! 🎉
