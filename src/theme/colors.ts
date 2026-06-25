/**
 * PetÁgil Design System - Colors
 * Paleta re-tematizada: azul bebê / amarelo bebê / branco (base), sobre fundo azul claro.
 * Mantém a forma dos tokens (escalas 1–10 + tokens semânticos light/dark) do design system herdado.
 */

export const colors = {
  // Brand Blue — azul bebê (superfícies) → azul profundo (texto/CTA/ícones)
  brandBlue: {
    1: '#BFE0F5',
    2: '#A7D3F0',
    3: '#8AC2E8',
    4: '#69ABDC',
    5: '#4A92CD',
    6: '#2E7CB8',
    7: '#1E5F92',
    8: '#184E78',
    9: '#123A5A',
    10: '#0C2940',
  },

  // Brand Orange — mantido como acento secundário herdado (não faz parte da identidade base)
  brandOrange: {
    1: '#fff5eb',
    2: '#ffe3cc',
    3: '#fc983f',
    4: '#f78a2d',
    5: '#e57a20',
    6: '#fe8728',
    7: '#d96e1b',
    8: '#803a0e',
    9: '#662f0b',
    10: '#4d2208',
  },

  // Brand Yellow — amarelo bebê (acento) → âmbar profundo (faixas altas, p/ contraste)
  brandYellow: {
    1: '#FFF3B0',
    2: '#FCEFA1',
    3: '#F8E785',
    4: '#F2DC5E',
    5: '#E8CC3A',
    6: '#D4B42A',
    7: '#B8961E',
    8: '#8A6F14',
    9: '#5F4C0D',
    10: '#453608',
  },

  // System Success (Green)
  success: {
    1: '#f6ffed',
    2: '#d9f7be',
    3: '#b7eb8f',
    4: '#98e167',
    5: '#95de64',
    6: '#52c41a',
    7: '#389e0d',
    8: '#237804',
    9: '#135200',
    10: '#092b00',
  },

  // System Warning (Gold)
  warning: {
    1: '#fffbe6',
    2: '#fff1b8',
    3: '#ffe58f',
    4: '#ffd666',
    5: '#ffd666',
    6: '#faad14',
    7: '#d48806',
    8: '#ad6800',
    9: '#874d00',
    10: '#613400',
  },

  // System Error (Red)
  error: {
    1: '#fff2f0',
    2: '#fff1f0',
    3: '#ffccc7',
    4: '#ffa39e',
    5: '#ff7875',
    6: '#ff4d4f',
    7: '#d9363e',
    8: '#cb2029',
    9: '#c40a13',
    10: '#b3040d',
  },

  // System Info (Blue)
  info: {
    1: '#e6f4ff',
    2: '#bae0ff',
    3: '#91caff',
    4: '#69b1ff',
    5: '#3294ff',
    6: '#1677ff',
    7: '#0958d9',
    8: '#003eb3',
    9: '#002c8c',
    10: '#001d66',
  },

  // System Purple
  purple: {
    1: '#f3e6fc',
    2: '#e4c4f8',
    3: '#c489ec',
    4: '#a34ede',
    5: '#8f20d1',
    6: '#7a00bd',
    7: '#6700a4',
    8: '#4e0078',
    9: '#390056',
    10: '#2b0040',
  },

  // System Violet
  violet: {
    1: '#f2e8fd',
    2: '#dec5fa',
    3: '#c397f5',
    4: '#a162ef',
    5: '#953aec',
    6: '#8b41ee',
    7: '#7827dc',
    8: '#5c1ea1',
    9: '#421671',
    10: '#2f0e4f',
  },

  // System Pink
  pink: {
    1: '#fce9fb',
    2: '#f6c6f3',
    3: '#eda0e7',
    4: '#e067d8',
    5: '#d94cd1',
    6: '#c444c8',
    7: '#a93bb0',
    8: '#7d2a7f',
    9: '#5a1f5c',
    10: '#3f1540',
  },

  // Neutral Greyscale
  grey: {
    0: '#ffffff',
    100: '#f8fafc',
    200: '#eef2f7',
    300: '#dde4ec',
    400: '#bcc7d5',
    500: '#9aa7ba',
    600: '#6f7f96',
    700: '#4c5a6e',
    800: '#2f394a',
    900: '#1a202c',
  },

  // Transparent
  transparent: 'transparent',
} as const;

// Light theme semantic colors — PetÁgil (fundo azul claro, superfícies brancas, texto/CTA azul profundo)
export const lightTheme = {
  // Text
  text: {
    primary: '#1E5F92',
    secondary: '#3F6A8C',
    tertiary: '#6E8AA0',
    quaternary: '#9DB2C4',
    placeholder: '#B8C9D8',
    disabled: '#C3CEDC',
    lightSolid: '#ffffff',
  },

  // Background
  bg: {
    base: 'rgba(0, 0, 0, 0.45)',
    container: '#FFFFFF',
    containerDisabled: '#EAF0F6',
    elevated: '#F7FBFE',
    layout: '#EAF4FB',
    spotlight: '#DCEAF5',
    textActive: '#DCECF8',
    textHover: '#C7E0F2',
  },

  // Border
  border: {
    default: '#C5D8E6',
    secondary: '#E0EBF3',
    disabled: '#C3CEDC',
    bg: '#D6E5F0',
    split: '#D6E5F0',
  },
} as const;

// Dark theme semantic colors — PetÁgil (navy-azul, contraste AA)
export const darkTheme = {
  // Text
  text: {
    primary: '#F2F9FF',
    secondary: '#C2D2E0',
    tertiary: '#93A7BA',
    quaternary: '#6E8294',
    placeholder: '#66758A',
    disabled: '#5C6473',
    lightSolid: '#ffffff',
  },

  // Background
  bg: {
    base: '#ebebeb',
    container: '#122334',
    containerDisabled: '#2A3B4D',
    elevated: '#1A2E42',
    layout: '#0C1826',
    spotlight: '#1F3548',
    textActive: '#25425E',
    textHover: '#2E5070',
  },

  // Border
  border: {
    default: '#2E4358',
    secondary: '#3C566E',
    disabled: '#2E4358',
    bg: '#25425E',
    split: '#4A6076',
  },
} as const;

export type ThemeColors = typeof lightTheme | typeof darkTheme;

// Gradients (azul/amarelo PetÁgil)
export const gradients = {
  cyan: { start: '#1E5F92', end: '#4A92CD' },
  pink: { start: '#2E7CB8', end: '#8AC2E8' },
  purple: { start: '#123A5A', end: '#2E7CB8' },
  // Tela de Login (brand-themed): header azul-claro→azul e botão "Entrar" azul→azul-profundo.
  // Reusa hex já existentes na paleta brandBlue (sem inventar cor nova).
  header: { start: colors.brandBlue[2], end: colors.brandBlue[6] }, // #A7D3F0 → #2E7CB8
  primaryButton: { start: colors.brandBlue[6], end: colors.brandBlue[7] }, // #2E7CB8 → #1E5F92
} as const;
