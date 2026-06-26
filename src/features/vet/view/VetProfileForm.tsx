/**
 * VetProfileForm — formulário do perfil do veterinário, reutilizado na CRIAÇÃO
 * (onboarding) e na EDIÇÃO (aba Perfil). Visual fiel ao Figma (node 411:225):
 * header em gradiente, foto com badge de câmera, CRMV (nº + UF), especialidades,
 * bio, modos de atendimento, dados da clínica e anexo da carteira do CRMV.
 *
 * É "burro": só coleta/valida e devolve os valores via `onSubmit`. Quem chama
 * decide a chamada de rede (POST no create, PATCH no edit) e o pós-sucesso.
 *
 * Brand-themed / mode-independent (paleta fixa da marca, não `semantic.*`).
 */
import { useState, type ReactNode } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  type TextInputProps,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import { GradientButton, useToast } from '@/components/ui'
import {
  IconUser,
  IconImage,
  IconCheck,
  IconAttachment,
  IconChevronLeft,
  IconChevronDown,
} from '@/assets/icons'

import { BRAZIL_UFS, VET_SPECIALTIES } from '../model'
import type { CreateVetProfilePayload, PickedImage } from '../model'
import { SelectSheet } from './SelectSheet'

/** Valores do perfil sem as URLs (que vêm dos uploads). */
export type VetProfileFormValues = Omit<CreateVetProfilePayload, 'photoUrl' | 'crmvDocUrl'>

export interface VetProfileFormSubmit {
  values: VetProfileFormValues
  /** Foto recém-escolhida (null se inalterada). */
  photo: PickedImage | null
  /** Carteira recém-escolhida (null se inalterada). */
  crmvDoc: PickedImage | null
}

interface VetProfileFormProps {
  mode: 'create' | 'edit'
  initial?: Partial<VetProfileFormValues>
  initialPhotoUrl?: string | null
  initialHasCrmvDoc?: boolean
  submitting: boolean
  onSubmit: (data: VetProfileFormSubmit) => void
  /** Edição: callback do botão voltar (chevron no header). */
  onBack?: () => void
}

// Paleta fiel ao mock (brand-themed, independente de tema claro/escuro).
const C = {
  screenBg: '#EAF4FB',
  card: '#FFFFFF',
  cardBorder: '#E6F1FA',
  ink: '#13344E',
  inkSoft: '#4C6680',
  placeholder: '#9AA7BA',
  blue: '#2E7CB8',
  blueDark: '#1E5F92',
  toggleBorder: '#D6EAF8',
  dashedBg: '#F5FAFF',
  dashedBorder: '#A7D3F0',
  infoBorder: '#BFE0F5',
}

export function VetProfileForm({
  mode,
  initial,
  initialPhotoUrl,
  initialHasCrmvDoc = false,
  submitting,
  onSubmit,
  onBack,
}: VetProfileFormProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  useLingui()

  const [crmvNumber, setCrmvNumber] = useState(initial?.crmvNumber ?? '')
  const [crmvUf, setCrmvUf] = useState(initial?.crmvUf ?? '')
  const [specialties, setSpecialties] = useState<string[]>(initial?.specialties ?? [])
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [servesAtClinic, setServesAtClinic] = useState(initial?.servesAtClinic ?? true)
  const [servesAtHome, setServesAtHome] = useState(initial?.servesAtHome ?? false)
  const [clinicName, setClinicName] = useState(initial?.clinicName ?? '')
  const [clinicAddress, setClinicAddress] = useState(initial?.clinicAddress ?? '')
  const [photo, setPhoto] = useState<PickedImage | null>(null)
  const [crmvDoc, setCrmvDoc] = useState<PickedImage | null>(null)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [ufSheet, setUfSheet] = useState(false)
  const [specSheet, setSpecSheet] = useState(false)

  // Opções de especialidade = sugeridas + quaisquer já salvas fora da lista (legado).
  const specOptions = [
    ...VET_SPECIALTIES,
    ...specialties.filter(s => !VET_SPECIALTIES.includes(s)),
  ].map(s => ({ value: s, label: s }))

  const isEdit = mode === 'edit'
  const hasDoc = crmvDoc != null || initialHasCrmvDoc
  const avatarUri = photo?.uri ?? initialPhotoUrl ?? null

  const clearError = (field: string) =>
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const pickImage = async (onPicked: (img: PickedImage) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      toast.error(t`Precisamos de acesso às suas fotos para anexar a imagem.`)
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    })
    if (result.canceled) return
    const asset = result.assets[0]
    onPicked({
      uri: asset.uri,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
    })
  }

  const validate = (): boolean => {
    const next: Record<string, string | undefined> = {}
    if (crmvNumber.trim().length < 1) next.crmvNumber = t`Informe o número do CRMV`
    if (crmvUf.trim().length !== 2) next.crmvUf = t`UF`
    if (specialties.length === 0) next.specialties = t`Selecione ao menos uma especialidade`
    if (!servesAtClinic && !servesAtHome) next.serves = t`Escolha ao menos um local de atendimento`
    if (servesAtClinic && clinicName.trim().length < 2)
      next.clinicName = t`Informe o nome da clínica`
    setErrors(next)
    return Object.values(next).every(v => !v)
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      values: {
        crmvNumber: crmvNumber.trim(),
        crmvUf: crmvUf.trim().toUpperCase(),
        specialties,
        bio: bio.trim() || undefined,
        servesAtClinic,
        servesAtHome,
        clinicName: servesAtClinic ? clinicName.trim() || undefined : undefined,
        clinicAddress: clinicAddress.trim() || undefined,
      },
      photo,
      crmvDoc,
    })
  }

  return (
    <View style={[styles.root, { backgroundColor: C.screenBg }]}>
      <StatusBar style="light" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        bottomOffset={theme.spacing.xl}
      >
        {/* Header com gradiente + título */}
        <LinearGradient
          colors={[theme.gradients.header.start, theme.gradients.header.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}
        >
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t`Voltar`}
              hitSlop={8}
              style={styles.backBtn}
            >
              <IconChevronLeft size={22} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <Text style={[theme.textStyles.h3600, styles.headerTitle]}>
            {isEdit ? t`Editar perfil` : t`Seu perfil profissional`}
          </Text>
          <Text style={[theme.textStyles.sm400, styles.headerSubtitle]}>
            {isEdit
              ? t`Atualize seus dados e sua foto`
              : t`Validamos seu CRMV para gerar confiança`}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Foto do profissional */}
          <View style={styles.photoBlock}>
            <Pressable
              onPress={() => void pickImage(setPhoto)}
              accessibilityRole="button"
              accessibilityLabel={t`Alterar foto do profissional`}
              style={styles.avatarWrap}
            >
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <IconUser size={32} color={C.blue} />
                )}
              </View>
              <View style={styles.cameraBadge}>
                <IconImage size={14} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={[theme.textStyles.sm600, styles.photoTitle]}>
              {isEdit ? t`Alterar foto` : t`Adicionar foto do profissional`}
            </Text>
            <Text style={[theme.textStyles.sm400, styles.photoHint]}>
              {t`Tutores confiam mais em quem eles veem 💙`}
            </Text>
          </View>

          {/* CRMV nº + UF */}
          <View style={styles.row}>
            <View style={styles.crmvNumber}>
              <Field
                prefix={t`Nº`}
                value={crmvNumber}
                onChangeText={v => {
                  setCrmvNumber(v)
                  clearError('crmvNumber')
                }}
                error={errors.crmvNumber}
                placeholder={t`CRMV`}
                accessibilityLabel={t`Número do CRMV`}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.crmvUf}>
              <SelectField
                value={crmvUf}
                placeholder={t`UF`}
                error={errors.crmvUf}
                onPress={() => setUfSheet(true)}
                accessibilityLabel={t`Estado (UF) do CRMV`}
              />
            </View>
          </View>

          <SelectField
            prefix="🏥"
            value={specialties.join(', ')}
            placeholder={t`Especialidades`}
            error={errors.specialties}
            onPress={() => setSpecSheet(true)}
            accessibilityLabel={t`Especialidades`}
          />

          <Field
            value={bio}
            onChangeText={setBio}
            placeholder={t`Sobre você · breve bio`}
            accessibilityLabel={t`Sobre você`}
            multiline
            inputStyle={styles.bioInput}
          />

          {/* Onde você atende? */}
          <Text style={[theme.textStyles.base600, styles.sectionTitle]}>
            {t`Onde você atende?`}
          </Text>
          {errors.serves ? (
            <Text style={[theme.textStyles.sm400, { color: theme.colors.error[6] }]}>
              {errors.serves}
            </Text>
          ) : null}
          <View style={styles.row}>
            <Toggle
              label={t`🏥 Na clínica`}
              active={servesAtClinic}
              onPress={() => {
                setServesAtClinic(v => !v)
                clearError('serves')
              }}
            />
            <Toggle
              label={t`🏠 A domicílio`}
              active={servesAtHome}
              onPress={() => {
                setServesAtHome(v => !v)
                clearError('serves')
              }}
            />
          </View>

          {servesAtClinic ? (
            <>
              <Field
                prefix="🏥"
                value={clinicName}
                onChangeText={v => {
                  setClinicName(v)
                  clearError('clinicName')
                }}
                error={errors.clinicName}
                placeholder={t`Nome da clínica`}
                accessibilityLabel={t`Nome da clínica`}
              />
              <Field
                icon={<IconAttachment size={16} color={C.blue} />}
                value={clinicAddress}
                onChangeText={setClinicAddress}
                placeholder={t`Endereço · rua, nº, bairro`}
                accessibilityLabel={t`Endereço`}
              />
            </>
          ) : null}

          {/* Anexar carteira do CRMV */}
          <Pressable
            onPress={() => void pickImage(setCrmvDoc)}
            accessibilityRole="button"
            accessibilityLabel={t`Anexar carteira do CRMV`}
            style={styles.dashedBox}
          >
            {hasDoc ? (
              <IconCheck size={16} color={C.blue} />
            ) : (
              <IconAttachment size={16} color={C.blue} />
            )}
            <Text style={[theme.textStyles.sm600, { color: C.inkSoft }]} numberOfLines={1}>
              {hasDoc ? t`Carteira anexada ✓` : t`Anexar carteira do CRMV (opcional)`}
            </Text>
          </Pressable>

          {/* Info Siscad (só na criação) */}
          {isEdit ? null : (
            <View style={styles.infoBox}>
              <Text style={styles.infoEmoji}>⏳</Text>
              <Text style={[theme.textStyles.sm400, styles.infoText]}>
                {t`Após o envio, seu registro é conferido no Siscad Web (CFMV) e aprovado em até 24h.`}
              </Text>
            </View>
          )}

          <GradientButton
            testID="vet-submit"
            title={isEdit ? t`Salvar alterações` : t`Enviar para verificação`}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAwareScrollView>

      <SelectSheet
        visible={ufSheet}
        onClose={() => setUfSheet(false)}
        title={t`Estado (UF) do CRMV`}
        options={BRAZIL_UFS}
        selected={crmvUf ? [crmvUf] : []}
        onChange={sel => {
          setCrmvUf(sel[0] ?? '')
          clearError('crmvUf')
        }}
      />
      <SelectSheet
        visible={specSheet}
        onClose={() => setSpecSheet(false)}
        title={t`Especialidades`}
        options={specOptions}
        selected={specialties}
        multi
        onChange={sel => {
          setSpecialties(sel)
          clearError('specialties')
        }}
      />
    </View>
  )
}

// ---------------------------------------------------------------------------
// Field — card branco com ícone/prefixo opcional + TextInput (visual do mock).
// ---------------------------------------------------------------------------
interface FieldProps extends Omit<TextInputProps, 'style'> {
  icon?: ReactNode
  prefix?: string
  error?: string
  inputStyle?: TextInputProps['style']
}

function Field({ icon, prefix, error, inputStyle, accessibilityLabel, ...inputProps }: FieldProps) {
  const theme = useTheme()
  return (
    <View style={styles.fieldContainer}>
      <View
        style={[styles.fieldCard, { borderColor: error ? theme.colors.error[6] : C.cardBorder }]}
      >
        {icon}
        {prefix ? <Text style={[theme.textStyles.sm600, styles.fieldPrefix]}>{prefix}</Text> : null}
        <TextInput
          style={[styles.fieldInput, theme.textStyles.base400, { color: C.ink }, inputStyle]}
          placeholderTextColor={C.placeholder}
          accessibilityLabel={accessibilityLabel}
          {...inputProps}
        />
      </View>
      {error ? (
        <Text
          style={[theme.textStyles.sm400, styles.fieldError, { color: theme.colors.error[6] }]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  )
}

// ---------------------------------------------------------------------------
// SelectField — card "select" que abre um BottomSheet (UF / especialidades).
// ---------------------------------------------------------------------------
function SelectField({
  prefix,
  value,
  placeholder,
  error,
  onPress,
  accessibilityLabel,
}: {
  prefix?: string
  value: string
  placeholder: string
  error?: string
  onPress: () => void
  accessibilityLabel?: string
}) {
  const theme = useTheme()
  const hasValue = value.length > 0
  return (
    <View style={styles.fieldContainer}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[styles.fieldCard, { borderColor: error ? theme.colors.error[6] : C.cardBorder }]}
      >
        {prefix ? <Text style={[theme.textStyles.sm600, styles.fieldPrefix]}>{prefix}</Text> : null}
        <Text
          numberOfLines={1}
          style={[
            styles.fieldInput,
            theme.textStyles.base400,
            { color: hasValue ? C.ink : C.placeholder },
          ]}
        >
          {hasValue ? value : placeholder}
        </Text>
        <IconChevronDown size={18} color={C.placeholder} />
      </Pressable>
      {error ? (
        <Text
          style={[theme.textStyles.sm400, styles.fieldError, { color: theme.colors.error[6] }]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Toggle — pílula de seleção (Na clínica / A domicílio).
// ---------------------------------------------------------------------------
function Toggle({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      style={[
        styles.toggle,
        active
          ? { backgroundColor: C.blue, borderColor: C.blue }
          : { backgroundColor: C.card, borderColor: C.toggleBorder },
      ]}
    >
      <Text
        style={[theme.textStyles.sm600, { color: active ? '#FFFFFF' : C.blueDark }]}
        numberOfLines={1}
      >
        {active ? `${label} ✓` : label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
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
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  photoBlock: {
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarWrap: {
    width: 84,
    height: 84,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#D3E8F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTitle: {
    color: C.blue,
    marginTop: 10,
  },
  photoHint: {
    color: C.placeholder,
    marginTop: 2,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    backgroundColor: C.card,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 8,
  },
  fieldPrefix: {
    color: C.blue,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 12,
  },
  bioInput: {
    minHeight: 44,
    textAlignVertical: 'top',
  },
  fieldError: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  crmvNumber: {
    flex: 2,
  },
  crmvUf: {
    flex: 1,
  },
  sectionTitle: {
    color: C.ink,
    marginTop: 8,
  },
  toggle: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dashedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    backgroundColor: C.dashedBg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.dashedBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#E6F3FF',
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: 15,
    padding: 13,
  },
  infoEmoji: {
    fontSize: 17,
  },
  infoText: {
    flex: 1,
    color: C.inkSoft,
  },
  submitButton: {
    height: 54,
    marginTop: 8,
  },
})
