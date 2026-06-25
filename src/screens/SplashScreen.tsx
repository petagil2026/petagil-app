import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useTheme } from '@/theme'

export function SplashScreen() {
  const theme = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.bg.container }]}>
      <Text style={[theme.textStyles.h1600, { color: theme.semantic.text.primary }, styles.brandLogo]}>
        PetÁgil
      </Text>
      <ActivityIndicator size="large" color={theme.colors.brandBlue[6]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    marginBottom: 24,
  },
})
