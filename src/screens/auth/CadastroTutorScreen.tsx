/**
 * CadastroTutorScreen — cadastro de conta do papel `tutor`.
 *
 * Casca: renderiza o `AccountFormScreen` (campos comuns) e, no submit, cria a
 * conta com `role: 'tutor'` e finaliza o onboarding (entra direto no app — tutor
 * não tem etapa de perfil específica neste corte).
 */
import { useState } from 'react'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useToast } from '@/components/ui'
import { useAuth } from '@/app/providers'
import { AccountFormScreen } from './AccountFormScreen'

export function CadastroTutorScreen() {
  const { register, completeOnboarding } = useAuth()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  useLingui()

  return (
    <AccountFormScreen
      title={t`Crie sua conta`}
      subtitle={t`Leva menos de 1 minuto 🐾`}
      submitting={submitting}
      onSubmit={async values => {
        setSubmitting(true)
        try {
          const user = await register({ ...values, role: 'tutor' })
          completeOnboarding(user)
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : t`Não foi possível criar sua conta.`
          )
          setSubmitting(false)
        }
      }}
    />
  )
}
