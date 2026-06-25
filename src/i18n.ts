import { i18n } from '@lingui/core'
import { getLocales } from 'expo-localization'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const locales = {
  'pt-BR': 'Português',
  es: 'Español',
} as const

export type Locale = keyof typeof locales

const LOCALE_STORAGE_KEY = 'petagil-locale'

export function getDeviceLocale(): Locale {
  const deviceLocales = getLocales()
  const deviceLang = deviceLocales[0]?.languageTag

  if (deviceLang && deviceLang in locales) return deviceLang as Locale
  if (deviceLang?.startsWith('es')) return 'es'
  return 'pt-BR'
}

async function getSavedLocale(): Promise<Locale | null> {
  const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved && saved in locales) return saved as Locale
  return null
}

async function loadMessages(locale: Locale) {
  switch (locale) {
    case 'pt-BR': {
      const { messages } = await import('./locales/pt-BR/messages')
      return messages
    }
    case 'es': {
      const { messages } = await import('./locales/es/messages')
      return messages
    }
  }
}

export async function activateLocale(locale: Locale) {
  const messages = await loadMessages(locale)
  i18n.load(locale, messages)
  i18n.activate(locale)
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export async function initI18n() {
  try {
    const saved = await getSavedLocale()
    const locale = saved ?? getDeviceLocale()
    await activateLocale(locale)
  } catch {
    // Fallback: activate pt-BR with empty messages so app doesn't crash
    i18n.load('pt-BR', {})
    i18n.activate('pt-BR')
  }
}

export { i18n }
