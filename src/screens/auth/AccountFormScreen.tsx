/**
 * AccountFormScreen — scaffold brand-themed do cadastro de conta de um papel
 * (tutor / passeador). Reúne o header em gradiente (com indicador de progresso),
 * o bloco reutilizável `CommonAccountFields`, o CTA gradiente e o rodapé de termos.
 *
 * Herdado da antiga CreateAccountScreen (node 411:110), agora genérico por papel:
 * a tela não chama a API — entrega os valores validados via `onSubmit`, e quem
 * monta (CadastroTutor/CadastroPasseador) decide o `register` + pós-sucesso.
 *
 * Brand-themed / mode-independent: paleta fixa da marca; fontes Baloo 2 (títulos/
 * CTA) e Nunito (corpo), carregadas no `useFonts` de App.tsx. Layout preenche a
 * tela: campos no topo, CTA + termos ancorados na base (`marginTop: 'auto'`).
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import { GradientButton } from '@/components/ui'
import { CommonAccountFields } from './CommonAccountFields'
import { useAccountForm, type AccountValues } from './useAccountForm'

// Tons do header (sobre o gradiente da marca): título sólido, subtítulo 90%,
// círculo decorativo ~13%. Concatenação alpha-hex em vez de rgba (project-context).
const C = {
  screenBg: '#EAF4FB',
  footer: '#9AA7BA',
  headerInk: '#FFFFFF',
  headerInkSoft: '#FFFFFFE6',
  headerCircle: '#FFFFFF21',
}

interface AccountFormScreenProps {
  title: string
  subtitle: string
  submitting?: boolean
  /** Recebe os valores normalizados (telefone só-dígitos) após validação. */
  onSubmit: (values: AccountValues) => void
  /** Passos do onboarding deste papel (papel escolhido → conta = 2 passos). */
  progress?: { total: number; active: number }
}

export function AccountFormScreen({
  title,
  subtitle,
  submitting = false,
  onSubmit,
  progress = { total: 2, active: 1 },
}: AccountFormScreenProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  useLingui()

  const form = useAccountForm({
    name: t`Informe seu nome completo`,
    email: t`Digite um e-mail válido`,
    phone: t`Digite um celular válido com DDD`,
    city: t`Informe sua cidade`,
    password: t`A senha precisa de ao menos 8 caracteres`,
  })

  const handleContinue = () => {
    if (submitting) return
    if (!form.validate()) return
    onSubmit(form.getValues())
  }

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
          <ProgressSteps total={progress.total} active={progress.active} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </LinearGradient>

        <View style={styles.body}>
          <CommonAccountFields form={form} onLastSubmit={handleContinue} />

          <View style={styles.footerGroup}>
            <GradientButton
              testID="cadastro-submit"
              title={t`Próximo →`}
              onPress={handleContinue}
              loading={submitting}
              disabled={form.isEmpty}
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

/** Indicador de progresso do onboarding (o passo ativo em branco sólido). */
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
  // CTA + termos ancorados na base (marginTop: 'auto' empurra para o rodapé,
  // absorvendo o espaço livre em vez de deixar um vão branco — preenche a tela).
  footerGroup: {
    marginTop: 'auto',
    paddingTop: 20,
    gap: 12,
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
