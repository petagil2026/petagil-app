import React, { useRef, useEffect } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface ShimmerProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Shimmer({ width, height, borderRadius = 4, style }: ShimmerProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.semantic.bg.containerDisabled,
          opacity,
        },
        style,
      ]}
    />
  );
}
