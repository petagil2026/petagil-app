/**
 * VetCadastroScreen — cadastro do papel `vet` em FORM ÚNICO (decisão de fluxo
 * 2026-06-29): os dados de acesso (conta) e os dados da clínica/CRMV/foto ficam
 * no mesmo formulário.
 *
 * No submit (um só): cria a conta (`register` com `role: 'vet'` — gera os tokens)
 * e, em seguida, dispara o `useVetOnboarding` (uploads → `POST /profiles/vet`).
 * No sucesso, finaliza o onboarding (entra no app). O `register` precede o upload
 * porque o perfil exige chamadas autenticadas.
 */
import { useState } from 'react'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useToast } from '@/components/ui'
import { useAuth } from '@/app/providers'
import { useVetOnboarding, VetProfileForm } from '@/features/vet'
import { CommonAccountFields } from './CommonAccountFields'
import { useAccountForm } from './useAccountForm'

export function VetCadastroScreen() {
  const toast = useToast()
  const { register, completeOnboarding } = useAuth()
  const onboarding = useVetOnboarding()
  const [registering, setRegistering] = useState(false)
  useLingui()

  const accountForm = useAccountForm({
    name: t`Informe seu nome completo`,
    email: t`Digite um e-mail válido`,
    phone: t`Digite um celular válido com DDD`,
    city: t`Informe sua cidade`,
    password: t`A senha precisa de ao menos 8 caracteres`,
  })

  return (
    <VetProfileForm
      mode="create"
      submitting={registering || onboarding.isPending}
      accountSlot={<CommonAccountFields form={accountForm} />}
      extraValidate={accountForm.validate}
      onSubmit={async ({ values, photo, crmvDoc }) => {
        setRegistering(true)
        let user
        try {
          user = await register({ ...accountForm.getValues(), role: 'vet' })
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : t`Não foi possível criar sua conta.`
          )
          setRegistering(false)
          return
        }
        setRegistering(false)
        onboarding.mutate(
          { currentUser: user, photo, crmvDoc, profile: values },
          {
            onSuccess: ({ user: updatedUser }) => {
              toast.success(t`Clínica enviada! Avisaremos quando o CRMV for aprovado.`)
              completeOnboarding(updatedUser)
            },
            onError: error => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : t`Não foi possível enviar o perfil da clínica.`
              )
            },
          }
        )
      }}
    />
  )
}
