import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

/** Casa (aba Início) — estilo Phosphor (viewBox 256), cor via prop. */
export function IconHome({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none" {...props}>
      <Path
        d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160a8,8,0,0,1,8-8h16a8,8,0,0,1,8,8v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a24,24,0,0,0-24-24H120a24,24,0,0,0-24,24v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"
        fill={color}
      />
    </Svg>
  );
}
