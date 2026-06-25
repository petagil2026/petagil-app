import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

export function IconDownload({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 4.5V15.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.75 10.5L12 15.75L17.25 10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.5 19.5H19.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
