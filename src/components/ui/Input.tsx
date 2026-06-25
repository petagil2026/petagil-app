/**
 * Input Component
 * Based on hashtag-web input for React Native
 */
import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerStyle, style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              { color: theme.semantic.text.secondary },
            ]}
          >
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              backgroundColor: theme.semantic.bg.container,
              borderColor: error
                ? theme.colors.error[6]
                : theme.semantic.border.default,
              color: theme.semantic.text.primary,
            },
            style,
          ]}
          placeholderTextColor={theme.semantic.text.placeholder}
          {...props}
        />
        {error && (
          <Text style={[styles.error, { color: theme.colors.error[6] }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
