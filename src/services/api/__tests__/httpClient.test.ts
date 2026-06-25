/**
 * Testes unitários para httpClient
 * @module services/api/__tests__/httpClient.test
 */

import * as SecureStore from 'expo-secure-store'

import { api, httpClient } from '../httpClient'
import { ApiError, AuthenticationError, NetworkError, TimeoutError } from '../errors'

// Type for mocked fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('httpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('request básico', () => {
    it('deve fazer GET request com URL relativa', async () => {
      const mockResponse = { data: 'test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await httpClient('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('deve fazer request com URL absoluta', async () => {
      const absoluteUrl = 'https://external-api.com/data'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      } as Response)

      await httpClient(absoluteUrl)

      expect(mockFetch).toHaveBeenCalledWith(
        absoluteUrl,
        expect.any(Object)
      )
    })

    it('deve retornar undefined para response 204', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as Response)

      const result = await httpClient('/resource')

      expect(result).toBeUndefined()
    })
  })

  describe('timeout', () => {
    it('deve lançar TimeoutError quando request excede timeout', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new DOMException('Aborted', 'AbortError')
              reject(error)
            }, 100)
          })
      )

      await expect(httpClient('/slow', { timeout: 50 })).rejects.toThrow(TimeoutError)
    })

    it('deve usar timeout padrão de 30s', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      } as Response)

      await httpClient('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      )
    })
  })

  describe('auth interceptor', () => {
    it('deve adicionar Authorization header quando accessToken existe', async () => {
      const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token'
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockAccessToken)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      } as Response)

      await httpClient('/protected')

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('petagil_access_token')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      )
    })

    it('deve pular Authorization header quando skipAuth=true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      } as Response)

      await httpClient('/public', { skipAuth: true })

      expect(SecureStore.getItemAsync).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      )
    })

    it('deve continuar sem Authorization quando getAccessToken falha', async () => {
      ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'))

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      } as Response)

      // Não deve lançar erro
      await expect(httpClient('/endpoint')).resolves.toBeDefined()
    })
  })

  describe('tratamento de erros', () => {
    it('deve lançar AuthenticationError e limpar sessão no 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as Response)

      await expect(httpClient('/protected')).rejects.toThrow(AuthenticationError)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled()
    })

    it('deve lançar ApiError para outros erros HTTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
      } as Response)

      await expect(httpClient('/error')).rejects.toThrow(ApiError)
    })

    it('deve lançar NetworkError para TypeError (falha de rede)', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await expect(httpClient('/offline')).rejects.toThrow(NetworkError)
    })

    it('deve logar warning quando Content-Type não é application/json', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        json: () => Promise.resolve({}),
      } as Response)

      await httpClient('/html')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected Content-Type')
      )

      consoleSpy.mockRestore()
    })
  })
})

describe('api convenience methods', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true }),
    } as Response)
  })

  describe('api.get', () => {
    it('deve fazer GET request', async () => {
      await api.get('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    it('deve suportar skipAuth', async () => {
      await api.get('/public', { skipAuth: true })

      expect(SecureStore.getItemAsync).not.toHaveBeenCalled()
    })
  })

  describe('api.post', () => {
    it('deve fazer POST request com body JSON', async () => {
      const body = { email: 'test@example.com', password: '123456' }

      await api.post('/login', body)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('deve suportar skipAuth para login', async () => {
      await api.post('/auth/login', { email: 'test@test.com' }, { skipAuth: true })

      expect(SecureStore.getItemAsync).not.toHaveBeenCalled()
    })
  })

  describe('api.put', () => {
    it('deve fazer PUT request com body JSON', async () => {
      const body = { name: 'Updated Name' }

      await api.put('/users/123', body)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  describe('api.delete', () => {
    it('deve fazer DELETE request', async () => {
      await api.delete('/users/123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })
})

describe('error classes', () => {
  it('ApiError deve ter status e message', () => {
    const error = new ApiError('Erro teste', 500)

    expect(error.message).toBe('Erro teste')
    expect(error.status).toBe(500)
    expect(error.name).toBe('ApiError')
    expect(error instanceof Error).toBe(true)
  })

  it('TimeoutError deve ter defaults em português', () => {
    const error = new TimeoutError()

    expect(error.message).toBe('Tempo limite excedido')
    expect(error.status).toBe(408)
    expect(error.name).toBe('TimeoutError')
    expect(error instanceof ApiError).toBe(true)
  })

  it('NetworkError deve ter defaults em português', () => {
    const error = new NetworkError()

    expect(error.message).toBe('Erro de conexão')
    expect(error.status).toBe(0)
    expect(error.name).toBe('NetworkError')
    expect(error instanceof ApiError).toBe(true)
  })

  it('AuthenticationError deve ter defaults em português', () => {
    const error = new AuthenticationError()

    expect(error.message).toBe('Sessão expirada')
    expect(error.status).toBe(401)
    expect(error.name).toBe('AuthenticationError')
    expect(error instanceof ApiError).toBe(true)
  })
})
