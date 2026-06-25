import React, { type ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '@/app/providers';
import { loginRequest, logoutRequest } from '@/services/api';

// Auth real é via rede — mockamos o serviço de auth (sem httpClient/fetch).
jest.mock('@/services/api', () => ({
  loginRequest: jest.fn(),
  logoutRequest: jest.fn(),
  setOnAuthFailure: jest.fn(),
}));

const mockLogin = loginRequest as jest.MockedFunction<typeof loginRequest>;
const mockLogout = logoutRequest as jest.MockedFunction<typeof logoutRequest>;

const TUTOR_RESULT = {
  tokens: { access_token: 'a', id_token: 'i', refresh_token: 'r', expires_in: 900 },
  user: {
    sub: 'u1',
    id: 'u1',
    email: 'tutor@petagil.app',
    name: 'Tutor',
    role: 'tutor' as const,
  },
};

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider', () => {
  beforeEach(() => {
    mockLogin.mockResolvedValue(TUTOR_RESULT);
    mockLogout.mockResolvedValue(undefined);
  });

  it('login(email,password) autentica e fixa o papel vindo do servidor', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('tutor@petagil.app', 'Petagil123');
    });

    expect(mockLogin).toHaveBeenCalledWith('tutor@petagil.app', 'Petagil123');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.selectedRole).toBe('tutor');
    expect(result.current.user?.role).toBe('tutor');
  });

  it('login propaga o erro e mantém não autenticado', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.login('x@y.com', 'errada')).rejects.toThrow();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('selectRole troca o papel sem desautenticar', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('tutor@petagil.app', 'Petagil123');
    });
    act(() => {
      result.current.selectRole('vet');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.selectedRole).toBe('vet');
  });

  it('logout avisa o servidor e limpa a sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('tutor@petagil.app', 'Petagil123');
    });
    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.selectedRole).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('restaura sessão persistida no mount antes de isLoading virar false', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'petagil_user_data') {
        return Promise.resolve(
          JSON.stringify({ sub: 'u1', id: 'u1', email: null, name: 'Tutor', role: 'tutor' })
        );
      }
      if (key === 'petagil_selected_role') return Promise.resolve('tutor');
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.selectedRole).toBe('tutor');
    expect(result.current.user?.name).toBe('Tutor');
  });
});
