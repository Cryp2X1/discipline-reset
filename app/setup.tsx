import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Btn, Display, Field, Label, Mono, Page, PaperHeader, Rich, ScoreRow, YBox } from '@/components/ui';
import { AREAS, DAY0 } from '@/data/content';
import { addDays, prettyDate, todayISO } from '@/lib/dates';
import { notify } from '@/lib/confirm';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';
import type { Day0, IfThen, NonNegotiable, Tuple3 } from '@/lib/types';

const STEPS = ['Why', 'Habits', 'Obstacles', 'Baseline'];

export default function Setup() {
  const { data, setDay0, completeOnboarding } = useStore();
  const editing = data.onboarded;
  const d = data.day0;
  const [step, setStep] = useState(0);
  const [ifCount, setIfCount] = useState(() => Math.max(3, d.ifThen.filter((x) => x.if || x.then).length));
  const scroll = useRef<ScrollViewInstance>(null);
  const insets = useSafeAreaInsets();

  const go = (n: number) => { setStep(n); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const setNN = (i: number, p: Partial<NonNegotiable>) => setDay0({ nn: d.nn.map((x, j) => (j === i ? { ...x, ...p } : x)) as Tuple3<NonNegotiable> });
  const setIf = (i: number, p: Partial<IfThen>) => setDay0({ ifThen: d.ifThen.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const setWhy = (i: number, v: string) => setDay0({ why: d.why.map((x, j) => (j === i ? v : x)) as Day0['why'] });
  const setBase = (i: number, v: number | null) => setDay0({ baseline: d.baseline.map((x, j) => (j === i ? v : x)) });

  const missing = (): string | null => {
    if (!d.name.trim()) return 'Write your name in the commitment (step 1).';
    if (!d.signature.trim()) return 'Sign your commitment by typing your name (step 1).';
    if (d.nn.some((h) => !h.habit.trim())) return 'Fill in all 3 non-negotiable habits (step 2).';
    return null;
  };
  const finish = () => {
    const m = missing();
    if (m) { notify('Almost there', m); return; }
    completeOnboarding();
  };

  return (
    <Page scrollRef={scroll} contentStyle={{ paddingTop: editing ? 0 : insets.top }}>
      <View style={st.stepBar}>
        {STEPS.map((t, i) => (
          <Pressable key={t} onPress={() => go(i)} style={[st.stepTab, i === step && st.stepTabOn]}>
            <Mono style={[{ fontSize: 9.5, color: '#999' }, i === step && { color: C.black }, i < step && { color: C.white }]}>{i + 1}. {t}</Mono>
          </Pressable>
        ))}
      </View>
      <View style={st.body}>
        {step === 0 && (
          <>
            <PaperHeader kicker="Day 0 / Setup" title={DAY0.why.title} badge="00" />
            <Body style={st.sub}>{DAY0.why.sub}</Body>
            {DAY0.why.prompts.map((p, i) => (
              <Field key={p} label={p} value={d.why[i]} onChange={(v) => setWhy(i, v)} lines={i === 0 ? 4 : i === 3 ? 2 : 3} style={st.gap} />
            ))}
            <View style={st.box}>
              <Mono style={{ marginBottom: 8 }}>{DAY0.why.commitmentLabel}</Mono>
              <Field label="Your name" value={d.name} onChange={(v) => setDay0({ name: v })} placeholder="Full name" autoCapitalize="words" />
              <Text style={st.commit}>
                {DAY0.why.commitment[0]}<Text style={{ fontFamily: F.heavy, textDecorationLine: 'underline' }}>{d.name.trim() || '__________'}</Text>{DAY0.why.commitment[1]}
              </Text>
              <Field label={DAY0.why.signature} value={d.signature} onChange={(v) => setDay0({ signature: v })} placeholder="Type your name to sign" autoCapitalize="words"
                inputStyle={{ fontFamily: F.bodyItalic, fontStyle: 'italic', fontSize: 24, borderBottomColor: C.black, borderBottomWidth: 1.5 }} style={{ marginTop: 16 }} />
              <Label style={{ marginTop: 16 }}>{DAY0.why.startDate}</Label>
              {editing ? (
                <Text style={st.dateFixed}>{prettyDate(d.startDate)}</Text>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  {[{ l: 'Today', v: todayISO() }, { l: 'Tomorrow', v: addDays(todayISO(), 1) }].map((o) => (
                    <Pressable key={o.l} onPress={() => setDay0({ startDate: o.v })} style={[st.chip, d.startDate === o.v && st.chipOn]}>
                      <Mono style={d.startDate === o.v ? { color: C.yellow } : undefined}>{o.l}</Mono>
                      <Text style={[st.chipSub, d.startDate === o.v && { color: C.white }]}>{prettyDate(o.v)}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <PaperHeader kicker="Day 0 / Setup" title={DAY0.nn.title} badge="00" />
            <Body style={st.sub}>{DAY0.nn.sub}</Body>
            <YBox style={{ marginBottom: 18 }}><Rich text={DAY0.nn.examples} style={st.ex} /></YBox>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <View style={st.num}><Display style={{ color: C.yellow, fontSize: 34 }}>{i + 1}</Display></View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Field label={DAY0.nn.habit} value={d.nn[i].habit} onChange={(v) => setNN(i, { habit: v })} />
                  <Field label={DAY0.nn.when} value={d.nn[i].when} onChange={(v) => setNN(i, { when: v })} />
                  <Field label={`${DAY0.nn.min} (bad-day minimum)`} value={d.nn[i].min} onChange={(v) => setNN(i, { min: v })} />
                </View>
              </View>
            ))}
            <Field label={DAY0.nn.protect} value={d.protect} onChange={(v) => setDay0({ protect: v })} style={st.gap} />
            <Field label={DAY0.nn.cutting} value={d.cutting} onChange={(v) => setDay0({ cutting: v })} lines={2} style={st.gap} />
          </>
        )}

        {step === 2 && (
          <>
            <PaperHeader kicker="Day 0 / Setup" title={DAY0.obstacles.title} badge="00" />
            <Body style={st.sub}>{DAY0.obstacles.sub}</Body>
            <Field label={DAY0.obstacles.likely} value={d.obstacles} onChange={(v) => setDay0({ obstacles: v })} lines={3} style={st.gap} />
            <YBox style={{ marginBottom: 16 }}><Rich text={DAY0.obstacles.examples} style={st.ex} /></YBox>
            {d.ifThen.slice(0, ifCount).map((x, i) => (
              <View key={i} style={st.ifRow}>
                <Field label={DAY0.obstacles.if} value={x.if} onChange={(v) => setIf(i, { if: v })} lines={2} style={{ flex: 1 }} inputStyle={{ borderBottomWidth: 0 }} />
                <View style={{ height: 1.5, backgroundColor: C.black, marginVertical: 6 }} />
                <Field label={DAY0.obstacles.then} value={x.then} onChange={(v) => setIf(i, { then: v })} lines={2} style={{ flex: 1 }} inputStyle={{ borderBottomWidth: 0 }} />
              </View>
            ))}
            {ifCount < 6 ? <Btn small kind="outline" title="+ Add another if-then plan" onPress={() => setIfCount(ifCount + 1)} style={{ marginBottom: 18 }} /> : null}
            <Field label={DAY0.obstacles.accountable} value={d.accountable} onChange={(v) => setDay0({ accountable: v })} lines={2} style={st.gap} />
          </>
        )}

        {step === 3 && (
          <>
            <PaperHeader kicker="Day 0 / Setup" title={DAY0.baseline.title} badge="00" />
            <Body style={st.sub}>{DAY0.baseline.sub.replace('Circle a number.', 'Tap a number.')}</Body>
            {AREAS.map((a, i) => (
              <View key={a} style={st.area}>
                <Text style={st.areaText}>{a}</Text>
                <ScoreRow value={d.baseline[i] ?? null} onChange={(v) => setBase(i, v)} size={29} />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
              <Field style={{ flex: 1 }} label={DAY0.baseline.wake} value={d.wake} onChange={(v) => setDay0({ wake: v })} />
              <Field style={{ flex: 1 }} label={DAY0.baseline.screen} value={d.screen} onChange={(v) => setDay0({ screen: v })} />
            </View>
            <Field label={DAY0.baseline.strength} value={d.strength} onChange={(v) => setDay0({ strength: v })} lines={2} style={st.gap} />
            <Field label={DAY0.baseline.weakness} value={d.weakness} onChange={(v) => setDay0({ weakness: v })} lines={2} style={st.gap} />
            <Field label={DAY0.baseline.quit} value={d.quit} onChange={(v) => setDay0({ quit: v })} lines={2} style={st.gap} />
          </>
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          {step > 0 ? <Btn kind="outline" title="Back" onPress={() => go(step - 1)} style={{ flex: 1 }} /> : null}
          {step < 3 ? (
            <Btn kind="black" title="Next" onPress={() => go(step + 1)} style={{ flex: 2 }} />
          ) : editing ? (
            <Btn title="Done" onPress={() => router.back()} style={{ flex: 2 }} />
          ) : (
            <Btn title="Commit & start" onPress={finish} style={{ flex: 2 }} />
          )}
        </View>
        <Text style={st.saved}>Autosaved on this phone</Text>
      </View>
    </Page>
  );
}

const st = StyleSheet.create({
  stepBar: { flexDirection: 'row', backgroundColor: C.black },
  stepTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: C.black },
  stepTabOn: { backgroundColor: C.yellow, borderBottomColor: C.yellow },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  sub: { fontSize: 15, lineHeight: 21, color: '#333', marginBottom: 16 },
  gap: { marginBottom: 16 },
  box: { borderWidth: 2, borderColor: C.black, padding: 14, marginTop: 6 },
  commit: { fontFamily: F.body, fontSize: 16, lineHeight: 25, marginTop: 12, color: C.black },
  dateFixed: { fontFamily: F.semi, fontSize: 16, marginTop: 4 },
  chip: { flex: 1, borderWidth: 2, borderColor: C.black, padding: 10 },
  chipOn: { backgroundColor: C.black },
  chipSub: { fontFamily: F.body, fontSize: 12, marginTop: 3, color: '#555' },
  ex: { fontFamily: F.medium, fontSize: 14, lineHeight: 20, color: C.black },
  num: { width: 56, height: 56, backgroundColor: C.black, alignItems: 'center', justifyContent: 'center' },
  ifRow: { borderWidth: 1.5, borderColor: C.black, padding: 10, marginBottom: 12 },
  area: { borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 10 },
  areaText: { fontFamily: F.semi, fontSize: 15, marginBottom: 8, color: C.black },
  saved: { fontFamily: F.mono, fontSize: 10, color: '#999', textAlign: 'center', marginTop: 12, letterSpacing: 1, textTransform: 'uppercase' },
});
