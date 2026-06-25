/**
 * Inner AI Design System v2.0 - Typography
 */

// Mapeamento interno das fontes por peso
const rubikFonts = {
  '300': 'Rubik_300Light',
  '400': 'Rubik_400Regular',
  '500': 'Rubik_500Medium',
  '600': 'Rubik_600SemiBold',
  '700': 'Rubik_700Bold',
} as const;

const montserratFonts = {
  '400': 'Montserrat_400Regular',
  '600': 'Montserrat_600SemiBold',
} as const;

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
};

// Helper para obter a fonte correta baseado no peso
type FontWeight = '300' | '400' | '500' | '600' | '700';

export const fontFamily = {
  sans: (weight: FontWeight = '400') => rubikFonts[weight] || rubikFonts['400'],
  heading: (weight: '400' | '600' = '400') => montserratFonts[weight] || montserratFonts['400'],
} as const;

export const fontSize = {
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  h5: 16,
  h4: 20,
  h3: 24,
  h2: 30,
  h1: 36,
} as const;

export const lineHeight = {
  sm: 20,
  base: 22,
  lg: 24,
  xl: 26,
  h5: 24,
  h4: 28,
  h3: 32,
  h2: 38,
  h1: 44,
} as const;

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
} as const;
