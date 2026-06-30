/**
 * FolgasScreen (vet) — folgas & bloqueios de agenda (sub-tela do Perfil).
 *
 * Lista/cria/remove folgas reais via React Query (feature `vet`). Criação por
 * BottomSheet: "Bloquear um dia" (allDay) ou "Bloquear um horário" (faixa).
 * Datas via `DateInput` (máscara DD/MM/AAAA, sem lib nativa); horário via SelectSheet.
 *
 * Visual fiel ao design (Claude Design HTML), fontes adaptadas à escala do DS.
 * Brand-themed / mode-independent: paleta + fontes fixas da marca (Baloo 2 / Nunito).
 */
import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { BottomSheet, DateInput, GradientButton, Input, useToast } from '@/components/ui'
import { IconChevronLeft, IconChevronDown } from '@/assets/icons'
import {
  SelectSheet,
  useVetTimeOff,
  useCreateTimeOff,
  useDeleteTimeOff,
  TIME_OPTIONS,
} from '@/features/vet'
import type { VetTimeOff } from '@/features/vet'
import { brandText } from '@/theme'
import {
  addDaysToISODate,
  buildLocalInstantISO,
  instantToLocalParts,
  isoDateToBrShort,
  parseBrDateToISO,
} from '@/utils'

const C = {
  screenBg: '#EAF4FB',
  ink: '#13344E',
  blue: '#2E7CB8',
  blueDark: '#1E5F92',
  sub: '#4C6680',
  muted: '#9AA7BA',
  infoBorder: '#BFE0F5',
  xBg: '#F4F7FB',
}

type FormMode = 'day' | 'range' | null

/** Teto de span de um bloqueio (dias) — espelha o backend [F5/F14]. */
const MAX_TIMEOFF_DAYS = 366

/** "HH:MM" -> minutos. */
const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Dias entre duas datas "YYYY-MM-DD" (inclusivo). */
const daysBetweenISO = (fromISO: string, toISO: string): number =>
  Math.round(
    (new Date(`${toISO}T00:00:00Z`).getTime() - new Date(`${fromISO}T00:00:00Z`).getTime()) /
      86_400_000
  ) + 1

/** Monta o texto do cartão a partir da folga (resolve o fuso local). */
function describeTimeOff(b: VetTimeOff): {
  emoji: string
  title: string
  subtitle: string
  tile: [string, string]
  accent: string
} {
  const start = instantToLocalParts(b.startsAt)
  if (b.allDay) {
    // `endsAt` é o início (exclusivo) do dia seguinte ao último → -1 dia p/ exibir.
    const endParts = instantToLocalParts(b.endsAt)
    const lastDay = addDaysToISODate(endParts.date, -1)
    const range =
      lastDay === start.date
        ? isoDateToBrShort(start.date)
        : `${isoDateToBrShort(start.date)} → ${isoDateToBrShort(lastDay)}`
    return {
      emoji: '🏖️',
      title: b.reason ?? t`Dia inteiro`,
      subtitle: `${range} · ${t`dia inteiro`}`,
      tile: ['#FFF3B0', '#FAD968'],
      accent: '#FAD968',
    }
  }
  const end = instantToLocalParts(b.endsAt)
  return {
    emoji: '⛔',
    title: b.reason ?? t`Bloqueio`,
    subtitle: `${isoDateToBrShort(start.date)} · ${start.time} → ${end.time}`,
    tile: ['#BFE0F5', '#8FC8EC'],
    accent: '#8FC8EC',
  }
}

export function FolgasScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const toast = useToast()
  useLingui()

  const { data: blocks, isLoading, isError } = useVetTimeOff()
  const createMutation = useCreateTimeOff()
  const deleteMutation = useDeleteTimeOff()

  // Estado do formulário de criação.
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [dayStart, setDayStart] = useState('')
  const [dayEnd, setDayEnd] = useState('')
  const [rangeDate, setRangeDate] = useState('')
  const [rangeStart, setRangeStart] = useState('08:00')
  const [rangeEnd, setRangeEnd] = useState('12:00')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [timeEditing, setTimeEditing] = useState<'start' | 'end' | null>(null)

  const openForm = (mode: FormMode) => {
    setDayStart('')
    setDayEnd('')
    setRangeDate('')
    setRangeStart('08:00')
    setRangeEnd('12:00')
    setReason('')
    setFormError(null)
    setFormMode(mode)
  }

  const remove = (id: string) => {
    deleteMutation.mutate(id, {
      onError: () => toast.error(t`Não foi possível remover. Tente novamente.`),
    })
  }

  const submit = (payload: Parameters<typeof createMutation.mutate>[0]) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setFormMode(null)
        toast.success(t`Bloqueio criado!`)
      },
      onError: () => toast.error(t`Não foi possível criar. Tente novamente.`),
    })
  }

  const handleCreate = () => {
    setFormError(null)
    if (formMode === 'day') {
      const fromISO = parseBrDateToISO(dayStart)
      const toISO = parseBrDateToISO(dayEnd)
      if (!fromISO || !toISO) {
        setFormError(t`Informe datas válidas (DD/MM/AAAA).`)
        return
      }
      if (toISO < fromISO) {
        setFormError(t`A data final deve ser após a inicial.`)
        return
      }
      if (daysBetweenISO(fromISO, toISO) > MAX_TIMEOFF_DAYS) {
        setFormError(t`O bloqueio não pode exceder ${MAX_TIMEOFF_DAYS} dias.`)
        return
      }
      submit({
        startsAt: buildLocalInstantISO(fromISO, '00:00'),
        // Fim exclusivo: início do dia seguinte ao último dia bloqueado.
        endsAt: buildLocalInstantISO(addDaysToISODate(toISO, 1), '00:00'),
        allDay: true,
        reason: reason.trim() || undefined,
      })
    } else if (formMode === 'range') {
      const dISO = parseBrDateToISO(rangeDate)
      if (!dISO) {
        setFormError(t`Informe uma data válida (DD/MM/AAAA).`)
        return
      }
      if (toMinutes(rangeEnd) <= toMinutes(rangeStart)) {
        setFormError(t`O horário final deve ser após o inicial.`)
        return
      }
      submit({
        startsAt: buildLocalInstantISO(dISO, rangeStart),
        endsAt: buildLocalInstantISO(dISO, rangeEnd),
        allDay: false,
        reason: reason.trim() || undefined,
      })
    }
  }

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
        <Text style={styles.title}>{t`Folgas & bloqueios`}</Text>
        <Text style={styles.subtitle}>{t`Esses períodos não recebem agendamentos`}</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={C.blue} />
        </View>
      ) : isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t`Não foi possível carregar as folgas.`}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
        >
          {(blocks ?? []).map(b => {
            const d = describeTimeOff(b)
            return (
              <View key={b.id} style={[styles.card, { borderLeftColor: d.accent }]}>
                <LinearGradient
                  colors={d.tile}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tile}
                >
                  <Text style={styles.tileEmoji}>{d.emoji}</Text>
                </LinearGradient>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {d.title}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {d.subtitle}
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
            )
          })}

          {(blocks ?? []).length === 0 ? (
            <Text style={styles.empty}>{t`Nenhuma folga cadastrada ainda.`}</Text>
          ) : null}

          <Pressable
            onPress={() => openForm('day')}
            accessibilityRole="button"
            accessibilityLabel={t`Bloquear um dia`}
            style={styles.btnDashed}
          >
            <Text style={styles.btnDashedText}>{t`+ Bloquear um dia`}</Text>
          </Pressable>

          <Pressable
            onPress={() => openForm('range')}
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
      )}

      {/* Formulário de criação */}
      <BottomSheet visible={formMode !== null} onClose={() => setFormMode(null)} dynamicSizing>
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {formMode === 'day' ? t`Bloquear um dia` : t`Bloquear um horário`}
          </Text>

          {formMode === 'day' ? (
            <>
              <DateInput
                label={t`Data inicial`}
                value={dayStart}
                onChangeText={setDayStart}
                testID="folga-day-start"
              />
              <View style={styles.fieldGap} />
              <DateInput
                label={t`Data final`}
                value={dayEnd}
                onChangeText={setDayEnd}
                testID="folga-day-end"
              />
            </>
          ) : (
            <>
              <DateInput
                label={t`Data`}
                value={rangeDate}
                onChangeText={setRangeDate}
                testID="folga-range-date"
              />
              <View style={styles.fieldGap} />
              <Text style={styles.fieldLabel}>{t`Horário`}</Text>
              <View style={styles.timeRow}>
                <Pressable
                  onPress={() => setTimeEditing('start')}
                  accessibilityRole="button"
                  accessibilityLabel={t`Editar horário de início`}
                  style={styles.timeChip}
                >
                  <Text style={styles.timeValue}>{rangeStart}</Text>
                  <IconChevronDown size={14} color={C.blue} />
                </Pressable>
                <Text style={styles.timeAte}>{t`até`}</Text>
                <Pressable
                  onPress={() => setTimeEditing('end')}
                  accessibilityRole="button"
                  accessibilityLabel={t`Editar horário de término`}
                  style={styles.timeChip}
                >
                  <Text style={styles.timeValue}>{rangeEnd}</Text>
                  <IconChevronDown size={14} color={C.blue} />
                </Pressable>
              </View>
            </>
          )}

          <View style={styles.fieldGap} />
          <Input
            label={t`Motivo (opcional)`}
            value={reason}
            onChangeText={setReason}
            placeholder={t`Ex.: Férias, congresso…`}
            maxLength={160}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <GradientButton
            testID="folga-save"
            title={t`Salvar`}
            onPress={handleCreate}
            loading={createMutation.isPending}
            style={styles.saveBtn}
          />
        </View>
      </BottomSheet>

      {/* Select de horário (faixa) */}
      <SelectSheet
        visible={timeEditing !== null}
        onClose={() => setTimeEditing(null)}
        title={timeEditing === 'end' ? t`Horário de término` : t`Horário de início`}
        options={TIME_OPTIONS}
        selected={timeEditing ? [timeEditing === 'end' ? rangeEnd : rangeStart] : []}
        onChange={sel => {
          if (!timeEditing || !sel[0]) return
          if (timeEditing === 'end') setRangeEnd(sel[0])
          else setRangeStart(sel[0])
        }}
      />
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
  empty: { ...brandText.secondary, color: C.muted, textAlign: 'center', marginBottom: 14 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderLeftWidth: 5,
    padding: 17,
    marginBottom: 14,
    shadowColor: '#1E5F92',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: { fontSize: 27 },
  cardInfo: { flex: 1 },
  cardTitle: { ...brandText.heading, color: C.ink },
  cardSub: { ...brandText.secondary, color: C.sub, marginTop: 2 },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.xBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeX: { ...brandText.rowLabel, color: C.muted },

  btnDashed: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.infoBorder,
    borderRadius: 20,
    paddingVertical: 18,
    marginBottom: 12,
  },
  btnDashedText: { ...brandText.actionLabel, color: C.blue },
  btnPrimaryWrap: {
    borderRadius: 20,
    shadowColor: '#1E5F92',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  btnPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 18,
  },
  btnPrimaryText: { ...brandText.actionLabel, color: '#FFFFFF' },

  infoBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: 18,
    padding: 16,
    marginTop: 19,
  },
  infoEmoji: { fontSize: 19 },
  infoText: { flex: 1, ...brandText.secondary, color: C.sub, lineHeight: 23 },

  // Formulário (BottomSheet)
  form: { paddingHorizontal: 20, paddingBottom: 16 },
  formTitle: { ...brandText.heading, color: C.ink, marginBottom: 16 },
  fieldGap: { height: 12 },
  fieldLabel: { ...brandText.label, color: C.sub, marginBottom: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF4FB',
    borderWidth: 1,
    borderColor: '#D6EAF8',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  timeValue: { ...brandText.body, color: C.blueDark },
  timeAte: { ...brandText.secondary, color: C.muted, marginHorizontal: 10 },
  formError: { ...brandText.secondary, color: '#D4380D', marginTop: 12 },
  saveBtn: { height: 56, marginTop: 18 },
})
