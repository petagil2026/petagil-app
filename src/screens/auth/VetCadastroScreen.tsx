/**
 * VetCadastroScreen — "Seu perfil profissional" (etapa final do cadastro do vet).
 *
 * Casca de CRIAÇÃO: renderiza o `VetProfileForm` (mode=create) e, no submit,
 * dispara o `useVetOnboarding` (uploads → `POST /profiles/vet`). No sucesso,
 * finaliza o onboarding (entra no app).
 *
 * Pré-requisito: a conta já foi criada na etapa de seleção de papel (tokens em
 * SecureStore), então as chamadas vão autenticadas.
 */
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useToast } from '@/components/ui'
import { useAuth } from '@/app/providers'
import { useVetOnboarding, VetProfileForm } from '@/features/vet'

export function VetCadastroScreen() {
  const toast = useToast()
  const { user, completeOnboarding } = useAuth()
  const onboarding = useVetOnboarding()
  useLingui()

  return (
    <VetProfileForm
      mode="create"
      submitting={onboarding.isPending}
      onSubmit={({ values, photo, crmvDoc }) => {
        if (!user) {
          toast.error(t`Sessão expirada. Faça login novamente.`)
          return
        }
        onboarding.mutate(
          { currentUser: user, photo, crmvDoc, profile: values },
          {
            onSuccess: ({ user: updatedUser }) => {
              toast.success(t`Perfil enviado! Avisaremos quando o CRMV for aprovado.`)
              completeOnboarding(updatedUser)
            },
            onError: error => {
              toast.error(
                error instanceof Error ? error.message : t`Não foi possível enviar seu perfil.`
              )
            },
          }
        )
      }}
    />
  )
}
