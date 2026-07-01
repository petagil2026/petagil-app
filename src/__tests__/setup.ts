/**
 * Jest Setup File
 * Configures global mocks and test environment
 */
/* eslint-disable @typescript-eslint/no-require-imports, react/display-name */

// Eagerly materialize expo winter lazy globals to prevent "import outside scope" errors
// during Jest teardown. The getter fires require() lazily — if Jest closes the module
// registry first, it throws. Accessing the property here forces eager evaluation.
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (globalThis as any).__ExpoImportMetaRegistry
} catch {
  // Ignore if not available
}

// Set environment variable BEFORE any imports
process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com'
process.env.EXPO_PUBLIC_SENTRY_DSN = ''

// Activate Lingui with source-locale so t`...` returns the literal message in tests.
// Without this, calls to i18n._() throw when no locale is active.
import { i18n } from '@lingui/core'
i18n.load('pt-BR', {})
i18n.activate('pt-BR')

// Define React Native __DEV__ global for test environment
;(globalThis as Record<string, unknown>).__DEV__ = true

// Mock @sentry/react-native before any module imports it
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  withScope: jest.fn((cb: (scope: unknown) => void) =>
    cb({ setContext: jest.fn(), setExtra: jest.fn() })
  ),
  Severity: { Info: 'info', Error: 'error', Warning: 'warning' },
  ReactNativeTracing: jest.fn(),
  wrap: (component: unknown) => component,
}))

// Mock expo-updates (used by useOTAUpdate hook)
jest.mock('expo-updates', () => ({
  isEnabled: false,
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}))

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}))

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
}))

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
      name: 'PetÁgil',
    },
  },
}))

// Mock expo-haptics — funções comuns (não jest.fn) pra sobreviver ao
// `resetMocks:true` do jest.config (resetAllMocks limpa implementações de jest.fn).
jest.mock('expo-haptics', () => ({
  notificationAsync: () => Promise.resolve(),
  selectionAsync: () => Promise.resolve(),
  impactAsync: () => Promise.resolve(),
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}))

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}))

// Mock @react-native-async-storage/async-storage — funções comuns (não jest.fn) pra
// sobreviver ao `resetMocks:true` do jest.config, que apaga implementações de jest.fn.
// (ThemeProvider chama getItem().then() no mount; sem isso quebra em testes de tela.)
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(undefined),
    removeItem: () => Promise.resolve(undefined),
  },
}))

// Mock react-native Platform + alguns wrappers leves o suficiente pra renderizar.
jest.mock('react-native', () => {
  const React = require('react')
  const passthrough =
    (tag: string) =>
    ({ children, ...rest }: { children?: unknown; [k: string]: unknown }) =>
      React.createElement(tag, rest, children)
  return {
    Platform: {
      OS: 'ios',
      select: <T>(spec: { ios?: T; android?: T; default?: T }): T | undefined =>
        spec.ios ?? spec.default,
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    StyleSheet: {
      create: <T extends Record<string, unknown>>(s: T) => s,
      hairlineWidth: 1,
      absoluteFill: {},
      absoluteFillObject: {},
      flatten: (s: unknown) => s,
    },
    View: passthrough('View'),
    Text: passthrough('Text'),
    TextInput: passthrough('TextInput'),
    Image: passthrough('Image'),
    ScrollView: passthrough('ScrollView'),
    FlatList: passthrough('FlatList'),
    SectionList: passthrough('SectionList'),
    TouchableOpacity: ({
      children,
      onPress,
      onLongPress,
      disabled,
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }: {
      [k: string]: unknown
      children?: unknown
      onPress?: () => void
      onLongPress?: () => void
      disabled?: boolean
    }) =>
      React.createElement(
        'TouchableOpacity',
        {
          onPress: disabled ? undefined : onPress,
          onLongPress: disabled ? undefined : onLongPress,
          disabled,
          accessibilityLabel,
          accessibilityRole,
          ...rest,
        },
        children
      ),
    TouchableWithoutFeedback: passthrough('TouchableWithoutFeedback'),
    TouchableHighlight: passthrough('TouchableHighlight'),
    Pressable: ({
      children,
      onPress,
      ...rest
    }: {
      [k: string]: unknown
      children?: unknown
      onPress?: () => void
    }) => React.createElement('Pressable', { onPress, ...rest }, children),
    Modal: ({
      children,
      visible,
      ...rest
    }: {
      children?: unknown
      visible?: boolean
      [k: string]: unknown
    }) => (visible ? React.createElement('Modal', rest, children) : null),
    ActivityIndicator: passthrough('ActivityIndicator'),
    Switch: passthrough('Switch'),
    RefreshControl: passthrough('RefreshControl'),
    Animated: {
      View: passthrough('AnimatedView'),
      Value: function (_v: number) {
        return { setValue: jest.fn(), interpolate: jest.fn() }
      },
      timing: () => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
      sequence: (_arr: unknown[]) => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
      loop: (_anim: unknown) => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
      parallel: (_arr: unknown[]) => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
      spring: () => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
    },
    PanResponder: {
      create: () => ({ panHandlers: {} }),
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    Keyboard: { dismiss: jest.fn() },
    useColorScheme: () => 'light',
    // Funções comuns (não jest.fn) pra sobreviver ao `resetMocks` — telas que usam
    // BackHandler precisam que `addEventListener` ainda retorne a subscription no cleanup.
    BackHandler: {
      addEventListener: () => ({ remove: () => {} }),
      removeEventListener: () => {},
    },
    Easing: { out: () => () => 0, in: () => () => 0, inOut: () => () => 0, ease: () => 0 },
  }
})

// Mock react-native-svg (Mixin field não existe em ambiente Jest sem RN runtime)
jest.mock('react-native-svg', () => {
  const React = require('react')
  const View = ({ children }: { children?: unknown }) =>
    React.createElement('SvgView', null, children)
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Path: View,
    Circle: View,
    Rect: View,
    G: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    ClipPath: View,
    Polygon: View,
    Line: View,
    Ellipse: View,
    Mask: View,
    Use: View,
    Pattern: View,
    Filter: View,
  }
})

// Mock react-native-gesture-handler (TurboModuleRegistry.getEnforcing indisponível no Jest)
jest.mock('react-native-gesture-handler', () => {
  const React = require('react')
  const View = ({ children, ...rest }: { children?: unknown; [k: string]: unknown }) =>
    React.createElement('View', rest, children)
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    GestureDetector: View,
    ScrollView: View,
    State: {},
    Directions: {},
    Gesture: { Pan: () => ({ onUpdate: () => ({ onEnd: () => ({}) }) }) },
  }
})

// Mock react-native-reanimated — implementação mínima síncrona pro ambiente Jest
jest.mock('react-native-reanimated', () => {
  const React = require('react')
  const View = ({ children, ...rest }: { children?: unknown; [k: string]: unknown }) =>
    React.createElement('AnimatedView', rest, children)
  const identity = (v: unknown) => v
  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      ScrollView: View,
      createAnimatedComponent: (c: unknown) => c,
    },
    View,
    Text: View,
    ScrollView: View,
    useSharedValue: (v: unknown) => ({ value: v }),
    useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
    useAnimatedStyle: () => ({}),
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: () => () => {},
    useAnimatedReaction: () => {},
    withTiming: identity,
    withSpring: identity,
    withDelay: (_d: number, v: unknown) => v,
    withRepeat: identity,
    withSequence: (...args: unknown[]) => args[0],
    cancelAnimation: () => {},
    interpolate: (v: number) => v,
    interpolateColor: () => '#000',
    runOnJS: (fn: unknown) => fn,
    runOnUI: (fn: unknown) => fn,
    Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Easing: {
      linear: () => 0,
      ease: () => 0,
      in: () => () => 0,
      out: () => () => 0,
      inOut: () => () => 0,
      bezier: () => ({ factory: () => 0 }),
    },
  }
})

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react')
  const View = ({ children }: { children?: unknown }) => React.createElement('View', null, children)
  return {
    __esModule: true,
    default: View,
    BottomSheetView: View,
    BottomSheetBackdrop: View,
    BottomSheetModal: View,
    BottomSheetModalProvider: View,
    useBottomSheetTimingConfigs: () => ({}),
  }
})

// Mock react-native-keyboard-controller (KeyboardAwareScrollView + hooks usados nas telas/UI)
jest.mock('react-native-keyboard-controller', () => {
  const React = require('react')
  const passthrough =
    (tag: string) =>
    ({ children, ...rest }: { children?: unknown; [k: string]: unknown }) =>
      React.createElement(tag, rest, children)
  return {
    KeyboardProvider: passthrough('KeyboardProvider'),
    KeyboardAwareScrollView: passthrough('KeyboardAwareScrollView'),
    useReanimatedKeyboardAnimation: () => ({ height: { value: 0 }, progress: { value: 0 } }),
  }
})

// Global fetch mock
global.fetch = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
