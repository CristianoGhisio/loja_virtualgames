import qrcode from 'qrcode-terminal';
import WhatsAppWeb from 'whatsapp-web.js';
import axios from 'axios';
import { createServer } from 'node:http';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { timingSafeEqual } from 'node:crypto';

const { Client, LocalAuth } = WhatsAppWeb;

const API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3000';
const BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN || '';
const RESTART_DELAY_MS = 3000;
const BOT_PORT = Number(process.env.WHATSAPP_BOT_PORT || 3333);
const AUTH_DIR = join(process.cwd(), '.wwebjs_auth', 'session-crm-bot');

if (!BOT_TOKEN) {
  console.error('WHATSAPP_BOT_TOKEN não configurado');
  process.exit(1);
}

let client = null;
let restarting = false;
let isClientReady = false;
let isStarting = false;
let allowAutoRestart = true;
let state = 'stopped';
let lastQr = '';
let lastQrAscii = '';
let lastError = '';
let lastDisconnectReason = '';

const menuSentPhones = new Set();

const MENU_MESSAGE = [
  'Olá! Aqui é da Virtual Games.',
  'Recebemos sua mensagem.',
  'Para agilizar, você busca:',
  '1 - Produtos',
  '2 - Serviços',
  '3 - Boleto Bancário',
].join('\n');

const PRODUCT_CONFIRMATION = [
  'O seu interesse em algum PRODUTO foi registrado!',
  'Em breve um de nossos atendentes entrará em contato.',
].join('\n');

const SERVICE_CONFIRMATION = [
  'O seu interesse em algum SERVIÇO foi registrado!',
  'Em breve um de nossos atendentes entrará em contato.',
].join('\n');

const BOLETO_CONFIRMATION = [
  'O seu interesse em BOLETO BANCÁRIO foi registrado!',
  'Em breve um de nossos atendentes entrará em contato.',
].join('\n');

const DEFAULT_REPLY = 'Recebemos sua mensagem. Logo retornamos o contato.';

const SURVEY_REPLY = 'Obrigado pela avaliação! Sua opinião é muito importante para nós.';

function randomDelay() {
  const ms = Math.floor(Math.random() * 6001) + 2000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRestart(errorText) {
  const text = errorText.toLowerCase();
  return (
    text.includes('execution context was destroyed') ||
    text.includes('protocol error') ||
    text.includes('navigation')
  );
}

function createClient() {
  return new Client({
    authStrategy: new LocalAuth({ clientId: 'crm-bot' }),
    puppeteer: {
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    },
  });
}

function buildStatus() {
  return {
    state,
    isReady: isClientReady,
    restarting,
    lastQr,
    lastQrAscii,
    lastError,
    lastDisconnectReason,
  };
}

function updateState(nextState) {
  state = nextState;
}

function resetQr() {
  lastQr = '';
  lastQrAscii = '';
}

async function clearSessionFiles() {
  try {
    await rm(AUTH_DIR, { recursive: true, force: true });
  } catch {
  }
}

async function restartClient(reason) {
  if (restarting || !allowAutoRestart) return;
  restarting = true;
  isClientReady = false;
  isStarting = false;
  updateState('disconnected');
  lastError = String(reason || '');

  console.error(`Reiniciando bot WhatsApp: ${reason}`);

  if (client) {
    try {
      await client.destroy();
    } catch {
    }
  }

  setTimeout(() => {
    restarting = false;
    void startClient({ forceRestart: true });
  }, RESTART_DELAY_MS);
}

function registerHandlers(currentClient) {
  currentClient.on('qr', (qr) => {
    lastQr = qr;
    isClientReady = false;
    updateState('qr');
    qrcode.generate(qr, { small: true }, (ascii) => {
      lastQrAscii = String(ascii || '');
      console.log(lastQrAscii);
    });
  });

  currentClient.on('ready', () => {
    isClientReady = true;
    isStarting = false;
    lastError = '';
    lastDisconnectReason = '';
    resetQr();
    updateState('ready');
    console.log('WhatsApp bot conectado');
  });

  currentClient.on('auth_failure', (message) => {
    isClientReady = false;
    isStarting = false;
    lastError = `Falha de autenticação: ${message}`;
    updateState('error');
    void restartClient(`Falha de autenticação: ${message}`);
  });

  currentClient.on('disconnected', (reason) => {
    isClientReady = false;
    isStarting = false;
    lastDisconnectReason = String(reason || '');
    updateState('disconnected');
    if (!allowAutoRestart) {
      return;
    }
    void restartClient(`Desconectado: ${reason}`);
  });

  currentClient.on('message', async (msg) => {
    console.log(`[whatsapp-bot] Mensagem recebida de ${msg.from}: "${msg.body?.substring(0, 50)}"`);
    if (msg.fromMe) return;
    if (!msg.from.endsWith('@c.us') && !msg.from.endsWith('@lid')) {
      console.log(`[whatsapp-bot] Ignorado (não é @c.us nem @lid): ${msg.from}`);
      return;
    }
    if (!msg.body || !msg.body.trim()) {
      console.log(`[whatsapp-bot] Ignorado (corpo vazio)`);
      return;
    }

    try {
      const contact = await msg.getContact();
      const phone = String(contact.number || '').trim();
      const name =
        String(contact.pushname || '').trim() ||
        String(contact.name || '').trim() ||
        `Lead ${phone}`;

      const response = await axios.post(
        `${API_URL}/api/integrations/whatsapp/lead`,
        {
          name,
          phone,
          message: msg.body.trim(),
        },
        {
          headers: {
            'x-bot-token': BOT_TOKEN,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const handledAsSurvey = response?.data?.handledAsSurvey === true;
      if (handledAsSurvey) {
        await randomDelay();
        await msg.reply(SURVEY_REPLY);
        return;
      }

      const hasActiveCard = response?.data?.hasActiveCard === true;
      if (hasActiveCard) {
        console.log(`[whatsapp-bot] Cliente ${phone} já possui card ativo. Nenhuma mensagem automática enviada.`);
        return;
      }

      const handledAsMenu = response?.data?.handledAsMenu === true;
      if (handledAsMenu) {
        await randomDelay();
        const interestType = response?.data?.interestType;
        if (interestType === 'PRODUCT') {
          await msg.reply(PRODUCT_CONFIRMATION);
        } else if (interestType === 'SERVICE') {
          await msg.reply(SERVICE_CONFIRMATION);
        } else if (interestType === 'BOLETO') {
          await msg.reply(BOLETO_CONFIRMATION);
        }
        menuSentPhones.delete(phone);
        return;
      }

      if (!menuSentPhones.has(phone)) {
        menuSentPhones.add(phone);
        await randomDelay();
        await msg.reply(MENU_MESSAGE);
        return;
      }

      await randomDelay();
      await msg.reply(DEFAULT_REPLY);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Erro no processamento da mensagem:', message);
    }
  });
}

async function destroyCurrentClient() {
  if (!client) return;
  try {
    await client.destroy();
  } catch {
  }
  client = null;
}

async function startClient(options = { forceRestart: false }) {
  if (isStarting) {
    return;
  }

  if (client && !options.forceRestart) {
    return;
  }

  if (options.forceRestart && client) {
    await destroyCurrentClient();
  }

  allowAutoRestart = true;
  isStarting = true;
  isClientReady = false;
  updateState('initializing');
  lastError = '';
  lastDisconnectReason = '';
  resetQr();

  client = createClient();
  registerHandlers(client);

  try {
    await client.initialize();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    isStarting = false;
    updateState('error');
    lastError = message;
    if (shouldRestart(message)) {
      await restartClient(message);
      return;
    }
  } finally {
    if (state !== 'ready') {
      isStarting = false;
    }
  }
}

function parseBody(bodyText) {
  try {
    return JSON.parse(bodyText);
  } catch {
    return null;
  }
}

async function sendOutboundMessage(payload) {
  const phone = String(payload?.phone ?? '').replace(/\D/g, '');
  const message = String(payload?.message ?? '').trim();

  if (!phone || !message) {
    return { ok: false, status: 400, body: { error: 'Invalid payload' } };
  }

  if (!client || !isClientReady) {
    return { ok: false, status: 503, body: { error: 'WhatsApp bot not ready' } };
  }

  await client.sendMessage(`${phone}@c.us`, message);
  return { ok: true, status: 200, body: { success: true } };
}

async function disconnectClient() {
  allowAutoRestart = false;
  restarting = false;
  isStarting = false;
  isClientReady = false;
  updateState('stopped');
  resetQr();
  lastDisconnectReason = 'Sessão encerrada manualmente';

  if (client) {
    try {
      await client.logout();
    } catch {
    }
  }

  await destroyCurrentClient();
  await clearSessionFiles();
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function unauthorized(res) {
  sendJson(res, 401, { error: 'Unauthorized' });
}

const server = createServer((req, res) => {
  const url = req.url || '/';

  const token = req.headers['x-bot-token'];
  if (typeof token !== 'string' || token.length !== BOT_TOKEN.length || !timingSafeEqual(Buffer.from(token), Buffer.from(BOT_TOKEN))) {
    unauthorized(res);
    return;
  }

  if (req.method === 'GET' && url === '/status') {
    sendJson(res, 200, buildStatus());
    return;
  }

  if (req.method === 'POST' && url === '/connect') {
    void startClient().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      updateState('error');
      lastError = message;
    });
    sendJson(res, 200, buildStatus());
    return;
  }

  if (req.method === 'POST' && url === '/reconnect') {
    void startClient({ forceRestart: true }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      updateState('error');
      lastError = message;
    });
    sendJson(res, 200, buildStatus());
    return;
  }

  if (req.method === 'POST' && url === '/disconnect') {
    void disconnectClient().then(() => sendJson(res, 200, buildStatus())).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      updateState('error');
      lastError = message;
      sendJson(res, 500, { error: message });
    });
    return;
  }

  if (req.method !== 'POST' || url !== '/send') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += String(chunk);
  });

  req.on('end', async () => {
    const payload = parseBody(rawBody);
    try {
      const result = await sendOutboundMessage(payload);
      sendJson(res, result.status, result.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendJson(res, 500, { error: message });
    }
  });
});

server.listen(BOT_PORT, () => {
  console.log(`Servidor local do bot ativo em http://127.0.0.1:${BOT_PORT}`);
});

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  if (!shouldRestart(message)) {
    console.error('Erro não tratado:', message);
    return;
  }
  void restartClient(message);
});

// Bot aguarda comando HTTP para iniciar (POST /connect)
