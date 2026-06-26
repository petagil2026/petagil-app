/**
 * CreateAccountScreen — "Crie sua conta" (etapa 1 do cadastro).
 *
 * Fiel ao Figma (node 411:110): header em gradiente com indicador de progresso de
 * 3 passos (1º ativo), título "Crie sua conta" + subtítulo, cinco cards brancos
 * elevados (ícone azul à esquerda), CTA gradiente e rodapé de termos.
 *
 * Coleta nome, e-mail, celular (WhatsApp), cidade e senha. NÃO chama a API aqui:
 * o `POST /auth/register` precisa do papel, então os dados seguem como rascunho
 * (`AccountDraft`) para a tela de seleção de papel, que efetiva o cadastro.
 *
 * Brand-themed / mode-independent: usa a paleta fixa da marca (não `semantic.*`),
 * pois é tela de marca do onboarding — mesma exceção consciente da LoginScreen.
 *
 * Fontes da marca (mesma exceção brand-themed da RoleSelectScreen): títulos/CTA em
 * Baloo 2 e corpo/labels/inputs/rodapé em Nunito, aplicados por `fontFamily` literal
 * no StyleSheet (não passam pelos tokens de tipografia, que são Rubik/Montserrat). Os
 * pesos disponíveis (carregados no `useFonts` de App.tsx) são Baloo2 {700, 800} e
 * Nunito {600, 700, 800} — NÃO há peso regular (400). O header tem um círculo
 * translúcido decorativo (canto superior direito, recortado por `overflow: 'hidden'`,
 * oculto da árvore de acessibilidade). Os tamanhos de fonte usam tokens de escala do
 * DS (subtítulo 14, inputs 16, CTA 18, termos 12), com `lineHeight` explícito para
 * absorver a métrica mais alta da Baloo 2 com fonte grande do sistema.
 *
 * Layout (preenche a tela, sem amontoar no topo — igual ao LoginScreen): `body` em
 * `flex: 1`; os 5 campos ficam no topo com ritmo uniforme (`fieldsGroup`, gap 16) e o
 * CTA + termos são ancorados na base (`footerGroup` com `marginTop: 'auto'`), absorvendo
 * o espaço livre em vez de deixar vão branco.
 *
 * Desvios conscientes do print: (a) toggle mostrar/ocultar senha (UX + consistência
 * com o Login); (b) o CTA é "Próximo →" (no nosso fluxo o passo seguinte é a seleção
 * de papel, não o cadastro de pet).
 */
import React, { forwardRef, useRef, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable, type TextInputProps } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import { GradientButton } from '@/components/ui'
import {
  IconUser,
  IconEnvelope,
  IconLock,
  IconPhone,
  IconPin,
  IconEye,
  IconEyeSlash,
} from '@/assets/icons'
import type { AuthStackScreenProps } from '@/navigation/types'

type Navigation = AuthStackScreenProps<'CreateAccount'>['navigation']

// Paleta fiel ao mock (brand-themed, independente de tema claro/escuro).
const C = {
  screenBg: '#EAF4FB',
  card: '#FFFFFF',
  cardBorder: '#E6F1FA',
  ink: '#13344E',
  placeholder: '#9AA7BA',
  footer: '#9AA7BA',
  // Tons do header (sobre o gradiente da marca): título sólido, subtítulo 90%,
  // círculo decorativo ~13%. Concatenação alpha-hex em vez de rgba (project-context).
  headerInk: '#FFFFFF',
  headerInkSoft: '#FFFFFFE6',
  headerCircle: '#FFFFFF21',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Conta dígitos do telefone — exige ao menos 10 (DDD + número). */
const phoneDigits = (value: string): number => value.replace(/\D/g, '').length

/** Máscara BR leve `(99) 99999-9999` (apenas formatação visual). */
function formatPhoneBR(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function CreateAccountScreen() {
  const theme = useTheme()
  const navigation = useNavigation<Navigation>()
  const insets = useSafeAreaInsets()
  useLingui()

  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const cityRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [showPassword, setShowPassword] = useState(false)

  const clearError = (field: string) =>
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const validate = (): boolean => {
    const next: Record<string, string | undefined> = {}
    if (name.trim().length < 2) next.name = t`Informe seu nome completo`
    if (!EMAIL_REGEX.test(email.trim())) next.email = t`Digite um e-mail válido`
    if (phoneDigits(phone) < 10) next.phone = t`Digite um celular válido com DDD`
    if (city.trim().length < 2) next.city = t`Informe sua cidade`
    if (password.length < 8) next.password = t`A senha precisa de ao menos 8 caracteres`
    setErrors(next)
    return Object.values(next).every(v => !v)
  }

  const handleContinue = () => {
    if (!validate()) return
    navigation.navigate('RoleSelect', {
      account: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ''),
        city: city.trim(),
        password,
      },
    })
  }

  const continueDisabled =
    !name.trim() || !email.trim() || !phone.trim() || !city.trim() || !password

  return (
    <View style={[styles.root, { backgroundColor: C.screenBg }]}>
      <StatusBar style="light" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bottomOffset={theme.spacing.xl}
      >
        <LinearGradient
          colors={[theme.gradients.header.start, theme.gradients.header.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + theme.spacing.xl }]}
        >
          <View
            style={styles.headerCircle}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <ProgressSteps total={3} active={0} />
          <Text style={styles.title}>{t`Crie sua conta`}</Text>
          <Text style={styles.subtitle}>{t`Leva menos de 1 minuto 🐾`}</Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.fieldsGroup}>
            <AccountField
              testID="cadastro-name"
              icon={<IconUser size={18} color={theme.colors.brandBlue[6]} />}
              value={name}
              onChangeText={v => {
                setName(v)
                clearError('name')
              }}
              error={errors.name}
              placeholder={t`Nome completo`}
              accessibilityLabel={t`Nome completo`}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />

            <AccountField
              ref={emailRef}
              testID="cadastro-email"
              icon={<IconEnvelope size={18} color={theme.colors.brandBlue[6]} />}
              value={email}
              onChangeText={v => {
                setEmail(v)
                clearError('email')
              }}
              error={errors.email}
              placeholder={t`E-mail`}
              accessibilityLabel={t`E-mail`}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
            />

            <AccountField
              ref={phoneRef}
              testID="cadastro-phone"
              icon={<IconPhone size={18} color={theme.colors.brandBlue[6]} />}
              value={phone}
              onChangeText={v => {
                setPhone(formatPhoneBR(v))
                clearError('phone')
              }}
              error={errors.phone}
              placeholder={t`Celular (WhatsApp)`}
              accessibilityLabel={t`Celular (WhatsApp)`}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="next"
              onSubmitEditing={() => cityRef.current?.focus()}
              blurOnSubmit={false}
            />

            <AccountField
              ref={cityRef}
              testID="cadastro-city"
              icon={<IconPin size={18} color={theme.colors.brandBlue[6]} />}
              value={city}
              onChangeText={v => {
                setCity(v)
                clearError('city')
              }}
              error={errors.city}
              placeholder={t`Cidade`}
              accessibilityLabel={t`Cidade`}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <AccountField
              ref={passwordRef}
              testID="cadastro-password"
              icon={<IconLock size={18} color={theme.colors.brandBlue[6]} />}
              value={password}
              onChangeText={v => {
                setPassword(v)
                clearError('password')
              }}
              error={errors.password}
              placeholder={t`Senha`}
              accessibilityLabel={t`Senha`}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              trailing={
                <Pressable
                  testID="cadastro-password-toggle"
                  onPress={() => setShowPassword(v => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? t`Ocultar senha` : t`Mostrar senha`}
                  hitSlop={8}
                >
                  {showPassword ? (
                    <IconEyeSlash size={20} color={theme.colors.grey[500]} />
                  ) : (
                    <IconEye size={20} color={theme.colors.grey[500]} />
                  )}
                </Pressable>
              }
            />
          </View>

          <View style={styles.footerGroup}>
            <GradientButton
              testID="cadastro-submit"
              title={t`Próximo →`}
              onPress={handleContinue}
              disabled={continueDisabled}
              style={styles.submitButton}
              titleStyle={styles.submitTitle}
            />

            <Text style={styles.terms}>{t`Ao continuar você aceita os Termos de Uso`}</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

/** Indicador de progresso do onboarding (3 passos; o ativo em branco sólido). */
function ProgressSteps({ total, active }: { total: number; active: number }) {
  return (
    <View style={styles.progress}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.progressBar, i === active ? styles.progressOn : styles.progressOff]}
        />
      ))}
    </View>
  )
}

interface AccountFieldProps extends Omit<TextInputProps, 'style'> {
  icon: React.ReactNode
  error?: string
  trailing?: React.ReactNode
}

const AccountField = forwardRef<TextInput, AccountFieldProps>(function AccountField(
  { icon, error, trailing, accessibilityLabel, ...inputProps },
  ref
) {
  const theme = useTheme()
  return (
    <View style={styles.fieldContainer}>
      <View
        style={[styles.fieldCard, { borderColor: error ? theme.colors.error[6] : C.cardBorder }]}
      >
        {icon}
        <TextInput
          ref={ref}
          style={[styles.fieldInput, { color: C.ink }]}
          placeholderTextColor={C.placeholder}
          accessibilityLabel={accessibilityLabel}
          {...inputProps}
        />
        {trailing}
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
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    gap: 8,
    overflow: 'hidden',
  },
  headerCircle: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: C.headerCircle,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
  },
  progressOn: {
    width: 28,
    backgroundColor: '#FFFFFF',
  },
  progressOff: {
    width: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  title: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24,
    lineHeight: 32,
    color: C.headerInk,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
    color: C.headerInkSoft,
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
  },
  // Os 5 campos ocupam o topo com ritmo uniforme (sem amontoar/centralizar).
  fieldsGroup: {
    gap: 16,
  },
  // CTA + termos ancorados na base (marginTop: 'auto' empurra para o rodapé,
  // absorvendo o espaço livre em vez de deixar um vão branco — preenche a tela).
  footerGroup: {
    marginTop: 'auto',
    paddingTop: 20,
    gap: 12,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: C.card,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    gap: 12,
    // Sombra azul suave (adaptação DS do mock). iOS honra shadowColor; no Android o
    // `elevation` só colore a sombra a partir do API 28 — em versões anteriores cai
    // numa sombra neutra (limitação conhecida do RN, mesmo padrão da RoleSelectScreen).
    shadowColor: '#1E5F92',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  fieldInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  fieldError: {
    marginTop: 4,
  },
  submitButton: {
    height: 56,
  },
  submitTitle: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 18,
    lineHeight: 24,
  },
  terms: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: C.footer,
    textAlign: 'center',
  },
})
