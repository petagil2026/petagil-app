/**
 * useVetOnboarding — orquestra o envio do perfil do veterinário:
 *   1. sobe a foto e a carteira do CRMV (quando houver), em paralelo;
 *   2. cria o perfil (`POST /profiles/vet`);
 *   3. atualiza o nome do usuário se ele foi editado nesta tela.
 *
 * Pré-requisito: a conta já foi criada (tokens em SecureStore) na etapa de
 * seleção de papel — por isso as chamadas vão autenticadas.
 */
import { useMutation } from '@tanstack/react-query'

import type { User } from '@/types/auth'

import { createVetProfile, uploadImage } from '../model'
import type { CreateVetProfilePayload, PickedImage, VetProfile } from '../model'

export interface VetOnboardingInput {
  /** Usuário atual (para devolver ao `completeOnboarding`). O nome vem da conta. */
  currentUser: User
  photo?: PickedImage | null
  crmvDoc?: PickedImage | null
  /** Campos do perfil, sem as URLs (que vêm dos uploads). */
  profile: Omit<CreateVetProfilePayload, 'photoUrl' | 'crmvDocUrl'>
}

export interface VetOnboardingResult {
  profile: VetProfile
  user: User
}

export function useVetOnboarding() {
  return useMutation<VetOnboardingResult, Error, VetOnboardingInput>({
    mutationFn: async ({ currentUser, photo, crmvDoc, profile }) => {
      const [photoUrl, crmvDocUrl] = await Promise.all([
        photo ? uploadImage(photo, 'vet-photos') : Promise.resolve(undefined),
        crmvDoc ? uploadImage(crmvDoc, 'crmv-docs') : Promise.resolve(undefined),
      ])

      const created = await createVetProfile({ ...profile, photoUrl, crmvDocUrl })

      return { profile: created, user: currentUser }
    },
    retry: false,
  })
}
