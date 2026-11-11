import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Btn, Display, Field, Label, Mono, Page, PaperHeader } from '@/components/ui';
import { REVIEW, WEEKS } from '@/data/content';
import { emptyReview } from '@/lib/defaults';
import { averageScore, focusBlocksDone, nnDaysDone } from '@/lib/progress';
import { useStore } from '@/lib/store';
import { C, F, pad2 } from '@/lib/theme';
import type { Tuple3, WeekReview } from '@/lib/types';

export default function Review() {
  const { w: raw } = useLocalSearchParams<{ w: string }>();
  const w = Math.max(1, Math.min(4, parseInt(String(raw), 10) || 1));
  const { data, currentDay, setReview } = useStore();
  const start = (w - 1) * 7 + 1;
  const end = start + 6;
  const r: WeekReview = data.reviews[String(w)] ?? emptyReview();
  const set = (p: Partial<WeekReview>) => setReview(w, p);

  if (currentDay < end) {
    return (
      <Page contentStyle={{ padding: 20 }}>
        <PaperHeader kicker={`Days ${pad2(start)}–${pad2(end)}`} title={`Week ${w} review`} badge={`W${w}`} />
        <Body>This review unlocks on day {end}. Keep stacking days.</Body>
        <Btn title="Back" kind="outline" onPress={() => router.back()} style={{ marginTop: 18 }} />
      </Page>
    );
  }
  const avg = averageScore(data, start, end);
  return (
    <Page contentStyle={{ padding: 20 }}>
      <PaperHeader kicker={`Days ${pad2(start)}–${pad2(end)} · ${WEEKS[w - 1].name}`} title={`Week ${w} review`} badge={`W${w}`} />
      <Label muted={false}>{REVIEW.scores}</Label>
      <View style={st.scores}>
        {Array.from({ length: 7 }, (_, i) => start + i).map((d) => (
          <Pressable key={d} onPress={() => router.push(`/day/${d}`)} style={st.scoreCell}>
            <Mono style={{ fontSize: 8.5 }}>Day {pad2(d)}</Mono>
            <Display style={{ fontSize: 24, marginTop: 2 }}>{data.days[String(d)]?.score ?? '–'}</Display>
          </Pressable>
        ))}
      </View>
      <View style={st.kv}>
        <View style={st.kvBox}><Mono style={{ fontSize: 9.5 }}>{REVIEW.avg}</Mono><Display style={st.kvVal}>{avg ?? '–'}</Display></View>
        <View style={st.kvBox}><Mono style={{ fontSize: 9.5 }}>{REVIEW.focus}</Mono><Display style={st.kvVal}>{focusBlocksDone(data, start, end)}</Display></View>
      </View>

      <Label muted={false} style={{ marginTop: 22 }}>{REVIEW.nnDone}</Label>
      <View style={st.table}>
        <View style={st.thead}>
          <Mono style={[st.th, { flex: 1 }]}>{REVIEW.habit}</Mono>
          <Mono style={[st.th, { width: 80, textAlign: 'center' }]}>{REVIEW.daysDone}</Mono>
        </View>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[st.trow, i < 2 && { borderBottomWidth: 1, borderBottomColor: C.black }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={st.habit}>{data.day0.nn[i].habit || `Non-negotiable ${i + 1}`}</Text>
              <Display style={st.count}>{nnDaysDone(data, i, start, end)} / 7</Display>
            </View>
            <Field value={r.nnNotes[i]} onChange={(v) => set({ nnNotes: r.nnNotes.map((x, j) => (j === i ? v : x)) as Tuple3<string> })} placeholder={REVIEW.helped} />
          </View>
        ))}
      </View>

      <Field label={REVIEW.win} value={r.win} onChange={(v) => set({ win: v })} lines={3} style={st.gap} />
      <Field label={REVIEW.slip} value={r.slip} onChange={(v) => set({ slip: v })} lines={3} style={st.gap} />
      <Field label={REVIEW.pattern} value={r.pattern} onChange={(v) => set({ pattern: v })} lines={3} style={st.gap} />

      {([['keep', REVIEW.keep, C.black, C.yellow], ['cut', REVIEW.cut, C.black, C.white], ['adjust', REVIEW.adjust, C.yellow, C.black]] as const).map(([k, t, bg, fg]) => (
        <View key={k} style={st.gap}>
          <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingTop: 5, paddingBottom: 3, alignSelf: 'flex-start', minWidth: 110 }}>
            <Display style={{ color: fg, fontSize: 20 }}>{t}</Display>
          </View>
          <Field value={r[k]} onChange={(v) => set({ [k]: v })} lines={3} />
        </View>
      ))}

      <View style={st.box}>
        <Field label={REVIEW.nextFocus} value={r.focus} onChange={(v) => set({ focus: v })} />
        <Field label={REVIEW.promise} value={r.promise} onChange={(v) => set({ promise: v })} style={{ marginTop: 12 }} />
      </View>
      <Mono style={st.saved}>Week {w} / Review · autosaved</Mono>
    </Page>
  );
}

const st = StyleSheet.create({
  scores: { flexDirection: 'row', borderWidth: 1.5, borderColor: C.black, marginTop: 4 },
  scoreCell: { flex: 1, borderRightWidth: 1, borderRightColor: C.black, padding: 4, minHeight: 58 },
  kv: { flexDirection: 'row', marginTop: 10, gap: 8 },
  kvBox: { flex: 1, backgroundColor: C.yellow, padding: 10 },
  kvVal: { fontSize: 26, marginTop: 2 },
  table: { borderWidth: 1.5, borderColor: C.black, marginTop: 4, marginBottom: 20 },
  thead: { flexDirection: 'row', backgroundColor: C.black, padding: 6 },
  th: { color: C.white, fontSize: 9.5 },
  trow: { padding: 8 },
  habit: { fontFamily: F.semi, fontSize: 15, flex: 1, color: C.black },
  count: { fontSize: 20, width: 80, textAlign: 'center' },
  gap: { marginBottom: 16 },
  box: { borderWidth: 2, borderColor: C.black, padding: 12, marginTop: 4 },
  saved: { color: '#999', fontSize: 9.5, marginTop: 16, textAlign: 'center' },
});
