/**
 * useAccountForm — estado + validação dos campos COMUNS de cadastro de conta
 * (nome / e-mail / celular / cidade / senha), compartilhado por todos os
 * formulários de cadastro por papel (tutor / vet / passeador).
 *
 * Extraído da antiga CreateAccountScreen: mesma validação (e-mail, ao menos 10
 * dígitos de telefone com DDD, senha ≥ 8) e a máscara BR leve do celular. O
 * componente de UI (`CommonAccountFields`) consome este controller.
 */
import { useState } from 'react'

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Conta dígitos do telefone — exige ao menos 10 (DDD + número). */
export const phoneDigits = (value: string): number => value.replace(/\D/g, '').length

/** Máscara BR leve `(99) 99999-9999` (apenas formatação visual). */
export function formatPhoneBR(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Valores normalizados prontos para `register` (telefone só com dígitos). */
export interface AccountValues {
  name: string
  email: string
  phone: string
  city: string
  password: string
}

export interface AccountFormController {
  name: string
  email: string
  phone: string
  city: string
  password: string
  errors: Record<string, string | undefined>
  showPassword: boolean
  setName: (v: string) => void
  setEmail: (v: string) => void
  /** Recebe o valor cru e aplica a máscara BR internamente. */
  setPhone: (v: string) => void
  setCity: (v: string) => void
  setPassword: (v: string) => void
  toggleShowPassword: () => void
  /** `true` enquanto qualquer campo estiver vazio (para desabilitar o CTA). */
  isEmpty: boolean
  /** Valida todos os campos, popula `errors` e retorna se está válido. */
  validate: () => boolean
  /** Valores normalizados (trim + telefone só-dígitos). */
  getValues: () => AccountValues
}

/**
 * Mensagens de erro: recebidas como parâmetro para que a tela possa passá-las
 * já traduzidas via `t` (o macro do Lingui só funciona dentro de componentes).
 */
export interface AccountFormMessages {
  name: string
  email: string
  phone: string
  city: string
  password: string
}

export function useAccountForm(messages: AccountFormMessages): AccountFormController {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhoneRaw] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [showPassword, setShowPassword] = useState(false)

  const clearError = (field: string) =>
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))

  const validate = (): boolean => {
    const next: Record<string, string | undefined> = {}
    if (name.trim().length < 2) next.name = messages.name
    if (!EMAIL_REGEX.test(email.trim())) next.email = messages.email
    if (phoneDigits(phone) < 10) next.phone = messages.phone
    if (city.trim().length < 2) next.city = messages.city
    if (password.length < 8) next.password = messages.password
    setErrors(next)
    return Object.values(next).every(v => !v)
  }

  return {
    name,
    email,
    phone,
    city,
    password,
    errors,
    showPassword,
    setName: v => {
      setName(v)
      clearError('name')
    },
    setEmail: v => {
      setEmail(v)
      clearError('email')
    },
    setPhone: v => {
      setPhoneRaw(formatPhoneBR(v))
      clearError('phone')
    },
    setCity: v => {
      setCity(v)
      clearError('city')
    },
    setPassword: v => {
      setPassword(v)
      clearError('password')
    },
    toggleShowPassword: () => setShowPassword(v => !v),
    isEmpty: !name.trim() || !email.trim() || !phone.trim() || !city.trim() || !password,
    validate,
    getValues: () => ({
      name: name.trim(),
      email: email.trim(),
      phone: phone.replace(/\D/g, ''),
      city: city.trim(),
      password,
    }),
  }
}
