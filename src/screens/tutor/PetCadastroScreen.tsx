/**
 * PetCadastroScreen — cadastro do pet do tutor. Visual fiel ao mock
 * (`cadastropet.html`): header em gradiente, foto com badge de câmera, nome,
 * espécie (pílulas), raça/idade e um aviso informativo de carteira de vacinação.
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
  const [species, setSpecies] = useState<ApiSpecies>('dog')
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
    species,
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
                  <IconUser size={32} color={C.blue} />
                )}
              </View>
              <View style={styles.cameraBadge}>
                <IconImage size={14} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={[theme.textStyles.sm600, styles.photoTitle]}>{t`Adicionar foto`}</Text>
            <Text style={[theme.textStyles.sm400, styles.photoHint]}>{t`Opcional 💙`}</Text>
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
            {SPECIES_OPTIONS.map(option => {
              const selected = species === option.value
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSpecies(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={speciesLabel(option.value)}
                  testID={`pet-species-${option.value}`}
                  style={[
                    styles.speciesPill,
                    selected
                      ? { backgroundColor: C.blue, borderColor: C.blue }
                      : { backgroundColor: C.card, borderColor: C.pillBorder },
                  ]}
                >
                  <Text style={styles.speciesEmoji}>{option.emoji}</Text>
                  <Text
                    style={[theme.textStyles.sm600, { color: selected ? '#FFFFFF' : C.blueDark }]}
                    numberOfLines={1}
                  >
                    {speciesLabel(option.value)}
                  </Text>
                </Pressable>
              )
            })}
          </View>

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
                  setAge(v)
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

          {/* Carteira de vacinação — informativo (sem ação nesta etapa) */}
          <View style={styles.infoBox}>
            <Text style={styles.infoEmoji}>💉</Text>
            <Text style={[theme.textStyles.sm400, styles.infoText]}>
              {t`Carteira de vacinação você adiciona depois, com calma.`}
            </Text>
          </View>

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
  fieldInput: {
    flex: 1,
    paddingVertical: 12,
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
    gap: 8,
  },
  speciesPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 6,
  },
  speciesEmoji: {
    fontSize: 16,
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
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: C.infoBg,
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
  saveButton: {
    height: 54,
    marginTop: 8,
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
