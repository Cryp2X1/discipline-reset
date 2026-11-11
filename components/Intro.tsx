import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CREDITS, INTRO, RULES, STEPS } from '@/data/content';
import { C, F, pad2 } from '@/lib/theme';
import { Body, Display, Mono, Rich } from './ui';

export function ReadThisFirst() {
  return (
    <View>
      <Mono>{INTRO.kicker}</Mono>
      <Display style={st.big}>Motivation{'\n'}fades.</Display>
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <View style={{ backgroundColor: C.yellow, paddingHorizontal: 8, paddingTop: 4 }}>
          <Display style={st.big}>Discipline</Display>
        </View>
      </View>
      <Display style={st.big}>stays.</Display>
      <View style={{ width: 70, height: 6, backgroundColor: C.black, marginVertical: 20 }} />
      {INTRO.paragraphs.map((p) => <Body key={p} style={st.p}>{p}</Body>)}
      <Body style={[st.p, { fontFamily: F.bold }]}>{INTRO.closing}</Body>
    </View>
  );
}

export function HowItWorks() {
  return (
    <View>
      <Mono>How it works</Mono>
      <Display style={{ fontSize: 38, lineHeight: 40, marginTop: 8, marginBottom: 16 }}>How to use{'\n'}this workbook</Display>
      {STEPS.map((s, i) => (
        <View key={s.title} style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
          <Display style={{ fontSize: 30, width: 44, lineHeight: 34 }}>{pad2(i + 1)}</Display>
          <View style={{ flex: 1 }}>
            <Text style={st.stepTitle}>{s.title}</Text>
            <Rich text={s.body} style={{ fontSize: 15, lineHeight: 21, color: '#222' }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function FiveRules() {
  return (
    <View style={{ backgroundColor: C.black, padding: 18 }}>
      <Mono style={{ color: C.yellow, marginBottom: 8 }}>The 5 rules of the reset</Mono>
      {RULES.map((r, i) => (
        <View key={r} style={{ flexDirection: 'row', gap: 12, alignItems: 'baseline', marginVertical: 5 }}>
          <Display style={{ color: C.yellow, fontSize: 22 }}>{i + 1}</Display>
          <Text style={{ fontFamily: F.bold, color: C.white, fontSize: 16, flex: 1 }}>{r}</Text>
        </View>
      ))}
    </View>
  );
}

export function Disclaimer({ full = true }: { full?: boolean }) {
  return (
    <View style={{ borderTopWidth: 2, borderTopColor: C.black, paddingTop: 10 }}>
      <Text style={st.small}><Text style={{ fontFamily: F.bold }}>Not professional advice. </Text>{full ? CREDITS.disclaimer : CREDITS.disclaimerShort}</Text>
    </View>
  );
}

export function QuoteCredits() {
  return (
    <View>
      <Rich text={`**About the quotes.** ${CREDITS.quotes}`} style={st.small} />
    </View>
  );
}

const st = StyleSheet.create({
  big: { fontSize: 58, lineHeight: 62 },
  p: { marginBottom: 12, fontSize: 16, lineHeight: 24 },
  stepTitle: { fontFamily: F.heavy, fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.3, color: C.black, marginBottom: 2 },
  small: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: '#444' },
});
