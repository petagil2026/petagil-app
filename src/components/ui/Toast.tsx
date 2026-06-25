/**
 * Toast Component
 * Notificação flutuante no topo da tela, dispensável por tap ou swipe-up.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  IconErrorCircle,
  IconCheckCircleFilled,
  IconInfo,
} from '@/assets/icons';
import { fontFamily, useTheme, colors } from '@/theme';

type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
}

interface ToastContextValue {
  error: (message: string, action?: ToastAction) => void;
  success: (message: string, action?: ToastAction) => void;
  warning: (message: string, action?: ToastAction) => void;
  info: (message: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_DURATION: Record<ToastType, number> = {
  success: 1500,
  info: 1500,
  warning: 2500,
  error: 3000,
};
const MAX_TOASTS = 3;
// Distância vertical (px) ou velocidade (px/ms) de swipe pra cima que dispara dismiss.
const SWIPE_DISMISS_DISTANCE = 40;
const SWIPE_DISMISS_VELOCITY = 0.3;

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const dismissedRef = useRef(false);

  const handleDismiss = useCallback(
    (direction: 'up' | 'fade' = 'fade') => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: direction === 'up' ? -80 : -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onRemove(toast.id);
      });
    },
    [fadeAnim, translateY, onRemove, toast.id]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => handleDismiss('fade'), TOAST_DURATION[toast.type]);
    return () => clearTimeout(timeout);
  }, [fadeAnim, translateY, handleDismiss, toast.type]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy < 0) {
            translateY.setValue(gesture.dy);
            fadeAnim.setValue(Math.max(0, 1 + gesture.dy / 80));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldDismiss =
            gesture.dy < -SWIPE_DISMISS_DISTANCE || gesture.vy < -SWIPE_DISMISS_VELOCITY;
          if (shouldDismiss) {
            handleDismiss('up');
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 4,
              }),
              Animated.spring(fadeAnim, {
                toValue: 1,
                useNativeDriver: true,
                bounciness: 0,
              }),
            ]).start();
          }
        },
      }),
    [fadeAnim, translateY, handleDismiss]
  );

  const visual = getToastVisual(toast.type);
  const Icon = visual.Icon;
  const accentColor = visual.color;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: theme.semantic.bg.container,
          borderLeftColor: accentColor,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      accessibilityLabel={toast.message}
    >
      <Pressable onPress={() => handleDismiss('fade')} style={styles.pressable}>
        <Icon size={16} color={accentColor} />
        <Text
          style={[styles.message, { color: theme.semantic.text.primary }]}
          numberOfLines={2}
        >
          {toast.message}
        </Text>
        {toast.action && (
          <TouchableOpacity
            onPress={() => {
              toast.action!.onPress();
              handleDismiss('fade');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.actionLabel, { color: accentColor }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getToastVisual(type: ToastType): {
  Icon: typeof IconErrorCircle;
  color: string;
} {
  switch (type) {
    case 'success':
      return { Icon: IconCheckCircleFilled, color: colors.success[6] };
    case 'warning':
      return { Icon: IconErrorCircle, color: colors.warning[6] };
    case 'info':
      return { Icon: IconInfo, color: colors.info[6] };
    case 'error':
    default:
      return { Icon: IconErrorCircle, color: colors.error[6] };
  }
}

function triggerHaptic(type: ToastType) {
  switch (type) {
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      return;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {}
      );
      return;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      return;
    case 'info':
      Haptics.selectionAsync().catch(() => {});
      return;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, action?: ToastAction) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      triggerHaptic(type);
      setToasts((prev) => {
        const next = [...prev, { id, type, message, action }];
        // FIFO: descarta os mais antigos quando excede o limite
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      error: (message, action) => addToast('error', message, action),
      success: (message, action) => addToast('success', message, action),
      warning: (message, action) => addToast('warning', message, action),
      info: (message, action) => addToast('info', message, action),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        style={[styles.container, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    borderRadius: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 13,
    paddingRight: 16,
    gap: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: fontFamily.sans('400'),
    lineHeight: 20,
    flexShrink: 1,
    flexGrow: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: fontFamily.sans('600'),
    lineHeight: 20,
  },
});
