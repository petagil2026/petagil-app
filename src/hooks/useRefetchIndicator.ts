/**
 * useRefetchIndicator — retorna se deve exibir o indicador de refetch
 * Exibe apenas quando está buscando mas não no loading inicial
 */
export function useRefetchIndicator(isFetching: boolean, isLoading: boolean): boolean {
  return isFetching && !isLoading;
}
