import React from 'react';
import { Text, View } from 'react-native';
import { Disclaimer, FiveRules, HowItWorks, QuoteCredits, ReadThisFirst } from '@/components/Intro';
import { Mono, Page } from '@/components/ui';
import { AUTHOR, CREDITS } from '@/data/content';
import { F } from '@/lib/theme';

export default function About() {
  return (
    <Page contentStyle={{ padding: 22 }}>
      <ReadThisFirst />
      <View style={{ height: 26 }} />
      <HowItWorks />
      <View style={{ height: 10 }} />
      <FiveRules />
      <View style={{ height: 24, }} />
      <View style={{ gap: 14 }}>
        <Disclaimer />
        <QuoteCredits />
        <Text style={{ fontFamily: F.body, fontSize: 13, color: '#444' }}>{CREDITS.copyright}</Text>
        <Mono>By {AUTHOR}</Mono>
      </View>
    </Page>
  );
}
