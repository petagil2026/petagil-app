/**
 * ProfilePlaceholderScreen — Perfil placeholder compartilhado por tutor e vet.
 * Inclui: toggle de tema claro/escuro (testável pela UI — AC9) e botão Sair (AC7).
 */
import { View, Text, StyleSheet, Switch } from 'react-native';
import { ScreenContainer, Button } from '@/components/ui';
import { useTheme, useThemeContext } from '@/theme';
import { useAuth } from '@/app/providers';

export function ProfilePlaceholderScreen() {
  const theme = useTheme();
  const { colorScheme, toggleColorScheme } = useThemeContext();
  const { user, logout } = useAuth();
  const isDark = colorScheme === 'dark';

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[theme.textStyles.h3600, { color: theme.semantic.text.primary }]}>Perfil</Text>
          {user?.name ? (
            <Text style={[theme.textStyles.base400, { color: theme.semantic.text.tertiary }]}>
              {user.name}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.row,
            { borderColor: theme.semantic.border.secondary, backgroundColor: theme.semantic.bg.elevated },
          ]}
        >
          <Text style={[theme.textStyles.base500, { color: theme.semantic.text.secondary }]}>
            Tema escuro
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleColorScheme}
            trackColor={{ true: theme.colors.brandBlue[5], false: theme.colors.grey[300] }}
            thumbColor={theme.semantic.bg.container}
            accessibilityLabel="Alternar tema claro/escuro"
          />
        </View>

        <View style={styles.spacer} />

        <Button
          variant="outline"
          onPress={() => {
            void logout();
          }}
          accessibilityLabel="Sair"
          style={styles.logoutBtn}
        >
          Sair
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  header: { gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  spacer: { flex: 1 },
  logoutBtn: { height: 48, borderRadius: 12 },
});
