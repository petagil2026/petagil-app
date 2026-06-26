/**
 * SelectSheet — select em BottomSheet (single ou multi). Lista opções roláveis
 * com check no selecionado. Single: escolhe e fecha. Multi: alterna e confirma.
 * Reutilizado pelo formulário do vet (UF e especialidades).
 */
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useTheme } from '@/theme'
import { BottomSheet, GradientButton } from '@/components/ui'
import { IconCheck } from '@/assets/icons'

export interface SelectOption {
  value: string
  label: string
}

interface SelectSheetProps {
  visible: boolean
  onClose: () => void
  title: string
  options: SelectOption[]
  selected: string[]
  multi?: boolean
  onChange: (selected: string[]) => void
}

export function SelectSheet({
  visible,
  onClose,
  title,
  options,
  selected,
  multi = false,
  onChange,
}: SelectSheetProps) {
  const theme = useTheme()
  useLingui()

  const isSel = (v: string) => selected.includes(v)

  const pick = (v: string) => {
    if (multi) {
      onChange(isSel(v) ? selected.filter(x => x !== v) : [...selected, v])
    } else {
      onChange([v])
      onClose()
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} dynamicSizing>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
        <Text
          style={[
            theme.textStyles.lg600,
            { color: theme.semantic.text.primary, marginBottom: theme.spacing.sm },
          ]}
        >
          {title}
        </Text>
        <ScrollView
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {options.map(o => {
            const sel = isSel(o.value)
            return (
              <Pressable
                key={o.value}
                onPress={() => pick(o.value)}
                accessibilityRole={multi ? 'checkbox' : 'radio'}
                accessibilityState={multi ? { checked: sel } : { selected: sel }}
                accessibilityLabel={o.label}
                style={[
                  styles.row,
                  { borderColor: theme.semantic.border.secondary },
                  sel && {
                    backgroundColor: theme.colors.brandBlue[1] + '55',
                    borderColor: theme.colors.brandBlue[4],
                  },
                ]}
              >
                <Text
                  style={[
                    theme.textStyles.base500,
                    styles.rowLabel,
                    { color: theme.semantic.text.primary },
                  ]}
                >
                  {o.label}
                </Text>
                {sel ? <IconCheck size={18} color={theme.colors.brandBlue[6]} /> : null}
              </Pressable>
            )
          })}
        </ScrollView>
        {multi ? (
          <GradientButton title={t`Confirmar`} onPress={onClose} style={styles.confirm} />
        ) : null}
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  list: { maxHeight: 360 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowLabel: { flex: 1 },
  confirm: { height: 50, marginTop: 8 },
})
