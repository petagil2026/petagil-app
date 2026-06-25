/**
 * Stub mock para react-native em component tests.
 * Renderiza componentes nativos como elementos vanilla preservando children e props
 * para que @testing-library/react-native consiga query por texto.
 *
 * Uso: `jest.mock('react-native', () => require('@/__tests__/__mocks__/reactNativeStub'))`
 */
const React = require('react')

const passthrough = (name) =>
  React.forwardRef(function Stub(props, ref) {
    const { children, ...rest } = props || {}
    return React.createElement(name, { ref, ...rest }, children)
  })

const View = passthrough('View')
const Text = passthrough('Text')
const TouchableOpacity = passthrough('TouchableOpacity')
const TouchableHighlight = passthrough('TouchableHighlight')
const TouchableWithoutFeedback = passthrough('TouchableWithoutFeedback')
const Pressable = passthrough('Pressable')
const Image = passthrough('Image')
const ImageBackground = passthrough('ImageBackground')
const ScrollView = passthrough('ScrollView')
const ActivityIndicator = passthrough('ActivityIndicator')
const Modal = passthrough('Modal')
const SafeAreaView = passthrough('SafeAreaView')
const KeyboardAvoidingView = passthrough('KeyboardAvoidingView')
const RefreshControl = passthrough('RefreshControl')
const Switch = passthrough('Switch')
const TextInput = passthrough('TextInput')

const FlatList = React.forwardRef(function FlatListStub(
  { data = [], renderItem, ListHeaderComponent, ListFooterComponent, keyExtractor },
  ref,
) {
  const renderEmbedded = (slot) => {
    if (!slot) return null
    if (typeof slot === 'function') return React.createElement(slot)
    return slot
  }
  return React.createElement(
    'FlatList',
    { ref },
    renderEmbedded(ListHeaderComponent),
    data.map((item, index) =>
      React.createElement(
        React.Fragment,
        { key: keyExtractor ? keyExtractor(item, index) : index },
        renderItem ? renderItem({ item, index }) : null,
      ),
    ),
    renderEmbedded(ListFooterComponent),
  )
})
const SectionList = FlatList

class AnimatedValue {
  constructor(value) {
    this.value = value
  }
  interpolate() {
    return this
  }
  setValue(v) {
    this.value = v
  }
  addListener() {
    return ''
  }
  removeListener() {}
  removeAllListeners() {}
  stopAnimation() {}
}

const Animated = {
  View: passthrough('AnimatedView'),
  Text: passthrough('AnimatedText'),
  Image: passthrough('AnimatedImage'),
  ScrollView: passthrough('AnimatedScrollView'),
  Value: AnimatedValue,
  ValueXY: AnimatedValue,
  timing: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
  sequence: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
  parallel: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
  delay: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
  loop: () => ({ start: () => {}, stop: () => {} }),
  spring: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
  decay: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
  event: () => () => {},
  createAnimatedComponent: (Comp) => Comp,
  add: (a) => a,
  subtract: (a) => a,
  multiply: (a) => a,
  divide: (a) => a,
  modulo: (a) => a,
  diffClamp: (a) => a,
}

const StyleSheet = {
  create: (styles) => styles,
  flatten: (s) => s,
  hairlineWidth: 1,
  absoluteFillObject: {},
  absoluteFill: {},
  compose: (a, b) => [a, b],
}

const Platform = {
  OS: 'ios',
  Version: 0,
  isPad: false,
  isTV: false,
  select: (opts) => {
    if (Platform.OS in opts) return opts[Platform.OS]
    return opts.default
  },
}

const __appStateHandlers = new Set()
const AppState = {
  currentState: 'active',
  addEventListener: (event, handler) => {
    if (event === 'change') __appStateHandlers.add(handler)
    return {
      remove: () => {
        __appStateHandlers.delete(handler)
      },
    }
  },
  __triggerChange: (next) => {
    AppState.currentState = next
    // Snapshot — handler pode chamar addEventListener/remove mutando o Set
    // durante a iteração.
    Array.from(__appStateHandlers).forEach((h) => h(next))
  },
  __resetHandlers: () => __appStateHandlers.clear(),
}

const Dimensions = {
  get: () => ({ width: 375, height: 667, scale: 2, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
}

const Linking = {
  openURL: () => Promise.resolve(),
  canOpenURL: () => Promise.resolve(true),
  addEventListener: () => ({ remove: () => {} }),
  getInitialURL: () => Promise.resolve(null),
}

const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
}

const InteractionManager = {
  runAfterInteractions: (cb) => {
    if (cb) cb()
    return { cancel: () => {} }
  },
  createInteractionHandle: () => 0,
  clearInteractionHandle: () => {},
}

const useColorScheme = () => 'light'
const useWindowDimensions = () => Dimensions.get()
const findNodeHandle = () => null

const NativeModules = new Proxy(
  {},
  {
    get: () => new Proxy({}, { get: () => () => {} }),
  },
)

const PixelRatio = {
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (s) => s * 2,
  roundToNearestPixel: (s) => Math.round(s),
}

const Alert = {
  alert: () => {},
  prompt: () => {},
}

module.exports = {
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  RefreshControl,
  Switch,
  TextInput,
  FlatList,
  SectionList,
  Animated,
  StyleSheet,
  Platform,
  AppState,
  Dimensions,
  Linking,
  Keyboard,
  InteractionManager,
  NativeModules,
  PixelRatio,
  Alert,
  useColorScheme,
  useWindowDimensions,
  findNodeHandle,
}
