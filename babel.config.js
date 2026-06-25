export default function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@lingui/babel-plugin-lingui-macro',
      // Reanimated/Worklets babel plugin — must be the last plugin.
      'react-native-worklets/plugin',
    ],
  }
}
