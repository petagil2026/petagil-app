import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  color?: string;
}

/**
 * Triângulo de alerta com "!" — equivalente ao AlertTriangle (lucide) do web.
 * Usado pelo indicador de instabilidade de IAs (HASHSUST-298).
 * Default color = warning[7] (#D48806).
 */
export function IconWarningTriangle({ size = 16, color = '#d48806', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M7.1356 2.5036 1.2156 12.5036c-.0876.1518-.1339.324-.1343.4993-.0004.1753.0451.3477.132.5.0869.1522.2123.2787.3635.3665.1512.0879.323.1339.498.1335h11.8403c.175.0004.3469-.0456.498-.1335.1513-.0878.2767-.2143.3636-.3665.0869-.1523.1323-.3247.132-.5-.0004-.1753-.0467-.3475-.1343-.4993L8.6443 2.5036c-.0869-.1503-.2117-.2752-.362-.3621-.1503-.0868-.3208-.1326-.4944-.1326-.1736 0-.344.0458-.4943.1326-.1503.0869-.2752.2118-.362.3621Z"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 6v2.6667"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 11.3333h.0067"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
