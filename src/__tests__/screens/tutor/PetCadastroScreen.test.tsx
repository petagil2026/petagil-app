/**
 * Testes da `PetCadastroScreen`. Molde de `CreateAccountScreen.test.tsx`:
 * mocka native deps (linear-gradient, status-bar, safe-area, image-picker) e a
 * feature `pets` (para um `useCreatePet` controlável). `onDone` é um jest.fn.
 */
import React, { type ReactNode } from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { ThemeProvider } from '@/theme'
import { ToastProvider } from '@/components/ui'
import { PetCadastroScreen } from '@/screens/tutor'

// useCreatePet controlável: `mockMutate` decide success/error; `mockIsPending` o estado.
const mockMutate = jest.fn()
let mockIsPending = false

jest.mock('@/features/pets', () => {
  const actual = jest.requireActual('@/features/pets')
  return {
    ...actual,
    useCreatePet: () => ({ mutate: mockMutate, isPending: mockIsPending }),
  }
})

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

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
}))

function renderScreen() {
  const onDone = jest.fn()
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider defaultColorScheme="light">
        <ToastProvider>
          <PetCadastroScreen onDone={onDone} />
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  )
  return onDone
}

describe('PetCadastroScreen', () => {
  beforeEach(() => {
    mockMutate.mockReset()
    mockIsPending = false
  })

  it('AC1: renderiza nome, 4 pílulas de espécie, salvar e adicionar (sem "Concluir")', () => {
    renderScreen()
    expect(screen.getByTestId('pet-name')).toBeTruthy()
    expect(screen.getByTestId('pet-species-dog')).toBeTruthy()
    expect(screen.getByTestId('pet-species-cat')).toBeTruthy()
    expect(screen.getByTestId('pet-species-bird')).toBeTruthy()
    expect(screen.getByTestId('pet-species-reptile')).toBeTruthy()
    expect(screen.getByTestId('pet-save')).toBeTruthy()
    expect(screen.getByTestId('pet-add-another')).toBeTruthy()
    expect(screen.queryByTestId('pet-done')).toBeNull()
  })

  it('AC5: nome vazio bloqueia o submit (não chama mutate)', () => {
    renderScreen()
    fireEvent.press(screen.getByTestId('pet-save'))
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('idade aceita apenas dígitos (filtra não-numéricos)', () => {
    renderScreen()
    fireEvent.changeText(screen.getByTestId('pet-age'), '1a2.b3')
    expect(screen.getByTestId('pet-age').props.value).toBe('123')
  })

  it('AC5: idade fora de 0–100 bloqueia o submit', () => {
    renderScreen()
    fireEvent.changeText(screen.getByTestId('pet-name'), 'Rex')
    fireEvent.changeText(screen.getByTestId('pet-age'), '150')
    fireEvent.press(screen.getByTestId('pet-save'))
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('AC5: espécie "Outros" bloqueia o submit (placeholder, backend não aceita)', () => {
    renderScreen()
    fireEvent.changeText(screen.getByTestId('pet-name'), 'Rex')
    fireEvent.press(screen.getByTestId('pet-species-other'))
    fireEvent.press(screen.getByTestId('pet-save'))
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('renderiza a faixa de vacinação com botão "Adicionar" (sem navegação)', () => {
    renderScreen()
    expect(screen.getByTestId('pet-vaccine-add')).toBeTruthy()
    // Não deve quebrar ao tocar (ação "em breve", sem navegar).
    fireEvent.press(screen.getByTestId('pet-vaccine-add'))
  })

  it('AC6: "Salvar pet" com sucesso chama onDone', () => {
    mockMutate.mockImplementation((_vars, opts) => opts.onSuccess())
    const onDone = renderScreen()
    fireEvent.changeText(screen.getByTestId('pet-name'), 'Rex')
    fireEvent.press(screen.getByTestId('pet-save'))
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('AC8: "Adicionar outro" sucesso limpa o nome, NÃO chama onDone e revela "Concluir"', () => {
    mockMutate.mockImplementation((_vars, opts) => opts.onSuccess())
    const onDone = renderScreen()
    fireEvent.changeText(screen.getByTestId('pet-name'), 'Rex')
    fireEvent.press(screen.getByTestId('pet-add-another'))
    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByTestId('pet-name').props.value).toBe('')
    expect(screen.getByTestId('pet-done')).toBeTruthy()
  })

  it('AC8: "Concluir" chama onDone sem novo cadastro', () => {
    mockMutate.mockImplementation((_vars, opts) => opts.onSuccess())
    const onDone = renderScreen()
    fireEvent.changeText(screen.getByTestId('pet-name'), 'Rex')
    fireEvent.press(screen.getByTestId('pet-add-another'))
    mockMutate.mockClear()
    fireEvent.press(screen.getByTestId('pet-done'))
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('AC9: durante isPending os CTAs ficam desabilitados', () => {
    mockIsPending = true
    renderScreen()
    expect(screen.getByTestId('pet-save').props.accessibilityState.disabled).toBe(true)
    expect(screen.getByTestId('pet-add-another').props.accessibilityState.disabled).toBe(true)
  })
})
