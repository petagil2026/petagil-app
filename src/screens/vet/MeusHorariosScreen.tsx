/**
 * MeusHorariosScreen (vet) — disponibilidade do veterinário (sub-tela do Perfil).
 *
 * Visual fiel ao design (Claude Design HTML), com fontes adaptadas à escala do DS:
 * seleção de dias da semana, períodos de atendimento (manhã/tarde/noite com toggle),
 * duração da consulta (chips) e um resumo de slots gerados + "Salvar disponibilidade".
 *
 * Carrega/salva a disponibilidade real via React Query (feature `vet`).
 *
 * Brand-themed / mode-independent: paleta + fontes fixas da marca (Baloo 2 / Nunito).
 */
import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { GradientButton, useToast } from '@/components/ui'
import { IconChevronLeft, IconChevronDown } from '@/assets/icons'
import {
  SelectSheet,
  useVetAvailability,
  useSaveVetAvailability,
  DEFAULT_SLOT_DURATION_MIN,
  TIME_OPTIONS,
} from '@/features/vet'
import type { AvailabilityPeriodKey } from '@/features/vet'
import { brandText, brandFonts } from '@/theme'

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

// Mapeamento entre a chave local da UI e o enum do backend.
const PERIOD_KEY_TO_API: Record<PeriodKey, AvailabilityPeriodKey> = {
  manha: 'MORNING',
  tarde: 'AFTERNOON',
  noite: 'NIGHT',
}
const API_TO_PERIOD_KEY: Record<AvailabilityPeriodKey, PeriodKey> = {
  MORNING: 'manha',
  AFTERNOON: 'tarde',
  NIGHT: 'noite',
}

// [F2] Horários SEMPRE zero-padded ("HH:MM") — casam com o que o backend devolve
// (minutesToHhmm → "08:00"); senão o `selected` do SelectSheet não acha a opção.
const DEFAULT_TIMES: Record<PeriodKey, { start: string; end: string }> = {
  manha: { start: '08:00', end: '12:00' },
  tarde: { start: '14:00', end: '18:00' },
  noite: { start: '18:00', end: '22:00' },
}

/** "HH:MM" -> minutos desde 0h. */
const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const DURATIONS = [20, 30, 45, 60]
const durationLabel = (min: number) => (min >= 60 ? `${min / 60} h` : `${min} min`)

export function MeusHorariosScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const toast = useToast()
  useLingui()

  const { data, isLoading, isError } = useVetAvailability()
  const saveMutation = useSaveVetAvailability()

  const [days, setDays] = useState<boolean[]>([true, true, true, true, true, false, false])
  const [periods, setPeriods] = useState<Record<PeriodKey, boolean>>({
    manha: true,
    tarde: true,
    noite: false,
  })
  const [times, setTimes] = useState(DEFAULT_TIMES)
  const [duration, setDuration] = useState(DEFAULT_SLOT_DURATION_MIN)
  const [editing, setEditing] = useState<{ key: PeriodKey; field: 'start' | 'end' } | null>(null)

  // Hidrata o estado local uma única vez quando chega disponibilidade salva.
  // Forma vazia (sem dias nem períodos) → mantém os defaults úteis da tela (AC3).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current || !data) return
    if (data.weekdays.length === 0 && data.periods.length === 0) {
      hydratedRef.current = true
      return
    }
    setDays(Array.from({ length: 7 }, (_, i) => data.weekdays.includes(i)))
    setDuration(data.slotDurationMin)
    const nextPeriods: Record<PeriodKey, boolean> = { manha: false, tarde: false, noite: false }
    setTimes(prev => {
      const nextTimes = { ...prev }
      for (const p of data.periods) {
        const key = API_TO_PERIOD_KEY[p.period]
        nextPeriods[key] = true
        nextTimes[key] = { start: p.start, end: p.end }
      }
      return nextTimes
    })
    setPeriods(nextPeriods)
    hydratedRef.current = true
  }, [data])

  const handleSave = () => {
    const weekdays = days.map((on, i) => (on ? i : -1)).filter(i => i >= 0)
    const periodsPayload = PERIODS.filter(p => periods[p.key]).map(p => ({
      period: PERIOD_KEY_TO_API[p.key],
      start: times[p.key].start,
      end: times[p.key].end,
    }))
    // [F8] Não salvar uma regra "morta" (sem dias ou sem períodos) — o backend
    // também rejeita, mas evitar o round-trip e dar feedback claro.
    if (weekdays.length === 0 || periodsPayload.length === 0) {
      toast.error(t`Selecione pelo menos um dia e um período.`)
      return
    }
    saveMutation.mutate(
      { weekdays, slotDurationMin: duration, periods: periodsPayload },
      {
        onSuccess: () => {
          // [F7] Permite re-hidratar a partir do estado recém-persistido no refetch.
          hydratedRef.current = false
          toast.success(t`Disponibilidade salva!`)
        },
        onError: () => toast.error(t`Não foi possível salvar. Tente novamente.`),
      }
    )
  }

  // [F10] Espelha o backend: flooring POR PERÍODO (não soma-depois-floor), senão
  // o preview diverge da geração real em janelas não-múltiplas da duração.
  const slotsPerDay = PERIODS.filter(p => periods[p.key]).reduce((s, p) => {
    const dur = Math.max(0, toMinutes(times[p.key].end) - toMinutes(times[p.key].start))
    return s + (duration > 0 ? Math.floor(dur / duration) : 0)
  }, 0)

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
        style={[styles.header, { paddingTop: insets.top + 14 }]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t`Voltar`}
          hitSlop={8}
          style={styles.backBtn}
        >
          <IconChevronLeft size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>{t`Meus horários`}</Text>
        <Text style={styles.subtitle}>{t`Escolha os dias que você atende`}</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={C.blue} />
        </View>
      ) : isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t`Não foi possível carregar a disponibilidade.`}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
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
                      <IconChevronDown size={14} color={C.blue} />
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
                      <IconChevronDown size={14} color={C.blue} />
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
            onPress={handleSave}
            loading={saveMutation.isPending}
            style={styles.saveBtn}
          />
        </ScrollView>
      )}

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
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { ...brandText.title, color: '#FFFFFF' },
  subtitle: { ...brandText.subtitle, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  stateBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  stateText: { ...brandText.secondary, color: C.sub, textAlign: 'center' },

  daysRow: { flexDirection: 'row', gap: 7, marginBottom: 22 },
  dayWrap: { flex: 1 },
  day: { aspectRatio: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
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
  dayText: { ...brandText.dayText },

  sectionTitle: { ...brandText.heading, color: C.ink, marginBottom: 12 },
  sectionGap: { marginTop: 5 },

  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 17,
    marginBottom: 11,
  },
  periodOff: { opacity: 0.55 },
  periodLabel: { ...brandText.rowLabel },
  periodTime: { ...brandText.secondary, color: C.sub },
  periodAte: { ...brandText.secondary, color: C.muted, marginHorizontal: 7 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF4FB',
    borderWidth: 1,
    borderColor: '#D6EAF8',
    borderRadius: 11,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  timeValue: { ...brandText.body, color: C.blueDark },

  durations: { flexDirection: 'row', gap: 10, marginBottom: 19 },
  chip: { borderRadius: 16, paddingVertical: 12, paddingHorizontal: 17 },
  chipOff: { backgroundColor: '#FFFFFF' },
  chipText: { ...brandText.label },

  infoBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: 18,
    padding: 16,
    marginBottom: 19,
  },
  infoEmoji: { fontSize: 22 },
  infoText: { flex: 1, ...brandText.secondary, color: C.sub, lineHeight: 23 },
  infoStrong: { fontFamily: brandFonts.nun800, color: C.blueDark },

  saveBtn: { height: 64 },

  switch: { width: 48, height: 28, borderRadius: 999, justifyContent: 'center', flexShrink: 0 },
  switchKnob: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  knobOn: { right: 3 },
  knobOff: { left: 3 },
})
