/**
 * HTTP Client with timeout support and auth interceptor
 * @module services/api/httpClient
 */

import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { secureStorage } from '@/services/storage'
import { captureException } from '@/services/monitoring/sentry'

import type { ApiResponse, RefreshResponse, Tokens } from '@/types/auth'

import { ApiError, AuthenticationError, NetworkError, TimeoutError } from './errors'
import { notifyAuthFailure } from './authEvents'

// Convenção: URLs em `EXPO_PUBLIC_*_URL` SEM trailing slash. Normalizamos aqui
// pra blindar contra `.env` mal-configurado (com `/` no fim) — evita gerar
// `https://...com//api` em concatenações.
const stripTrailingSlash = (url: string) => url.replace(/\/+$/, '')
const ENV_API = stripTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL ?? '')
const ENV_WEB_AUTH = stripTrailingSlash(process.env.EXPO_PUBLIC_WEB_AUTH_URL ?? '')

/** Base do backend Django, com o prefixo fixo `/api` já concatenado. */
export const API_BASE_URL = `${ENV_API}/api`
/** Base do IdP / Cognito UI (sem prefixo). */
export const WEB_AUTH_BASE_URL = ENV_WEB_AUTH
const REQUEST_TIMEOUT = 30000 // 30 seconds
const APP_VERSION = Constants.expoConfig?.version || '1.0.0'
const USER_AGENT = `PetAgilApp/${APP_VERSION} (Expo)`

// Shared refresh promise to prevent concurrent refresh attempts
let refreshPromise: Promise<boolean> | null = null

/**
 * Attempt to refresh the access token using the stored refresh_token.
 * Returns true if refresh succeeded, false otherwise.
 * Concurrent 401s share one refresh call.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const tokens = await secureStorage.getTokens()
      if (!tokens?.refresh_token) {
        if (__DEV__) {
          console.warn('[httpClient] No refresh token available, skipping refresh')
        }
        return false
      }

      // Cognito App Client tem client secret, então o cognito-ui precisa do
      // id_token para extrair o username e computar o SECRET_HASH.
      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: tokens.refresh_token,
          id_token: tokens.id_token,
        }),
      })

      const data: ApiResponse<RefreshResponse> = await response.json()

      if (__DEV__) {
        console.log('[httpClient] Token refresh response:', { success: data.success })
      }

      if (data.success && data.data) {
        const newTokens: Tokens = {
          access_token: data.data.access_token,
          id_token: data.data.id_token,
          refresh_token: tokens.refresh_token,
          expires_in: data.data.expires_in,
        }
        await secureStorage.setTokens(newTokens)
        if (__DEV__) {
          console.log('[httpClient] Token refresh successful')
        }
        return true
      }

      return false
    } catch (error) {
      if (__DEV__) {
        console.error('[httpClient] Token refresh failed:', error)
      }
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export interface HttpClientOptions extends Omit<RequestInit, 'signal'> {
  timeout?: number
  skipAuth?: boolean
  /**
   * Suprime `console.error` para os status HTTP listados. O erro ainda é
   * lançado como `ApiError` — use para 4xx esperados (ex: 404 do endpoint de
   * cancelar stream quando o backend já marcou cancelled via cleanup do SSE).
   */
  silentStatuses?: number[]
}

/**
 * Generic HTTP client with timeout support via AbortController
 *
 * @param endpoint - API endpoint (relative or absolute URL)
 * @param options - Fetch options with optional timeout
 * @returns Promise with parsed JSON response
 * @throws {TimeoutError} When request exceeds timeout limit
 * @throws {NetworkError} When network error occurs
 * @throws {ApiError} When server returns non-2xx status
 */
export async function httpClient<T>(endpoint: string, options: HttpClientOptions = {}): Promise<T> {
  const { timeout = REQUEST_TIMEOUT, skipAuth = false, silentStatuses, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Add locale header for backend translation support
  try {
    const savedLocale = await AsyncStorage.getItem('petagil-locale')
    if (savedLocale) {
      headers['Accept-Language'] = savedLocale
    }
  } catch (error) {
    if (__DEV__) console.error('[httpClient] Failed to read locale:', error)
  }

  // Auth Interceptor - adds Bearer token unless skipAuth is true
  if (!skipAuth) {
    try {
      const accessToken = await secureStorage.getAccessToken()
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
    } catch (error) {
      // Log error but DON'T block the request
      // Request proceeds without Authorization header
      if (__DEV__) console.error('[httpClient] Failed to get access token:', error)
    }
  }

  try {
    if (__DEV__) {
      console.log('[httpClient] Request:', {
        method: fetchOptions.method || 'GET',
        url,
        body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined,
      })
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    // Handle 401 Unauthorized - attempt token refresh and retry once
    if (response.status === 401 && !skipAuth) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        // Retry the original request with the new token
        const newAccessToken = await secureStorage.getAccessToken()
        if (newAccessToken) {
          headers['Authorization'] = `Bearer ${newAccessToken}`
        }
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })
        if (retryResponse.ok) {
          if (retryResponse.status === 204) {
            return undefined as T
          }
          return retryResponse.json()
        }
        // Retry also failed — fall through to clear session
      }
      try {
        await secureStorage.clearSession()
      } catch (clearError) {
        if (__DEV__) console.error('[httpClient] Failed to clear session:', clearError)
      }
      notifyAuthFailure()
      throw new AuthenticationError('Sessão expirada', 401)
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '(failed to read body)')
      if (__DEV__ && !silentStatuses?.includes(response.status)) {
        console.error('[httpClient] HTTP Error:', {
          method: fetchOptions.method || 'GET',
          url,
          status: response.status,
          body: errorBody,
        })
      }
      // Tenta extrair detail do JSON de erro do backend. Formatos suportados:
      //   1) DRF padrão: { "detail": "..." }
      //   2) drf-standardized-errors: { "type": "validation_error", "errors": [{"detail": "..."}] }
      //      (usado pelo backend novo — erros de Lunella, validação, etc).
      let detail: string | undefined
      try {
        const parsed = JSON.parse(errorBody)
        if (typeof parsed.detail === 'string' && parsed.detail.length > 0) {
          detail = parsed.detail
        } else if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
          // Concatena os 2 primeiros (suficientes pra contexto, sem inflar toast).
          detail = parsed.errors
            .slice(0, 2)
            .map((e: { detail?: string }) => e?.detail)
            .filter((d: string | undefined): d is string => !!d)
            .join(' — ')
        }
      } catch { /* body não é JSON */ }
      throw new ApiError(detail || `HTTP ${response.status}`, response.status)
    }

    if (__DEV__) {
      console.log('[httpClient] Response OK:', {
        method: fetchOptions.method || 'GET',
        url,
        status: response.status,
      })
    }

    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`[httpClient] Unexpected Content-Type: ${contentType}`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // AbortError (timeout via AbortController). NÃO usar `instanceof DOMException`:
    // no Hermes (React Native) `DOMException` não é um global e o `instanceof`
    // lança ReferenceError, mascarando o erro real. Checamos pelo `name` (funciona
    // tanto p/ DOMException quanto p/ Error, em RN e no ambiente de teste).
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { name?: string }).name === 'AbortError'
    ) {
      throw new TimeoutError('Tempo limite excedido', 408)
    }

    if (error instanceof TypeError) {
      throw new NetworkError('Erro de conexão', 0)
    }

    // Erro inesperado — captura no Sentry (NetworkError e TimeoutError são esperados e não são capturados)
    captureException(error, { endpoint, method: options.method ?? 'GET' })
    throw new NetworkError('Erro desconhecido', 0)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Convenience methods for common HTTP verbs
 * Auto-handles JSON serialization for POST/PUT bodies
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: HttpClientOptions) =>
    httpClient<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request with auto JSON.stringify for body
   */
  post: <T>(endpoint: string, body?: unknown, options?: HttpClientOptions) =>
    httpClient<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT request with auto JSON.stringify for body
   */
  put: <T>(endpoint: string, body?: unknown, options?: HttpClientOptions) =>
    httpClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH request with auto JSON.stringify for body
   */
  patch: <T>(endpoint: string, body?: unknown, options?: HttpClientOptions) =>
    httpClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: HttpClientOptions) =>
    httpClient<T>(endpoint, { ...options, method: 'DELETE' }),
}
