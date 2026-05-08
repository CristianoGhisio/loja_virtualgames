type CosmosBrand = {
  name?: string;
  picture?: string;
};

type CosmosNcm = {
  code?: string;
  description?: string;
  full_description?: string;
};

type CosmosGpc = {
  code?: string;
  description?: string;
};

export type CosmosGtinResponse = {
  gtin?: string | number;
  description?: string;
  brand?: CosmosBrand;
  ncm?: CosmosNcm;
  gpc?: CosmosGpc;
  thumbnail?: string;
  height?: number | null;
  width?: number | null;
  length?: number | null;
  gross_weight?: number | null;
  net_weight?: number | null;
  avg_price?: number | null;
  max_price?: number | null;
  min_price?: number | null;
  price?: string | null;
};

function normalizeBarcode(barcode: string): string {
  return barcode.replace(/\D/g, '');
}

function validateGtinCheckDigit(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  const body = digits.slice(0, -1);
  const checkDigit = Number(digits.slice(-1));
  let sum = 0;
  let multiplier = 3;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    // eslint-disable-next-line security/detect-object-injection
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 3 ? 1 : 3;
  }
  const calculated = (10 - (sum % 10)) % 10;
  return calculated === checkDigit;
}

export function validateAndNormalizeGtin(barcode: string): string {
  const normalized = normalizeBarcode(barcode);
  const validLength = [8, 12, 13, 14].includes(normalized.length);
  if (!validLength) {
    throw new Error('GTIN inválido');
  }
  if (!validateGtinCheckDigit(normalized)) {
    throw new Error('GTIN inválido');
  }
  return normalized;
}

export class CosmosService {
  static getConfig() {
    const baseUrl = process.env.COSMOS_BASE_URL || 'https://api.cosmos.bluesoft.com.br';
    const token = process.env.COSMOS_TOKEN;
    const userAgent = process.env.COSMOS_USER_AGENT || 'Cosmos-API-Request';
    const timeoutMs = Number(process.env.COSMOS_TIMEOUT_MS || 8000);

    if (!token) {
      throw new Error('COSMOS_TOKEN não configurado');
    }
    return { baseUrl, token, userAgent, timeoutMs };
  }

  static async getByGtin(barcode: string): Promise<CosmosGtinResponse> {
    const gtin = validateAndNormalizeGtin(barcode);
    const { baseUrl, token, userAgent, timeoutMs } = this.getConfig();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/gtins/${gtin}.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Cosmos-Token': token,
          'User-Agent': userAgent,
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      if (response.status === 404) throw new Error('Produto não encontrado na Cosmos');
      if (response.status === 401 || response.status === 403) throw new Error('Falha de autenticação com a Cosmos');
      if (response.status === 429) throw new Error('Limite de requisições atingido');
      if (!response.ok) throw new Error(`Erro na Cosmos (${response.status})`);

      const data = (await response.json()) as CosmosGtinResponse | { message?: string };
      if ('message' in data && typeof data.message === 'string' && data.message.length > 0) {
        throw new Error(data.message);
      }
      return data as CosmosGtinResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Tempo esgotado para consultar Cosmos');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

