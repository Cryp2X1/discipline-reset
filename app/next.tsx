import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Body, Display, Field, Mono, Page, PaperHeader } from '@/components/ui';
import { NEXT } from '@/data/content';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';
import type { NextPlan } from '@/lib/types';

export default function Next() {
  const { data, setNext } = useStore();
  const n = data.next;
  const set = (p: Partial<NextPlan>) => setNext(p);
  const blocks: [keyof NextPlan, string, string, string, string][] = [
    ['keep', NEXT.keep, NEXT.keepSub, C.black, C.yellow],
    ['level', NEXT.level, NEXT.levelSub, C.yellow, C.black],
    ['add', NEXT.add, NEXT.addSub, C.black, C.white],
  ];
  return (
    <Page contentStyle={{ padding: 20 }}>
      <PaperHeader kicker={NEXT.kicker} title={NEXT.title} badge={NEXT.badge} badgeDark />
      <Body style={st.sub}>{NEXT.sub}</Body>
      {blocks.map(([k, t, sub, bg, fg]) => (
        <View key={k} style={st.gap}>
          <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingTop: 5, paddingBottom: 3 }}><Display style={{ color: fg, fontSize: 20 }}>{t}</Display></View>
          <Text style={st.small}>{sub}</Text>
          <Field value={n[k]} onChange={(v) => set({ [k]: v })} lines={3} />
        </View>
      ))}
      <Field label={NEXT.work} value={n.work} onChange={(v) => set({ work: v })} lines={2} style={st.gap} />
      <Field label={NEXT.training} value={n.training} onChange={(v) => set({ training: v })} lines={2} style={st.gap} />
      <Field label={NEXT.study} value={n.study} onChange={(v) => set({ study: v })} lines={2} style={st.gap} />
      <Field label={NEXT.standards} value={n.standards} onChange={(v) => set({ standards: v })} lines={4} style={st.gap} />
      <Field label={NEXT.first} value={n.first} onChange={(v) => set({ first: v })} style={st.gap} />
      <View style={st.dark}>
        <Display style={{ color: C.white, fontSize: 30, lineHeight: 34 }}>{NEXT.closing1} <Text style={{ color: C.yellow }}>{NEXT.closing2}</Text></Display>
        <Field dark label={NEXT.nextReset} value={n.nextStart} onChange={(v) => set({ nextStart: v })} placeholder="Date" style={{ marginTop: 14 }} />
        <Field dark label={NEXT.signature} value={n.signature} onChange={(v) => set({ signature: v })} placeholder="Type your name" style={{ marginTop: 12 }}
          inputStyle={{ fontFamily: F.bodyItalic, fontStyle: 'italic', fontSize: 22 }} />
        <Mono style={{ color: C.yellow, marginTop: 16, lineHeight: 16 }}>{NEXT.share}</Mono>
      </View>
    </Page>
  );
}

const st = StyleSheet.create({
  sub: { fontSize: 15, lineHeight: 21, color: '#222', marginBottom: 16 },
  gap: { marginBottom: 16 },
  small: { fontFamily: F.body, fontSize: 13, color: '#666', marginTop: 4 },
  dark: { backgroundColor: C.black, padding: 18, marginTop: 8 },
});
