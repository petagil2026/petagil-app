/**
 * useVetTimeOff — lista/cria/remove folgas & bloqueios do vet.
 * `queryKey` padronizada via factory (`vetTimeOffKeys`). Mutations invalidam a lista.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createTimeOff, deleteTimeOff, listTimeOff } from '../model'
import type { CreateVetTimeOffPayload, VetTimeOff } from '../model'

export const vetTimeOffKeys = {
  all: ['vetTimeOff'] as const,
  list: ['vetTimeOff', 'list'] as const,
}

export function useVetTimeOff() {
  return useQuery({
    queryKey: vetTimeOffKeys.list,
    queryFn: listTimeOff,
  })
}

export function useCreateTimeOff() {
  const queryClient = useQueryClient()

  return useMutation<VetTimeOff, Error, CreateVetTimeOffPayload>({
    mutationFn: createTimeOff,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vetTimeOffKeys.list })
    },
    retry: false,
  })
}

export function useDeleteTimeOff() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteTimeOff,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vetTimeOffKeys.list })
    },
    retry: false,
  })
}
