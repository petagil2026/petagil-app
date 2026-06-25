/**
 * Auth event bridge - permite que o httpClient notifique o AuthProvider
 * sobre falhas de autenticação sem acoplamento direto.
 * @module services/api/authEvents
 */

type AuthFailureCallback = () => void

let onAuthFailureCallback: AuthFailureCallback | null = null

/**
 * Registra o callback que será chamado quando a sessão expirar.
 * Deve ser chamado pelo AuthProvider no mount.
 */
export function setOnAuthFailure(callback: AuthFailureCallback | null): void {
  onAuthFailureCallback = callback
}

/**
 * Notifica que houve falha de autenticação irrecuperável (401 após refresh falho).
 * Chamado pelo httpClient.
 */
export function notifyAuthFailure(): void {
  onAuthFailureCallback?.()
}
