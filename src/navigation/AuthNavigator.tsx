import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { RoleSelectScreen, LoginScreen } from '@/screens';
import { useTheme } from '@/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.semantic.bg.layout },
      }}
    >
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
