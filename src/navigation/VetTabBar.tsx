/**
 * VetTabBar — barra inferior FLUTUANTE do veterinário (pill branco arredondado
 * com sombra), fiel ao design. Ícones outline (stroke) desenhados inline, com a
 * barrinha indicadora azul e o label no item ativo.
 */
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'

const ACTIVE = '#2E7CB8'
const INACTIVE = '#9AA7BA'

function TabGlyph({ name, color }: { name: string; color: string }) {
  switch (name) {
    case 'Home':
      return (
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
        >
          <Path d="M3 11l9-7 9 7M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )
    case 'Agenda':
      return (
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
        >
          <Rect x={3} y={5} width={18} height={16} rx={3} />
          <Line x1={3} y1={9} x2={21} y2={9} />
        </Svg>
      )
    case 'Avaliacoes':
      return (
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
        >
          <Path
            d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.9 6.6 19.4l1.2-6L3.4 9.3l6-.7z"
            strokeLinejoin="round"
          />
        </Svg>
      )
    default:
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
        </Svg>
      )
  }
}

export function VetTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  // Esconde a barra flutuante em telas de detalhe empilhadas (ex.: edição do
  // perfil) — senão o pill cobriria o CTA. Lê a rota ativa do stack aninhado.
  const activeTab = state.routes[state.index]
  const nested = activeTab.state as { index?: number; routes?: { name: string }[] } | undefined
  const nestedName =
    nested?.routes && nested.index != null ? nested.routes[nested.index]?.name : undefined
  if (nestedName && nestedName !== 'PerfilMain') {
    return null
  }

  return (
    <View style={[styles.wrap, { bottom: insets.bottom > 0 ? insets.bottom : 13 }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index
        const color = focused ? ACTIVE : INACTIVE
        const label = (descriptors[route.key]?.options.title as string | undefined) ?? route.name

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={styles.item}
          >
            <View style={[styles.indicator, focused && styles.indicatorOn]} />
            <TabGlyph name={route.name} color={color} />
            <Text style={[styles.label, { color }, focused && styles.labelActive]}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 13,
    right: 13,
    height: 66,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#1E5F92',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  item: { alignItems: 'center', gap: 2 },
  indicator: { width: 18, height: 4, borderRadius: 99, backgroundColor: 'transparent' },
  indicatorOn: { backgroundColor: ACTIVE },
  label: { fontFamily: 'Nunito_700Bold', fontSize: 11 },
  labelActive: { fontFamily: 'Nunito_800ExtraBold' },
})
