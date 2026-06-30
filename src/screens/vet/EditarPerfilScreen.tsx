/**
 * EditarPerfilScreen (vet) — edição do perfil profissional.
 *
 * Casca de EDIÇÃO: carrega o perfil atual (`GET /profiles/vet/me`), pré-preenche
 * o `VetProfileForm` (mode=edit) e, no submit, dispara o `useUpdateVetProfile`
 * (uploads das mídias trocadas → `PATCH /profiles/vet/me` → invalida o cache).
 * No sucesso, volta para a tela de Perfil (que recarrega com os dados novos).
 */
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import { useToast } from '@/components/ui'
import { useMyVetProfile, useUpdateVetProfile, VetProfileForm } from '@/features/vet'

export function EditarPerfilScreen() {
  const theme = useTheme()
  const navigation = useNavigation()
  const toast = useToast()
  const { data: profile, isLoading, isError } = useMyVetProfile()
  const update = useUpdateVetProfile()
  useLingui()

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.semantic.bg.layout }]}>
        <ActivityIndicator color={theme.colors.brandBlue[6]} />
      </View>
    )
  }

  if (isError || !profile) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.semantic.bg.layout, paddingHorizontal: 24 },
        ]}
      >
        <Text
          style={[
            theme.textStyles.base400,
            { color: theme.semantic.text.tertiary, textAlign: 'center' },
          ]}
        >
          {t`Não foi possível carregar seu perfil. Tente novamente.`}
        </Text>
      </View>
    )
  }

  return (
    <VetProfileForm
      mode="edit"
      submitting={update.isPending}
      onBack={() => navigation.goBack()}
      initialPhotoUrl={profile.photoUrl}
      initialHasCrmvDoc={!!profile.crmvDocUrl}
      initial={{
        cnpj: profile.cnpj ?? undefined,
        crmvNumber: profile.crmvNumber,
        crmvUf: profile.crmvUf,
        specialties: profile.specialties,
        bio: profile.bio ?? undefined,
        servesAtClinic: profile.servesAtClinic,
        servesAtHome: profile.servesAtHome,
        clinicName: profile.clinicName ?? undefined,
        clinicAddress: profile.clinicAddress ?? undefined,
      }}
      onSubmit={({ values, photo, crmvDoc }) => {
        update.mutate(
          { values, photo, crmvDoc },
          {
            onSuccess: () => {
              toast.success(t`Perfil atualizado!`)
              navigation.goBack()
            },
            onError: error => {
              toast.error(
                error instanceof Error ? error.message : t`Não foi possível salvar as alterações.`
              )
            },
          }
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
