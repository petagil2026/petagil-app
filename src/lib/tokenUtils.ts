/**
 * Token Utilities for JWT handling
 * Client-side utilities for decoding and validating JWT tokens
 * Based on: hashtag-web/src/lib/tokenUtils.ts
 */

import type { TokenPayload, User } from '@/types/auth'

/**
 * Decode a JWT token payload without verifying the signature.
 * Safe for client-side use as the server validates tokens.
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    // Handle padding
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

    // React Native has atob available
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload) as TokenPayload
  } catch {
    return null
  }
}

/**
 * Check if a JWT token is expired based on the exp claim.
 * @param bufferSeconds - Buffer before actual expiry (default: 30s)
 */
export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = decodeToken(token)

  if (!payload?.exp) {
    return true
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expiryTime = payload.exp * 1000
  const bufferMs = bufferSeconds * 1000

  return Date.now() >= expiryTime - bufferMs
}

/**
 * Extract user information from an id_token.
 */
export function getUserFromIdToken(idToken: string): User | null {
  const payload = decodeToken(idToken)

  if (!payload?.sub) {
    return null
  }

  // Handle Cognito-specific claims
  const cognitoUsername = payload['cognito:username'] as string | undefined

  return {
    sub: payload.sub,
    email: payload.email || cognitoUsername || null,
    name: payload.name || cognitoUsername || null,
  }
}
