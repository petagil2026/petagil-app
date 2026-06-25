/**
 * RoleSelectScreen — escolha de papel (Tutor / Veterinário).
 * Ao escolher, dispara `login(role)` (mock) que autentica + fixa o papel; o
 * RootNavigator então troca para o Main com o tab navigator do papel.
 */
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { useAuth } from '@/app/providers';
import type { Role } from '@/types/auth';

export function RoleSelectScreen() {
  const theme = useTheme();
  const { login } = useAuth();

  const handleSelect = (role: Role) => {
    void login(role);
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[theme.textStyles.h2600, { color: theme.semantic.text.primary }, styles.center]}>
            PetÁgil
          </Text>
          <Text style={[theme.textStyles.base400, { color: theme.semantic.text.tertiary }, styles.center]}>
            Como você quer usar o app?
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            variant="default"
            style={styles.roleBtn}
            textStyle={styles.roleBtnText}
            onPress={() => handleSelect('tutor')}
            accessibilityLabel="Entrar como Tutor"
          >
            Sou Tutor
          </Button>
          <Button
            variant="default"
            style={styles.roleBtn}
            textStyle={styles.roleBtnText}
            onPress={() => handleSelect('vet')}
            accessibilityLabel="Entrar como Veterinário"
          >
            Sou Veterinário
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 40 },
  header: { gap: 8 },
  center: { textAlign: 'center' },
  actions: { gap: 16 },
  roleBtn: { height: 56, borderRadius: 16 },
  roleBtnText: { fontSize: 16 },
});
