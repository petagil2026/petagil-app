/**
 * Avatar Component
 * Based on hashtag-web avatar for React Native
 */
import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type ImageSourcePropType,
} from 'react-native';
import { useTheme } from '@/theme';

type AvatarSize = 'sm' | 'default' | 'lg' | 'xl';
type AvatarColor =
  | 'default'
  | 'brand'
  | 'orange'
  | 'yellow'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'violet'
  | 'pink';

interface AvatarProps {
  size?: AvatarSize;
  source?: ImageSourcePropType;
  fallback?: string;
  fallbackColor?: AvatarColor;
  style?: StyleProp<ViewStyle>;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 24,
  default: 32,
  lg: 40,
  xl: 48,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 10,
  default: 12,
  lg: 14,
  xl: 16,
};

export function Avatar({
  size = 'default',
  source,
  fallback,
  fallbackColor = 'default',
  style,
}: AvatarProps) {
  const theme = useTheme();

  const getFallbackBackgroundColor = (): string => {
    switch (fallbackColor) {
      case 'brand':
        return theme.colors.brandBlue[6];
      case 'orange':
        return theme.colors.brandOrange[6];
      case 'yellow':
        return theme.colors.brandYellow[6];
      case 'success':
        return theme.colors.success[6];
      case 'warning':
        return theme.colors.warning[6];
      case 'error':
        return theme.colors.error[6];
      case 'info':
        return theme.colors.info[6];
      case 'purple':
        return theme.colors.purple[6];
      case 'violet':
        return theme.colors.violet[6];
      case 'pink':
        return theme.colors.pink[6];
      default:
        return theme.colors.grey[400];
    }
  };

  const getFallbackTextColor = (): string => {
    if (fallbackColor === 'yellow' || fallbackColor === 'warning') {
      return theme.semantic.text.primary;
    }
    return theme.semantic.text.lightSolid;
  };

  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  if (source) {
    return (
      <Image
        source={source}
        style={[
          styles.image,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          }
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: getFallbackBackgroundColor(),
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.fallbackText,
          {
            color: getFallbackTextColor(),
            fontSize,
          },
        ]}
      >
        {fallback?.substring(0, 2).toUpperCase() || '?'}
      </Text>
    </View>
  );
}

// Avatar Badge - Status indicator
type BadgeStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarBadgeProps {
  status?: BadgeStatus;
  style?: StyleProp<ViewStyle>;
}

export function AvatarBadge({ status = 'online', style }: AvatarBadgeProps) {
  const theme = useTheme();

  const statusColors: Record<BadgeStatus, string> = {
    online: theme.colors.success[6],
    offline: theme.colors.grey[400],
    busy: theme.colors.error[6],
    away: theme.colors.warning[6],
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColors[status],
          borderColor: theme.semantic.bg.container,
        },
        style,
      ]}
    />
  );
}

// Avatar Group - Wrapper for Avatar + Badge
interface AvatarGroupProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AvatarGroup({ children, style }: AvatarGroupProps) {
  return <View style={[styles.group, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackText: {
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  group: {
    position: 'relative',
  },
});
