/**
 * useVetAvailability — carrega/salva a disponibilidade recorrente do vet.
 * `queryKey` padronizada via factory (`vetAvailabilityKeys`).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getMyAvailability, saveMyAvailability } from '../model'
import type { UpsertVetAvailabilityPayload, VetAvailability } from '../model'

export const vetAvailabilityKeys = {
  all: ['vetAvailability'] as const,
  me: ['vetAvailability', 'me'] as const,
}

export function useVetAvailability() {
  return useQuery({
    queryKey: vetAvailabilityKeys.me,
    queryFn: getMyAvailability,
  })
}

export function useSaveVetAvailability() {
  const queryClient = useQueryClient()

  return useMutation<VetAvailability, Error, UpsertVetAvailabilityPayload>({
    mutationFn: saveMyAvailability,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vetAvailabilityKeys.me })
    },
    retry: false,
  })
}
