/**
 * DateInput — campo de data DD/MM/AAAA construído sobre o `Input` existente.
 * Máscara manual (sem lib nativa), teclado numérico. O valor é a string mascarada;
 * o parse/validação fica a cargo do consumidor (`parseBrDateToISO`).
 */
import { forwardRef } from 'react'
import type { TextInput } from 'react-native'

import { maskBrDate } from '@/utils'
import { Input } from './Input'

interface DateInputProps {
  label?: string
  error?: string
  value: string
  onChangeText: (masked: string) => void
  placeholder?: string
  testID?: string
}

export const DateInput = forwardRef<TextInput, DateInputProps>(
  ({ label, error, value, onChangeText, placeholder = 'DD/MM/AAAA', testID }, ref) => {
    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        value={value}
        onChangeText={raw => onChangeText(maskBrDate(raw))}
        placeholder={placeholder}
        keyboardType="number-pad"
        maxLength={10}
        testID={testID}
      />
    )
  }
)

DateInput.displayName = 'DateInput'
