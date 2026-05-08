import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuração da URL base
// Utiliza variável de ambiente ou fallback para localhost
const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Criação da instância do Axios configurada
export const api = axios.create({
  baseURL,
});

/**
 * Interceptor de Request
 * Propósito: Injetar automaticamente o token de autenticação no cabeçalho 'Authorization'.
 * Busca o token do localStorage (chave 'virtual_games_token').
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('virtual_games_token');
    const mockRole = localStorage.getItem('virtual_games_role');
    
    if (token) {
      // Injeta o token Bearer se existir
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    if (mockRole) {
      config.headers.set('x-mock-role', mockRole);
    }
  }
  return config;
});

/**
 * Interceptor de Response
 * Propósito: Tratamento centralizado de erros.
 * Ação principal: Redirecionar para login e limpar sessão em caso de erro 401 (Unauthorized).
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const hasMockRole = Boolean(localStorage.getItem('virtual_games_role'));

      // Se receber 401 (Unauthorized), significa que o token expirou ou é inválido
      if (status === 401 && !hasMockRole) {
        localStorage.removeItem('virtual_games_token');
        window.location.href = '/login';
      }
    }
    
    // Propaga o erro para ser tratado localmente se necessário
    return Promise.reject(error);
  }
);
