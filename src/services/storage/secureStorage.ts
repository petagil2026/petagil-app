/**
 * Secure Storage wrapper for expo-secure-store
 * @module services/storage/secureStorage
 *
 * Provides type-safe storage for sensitive data like auth tokens.
 * Uses iOS Keychain / Android Keystore for secure encryption.
 */

import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

import type { Tokens } from '@/types/auth'

// Storage keys
const ACCESS_TOKEN_KEY = 'petagil_access_token'
const ID_TOKEN_KEY = 'petagil_id_token'
const REFRESH_TOKEN_KEY = 'petagil_refresh_token'
const USER_KEY = 'petagil_user_data'
const SELECTED_ROLE_KEY = 'petagil_selected_role'
const LAST_AGENT_KEY = 'petagil_last_agent'
const LAST_MODEL_ID_KEY = 'petagil_last_model_id'

const IOS_KEYCHAIN_LIMIT = 2048
const IS_WEB = Platform.OS === 'web'
const IS_IOS = Platform.OS === 'ios'

let webWarningShown = false

function logWebWarning(): void {
  if (IS_WEB && !webWarningShown) {
    console.warn('[secureStorage] Web platform detected - storage is NOT secure')
    webWarningShown = true
  }
}

function validateIosSize(value: string, operation: string): void {
  if (IS_IOS) {
    const byteSize = new TextEncoder().encode(value).length
    if (byteSize > IOS_KEYCHAIN_LIMIT) {
      throw new Error(
        `[secureStorage] ${operation} failed: Value exceeds iOS Keychain 2KB limit (${byteSize} bytes)`
      )
    }
  }
}

export interface SecureStorageService {
  // JWT Token methods
  setTokens: (tokens: Tokens) => Promise<void>
  getTokens: () => Promise<Tokens | null>
  getAccessToken: () => Promise<string | null>
  clearTokens: () => Promise<void>
  // User data
  getUser: () => Promise<string | null>
  setUser: (userJson: string) => Promise<void>
  // Selected role (tutor/vet) — fundação mockada
  getSelectedRole: () => Promise<string | null>
  setSelectedRole: (role: string) => Promise<void>
  // Last selections
  getLastAgent: () => Promise<string | null>
  setLastAgent: (agentJson: string) => Promise<void>
  clearLastAgent: () => Promise<void>
  getLastModelId: () => Promise<string | null>
  setLastModelId: (modelId: string) => Promise<void>
  clearLastModelId: () => Promise<void>
  // Session management
  clearSession: () => Promise<void>
}

/**
 * Secure storage service for sensitive data
 * Uses expo-secure-store for encrypted storage on device
 */
export const secureStorage: SecureStorageService = {
  /**
   * Store all JWT tokens (access, id, refresh)
   */
  async setTokens(tokens: Tokens): Promise<void> {
    logWebWarning()
    try {
      validateIosSize(tokens.access_token, 'setTokens.access_token')
      validateIosSize(tokens.id_token, 'setTokens.id_token')
      validateIosSize(tokens.refresh_token, 'setTokens.refresh_token')

      const tokenOptions: SecureStore.SecureStoreOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access_token, tokenOptions),
        SecureStore.setItemAsync(ID_TOKEN_KEY, tokens.id_token, tokenOptions),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token, tokenOptions),
      ])
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] setTokens failed:', error)
      throw error
    }
  },

  /**
   * Get all stored JWT tokens
   * Returns null if any token is missing
   */
  async getTokens(): Promise<Tokens | null> {
    logWebWarning()
    try {
      const [accessToken, idToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(ID_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ])

      if (!accessToken || !idToken || !refreshToken) {
        return null
      }

      return {
        access_token: accessToken,
        id_token: idToken,
        refresh_token: refreshToken,
      }
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] getTokens failed:', error)
      throw error
    }
  },

  /**
   * Get only the access token (for API calls)
   */
  async getAccessToken(): Promise<string | null> {
    logWebWarning()
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] getAccessToken failed:', error)
      throw error
    }
  },

  /**
   * Clear all JWT tokens
   */
  async clearTokens(): Promise<void> {
    logWebWarning()
    const results = await Promise.allSettled([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(ID_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ])

    const keys = [ACCESS_TOKEN_KEY, ID_TOKEN_KEY, REFRESH_TOKEN_KEY]
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        if (__DEV__) console.error(`[secureStorage] clearTokens failed for ${keys[index]}:`, result.reason)
      }
    })
  },

  /**
   * Get the stored user data as JSON string
   */
  async getUser(): Promise<string | null> {
    logWebWarning()
    try {
      return await SecureStore.getItemAsync(USER_KEY)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] getUser failed:', error)
      throw error
    }
  },

  /**
   * Store user data as JSON string
   */
  async setUser(userJson: string): Promise<void> {
    logWebWarning()
    try {
      validateIosSize(userJson, 'setUser')
      await SecureStore.setItemAsync(USER_KEY, userJson)
    } catch (error) {
      if (__DEV__) console.error(`[secureStorage] setUser failed:`, error)
      throw error
    }
  },

  /**
   * Get the persisted selected role (tutor/vet), or null
   */
  async getSelectedRole(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(SELECTED_ROLE_KEY)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] getSelectedRole failed:', error)
      return null
    }
  },

  /**
   * Persist the selected role (tutor/vet)
   */
  async setSelectedRole(role: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SELECTED_ROLE_KEY, role)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] setSelectedRole failed:', error)
    }
  },

  async getLastAgent(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(LAST_AGENT_KEY)
    } catch {
      return null
    }
  },

  async setLastAgent(agentJson: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(LAST_AGENT_KEY, agentJson)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] setLastAgent failed:', error)
    }
  },

  async clearLastAgent(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(LAST_AGENT_KEY)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] clearLastAgent failed:', error)
    }
  },

  async getLastModelId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(LAST_MODEL_ID_KEY)
    } catch {
      return null
    }
  },

  async setLastModelId(modelId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(LAST_MODEL_ID_KEY, modelId)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] setLastModelId failed:', error)
    }
  },

  async clearLastModelId(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(LAST_MODEL_ID_KEY)
    } catch (error) {
      if (__DEV__) console.error('[secureStorage] clearLastModelId failed:', error)
    }
  },

  /**
   * Clear all session data (tokens + user)
   * Called on logout or 401
   */
  async clearSession(): Promise<void> {
    logWebWarning()
    const results = await Promise.allSettled([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(ID_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(SELECTED_ROLE_KEY),
    ])

    const keys = [ACCESS_TOKEN_KEY, ID_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, SELECTED_ROLE_KEY]
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        if (__DEV__) console.error(`[secureStorage] clearSession failed for ${keys[index]}:`, result.reason)
      }
    })
  },
}
