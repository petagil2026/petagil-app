/**
 * Constantes da feature `pets`.
 *
 * `SPECIES_OPTIONS` define a ordem e o emoji de cada espécie nas pílulas da tela.
 * O RÓTULO traduzível NÃO mora aqui (evita duas fontes de verdade): a tela usa
 * `speciesLabel()` com literais estáticos do macro Lingui (extraíveis/localizáveis).
 */
import type { ApiSpecies } from './types'

export interface SpeciesOption {
  value: ApiSpecies
  emoji: string
}

export const SPECIES_OPTIONS: SpeciesOption[] = [
  { value: 'dog', emoji: '🐶' },
  { value: 'cat', emoji: '🐱' },
  { value: 'bird', emoji: '🦜' },
  { value: 'reptile', emoji: '🦎' },
]
