import { NavigationContainer, LinkingOptions, DefaultTheme } from '@react-navigation/native'
import { useAuth } from '@/app/providers'
import { SplashScreen } from '@/screens'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import type { RootStackParamList } from './types'
import { useTheme } from '@/theme'

// Deep linking configuration (scheme petagil://)
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['petagil://'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          CreateAccount: 'criar-conta',
          RoleSelect: 'role-select',
          // VetProfile não é exposto como deep link: depende do rascunho de conta
          // em memória (criado em CreateAccount) e da sessão recém-criada.
        },
      },
      Main: 'app',
    },
  },
}

export function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth()
  const theme = useTheme()

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.semantic.bg.layout,
      card: theme.semantic.bg.container,
      border: theme.semantic.border.secondary,
      text: theme.semantic.text.primary,
      primary: theme.colors.brandBlue[6],
    },
  }

  // IMPORTANTE: NavigationContainer SEMPRE envolve todo o conteúdo (incl. SplashScreen)
  // para evitar "navigation not ready" quando deep links chegam durante o loading.
  return (
    <NavigationContainer linking={linking} fallback={<SplashScreen />} theme={navigationTheme}>
      {isLoading ? <SplashScreen /> : isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}
