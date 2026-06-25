/**
 * SearchInput Component
 * Based on hashtag-web search-input for React Native
 */
import React, { forwardRef, useRef, useCallback } from 'react';
import {
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type ShadowStyle = {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
};

type FocusHandler = NonNullable<TextInputProps['onFocus']>;
type BlurHandler = NonNullable<TextInputProps['onBlur']>;
import { useTheme } from '@/theme';
import { IconSearch, IconX } from '@/assets/icons';

interface SearchInputProps extends TextInputProps {
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SearchInput = forwardRef<TextInput, SearchInputProps>(
  ({ value, onClear, containerStyle, style, onFocus, onBlur, ...props }, ref) => {
    const theme = useTheme();
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = useCallback<FocusHandler>(
      (e) => {
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }).start();
        onFocus?.(e);
      },
      [focusAnim, onFocus],
    );

    const handleBlur = useCallback<BlurHandler>(
      (e) => {
        Animated.timing(focusAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
        onBlur?.(e);
      },
      [focusAnim, onBlur],
    );

    const borderColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.semantic.border.default, theme.colors.brandBlue[3]],
    });

    const mdShadow = (theme.shadows.md ?? {}) as ShadowStyle;

    const shadowOpacity = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, mdShadow.shadowOpacity ?? 0],
    });

    const elevation = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, mdShadow.elevation ?? 0],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.semantic.bg.container,
            borderColor,
            shadowColor: mdShadow.shadowColor ?? 'transparent',
            shadowOffset: mdShadow.shadowOffset ?? { width: 0, height: 0 },
            shadowOpacity,
            shadowRadius: mdShadow.shadowRadius ?? 0,
            elevation,
          },
          containerStyle,
        ]}
      >
        <IconSearch
          size={16}
          color={theme.semantic.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            { color: theme.semantic.text.primary },
            style,
          ]}
          placeholderTextColor={theme.semantic.text.placeholder}
          {...props}
        />
        {value && value.length > 0 && onClear && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconX size={16} color={theme.semantic.text.tertiary} />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }
);

SearchInput.displayName = 'SearchInput';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
