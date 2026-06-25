import React from 'react'
import Svg, { Circle, Path, type SvgProps } from 'react-native-svg'

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number
  color?: string
}

export function IconShareNetwork({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="1.5" />
      <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="1.5" />
      <Path
        d="M8.59 10.51L15.42 6.49"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M8.59 13.49L15.42 17.51"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  )
}
