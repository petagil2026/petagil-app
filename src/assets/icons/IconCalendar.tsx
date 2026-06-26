import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

/** Calendário (aba Agenda / Horários) — estilo Phosphor (viewBox 256), cor via prop. */
export function IconCalendar({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none" {...props}>
      <Path
        d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"
        fill={color}
      />
    </Svg>
  );
}
