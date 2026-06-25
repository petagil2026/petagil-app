import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Desativa o padding do safe area no topo */
  disableTopInset?: boolean;
  /** Desativa o padding do safe area embaixo */
  disableBottomInset?: boolean;
  /** Padding extra além do safe area */
  padding?: number;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  disableTopInset = false,
  disableBottomInset = false,
  padding = 24,
  style,
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          // bg.layout = fundo azul claro do PetÁgil (#EAF4FB); superfícies/cards usam bg.container/elevated (AC8)
          backgroundColor: theme.semantic.bg.layout,
          paddingTop: disableTopInset ? padding : insets.top + padding,
          paddingBottom: disableBottomInset ? padding : insets.bottom + padding
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
