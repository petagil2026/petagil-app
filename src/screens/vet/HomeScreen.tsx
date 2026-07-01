/**
 * HomeScreen (vet) — "Início" da clínica. Visual fiel ao design (Claude
 * Design HTML): header em gradiente com saudação + avatar (ícone de prédio),
 * card da próxima consulta, faixa de stats do dia e grid de atalhos rápidos.
 *
 * Dados ainda são MOCK (sem backend de agenda/métricas no MVP) — ver MOCK abaixo
 * e TODO(backend). O nome vem real do perfil (`clinicName`), com fallback para o
 * nome da conta. Os atalhos navegam para as telas reais já existentes (Agenda,
 * Avaliações, Meus horários, Folgas).
 *
 * Brand-themed / mode-independent: paleta + fontes fixas da marca (Baloo 2 / Nunito,
 * como na PerfilScreen), não `semantic.*` nem `textStyles` (que invertem no dark).
 */
import type { ReactNode } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native'
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useAuth } from '@/app/providers'
import { useMyVetProfile } from '@/features/vet'
import { brandText } from '@/theme'
import type { VetTabParamList } from '@/navigation/types'

const C = {
  screenBg: '#EAF4FB',
  ink: '#13344E',
  blueDark: '#1E5F92',
  blue: '#2E7CB8',
  statLabel: '#7C8FA3',
  sub: '#4C6680',
  tile: '#EAF4FB',
  tileYellow: '#FFF6CC',
  iconYellow: '#C99700',
  green: '#389E0D',
  greenBadgeBg: '#EAF7E4',
}

const cardShadow = {
  shadowColor: '#1E5F92',
  shadowOpacity: 0.16,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
}

function greetingFor(hour: number): string {
  if (hour < 12) return t`Bom dia`
  if (hour < 18) return t`Boa tarde`
  return t`Boa noite`
}

// MOCK — sem backend de agenda/métricas no MVP. TODO(backend): substituir por
// dados reais (próxima consulta + resumo do dia) quando a API existir.
const MOCK = {
  next: { pet: 'Rex', time: '09:30', tutor: 'Rafael', inMin: 25 },
  stats: { today: 4, confirmed: 4, attendance: 98 },
}

export function HomeScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<BottomTabNavigationProp<VetTabParamList>>()
  const { user } = useAuth()
  const { data: profile } = useMyVetProfile()
  useLingui()

  const name = profile?.clinicName?.trim() || user?.name?.trim() || t`Sua clínica`
  const greeting = greetingFor(new Date().getHours())

  // Lingui exige variável simples na interpolação (não obj.prop) — desestrutura.
  const { inMin, tutor } = MOCK.next

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#A7D3F0', '#2E7CB8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerBlob} />
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            {profile?.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} />
            ) : (
              <Svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7CA9CC"
                strokeWidth={1.6}
              >
                <Path
                  d="M3 21V8l9-5 9 5v13M3 21h18M9 21v-6h6v6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>{`${greeting} 🏥`}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
      >
        {/* Próxima consulta */}
        <Pressable
          onPress={() => navigation.navigate('Agenda')}
          accessibilityRole="button"
          accessibilityLabel={t`Sua próxima consulta`}
          style={[styles.nextCard, cardShadow]}
        >
          <View style={styles.nextHeader}>
            <Text style={styles.nextTitle}>{t`Sua próxima consulta`}</Text>
            <View style={styles.nextBadge}>
              <Text style={styles.nextBadgeText}>{t`EM ${inMin} MIN`}</Text>
            </View>
          </View>
          <View style={styles.nextBody}>
            <LinearGradient
              colors={['#FFF3B0', '#FAD968']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.petTile}
            >
              <Text style={styles.petEmoji}>🐶</Text>
            </LinearGradient>
            <View style={styles.nextInfo}>
              <Text style={styles.petName} numberOfLines={1}>
                {`${MOCK.next.pet} · ${MOCK.next.time}`}
              </Text>
              <Text style={styles.petSub} numberOfLines={1}>
                {t`Tutor: ${tutor} · Consulta padrão`}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Stats do dia */}
        <View style={styles.statsRow}>
          <StatCard value={String(MOCK.stats.today)} label={t`Consultas hoje`} color={C.blueDark} />
          <StatCard value={String(MOCK.stats.confirmed)} label={t`Confirmadas`} color={C.green} />
          <StatCard value={`${MOCK.stats.attendance}%`} label={t`Comparecimento`} color={C.green} />
        </View>

        {/* Atalhos rápidos */}
        <Text style={styles.sectionTitle}>{t`Atalhos rápidos`}</Text>
        <View style={styles.grid}>
          <Shortcut
            label={t`Ver agenda`}
            onPress={() => navigation.navigate('Agenda')}
            icon={
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Rect x={3} y={5} width={18} height={16} rx={3} />
                <Line x1={3} y1={9} x2={21} y2={9} />
              </Svg>
            }
          />
          <Shortcut
            label={t`Meus horários`}
            onPress={() => navigation.navigate('Perfil', { screen: 'MeusHorarios' })}
            icon={
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Circle cx={12} cy={12} r={9} />
                <Path d="M12 7v5l3 2" strokeLinecap="round" />
              </Svg>
            }
          />
          <Shortcut
            label={t`Folgas`}
            tileColor={C.tileYellow}
            onPress={() => navigation.navigate('Perfil', { screen: 'FolgasBloqueios' })}
            icon={
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.iconYellow}
                strokeWidth={1.8}
              >
                <Path
                  d="M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                  strokeLinecap="round"
                />
              </Svg>
            }
          />
          <Shortcut
            label={t`Avaliações`}
            onPress={() => navigation.navigate('Avaliacoes')}
            icon={
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Path
                  d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.9 6.6 19.4l1.2-6L3.4 9.3l6-.7z"
                  strokeLinejoin="round"
                />
              </Svg>
            }
          />
        </View>
      </ScrollView>
    </View>
  )
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, cardShadow]}>
      <Text style={[styles.statValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

function Shortcut({
  icon,
  label,
  onPress,
  tileColor,
}: {
  icon: ReactNode
  label: string
  onPress: () => void
  tileColor?: string
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.shortcut, cardShadow]}
    >
      <View style={[styles.shortcutTile, { backgroundColor: tileColor ?? C.tile }]}>{icon}</View>
      <Text style={styles.shortcutLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.screenBg },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    top: -34,
    right: -24,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#D3E8F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  headerInfo: { flex: 1 },
  greeting: { ...brandText.subtitle, color: 'rgba(255,255,255,0.92)' },
  name: { ...brandText.title, color: '#FFFFFF', marginTop: 1 },

  scroll: { paddingHorizontal: 20 },

  nextCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginVertical: 16 },
  nextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  nextTitle: { ...brandText.heading, color: C.ink },
  nextBadge: {
    backgroundColor: C.greenBadgeBg,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  nextBadgeText: { ...brandText.badge, color: C.green },
  nextBody: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  petTile: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: { fontSize: 26 },
  nextInfo: { flex: 1 },
  petName: { ...brandText.heading, color: C.ink },
  petSub: { ...brandText.secondary, color: C.sub, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 11, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: { ...brandText.statValue },
  statLabel: { ...brandText.statLabel, color: C.statLabel, marginTop: 3 },

  sectionTitle: { ...brandText.heading, color: C.ink, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  shortcut: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
  },
  shortcutTile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutLabel: { ...brandText.actionLabel, color: C.ink },
})
