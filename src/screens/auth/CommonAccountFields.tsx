/**
 * CommonAccountFields — bloco reutilizável dos 5 campos comuns de cadastro de
 * conta (nome / e-mail / celular / cidade / senha), no visual brand-themed do
 * onboarding (cards brancos elevados com ícone azul, igual ao mock 411:110).
 *
 * Consome um `AccountFormController` (de `useAccountForm`) — só renderiza/encadeia
 * o foco; estado e validação vivem no hook. Usado tanto pelo `AccountFormScreen`
 * (tutor/passeador) quanto pelo cadastro fundido do vet.
 *
 * Brand-themed / mode-independent: paleta fixa da marca (não `semantic.*`), mesma
 * exceção consciente da LoginScreen/RoleSelect. Tamanhos de fonte por tokens do DS.
 */
import React, { forwardRef, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable, type TextInputProps } from 'react-native'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import {
  IconUser,
  IconEnvelope,
  IconLock,
  IconPhone,
  IconPin,
  IconEye,
  IconEyeSlash,
} from '@/assets/icons'
import type { AccountFormController } from './useAccountForm'

// Paleta fiel ao mock (brand-themed, independente de tema claro/escuro).
export const ACCOUNT_FIELD_COLORS = {
  card: '#FFFFFF',
  cardBorder: '#E6F1FA',
  ink: '#13344E',
  placeholder: '#9AA7BA',
}

interface CommonAccountFieldsProps {
  form: AccountFormController
  /** Disparado pelo "done" do teclado no campo de senha (último campo). */
  onLastSubmit?: () => void
}

export function CommonAccountFields({ form, onLastSubmit }: CommonAccountFieldsProps) {
  const theme = useTheme()
  useLingui()

  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const cityRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)

  const iconColor = theme.colors.brandBlue[6]

  return (
    <View style={styles.fieldsGroup}>
      <AccountField
        testID="cadastro-name"
        icon={<IconUser size={18} color={iconColor} />}
        value={form.name}
        onChangeText={form.setName}
        error={form.errors.name}
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
        icon={<IconEnvelope size={18} color={iconColor} />}
        value={form.email}
        onChangeText={form.setEmail}
        error={form.errors.email}
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
        icon={<IconPhone size={18} color={iconColor} />}
        value={form.phone}
        onChangeText={form.setPhone}
        error={form.errors.phone}
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
        icon={<IconPin size={18} color={iconColor} />}
        value={form.city}
        onChangeText={form.setCity}
        error={form.errors.city}
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
        icon={<IconLock size={18} color={iconColor} />}
        value={form.password}
        onChangeText={form.setPassword}
        error={form.errors.password}
        placeholder={t`Senha`}
        accessibilityLabel={t`Senha`}
        secureTextEntry={!form.showPassword}
        autoCapitalize="none"
        autoComplete="password-new"
        textContentType="newPassword"
        returnKeyType={onLastSubmit ? 'done' : 'default'}
        onSubmitEditing={onLastSubmit}
        trailing={
          <Pressable
            testID="cadastro-password-toggle"
            onPress={form.toggleShowPassword}
            accessibilityRole="button"
            accessibilityLabel={form.showPassword ? t`Ocultar senha` : t`Mostrar senha`}
            hitSlop={8}
          >
            {form.showPassword ? (
              <IconEyeSlash size={20} color={theme.colors.grey[500]} />
            ) : (
              <IconEye size={20} color={theme.colors.grey[500]} />
            )}
          </Pressable>
        }
      />
    </View>
  )
}

interface AccountFieldProps extends Omit<TextInputProps, 'style'> {
  icon: React.ReactNode
  error?: string
  trailing?: React.ReactNode
}

export const AccountField = forwardRef<TextInput, AccountFieldProps>(function AccountField(
  { icon, error, trailing, accessibilityLabel, ...inputProps },
  ref
) {
  const theme = useTheme()
  return (
    <View style={styles.fieldContainer}>
      <View
        style={[
          styles.fieldCard,
          { borderColor: error ? theme.colors.error[6] : ACCOUNT_FIELD_COLORS.cardBorder },
        ]}
      >
        {icon}
        <TextInput
          ref={ref}
          style={[styles.fieldInput, { color: ACCOUNT_FIELD_COLORS.ink }]}
          placeholderTextColor={ACCOUNT_FIELD_COLORS.placeholder}
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
  // Os 5 campos ocupam o topo com ritmo uniforme (sem amontoar/centralizar).
  fieldsGroup: {
    gap: 16,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: ACCOUNT_FIELD_COLORS.card,
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
})
