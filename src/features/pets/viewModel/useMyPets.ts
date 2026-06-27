/**
 * useMyPets — carrega os pets do usuário autenticado (React Query).
 * `queryKey` padronizada via factory (`petsKeys`).
 *
 * `staleTime: Infinity` evita refetch churn: serve só como gate de "tem pet?"
 * no boot do tutor (a transição para as tabs é por flag persistida, não por
 * refetch). Em RQ v5, uma query que já tem dados não vira `status:'error'` num
 * refetch de fundo — não expulsa o tutor das tabs no meio da sessão.
 */
import { useQuery } from '@tanstack/react-query'

import { listPets } from '../model'

export const petsKeys = {
  list: ['pets', 'list'] as const,
}

export interface UseMyPetsOptions {
  /** Liga a query só quando precisamos consultar a rede (flag `has-pet` desconhecida). */
  enabled?: boolean
}

export function useMyPets(opts?: UseMyPetsOptions) {
  return useQuery({
    queryKey: petsKeys.list,
    queryFn: listPets,
    staleTime: Infinity,
    enabled: opts?.enabled,
  })
}
