import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  type SvgProps,
} from 'react-native-svg';

interface IllustrationProps extends Omit<SvgProps, 'width' | 'height'> {
  width?: number;
  height?: number;
}

export function IllustrationNoConversations({
  width = 152,
  height = 135,
  ...props
}: IllustrationProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 152 135"
      fill="none"
      {...props}
    >
      <Circle cx={76} cy={52} r={52} fill="#EEF2F7" />
      <G>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M124 35V65C124 68.1826 122.736 71.2348 120.485 73.4853C118.235 75.7357 115.183 77 112 77H82L52 95V77H40C36.8174 77 33.7652 75.7357 31.5147 73.4853C29.2643 71.2348 28 68.1826 28 65V35C28 31.8174 29.2643 28.7652 31.5147 26.5147C33.7652 24.2643 36.8174 23 40 23H112C115.183 23 118.235 24.2643 120.485 26.5147C122.736 28.7652 124 31.8174 124 35Z"
          fill="white"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M124 35V65C124 68.1826 122.736 71.2348 120.485 73.4853C118.235 75.7357 115.183 77 112 77H82L52 95V77H40C36.8174 77 33.7652 75.7357 31.5147 73.4853C29.2643 71.2348 28 68.1826 28 65V35C28 31.8174 29.2643 28.7652 31.5147 26.5147C33.7652 24.2643 36.8174 23 40 23H112C115.183 23 118.235 24.2643 120.485 26.5147C122.736 28.7652 124 31.8174 124 35Z"
          fill="url(#paint0_linear_illustration_empty)"
          fillOpacity={0.2}
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_illustration_empty"
          x1={76.4486}
          y1={41.45}
          x2={89.7579}
          y2={78.6987}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#D0D5DD" />
          <Stop offset={0.623247} stopColor="white" stopOpacity={0} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}
