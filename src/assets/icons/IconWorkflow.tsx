import React from 'react';
import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

export function IconWorkflow({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="5" cy="6" r="2.2" stroke={color} strokeWidth="1.6" />
      <Circle cx="5" cy="18" r="2.2" stroke={color} strokeWidth="1.6" />
      <Circle cx="19" cy="12" r="2.2" stroke={color} strokeWidth="1.6" />
      <Path
        d="M7.2 6.7C9 7.4 11 8.6 12 10.3M7.2 17.3C9 16.6 11 15.4 12 13.7"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}
