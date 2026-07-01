/**
 * PetCadastroScreen — cadastro do pet do tutor. Visual brand-themed: header em
 * gradiente, foto com badge de câmera, nome, espécie (pílulas com animação),
 * raça/idade e uma faixa de carteira de vacinação (opcional, ação "em breve").
 *
 * Papel de GATE: é renderizada pelo `TutorRoot` (shell do tutor) enquanto o tutor
 * não tem ≥1 pet. NÃO recebe param de navegação e NÃO chama `completeOnboarding`
 * (o tutor já está autenticado) — comunica conclusão via `onDone`, que seta o
 * flag `has-pet` e faz o shell re-renderizar para as tabs.
 *
 * Brand-themed / mode-independent (paleta fixa da marca, não `semantic.*` — segue
 * o padrão de `VetProfileForm`/`RoleSelectScreen`).
 *
 * Back físico Android é CONSUMIDO enquanto a tela está montada (gate obrigatório
 * não deve fechar o app por engano) — decisão consciente.
 */
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  BackHandler,
  type TextInputProps,
} from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import { GradientButton, useToast } from '@/components/ui'
import { IconUser, IconImage } from '@/assets/icons'
import { SPECIES_OPTIONS, useCreatePet } from '@/features/pets'
import type { ApiSpecies, PickedImage } from '@/features/pets'

interface PetCadastroScreenProps {
  /** Chamado quando o tutor conclui (1º pet salvo ou "Concluir") — seta o flag e libera as tabs. */
  onDone: () => void
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
  pillBorder: '#D6EAF8',
  infoBg: '#F5FAFF',
  infoBorder: '#BFE0F5',
}

type PendingAction = 'save' | 'add' | null

/**
 * Espécie no nível da UI: as 4 aceitas pela API + `other` (placeholder visual).
 * `other` NÃO é persistível (o backend só aceita dog|cat|bird|reptile) — o submit
 * fica bloqueado enquanto estiver selecionada. Suporte real fica para spec futura.
 */
type UiSpecies = ApiSpecies | 'other'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * Rótulo traduzível da espécie. Usa literais estáticos do macro `t` (extraíveis
 * pelo Lingui) — o emoji vem de `SPECIES_OPTIONS`. Mantém a espécie enumerável
 * e localizável (pt-BR/es) sem traduzir um valor dinâmico.
 */
function speciesLabel(value: ApiSpecies): string {
  switch (value) {
    case 'dog':
      return t`Cão`
    case 'cat':
      return t`Gato`
    case 'bird':
      return t`Ave`
    case 'reptile':
      return t`Réptil`
  }
}

export function PetCadastroScreen({ onDone }: PetCadastroScreenProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  useLingui()

  const mutation = useCreatePet()

  const [name, setName] = useState('')
  const [species, setSpecies] = useState<UiSpecies>('dog')
  const [breed, setBreed] = useState('')
  const [age, setAge] = useState('')
  const [photo, setPhoto] = useState<PickedImage | null>(null)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [savedThisSession, setSavedThisSession] = useState(false)

  // Gate obrigatório: consome o back físico do Android enquanto montada (não fecha o app).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => sub.remove()
  }, [])

  const clearError = (field: string) =>
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const pickImage = async () => {
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
    setPhoto({
      uri: asset.uri,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
    })
  }

  const validate = (): boolean => {
    const next: Record<string, string | undefined> = {}
    if (name.trim().length < 1) next.name = t`Informe o nome do pet`
    // "Outros" ainda não é suportado pelo backend → bloqueia o submit.
    if (species === 'other') next.species = t`A espécie "Outros" chega em breve 🐾`
    // Idade é opcional; se preenchida, precisa ser inteiro 0–100 (rejeita decimais, NaN, 1e2).
    const ageRaw = age.trim()
    if (ageRaw) {
      const n = Number(ageRaw)
      if (!/^\d+$/.test(ageRaw) || n < 0 || n > 100) {
        next.age = t`Idade inválida (anos, 0 a 100)`
      }
    }
    setErrors(next)
    return Object.values(next).every(v => !v)
  }

  const buildPayload = () => ({
    name: name.trim(),
    // validate() bloqueia 'other', então aqui species é sempre uma ApiSpecies.
    species: species as ApiSpecies,
    breed: breed.trim() || undefined,
    ageYears: age.trim() ? Number(age.trim()) : undefined,
  })

  const resetForm = () => {
    setName('')
    setSpecies('dog')
    setBreed('')
    setAge('')
    setPhoto(null)
    setErrors({})
  }

  const submit = (action: 'save' | 'add') => {
    if (!validate()) return
    setPendingAction(action)
    mutation.mutate(
      { payload: buildPayload(), photo },
      {
        onSuccess: () => {
          if (action === 'save') {
            // NÃO limpa `pendingAction`: mantém os CTAs travados até a tela desmontar
            // (trava anti-duplicação — sem janela para um segundo POST).
            onDone()
          } else {
            toast.success(t`Pet salvo! Cadastre outro 🐾`)
            resetForm()
            setSavedThisSession(true)
            setPendingAction(null)
          }
        },
        onError: () => {
          toast.error(t`Não foi possível salvar o pet. Tente novamente.`)
          setPendingAction(null)
        },
      }
    )
  }

  const handleConcluir = () => onDone()

  // "Outros": seleciona visualmente + avisa "em breve". O submit fica bloqueado
  // enquanto estiver selecionada (validate) — backend ainda não aceita essa espécie.
  const handleSelectOther = () => {
    setSpecies('other')
    clearError('species')
    toast.info(t`Em breve`)
  }

  // Carteira de vacinação: ação ainda não implementada (sem navegação por ora).
  const handleAddVaccine = () => toast.info(t`Em breve`)

  const isPending = mutation.isPending
  // Trava anti-duplicação (AC9): durante a criação OU após um "Salvar" bem-sucedido
  // (que mantém `pendingAction='save'` até a tela desmontar), TODOS os CTAs ficam
  // travados — `mutation.isPending` volta a `false` no settle, então não basta ele.
  const isLocked = isPending || pendingAction === 'save'
  const avatarUri = photo?.uri ?? null

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
          <Text style={[theme.textStyles.h3600, styles.headerTitle]}>{t`Cadastre seu pet`}</Text>
          <Text style={[theme.textStyles.sm400, styles.headerSubtitle]}>
            {t`Todo tutor precisa de ao menos um pet 🐾`}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Foto do pet */}
          <View style={styles.photoBlock}>
            <Pressable
              onPress={() => void pickImage()}
              accessibilityRole="button"
              accessibilityLabel={t`Adicionar foto do pet`}
              testID="pet-photo"
              style={styles.avatarWrap}
            >
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <IconUser size={44} color={C.blue} />
                )}
              </View>
              <View style={styles.cameraBadge}>
                <IconImage size={18} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={[theme.textStyles.base600, styles.photoTitle]}>{t`Adicionar foto`}</Text>
          </View>

          {/* Nome do pet */}
          <Field
            value={name}
            onChangeText={v => {
              setName(v)
              clearError('name')
            }}
            error={errors.name}
            placeholder={t`Nome do pet`}
            accessibilityLabel={t`Nome do pet`}
            testID="pet-name"
          />

          {/* Espécie */}
          <Text style={[theme.textStyles.base600, styles.sectionTitle]}>{t`Espécie`}</Text>
          <View style={styles.speciesRow} accessibilityRole="radiogroup">
            {SPECIES_OPTIONS.map(option => (
              <SpeciesPill
                key={option.value}
                emoji={option.emoji}
                label={speciesLabel(option.value)}
                selected={species === option.value}
                onPress={() => {
                  setSpecies(option.value)
                  clearError('species')
                }}
                testID={`pet-species-${option.value}`}
              />
            ))}
            {/* "Outros": placeholder visual (backend ainda não aceita) — ver handleSelectOther. */}
            <SpeciesPill
              emoji="🐾"
              label={t`Outros`}
              selected={species === 'other'}
              onPress={handleSelectOther}
              testID="pet-species-other"
            />
          </View>
          {errors.species ? (
            <Text
              style={[theme.textStyles.sm400, { color: theme.colors.error[6] }]}
              accessibilityLiveRegion="polite"
            >
              {errors.species}
            </Text>
          ) : null}

          {/* Raça + Idade */}
          <View style={styles.row}>
            <View style={styles.flex2}>
              <Field
                value={breed}
                onChangeText={setBreed}
                placeholder={t`Raça (opcional)`}
                accessibilityLabel={t`Raça`}
                testID="pet-breed"
              />
            </View>
            <View style={styles.flex1}>
              <Field
                value={age}
                onChangeText={v => {
                  // Aceita apenas dígitos (remove qualquer caractere não-numérico).
                  setAge(v.replace(/[^0-9]/g, ''))
                  clearError('age')
                }}
                error={errors.age}
                placeholder={t`Idade`}
                accessibilityLabel={t`Idade em anos`}
                testID="pet-age"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Carteira de vacinação — opcional, com ação "Adicionar" (em breve) */}
          <View style={styles.vaccineBox}>
            <Text style={styles.vaccineEmoji}>💉</Text>
            <View style={styles.vaccineTexts}>
              <Text style={[theme.textStyles.sm600, { color: C.ink }]}>
                {t`Carteira de vacinação`}
              </Text>
              <Text style={[theme.textStyles.sm400, { color: C.inkSoft }]}>
                {t`Opcional · adicione quando quiser`}
              </Text>
            </View>
            <Pressable
              onPress={handleAddVaccine}
              accessibilityRole="button"
              accessibilityLabel={t`Adicionar carteira de vacinação`}
              testID="pet-vaccine-add"
              style={styles.vaccineAddBtn}
            >
              <Text style={[theme.textStyles.sm600, { color: C.blue }]}>{t`Adicionar`}</Text>
            </Pressable>
          </View>

          {/* Empurra os CTAs para o rodapé — conteúdo ocupa a tela toda. */}
          <View style={styles.spacer} />

          <GradientButton
            testID="pet-save"
            title={t`Salvar pet`}
            onPress={() => submit('save')}
            loading={pendingAction === 'save'}
            disabled={isLocked}
            style={styles.saveButton}
          />

          <Pressable
            onPress={() => submit('add')}
            accessibilityRole="button"
            accessibilityLabel={t`Adicionar outro pet`}
            accessibilityState={{ disabled: isLocked }}
            testID="pet-add-another"
            disabled={isLocked}
            style={[styles.secondaryButton, isLocked && styles.secondaryDisabled]}
          >
            <Text style={[theme.textStyles.base600, { color: C.blueDark }]}>
              {pendingAction === 'add' ? t`Salvando…` : t`+ Adicionar outro pet`}
            </Text>
          </Pressable>

          {savedThisSession ? (
            <Pressable
              onPress={handleConcluir}
              accessibilityRole="button"
              accessibilityLabel={t`Concluir`}
              accessibilityState={{ disabled: isLocked }}
              testID="pet-done"
              disabled={isLocked}
              style={styles.doneButton}
            >
              <Text style={[theme.textStyles.base600, { color: C.blue }]}>{t`Concluir`}</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

// ---------------------------------------------------------------------------
// SpeciesPill — pílula de espécie. Animação única e leve: ao ser SELECIONADA,
// cresce um pouco (scale 1.06) com um timing curto. Sem feedback de toque nem
// animação de emoji (mantém fluido em devices/emuladores mais lentos).
// ---------------------------------------------------------------------------
function SpeciesPill({
  emoji,
  label,
  selected,
  onPress,
  testID,
}: {
  emoji: string
  label: string
  selected: boolean
  onPress: () => void
  testID: string
}) {
  const theme = useTheme()
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withTiming(selected ? 1.06 : 1, { duration: 160 })
  }, [selected, scale])

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      testID={testID}
      style={[
        styles.speciesPill,
        pillStyle,
        selected
          ? { backgroundColor: C.blue, borderColor: C.blue }
          : { backgroundColor: C.card, borderColor: C.pillBorder },
      ]}
    >
      <Text style={styles.speciesEmoji}>{emoji}</Text>
      <Text
        style={[theme.textStyles.sm600, { color: selected ? '#FFFFFF' : C.blueDark }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  )
}

// ---------------------------------------------------------------------------
// Field — card branco com TextInput (visual do mock; espelha VetProfileForm).
// ---------------------------------------------------------------------------
interface FieldProps extends Omit<TextInputProps, 'style'> {
  error?: string
}

function Field({ error, accessibilityLabel, ...inputProps }: FieldProps) {
  const theme = useTheme()
  return (
    <View style={styles.fieldContainer}>
      <View
        style={[styles.fieldCard, { borderColor: error ? theme.colors.error[6] : C.cardBorder }]}
      >
        <TextInput
          style={[styles.fieldInput, theme.textStyles.base400, { color: C.ink }]}
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
  headerTitle: {
    color: '#FFFFFF',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 14,
  },
  photoBlock: {
    alignItems: 'center',
    marginBottom: 4,
    paddingTop: 4,
  },
  avatarWrap: {
    width: 104,
    height: 104,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
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
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
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
  fieldContainer: {
    width: '100%',
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: C.card,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 14,
  },
  fieldError: {
    marginTop: 4,
  },
  sectionTitle: {
    color: C.ink,
    marginTop: 4,
  },
  speciesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesPill: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 6,
  },
  speciesEmoji: {
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  vaccineBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: C.infoBg,
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: 15,
    padding: 13,
  },
  vaccineEmoji: {
    fontSize: 20,
  },
  vaccineTexts: {
    flex: 1,
    gap: 1,
  },
  vaccineAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.blue,
    backgroundColor: C.card,
  },
  spacer: {
    flexGrow: 1,
    minHeight: 16,
  },
  saveButton: {
    height: 54,
    marginTop: 4,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.pillBorder,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryDisabled: {
    opacity: 0.5,
  },
  doneButton: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
