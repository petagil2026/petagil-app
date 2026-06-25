/**
 * useUserProfileQuery
 * Fetches user profile from GET /auth/me/
 * Returns the authoritative name/email from the backend (not JWT claims).
 * Aligned with hashtag-web/src/features/auth/viewModel/queries/useUserProfileQuery.ts
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/providers/AuthProvider'
import { api } from '@/services/api/httpClient'

interface ApiMeResponse {
  success: boolean
  data: {
    sub: string
    email: string
    name: string
  }
}

export interface UserProfile {
  sub: string
  email: string
  name: string
}

export const userProfileKeys = {
  all: ['userProfile'] as const,
  me: () => [...userProfileKeys.all, 'me'] as const,
}

export function useUserProfileQuery() {
  const { isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: userProfileKeys.me(),
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get<ApiMeResponse>('/auth/me/')
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
  }
}
