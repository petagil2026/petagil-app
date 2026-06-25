/**
 * MobileHeader Component — header genérico reutilizável.
 * - Height mínima: 68px
 * - Botão de menu opcional (via onMenuPress)
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useTheme } from '@/theme';
import { IconMenu } from '@/assets/icons';

interface MobileHeaderProps {
  onMenuPress?: () => void;
  /** Mostra o botão de menu (requer onMenuPress) */
  showMenu?: boolean;
}

export function MobileHeader({ onMenuPress, showMenu = false }: MobileHeaderProps) {
  const theme = useTheme();
  useLingui();
  const { top: topInset } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.semantic.bg.container,
          paddingTop: topInset + 8,
        },
      ]}
    >
      {showMenu && onMenuPress ? (
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.menuButton}
          accessibilityLabel={t`Abrir menu`}
          accessibilityRole="button"
        >
          <IconMenu size={20} color={theme.semantic.text.secondary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.menuButton} />
      )}

      <View style={styles.logoContainer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 0,
    minHeight: 68,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
