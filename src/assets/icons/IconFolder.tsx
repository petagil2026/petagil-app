import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

export function IconFolder({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M13.5 4H8.62L7.15 2.53C6.96 2.34 6.71 2.24 6.44 2.24H2.5C1.67 2.24 1 2.91 1 3.74V12.24C1 13.07 1.67 13.74 2.5 13.74H13.5C14.33 13.74 15 13.07 15 12.24V5.74C15 4.91 14.33 4.24 13.5 4.24V4ZM2.5 3.24H6.44L7.44 4.24H2V3.74C2 3.46 2.22 3.24 2.5 3.24ZM13.5 12.74H2.5C2.22 12.74 2 12.52 2 12.24V5.24H13.5C13.78 5.24 14 5.46 14 5.74V12.24C14 12.52 13.78 12.74 13.5 12.74Z"
        fill={color}
      />
    </Svg>
  );
}
