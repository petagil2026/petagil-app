/**
 * Inner AI Design System v2.0 - Spacing
 * Extracted from hashtag-web design system
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
  // Raios específicos da tela de Login (mapeados do Figma; sem número mágico solto).
  input: 15, // campos de email/senha
  button: 17, // botão "Entrar"/"Continuar com Google"
  logo: 28, // logo glassmorphism do header
  sheet: 30, // canto superior da sheet branca
} as const;

// Layout dimensions
export const layout = {
  sidebarIconWidth: 76,
  sidebarChatWidth: 320,
  inputMaxWidth: 880,
  loginContainerWidth: 672,
  headerHeight: 56,
} as const;
