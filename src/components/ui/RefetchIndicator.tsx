/**
 * RefetchIndicator — Indicador discreto de refetch em andamento
 * Exibido apenas quando isFetching && !isLoading
 */
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '@/theme';
import { useRefetchIndicator } from '@/hooks/useRefetchIndicator';

interface RefetchIndicatorProps {
  isFetching: boolean;
  isLoading: boolean;
}

export function RefetchIndicator({ isFetching, isLoading }: RefetchIndicatorProps) {
  const theme = useTheme();
  const showIndicator = useRefetchIndicator(isFetching, isLoading);

  if (!showIndicator) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={theme.colors.brandBlue[6]} />
      <Text style={[styles.text, { color: theme.semantic.text.tertiary }]}>
        Atualizando...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontFamily: fontFamily.sans('400'),
  },
});
