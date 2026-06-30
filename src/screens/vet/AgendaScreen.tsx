/**
 * AgendaScreen (vet) — aba "Agenda". Visual fiel ao design (Claude Design HTML):
 * header em gradiente com saudação + resumo do dia (pills), card destacado da
 * próxima consulta (borda superior azul + badge "PRÓXIMA") e lista das demais
 * consultas confirmadas do dia.
 *
 * Dados são MOCK (sem backend de agenda no MVP) — ver MOCK abaixo e TODO(backend).
 * O nome da clínica vem real do perfil (`clinicName`).
 *
 * Brand-themed / mode-independent: paleta + fontes fixas da marca (Baloo 2 / Nunito,
 * como na PerfilScreen), não `semantic.*` nem `textStyles` (que invertem no dark).
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useAuth } from '@/app/providers'
import { useMyVetProfile } from '@/features/vet'
import { brandText } from '@/theme'

const C = {
  screenBg: '#EAF4FB',
  ink: '#13344E',
  blueDark: '#1E5F92',
  blue: '#2E7CB8',
  sub: '#4C6680',
  green: '#389E0D',
  greenTile: '#EAF7E4',
  pillYellowBg: '#FFF3B0',
  pillYellowInk: '#8A6D00',
  nextBadgeBg: '#EAF1F9',
}

const cardShadow = {
  shadowColor: '#1E5F92',
  shadowOpacity: 0.16,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
}

// MOCK — sem backend de agenda no MVP. TODO(backend): substituir por dados reais
// (próxima consulta + lista do dia) quando a API existir.
const MOCK = {
  confirmedCount: 4,
  next: { pet: 'Rex', time: '09:30', tutor: 'Rafael', type: 'Rotina' },
  confirmed: [
    { id: 'mia', pet: 'Mia', time: '10:00', tutor: 'Júlia' },
    { id: 'thor', pet: 'Thor', time: '14:00', tutor: 'Ana' },
  ],
}

export function AgendaScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { data: profile } = useMyVetProfile()
  useLingui()

  const name = profile?.clinicName?.trim() || user?.name?.trim() || t`Sua clínica`
  // Lingui exige variável simples na interpolação (não obj.prop) — desestrutura.
  const { confirmedCount } = MOCK
  const { pet: nextPet, time: nextTime, tutor: nextTutor, type: nextType } = MOCK.next

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
        <Text style={styles.hello}>{t`Olá, ${name} 🏥`}</Text>
        <Text style={styles.title}>{t`Sua agenda · hoje`}</Text>
        <View style={styles.pills}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>{t`${confirmedCount} confirmados`}</Text>
          </View>
          <View style={[styles.pill, styles.pillYellow]}>
            <Text style={styles.pillYellowText}>{t`⏰ Próxima ${nextTime}`}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
      >
        {/* Próxima consulta (destaque) */}
        <View style={[styles.nextCard, cardShadow]}>
          <View style={styles.row}>
            <LinearGradient
              colors={['#FFF3B0', '#FAD968']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextTile}
            >
              <Text style={styles.petEmoji}>🐶</Text>
            </LinearGradient>
            <View style={styles.info}>
              <Text style={styles.petName} numberOfLines={1}>
                {`${nextPet} · ${nextTime}`}
              </Text>
              <Text style={styles.petSub} numberOfLines={1}>
                {t`Tutor: ${nextTutor} · ${nextType}`}
              </Text>
            </View>
            <View style={styles.nextBadge}>
              <Text style={styles.nextBadgeText}>{t`PRÓXIMA`}</Text>
            </View>
          </View>
        </View>

        {/* Demais confirmadas */}
        {MOCK.confirmed.map(({ id, pet, time, tutor }) => (
          <View key={id} style={[styles.card, cardShadow]}>
            <View style={styles.checkTile}>
              <Svg
                width={26}
                height={26}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.green}
                strokeWidth={2.4}
              >
                <Path d="M5 13l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={styles.info}>
              <Text style={styles.cardName} numberOfLines={1}>
                {`${pet} · ${time}`}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {t`Tutor: ${tutor} · Confirmado`}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.screenBg },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    top: -34,
    right: -24,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  hello: { ...brandText.subtitle, color: 'rgba(255,255,255,0.95)' },
  title: { ...brandText.pageTitle, color: '#FFFFFF', marginTop: 3, marginBottom: 14 },
  pills: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#FFFFFF' },
  pillText: { ...brandText.pill, color: '#FFFFFF' },
  pillYellow: { backgroundColor: C.pillYellowBg },
  pillYellowText: { ...brandText.pill, color: C.pillYellowInk },

  scroll: { paddingHorizontal: 20, paddingTop: 18 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  info: { flex: 1 },

  nextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    marginBottom: 14,
    borderTopWidth: 5,
    borderTopColor: C.blue,
  },
  nextTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: { fontSize: 26 },
  petName: { ...brandText.heading, color: C.ink },
  petSub: { ...brandText.secondary, color: C.sub, marginTop: 2 },
  nextBadge: {
    backgroundColor: C.nextBadgeBg,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  nextBadgeText: { ...brandText.badge, color: C.blueDark },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 13,
  },
  checkTile: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: C.greenTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { ...brandText.heading, color: C.ink },
  cardSub: { ...brandText.secondary, color: C.green, marginTop: 2 },
})
