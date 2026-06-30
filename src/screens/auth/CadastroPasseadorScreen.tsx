/**
 * CadastroPasseadorScreen — cadastro de conta do papel `passeador`.
 *
 * Casca: renderiza o `AccountFormScreen` (campos comuns) e, no submit, cria a
 * conta com `role: 'passeador'` e finaliza o onboarding (entra direto no app —
 * sem campos específicos de passeador neste corte).
 */
import { useState } from 'react'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useToast } from '@/components/ui'
import { useAuth } from '@/app/providers'
import { AccountFormScreen } from './AccountFormScreen'

export function CadastroPasseadorScreen() {
  const { register, completeOnboarding } = useAuth()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  useLingui()

  return (
    <AccountFormScreen
      title={t`Crie sua conta`}
      subtitle={t`Comece a oferecer passeios 🦮`}
      submitting={submitting}
      onSubmit={async values => {
        setSubmitting(true)
        try {
          const user = await register({ ...values, role: 'passeador' })
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
