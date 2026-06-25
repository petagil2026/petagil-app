import React from 'react'
import Svg, { Path, type SvgProps } from 'react-native-svg'

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number
  color?: string
}

export function IconPin({ size = 24, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.86-1.28 3.41-3 3.86V15c0 .55.45 1 1 1h4.97v5l1 1 1-1v-5H17c.55 0 1-.45 1-1v-2.14c-1.72-.45-3-2-3-3.86z"
        fill={color}
      />
    </Svg>
  )
}
