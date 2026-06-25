/**
 * OfflineBanner — Banner fixo no rodapé quando sem conexão.
 * Ao reconectar, exibe brevemente um estado verde de sucesso antes de sumir.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { fontFamily } from '@/theme';

const BANNER_HEIGHT = 40;
const SUCCESS_VISIBLE_MS = 2000;

type BannerState = 'hidden' | 'offline' | 'reconnected';

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const isOffline = !isConnected || !isInternetReachable;

  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Decide qual estado exibir
  useEffect(() => {
    if (isOffline) {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      setBannerState('offline');
    } else {
      // Só mostra "reconectado" se estava offline antes
      if (bannerState === 'offline') {
        setBannerState('reconnected');
        successTimerRef.current = setTimeout(() => {
          setBannerState('hidden');
        }, SUCCESS_VISIBLE_MS);
      }
    }

    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffline]);

  const isVisible = bannerState !== 'hidden';
  const totalHeight = BANNER_HEIGHT + bottomInset;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isVisible ? totalHeight : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isVisible, heightAnim, opacityAnim, totalHeight]);

  const isReconnected = bannerState === 'reconnected';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: heightAnim,
          opacity: opacityAnim,
          backgroundColor: isReconnected ? '#166534' : '#92400e',
        },
      ]}
      accessible={isVisible}
      accessibilityRole="alert"
      accessibilityLabel={isReconnected ? 'Conexão restabelecida' : 'Sem conexão com a internet'}
    >
      <View style={[styles.inner, { paddingBottom: bottomInset }]}>
        <Text style={styles.icon}>{isReconnected ? '✓' : '⚠'}</Text>
        <Text style={styles.text}>
          {isReconnected ? 'Conexão restabelecida' : 'Sem conexão com a internet'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 999,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  icon: {
    fontSize: 14,
    color: '#fef3c7',
  },
  text: {
    fontSize: 13,
    fontFamily: fontFamily.sans('500'),
    color: '#fef3c7',
  },
});
