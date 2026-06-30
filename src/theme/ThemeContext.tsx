/**
 * Theme Context
 * Provides theme colors throughout the app with dark/light mode support
 */
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, lightTheme, darkTheme, gradients, type ThemeColors } from './colors'
import { textStyles, fontFamily, fontSize, lineHeight, fontWeight } from './typography'
import { brandText } from './brandTypography'
import { spacing, borderRadius, layout } from './spacing'
import { shadows } from './shadows'

type ColorScheme = 'light' | 'dark'

interface Theme {
  colors: typeof colors
  gradients: typeof gradients
  semantic: ThemeColors
  textStyles: typeof textStyles
  brandText: typeof brandText
  fontFamily: typeof fontFamily
  fontSize: typeof fontSize
  lineHeight: typeof lineHeight
  fontWeight: typeof fontWeight
  spacing: typeof spacing
  borderRadius: typeof borderRadius
  layout: typeof layout
  shadows: typeof shadows
  isDark: boolean
}

interface ThemeContextValue {
  theme: Theme
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  toggleColorScheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = 'petagil-theme'

interface ThemeProviderProps {
  children: ReactNode
  defaultColorScheme?: ColorScheme
}

export function ThemeProvider({ children, defaultColorScheme }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    defaultColorScheme ?? systemColorScheme ?? 'light'
  )
  const isInitialized = useRef(false)

  // Load persisted theme preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark') {
        setColorScheme(saved)
      }
      isInitialized.current = true
    })
  }, [])

  // Persist theme preference on change (after initialization)
  useEffect(() => {
    if (!isInitialized.current) return
    AsyncStorage.setItem(THEME_STORAGE_KEY, colorScheme)
  }, [colorScheme])

  const theme = useMemo<Theme>(() => {
    const isDark = colorScheme === 'dark'
    return {
      colors,
      gradients,
      semantic: isDark ? darkTheme : lightTheme,
      textStyles,
      brandText,
      fontFamily,
      fontSize,
      lineHeight,
      fontWeight,
      spacing,
      borderRadius,
      layout,
      shadows,
      isDark,
    }
  }, [colorScheme])

  const toggleColorScheme = () => {
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const value = useMemo(
    () => ({
      theme,
      colorScheme,
      setColorScheme,
      toggleColorScheme,
    }),
    [theme, colorScheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context.theme
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
