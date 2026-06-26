/**
 * Camada de rede da feature `vet`. Toda chamada passa pelo `httpClient`
 * (Bearer + refresh automático) — NÃO usa `fetch` direto.
 * Backend responde no envelope `{ success, data }` (ApiResponse).
 */
import { api, httpClient } from '@/services/api'
import type { ApiResponse, User } from '@/types/auth'

import type { CreateVetProfilePayload, PickedImage, UploadFolder, VetProfile } from './types'

/** Mimetype provável a partir da extensão do arquivo/uri. */
function guessMimeType(nameOrUri: string): string {
  const lower = nameOrUri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.heic')) return 'image/heic'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  return 'image/jpeg'
}

/**
 * Faz upload de uma imagem/documento (`POST /uploads/image`, multipart) e
 * retorna a URL pública (Supabase Storage). O `httpClient` injeta o Bearer e,
 * por não definirmos `Content-Type`, o RN monta o boundary do multipart.
 */
export async function uploadImage(image: PickedImage, folder: UploadFolder): Promise<string> {
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
    throw new Error(res.error ?? 'Falha no upload do arquivo')
  }
  return res.data.url
}

/** Carrega o perfil do veterinário autenticado (`GET /profiles/vet/me`). */
export async function getMyVetProfile(): Promise<VetProfile> {
  const res = await api.get<ApiResponse<VetProfile>>('/profiles/vet/me/')
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha ao carregar o perfil profissional')
  }
  return res.data
}

/** Cria o perfil do veterinário (`POST /profiles/vet`). Verificação fica PENDING. */
export async function createVetProfile(payload: CreateVetProfilePayload): Promise<VetProfile> {
  const res = await api.post<ApiResponse<VetProfile>>('/profiles/vet/', payload)
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha ao criar o perfil profissional')
  }
  return res.data
}

/** Atualiza o perfil do veterinário (`PATCH /profiles/vet/me`). Campos parciais. */
export async function updateVetProfile(
  payload: Partial<CreateVetProfilePayload>
): Promise<VetProfile> {
  const res = await api.patch<ApiResponse<VetProfile>>('/profiles/vet/me/', payload)
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha ao atualizar o perfil profissional')
  }
  return res.data
}

/** Atualiza o nome do usuário autenticado (`PATCH /users/me`). */
export async function updateMyName(name: string): Promise<User> {
  const res = await api.patch<ApiResponse<User>>('/users/me/', { name })
  if (!res.success || !res.data) {
    throw new Error(res.error ?? 'Falha ao atualizar seus dados')
  }
  return res.data
}
