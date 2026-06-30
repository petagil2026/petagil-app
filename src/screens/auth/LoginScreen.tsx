/**
 * LoginScreen — tela de Login (FRONTEND-ONLY).
 *
 * Visual fiel ao Figma e reaproveitando o design system. Características:
 * - **Brand-themed / mode-independent:** o login mantém SEMPRE o visual claro da marca
 *   (não usa `semantic.*`, que invertem no dark). Superfícies vêm de tokens fixos da
 *   paleta (`colors.grey[0]`, `colors.brandBlue[*]`) — exceção consciente à regra de
 *   usar `semantic.*`, justificada por ser tela de marca pré-login.
 * - **Seam de submit injetável:** o envio das credenciais é a prop `onSubmit` (default =
 *   stub que resolve sem rede). NÃO há nenhuma chamada de rede aqui.
 *
 * // TODO(backend): substituir o default de `onSubmit` pela autenticação real (ver
 * //   tech-spec "Backend Integration Handoff"). Usar @/services/api/httpClient — sem fetch direto.
 * // TODO(backend): trocar navigation.navigate('RoleSelect') pelo fluxo autenticado real.
 */
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StyleSheet,
  type TextInputProps,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import { GradientButton, useToast } from '@/components/ui'
import { IconEnvelope, IconLock, IconGoogle, IconEye, IconEyeSlash } from '@/assets/icons'
import type { AuthStackScreenProps } from '@/navigation/types'

/** Contrato do seam de submit — substituído pela auth real na etapa de backend. */
export type LoginSubmit = (credentials: { email: string; password: string }) => Promise<void>

interface LoginScreenProps {
  /** Seam injetável (default = stub sem rede). Testes injetam um spy; backend injeta a auth real. */
  onSubmit?: LoginSubmit
}

/** Validação de formato de e-mail (regra de login; senha não valida tamanho aqui). */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Stub padrão do seam: resolve imediatamente, sem nenhuma chamada de rede. */
const defaultSubmit: LoginSubmit = () => Promise.resolve()

type LoginNavigation = AuthStackScreenProps<'Login'>['navigation']

export function LoginScreen({ onSubmit = defaultSubmit }: LoginScreenProps) {
  const theme = useTheme()
  const toast = useToast()
  const navigation = useNavigation<LoginNavigation>()
  const insets = useSafeAreaInsets()
  // Assina mudanças de locale para reavaliar as strings dos macros `t` em re-render.
  useLingui()

  const passwordRef = useRef<TextInput>(null)

  // Animação de flutuar (sobe/desce) da logo — loop suave e infinito.
  const logoFloat = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -12,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [logoFloat])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (value: string): string | undefined =>
    EMAIL_REGEX.test(value.trim()) ? undefined : t`Digite um e-mail válido`

  // Limpa o erro inline assim que o usuário corrige o campo (não esperar novo blur/submit).
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (emailError) setEmailError(undefined)
    if (formError) setFormError(undefined)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (passwordError) setPasswordError(undefined)
    if (formError) setFormError(undefined)
  }

  const handleEmailBlur = () => {
    if (email.trim().length > 0) setEmailError(validateEmail(email))
  }

  const handleLogin = async () => {
    const nextEmailError = validateEmail(email)
    const nextPasswordError = password.length === 0 ? t`Digite sua senha` : undefined
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)
    if (nextEmailError || nextPasswordError) return

    setFormError(undefined)
    setIsSubmitting(true)
    try {
      await onSubmit({ email: email.trim(), password })
      // Sucesso: o AuthProvider seta isAuthenticated e o RootNavigator troca para o app.
    } catch {
      setFormError(t`Não foi possível entrar. Tente novamente.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGooglePress = () => {
    toast.info(t`Login com Google em breve`)
  }

  const handleRegisterPress = () => {
    // Cadastro começa pela escolha de papel (RoleSelect → Cadastro do papel).
    navigation.navigate('RoleSelect')
  }

  const submitDisabled = !email.trim() || !password || isSubmitting

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bottomOffset={theme.spacing.xl}
      >
        {/* Header com gradiente da marca + logo glassmorphism */}
        <LinearGradient
          colors={[theme.gradients.header.start, theme.gradients.header.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + theme.spacing['3xl'] }]}
        >
          {/* Logo + tagline flutuam juntos (mesmo translateY animado). */}
          <Animated.View style={[styles.logoGroup, { transform: [{ translateY: logoFloat }] }]}>
            <View
              style={[
                styles.logoPlate,
                {
                  backgroundColor: theme.colors.grey[0],
                  borderRadius: theme.borderRadius.logo,
                  shadowColor: theme.colors.brandBlue[10],
                },
              ]}
            >
              <Image
                // eslint-disable-next-line @typescript-eslint/no-require-imports -- asset estático (padrão RN/Metro)
                source={require('../../../assets/petagil-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityRole="image"
                accessibilityLabel={t`PetÁgil`}
              />
            </View>
            <Text
              style={[
                theme.textStyles.lg400,
                { color: theme.colors.grey[0] + 'E6' },
                styles.tagline,
              ]}
            >
              <Trans>Cuidar do seu pet ficou simples</Trans>
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Sheet branca sobreposta ao header */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.grey[0],
              borderTopLeftRadius: theme.borderRadius.sheet,
              borderTopRightRadius: theme.borderRadius.sheet,
              marginTop: -theme.spacing.xl, // sobreposição da sheet sobre o header
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: insets.bottom + theme.spacing.xl,
            },
          ]}
        >
          {/* Elementos distribuídos uniformemente (space-between) para preencher a
              sheet sem vão branco — visual do Figma (node 411-20). */}
          <LoginField
            testID="login-email"
            icon={<IconEnvelope size={20} color={theme.colors.grey[500]} />}
            value={email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            error={emailError}
            placeholder={t`seu@email.com`}
            accessibilityLabel={t`E-mail`}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />

          <LoginField
            ref={passwordRef}
            testID="login-password"
            icon={<IconLock size={20} color={theme.colors.grey[500]} />}
            value={password}
            onChangeText={handlePasswordChange}
            error={passwordError}
            placeholder={t`Sua senha`}
            accessibilityLabel={t`Senha`}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={() => void handleLogin()}
            trailing={
              <TouchableOpacity
                testID="login-password-toggle"
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
              </TouchableOpacity>
            }
          />

          {/* Erro de form fica colado ao CTA (não conta como "slot" do space-between). */}
          <View style={styles.submitGroup}>
            {formError && (
              <Text
                style={[theme.textStyles.sm400, styles.formError, { color: theme.colors.error[6] }]}
                accessibilityLiveRegion="polite"
              >
                {formError}
              </Text>
            )}

            <GradientButton
              testID="login-submit"
              title={t`Entrar`}
              onPress={() => void handleLogin()}
              loading={isSubmitting}
              disabled={submitDisabled}
              style={styles.submitButton}
            />
          </View>

          <TouchableOpacity
            testID="login-google"
            onPress={handleGooglePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t`Continuar com Google`}
            style={[
              styles.googleButton,
              {
                borderRadius: theme.borderRadius.button,
                borderColor: theme.colors.brandBlue[1],
                backgroundColor: theme.colors.grey[0],
              },
            ]}
          >
            <IconGoogle size={20} />
            <Text style={[theme.textStyles.base500, { color: theme.colors.brandBlue[6] }]}>
              <Trans>Continuar com Google</Trans>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="login-register-link"
            onPress={handleRegisterPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t`Cadastre-se`}
            style={styles.registerRow}
          >
            <Text style={[theme.textStyles.lg400, { color: theme.colors.grey[600] }]}>
              <Trans>
                Não tem conta?{' '}
                <Text style={[theme.textStyles.lg600, { color: theme.colors.brandBlue[6] }]}>
                  Cadastre-se
                </Text>
              </Trans>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

// ---------------------------------------------------------------------------
// LoginField — campo composto (ícone à esquerda + TextInput + erro opcional).
// Co-locado: o Input compartilhado (44px/raio8/sem ícone/semantic-dependent) não
// atende o visual brand-themed do login, então compomos um campo local fixo.
// ---------------------------------------------------------------------------

interface LoginFieldProps extends Omit<TextInputProps, 'style'> {
  icon: React.ReactNode
  error?: string
  /** Slot opcional à direita do input (ex.: botão de mostrar/ocultar senha). */
  trailing?: React.ReactNode
}

const LoginField = forwardRef<TextInput, LoginFieldProps>(function LoginField(
  { icon, error, trailing, accessibilityLabel, ...inputProps },
  ref
) {
  const theme = useTheme()

  return (
    <View style={styles.fieldContainer}>
      <View
        style={[
          styles.fieldRow,
          {
            backgroundColor: theme.colors.grey[100],
            borderRadius: theme.borderRadius.input,
            borderColor: error ? theme.colors.error[6] : theme.colors.grey[300],
            paddingHorizontal: theme.spacing.md,
          },
        ]}
      >
        {icon}
        <TextInput
          ref={ref}
          style={[
            styles.fieldInput,
            theme.textStyles.base400,
            { color: theme.colors.brandBlue[7] },
          ]}
          placeholderTextColor={theme.colors.grey[500]}
          accessibilityLabel={accessibilityLabel}
          {...inputProps}
        />
        {trailing}
      </View>
      {error && (
        <Text
          style={[theme.textStyles.sm400, styles.fieldError, { color: theme.colors.error[6] }]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 88,
  },
  logoGroup: {
    alignItems: 'center',
  },
  logoPlate: {
    padding: 34,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra suave para destacar a placa sobre o gradiente azul do header
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logo: {
    width: 150,
    height: 145,
  },
  tagline: {
    marginTop: 8,
  },
  sheet: {
    flex: 1,
    paddingTop: 32,
    // Fluxo natural com gaps parelhos; componentes maiores preenchem a sheet
    // sem precisar esticar os vazios (evita o visual "botões muito separados").
    gap: 20,
  },
  submitGroup: {
    gap: 8,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderWidth: 1,
    gap: 10,
  },
  fieldInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  fieldError: {
    marginTop: 4,
  },
  formError: {
    textAlign: 'center',
  },
  submitButton: {
    height: 58,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderWidth: 1,
    gap: 10,
  },
  registerRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
})
