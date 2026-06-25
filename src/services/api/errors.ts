/**
 * Classes de erro customizadas para o HTTP client
 * @module services/api/errors
 */

/**
 * Classe base para erros de API
 */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Lançado quando a requisição excede o tempo limite
 */
export class TimeoutError extends ApiError {
  constructor(message: string = 'Tempo limite excedido', status: number = 408) {
    super(message, status)
    this.name = 'TimeoutError'
  }
}

/**
 * Lançado quando ocorre erro de rede (sem conexão, falha DNS, etc.)
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Erro de conexão', status: number = 0) {
    super(message, status)
    this.name = 'NetworkError'
  }
}

/**
 * Lançado quando a autenticação falha (401 Unauthorized)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Sessão expirada', status: number = 401) {
    super(message, status)
    this.name = 'AuthenticationError'
  }
}
