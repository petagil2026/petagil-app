/**
 * Badge Component
 * Based on hashtag-web badge for React Native
 */
import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ variant = 'default', children, style }: BadgeProps) {
  const theme = useTheme();

  const getVariantStyles = (): { backgroundColor: string; textColor: string; borderColor?: string } => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.brandBlue[6],
          textColor: theme.semantic.text.lightSolid,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.grey[200],
          textColor: theme.semantic.text.secondary,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success[1],
          textColor: theme.colors.success[7],
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning[1],
          textColor: theme.colors.warning[7],
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error[1],
          textColor: theme.colors.error[7],
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: theme.semantic.text.secondary,
          borderColor: theme.semantic.border.default,
        };
      default:
        return {
          backgroundColor: theme.colors.grey[200],
          textColor: theme.semantic.text.secondary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderColor ? 1 : 0,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: variantStyles.textColor }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
