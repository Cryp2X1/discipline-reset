import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Body, DarkHeader, Display, Mono, Page } from '@/components/ui';
import { WEEKS } from '@/data/content';
import { addDays, shortDate } from '@/lib/dates';
import { currentStreak, daysCompleted, dayStatus, longestStreak, type DayStatus } from '@/lib/progress';
import { useStore } from '@/lib/store';
import { C, F, pad2 } from '@/lib/theme';

const RANGES: [number, number][] = [[1, 7], [8, 14], [15, 21], [22, 30]];

export default function Journey() {
  const { data, currentDay } = useStore();
  const { width } = useWindowDimensions();
  const inner = Math.min(width, 600) - 40;
  const gap = 6;
  const tile = Math.floor((inner - gap * 6) / 7);
  const streak = currentStreak(data, currentDay);

  return (
    <Page>
      <DarkHeader big={pad2(streak)} kicker="Day streak" title="Your 30 days">
        <View style={st.stats}>
          <Stat label="Day" value={`${pad2(currentDay)}/30`} />
          <Stat label="Completed" value={pad2(daysCompleted(data, currentDay))} />
          <Stat label="Longest" value={pad2(longestStreak(data, currentDay))} />
        </View>
      </DarkHeader>
      <View style={st.body}>
        <Pressable onPress={() => router.push('/edit-setup')} style={st.day0}>
          <Display style={{ fontSize: 22 }}>Day 00 · Setup</Display>
          <Mono style={{ fontSize: 10 }}>Why · Non-negotiables · Baseline →</Mono>
        </Pressable>

        {WEEKS.map((w, wi) => {
          const [a, b] = RANGES[wi];
          const unlockedReview = wi < 3 ? currentDay >= b : currentDay >= 28;
          return (
            <View key={w.week} style={{ marginTop: 22 }}>
              <View style={st.weekHead}>
                <View style={st.weekNum}><Display style={{ color: C.yellow, fontSize: 22 }}>{pad2(w.week)}</Display></View>
                <View style={{ flex: 1 }}>
                  <Display style={{ fontSize: 22 }}>{w.name}</Display>
                  <Text style={st.tagline}>{w.tagline}</Text>
                </View>
              </View>
              <View style={[st.grid, { gap }]}>
                {Array.from({ length: Math.min(b, a + 6) - a + 1 }, (_, i) => a + i).map((n) => (
                  <DayTile key={n} n={n} size={tile} status={dayStatus(data, n, currentDay)} isToday={n === currentDay}
                    date={shortDate(addDays(data.day0.startDate, n - 1))} />
                ))}
              </View>
              <Pressable disabled={!unlockedReview} onPress={() => router.push(`/review/${w.week}`)} style={[st.review, !unlockedReview && { opacity: 0.35 }]}>
                <Mono style={{ fontSize: 10 }}>{`Week ${w.week} review · after day ${pad2(a + 6)}`}</Mono>
                <Mono style={{ fontSize: 10 }}>{unlockedReview ? 'Open →' : 'Locked'}</Mono>
              </Pressable>
              {b > a + 6 ? (
                <View style={[st.grid, { gap, marginTop: 10 }]}>
                  {Array.from({ length: b - a - 6 }, (_, i) => a + 7 + i).map((n) => (
                    <DayTile key={n} n={n} size={tile} status={dayStatus(data, n, currentDay)} isToday={n === currentDay}
                      date={shortDate(addDays(data.day0.startDate, n - 1))} />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
        <Pressable disabled={currentDay < 30} onPress={() => router.push('/final')} style={[st.final, currentDay < 30 && { opacity: 0.35 }]}>
          <Display style={{ fontSize: 22, color: C.yellow }}>Day 30 · Final review</Display>
          <Mono style={{ fontSize: 10, color: C.white }}>{currentDay >= 30 ? 'Open →' : 'Locked'}</Mono>
        </Pressable>

        <View style={st.legend}>
          {(['done', 'partial', 'missed', 'today', 'locked'] as DayStatus[]).map((s) => (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[st.legendBox, tileStyle(s, s === 'today')]} />
              <Mono style={{ fontSize: 9.5 }}>{s}</Mono>
            </View>
          ))}
        </View>
        <Body style={{ fontSize: 13, color: '#666', marginTop: 8 }}>Done = all 3 non-negotiables checked (the 2-minute version counts). Tap any unlocked day to open or edit it.</Body>
      </View>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderLeftWidth: 2, borderLeftColor: C.yellow, paddingLeft: 8 }}>
      <Mono style={{ color: '#aaa', fontSize: 9.5 }}>{label}</Mono>
      <Display style={{ color: C.white, fontSize: 22 }}>{value}</Display>
    </View>
  );
}

function tileStyle(s: DayStatus, isToday: boolean) {
  const base = { backgroundColor: C.white, borderColor: C.black, borderWidth: 2 };
  if (s === 'done') Object.assign(base, { backgroundColor: C.yellow });
  if (s === 'missed') Object.assign(base, { backgroundColor: C.black });
  if (s === 'locked') Object.assign(base, { backgroundColor: C.soft, borderColor: '#d5d5d5' });
  if (isToday) Object.assign(base, { borderWidth: 3.5 });
  return base;
}

function DayTile({ n, size, status, isToday, date }: { n: number; size: number; status: DayStatus; isToday: boolean; date: string }) {
  const locked = status === 'locked';
  const fg = status === 'missed' ? C.white : locked ? '#bbb' : C.black;
  const mark = status === 'done' ? '✓' : status === 'missed' ? 'X' : status === 'partial' ? '½' : status === 'today' ? '•' : '';
  return (
    <Pressable disabled={locked} onPress={() => router.push(`/day/${n}`)} accessibilityLabel={`Day ${n}, ${status}`}
      style={[{ width: size, height: size + 20, alignItems: 'center', paddingTop: 4 }, tileStyle(status, isToday)]}>
      <Text style={[st.tileNum, { color: fg }]}>{pad2(n)}</Text>
      <Text style={[st.tileMark, { color: fg }]}>{mark}</Text>
      {isToday ? <View style={st.todayDot}><Text style={st.todayText}>TODAY</Text></View> : null}
      <Text style={[st.tileDate, { color: status === 'missed' ? '#999' : '#888' }]} numberOfLines={1}>{date}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 18 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 16 },
  day0: { borderWidth: 2.5, borderColor: C.black, padding: 12, gap: 4, backgroundColor: C.yellow },
  weekHead: { flexDirection: 'row', gap: 10, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: C.black, paddingBottom: 8, marginBottom: 10 },
  weekNum: { backgroundColor: C.black, paddingHorizontal: 8, paddingTop: 3 },
  tagline: { fontFamily: F.body, fontSize: 13, color: '#555' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tileNum: { fontFamily: F.display, fontSize: 18 },
  tileMark: { fontFamily: F.heavy, fontSize: 13, lineHeight: 16 },
  tileDate: { fontFamily: F.mono, fontSize: 7.5, position: 'absolute', bottom: 3 },
  todayDot: { position: 'absolute', top: -8, backgroundColor: C.black, paddingHorizontal: 3 },
  todayText: { fontFamily: F.monoBold, color: C.yellow, fontSize: 7, letterSpacing: 0.8 },
  review: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1.5, borderColor: C.black, borderStyle: 'dashed', padding: 10, marginTop: 10 },
  final: { backgroundColor: C.black, padding: 14, marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 },
  legendBox: { width: 16, height: 16 },
});
