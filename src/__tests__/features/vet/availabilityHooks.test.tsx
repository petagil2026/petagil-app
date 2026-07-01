import React, { type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  useCreateTimeOff,
  useDeleteTimeOff,
  useSaveVetAvailability,
  useVetAvailability,
  useVetTimeOff,
} from '@/features/vet/viewModel'
import { api } from '@/services/api'

jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
  httpClient: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('viewModels de disponibilidade/folgas', () => {
  it('useVetAvailability carrega os dados', async () => {
    const data = { weekdays: [0], slotDurationMin: 30, periods: [] }
    mockApi.get.mockResolvedValue({ success: true, data })
    const { result } = renderHook(() => useVetAvailability(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(data)
  })

  it('useSaveVetAvailability dispara o PUT', async () => {
    const payload = { weekdays: [0], slotDurationMin: 30, periods: [] }
    mockApi.put.mockResolvedValue({ success: true, data: payload })
    const { result } = renderHook(() => useSaveVetAvailability(), { wrapper })
    result.current.mutate(payload)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.put).toHaveBeenCalled()
  })

  it('useVetTimeOff lista as folgas', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [{ id: 'to-1' }] })
    const { result } = renderHook(() => useVetTimeOff(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('useCreateTimeOff dispara o POST', async () => {
    mockApi.post.mockResolvedValue({ success: true, data: { id: 'to-1' } })
    const { result } = renderHook(() => useCreateTimeOff(), { wrapper })
    result.current.mutate({ startsAt: 'a', endsAt: 'b' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalled()
  })

  it('useDeleteTimeOff dispara o DELETE', async () => {
    mockApi.delete.mockResolvedValue({ success: true, data: { ok: true } })
    const { result } = renderHook(() => useDeleteTimeOff(), { wrapper })
    result.current.mutate('to-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.delete).toHaveBeenCalledWith('/profiles/vet/me/timeoff/to-1/')
  })
})
