/**
 * Authentication Types
 * Alinhado com: hashtag-web/src/lib/tokenUtils.ts e hashtag-web/src/contexts/AuthContext.tsx
 */

/**
 * Papel do usuário no PetÁgil: tutor (dono do pet) ou veterinário.
 */
export type Role = 'tutor' | 'vet'

/**
 * User type aligned with Cognito ID token claims
 * Backend retorna 'sub' como ID (padrão OAuth/Cognito).
 * Estendido com o mínimo do domínio PetÁgil (id, role) para a fundação mockada.
 */
export interface User {
  sub: string
  /** Alias de domínio para `sub` (id do usuário). */
  id?: string
  email: string | null
  name: string | null
  email_verified?: boolean
  /** Papel selecionado no app (tutor/vet). */
  role?: Role
}

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  error: string | null
}

/**
 * JWT Tokens from Cognito OAuth flow
 * Alinhado com hashtag-web/src/lib/tokenUtils.ts
 */
export interface Tokens {
  access_token: string
  id_token: string
  refresh_token: string
  expires_in?: number
}

/**
 * Decoded JWT token payload
 */
export interface TokenPayload {
  sub?: string
  email?: string
  name?: string
  exp?: number
  iat?: number
  iss?: string
  aud?: string | string[]
  'cognito:username'?: string
  [key: string]: unknown
}

/**
 * API Response wrapper - padrão do backend
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  error_description?: string
}

/**
 * Login endpoint response
 * GET /api/auth/login/
 */
export interface LoginResponse {
  authorization_url: string
}

/**
 * Callback endpoint response
 * GET /api/auth/callback/?code=xxx
 */
export interface CallbackResponse {
  access_token: string
  id_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/**
 * Refresh endpoint response
 * POST /api/auth/refresh/
 */
export interface RefreshResponse {
  access_token: string
  id_token: string
  expires_in: number
}

/**
 * Logout endpoint response
 * POST /api/auth/logout/
 */
export interface LogoutResponse {
  logout_url: string
}
