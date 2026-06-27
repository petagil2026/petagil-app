/**
 * useCreatePet — cria um pet (React Query mutation):
 *   1. se houver foto, sobe a imagem (`POST /uploads/image`, pasta `pet-photos`);
 *   2. cria o pet (`POST /pets`) com o `photoUrl` resultante (ou sem ele).
 *
 * Pré-requisito: o tutor já está autenticado (tokens em SecureStore) — as
 * chamadas vão autenticadas. `retry: false` para não duplicar o `POST /pets`.
 */
import { useMutation } from '@tanstack/react-query'

import { createPet, uploadImage } from '../model'
import type { CreatePetPayload, Pet, PickedImage } from '../model'

export interface CreatePetInput {
  /** Campos do pet, sem a `photoUrl` (que vem do upload). */
  payload: Omit<CreatePetPayload, 'photoUrl'>
  /** Foto escolhida (opcional). */
  photo?: PickedImage | null
}

export function useCreatePet() {
  return useMutation<Pet, Error, CreatePetInput>({
    mutationFn: async ({ payload, photo }) => {
      const photoUrl = photo ? await uploadImage(photo, 'pet-photos') : undefined
      return createPet({ ...payload, photoUrl })
    },
    retry: false,
  })
}
