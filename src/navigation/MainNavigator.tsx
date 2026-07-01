/**
 * MainNavigator — shell por papel.
 * Lê `selectedRole` do AuthProvider e monta o bottom-tab do tutor (5 tabs, via
 * `TutorRoot`) ou do vet (4 tabs). Se (por algum motivo) estiver autenticado sem
 * papel, cai num fallback de RoleSelect — nunca monta tabs com papel nulo (AC6b).
 *
 * Gate de pets: o tutor não entra direto nas tabs — passa pelo `TutorRoot`, que
 * garante a regra "todo tutor tem ≥1 pet" (ver JSDoc do `TutorRoot`).
 */
import { useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '@/app/providers'
import { useTheme } from '@/theme'
import { ScreenStateWrapper } from '@/components/ui'
import { useHasPetFlag, useMyPets } from '@/features/pets'
import { SplashScreen } from '@/screens/SplashScreen'
import type { TutorTabParamList, VetTabParamList, VetProfileStackParamList } from './types'
import { VetTabBar } from './VetTabBar'
import {
  HomeScreen as TutorHome,
  BuscaScreen,
  ConsultasScreen,
  PetsScreen,
  PerfilScreen as TutorPerfil,
  PetCadastroScreen,
} from '@/screens/tutor'
import {
  HomeScreen as VetHome,
  AgendaScreen,
  AvaliacoesScreen,
  PerfilScreen as VetPerfil,
  EditarPerfilScreen,
  MeusHorariosScreen,
  FolgasScreen,
} from '@/screens/vet'
import { RoleSelectScreen, PlaceholderScreen } from '@/screens'
import { IconStar, IconSearch, IconFileText, IconPin, IconUser } from '@/assets/icons'

const TutorTab = createBottomTabNavigator<TutorTabParamList>()
const VetTab = createBottomTabNavigator<VetTabParamList>()
const VetProfileStack = createNativeStackNavigator<VetProfileStackParamList>()

/** Aba "Perfil" do vet como stack: perfil + edição (a tab bar fica visível). */
function VetProfileStackNavigator() {
  return (
    <VetProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <VetProfileStack.Screen name="PerfilMain" component={VetPerfil} />
      <VetProfileStack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
      <VetProfileStack.Screen name="MeusHorarios" component={MeusHorariosScreen} />
      <VetProfileStack.Screen name="FolgasBloqueios" component={FolgasScreen} />
    </VetProfileStack.Navigator>
  )
}

function useTabScreenOptions(): BottomTabNavigationOptions {
  const theme = useTheme()
  return {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.brandBlue[7],
    tabBarInactiveTintColor: theme.semantic.text.tertiary,
    tabBarStyle: {
      backgroundColor: theme.semantic.bg.container,
      borderTopColor: theme.semantic.border.secondary,
    },
    tabBarLabelStyle: {
      fontFamily: theme.fontFamily.sans('500'),
      fontSize: 11,
    },
  }
}

function TutorTabNavigator() {
  const screenOptions = useTabScreenOptions()
  return (
    <TutorTab.Navigator screenOptions={screenOptions}>
      <TutorTab.Screen
        name="Home"
        component={TutorHome}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <IconStar size={size} color={color} />,
        }}
      />
      <TutorTab.Screen
        name="Busca"
        component={BuscaScreen}
        options={{
          title: 'Busca',
          tabBarIcon: ({ color, size }) => <IconSearch size={size} color={color} />,
        }}
      />
      <TutorTab.Screen
        name="Consultas"
        component={ConsultasScreen}
        options={{
          title: 'Consultas',
          tabBarIcon: ({ color, size }) => <IconFileText size={size} color={color} />,
        }}
      />
      <TutorTab.Screen
        name="Pets"
        component={PetsScreen}
        options={{
          title: 'Pets',
          tabBarIcon: ({ color, size }) => <IconPin size={size} color={color} />,
        }}
      />
      <TutorTab.Screen
        name="Perfil"
        component={TutorPerfil}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <IconUser size={size} color={color} />,
        }}
      />
    </TutorTab.Navigator>
  )
}

/**
 * TutorRoot — shell do tutor com GATE de pets (regra: todo tutor tem ≥1 pet).
 *
 * Decide entre cadastro de pet e tabs com fast-path por flag persistido:
 * - `flag.status === 'has'`  → entra direto nas tabs SEM rede (offline-OK);
 * - `flag.status === 'loading'` → splash enquanto lê o flag no boot;
 * - `flag.status === 'unknown'` → consulta `GET /pets` (gate): vazio → cadastro;
 *   ≥1 → seta o flag e entra; carregando → spinner; erro → retry (não libera as tabs).
 *
 * Isolado num componente próprio porque o `MainNavigator` tem early-returns
 * (não pode chamar hooks de query): aqui todos os hooks ficam no topo, antes de
 * qualquer return. `staleTime: Infinity` (em `useMyPets`) evita refetch churn.
 */
export function TutorRoot() {
  const { user } = useAuth()
  // `id` é alias de `sub`; cai para `sub` se o backend não populou o alias.
  const flag = useHasPetFlag(user?.id ?? user?.sub)
  const pets = useMyPets({ enabled: flag.status === 'unknown' })

  // GET /pets retornou ≥1 → seta o flag (libera as tabs e acelera o próximo boot).
  // Guarda em `status !== 'has'` evita re-setar o estado a cada identidade nova de `data`.
  useEffect(() => {
    if (flag.status !== 'has' && (pets.data?.length ?? 0) > 0) {
      flag.markHasPet()
    }
  }, [pets.data, flag.status, flag.markHasPet])

  if (flag.status === 'loading') {
    return <SplashScreen />
  }
  if (flag.status === 'has') {
    return <TutorTabNavigator />
  }

  return (
    <ScreenStateWrapper
      isLoading={pets.isPending}
      isError={pets.isError}
      isEmpty={(pets.data?.length ?? 0) === 0}
      onRetry={() => void pets.refetch()}
      emptyComponent={<PetCadastroScreen onDone={flag.markHasPet} />}
    >
      <TutorTabNavigator />
    </ScreenStateWrapper>
  )
}

function VetTabNavigator() {
  return (
    <VetTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <VetTabBar {...props} />}
    >
      <VetTab.Screen name="Home" component={VetHome} options={{ title: 'Início' }} />
      <VetTab.Screen name="Agenda" component={AgendaScreen} options={{ title: 'Agenda' }} />
      <VetTab.Screen
        name="Avaliacoes"
        component={AvaliacoesScreen}
        options={{ title: 'Avaliações' }}
      />
      <VetTab.Screen
        name="Perfil"
        component={VetProfileStackNavigator}
        options={{ title: 'Perfil' }}
      />
    </VetTab.Navigator>
  )
}

export function MainNavigator() {
  const { selectedRole } = useAuth()

  // AC6b: autenticado porém sem papel → fallback de RoleSelect (nunca tabs com papel nulo)
  if (!selectedRole) {
    return <RoleSelectScreen />
  }

  // Passeador ainda não tem shell de tabs próprio — placeholder até a spec dedicada.
  if (selectedRole === 'passeador') {
    return <PlaceholderScreen title="Passeador(a)" subtitle="Em construção" />
  }

  return selectedRole === 'vet' ? <VetTabNavigator /> : <TutorRoot />
}
