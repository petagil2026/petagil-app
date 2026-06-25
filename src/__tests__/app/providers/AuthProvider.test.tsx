import React, { type ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '@/app/providers';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider (mock)', () => {
  it('login(role) autentica e fixa o papel (AC4/AC5)', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('tutor');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.selectedRole).toBe('tutor');
    expect(result.current.user?.role).toBe('tutor');
  });

  it('selectRole troca o papel sem desautenticar', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('tutor');
    });
    act(() => {
      result.current.selectRole('vet');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.selectedRole).toBe('vet');
  });

  it('logout limpa a sessão (AC7)', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('vet');
    });
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.selectedRole).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('restaura sessão persistida no mount antes de isLoading virar false (AC6)', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'petagil_user_data') {
        return Promise.resolve(
          JSON.stringify({ sub: 'mock-tutor', id: 'mock-tutor', email: null, name: 'Tutor', role: 'tutor' })
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
