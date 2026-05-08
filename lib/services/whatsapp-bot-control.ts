import { ChildProcess, spawn } from 'node:child_process';
import { join } from 'node:path';

type BotLifecycleState = 'stopped' | 'initializing' | 'qr' | 'ready' | 'disconnected' | 'error';

type BotStatusPayload = {
  state: BotLifecycleState;
  isReady: boolean;
  restarting: boolean;
  lastQr: string;
  lastQrAscii: string;
  lastError: string;
  lastDisconnectReason: string;
};

type BotAction = 'connect' | 'reconnect' | 'disconnect';

type GlobalWhatsAppBotProcess = {
  process: ChildProcess | null;
};

const BOT_BASE_URL = process.env.WHATSAPP_BOT_BASE_URL || 'http://127.0.0.1:3333';
const BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN || '';
const SCRIPT_PATH = join(process.cwd(), 'automation', 'whatsapp-bot.mjs');

const globalScope = globalThis as typeof globalThis & {
  __whatsappBotProcess?: GlobalWhatsAppBotProcess;
};

const processState =
  globalScope.__whatsappBotProcess ||
  (globalScope.__whatsappBotProcess = {
    process: null,
  });

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-bot-token': BOT_TOKEN,
  };
}

function normalizeStatus(raw?: Partial<BotStatusPayload>) {
  return {
    processRunning: processState.process !== null || Boolean(raw),
    state: raw?.state ?? 'stopped',
    isReady: raw?.isReady ?? false,
    restarting: raw?.restarting ?? false,
    lastQr: raw?.lastQr ?? '',
    lastQrAscii: raw?.lastQrAscii ?? '',
    lastError: raw?.lastError ?? '',
    lastDisconnectReason: raw?.lastDisconnectReason ?? '',
  };
}

function spawnBotProcess() {
  if (processState.process) return;

  const child = spawn(process.execPath, [SCRIPT_PATH], {
    cwd: process.cwd(),
    env: {
      // Only pass environment variables the bot actually needs
      NODE_ENV: process.env.NODE_ENV,
      PATH: process.env.PATH,
      WHATSAPP_BOT_TOKEN: process.env.WHATSAPP_BOT_TOKEN || '',
      WHATSAPP_BOT_BASE_URL: process.env.WHATSAPP_BOT_BASE_URL || '',
      WHATSAPP_BOT_URL: process.env.WHATSAPP_BOT_URL || '',
      INTERNAL_API_URL: process.env.INTERNAL_API_URL || '',
    },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  processState.process = child;

  child.stdout?.on('data', (chunk: Buffer) => {
    const line = String(chunk).trim();
    if (!line) return;
    console.log(`[whatsapp-bot] ${line}`);
  });

  child.stderr?.on('data', (chunk: Buffer) => {
    const line = String(chunk).trim();
    if (!line) return;
    console.error(`[whatsapp-bot] ${line}`);
  });

  child.on('exit', () => {
    processState.process = null;
  });
}

async function fetchBot(path: string, init?: RequestInit) {
  if (!BOT_TOKEN) {
    throw new Error('WHATSAPP_BOT_TOKEN não configurado');
  }

  return fetch(`${BOT_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(),
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(8000),
  });
}

async function waitForBot() {
  const attempts = 30;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetchBot('/status', { method: 'GET' });
      if (response.ok) return;
    } catch {
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export async function getWhatsappStatus() {
  if (!processState.process) {
    try {
      const response = await fetchBot('/status', { method: 'GET' });
      if (!response.ok) {
        return normalizeStatus();
      }
      const data = (await response.json()) as BotStatusPayload;
      return normalizeStatus(data);
    } catch {
      return normalizeStatus();
    }
  }

  try {
    const response = await fetchBot('/status', { method: 'GET' });
    if (!response.ok) return normalizeStatus();
    const data = (await response.json()) as BotStatusPayload;
    return normalizeStatus(data);
  } catch {
    return normalizeStatus();
  }
}

export async function executeWhatsappAction(action: BotAction) {
  spawnBotProcess();
  await waitForBot();

  let response: Response;
  try {
    response = await fetchBot(`/${action}`, {
      method: 'POST',
    });
  } catch {
    throw new Error('Serviço do WhatsApp indisponível no momento');
  }

  if (!response.ok) {
    throw new Error('Falha ao executar comando do WhatsApp');
  }

  const data = (await response.json()) as BotStatusPayload;
  return normalizeStatus(data);
}
