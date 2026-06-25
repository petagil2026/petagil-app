/**
 * useNetworkStatus — estado de conectividade de rede
 * Usa @react-native-community/netinfo
 */
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // Fetch estado inicial
    NetInfo.fetch().then((state) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    return unsubscribe;
  }, []);

  return status;
}
