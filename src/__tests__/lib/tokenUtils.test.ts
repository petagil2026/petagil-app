/**
 * Token Utilities Unit Tests
 *
 * Testa funções de decodificação e validação de JWT tokens.
 */

import { decodeToken, isTokenExpired, getUserFromIdToken } from '@/lib/tokenUtils'

// Helper para criar um JWT válido (apenas para testes)
function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'mock-signature'
  return `${header}.${body}.${signature}`
}

describe('tokenUtils', () => {
  describe('decodeToken', () => {
    it('deve decodificar um JWT válido', () => {
      const payload = { sub: 'user-123', email: 'test@test.com', exp: 1234567890 }
      const token = createMockJwt(payload)

      const result = decodeToken(token)

      expect(result).toEqual(payload)
    })

    it('deve retornar null para token com formato inválido (sem 3 partes)', () => {
      const invalidToken = 'invalid.token'

      const result = decodeToken(invalidToken)

      expect(result).toBeNull()
    })

    it('deve retornar null para token com payload base64 inválido', () => {
      const invalidToken = 'header.!!!invalid-base64!!!.signature'

      const result = decodeToken(invalidToken)

      expect(result).toBeNull()
    })

    it('deve retornar null para string vazia', () => {
      const result = decodeToken('')

      expect(result).toBeNull()
    })

    it('deve lidar com caracteres especiais no payload (base64url)', () => {
      // Base64url usa - e _ ao invés de + e /
      const payload = { sub: 'user/test+123', email: 'test@test.com' }
      const token = createMockJwt(payload)

      const result = decodeToken(token)

      expect(result?.sub).toBe('user/test+123')
    })
  })

  describe('isTokenExpired', () => {
    it('deve retornar false para token não expirado', () => {
      // Token expira em 1 hora
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJwt({ sub: 'user-123', exp: futureExp })

      const result = isTokenExpired(token)

      expect(result).toBe(false)
    })

    it('deve retornar true para token expirado', () => {
      // Token expirou há 1 hora
      const pastExp = Math.floor(Date.now() / 1000) - 3600
      const token = createMockJwt({ sub: 'user-123', exp: pastExp })

      const result = isTokenExpired(token)

      expect(result).toBe(true)
    })

    it('deve retornar true para token expirando dentro do buffer (30s default)', () => {
      // Token expira em 15 segundos (dentro do buffer de 30s)
      const almostExpired = Math.floor(Date.now() / 1000) + 15
      const token = createMockJwt({ sub: 'user-123', exp: almostExpired })

      const result = isTokenExpired(token)

      expect(result).toBe(true)
    })

    it('deve respeitar buffer customizado', () => {
      // Token expira em 45 segundos
      const exp = Math.floor(Date.now() / 1000) + 45
      const token = createMockJwt({ sub: 'user-123', exp })

      // Com buffer de 30s, não está expirado
      expect(isTokenExpired(token, 30)).toBe(false)

      // Com buffer de 60s, está expirado
      expect(isTokenExpired(token, 60)).toBe(true)
    })

    it('deve retornar true para token sem claim exp', () => {
      const token = createMockJwt({ sub: 'user-123' })

      const result = isTokenExpired(token)

      expect(result).toBe(true)
    })

    it('deve retornar true para token inválido', () => {
      const result = isTokenExpired('invalid-token')

      expect(result).toBe(true)
    })
  })

  describe('getUserFromIdToken', () => {
    it('deve extrair user de id_token com claims padrão', () => {
      const token = createMockJwt({
        sub: 'user-123',
        email: 'test@test.com',
        name: 'Test User',
      })

      const user = getUserFromIdToken(token)

      expect(user).toEqual({
        sub: 'user-123',
        email: 'test@test.com',
        name: 'Test User',
      })
    })

    it('deve usar cognito:username como fallback para email e name', () => {
      const token = createMockJwt({
        sub: 'user-123',
        'cognito:username': 'cognito-user',
      })

      const user = getUserFromIdToken(token)

      expect(user).toEqual({
        sub: 'user-123',
        email: 'cognito-user',
        name: 'cognito-user',
      })
    })

    it('deve priorizar email/name sobre cognito:username', () => {
      const token = createMockJwt({
        sub: 'user-123',
        email: 'real@email.com',
        name: 'Real Name',
        'cognito:username': 'cognito-user',
      })

      const user = getUserFromIdToken(token)

      expect(user).toEqual({
        sub: 'user-123',
        email: 'real@email.com',
        name: 'Real Name',
      })
    })

    it('deve retornar null para token sem sub', () => {
      const token = createMockJwt({
        email: 'test@test.com',
      })

      const user = getUserFromIdToken(token)

      expect(user).toBeNull()
    })

    it('deve retornar null para token inválido', () => {
      const user = getUserFromIdToken('invalid-token')

      expect(user).toBeNull()
    })

    it('deve lidar com email e name null', () => {
      const token = createMockJwt({
        sub: 'user-123',
      })

      const user = getUserFromIdToken(token)

      expect(user).toEqual({
        sub: 'user-123',
        email: null,
        name: null,
      })
    })
  })
})
