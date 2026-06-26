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
          style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}
        >
          <ProgressSteps total={3} active={0} />
          <Text style={[theme.textStyles.h3600, styles.title]}>{t`Crie sua conta`}</Text>
          <Text style={[theme.textStyles.sm400, styles.subtitle]}>
            {t`Leva menos de 1 minuto 🐾`}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
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

          <GradientButton
            testID="cadastro-submit"
            title={t`Próximo →`}
            onPress={handleContinue}
            disabled={continueDisabled}
            style={styles.submitButton}
          />

          <Text style={[theme.textStyles.sm400, styles.terms]}>
            {t`Ao continuar você aceita os Termos de Uso`}
          </Text>
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
        style={[
          styles.fieldCard,
          theme.shadows.sm,
          { borderColor: error ? theme.colors.error[6] : C.cardBorder },
        ]}
      >
        {icon}
        <TextInput
          ref={ref}
          style={[styles.fieldInput, theme.textStyles.base400, { color: C.ink }]}
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
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    gap: 6,
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
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 20,
    gap: 11,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: C.card,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    gap: 12,
  },
  fieldInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  fieldError: {
    marginTop: 4,
  },
  submitButton: {
    height: 54,
    marginTop: 9,
  },
  terms: {
    color: C.footer,
    textAlign: 'center',
    marginTop: 6,
  },
})
