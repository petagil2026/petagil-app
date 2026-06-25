import { useRef, useEffect } from 'react';
import { Linking } from 'react-native';
import { useAuth } from '@/app/providers';

// URLs internas do expo-dev-client que NÃO podem ser tratadas como deep link de
// app: re-abri-las via Linking.openURL recarrega o bundle e gera loop infinito.
function isDevClientUrl(url: string): boolean {
  return url.startsWith('petagil://expo-development-client') || url.includes('expo-development-client');
}

export function useDeferredDeepLink() {
  const { isAuthenticated } = useAuth();
  const pendingDeepLinkRef = useRef<string | null>(null);
  const isProcessingDeferredLinkRef = useRef(false);

  // Salvar deep link quando não autenticado
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      // Ignorar se estamos processando um deep link adiado (evita loop infinito)
      if (isProcessingDeferredLinkRef.current) {
        console.log('[DeepLink] Ignoring link during deferred processing:', url);
        return;
      }

      if (isDevClientUrl(url)) return;

      if (!isAuthenticated) {
        // Salvar para depois
        pendingDeepLinkRef.current = url;
        console.log('[DeepLink] Saved pending deep link:', url);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Verificar se app abriu via deep link
    Linking.getInitialURL().then((url) => {
      if (url && !isDevClientUrl(url) && !isAuthenticated) {
        pendingDeepLinkRef.current = url;
        console.log('[DeepLink] Saved initial deep link:', url);
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  // Navegar para deep link após autenticação
  useEffect(() => {
    if (isAuthenticated && pendingDeepLinkRef.current) {
      const url = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      console.log('[DeepLink] Navigating to deferred deep link:', url);

      // Setar flag para evitar re-captura durante processamento
      isProcessingDeferredLinkRef.current = true;

      // Usar Linking.openURL para reprocessar o deep link
      // Agora que está autenticado, o NavigationContainer vai processar
      Linking.openURL(url).finally(() => {
        // Limpar flag após pequeno delay para garantir que navegação completou
        setTimeout(() => {
          isProcessingDeferredLinkRef.current = false;
        }, 500);
      });
    }
  }, [isAuthenticated]);

  return pendingDeepLinkRef;
}
