import React, { type ReactNode } from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { ThemeProvider } from '@/theme'
import { CreateAccountScreen } from '@/screens/auth/CreateAccountScreen'

// --- Mocks (RN já mockado em setup.ts; keyboard-controller idem) ---
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}))

jest.mock('expo-linear-gradient', () => {
  const React = require('react')
  return {
    LinearGradient: ({ children }: { children?: ReactNode }) =>
      React.createElement('LinearGradient', null, children),
  }
})

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }))

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: { children?: ReactNode }) =>
      React.createElement('SafeAreaProvider', null, children),
  }
})

function renderScreen() {
  return render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider defaultColorScheme="light">
        <CreateAccountScreen />
      </ThemeProvider>
    </I18nProvider>
  )
}

function fillValid() {
  fireEvent.changeText(screen.getByTestId('cadastro-name'), 'Maria Silva')
  fireEvent.changeText(screen.getByTestId('cadastro-email'), 'maria@petagil.app')
  fireEvent.changeText(screen.getByTestId('cadastro-phone'), '11999999999')
  fireEvent.changeText(screen.getByTestId('cadastro-city'), 'São Paulo')
  fireEvent.changeText(screen.getByTestId('cadastro-password'), 'senha123')
}

describe('CreateAccountScreen', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('AC1: renderiza os 5 campos, o CTA e o rodapé de termos', () => {
    renderScreen()
    expect(screen.getByTestId('cadastro-name')).toBeTruthy()
    expect(screen.getByTestId('cadastro-email')).toBeTruthy()
    expect(screen.getByTestId('cadastro-phone')).toBeTruthy()
    expect(screen.getByTestId('cadastro-city')).toBeTruthy()
    expect(screen.getByTestId('cadastro-password')).toBeTruthy()
    expect(screen.getByTestId('cadastro-submit')).toBeTruthy()
    expect(screen.getByText('Ao continuar você aceita os Termos de Uso')).toBeTruthy()
  })

  it('AC2: botão desabilitado com campos vazios e não navega', () => {
    renderScreen()
    const submit = screen.getByTestId('cadastro-submit')
    expect(submit.props.accessibilityState.disabled).toBe(true)
    fireEvent.press(submit)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('AC3: e-mail inválido bloqueia o submit e mostra erro inline', async () => {
    renderScreen()
    fillValid()
    fireEvent.changeText(screen.getByTestId('cadastro-email'), 'invalido')
    fireEvent.press(screen.getByTestId('cadastro-submit'))
    expect(await screen.findByText('Digite um e-mail válido')).toBeTruthy()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('AC3b: senha com menos de 8 caracteres bloqueia o submit', async () => {
    renderScreen()
    fillValid()
    fireEvent.changeText(screen.getByTestId('cadastro-password'), '123')
    fireEvent.press(screen.getByTestId('cadastro-submit'))
    expect(await screen.findByText('A senha precisa de ao menos 8 caracteres')).toBeTruthy()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('AC4: caminho feliz navega para RoleSelect com o rascunho da conta (phone só-dígitos)', () => {
    renderScreen()
    fillValid()
    fireEvent.press(screen.getByTestId('cadastro-submit'))
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('RoleSelect', {
      account: {
        name: 'Maria Silva',
        email: 'maria@petagil.app',
        phone: '11999999999',
        city: 'São Paulo',
        password: 'senha123',
      },
    })
  })

  it('AC7: alterna mostrar/ocultar senha', () => {
    renderScreen()
    const pwd = screen.getByTestId('cadastro-password')
    expect(pwd.props.secureTextEntry).toBe(true)
    fireEvent.press(screen.getByTestId('cadastro-password-toggle'))
    expect(screen.getByTestId('cadastro-password').props.secureTextEntry).toBe(false)
  })
})
