import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ScoreChart } from '@/components/ScoreChart';
import { Body, DarkHeader, Display, Field, Mono, Page, PaperHeader } from '@/components/ui';
import { GRAPH, NEXT, TRACKER, WEEKS } from '@/data/content';
import { averageScore, entry, isDone, longestStreak, missedTwice, totalChecks } from '@/lib/progress';
import { useStore } from '@/lib/store';
import { C, F, pad2 } from '@/lib/theme';
import type { DayEntry } from '@/lib/types';

const CELL = 26;
const LABEL = 128;

type Row = { label: string; muted?: boolean; get: (e: DayEntry) => 'done' | 'min' | false };

export default function Progress() {
  const { data, currentDay, setGraph } = useStore();
  const { width } = useWindowDimensions();
  const chartW = Math.min(width, 600) - 40;
  const avg = averageScore(data, 1, currentDay);
  const rows: Row[] = [
    ...[0, 1, 2].map((i): Row => ({ label: data.day0.nn[i].habit || `Non-negotiable ${i + 1}`, get: (e) => e.nn[i] ?? false })),
    { label: TRACKER.rows[0], get: (e) => (e.fixed[0] ? 'done' : false) },
    { label: TRACKER.rows[1], get: (e) => (e.focus.some((f) => f.done) ? 'done' : false) },
    { label: TRACKER.rows[2], get: (e) => (e.hardDone ? 'done' : false) },
    { label: TRACKER.rows[3], get: (e) => (e.fixed[1] ? 'done' : false) },
    { label: TRACKER.rows[4], get: (e) => (e.fixed[2] ? 'done' : false) },
  ];
  const scores = Array.from({ length: 30 }, (_, i) => data.days[String(i + 1)]?.score ?? null);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Page>
      <DarkHeader big={avg != null ? avg.toFixed(1) : '–'} kicker="Average score" title="Progress" />
      <View style={st.body}>
        <PaperHeader kicker={TRACKER.kicker} title={TRACKER.title} badge="X / ✓" />
        <Body style={st.sub}>Mark ✓ for done, ½ for the 2-minute minimum, X for missed — the app fills this in from your daily pages. Yellow columns mark the end of each week.</Body>
        <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <View style={st.table}>
            <View style={st.tr}>
              <View style={[st.labelCell, { backgroundColor: C.black }]}><Text style={[st.th, { textAlign: 'left' }]}>HABIT / DAY</Text></View>
              {days.map((d) => (
                <Pressable key={d} disabled={d > currentDay} onPress={() => router.push(`/day/${d}`)}
                  style={[st.cell, { backgroundColor: d % 7 === 0 ? C.yellow : C.black }]}>
                  <Text style={[st.th, d % 7 === 0 && { color: C.black }]}>{d}</Text>
                </Pressable>
              ))}
            </View>
            {rows.map((r, ri) => (
              <View key={ri} style={st.tr}>
                <View style={st.labelCell}><Text numberOfLines={2} style={st.rowLabel}>{r.label}</Text></View>
                {days.map((d) => {
                  const past = d <= currentDay;
                  const v = past ? r.get(entry(data, d)) : false;
                  const missed = past && !v && d < currentDay;
                  return (
                    <View key={d} style={[st.cell, d > currentDay && { backgroundColor: '#f7f7f7' }, d % 7 === 0 && { borderRightWidth: 2 }]}>
                      <Text style={[st.mark, v === 'min' && { color: '#a08f00' }, missed && { color: '#bbb' }]}>
                        {v === 'done' ? '✓' : v === 'min' ? '½' : missed ? 'X' : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
            <View style={st.tr}>
              <View style={[st.labelCell, { backgroundColor: '#eee' }]}><Text style={[st.rowLabel, { fontFamily: F.heavy }]}>{TRACKER.score}</Text></View>
              {days.map((d) => (
                <View key={d} style={[st.cell, { backgroundColor: C.soft }, d % 7 === 0 && { borderRightWidth: 2 }]}>
                  <Text style={[st.mark, { fontFamily: F.monoBold, fontSize: 11 }]}>{scores[d - 1] ?? ''}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={st.stats}>
          <StatBox label={TRACKER.longest} value={`${longestStreak(data, currentDay)} days`} />
          <StatBox label={TRACKER.total} value={String(totalChecks(data, currentDay))} />
          <StatBox label={TRACKER.missedTwice} value={String(missedTwice(data, currentDay))} />
        </View>

        <View style={{ height: 30 }} />
        <PaperHeader kicker={GRAPH.kicker} title={GRAPH.title} badge="1–10" />
        <Body style={st.sub}>{GRAPH.sub.replace('Each night, put a dot at your daily score and connect it to yesterday\'s. ', '')}</Body>
        <ScoreChart scores={scores} width={chartW} currentDay={currentDay} />
        <Field label={GRAPH.lowest} value={data.graph.lowest} onChange={(v) => setGraph({ lowest: v })} lines={3} style={{ marginTop: 18 }} />
        <Field label={GRAPH.best} value={data.graph.best} onChange={(v) => setGraph({ best: v })} lines={3} style={{ marginTop: 16 }} />

        <View style={{ height: 30 }} />
        <PaperHeader kicker="Every 7 days" title="Reviews" badge="W1–4" />
        {WEEKS.map((w) => {
          const end = w.week * 7;
          const open = currentDay >= end;
          const r = data.reviews[String(w.week)];
          const started = !!r && Object.values(r).some((v) => (Array.isArray(v) ? v.some(Boolean) : !!v));
          return (
            <LinkRow key={w.week} disabled={!open} onPress={() => router.push(`/review/${w.week}`)}
              title={`Week ${w.week} review`} sub={`Days ${pad2(end - 6)}–${pad2(end)} · ${w.name}`}
              status={!open ? `Unlocks day ${end}` : started ? 'In progress' : 'Ready'} />
          );
        })}
        <LinkRow disabled={currentDay < 30} onPress={() => router.push('/final')} title="Day 30 final review" sub="Compare with your Day 0 baseline" status={currentDay < 30 ? 'Unlocks day 30' : 'Ready'} dark />
        <LinkRow disabled={currentDay < 30} onPress={() => router.push('/next')} title={NEXT.title} sub="Plan your next 30 days" status={currentDay < 30 ? 'Unlocks day 30' : 'Ready'} />
        <Body style={{ fontSize: 13, color: '#666', marginTop: 10 }}>Days fully done so far: {Array.from({ length: currentDay }, (_, i) => i + 1).filter((d) => isDone(data.days[String(d)])).length} of {currentDay}.</Body>
      </View>
    </Page>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.statBox}>
      <Mono style={{ fontSize: 9 }}>{label}</Mono>
      <Display style={{ fontSize: 24, marginTop: 4 }}>{value}</Display>
    </View>
  );
}

function LinkRow({ title, sub, status, onPress, disabled, dark }: { title: string; sub: string; status: string; onPress: () => void; disabled?: boolean; dark?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[st.link, dark && { backgroundColor: C.black }, disabled && { opacity: 0.4 }]}>
      <View style={{ flex: 1 }}>
        <Display style={[{ fontSize: 20 }, dark && { color: C.yellow }]}>{title}</Display>
        <Text style={[st.linkSub, dark && { color: '#bbb' }]}>{sub}</Text>
      </View>
      <Mono style={[{ fontSize: 9.5 }, dark && { color: C.white }]}>{status}{disabled ? '' : ' →'}</Mono>
    </Pressable>
  );
}

const st = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 22 },
  sub: { fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 14 },
  table: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.black },
  tr: { flexDirection: 'row' },
  labelCell: { width: LABEL, minHeight: 34, justifyContent: 'center', paddingHorizontal: 6, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.black },
  cell: { width: CELL, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.black },
  th: { fontFamily: F.monoBold, fontSize: 10, color: C.white, textAlign: 'center' },
  rowLabel: { fontFamily: F.semi, fontSize: 11.5, color: C.black },
  mark: { fontFamily: F.heavy, fontSize: 14, color: C.black },
  stats: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statBox: { flex: 1, borderWidth: 2, borderColor: C.black, padding: 10 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: C.black, padding: 12, marginBottom: 10 },
  linkSub: { fontFamily: F.body, fontSize: 13, color: '#555', marginTop: 2 },
});
