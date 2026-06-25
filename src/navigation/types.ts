import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { Role } from '@/types/auth';

// ============================================================================
// Auth Stack — seleção de papel + cadastro + login placeholder
// ============================================================================

export type AuthStackParamList = {
  RoleSelect: undefined;
  Cadastro: { role: Role };
  Login: undefined;
};

// ============================================================================
// Tutor bottom tabs
// ============================================================================

export type TutorTabParamList = {
  Home: undefined;
  Busca: undefined;
  Consultas: undefined;
  Pets: undefined;
  Perfil: undefined;
};

// ============================================================================
// Vet bottom tabs
// ============================================================================

export type VetTabParamList = {
  Home: undefined;
  Agenda: undefined;
  Avaliacoes: undefined;
  Perfil: undefined;
};

// ============================================================================
// Root Stack (switch Auth vs Main).
// O MainNavigator decide tutor/vet internamente por `selectedRole`.
// ============================================================================

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
};

// ============================================================================
// Type-safe navigation props
// ============================================================================

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type TutorTabScreenProps<T extends keyof TutorTabParamList> =
  BottomTabScreenProps<TutorTabParamList, T>;

export type VetTabScreenProps<T extends keyof VetTabParamList> =
  BottomTabScreenProps<VetTabParamList, T>;

// Declare global types for useNavigation hook
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
