/**
 * Inner AI Design System v2.0 - Typography
 */

// Mapeamento interno das fontes por peso.
// Fonte da marca (Claude Design): Nunito (corpo/sans) + Baloo 2 (headings).
// `sans`/`heading` mantêm a mesma API de pesos; só a família mudou — Rubik/Montserrat
// eram um desvio do port pro Figma. As telas brand-themed do vet usam `brandText`,
// que casa com estas mesmas famílias.
const nunitoFonts = {
  '300': 'Nunito_300Light',
  '400': 'Nunito_400Regular',
  '500': 'Nunito_500Medium',
  '600': 'Nunito_600SemiBold',
  '700': 'Nunito_700Bold',
} as const

// Baloo 2 só tem pesos 400–800; os textStyles de heading usam 400 e 600.
const baloo2Fonts = {
  '400': 'Baloo2_400Regular',
  '600': 'Baloo2_600SemiBold',
} as const

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
}

// Helper para obter a fonte correta baseado no peso
type FontWeight = '300' | '400' | '500' | '600' | '700'

export const fontFamily = {
  sans: (weight: FontWeight = '400') => nunitoFonts[weight] || nunitoFonts['400'],
  heading: (weight: '400' | '600' = '400') => baloo2Fonts[weight] || baloo2Fonts['400'],
} as const

// Escala "device-real" (~+20% vs. a escala original do mock/DS de 316px) — aplicada
// a TODO o app via os tokens. Casa com a escala maior das telas brand-themed (brandText).
export const fontSize = {
  sm: 14,
  base: 16,
  lg: 19,
  xl: 21,
  h5: 19,
  h4: 24,
  h3: 28,
  h2: 36,
  h1: 43,
} as const

export const lineHeight = {
  sm: 24,
  base: 26,
  lg: 28,
  xl: 31,
  h5: 28,
  h4: 33,
  h3: 38,
  h2: 45,
  h1: 52,
} as const

// Pre-defined text styles
export const textStyles = {
  // SM variants - Labels, legendas, campos de formulário
  sm300: {
    fontFamily: fontFamily.sans('300'),
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  sm400: {
    fontFamily: fontFamily.sans('400'),
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  sm500: {
    fontFamily: fontFamily.sans('500'),
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  sm600: {
    fontFamily: fontFamily.sans('600'),
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },

  // Base variants - Textos corridos, descrições, parágrafos
  base300: {
    fontFamily: fontFamily.sans('300'),
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  base400: {
    fontFamily: fontFamily.sans('400'),
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  base500: {
    fontFamily: fontFamily.sans('500'),
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  base600: {
    fontFamily: fontFamily.sans('600'),
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },

  // LG variants - Textos de destaque secundário, botões
  lg300: {
    fontFamily: fontFamily.sans('300'),
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
  lg400: {
    fontFamily: fontFamily.sans('400'),
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
  lg500: {
    fontFamily: fontFamily.sans('500'),
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
  lg600: {
    fontFamily: fontFamily.sans('600'),
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },

  // XL variants - Títulos de seções ou destaques intermediários
  xl300: {
    fontFamily: fontFamily.sans('300'),
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  xl400: {
    fontFamily: fontFamily.sans('400'),
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  xl500: {
    fontFamily: fontFamily.sans('500'),
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  xl600: {
    fontFamily: fontFamily.sans('600'),
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },

  // H5 variants - Título interno / menus ou pequenos blocos
  h5400: {
    fontFamily: fontFamily.heading('400'),
    fontSize: fontSize.h5,
    lineHeight: lineHeight.h5,
  },
  h5600: {
    fontFamily: fontFamily.heading('600'),
    fontSize: fontSize.h5,
    lineHeight: lineHeight.h5,
  },

  // H4 variants - Subtítulo menor / cards ou módulos
  h4400: {
    fontFamily: fontFamily.heading('400'),
    fontSize: fontSize.h4,
    lineHeight: lineHeight.h4,
  },
  h4600: {
    fontFamily: fontFamily.heading('600'),
    fontSize: fontSize.h4,
    lineHeight: lineHeight.h4,
  },

  // H3 variants - Subtítulo ou bloco dentro de seções
  h3400: {
    fontFamily: fontFamily.heading('400'),
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
  },
  h3600: {
    fontFamily: fontFamily.heading('600'),
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
  },

  // H2 variants - Título de seção importante
  h2400: {
    fontFamily: fontFamily.heading('400'),
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
  },
  h2600: {
    fontFamily: fontFamily.heading('600'),
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
  },

  // H1 variants - Título principal de página
  h1400: {
    fontFamily: fontFamily.heading('400'),
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
  },
  h1600: {
    fontFamily: fontFamily.heading('600'),
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
  },
} as const
