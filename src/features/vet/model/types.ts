/**
 * Tipos do domínio de perfil do veterinário (feature `vet`).
 * Espelham o contrato do backend (`/api/profiles/vet`) — ver
 * petagil-api/src/profiles/vet.
 */

export type VetVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Corpo aceito por `POST /profiles/vet`. */
export interface CreateVetProfilePayload {
  photoUrl?: string
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

/** Perfil do veterinário retornado pelo backend. */
export interface VetProfile {
  id: string
  userId: string
  photoUrl: string | null
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

/** Imagem escolhida no `expo-image-picker`, no formato usado pelo upload. */
export interface PickedImage {
  uri: string
  mimeType?: string
  fileName?: string
}

/** Pastas lógicas aceitas pelo endpoint de upload (espelha o backend). */
export type UploadFolder = 'vet-photos' | 'crmv-docs'
