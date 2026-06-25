/**
 * Metadata dos papéis exibidos na escolha de perfil (RoleSelect) e reaproveitada
 * pelo Cadastro. Fonte única de verdade para rótulo/descrição/ícone de cada papel.
 * Cores e gradientes batem 1:1 com o design do Figma (node 450:2).
 */
import type { Role } from '@/types/auth';

export interface RoleOption {
  id: Role;
  /** Rótulo do card ("Sou tutor(a)"). */
  title: string;
  /** Descrição em 1+ linhas (cada item é uma linha no mock). */
  description: string;
  /** Glyph ilustrativo (emoji) — idêntico ao mock. */
  emoji: string;
  /** Gradiente do tile do ícone quando o card NÃO está selecionado (135°). */
  tileGradient: [string, string];
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'tutor',
    title: 'Sou tutor(a)',
    description: 'Agendar consultas e passeios p/ meu pet',
    emoji: '🦴',
    tileGradient: ['#FFF3B0', '#F8E785'],
  },
  {
    id: 'vet',
    title: 'Sou veterinário(a)',
    description: 'Receber e gerenciar agendamentos',
    emoji: '🩺',
    tileGradient: ['#BFE0F5', '#8FC8EC'],
  },
  {
    id: 'passeador',
    title: 'Sou passeador(a)',
    description: 'Oferecer passeios nos meus horários livres',
    emoji: '🦮',
    tileGradient: ['#CDEFD9', '#8FD9A8'],
  },
];

/** Rótulo curto de um papel (ex.: para títulos de telas). */
export function roleLabel(role: Role): string {
  return ROLE_OPTIONS.find(o => o.id === role)?.title ?? role;
}
