/**
 * PlaceholderScreen — tela genérica "Em construção" da fundação.
 * Usa o design system re-tematizado (ScreenContainer + tokens semânticos).
 */
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/ui';
import { useTheme } from '@/theme';

interface PlaceholderScreenProps {
  title: string;
  subtitle?: string;
}

export function PlaceholderScreen({ title, subtitle = 'Em construção' }: PlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text style={[theme.textStyles.h3600, { color: theme.semantic.text.primary }, styles.text]}>
          {title}
        </Text>
        <Text style={[theme.textStyles.base400, { color: theme.semantic.text.tertiary }, styles.text]}>
          {subtitle}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { textAlign: 'center' },
});
