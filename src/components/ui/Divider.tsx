/**
 * Divider Component
 * Simple horizontal/vertical line divider
 */
import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface DividerProps {
  direction?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

export function Divider({ direction = 'horizontal', style }: DividerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        direction === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: theme.semantic.border.secondary },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
