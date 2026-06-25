/**
 * AuthProvider — autenticação real contra a API (NestJS).
 *
 * `login(email, password)` chama `/api/auth/login`, persiste tokens + user em
 * SecureStore e autentica. A sessão é restaurada do SecureStore no mount ANTES de
 * `isLoading` virar `false`, para o RootNavigator já abrir no estado certo.
 * Em falha de auth irrecuperável (401 após refresh), o `httpClient` notifica via
 * `setOnAuthFailure` e a sessão é encerrada.
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

import { loginRequest, logoutRequest, setOnAuthFailure } from '@/services/api'
import { secureStorage } from '@/services/storage'
import type { Role, User } from '@/types/auth'

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
  selectedRole: Role | null
  /** Autentica por email/senha contra a API. Lança em caso de falha. */
  login: (email: string, password: string) => Promise<void>
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
   * Ponte com o httpClient: em falha de auth irrecuperável (401 após refresh), o
   * httpClient já limpou a sessão — aqui só resetamos o estado para deslogado.
   */
  useEffect(() => {
    setOnAuthFailure(() => {
      safeSetState({
        isAuthenticated: false,
        user: null,
        selectedRole: null,
        isLoading: false,
        error: null,
      })
    })
    return () => setOnAuthFailure(null)
  }, [safeSetState])

  /**
   * Login real: autentica na API, persiste tokens + user, e fixa o papel a
   * partir do `user.role` do servidor. Relança o erro para a tela tratar.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      safeSetState({ isLoading: true, error: null })
      try {
        const { tokens, user } = await loginRequest(email, password)
        await Promise.all([
          secureStorage.setTokens(tokens),
          secureStorage.setUser(JSON.stringify(user)),
        ])
        const role: Role | null = isRole(user.role ?? null) ? (user.role as Role) : null
        if (role) {
          await secureStorage.setSelectedRole(role)
        }
        safeSetState({
          isAuthenticated: true,
          user,
          selectedRole: role,
          isLoading: false,
          error: null,
        })
        logger.log('login ok:', user.email)
      } catch (error) {
        logger.error('login failed:', error)
        safeSetState({ isLoading: false })
        throw error instanceof Error ? error : new Error('login failed')
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

  /** Logout: avisa o servidor (best-effort), limpa a sessão e reseta o estado. */
  const logout = useCallback(async (): Promise<void> => {
    safeSetState({ isLoading: true })
    try {
      await logoutRequest()
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
