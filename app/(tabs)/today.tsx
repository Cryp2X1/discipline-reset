import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import DayView, { Banner } from '@/components/DayView';
import { Body, Btn, DarkHeader, Display, Page } from '@/components/ui';
import { WEEKS } from '@/data/content';
import { daysBetween, prettyDate } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { C } from '@/lib/theme';

export default function Today() {
  const { data, currentDay, rawDay, today } = useStore();

  if (currentDay === 0) {
    const n = daysBetween(today, data.day0.startDate);
    return (
      <Page>
        <DarkHeader big="DAY 00" kicker="Setup complete" title="The reset starts soon" />
        <View style={st.body}>
          <Display style={{ fontSize: 34 }}>{n === 1 ? 'Day 1 is tomorrow.' : `Day 1 starts in ${n} days.`}</Display>
          <Body style={{ marginTop: 10 }}>Your start date is {prettyDate(data.day0.startDate)}. Tonight, read your Day 0 page again and put your 3 non-negotiables where you'll see them in the morning.</Body>
          <View style={{ gap: 8, marginTop: 18 }}>
            {data.day0.nn.map((h, i) => (
              <View key={i} style={st.nn}><Display style={{ color: C.yellow, fontSize: 24, width: 26 }}>{i + 1}</Display><Body style={{ flex: 1, color: C.white }}>{h.habit}</Body></View>
            ))}
          </View>
          <Btn kind="outline" title="Review Day 0" onPress={() => router.push('/edit-setup')} style={{ marginTop: 22 }} />
        </View>
      </Page>
    );
  }

  let banner: React.ReactNode = null;
  if (rawDay > 30) {
    banner = <Banner title="Reset complete" text="Thirty days done. Finish your Day 30 review, compare it with Day 0, and plan your next 30." cta="Open the final review" onPress={() => router.push('/final')} />;
  } else if (currentDay === 30) {
    banner = <Banner title="Final day" text="Tonight, complete your Day 30 review and set the standard for your next 30 days." cta="Open the Day 30 review" onPress={() => router.push('/final')} />;
  } else if (currentDay % 7 === 0) {
    const w = currentDay / 7;
    banner = <Banner title={`Week ${w} review`} text={`End of week ${w} — ${WEEKS[w - 1].name}. Tonight, look for patterns, keep what's working, cut what isn't.`} cta="Open the weekly review" onPress={() => router.push(`/review/${w}`)} />;
  }
  return <DayView n={currentDay} banner={banner} />;
}

const st = StyleSheet.create({
  body: { padding: 20 },
  nn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.black, padding: 12, gap: 10 },
});
