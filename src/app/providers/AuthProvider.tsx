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

import { loginRequest, logoutRequest, registerRequest, setOnAuthFailure } from '@/services/api'
import type { RegisterInput } from '@/services/api'
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
  /**
   * Cria a conta ("Crie sua conta") e guarda os TOKENS (já autentica as chamadas
   * HTTP), mas NÃO marca `isAuthenticated` ainda — o onboarding pode ter uma etapa
   * seguinte (ex.: perfil do veterinário) que vive no AuthNavigator e seria perdida
   * se o RootNavigator trocasse para o app. Retorna o `user` criado.
   */
  register: (input: RegisterInput) => Promise<User>
  /**
   * Finaliza o onboarding: persiste o `user` e marca `isAuthenticated` — o
   * RootNavigator troca para o app. Chame após a última etapa do cadastro.
   */
  completeOnboarding: (user: User) => void
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

  /**
   * Cadastro de conta (etapa 1). Persiste apenas os TOKENS (para as chamadas
   * seguintes irem autenticadas) e guarda o `user` em memória + o papel. NÃO
   * persiste o user nem marca `isAuthenticated` — isso fica para `completeOnboarding`,
   * de modo que um app reaberto no meio do fluxo volte ao login (onboarding incompleto).
   *
   * NÃO mexe em `isLoading`: esse flag controla o gate do RootNavigator
   * (Splash vs Auth vs Main). Ligá-lo aqui desmontaria o AuthNavigator (mostrando
   * a Splash) e, ao voltar, ele remontaria no `initialRoute` Login — perdendo o
   * `navigate('VetProfile')`. O loading do botão é local (`isSubmitting` na tela).
   */
  const register = useCallback(
    async (input: RegisterInput): Promise<User> => {
      safeSetState({ error: null })
      try {
        const { tokens, user } = await registerRequest(input)
        await secureStorage.setTokens(tokens)
        const role: Role | null = isRole(user.role ?? null)
          ? (user.role as Role)
          : isRole(input.role)
            ? input.role
            : null
        if (role) {
          await secureStorage.setSelectedRole(role)
        }
        safeSetState({ user, selectedRole: role, error: null })
        logger.log('register ok:', user.email)
        return user
      } catch (error) {
        logger.error('register failed:', error)
        throw error instanceof Error ? error : new Error('register failed')
      }
    },
    [safeSetState]
  )

  /** Finaliza o onboarding: persiste o user e autentica (RootNavigator -> app). */
  const completeOnboarding = useCallback(
    (user: User): void => {
      void secureStorage.setUser(JSON.stringify(user))
      safeSetState({ isAuthenticated: true, user })
      logger.log('onboarding completo:', user.email)
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
      register,
      completeOnboarding,
      selectRole,
      logout,
      clearError,
    }),
    [state, login, register, completeOnboarding, selectRole, logout, clearError]
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
