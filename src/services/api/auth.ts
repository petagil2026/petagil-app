/**
 * Auth API service — fala com o backend NestJS (`/api/auth/*`).
 *
 * Usa o `httpClient` (que injeta o Bearer e faz refresh automático no 401).
 * NÃO faz `fetch` direto. As rotas usam barra final (`/auth/login/`) — o backend
 * normaliza, e mantém a convenção do app (`httpClient` já chama `/auth/refresh/`).
 * @module services/api/auth
 */

import type { ApiResponse, Tokens, User } from '@/types/auth'

import { api } from './httpClient'

/** Payload de `register`/`login` retornado pelo backend (dentro de `data`). */
interface AuthData {
  access_token: string
  id_token: string
  refresh_token: string
  expires_in: number
  user: User
}

export interface AuthResult {
  tokens: Tokens
  user: User
}

function toAuthResult(data: AuthData): AuthResult {
  return {
    tokens: {
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    },
    user: data.user,
  }
}

/** Autentica por email/senha. Lança `ApiError` (ex.: 401) em caso de falha. */
export async function loginRequest(email: string, password: string): Promise<AuthResult> {
  const res = await api.post<ApiResponse<AuthData>>(
    '/auth/login/',
    { email, password },
    { skipAuth: true }
  )
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha no login')
  }
  return toAuthResult(res.data)
}

/** Dados aceitos no cadastro de conta ("Crie sua conta"). */
export interface RegisterInput {
  name: string
  email: string
  password: string
  role: 'tutor' | 'vet' | 'passeador'
  /** Celular/WhatsApp (opcional no backend; o formulário sempre envia). */
  phone?: string
  /** Cidade (opcional no backend; o formulário sempre envia). */
  city?: string
}

/** Cria conta + autentica. Retorna tokens + user (já com o papel do servidor). */
export async function registerRequest(input: RegisterInput): Promise<AuthResult> {
  const res = await api.post<ApiResponse<AuthData>>('/auth/register/', input, { skipAuth: true })
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha no cadastro')
  }
  return toAuthResult(res.data)
}

/** Usuário autenticado (fonte da verdade do servidor). */
export async function fetchMe(): Promise<User> {
  const res = await api.get<ApiResponse<User>>('/auth/me/')
  if (!res.success || !res.data) {
    throw new Error('Falha ao carregar o usuário')
  }
  return res.data
}

/** Logout — stateless no servidor; best-effort (ignora erro de rede). */
export async function logoutRequest(): Promise<void> {
  try {
    await api.post('/auth/logout/', {})
  } catch {
    // o cliente descarta os tokens de qualquer forma
  }
}
