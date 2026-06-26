import type { NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'

// ============================================================================
// Auth Stack — onboarding: Login → Crie sua conta → Seleção de papel → (vet) Perfil
// ============================================================================

/**
 * Rascunho da conta coletado em "Crie sua conta", carregado até a seleção de
 * papel (onde o `POST /auth/register` acontece, pois precisa do `role`).
 * Trafega apenas em memória (não há persistência de estado de navegação).
 */
export interface AccountDraft {
  name: string
  email: string
  phone: string
  city: string
  password: string
}

export type AuthStackParamList = {
  Login: undefined
  CreateAccount: undefined
  // `account` ausente = RoleSelect usado como fallback (já autenticado, sem papel).
  RoleSelect: { account: AccountDraft } | undefined
  VetProfile: undefined
}

// ============================================================================
// Tutor bottom tabs
// ============================================================================

export type TutorTabParamList = {
  Home: undefined
  Busca: undefined
  Consultas: undefined
  Pets: undefined
  Perfil: undefined
}

// ============================================================================
// Vet bottom tabs
// ============================================================================

export type VetTabParamList = {
  Home: undefined
  Agenda: undefined
  Avaliacoes: undefined
  Perfil: undefined
}

// Stack interno da aba "Perfil" do vet (perfil + telas de gestão).
export type VetProfileStackParamList = {
  PerfilMain: undefined
  EditarPerfil: undefined
  MeusHorarios: undefined
  FolgasBloqueios: undefined
}

// ============================================================================
// Root Stack (switch Auth vs Main).
// O MainNavigator decide tutor/vet internamente por `selectedRole`.
// ============================================================================

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: undefined
}

// ============================================================================
// Type-safe navigation props
// ============================================================================

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>

export type TutorTabScreenProps<T extends keyof TutorTabParamList> = BottomTabScreenProps<
  TutorTabParamList,
  T
>

export type VetTabScreenProps<T extends keyof VetTabParamList> = BottomTabScreenProps<
  VetTabParamList,
  T
>

export type VetProfileStackScreenProps<T extends keyof VetProfileStackParamList> =
  NativeStackScreenProps<VetProfileStackParamList, T>

// Declare global types for useNavigation hook
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
