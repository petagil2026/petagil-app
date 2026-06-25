/**
 * AuthProvider — versão MOCKADA da fundação do PetÁgil.
 *
 * Sem SSO/PKCE/rede: `login(role)` cria um usuário fake, autentica e seleciona o
 * papel; a sessão (user + papel) é persistida em SecureStore e restaurada no mount
 * ANTES de `isLoading` virar `false`, para o RootNavigator já abrir no papel salvo.
 * Specs futuras substituem isto por auth real.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'

import { secureStorage } from '@/services/storage'
import type { Role, User } from '@/types/auth'

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
  selectedRole: Role | null
  /** Autentica (mock) já fixando o papel — substitui o antigo startSSOLogin (sem rede). */
  login: (role: Role) => Promise<void>
  /** Troca o papel selecionado sem mexer no estado de autenticação. */
  selectRole: (role: Role) => void
  logout: () => Promise<void>
  clearError: () => void
}

interface AuthInternalState {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  error: string | null
  selectedRole: Role | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log('[AuthProvider]', ...args)
  },
  error: (...args: unknown[]) => {
    if (__DEV__) console.error('[AuthProvider]', ...args)
  },
}

/** Rótulos mock (email/nome) por papel. */
const MOCK_USER_BY_ROLE: Record<Role, { email: string; name: string }> = {
  tutor: { email: 'tutor@petagil.app', name: 'Tutor(a) PetÁgil' },
  vet: { email: 'vet@petagil.app', name: 'Dr(a). Veterinário(a)' },
  passeador: { email: 'passeador@petagil.app', name: 'Passeador(a) PetÁgil' },
}

/** Cria um usuário fake para o papel escolhido. */
function makeMockUser(role: Role): User {
  const id = `mock-${role}`
  return {
    sub: id,
    id,
    email: MOCK_USER_BY_ROLE[role].email,
    name: MOCK_USER_BY_ROLE[role].name,
    role,
  }
}

function isRole(value: string | null): value is Role {
  return value === 'tutor' || value === 'vet' || value === 'passeador'
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthInternalState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
    selectedRole: null,
  })

  const isMountedRef = useRef(true)

  const safeSetState = useCallback((newState: Partial<AuthInternalState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...newState }))
    }
  }, [])

  const clearError = useCallback(() => {
    safeSetState({ error: null })
  }, [safeSetState])

  /**
   * Restaura a sessão mockada do SecureStore no mount.
   * `isLoading` só vira `false` DEPOIS de ler user+papel — evita flash da RoleSelect.
   */
  useEffect(() => {
    isMountedRef.current = true

    void (async () => {
      try {
        const [userJson, savedRole] = await Promise.all([
          secureStorage.getUser(),
          secureStorage.getSelectedRole(),
        ])

        const user = userJson ? (JSON.parse(userJson) as User) : null
        const selectedRole: Role | null = isRole(savedRole)
          ? savedRole
          : isRole(user?.role ?? null)
            ? (user!.role as Role)
            : null

        if (user) {
          safeSetState({
            isAuthenticated: true,
            user,
            selectedRole,
            isLoading: false,
          })
        } else {
          safeSetState({ isAuthenticated: false, user: null, selectedRole: null, isLoading: false })
        }
      } catch (error) {
        logger.error('session restore failed:', error)
        safeSetState({ isAuthenticated: false, user: null, selectedRole: null, isLoading: false })
      }
    })()

    return () => {
      isMountedRef.current = false
    }
  }, [safeSetState])

  /**
   * Login mockado: cria user fake, persiste user + papel e autentica.
   * SEMPRE seta o papel → o estado "autenticado sem papel" não deve ocorrer.
   */
  const login = useCallback(
    async (role: Role): Promise<void> => {
      safeSetState({ isLoading: true, error: null })
      try {
        const user = makeMockUser(role)
        await Promise.all([
          secureStorage.setUser(JSON.stringify(user)),
          secureStorage.setSelectedRole(role),
        ])
        safeSetState({
          isAuthenticated: true,
          user,
          selectedRole: role,
          isLoading: false,
          error: null,
        })
        logger.log('mock login as', role)
      } catch (error) {
        logger.error('login failed:', error)
        safeSetState({
          error: 'Não foi possível entrar. Tente novamente.',
          isLoading: false,
        })
      }
    },
    [safeSetState]
  )

  /** Troca apenas o papel selecionado (persistindo), sem alterar a autenticação. */
  const selectRole = useCallback(
    (role: Role): void => {
      safeSetState({ selectedRole: role })
      void secureStorage.setSelectedRole(role)
    },
    [safeSetState]
  )

  /** Logout mockado: limpa sessão (tokens/user/papel) e reseta o estado. */
  const logout = useCallback(async (): Promise<void> => {
    safeSetState({ isLoading: true })
    try {
      await secureStorage.clearSession()
    } catch (error) {
      logger.error('logout clear failed:', error)
    } finally {
      safeSetState({
        isAuthenticated: false,
        user: null,
        selectedRole: null,
        isLoading: false,
        error: null,
      })
    }
  }, [safeSetState])

  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      user: state.user,
      error: state.error,
      selectedRole: state.selectedRole,
      login,
      selectRole,
      logout,
      clearError,
    }),
    [state, login, selectRole, logout, clearError]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
