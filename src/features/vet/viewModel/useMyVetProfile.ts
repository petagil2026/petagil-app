/**
 * useMyVetProfile — carrega o perfil do veterinário autenticado (React Query).
 * `queryKey` padronizada via factory (`vetProfileKeys`).
 */
import { useQuery } from '@tanstack/react-query'

import { getMyVetProfile } from '../model'

export const vetProfileKeys = {
  all: ['vetProfile'] as const,
  me: ['vetProfile', 'me'] as const,
}

export function useMyVetProfile() {
  return useQuery({
    queryKey: vetProfileKeys.me,
    queryFn: getMyVetProfile,
  })
}
