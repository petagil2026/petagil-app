import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { RoleSelectScreen, CadastroScreen, LoginScreen } from '@/screens';
import { useAuth } from '@/app/providers';
import { useTheme } from '@/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const theme = useTheme();
  const { login } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.semantic.bg.layout },
      }}
    >
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      {/* Injeta a auth real como seam `onSubmit` — ao autenticar, o RootNavigator
          troca para o MainNavigator (a LoginScreen não navega manualmente). */}
      <Stack.Screen name="Login">
        {() => <LoginScreen onSubmit={({ email, password }) => login(email, password)} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
