import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { ThemeProvider } from '@/theme';
import { ToastProvider } from '@/components/ui';
import { LoginScreen } from '@/screens/auth/LoginScreen';

// --- Mocks de dependências nativas/navegação (RN já é mockado em setup.ts) ---

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: ({ children }: { children?: ReactNode }) =>
      React.createElement('LinearGradient', null, children),
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: { children?: ReactNode }) =>
      React.createElement('SafeAreaProvider', null, children),
  };
});

function renderLogin(props: Partial<React.ComponentProps<typeof LoginScreen>> = {}) {
  return render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider defaultColorScheme="light">
        <ToastProvider>
          <LoginScreen {...props} />
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

describe('LoginScreen (frontend-only)', () => {
  it('AC1: renderiza header, inputs e botões', () => {
    renderLogin();
    expect(screen.getByTestId('login-email')).toBeTruthy();
    expect(screen.getByTestId('login-password')).toBeTruthy();
    expect(screen.getByTestId('login-submit')).toBeTruthy();
    expect(screen.getByTestId('login-google')).toBeTruthy();
    expect(screen.getByTestId('login-register-link')).toBeTruthy();
    expect(screen.getByText('Cuidar do seu pet ficou simples')).toBeTruthy();
  });

  it('AC2: botão "Entrar" desabilitado com campos vazios e seam não é chamado', () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderLogin({ onSubmit });

    const submit = screen.getByTestId('login-submit');
    expect(submit.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(submit);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('AC3: email inválido no submit mostra erro e não chama o seam', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderLogin({ onSubmit });

    fireEvent.changeText(screen.getByTestId('login-email'), 'invalido');
    fireEvent.changeText(screen.getByTestId('login-password'), 'senha123');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText('Digite um e-mail válido')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('AC4: caminho feliz chama o seam 1x com as credenciais (sem navegar pela tela)', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderLogin({ onSubmit });

    fireEvent.changeText(screen.getByTestId('login-email'), 'tutor@petagil.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'senha123');
    fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'tutor@petagil.com', password: 'senha123' });
    // A navegação é dirigida pelo AuthProvider/RootNavigator ao autenticar, não pela tela.
    expect(mockNavigate).not.toHaveBeenCalled();
    // O seam é injetado (spy) — nenhuma chamada de rede direta deve ocorrer aqui.
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('AC4 (loading): enquanto o seam está pendente, o botão mostra loading (sem o texto "Entrar")', async () => {
    let resolveSubmit: () => void = () => {};
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );
    renderLogin({ onSubmit });

    fireEvent.changeText(screen.getByTestId('login-email'), 'tutor@petagil.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'senha123');
    fireEvent.press(screen.getByTestId('login-submit'));

    // Pendente: GradientButton troca o título por um ActivityIndicator e fica desabilitado.
    await waitFor(() => expect(screen.queryByText('Entrar')).toBeNull());
    expect(screen.getByTestId('login-submit').props.accessibilityState.disabled).toBe(true);

    await act(async () => {
      resolveSubmit();
    });
    // Concluído: o botão volta ao estado normal (título "Entrar" reaparece).
    await waitFor(() => expect(screen.getByText('Entrar')).toBeTruthy());
  });

  it('AC9 (teclado): "done" na senha dispara o submit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderLogin({ onSubmit });

    fireEvent.changeText(screen.getByTestId('login-email'), 'tutor@petagil.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'senha123');
    fireEvent(screen.getByTestId('login-password'), 'submitEditing');

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'tutor@petagil.com', password: 'senha123' });
  });

  it('AC5: seam rejeitando exibe erro de formulário', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('falha'));
    renderLogin({ onSubmit });

    fireEvent.changeText(screen.getByTestId('login-email'), 'tutor@petagil.com');
    fireEvent.changeText(screen.getByTestId('login-password'), 'senha123');
    fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText('Não foi possível entrar. Tente novamente.')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('AC6: "Continuar com Google" mostra feedback "em breve" e não autentica', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderLogin({ onSubmit });

    fireEvent.press(screen.getByTestId('login-google'));

    expect(await screen.findByText('Login com Google em breve')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('AC7: "Cadastre-se" é inerte (stub) e não navega', async () => {
    renderLogin();
    fireEvent.press(screen.getByTestId('login-register-link'));
    expect(await screen.findByText('Cadastro em breve')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
