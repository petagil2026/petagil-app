import type { NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'

// ============================================================================
// Auth Stack — onboarding: Login → Seleção de papel → Cadastro{Tutor|Vet|Passeador}
// O papel é a bifurcação inicial; o `register` ocorre no submit de cada cadastro.
// ============================================================================

export type AuthStackParamList = {
  Login: undefined
  RoleSelect: undefined
  CadastroTutor: undefined
  // Form único do vet (conta + dados da clínica/CRMV no mesmo cadastro).
  CadastroVet: undefined
  CadastroPasseador: undefined
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
  // Aba Perfil é um stack aninhado — aceita navegação direta às telas internas
  // (ex.: da Home → "Meus horários"/"Folgas"). `undefined` = abre o PerfilMain.
  Perfil: NavigatorScreenParams<VetProfileStackParamList> | undefined
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
