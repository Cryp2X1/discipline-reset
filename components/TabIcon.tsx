import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function TabIcon({ name, color }: { name: 'today' | 'journey' | 'progress' | 'settings'; color: string }) {
  const sw = 2.4;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {name === 'today' && (<>
        <Rect x={3} y={3} width={18} height={18} stroke={color} strokeWidth={sw} />
        <Path d="M7.5 12.5l3 3 6-7" stroke={color} strokeWidth={sw} strokeLinecap="square" />
      </>)}
      {name === 'journey' && (<>
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
          <Rect key={`${r}${c}`} x={3 + c * 7} y={3 + r * 7} width={4.5} height={4.5} fill={r * 3 + c < 5 ? color : 'none'} stroke={color} strokeWidth={1.6} />
        )))}
      </>)}
      {name === 'progress' && (<>
        <Path d="M3 20h18" stroke={color} strokeWidth={sw} />
        <Path d="M4 16l5-5 4 3 7-8" stroke={color} strokeWidth={sw} strokeLinejoin="miter" />
      </>)}
      {name === 'settings' && (<>
        <Circle cx={12} cy={12} r={3.5} stroke={color} strokeWidth={sw} />
        <Path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke={color} strokeWidth={sw} />
      </>)}
    </Svg>
  );
}
