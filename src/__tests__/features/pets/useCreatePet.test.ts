/**
 * Testes do `useCreatePet`: orquestração upload → createPet.
 * Mocka a camada de model (`uploadImage`/`createPet`) e usa um QueryClient novo.
 */
import React, { type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreatePet } from '@/features/pets'

const mockUploadImage = jest.fn()
const mockCreatePet = jest.fn()

jest.mock('@/features/pets/model', () => ({
  uploadImage: (...args: unknown[]) => mockUploadImage(...args),
  createPet: (...args: unknown[]) => mockCreatePet(...args),
}))

const PET = {
  id: 'p1',
  ownerId: 'u1',
  name: 'Rex',
  species: 'dog',
  breed: null,
  ageYears: null,
  photoUrl: null,
  createdAt: '2026-06-26T00:00:00.000Z',
  updatedAt: '2026-06-26T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCreatePet', () => {
  it('sem foto: não chama uploadImage e cria o pet com photoUrl undefined', async () => {
    mockCreatePet.mockResolvedValueOnce(PET)
    const { result } = renderHook(() => useCreatePet(), { wrapper: createWrapper() })

    result.current.mutate({ payload: { name: 'Rex', species: 'dog' }, photo: null })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUploadImage).not.toHaveBeenCalled()
    expect(mockCreatePet).toHaveBeenCalledWith({
      name: 'Rex',
      species: 'dog',
      photoUrl: undefined,
    })
  })

  it('com foto: sobe a imagem antes e injeta o photoUrl no createPet', async () => {
    mockUploadImage.mockResolvedValueOnce('https://cdn/pet.jpg')
    mockCreatePet.mockResolvedValueOnce(PET)
    const { result } = renderHook(() => useCreatePet(), { wrapper: createWrapper() })

    const photo = { uri: 'file:///rex.jpg' }
    result.current.mutate({ payload: { name: 'Rex', species: 'dog' }, photo })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockUploadImage).toHaveBeenCalledWith(photo, 'pet-photos')
    expect(mockCreatePet).toHaveBeenCalledWith({
      name: 'Rex',
      species: 'dog',
      photoUrl: 'https://cdn/pet.jpg',
    })
  })

  it('propaga erro quando createPet falha', async () => {
    mockCreatePet.mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() => useCreatePet(), { wrapper: createWrapper() })

    result.current.mutate({ payload: { name: 'Rex', species: 'dog' }, photo: null })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('boom')
  })
})
