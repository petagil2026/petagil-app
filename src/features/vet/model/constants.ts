/**
 * Constantes de domínio do veterinário: UFs do Brasil e especialidades sugeridas.
 * Usadas nos selects (BottomSheet) do formulário de perfil.
 */

/**
 * Duração padrão da consulta (minutos) — fonte ÚNICA no app. Espelha o
 * `@default(30)` do schema Prisma e a forma vazia do `findMine` no backend.
 */
export const DEFAULT_SLOT_DURATION_MIN = 30

/**
 * Opções de horário (06:00–22:00, de 30 em 30 min), zero-padded "HH:MM".
 * Compartilhadas pelos selects de horário da disponibilidade e das folgas.
 */
export const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const out: { value: string; label: string }[] = []
  for (let m = 6 * 60; m <= 22 * 60; m += 30) {
    const v = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    out.push({ value: v, label: v })
  }
  return out
})()

export interface UfOption {
  value: string
  label: string
}

/** 27 unidades federativas (value = sigla; label = "SIGLA · Nome"). */
export const BRAZIL_UFS: UfOption[] = [
  { value: 'AC', label: 'AC · Acre' },
  { value: 'AL', label: 'AL · Alagoas' },
  { value: 'AP', label: 'AP · Amapá' },
  { value: 'AM', label: 'AM · Amazonas' },
  { value: 'BA', label: 'BA · Bahia' },
  { value: 'CE', label: 'CE · Ceará' },
  { value: 'DF', label: 'DF · Distrito Federal' },
  { value: 'ES', label: 'ES · Espírito Santo' },
  { value: 'GO', label: 'GO · Goiás' },
  { value: 'MA', label: 'MA · Maranhão' },
  { value: 'MT', label: 'MT · Mato Grosso' },
  { value: 'MS', label: 'MS · Mato Grosso do Sul' },
  { value: 'MG', label: 'MG · Minas Gerais' },
  { value: 'PA', label: 'PA · Pará' },
  { value: 'PB', label: 'PB · Paraíba' },
  { value: 'PR', label: 'PR · Paraná' },
  { value: 'PE', label: 'PE · Pernambuco' },
  { value: 'PI', label: 'PI · Piauí' },
  { value: 'RJ', label: 'RJ · Rio de Janeiro' },
  { value: 'RN', label: 'RN · Rio Grande do Norte' },
  { value: 'RS', label: 'RS · Rio Grande do Sul' },
  { value: 'RO', label: 'RO · Rondônia' },
  { value: 'RR', label: 'RR · Roraima' },
  { value: 'SC', label: 'SC · Santa Catarina' },
  { value: 'SP', label: 'SP · São Paulo' },
  { value: 'SE', label: 'SE · Sergipe' },
  { value: 'TO', label: 'TO · Tocantins' },
]

/** Especialidades veterinárias sugeridas (multi-seleção; aceita extras legados). */
export const VET_SPECIALTIES: string[] = [
  'Clínica geral',
  'Silvestres',
  'Exóticos',
  'Felinos',
  'Cirurgia',
  'Dermatologia',
  'Cardiologia',
  'Odontologia',
  'Oftalmologia',
  'Ortopedia',
  'Anestesiologia',
  'Oncologia',
  'Nutrição',
  'Comportamento',
  'Reprodução',
]
