import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

export function IconArrowCounterClockwise({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none" {...props}>
      <Path
        d="M80,120h88a56,56,0,0,1,0,112H168"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M120,80,80,120l40,40"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
