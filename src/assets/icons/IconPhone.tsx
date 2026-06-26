import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

/** Smartphone (celular/WhatsApp) — estilo Phosphor (viewBox 256), cor via prop. */
export function IconPhone({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none" {...props}>
      <Path
        d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16Zm8,200a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8ZM140,200a12,12,0,1,1-12-12A12,12,0,0,1,140,200Z"
        fill={color}
      />
    </Svg>
  );
}
