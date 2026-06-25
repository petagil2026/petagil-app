/**
 * Button Component
 * Based on hashtag-web button with variants for React Native
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@/theme';

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'pill'
  | 'pillOutline'
  | 'pillAction';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'iconSm' | 'iconRound' | 'pillSm' | 'pillDefault' | 'pillLg' | 'pillAction';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  children,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: theme.colors.brandBlue[6],
        };
      case 'destructive':
        return {
          backgroundColor: theme.colors.error[6],
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.semantic.border.default,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.grey[200],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'pill':
        return {
          backgroundColor: theme.semantic.bg.container,
          borderWidth: 1,
          borderColor: theme.semantic.border.default,
          borderRadius: theme.borderRadius.full,
        };
      case 'pillOutline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.semantic.border.default,
          borderRadius: theme.borderRadius.full,
        };
      case 'pillAction':
        return {
          backgroundColor: theme.semantic.bg.container,
          borderWidth: 1,
          borderColor: theme.semantic.border.default,
          borderRadius: theme.borderRadius.full,
        };
      default:
        return {};
    }
  };

  const getTextVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'default':
        return { color: theme.semantic.text.lightSolid };
      case 'destructive':
        return { color: theme.semantic.text.lightSolid };
      case 'outline':
      case 'secondary':
      case 'ghost':
      case 'pill':
      case 'pillOutline':
      case 'pillAction':
        return { color: theme.semantic.text.secondary };
      default:
        return { color: theme.semantic.text.lightSolid };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          height: 32,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
        };
      case 'lg':
        return {
          height: 40,
          paddingHorizontal: theme.spacing['2xl'],
          borderRadius: theme.borderRadius.md,
        };
      case 'icon':
        return {
          width: 36,
          height: 36,
          paddingHorizontal: 0,
          borderRadius: theme.borderRadius.md,
        };
      case 'iconSm':
        return {
          width: 32,
          height: 32,
          paddingHorizontal: 0,
          borderRadius: theme.borderRadius.full,
        };
      case 'iconRound':
        return {
          width: 36,
          height: 36,
          paddingHorizontal: 0,
          borderRadius: theme.borderRadius.full,
        };
      case 'pillSm':
        return {
          height: 32,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
        };
      case 'pillDefault':
        return {
          height: 36,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.full,
        };
      case 'pillLg':
        return {
          height: 40,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.full,
        };
      default:
        return {
          height: 36,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  const getTextSizeStyles = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: theme.fontSize.sm };
      case 'lg':
        return { fontSize: theme.fontSize.base };
      case 'pillSm':
      case 'pillAction':
        return { fontSize: theme.fontSize.sm };
      case 'pillDefault':
        return { fontSize: theme.fontSize.sm };
      case 'pillLg':
        return { fontSize: theme.fontSize.base };
      default:
        return { fontSize: theme.fontSize.sm };
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'destructive'
            ? theme.semantic.text.lightSolid
            : theme.semantic.text.secondary
          }
        />
      ) : typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            getTextVariantStyles(),
            getTextSizeStyles(),
            isDisabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },
});
