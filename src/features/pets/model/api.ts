/**
 * Camada de rede da feature `pets`. Toda chamada passa pelo `httpClient`
 * (Bearer + refresh automático) — NÃO usa `fetch` direto.
 * Backend responde no envelope `{ success, data }` (ApiResponse).
 *
 * `uploadImage` é replicado da feature `vet` de propósito: as features ficam
 * desacopladas (não importar entre si).
 */
import { api, httpClient } from '@/services/api'
import type { ApiResponse } from '@/types/auth'

import type { CreatePetPayload, Pet, PetUploadFolder, PickedImage } from './types'

/** Mimetype provável a partir da extensão do arquivo/uri. */
function guessMimeType(nameOrUri: string): string {
  const lower = nameOrUri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.heic')) return 'image/heic'
  return 'image/jpeg'
}

/**
 * Faz upload da foto do pet (`POST /uploads/image`, multipart) e retorna a URL
 * pública (Supabase Storage). O `httpClient` injeta o Bearer e, por não
 * definirmos `Content-Type`, o RN monta o boundary do multipart.
 */
export async function uploadImage(image: PickedImage, folder: PetUploadFolder): Promise<string> {
  const name = image.fileName ?? `${folder}.${guessMimeType(image.uri).split('/')[1]}`
  const type = image.mimeType ?? guessMimeType(name)

  const form = new FormData()
  // Formato de arquivo do React Native (uri/name/type) — não é um Blob real,
  // mas é o que o RN serializa no multipart. Cast só para satisfazer o TS.
  form.append('file', { uri: image.uri, name, type } as unknown as Blob)
  form.append('folder', folder)

  const res = await httpClient<ApiResponse<{ url: string }>>('/uploads/image/', {
    method: 'POST',
    body: form,
  })
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha no upload da foto')
  }
  return res.data.url
}

/** Cria um pet do usuário autenticado (`POST /pets`). */
export async function createPet(payload: CreatePetPayload): Promise<Pet> {
  const res = await api.post<ApiResponse<Pet>>('/pets/', payload)
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha ao cadastrar o pet')
  }
  return res.data
}

/** Lista os pets do usuário autenticado (`GET /pets`, `createdAt asc`). */
export async function listPets(): Promise<Pet[]> {
  const res = await api.get<ApiResponse<Pet[]>>('/pets/')
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha ao carregar seus pets')
  }
  return res.data
}
