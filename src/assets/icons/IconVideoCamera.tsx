import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

export function IconVideoCamera({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M14.3536 4.14645C14.2598 4.05268 14.1326 4 14 4C13.9116 4 13.8249 4.02428 13.75 4.07031L11 5.78125V5C11 4.44772 10.5523 4 10 4H3C2.44772 4 2 4.44772 2 5V11C2 11.5523 2.44772 12 3 12H10C10.5523 12 11 11.5523 11 11V10.2188L13.75 11.9297C13.8249 11.9757 13.9116 12 14 12C14.1326 12 14.2598 11.9473 14.3536 11.8536C14.4473 11.7598 14.5 11.6326 14.5 11.5V4.5C14.5 4.36739 14.4473 4.24021 14.3536 4.14645ZM10 11H3V5H10V11ZM13.5 10.6406L11 9.03125V6.96875L13.5 5.35938V10.6406Z"
        fill={color}
      />
    </Svg>
  );
}