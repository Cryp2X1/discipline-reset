import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DAILY, DAYS, WEEKS } from '@/data/content';
import { addDays, prettyDate } from '@/lib/dates';
import { useDay, useStore } from '@/lib/store';
import { C, F, pad2 } from '@/lib/theme';
import type { FocusBlock, Mark, Tuple3 } from '@/lib/types';
import { Body, Check, DarkHeader, Display, Field, Label, MarkBox, Mono, Page, Rich, ScoreRow, SecTag, YBox } from './ui';

export default function DayView({ n, banner, showNav, topInset = true }: { n: number; banner?: React.ReactNode; showNav?: boolean; topInset?: boolean }) {
  const { data, setDay, currentDay } = useStore();
  const e = useDay(n);
  const c = DAYS[n - 1];
  const wk = WEEKS[c.week - 1];
  const date = addDays(data.day0.startDate, n - 1);
  const set = (p: Parameters<typeof setDay>[1]) => setDay(n, p);
  const setFocus = (i: number, p: Partial<FocusBlock>) => set({ focus: e.focus.map((f, j) => (j === i ? { ...f, ...p } : f)) });
  const setNN = (i: number, m: Mark) => set({ nn: e.nn.map((x, j) => (j === i ? m : x)) as Tuple3<Mark> });
  const toggleFixed = (i: number) => set({ fixed: e.fixed.map((x, j) => (j === i ? !x : x)) as Tuple3<boolean> });
  const setRef = (i: number, v: string) => set({ reflection: e.reflection.map((x, j) => (j === i ? v : x)) as Tuple3<string> });

  return (
    <Page>
      <DarkHeader big={`DAY ${pad2(n)}`} kicker={`Week ${c.week} · ${wk.name}`} title={c.title} topInset={topInset}>
        <View style={st.dateRow}>
          <Mono style={{ color: '#aaa' }}>Date</Mono>
          <Text style={st.dateText}>{prettyDate(date)}</Text>
          {showNav ? (
            <View style={st.nav}>
              <NavBtn label="‹" disabled={n <= 1} onPress={() => router.replace(`/day/${n - 1}`)} />
              <NavBtn label="›" disabled={n >= Math.min(30, currentDay)} onPress={() => router.replace(`/day/${n + 1}`)} />
            </View>
          ) : null}
        </View>
      </DarkHeader>

      <View style={st.body}>
        {banner}
        <Rich text={c.lesson} style={{ fontSize: 16, lineHeight: 24 }} />

        {c.quote.kind === 'quote' ? (
          <View style={[st.quote, { borderLeftColor: C.yellow }]}>
            <Text style={st.quoteText}>“{c.quote.text}”</Text>
            <Mono style={st.quoteSrc}>— {c.quote.source}</Mono>
          </View>
        ) : (
          <View style={[st.quote, { borderLeftColor: C.black }]}>
            <Text style={st.lineText}>{c.quote.text}</Text>
          </View>
        )}

        <YBox style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Display style={{ fontSize: 22 }}>{DAILY.challenge}</Display>
            <Check checked={e.challengeDone} onToggle={() => set({ challengeDone: !e.challengeDone })} label="DONE" labelStyle={st.doneLabel} />
          </View>
          <Text style={st.challenge}>{c.challenge}</Text>
          <Field label={DAILY.challengeNotes} value={e.challengeNotes} onChange={(v) => set({ challengeNotes: v })} lines={2} inputStyle={{ borderBottomColor: C.black }} style={{ marginTop: 10 }} />
        </YBox>

        <SecTag title="Habits" style={st.sec} />
        <Label>{DAILY.nnLabel}</Label>
        {[0, 1, 2].map((i) => {
          const h = data.day0.nn[i];
          return (
            <View key={i} style={st.nnRow}>
              <MarkBox mark={e.nn[i]} onChange={(m) => setNN(i, m)} />
              <View style={{ flex: 1 }}>
                <Text style={st.nnName}>{h.habit || `Non-negotiable ${i + 1}`}</Text>
                {h.min ? <Text style={st.nnMin}>2-min: {h.min}</Text> : null}
              </View>
            </View>
          );
        })}
        <Mono style={st.legend}>Tap once ✓ done · twice ½ 2-minute version</Mono>
        <View style={{ gap: 12, marginTop: 10 }}>
          {DAILY.fixedHabits.map((h, i) => (
            <Check key={h} checked={e.fixed[i]} onToggle={() => toggleFixed(i)} label={h} />
          ))}
        </View>

        <SecTag title="Score" style={st.sec} />
        <Label>{DAILY.scoreLabel}</Label>
        <View style={{ marginTop: 6 }}><ScoreRow value={e.score} onChange={(v) => set({ score: v })} /></View>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
          <Field style={{ flex: 1 }} label={DAILY.woke} value={e.woke} onChange={(v) => set({ woke: v })} placeholder="6:30" keyboardType="numbers-and-punctuation" />
          <Field style={{ flex: 1 }} label={DAILY.screen} value={e.screen} onChange={(v) => set({ screen: v })} placeholder="2h 15m" />
        </View>

        <SecTag title="Focus blocks" style={st.sec} />
        <View style={st.table}>
          <View style={st.thead}>
            <Mono style={st.th}>#</Mono>
            <Mono style={[st.th, { flex: 1 }]}>{DAILY.startEnd} · Task</Mono>
            <Mono style={st.th}>Done</Mono>
          </View>
          {e.focus.map((f, i) => (
            <View key={i} style={[st.frow, i < 3 && { borderBottomWidth: 1, borderBottomColor: C.black }]}>
              <Text style={st.fnum}>{i + 1}</Text>
              <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Field value={f.start} onChange={(v) => setFocus(i, { start: v })} placeholder="--:--" style={{ width: 70 }} inputStyle={st.timeIn} keyboardType="numbers-and-punctuation" maxLength={8} />
                  <Text style={st.dash}>–</Text>
                  <Field value={f.end} onChange={(v) => setFocus(i, { end: v })} placeholder="--:--" style={{ width: 70 }} inputStyle={st.timeIn} keyboardType="numbers-and-punctuation" maxLength={8} />
                </View>
                <Field value={f.task} onChange={(v) => setFocus(i, { task: v })} placeholder={DAILY.focusTask} />
              </View>
              <View style={st.fdone}><Check checked={f.done} onToggle={() => setFocus(i, { done: !f.done })} /></View>
            </View>
          ))}
        </View>

        <View style={st.hard}>
          <View style={st.hardLabel}><Display style={{ color: C.yellow, fontSize: 18 }}>{DAILY.hardThing}</Display></View>
          <View style={{ flex: 1, paddingHorizontal: 10, justifyContent: 'center' }}>
            <Field value={e.hard} onChange={(v) => set({ hard: v })} placeholder="The task you'd most like to avoid" inputStyle={{ borderBottomWidth: 0 }} />
          </View>
          <View style={{ justifyContent: 'center', paddingRight: 10 }}>
            <Check checked={e.hardDone} onToggle={() => set({ hardDone: !e.hardDone })} />
          </View>
        </View>

        <SecTag title="Evening reflection" style={st.sec} />
        {DAILY.reflection.map((q, i) => (
          <Field key={q} label={q} value={e.reflection[i]} onChange={(v) => setRef(i, v)} lines={2} style={{ marginBottom: 14 }} />
        ))}

        <View style={st.foot}>
          <Mono style={st.footText}>Day {pad2(n)} / {c.title}</Mono>
          <Mono style={st.footText}>Autosaved on this phone</Mono>
        </View>
      </View>
    </Page>
  );
}

function NavBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={[st.navBtn, disabled && { opacity: 0.3 }]}>
      <Text style={st.navText}>{label}</Text>
    </Pressable>
  );
}

export function Banner({ title, text, cta, onPress }: { title: string; text: string; cta?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={st.banner}>
      <Display style={{ color: C.yellow, fontSize: 22 }}>{title}</Display>
      <Body style={{ color: C.white, fontSize: 14, lineHeight: 20, marginTop: 4 }}>{text}</Body>
      {cta ? <Mono style={{ color: C.yellow, marginTop: 8 }}>{cta} →</Mono> : null}
    </Pressable>
  );
}

const st = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 18 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  dateText: { fontFamily: F.semi, color: C.white, fontSize: 14, flex: 1, borderBottomWidth: 1.5, borderBottomColor: C.white, paddingBottom: 3 },
  nav: { flexDirection: 'row', gap: 8 },
  navBtn: { width: 36, height: 30, borderWidth: 1.5, borderColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  navText: { color: C.yellow, fontSize: 22, lineHeight: 24, fontFamily: F.bold },
  quote: { borderLeftWidth: 6, paddingLeft: 12, paddingVertical: 2, marginTop: 14 },
  quoteText: { fontFamily: F.bodyItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 23, color: C.black },
  quoteSrc: { color: '#555', fontSize: 10, marginTop: 6 },
  lineText: { fontFamily: F.heavy, fontSize: 17, lineHeight: 23, color: C.black },
  challenge: { fontFamily: F.bold, fontSize: 16, lineHeight: 22, marginTop: 8, color: C.black },
  doneLabel: { fontFamily: F.heavy, fontSize: 13 },
  sec: { marginTop: 26 },
  nnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  nnName: { fontFamily: F.semi, fontSize: 16, color: C.black },
  nnMin: { fontFamily: F.body, fontSize: 13, color: '#666', marginTop: 2 },
  legend: { color: '#888', fontSize: 9.5, marginTop: 8 },
  table: { borderWidth: 1.5, borderColor: C.black },
  thead: { flexDirection: 'row', backgroundColor: C.black, paddingVertical: 5, paddingHorizontal: 8, gap: 10 },
  th: { color: C.white, fontSize: 9.5 },
  frow: { flexDirection: 'row', alignItems: 'stretch' },
  fnum: { width: 30, textAlign: 'center', textAlignVertical: 'center', fontFamily: F.monoBold, fontSize: 13, borderRightWidth: 1, borderRightColor: C.black, paddingTop: 18 },
  fdone: { width: 52, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: C.black },
  timeIn: { fontFamily: F.mono, fontSize: 14, textAlign: 'center' },
  dash: { fontFamily: F.mono, color: '#888' },
  hard: { flexDirection: 'row', borderWidth: 2.5, borderColor: C.black, marginTop: 22, minHeight: 52 },
  hardLabel: { backgroundColor: C.black, paddingHorizontal: 10, justifyContent: 'center', width: 96 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 10 },
  footText: { color: '#888', fontSize: 9, flexShrink: 1 },
  banner: { backgroundColor: C.black, padding: 14, marginBottom: 18, borderLeftWidth: 6, borderLeftColor: C.yellow },
});
