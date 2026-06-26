/**
 * useUpdateVetProfile — salva a edição do perfil do veterinário:
 *   1. sobe nova foto/carteira (quando trocadas), em paralelo;
 *   2. faz `PATCH /profiles/vet/me` com os campos + URLs novas;
 *   3. invalida o cache do perfil para a tela recarregar.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateVetProfile, uploadImage } from '../model'
import type { PickedImage, VetProfile } from '../model'
import type { VetProfileFormValues } from '../view'
import { vetProfileKeys } from './useMyVetProfile'

export interface UpdateVetProfileInput {
  values: VetProfileFormValues
  photo?: PickedImage | null
  crmvDoc?: PickedImage | null
}

export function useUpdateVetProfile() {
  const queryClient = useQueryClient()

  return useMutation<VetProfile, Error, UpdateVetProfileInput>({
    mutationFn: async ({ values, photo, crmvDoc }) => {
      const [photoUrl, crmvDocUrl] = await Promise.all([
        photo ? uploadImage(photo, 'vet-photos') : Promise.resolve(undefined),
        crmvDoc ? uploadImage(crmvDoc, 'crmv-docs') : Promise.resolve(undefined),
      ])
      return updateVetProfile({
        ...values,
        ...(photoUrl ? { photoUrl } : {}),
        ...(crmvDocUrl ? { crmvDocUrl } : {}),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vetProfileKeys.me })
    },
    retry: false,
  })
}
