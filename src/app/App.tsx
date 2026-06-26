/**
 * App root — providers em cascata + splash screen controlada + edge-to-edge background
 */
import { View, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import {
  Rubik_300Light,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik'
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'
import { Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2'
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito'
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query'
import { I18nProvider, useLingui } from '@lingui/react'
import { useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'

import { AuthProvider } from '@/app/providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RootNavigator } from '@/navigation'
import { useDeferredDeepLink } from '@/hooks'
import { useOTAUpdate } from '@/hooks/useOTAUpdate'
import { ThemeProvider, useTheme, useThemeContext } from '@/theme'
import { ToastProvider } from '@/components/ui'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { i18n, initI18n } from '@/i18n'

// Previne auto-hide para controlarmos quando esconder a splash
SplashScreen.preventAutoHideAsync().catch(() => {})

// Integra NetInfo com o onlineManager do TanStack Query para refetch automático ao reconectar
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const NetInfo = require('@react-native-community/netinfo')
  onlineManager.setEventListener(setOnline =>
    NetInfo.default.addEventListener((state: { isConnected: boolean | null }) => {
      setOnline(state.isConnected ?? true)
    })
  )
} catch {
  // NetInfo não instalado — refetch on reconnect desabilitado
}

// QueryClient fora do componente para evitar recriação a cada render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
})

function AppContent() {
  useLingui()
  useDeferredDeepLink()
  useOTAUpdate()
  const { colorScheme } = useThemeContext()

  return (
    <>
      <RootNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  )
}

/**
 * ThemedBackground — preenche o fundo atrás do notch/DI/navigation bar com a cor do tema.
 * Usa absoluteFill dentro do SafeAreaProvider para cobrir toda a tela incluindo safe areas.
 */
function ThemedBackground({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.semantic.bg.layout }]} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})

export default function App() {
  const [fontsLoaded, fontsError] = useFonts({
    Rubik_300Light,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  })
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setI18nReady(true))
      .catch(() => {
        setI18nReady(true)
      })
  }, [])

  // Esconder splash quando tudo estiver pronto
  useEffect(() => {
    const ready = (fontsLoaded || Boolean(fontsError)) && i18nReady
    if (ready) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded, fontsError, i18nReady])

  // Aguarda carregamento — splash nativa permanece visível
  if ((!fontsLoaded && !fontsError) || !i18nReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <I18nProvider i18n={i18n}>
            <ErrorBoundary>
              <ThemeProvider>
                <ThemedBackground>
                  <ToastProvider>
                    <AuthProvider>
                      <QueryClientProvider client={queryClient}>
                        <OfflineBanner />
                        <AppContent />
                      </QueryClientProvider>
                    </AuthProvider>
                  </ToastProvider>
                </ThemedBackground>
              </ThemeProvider>
            </ErrorBoundary>
          </I18nProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}
