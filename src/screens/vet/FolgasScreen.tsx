/**
 * FolgasScreen (vet) — folgas & bloqueios de agenda (sub-tela do Perfil).
 *
 * Frontend-only: lista de bloqueios em estado local (cartões de exemplo removíveis);
 * "+ Bloquear" mostra feedback. TODO(backend): modelo de bloqueios + persistência +
 * aviso aos tutores com consulta no período.
 *
 * Visual fiel ao design (Claude Design HTML), fontes adaptadas à escala do DS.
 * Brand-themed / mode-independent: paleta + fontes fixas da marca (Baloo 2 / Nunito).
 */
import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useToast } from '@/components/ui'
import { IconChevronLeft } from '@/assets/icons'

const F = {
  baloo800: 'Baloo2_800ExtraBold',
  baloo700: 'Baloo2_700Bold',
  nun600: 'Nunito_600SemiBold',
  nun700: 'Nunito_700Bold',
}

const C = {
  screenBg: '#EAF4FB',
  ink: '#13344E',
  blue: '#2E7CB8',
  sub: '#4C6680',
  muted: '#9AA7BA',
  infoBorder: '#BFE0F5',
  xBg: '#F4F7FB',
}

interface Block {
  id: string
  emoji: string
  title: string
  subtitle: string
  accent: string
  tile: [string, string]
}

const INITIAL_BLOCKS: Block[] = [
  {
    id: '1',
    emoji: '🏖️',
    title: 'Férias',
    subtitle: '10/07 → 20/07 · dia inteiro',
    accent: '#FAD968',
    tile: ['#FFF3B0', '#FAD968'],
  },
  {
    id: '2',
    emoji: '⛔',
    title: 'Sex, 28/06',
    subtitle: 'Bloqueado 14:00 → 16:00 · congresso',
    accent: '#8FC8EC',
    tile: ['#BFE0F5', '#8FC8EC'],
  },
]

export function FolgasScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const toast = useToast()
  useLingui()

  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS)
  const soon = () => toast.info(t`Em breve`)
  const remove = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id))

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#A7D3F0', '#2E7CB8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t`Voltar`}
          hitSlop={8}
          style={styles.backBtn}
        >
          <IconChevronLeft size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>{t`Folgas & bloqueios`}</Text>
        <Text style={styles.subtitle}>{t`Esses períodos não recebem agendamentos`}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {blocks.map(b => (
          <View key={b.id} style={[styles.card, { borderLeftColor: b.accent }]}>
            <LinearGradient
              colors={b.tile}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tile}
            >
              <Text style={styles.tileEmoji}>{b.emoji}</Text>
            </LinearGradient>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {b.title}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {b.subtitle}
              </Text>
            </View>
            <Pressable
              onPress={() => remove(b.id)}
              accessibilityRole="button"
              accessibilityLabel={t`Remover`}
              hitSlop={6}
              style={styles.removeBtn}
            >
              <Text style={styles.removeX}>✕</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={soon}
          accessibilityRole="button"
          accessibilityLabel={t`Bloquear um dia`}
          style={styles.btnDashed}
        >
          <Text style={styles.btnDashedText}>{t`+ Bloquear um dia`}</Text>
        </Pressable>

        <Pressable
          onPress={soon}
          accessibilityRole="button"
          accessibilityLabel={t`Bloquear um horário`}
          style={styles.btnPrimaryWrap}
        >
          <LinearGradient
            colors={['#2E7CB8', '#1E5F92']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryText}>{t`+ Bloquear um horário`}</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>🔔</Text>
          <Text style={styles.infoText}>
            {t`Tutores com consulta num período bloqueado são avisados para remarcar.`}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.screenBg },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontFamily: F.baloo800, fontSize: 23, color: '#FFFFFF' },
  subtitle: { fontFamily: F.nun600, fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  scroll: { paddingHorizontal: 18, paddingTop: 18 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#1E5F92',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: { fontSize: 23 },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: F.baloo800, fontSize: 16, color: C.ink },
  cardSub: { fontFamily: F.nun600, fontSize: 13, color: C.sub, marginTop: 1 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.xBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeX: { fontFamily: F.nun700, fontSize: 15, color: C.muted },

  btnDashed: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.infoBorder,
    borderRadius: 17,
    paddingVertical: 15,
    marginBottom: 10,
  },
  btnDashedText: { fontFamily: F.baloo700, fontSize: 15, color: C.blue },
  btnPrimaryWrap: {
    borderRadius: 17,
    shadowColor: '#1E5F92',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  btnPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    paddingVertical: 15,
  },
  btnPrimaryText: { fontFamily: F.baloo700, fontSize: 15, color: '#FFFFFF' },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: 15,
    padding: 13,
    marginTop: 16,
  },
  infoEmoji: { fontSize: 16 },
  infoText: { flex: 1, fontFamily: F.nun600, fontSize: 13, color: C.sub, lineHeight: 19 },
})
