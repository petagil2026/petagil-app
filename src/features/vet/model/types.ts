/**
 * Tipos do domínio de perfil do veterinário (feature `vet`).
 * Espelham o contrato do backend (`/api/profiles/vet`) — ver
 * petagil-api/src/profiles/vet.
 */

export type VetVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Corpo aceito por `POST /profiles/vet` (perfil de clínica). */
export interface CreateVetProfilePayload {
  photoUrl?: string
  /** CNPJ da clínica (14 dígitos, sem máscara). */
  cnpj: string
  /** CRMV do responsável técnico (número + UF). */
  crmvNumber: string
  crmvUf: string
  specialties: string[]
  bio?: string
  servesAtClinic?: boolean
  servesAtHome?: boolean
  clinicName?: string
  clinicAddress?: string
  crmvDocUrl?: string
}

/** Perfil de clínica (papel `vet`) retornado pelo backend. */
export interface VetProfile {
  id: string
  userId: string
  photoUrl: string | null
  cnpj: string | null
  crmvNumber: string
  crmvUf: string
  specialties: string[]
  bio: string | null
  servesAtClinic: boolean
  servesAtHome: boolean
  clinicName: string | null
  clinicAddress: string | null
  crmvDocUrl: string | null
  verification: VetVerificationStatus
  createdAt: string
  updatedAt: string
}

// ── Disponibilidade & folgas (clínica/vet) ──────────────────────────────────
// Espelham o contrato de `/api/profiles/vet/me/availability` e `/me/timeoff`.

/** Chave de período (espelha o enum Prisma `AvailabilityPeriod`). */
export type AvailabilityPeriodKey = 'MORNING' | 'AFTERNOON' | 'NIGHT'

/** Período habilitado da disponibilidade. `start`/`end` são "HH:MM" zero-padded. */
export interface AvailabilityPeriodDTO {
  period: AvailabilityPeriodKey
  start: string
  end: string
}

/** Disponibilidade recorrente. `weekdays`: 0=Segunda … 6=Domingo. */
export interface VetAvailability {
  weekdays: number[]
  slotDurationMin: number
  periods: AvailabilityPeriodDTO[]
}

/** Corpo aceito por `PUT /profiles/vet/me/availability` (substitui a regra inteira). */
export type UpsertVetAvailabilityPayload = VetAvailability

/** Folga/bloqueio retornada pelo backend. */
export interface VetTimeOff {
  id: string
  startsAt: string
  endsAt: string
  allDay: boolean
  reason: string | null
}

/** Corpo aceito por `POST /profiles/vet/me/timeoff`. */
export interface CreateVetTimeOffPayload {
  startsAt: string
  endsAt: string
  allDay?: boolean
  reason?: string
}

/** Slots livres de uma data (`GET /me/availability/slots`). */
export interface DaySlots {
  date: string
  slots: { start: string; end: string }[]
}

/** Resposta do endpoint de slots (envelopada em `ApiResponse<SlotsResponse>`). */
export interface SlotsResponse {
  days: DaySlots[]
}

/** Imagem escolhida no `expo-image-picker`, no formato usado pelo upload. */
export interface PickedImage {
  uri: string
  mimeType?: string
  fileName?: string
}

/** Pastas lógicas aceitas pelo endpoint de upload (espelha o backend). */
export type UploadFolder = 'vet-photos' | 'crmv-docs'
