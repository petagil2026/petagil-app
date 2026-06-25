/**
 * Sentry monitoring service
 *
 * DSN configurado via variável de ambiente:
 *   EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
 */
import * as SentryLib from '@sentry/react-native';

/**
 * Inicializa o Sentry. Deve ser chamado no index.ts antes de qualquer import de componente.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (__DEV__) {
      console.warn('[Sentry] EXPO_PUBLIC_SENTRY_DSN não definido — Sentry desabilitado');
    }
    return;
  }

  SentryLib.init({
    dsn,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 0 : 0.2,
  });

  if (__DEV__) {
    console.log('[Sentry] Inicializado com sucesso');
  }
}

/**
 * Captura uma exceção no Sentry.
 * Seguro para chamar mesmo se Sentry não estiver configurado.
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  try {
    SentryLib.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Nunca deixar o handler de erro causar um crash
  }
}

/**
 * Captura uma mensagem no Sentry.
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
): void {
  try {
    SentryLib.captureMessage(message, level);
  } catch {
    // Nunca deixar o handler de erro causar um crash
  }
}

/**
 * Define o usuário atual no Sentry para contexto.
 */
export function setSentryUser(user: { id?: string; email?: string } | null): void {
  try {
    SentryLib.setUser(user);
  } catch {
    // Silencioso
  }
}

export const Sentry = {
  init: initSentry,
  captureException,
  captureMessage,
  setUser: setSentryUser,
};
