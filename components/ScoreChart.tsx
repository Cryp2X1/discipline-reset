import React from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { C, F } from '@/lib/theme';

/** Discipline score line chart: x = day 1..30, y = score 1..10. Gaps break the line. */
export function ScoreChart({ scores, width, currentDay, height = 220 }: { scores: (number | null)[]; width: number; currentDay: number; height?: number }) {
  const L = 26, R = 8, T = 10, B = 24;
  const w = width - L - R, h = height - T - B;
  const x = (d: number) => L + ((d - 0.5) / 30) * w;
  const y = (s: number) => T + h - ((s - 0.5) / 10) * h;
  const segs: string[] = [];
  let cur = '';
  scores.forEach((s, i) => {
    if (s == null) { if (cur) segs.push(cur); cur = ''; return; }
    cur += `${cur ? 'L' : 'M'}${x(i + 1).toFixed(1)} ${y(s).toFixed(1)} `;
  });
  if (cur) segs.push(cur);
  return (
    <Svg width={width} height={height}>
      <Rect x={L} y={T} width={w} height={h} fill={C.white} stroke={C.black} strokeWidth={1.5} />
      {currentDay > 0 && currentDay < 30 ? (
        <Rect x={L + (currentDay / 30) * w} y={T} width={w - (currentDay / 30) * w} height={h} fill={C.soft} />
      ) : null}
      {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
        <G key={s}>
          <Line x1={L} x2={L + w} y1={y(s)} y2={y(s)} stroke="#e2e2e2" strokeWidth={1} />
          {s % 2 === 0 || s === 1 ? <SvgText x={L - 6} y={y(s) + 3.5} fontSize={9} fontFamily={F.monoBold} fill={C.black} textAnchor="end">{s}</SvgText> : null}
        </G>
      ))}
      {[7, 14, 21, 28].map((d) => (
        <Line key={d} x1={L + (d / 30) * w} x2={L + (d / 30) * w} y1={T} y2={T + h} stroke={C.black} strokeWidth={1.6} />
      ))}
      {[1, 7, 14, 21, 28, 30].map((d) => (
        <SvgText key={d} x={x(d)} y={T + h + 15} fontSize={9} fontFamily={F.monoBold} fill={C.black} textAnchor="middle">{d}</SvgText>
      ))}
      {segs.map((d, i) => <Path key={i} d={d} stroke={C.black} strokeWidth={2.5} fill="none" strokeLinejoin="round" />)}
      {scores.map((s, i) => (s == null ? null : (
        <Circle key={i} cx={x(i + 1)} cy={y(s)} r={4.2} fill={C.yellow} stroke={C.black} strokeWidth={1.8} />
      )))}
    </Svg>
  );
}
