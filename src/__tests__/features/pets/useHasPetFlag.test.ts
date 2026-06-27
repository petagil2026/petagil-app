/**
 * Testes do `useHasPetFlag`: leitura/escrita do flag `petagil-has-pet:<userId>`
 * em AsyncStorage. Usa um store mutável em memória (funções comuns, não
 * jest.fn — sobrevivem ao `resetMocks` do jest.config).
 */
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useHasPetFlag } from '@/features/pets'

const mockStore: Record<string, string> = {}

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: (key: string) => Promise.resolve(mockStore[key] ?? null),
    setItem: (key: string, value: string) => {
      mockStore[key] = value
      return Promise.resolve()
    },
    removeItem: (key: string) => {
      delete mockStore[key]
      return Promise.resolve()
    },
  },
}))

beforeEach(() => {
  for (const key of Object.keys(mockStore)) delete mockStore[key]
})

describe('useHasPetFlag', () => {
  it('sem flag salvo → status unknown', async () => {
    const { result } = renderHook(() => useHasPetFlag('u1'))
    await waitFor(() => expect(result.current.status).toBe('unknown'))
  })

  it('flag "true" salvo → status has', async () => {
    mockStore['petagil-has-pet:u1'] = 'true'
    const { result } = renderHook(() => useHasPetFlag('u1'))
    await waitFor(() => expect(result.current.status).toBe('has'))
  })

  it('markHasPet grava no storage e vira has', async () => {
    const { result } = renderHook(() => useHasPetFlag('u1'))
    await waitFor(() => expect(result.current.status).toBe('unknown'))

    act(() => result.current.markHasPet())

    expect(result.current.status).toBe('has')
    expect(mockStore['petagil-has-pet:u1']).toBe('true')
  })

  it('sem userId → status unknown (sem chave de storage)', async () => {
    const { result } = renderHook(() => useHasPetFlag(undefined))
    await waitFor(() => expect(result.current.status).toBe('unknown'))
  })

  it('troca de userId relê o flag do novo usuário', async () => {
    mockStore['petagil-has-pet:u2'] = 'true'
    const { result, rerender } = renderHook(({ id }: { id: string }) => useHasPetFlag(id), {
      initialProps: { id: 'u1' },
    })
    await waitFor(() => expect(result.current.status).toBe('unknown'))

    rerender({ id: 'u2' })
    await waitFor(() => expect(result.current.status).toBe('has'))
  })
})
