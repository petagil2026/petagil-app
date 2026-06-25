/**
 * CadastroScreen — placeholder do cadastro por papel.
 * Recebe o `role` escolhido na RoleSelect via params. O formulário real será
 * implementado em spec futura; por ora exibe o papel selecionado.
 */
import { PlaceholderScreen } from '../PlaceholderScreen';
import { roleLabel } from '../role-select/roleOptions';
import type { AuthStackScreenProps } from '@/navigation/types';

export function CadastroScreen({ route }: AuthStackScreenProps<'Cadastro'>) {
  const { role } = route.params;
  return <PlaceholderScreen title="Cadastro" subtitle={`${roleLabel(role)} — em construção`} />;
}
