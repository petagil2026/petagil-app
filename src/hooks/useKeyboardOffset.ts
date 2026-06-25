import { useEffect, useRef } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Retorna um Animated.Value que traduz o conteúdo para cima quando o
 * teclado abre, corretamente para iOS e todos os modos de Android
 * (gesture navigation, 3-button, edge-to-edge).
 *
 * iOS: subtrai insets.bottom porque o teclado reporta a altura incluindo
 *      a área do home indicator, que o layout já respeita.
 * Android: usa a altura diretamente — independente do modo de navegação,
 *           e.endCoordinates.height representa exatamente o espaço que o
 *           teclado ocupa a partir do limite inferior do layout.
 */
export function useKeyboardOffset(): Animated.Value {
  const insets = useSafeAreaInsets();
  const offsetAnim = useRef(new Animated.Value(0)).current;

  // Usa ref para não re-registrar os listeners quando insets mudam
  const insetsBottomRef = useRef(insets.bottom);
  useEffect(() => {
    insetsBottomRef.current = insets.bottom;
  }, [insets.bottom]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(offsetAnim, {
        toValue: -(e.endCoordinates.height - (Platform.OS === 'ios' ? insetsBottomRef.current : 0)),
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const onHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(offsetAnim, {
        toValue: 0,
        duration: e.duration || 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [offsetAnim]);

  return offsetAnim;
}
