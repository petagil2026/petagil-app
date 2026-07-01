/**
 * Brand Typography Tokens — telas "brand-themed" (identidade da marca: Baloo 2 + Nunito).
 *
 * Fonte ÚNICA de verdade dos tamanhos de fonte dessas telas (Login, RoleSelect e
 * todo o app do veterinário). Em vez de cravar `fontFamily`/`fontSize` em cada
 * `StyleSheet`, espalhar o token: `{ ...brandText.heading, color: ... }`.
 *
 * Escala "device-real": derivada do Claude Design / Figma (mesmo design), porém
 * ajustada (~+20%) para telas reais (~360–412dp) — os px crus do mock (frame de
 * ~316px) ficam pequenos demais. NÃO reintroduzir px de fonte solto nas telas:
 * se faltar um tamanho, adicionar um token aqui.
 *
 * São tokens MODE-INDEPENDENT (família/tamanho fixos, não invertem no dark) — por
 * isso export estático: podem ser usados direto em `StyleSheet.create` (escopo de
 * módulo), além de estarem disponíveis via `useTheme().brandText`.
 */

// Famílias da marca (carregadas no App via @expo-google-fonts/baloo-2 e /nunito).
export const brandFonts = {
  baloo800: 'Baloo2_800ExtraBold',
  baloo700: 'Baloo2_700Bold',
  nun800: 'Nunito_800ExtraBold',
  nun700: 'Nunito_700Bold',
  nun600: 'Nunito_600SemiBold',
} as const

const { baloo800, baloo700, nun800, nun700, nun600 } = brandFonts

/**
 * Estilos de texto da marca (família + tamanho). Sem `lineHeight` de propósito —
 * as telas controlam o ritmo vertical via paddings/margins; manter o token só
 * com família+tamanho evita deslocar layouts já afinados.
 */
export const brandText = {
  // Baloo 2 ExtraBold — títulos / números
  pageTitle: { fontFamily: baloo800, fontSize: 28 }, // hero da página (ex.: "Sua agenda · hoje")
  title: { fontFamily: baloo800, fontSize: 27 }, // nome no header / título de tela
  statValue: { fontFamily: baloo800, fontSize: 26 }, // números grandes (stats)
  heading: { fontFamily: baloo800, fontSize: 19 }, // título de seção / card / nome do pet

  // Baloo 2 Bold — ações
  actionLabel: { fontFamily: baloo700, fontSize: 18 }, // labels de botão/atalho da marca

  // Nunito — corpo / labels / rótulos
  rowLabel: { fontFamily: nun700, fontSize: 18 }, // item de menu / período
  dayText: { fontFamily: nun800, fontSize: 18 }, // letras dos dias da semana
  label: { fontFamily: nun700, fontSize: 17 }, // chips / accept / destaques de linha
  subtitle: { fontFamily: nun600, fontSize: 17 }, // saudação / subtítulo de header
  body: { fontFamily: nun700, fontSize: 16 }, // valores (ex.: horário)
  secondary: { fontFamily: nun600, fontSize: 16 }, // texto secundário (tutor, endereço, info)
  pill: { fontFamily: nun700, fontSize: 15 }, // pills compactas do header
  statLabel: { fontFamily: nun700, fontSize: 14 }, // rótulo de stat
  badgeStrong: { fontFamily: nun800, fontSize: 14 }, // CRMV / reputação
  badge: { fontFamily: nun800, fontSize: 13 }, // badges / pills fortes pequenos
  tabLabel: { fontFamily: nun700, fontSize: 13 }, // rótulo da tab bar
} as const

export type BrandText = typeof brandText
