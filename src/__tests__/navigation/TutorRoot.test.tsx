/**
 * Testes do gate `TutorRoot` (shell do tutor). Mantém o teste leve com sentinelas:
 * - `TutorTabNavigator` vira um sentinela `tutor-tabs` (mock do factory de tabs);
 * - `PetCadastroScreen` vira um sentinela `pet-save`.
 * Mocka `useHasPetFlag` e `useMyPets` para exercitar todos os estados.
 */
import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { ThemeProvider } from '@/theme'

// `@/components/ui` puxa componentes com deps nativas (linear-gradient, safe-area).
jest.mock('expo-linear-gradient', () => {
  const React = require('react')
  return {
    LinearGradient: ({ children }: { children?: unknown }) =>
      React.createElement('LinearGradient', null, children),
  }
})

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: { children?: unknown }) =>
      React.createElement('SafeAreaProvider', null, children),
    SafeAreaView: ({ children }: { children?: unknown }) =>
      React.createElement('SafeAreaView', null, children),
  }
})

const mockUseHasPetFlag = jest.fn()
const mockUseMyPets = jest.fn()

jest.mock('@/features/pets', () => ({
  useHasPetFlag: (...args: unknown[]) => mockUseHasPetFlag(...args),
  useMyPets: (...args: unknown[]) => mockUseMyPets(...args),
}))

jest.mock('@/app/providers', () => ({
  useAuth: () => ({ user: { id: 'u1', sub: 'u1' } }),
}))

// Tabs viram sentinela (sem NavigationContainer).
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react')
  return {
    createBottomTabNavigator: () => ({
      Navigator: () => React.createElement('TutorTabs', { testID: 'tutor-tabs' }),
      Screen: () => null,
    }),
  }
})

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({ Navigator: () => null, Screen: () => null }),
}))

// Telas pesadas viram stubs; PetCadastroScreen vira sentinela `pet-save`.
jest.mock('@/screens/tutor', () => {
  const React = require('react')
  return {
    HomeScreen: () => null,
    BuscaScreen: () => null,
    ConsultasScreen: () => null,
    PetsScreen: () => null,
    PerfilScreen: () => null,
    PetCadastroScreen: ({ onDone }: { onDone: () => void }) =>
      React.createElement('PetCadastro', { testID: 'pet-save', onDone }),
  }
})

jest.mock('@/screens/vet', () => ({
  HomeScreen: () => null,
  AgendaScreen: () => null,
  AvaliacoesScreen: () => null,
  PerfilScreen: () => null,
  EditarPerfilScreen: () => null,
  MeusHorariosScreen: () => null,
  FolgasScreen: () => null,
}))

jest.mock('@/screens', () => ({
  RoleSelectScreen: () => null,
  PlaceholderScreen: () => null,
}))

import { TutorRoot } from '@/navigation/MainNavigator'

function renderRoot() {
  return render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider defaultColorScheme="light">
        <TutorRoot />
      </ThemeProvider>
    </I18nProvider>
  )
}

const idleQuery = { data: undefined, isPending: false, isError: false, refetch: jest.fn() }

describe('TutorRoot (gate de pets)', () => {
  beforeEach(() => {
    mockUseHasPetFlag.mockReset()
    mockUseMyPets.mockReset()
  })

  it('flag "loading" → Splash (sem tabs)', () => {
    mockUseHasPetFlag.mockReturnValue({ status: 'loading', markHasPet: jest.fn() })
    mockUseMyPets.mockReturnValue(idleQuery)
    renderRoot()
    expect(screen.getByText('PetÁgil')).toBeTruthy()
    expect(screen.queryByTestId('tutor-tabs')).toBeNull()
  })

  it('AC3: flag "has" → tabs imediatas, sem consultar a rede (enabled:false)', () => {
    mockUseHasPetFlag.mockReturnValue({ status: 'has', markHasPet: jest.fn() })
    mockUseMyPets.mockReturnValue(idleQuery)
    renderRoot()
    expect(screen.getByTestId('tutor-tabs')).toBeTruthy()
    expect(mockUseMyPets).toHaveBeenCalledWith({ enabled: false })
  })

  it('AC4: flag "unknown" + carregando → loading (sem tabs nem cadastro)', () => {
    mockUseHasPetFlag.mockReturnValue({ status: 'unknown', markHasPet: jest.fn() })
    mockUseMyPets.mockReturnValue({ ...idleQuery, isPending: true })
    renderRoot()
    expect(screen.queryByTestId('tutor-tabs')).toBeNull()
    expect(screen.queryByTestId('pet-save')).toBeNull()
  })

  it('AC4: flag "unknown" + erro → retry, não libera as tabs', () => {
    mockUseHasPetFlag.mockReturnValue({ status: 'unknown', markHasPet: jest.fn() })
    mockUseMyPets.mockReturnValue({ ...idleQuery, isError: true })
    renderRoot()
    expect(screen.getByText('Tentar novamente')).toBeTruthy()
    expect(screen.queryByTestId('tutor-tabs')).toBeNull()
  })

  it('AC2: flag "unknown" + lista vazia → PetCadastroScreen (gate)', () => {
    mockUseHasPetFlag.mockReturnValue({ status: 'unknown', markHasPet: jest.fn() })
    mockUseMyPets.mockReturnValue({ ...idleQuery, data: [] })
    renderRoot()
    expect(screen.getByTestId('pet-save')).toBeTruthy()
    expect(screen.queryByTestId('tutor-tabs')).toBeNull()
  })

  it('AC2: flag "unknown" + ≥1 pet → seta o flag e renderiza as tabs', () => {
    const markHasPet = jest.fn()
    mockUseHasPetFlag.mockReturnValue({ status: 'unknown', markHasPet })
    mockUseMyPets.mockReturnValue({ ...idleQuery, data: [{ id: 'p1' }] })
    renderRoot()
    expect(markHasPet).toHaveBeenCalled()
    expect(screen.getByTestId('tutor-tabs')).toBeTruthy()
  })
})
