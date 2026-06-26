import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AuthStackParamList } from './types'
import { LoginScreen, CreateAccountScreen, VetCadastroScreen, RoleSelectScreen } from '@/screens'
import { useAuth } from '@/app/providers'
import { useTheme } from '@/theme'

const Stack = createNativeStackNavigator<AuthStackParamList>()

/**
 * Fluxo de onboarding:
 *   Login → "Crie sua conta" → Seleção de papel → (veterinário) Perfil profissional.
 * O `register` acontece na seleção de papel (precisa do papel); por isso a tela do
 * vet vive aqui no AuthNavigator — a autenticação só é finalizada ao concluir o
 * perfil (`completeOnboarding`), quando o RootNavigator troca para o MainNavigator.
 */
export function AuthNavigator() {
  const theme = useTheme()
  const { login } = useAuth()

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.semantic.bg.layout },
      }}
    >
      {/* Injeta a auth real como seam `onSubmit` — ao autenticar, o RootNavigator
          troca para o MainNavigator (a LoginScreen não navega manualmente). */}
      <Stack.Screen name="Login">
        {() => <LoginScreen onSubmit={({ email, password }) => login(email, password)} />}
      </Stack.Screen>
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="VetProfile" component={VetCadastroScreen} />
    </Stack.Navigator>
  )
}
