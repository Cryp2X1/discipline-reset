import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Disclaimer, FiveRules, HowItWorks, ReadThisFirst } from '@/components/Intro';
import { Btn, Display, Mono, Page } from '@/components/ui';
import { AUTHOR, COVER } from '@/data/content';
import { C, F } from '@/lib/theme';

export default function Welcome() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const w = Math.min(width, 520);
  const big = w * 0.27;
  const mid = w * 0.205;
  return (
    <Page dark>
      <View style={{ height: 12 + insets.top, backgroundColor: C.yellow }} />
      <View style={st.cover}>
        <View style={st.topRow}>
          <Mono style={{ color: C.yellow }}>{COVER.kicker}</Mono>
          <Mono style={{ color: C.white }}>Vol. 01</Mono>
        </View>
        <Display style={{ color: C.yellow, fontSize: big, lineHeight: big * 0.98, marginTop: 28 }}>30-DAY</Display>
        <Display style={{ color: C.white, fontSize: mid, lineHeight: mid * 1.02 }}>DISCIPLINE</Display>
        <Display style={{ color: C.white, fontSize: mid, lineHeight: mid * 1.02 }}>RESET</Display>
        <View style={{ width: 110, height: 8, backgroundColor: C.yellow, marginTop: 20, marginBottom: 18 }} />
        <Text style={st.tag}>{COVER.line1}{'\n'}<Text style={{ color: C.yellow }}>{COVER.line2}</Text></Text>
        <Text style={st.blurb}>{COVER.blurb}</Text>
        <View style={st.badges}>
          <View style={{ backgroundColor: C.yellow, paddingHorizontal: 12, paddingTop: 5, paddingBottom: 3 }}>
            <Display style={{ fontSize: 20 }}>{COVER.badge1}</Display>
          </View>
          <View style={{ borderWidth: 3, borderColor: C.white, paddingHorizontal: 10, paddingTop: 2, paddingBottom: 0 }}>
            <Display style={{ fontSize: 20, color: C.white }}>{COVER.badge2}</Display>
          </View>
        </View>
        <Mono style={{ color: C.white, marginTop: 24 }}>By {AUTHOR}</Mono>
        <Mono style={{ color: '#888', marginTop: 4 }}>{COVER.tagline}</Mono>
        <Btn title="Start Day 0 setup" onPress={() => router.push('/setup')} style={{ marginTop: 28 }} />
        <Text style={st.hint}>About 30 minutes. Everything stays on this phone. No account needed.</Text>
      </View>
      <View style={st.paper}>
        <ReadThisFirst />
        <View style={{ height: 28 }} />
        <HowItWorks />
        <View style={{ height: 10 }} />
        <FiveRules />
        <View style={{ height: 24 }} />
        <Disclaimer />
        <Btn title="I'm in. Start Day 0" kind="black" onPress={() => router.push('/setup')} style={{ marginTop: 24 }} />
      </View>
    </Page>
  );
}

const st = StyleSheet.create({
  cover: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 36 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tag: { fontFamily: F.bold, color: C.white, fontSize: 22, lineHeight: 28 },
  blurb: { fontFamily: F.body, color: '#bbb', fontSize: 14, lineHeight: 20, marginTop: 12 },
  badges: { flexDirection: 'row', gap: 10, marginTop: 24, alignItems: 'center' },
  hint: { fontFamily: F.body, color: '#999', fontSize: 13, textAlign: 'center', marginTop: 10 },
  paper: { backgroundColor: C.white, paddingHorizontal: 22, paddingTop: 30, paddingBottom: 40 },
});
