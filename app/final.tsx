import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Body, Btn, Display, Field, Mono, Page, PaperHeader, ScoreRow } from '@/components/ui';
import { AREAS, FINAL } from '@/data/content';
import { averageScore, daysCompleted, longestStreak } from '@/lib/progress';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

export default function Final() {
  const { data, currentDay, setFinal } = useStore();
  const f = data.final;
  if (currentDay < 30) {
    return (
      <Page contentStyle={{ padding: 20 }}>
        <PaperHeader kicker={FINAL.kicker} title={FINAL.title} badge="30" />
        <Body>Your final review unlocks on day 30. You're on day {currentDay}.</Body>
        <Btn title="Back" kind="outline" onPress={() => router.back()} style={{ marginTop: 18 }} />
      </Page>
    );
  }
  const avg = averageScore(data, 1, 30);
  return (
    <Page contentStyle={{ padding: 20 }}>
      <PaperHeader kicker={FINAL.kicker} title={FINAL.title} badge="30" />
      <Body style={st.sub}>Rate yourself again today without looking first. Your Day 0 score and the change appear once you pick a number.</Body>
      <View style={st.thead}>
        <Mono style={[st.th, { flex: 1 }]}>{FINAL.area}</Mono>
        <Mono style={st.th}>{FINAL.day0}</Mono>
        <Mono style={st.th}>{FINAL.change}</Mono>
      </View>
      {AREAS.map((a, i) => {
        const b = data.day0.baseline[i];
        const now = f.scores[i];
        const diff = b != null && now != null ? now - b : null;
        return (
          <View key={a} style={st.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={st.area}>{a}</Text>
              <Display style={st.cellNum}>{now != null ? (b ?? '–') : '?'}</Display>
              <View style={[st.change, diff != null && diff > 0 && { backgroundColor: C.yellow }]}>
                <Display style={{ fontSize: 18 }}>{diff == null ? '' : diff > 0 ? `+${diff}` : `${diff}`}</Display>
              </View>
            </View>
            <Mono style={{ fontSize: 9, color: '#777', marginVertical: 6 }}>{FINAL.day30}</Mono>
            <ScoreRow value={now} onChange={(v) => setFinal({ scores: f.scores.map((x, j) => (j === i ? v : x)) })} size={29} />
          </View>
        );
      })}
      <View style={st.stats}>
        {[[FINAL.daysCompleted, String(daysCompleted(data, 30))], [FINAL.longest, String(longestStreak(data, 30))], [FINAL.average, avg != null ? String(avg) : '–']].map(([l, v]) => (
          <View key={l} style={st.stat}><Mono style={{ fontSize: 9 }}>{l}</Mono><Display style={{ fontSize: 26 }}>{v}</Display></View>
        ))}
      </View>
      <Field label={FINAL.changed} value={f.changed} onChange={(v) => setFinal({ changed: v })} lines={2} style={st.gap} />
      <Field label={FINAL.hardest} value={f.hardest} onChange={(v) => setFinal({ hardest: v })} lines={2} style={st.gap} />
      <Field label={FINAL.proved} value={f.proved} onChange={(v) => setFinal({ proved: v })} lines={2} style={st.gap} />
      <Field label={FINAL.tell} value={f.tell} onChange={(v) => setFinal({ tell: v })} lines={2} style={st.gap} />
      <Field label={FINAL.lesson} value={f.lesson} onChange={(v) => setFinal({ lesson: v })} lines={2} style={st.gap} />
      <Btn title="What's next →" kind="black" onPress={() => router.push('/next')} style={{ marginTop: 8 }} />
    </Page>
  );
}

const st = StyleSheet.create({
  sub: { fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 14 },
  thead: { flexDirection: 'row', backgroundColor: C.black, paddingVertical: 6, paddingHorizontal: 8, gap: 8 },
  th: { color: C.white, fontSize: 9.5, width: 54, textAlign: 'center' },
  row: { borderBottomWidth: 1, borderBottomColor: C.black, borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.black, padding: 8 },
  area: { flex: 1, fontFamily: F.semi, fontSize: 15, color: C.black },
  cellNum: { width: 54, textAlign: 'center', fontSize: 20 },
  change: { width: 54, alignItems: 'center', backgroundColor: C.paleYellow, paddingVertical: 2, marginLeft: 8 },
  stats: { flexDirection: 'row', gap: 8, marginVertical: 18 },
  stat: { flex: 1, borderWidth: 2, borderColor: C.black, padding: 8 },
  gap: { marginBottom: 16 },
});
