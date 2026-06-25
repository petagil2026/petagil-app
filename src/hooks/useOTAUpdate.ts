/**
 * useOTAUpdate — Verificação de OTA updates silenciosa
 * Usa expo-updates
 *
 * Estratégia:
 * - Verifica update SOMENTE em produção (!__DEV__)
 * - Baixa em background sem interromper o uso
 * - Aplica quando voltar ao foreground (não durante uso ativo)
 */
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

export function useOTAUpdate(): void {
  const updateAvailableRef = useRef(false);

  useEffect(() => {
    // Só executa em produção
    if (__DEV__) return;
    if (!Updates.isEnabled) return;

    async function checkForUpdate() {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          updateAvailableRef.current = true;
          // Baixa silenciosamente em background
          await Updates.fetchUpdateAsync();
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[useOTAUpdate] Falha ao verificar update:', error);
        }
      }
    }

    void checkForUpdate();
  }, []);

  // Aplica update quando voltar ao foreground
  useEffect(() => {
    if (__DEV__) return;
    if (!Updates.isEnabled) return;

    const appStateRef = { current: AppState.currentState };

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      const comingToForeground =
        (prevState === 'background' || prevState === 'inactive') &&
        nextState === 'active';

      if (comingToForeground && updateAvailableRef.current) {
        // Aplica o update — o app recarrega automaticamente
        Updates.reloadAsync().catch(() => {});
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);
}
