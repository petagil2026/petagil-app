/**
 * PerfilScreen (vet) — "Perfil do veterinário". Visual fiel ao design (Claude
 * Design HTML): header em gradiente com foto + CRMV + reputação, faixa de stats,
 * especialidades em chips, card da clínica, toggle "Recebendo agendamentos",
 * menu de gestão (card único com divisórias) e "Sair da conta".
 *
 * Dados reais vêm de `GET /profiles/vet/me` + `useAuth()` (nome). Métricas de
 * reputação (consultas, nº de avaliações, nota) ainda NÃO têm backend → exibidas
 * como estado real de um vet recém-criado (0 / "—"); ver TODO(backend).
 *
 * Brand-themed / mode-independent: paleta + fontes fixas da marca (Baloo 2 / Nunito,
 * como na RoleSelect), não `semantic.*` nem `textStyles`.
 */
import { useState, type ReactNode } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native'
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useToast } from '@/components/ui'
import { useAuth } from '@/app/providers'
import { useMyVetProfile } from '@/features/vet'
import type { VetProfileStackParamList } from '@/navigation/types'

const F = {
  baloo800: 'Baloo2_800ExtraBold',
  baloo700: 'Baloo2_700Bold',
  nun600: 'Nunito_600SemiBold',
  nun700: 'Nunito_700Bold',
  nun800: 'Nunito_800ExtraBold',
}

const C = {
  screenBg: '#EAF4FB',
  ink: '#13344E',
  blueDark: '#1E5F92',
  blue: '#2E7CB8',
  statLabel: '#7C8FA3',
  chipBlueBg: '#BFE0F5',
  chipYellowBg: '#FFF3B0',
  chipYellowInk: '#8A6D00',
  chipOutline: '#D6EAF8',
  clinicSub: '#4C6680',
  divider: '#F0F6FC',
  tile: '#EAF4FB',
  tileYellow: '#FFF6CC',
  iconYellow: '#C99700',
  green: '#52C41A',
  greenInk: '#2F7D12',
  greenBorder: '#C5E8B5',
  badgeBg: '#FFF3B0',
  badgeInk: '#8A6D00',
  chevron: '#C2CCD9',
  danger: '#D24B4B',
  dangerBorder: '#F3D6D6',
  crmvGreen: '#389E0D',
}

const cardShadow = {
  shadowColor: '#1E5F92',
  shadowOpacity: 0.16,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
}

/**
 * Prefixo fixo "Dr(a)." no nome (sem gênero no backend). Não duplica se o nome
 * já vier com Dr./Dra./Dr(a).
 */
function withHonorific(name: string): string {
  const trimmed = name.trim()
  if (!trimmed || /^dr\(?a?\)?\.?\s/i.test(trimmed)) return trimmed
  return `Dr(a). ${trimmed}`
}

function yearsSince(iso?: string | null): number {
  if (!iso) return 0
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 0) return 0
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000))
}

export function PerfilScreen() {
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const navigation = useNavigation<NativeStackNavigationProp<VetProfileStackParamList>>()
  const { user, logout } = useAuth()
  const { data: profile, isLoading, isError } = useMyVetProfile()
  useLingui()

  // Sem backend de disponibilidade/preferências ainda — toggles locais. TODO(backend): persistir.
  const [accepting, setAccepting] = useState(true)
  const [notifs, setNotifs] = useState(true)
  const soon = () => toast.info(t`Em breve`)

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.blue} />
      </View>
    )
  }

  if (isError || !profile) {
    return (
      <View style={[styles.center, { paddingHorizontal: 24 }]}>
        <Text style={styles.errorText}>
          {t`Não foi possível carregar seu perfil. Tente novamente.`}
        </Text>
      </View>
    )
  }

  const name = user?.name?.trim() ? withHonorific(user.name) : t`Veterinário(a)`
  const subtitle = [profile.specialties[0], profile.crmvUf].filter(Boolean).join(' · ')
  const approved = profile.verification === 'APPROVED'

  // TODO(backend): nota/contagens reais (reviews + appointments). Hoje: vet novo.
  const anos = yearsSince(profile.createdAt)

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
        <View style={styles.headerBlob} />
        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {profile.photoUrl ? (
                <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} />
              ) : (
                <Svg
                  width={30}
                  height={30}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7CA9CC"
                  strokeWidth={1.6}
                >
                  <Circle cx={12} cy={9} r={3.4} />
                  <Path d="M5 20c0-3.6 3-6.5 7-6.5s7 2.9 7 6.5" strokeLinecap="round" />
                </Svg>
              )}
            </View>
            {approved ? (
              <View style={styles.verifiedBadge}>
                <Svg
                  width={13}
                  height={13}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.blue}
                  strokeWidth={2.2}
                >
                  <Path d="M4 13l4 4 12-12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            ) : null}
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {subtitle ? (
              <Text style={styles.headerSub} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            <View style={styles.badgesRow}>
              <View style={styles.crmvBadge}>
                <Text style={styles.crmvBadgeText}>
                  {`CRMV-${profile.crmvUf}${approved ? ' ✓' : ''}`}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingText}>{t`Novo`}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 96 }]}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value="0" label={t`Consultas`} />
          <StatCard value="—" label={t`0 avaliações`} />
          <StatCard value={`${anos} ${anos === 1 ? t`ano` : t`anos`}`} label={t`Na PetÁgil`} />
        </View>

        {/* Especialidades */}
        <Text style={styles.sectionTitle}>{t`Especialidades`}</Text>
        <View style={styles.chips}>
          {profile.specialties.map((spec, i) => (
            <Chip key={`${spec}-${i}`} label={spec} index={i} />
          ))}
        </View>

        {/* Clínica */}
        {profile.clinicName ? (
          <View style={[styles.clinicCard, cardShadow]}>
            <LinearGradient
              colors={['#BFE0F5', '#8FC8EC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.clinicTile}
            >
              <Text style={styles.clinicEmoji}>🏥</Text>
            </LinearGradient>
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName} numberOfLines={1}>
                {profile.clinicName}
              </Text>
              {profile.clinicAddress ? (
                <Text style={styles.clinicAddress} numberOfLines={1}>
                  {profile.clinicAddress}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Recebendo agendamentos */}
        <LinearGradient
          colors={['#EAF7E4', '#DCF3D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.acceptCard}
        >
          <View style={styles.acceptLeft}>
            <View style={styles.acceptDotRing}>
              <View style={styles.acceptDot} />
            </View>
            <Text style={styles.acceptText}>{t`Recebendo agendamentos`}</Text>
          </View>
          <Pressable
            onPress={() => setAccepting(v => !v)}
            accessibilityRole="switch"
            accessibilityState={{ checked: accepting }}
            accessibilityLabel={t`Recebendo agendamentos`}
            style={[styles.switch, { backgroundColor: accepting ? C.green : '#C3CEDC' }]}
          >
            <View style={[styles.switchKnob, accepting ? styles.knobOn : styles.knobOff]} />
          </Pressable>
        </LinearGradient>

        {/* Menu de gestão (card único) */}
        <View style={[styles.menuCard, cardShadow]}>
          <MenuRow
            label={t`Editar perfil e foto`}
            onPress={() => navigation.navigate('EditarPerfil')}
            icon={
              <Svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Path d="M4 20h4L18 10l-4-4L4 16z" strokeLinejoin="round" />
                <Path d="M13.5 6.5l4 4" strokeLinecap="round" />
              </Svg>
            }
          />
          <MenuRow
            label={t`Meus horários`}
            onPress={() => navigation.navigate('MeusHorarios')}
            icon={
              <Svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Rect x={3} y={5} width={18} height={16} rx={3} />
                <Line x1={3} y1={9} x2={21} y2={9} />
                <Line x1={8} y1={2.5} x2={8} y2={6.5} strokeLinecap="round" />
                <Line x1={16} y1={2.5} x2={16} y2={6.5} strokeLinecap="round" />
              </Svg>
            }
          />
          <MenuRow
            label={t`Folgas & bloqueios`}
            onPress={() => navigation.navigate('FolgasBloqueios')}
            icon={
              <Svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Circle cx={12} cy={12} r={9} />
                <Line x1={5.6} y1={5.6} x2={18.4} y2={18.4} strokeLinecap="round" />
              </Svg>
            }
          />
          <MenuRow
            label={t`Avaliações dos tutores`}
            onPress={soon}
            icon={
              <Svg
                width={17}
                height={17}
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
          <MenuRow
            label={t`Plano & pagamento`}
            badge={t`Profissional`}
            onPress={soon}
            last
            tileColor={C.tileYellow}
            icon={
              <Svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.iconYellow}
                strokeWidth={1.8}
              >
                <Rect x={2} y={6} width={20} height={13} rx={3} />
                <Line x1={2} y1={11} x2={22} y2={11} />
              </Svg>
            }
          />
        </View>

        {/* Preferências & suporte */}
        <View style={[styles.menuCard, cardShadow]}>
          <MenuRow
            label={t`Lembretes & notificações`}
            toggle={{ value: notifs, onChange: () => setNotifs(v => !v) }}
            icon={
              <Svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Path
                  d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path d="M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" />
              </Svg>
            }
          />
          <MenuRow
            label={t`Ajuda & suporte`}
            onPress={soon}
            last
            icon={
              <Svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.blue}
                strokeWidth={1.8}
              >
                <Circle cx={12} cy={12} r={9} />
                <Path d="M9.5 9a2.5 2.5 0 015 .3c0 1.7-2.5 2-2.5 4" strokeLinecap="round" />
                <Line x1={12} y1={17.5} x2={12} y2={17.5} strokeLinecap="round" strokeWidth={2.4} />
              </Svg>
            }
          />
        </View>

        {/* Sair */}
        <Pressable
          onPress={() => void logout()}
          accessibilityRole="button"
          accessibilityLabel={t`Sair da conta`}
          style={styles.logoutBtn}
        >
          <Svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.danger}
            strokeWidth={1.9}
          >
            <Path
              d="M16 17l5-5-5-5M21 12H9M12 21H6a3 3 0 01-3-3V6a3 3 0 013-3h6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.logoutText}>{t`Sair da conta`}</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={[styles.statCard, cardShadow]}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

function Chip({ label, index }: { label: string; index: number }) {
  const isSilvestre = /silvestre/i.test(label)
  if (isSilvestre) {
    return (
      <View style={[styles.chip, { backgroundColor: C.chipYellowBg }]}>
        <Text style={[styles.chipText, { color: C.chipYellowInk }]}>{`🦜 ${label}`}</Text>
      </View>
    )
  }
  if (index === 0) {
    return (
      <View style={[styles.chip, { backgroundColor: C.chipBlueBg }]}>
        <Text style={[styles.chipText, { color: C.blueDark }]}>{label}</Text>
      </View>
    )
  }
  return (
    <View style={[styles.chip, styles.chipOutline]}>
      <Text style={[styles.chipText, { color: C.blueDark }]}>{label}</Text>
    </View>
  )
}

function MenuRow({
  icon,
  label,
  badge,
  onPress,
  last,
  tileColor,
  toggle,
}: {
  icon: ReactNode
  label: string
  badge?: string
  onPress?: () => void
  last?: boolean
  tileColor?: string
  toggle?: { value: boolean; onChange: () => void }
}) {
  return (
    <Pressable
      onPress={toggle ? toggle.onChange : onPress}
      accessibilityRole={toggle ? 'switch' : 'button'}
      accessibilityState={toggle ? { checked: toggle.value } : undefined}
      accessibilityLabel={label}
      style={[styles.menuRow, !last && styles.menuRowBorder]}
    >
      <View style={[styles.menuTile, { backgroundColor: tileColor ?? C.tile }]}>{icon}</View>
      <Text style={styles.menuLabel} numberOfLines={1}>
        {label}
      </Text>
      {toggle ? (
        <View style={[styles.switch, { backgroundColor: toggle.value ? C.green : '#C3CEDC' }]}>
          <View style={[styles.switchKnob, toggle.value ? styles.knobOn : styles.knobOff]} />
        </View>
      ) : badge ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.screenBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.screenBg },
  errorText: { fontFamily: F.nun600, fontSize: 14, color: C.clinicSub, textAlign: 'center' },

  header: {
    paddingHorizontal: 22,
    paddingBottom: 26,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { width: 72, height: 72 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#D3E8F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  name: { fontFamily: F.baloo800, fontSize: 23, color: '#FFFFFF' },
  headerSub: {
    fontFamily: F.nun600,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginVertical: 3,
  },
  badgesRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  crmvBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  crmvBadgeText: { fontFamily: F.nun800, fontSize: 12, color: C.crmvGreen },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingStar: { color: '#FFE07A', fontSize: 12 },
  ratingText: { fontFamily: F.nun800, fontSize: 12, color: '#FFFFFF' },

  scroll: { paddingHorizontal: 18 },
  statsRow: { flexDirection: 'row', gap: 9, marginVertical: 14 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: { fontFamily: F.baloo800, fontSize: 22, color: C.blueDark },
  statLabel: { fontFamily: F.nun700, fontSize: 11.5, color: C.statLabel, marginTop: 2 },

  sectionTitle: { fontFamily: F.baloo800, fontSize: 16, color: C.ink, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderRadius: 13, paddingHorizontal: 13, paddingVertical: 8 },
  chipOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.chipOutline },
  chipText: { fontFamily: F.nun700, fontSize: 14 },

  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
  },
  clinicTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicEmoji: { fontSize: 20 },
  clinicInfo: { flex: 1 },
  clinicName: { fontFamily: F.baloo800, fontSize: 16, color: C.ink },
  clinicAddress: { fontFamily: F.nun600, fontSize: 13, color: C.clinicSub },

  acceptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 18,
  },
  acceptLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  acceptDotRing: {
    width: 15,
    height: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(82,196,26,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: C.green },
  acceptText: { fontFamily: F.nun700, fontSize: 14.5, color: C.greenInk },
  switch: { width: 40, height: 23, borderRadius: 999, justifyContent: 'center' },
  switchKnob: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  knobOn: { right: 2.5 },
  knobOff: { left: 2.5 },

  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
  menuTile: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontFamily: F.nun700, fontSize: 15, color: C.ink },
  menuBadge: {
    backgroundColor: C.badgeBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  menuBadgeText: { fontFamily: F.nun800, fontSize: 11, color: C.badgeInk },
  chevron: { color: C.chevron, fontSize: 22 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: C.dangerBorder,
    borderRadius: 16,
    paddingVertical: 13,
  },
  logoutText: { fontFamily: F.baloo700, fontSize: 15, color: C.danger },
})
