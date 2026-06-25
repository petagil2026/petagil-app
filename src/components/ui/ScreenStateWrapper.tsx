/**
 * ScreenStateWrapper — Wrapper para estados de tela: loading, error, empty, data
 *
 * Padrão:
 * - isLoading → ActivityIndicator centralizado
 * - isError → ilustração + mensagem + botão retry
 * - isEmpty → empty state (customizável)
 * - hasData → children
 */
import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { fontFamily, useTheme } from '@/theme';
import { IllustrationNoResults } from '@/assets/illustrations/IllustrationNoResults';

interface ScreenStateWrapperProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry?: () => void;
  /** Componente customizado para empty state */
  emptyComponent?: ReactNode;
  children: ReactNode;
}

export function ScreenStateWrapper({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  emptyComponent,
  children,
}: ScreenStateWrapperProps) {
  const theme = useTheme();
  useLingui();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.brandBlue[6]} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <IllustrationNoResults width={160} height={160} />
        <Text style={[styles.errorTitle, { color: theme.semantic.text.primary }]}>
          {t`Algo deu errado`}
        </Text>
        <Text style={[styles.errorMessage, { color: theme.semantic.text.tertiary }]}>
          {t`Não foi possível carregar os dados.\nVerifique sua conexão e tente novamente.`}
        </Text>
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.brandBlue[6] }]}
            onPress={onRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t`Tentar novamente`}
          >
            <Text style={styles.retryText}>{t`Tentar novamente`}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isEmpty) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: theme.semantic.text.tertiary }]}>
          Nenhum item encontrado
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: fontFamily.sans('600'),
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: fontFamily.sans('400'),
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    fontSize: 14,
    fontFamily: fontFamily.sans('600'),
    color: '#fff',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamily.sans('400'),
    textAlign: 'center',
  },
});
