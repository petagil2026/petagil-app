/**
 * useRefetchOnFocus — revalida dados quando a tela volta ao foco
 * Útil para dados que podem mudar em background
 *
 * Pula a primeira execução (montagem inicial) para não duplicar
 * a busca que o TanStack Query já faz ao montar a query.
 */
import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * @param refetch - Função de refetch da query
 * @param enabled - Se false, não executa refetch ao focar (default: true)
 */
export function useRefetchOnFocus(refetch: () => void, enabled = true): void {
  const firstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstMount.current) {
        firstMount.current = false;
        return;
      }
      if (!enabled) return;
      refetch();
    }, [refetch, enabled]),
  );
}
