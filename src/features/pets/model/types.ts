/**
 * Tipos do domínio de pets (feature `pets`).
 * Espelham o contrato do backend (`/api/pets`) — ver
 * petagil-api/src/pets (create-pet.dto.ts / pets.controller.ts).
 */

/** Espécies expostas na API (minúsculo) — espelha `PET_SPECIES` do backend. */
export const PET_SPECIES = ['dog', 'cat', 'bird', 'reptile'] as const
export type ApiSpecies = (typeof PET_SPECIES)[number]

/** Corpo aceito por `POST /pets`. */
export interface CreatePetPayload {
  name: string
  species: ApiSpecies
  breed?: string
  ageYears?: number
  photoUrl?: string
}

/**
 * Pet retornado pelo backend. Datas vêm como string ISO (o httpClient faz
 * `response.json()`, sem reidratar `Date`).
 */
export interface Pet {
  id: string
  ownerId: string
  name: string
  species: ApiSpecies
  breed: string | null
  ageYears: number | null
  photoUrl: string | null
  createdAt: string
  updatedAt: string
}

/** Imagem escolhida no `expo-image-picker`, no formato usado pelo upload. */
export interface PickedImage {
  uri: string
  mimeType?: string
  fileName?: string
}

/**
 * Pasta lógica de upload das fotos de pet (espelha a whitelist do backend).
 * Mantida local à feature `pets` — NÃO importar de `features/vet` (desacoplamento).
 */
export type PetUploadFolder = 'pet-photos'
