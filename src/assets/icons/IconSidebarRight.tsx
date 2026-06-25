import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

export function IconSidebarRight({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M7.5 18.3334H12.5C16.6667 18.3334 18.3333 16.6667 18.3333 12.5V7.50002C18.3333 3.33335 16.6667 1.66669 12.5 1.66669H7.5C3.33333 1.66669 1.66667 3.33335 1.66667 7.50002V12.5C1.66667 16.6667 3.33333 18.3334 7.5 18.3334Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.5 1.66669V18.3334"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.9167 7.91669L10.8333 10L12.9167 12.0834"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
