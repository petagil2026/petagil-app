/**
 * LoadingButton — Botão com estado de loading para mutations
 */
import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { fontFamily, useTheme } from '@/theme';

interface LoadingButtonProps {
  label: string;
  onPress: () => void;
  isPending: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LoadingButton({
  label,
  onPress,
  isPending,
  disabled = false,
  style,
}: LoadingButtonProps) {
  const theme = useTheme();
  const isDisabled = isPending || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isDisabled ? theme.semantic.bg.containerDisabled : theme.colors.brandBlue[6] },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ busy: isPending, disabled: isDisabled }}
    >
      {isPending ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isDisabled ? theme.semantic.text.disabled : '#fff' },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 15,
    fontFamily: fontFamily.sans('600'),
  },
});
