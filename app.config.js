/**
 * app.config.js — Expo dynamic config
 *
 * Extends app.json with environment-specific overrides.
 * usesCleartextTraffic is enabled only in dev (local API over HTTP).
 * In production builds (EAS) it must be false for Play Store compliance.
 */

// APP_ENV is set by EAS Build profiles (e.g. "production", "preview").
// Falls back to NODE_ENV for local runs.
const IS_DEV =
  process.env.APP_ENV === 'development' ||
  (!process.env.APP_ENV && process.env.NODE_ENV !== 'production')

/** @param {{ config: import('@expo/config-types').ExpoConfig }} ctx */
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    usesCleartextTraffic: IS_DEV,
  },
})
