/**
 * MeusHorariosScreen (vet) — disponibilidade do veterinário (sub-tela do Perfil).
 *
 * Visual fiel ao design (Claude Design HTML), com fontes adaptadas à escala do DS:
 * seleção de dias da semana, períodos de atendimento (manhã/tarde/noite com toggle),
 * duração da consulta (chips) e um resumo de slots gerados + "Salvar disponibilidade".
 *
 * Persistência ainda NÃO tem backend → estado local; "Salvar" mostra feedback.
 * TODO(backend): modelo de disponibilidade + geração de slots.
 *
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
import { GradientButton, useToast } from '@/components/ui'
import { IconChevronLeft, IconChevronDown } from '@/assets/icons'
import { SelectSheet } from '@/features/vet'

const F = {
  baloo800: 'Baloo2_800ExtraBold',
  nun600: 'Nunito_600SemiBold',
  nun700: 'Nunito_700Bold',
  nun800: 'Nunito_800ExtraBold',
}

const C = {
  screenBg: '#EAF4FB',
  ink: '#13344E',
  blue: '#2E7CB8',
  blueDark: '#1E5F92',
  muted: '#9AA7BA',
  sub: '#4C6680',
  timeOff: '#C2CCD9',
  green: '#52C41A',
  switchOff: '#DDE4EC',
  infoBorder: '#BFE0F5',
}

const cardShadow = {
  shadowColor: '#1E5F92',
  shadowOpacity: 0.14,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
}

// Dias: rótulo curto + nome (acessibilidade). Seg..Dom.
const DAYS = [
  { short: 'S', name: 'Segunda' },
  { short: 'T', name: 'Terça' },
  { short: 'Q', name: 'Quarta' },
  { short: 'Q', name: 'Quinta' },
  { short: 'S', name: 'Sexta' },
  { short: 'S', name: 'Sábado' },
  { short: 'D', name: 'Domingo' },
]

type PeriodKey = 'manha' | 'tarde' | 'noite'

const PERIODS: { key: PeriodKey; emoji: string; label: string }[] = [
  { key: 'manha', emoji: '🌅', label: 'Manhã' },
  { key: 'tarde', emoji: '🌇', label: 'Tarde' },
  { key: 'noite', emoji: '🌙', label: 'Noite' },
]

const DEFAULT_TIMES: Record<PeriodKey, { start: string; end: string }> = {
  manha: { start: '8:00', end: '12:00' },
  tarde: { start: '14:00', end: '18:00' },
  noite: { start: '18:00', end: '22:00' },
}

/** "H:MM" -> minutos desde 0h. */
const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Opções de horário (06:00–22:00, de 30 em 30 min) para o select. */
const TIME_OPTIONS = (() => {
  const out: { value: string; label: string }[] = []
  for (let m = 6 * 60; m <= 22 * 60; m += 30) {
    const v = `${Math.floor(m / 60)}:${(m % 60).toString().padStart(2, '0')}`
    out.push({ value: v, label: v })
  }
  return out
})()

const DURATIONS = [20, 30, 45, 60]
const durationLabel = (min: number) => (min >= 60 ? `${min / 60} h` : `${min} min`)

export function MeusHorariosScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const toast = useToast()
  useLingui()

  const [days, setDays] = useState<boolean[]>([true, true, true, true, true, false, false])
  const [periods, setPeriods] = useState<Record<PeriodKey, boolean>>({
    manha: true,
    tarde: true,
    noite: false,
  })
  const [times, setTimes] = useState(DEFAULT_TIMES)
  const [duration, setDuration] = useState(30)
  const [editing, setEditing] = useState<{ key: PeriodKey; field: 'start' | 'end' } | null>(null)

  const activeMinutes = PERIODS.filter(p => periods[p.key]).reduce((s, p) => {
    const dur = toMinutes(times[p.key].end) - toMinutes(times[p.key].start)
    return s + Math.max(0, dur)
  }, 0)
  const slotsPerDay = duration > 0 ? Math.floor(activeMinutes / duration) : 0

  const toggleDay = (i: number) => setDays(prev => prev.map((v, idx) => (idx === i ? !v : v)))
  const togglePeriod = (k: PeriodKey) => setPeriods(prev => ({ ...prev, [k]: !prev[k] }))
  const setTime = (k: PeriodKey, field: 'start' | 'end', v: string) =>
    setTimes(prev => ({ ...prev, [k]: { ...prev[k], [field]: v } }))

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
        <Text style={styles.title}>{t`Meus horários`}</Text>
        <Text style={styles.subtitle}>{t`Escolha os dias que você atende`}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Dias da semana */}
        <View style={styles.daysRow}>
          {DAYS.map((d, i) => {
            const on = days[i]
            return (
              <Pressable
                key={i}
                onPress={() => toggleDay(i)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={d.name}
                style={styles.dayWrap}
              >
                {on ? (
                  <LinearGradient
                    colors={['#2E7CB8', '#1E5F92']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.day, styles.dayOn]}
                  >
                    <Text style={[styles.dayText, { color: '#FFFFFF' }]}>{d.short}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.day, styles.dayOff]}>
                    <Text style={[styles.dayText, { color: C.muted }]}>{d.short}</Text>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        {/* Períodos de atendimento */}
        <Text style={styles.sectionTitle}>{t`Períodos de atendimento`}</Text>
        {PERIODS.map(p => {
          const on = periods[p.key]
          return (
            <View key={p.key} style={[styles.periodCard, cardShadow, !on && styles.periodOff]}>
              <Text style={[styles.periodLabel, { color: on ? C.ink : C.muted }]}>
                {`${p.emoji} ${p.label}`}
              </Text>
              {on ? (
                <View style={styles.timeRow}>
                  <Pressable
                    onPress={() => setEditing({ key: p.key, field: 'start' })}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={t`Editar horário de início`}
                    style={styles.timeChip}
                  >
                    <Text style={styles.timeValue}>{times[p.key].start}</Text>
                    <IconChevronDown size={12} color={C.blue} />
                  </Pressable>
                  <Text style={styles.periodAte}>{t`até`}</Text>
                  <Pressable
                    onPress={() => setEditing({ key: p.key, field: 'end' })}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={t`Editar horário de término`}
                    style={styles.timeChip}
                  >
                    <Text style={styles.timeValue}>{times[p.key].end}</Text>
                    <IconChevronDown size={12} color={C.blue} />
                  </Pressable>
                </View>
              ) : (
                <Text style={[styles.periodTime, { color: C.timeOff }]}>{t`— até —`}</Text>
              )}
              <Switch value={on} onPress={() => togglePeriod(p.key)} />
            </View>
          )
        })}

        {/* Duração da consulta */}
        <Text style={[styles.sectionTitle, styles.sectionGap]}>{t`Duração da consulta`}</Text>
        <View style={styles.durations}>
          {DURATIONS.map(min => {
            const sel = duration === min
            return (
              <Pressable
                key={min}
                onPress={() => setDuration(min)}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                accessibilityLabel={durationLabel(min)}
              >
                {sel ? (
                  <LinearGradient
                    colors={['#2E7CB8', '#1E5F92']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.chip, cardShadow]}
                  >
                    <Text style={[styles.chipText, { color: '#FFFFFF' }]}>
                      {durationLabel(min)}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.chip, styles.chipOff, cardShadow]}>
                    <Text style={[styles.chipText, { color: C.blueDark }]}>
                      {durationLabel(min)}
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        {/* Resumo */}
        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>✅</Text>
          <Text style={styles.infoText}>
            {t`Gera`} <Text style={styles.infoStrong}>{t`${slotsPerDay} horários/dia`}</Text>{' '}
            {t`automaticamente`}
          </Text>
        </View>

        <GradientButton
          testID="horarios-save"
          title={t`Salvar disponibilidade`}
          onPress={() => toast.info(t`Em breve`)}
          style={styles.saveBtn}
        />
      </ScrollView>

      <SelectSheet
        visible={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.field === 'end' ? t`Horário de término` : t`Horário de início`}
        options={TIME_OPTIONS}
        selected={editing ? [times[editing.key][editing.field]] : []}
        onChange={sel => {
          if (editing && sel[0]) setTime(editing.key, editing.field, sel[0])
        }}
      />
    </View>
  )
}

function Switch({ value, onPress }: { value: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[styles.switch, { backgroundColor: value ? C.green : C.switchOff }]}
    >
      <View style={[styles.switchKnob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
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

  daysRow: { flexDirection: 'row', gap: 6, marginBottom: 18 },
  dayWrap: { flex: 1 },
  day: { aspectRatio: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayOn: {
    shadowColor: '#1E5F92',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  dayOff: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E5F92',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  dayText: { fontFamily: F.nun800, fontSize: 15 },

  sectionTitle: { fontFamily: F.baloo800, fontSize: 16, color: C.ink, marginBottom: 10 },
  sectionGap: { marginTop: 4 },

  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  periodOff: { opacity: 0.55 },
  periodLabel: { fontFamily: F.nun700, fontSize: 15 },
  periodTime: { fontFamily: F.nun600, fontSize: 13, color: C.sub },
  periodAte: { fontFamily: F.nun600, fontSize: 13, color: C.muted, marginHorizontal: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EAF4FB',
    borderWidth: 1,
    borderColor: '#D6EAF8',
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  timeValue: { fontFamily: F.nun700, fontSize: 13, color: C.blueDark },

  durations: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { borderRadius: 13, paddingVertical: 10, paddingHorizontal: 14 },
  chipOff: { backgroundColor: '#FFFFFF' },
  chipText: { fontFamily: F.nun700, fontSize: 14 },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: 15,
    padding: 13,
    marginBottom: 16,
  },
  infoEmoji: { fontSize: 18 },
  infoText: { flex: 1, fontFamily: F.nun600, fontSize: 13, color: C.sub, lineHeight: 19 },
  infoStrong: { fontFamily: F.nun800, color: C.blueDark },

  saveBtn: { height: 54 },

  switch: { width: 40, height: 23, borderRadius: 999, justifyContent: 'center', flexShrink: 0 },
  switchKnob: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  knobOn: { right: 2.5 },
  knobOff: { left: 2.5 },
})
