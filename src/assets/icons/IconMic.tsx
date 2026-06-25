import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

export function IconMic({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 17.25C14.7188 17.25 16.875 15.0938 16.875 12.375V6.75C16.875 4.03125 14.7188 1.875 12 1.875C9.28125 1.875 7.125 4.03125 7.125 6.75V12.375C7.125 15.0938 9.28125 17.25 12 17.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.75 10.5V12.375C3.75 16.8438 7.53125 20.4375 12 20.4375C16.4688 20.4375 20.25 16.8438 20.25 12.375V10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 20.4375V22.125"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
