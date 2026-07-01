/**
 * useHasPetFlag — flag local "este tutor já tem ≥1 pet", persistido por usuário
 * em `AsyncStorage` (`petagil-has-pet:<userId>`).
 *
 * Serve de fast-path para o gate de pets do shell do tutor: se o flag está
 * setado, o tutor entra direto nas tabs SEM chamar a rede (entrada instantânea
 * e funciona offline). O flag é setado ao criar o 1º pet (`markHasPet`) e
 * quando `GET /pets` retorna ≥1.
 *
 * Não é dado sensível → `AsyncStorage` (padrão de preferências do projeto, como
 * `petagil-theme`/`petagil-locale`), NÃO `secureStorage`. Keyed por `userId`
 * para não vazar entre contas no mesmo device.
 *
 * Estados:
 * - `loading`  — ainda lendo o storage (boot);
 * - `has`      — flag setado (tem pet);
 * - `unknown`  — sem flag / sem userId (precisa consultar a rede).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type HasPetStatus = 'loading' | 'has' | 'unknown'

const KEY_PREFIX = 'petagil-has-pet:'

export interface UseHasPetFlagResult {
  status: HasPetStatus
  /** Marca o flag (grava no storage e atualiza o estado para `has`). */
  markHasPet: () => void
}

export function useHasPetFlag(userId?: string): UseHasPetFlagResult {
  const [status, setStatus] = useState<HasPetStatus>('loading')
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Sem usuário: não há como provar localmente → consulta a rede.
    if (!userId) {
      setStatus('unknown')
      return () => {
        isMountedRef.current = false
      }
    }

    setStatus('loading')
    void (async () => {
      try {
        const value = await AsyncStorage.getItem(`${KEY_PREFIX}${userId}`)
        if (isMountedRef.current) {
          setStatus(value === 'true' ? 'has' : 'unknown')
        }
      } catch {
        // Falha de leitura do storage → trata como desconhecido (cai no gate de rede).
        if (isMountedRef.current) setStatus('unknown')
      }
    })()

    return () => {
      isMountedRef.current = false
    }
  }, [userId])

  const markHasPet = useCallback(() => {
    // Set em memória vale para a sessão atual (acabamos de provar que há pet).
    setStatus('has')
    if (userId) {
      void AsyncStorage.setItem(`${KEY_PREFIX}${userId}`, 'true')
    } else if (__DEV__) {
      // Sem userId não há como persistir → o próximo boot re-consultará a rede.
      // O call-site deve resolver o id (ex.: `user?.id ?? user?.sub`).
      console.warn('[useHasPetFlag] markHasPet sem userId: flag não persistido')
    }
  }, [userId])

  return { status, markHasPet }
}
