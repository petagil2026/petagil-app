import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { useAuth } from '@/app/providers';

export function HomeScreen() {
  const theme = useTheme();
  const { logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text style={[theme.textStyles.h3600, { color: theme.semantic.text.primary }, styles.text]}>
          Início
        </Text>
        <Text style={[theme.textStyles.base400, { color: theme.semantic.text.tertiary }, styles.text]}>
          Em construção
        </Text>

        {/* TEMP: atalho para revisar a tela de escolha de papel — remover antes de produção.
            logout() limpa a sessão mock e faz o RootNavigator voltar para a RoleSelect. */}
        <Button variant="outline" style={styles.tempBtn} onPress={() => void logout()}>
          [TEMP] Ver escolha de papel
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { textAlign: 'center' },
  tempBtn: { marginTop: 24, height: 48, borderRadius: 12, paddingHorizontal: 20 },
});
