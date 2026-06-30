import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AuthStackParamList } from './types'
import {
  LoginScreen,
  RoleSelectScreen,
  CadastroTutorScreen,
  VetCadastroScreen,
  CadastroPasseadorScreen,
} from '@/screens'
import { useAuth } from '@/app/providers'
import { useTheme } from '@/theme'

const Stack = createNativeStackNavigator<AuthStackParamList>()

/**
 * Fluxo de onboarding:
 *   Login → Seleção de papel → Cadastro{Tutor|Vet|Passeador}.
 * O papel é a bifurcação inicial e o `register` acontece no submit de cada
 * cadastro — por isso essas telas vivem aqui no AuthNavigator. A autenticação só
 * é finalizada ao concluir o cadastro (`completeOnboarding`), quando o
 * RootNavigator troca para o MainNavigator. O vet usa um form único (conta +
 * dados da clínica).
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
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="CadastroTutor" component={CadastroTutorScreen} />
      <Stack.Screen name="CadastroVet" component={VetCadastroScreen} />
      <Stack.Screen name="CadastroPasseador" component={CadastroPasseadorScreen} />
    </Stack.Navigator>
  )
}
