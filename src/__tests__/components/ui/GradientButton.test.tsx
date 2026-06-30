import React, { type ReactNode } from 'react'
import { render, screen } from '@testing-library/react-native'
import { ThemeProvider } from '@/theme'
import { GradientButton } from '@/components/ui'

// fontFamily do estilo default do título (textStyles.lg600 = Nunito 600).
const DEFAULT_TITLE_FONT = 'Nunito_600SemiBold'

// expo-linear-gradient mockado como nos testes de tela (CadastroTutorScreen.test.tsx).
jest.mock('expo-linear-gradient', () => {
  const React = require('react')
  return {
    LinearGradient: ({ children }: { children?: ReactNode }) =>
      React.createElement('LinearGradient', null, children),
  }
})

// O barrel @/components/ui puxa ScreenContainer → safe-area-context (nativo): mockar.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: { children?: ReactNode }) =>
      React.createElement('SafeAreaProvider', null, children),
  }
})

// Achata o array de estilos manualmente: o stub de RN dos testes tem
// StyleSheet.flatten como identidade (não resolve arrays).
function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>((acc, s) => ({ ...acc, ...flatten(s) }), {})
  }
  return (style as Record<string, unknown>) ?? {}
}

function renderButton(props?: {
  titleStyle?: object
  loading?: boolean
  disabled?: boolean
}) {
  return render(
    <ThemeProvider defaultColorScheme="light">
      <GradientButton title="Próximo" onPress={() => {}} testID="btn" {...props} />
    </ThemeProvider>
  )
}

describe('GradientButton — prop titleStyle', () => {
  it('aplica fontFamily, fontSize e lineHeight do titleStyle ao texto do título', () => {
    renderButton({ titleStyle: { fontFamily: 'Baloo2_700Bold', fontSize: 16, lineHeight: 20 } })
    const style = flatten(screen.getByText('Próximo').props.style)
    expect(style.fontFamily).toBe('Baloo2_700Bold')
    expect(style.fontSize).toBe(16)
    expect(style.lineHeight).toBe(20)
  })

  it('sem titleStyle mantém o default textStyles.lg600 (Nunito)', () => {
    renderButton()
    const style = flatten(screen.getByText('Próximo').props.style)
    expect(style.fontFamily).toBe(DEFAULT_TITLE_FONT)
  })

  it('loading mostra o spinner e não renderiza o título (titleStyle não vaza)', () => {
    renderButton({ loading: true, titleStyle: { fontFamily: 'Baloo2_700Bold' } })
    expect(screen.queryByText('Próximo')).toBeNull()
    expect(screen.getByTestId('btn').props.accessibilityState.disabled).toBe(true)
  })

  it('disabled propaga accessibilityState.disabled', () => {
    renderButton({ disabled: true })
    expect(screen.getByTestId('btn').props.accessibilityState.disabled).toBe(true)
  })
})
