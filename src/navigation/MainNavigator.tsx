/**
 * MainNavigator — shell por papel.
 * Lê `selectedRole` do AuthProvider e monta o bottom-tab do tutor (5 tabs) ou do
 * vet (4 tabs). Se (por algum motivo) estiver autenticado sem papel, cai num
 * fallback de RoleSelect — nunca monta tabs com papel nulo (AC6b).
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/app/providers';
import { useTheme } from '@/theme';
import type { TutorTabParamList, VetTabParamList } from './types';
import {
  HomeScreen as TutorHome,
  BuscaScreen,
  ConsultasScreen,
  PetsScreen,
  PerfilScreen as TutorPerfil,
} from '@/screens/tutor';
import {
  HomeScreen as VetHome,
  AgendaScreen,
  AvaliacoesScreen,
  PerfilScreen as VetPerfil,
} from '@/screens/vet';
import { RoleSelectScreen, PlaceholderScreen } from '@/screens';
import {
  IconStar,
  IconSearch,
  IconFileText,
  IconPin,
  IconUser,
  IconHistory,
  IconBarChart,
} from '@/assets/icons';

const TutorTab = createBottomTabNavigator<TutorTabParamList>();
const VetTab = createBottomTabNavigator<VetTabParamList>();

function useTabScreenOptions(): BottomTabNavigationOptions {
  const theme = useTheme();
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
  };
}

function TutorTabNavigator() {
  const screenOptions = useTabScreenOptions();
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
  );
}

function VetTabNavigator() {
  const screenOptions = useTabScreenOptions();
  return (
    <VetTab.Navigator screenOptions={screenOptions}>
      <VetTab.Screen
        name="Home"
        component={VetHome}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <IconStar size={size} color={color} />,
        }}
      />
      <VetTab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <IconHistory size={size} color={color} />,
        }}
      />
      <VetTab.Screen
        name="Avaliacoes"
        component={AvaliacoesScreen}
        options={{
          title: 'Avaliações',
          tabBarIcon: ({ color, size }) => <IconBarChart size={size} color={color} />,
        }}
      />
      <VetTab.Screen
        name="Perfil"
        component={VetPerfil}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <IconUser size={size} color={color} />,
        }}
      />
    </VetTab.Navigator>
  );
}

export function MainNavigator() {
  const { selectedRole } = useAuth();

  // AC6b: autenticado porém sem papel → fallback de RoleSelect (nunca tabs com papel nulo)
  if (!selectedRole) {
    return <RoleSelectScreen />;
  }

  // Passeador ainda não tem shell de tabs próprio — placeholder até a spec dedicada.
  if (selectedRole === 'passeador') {
    return <PlaceholderScreen title="Passeador(a)" subtitle="Em construção" />;
  }

  return selectedRole === 'vet' ? <VetTabNavigator /> : <TutorTabNavigator />;
}
