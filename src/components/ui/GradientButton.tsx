/**
 * GradientButton — botão primário com fundo em gradiente da marca.
 * Criado para a tela de Login (CTA "Entrar"), mas reutilizável: encapsula o
 * LinearGradient + estados de loading/disabled para não repetir o gradiente inline.
 * Espelha a semântica de disabled/loading do Button compartilhado (opacity 0.5).
 */
import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/theme'

interface GradientButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

export function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  accessibilityLabel,
  testID,
  style,
}: GradientButtonProps) {
  const theme = useTheme()
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.touchable,
        { borderRadius: theme.borderRadius.button },
        theme.shadows.primaryGlow,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[theme.gradients.primaryButton.start, theme.gradients.primaryButton.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: theme.borderRadius.button }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.grey[0]} />
        ) : (
          <Text style={[theme.textStyles.lg600, { color: theme.colors.grey[0] }]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  touchable: {
    height: 56,
    width: '100%',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
})
