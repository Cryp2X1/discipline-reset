import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import DayView from '@/components/DayView';
import { Body, Btn, DarkHeader, Page } from '@/components/ui';
import { DAYS } from '@/data/content';
import { useStore } from '@/lib/store';
import { pad2 } from '@/lib/theme';

export default function DayScreen() {
  const { n: raw } = useLocalSearchParams<{ n: string }>();
  const { currentDay } = useStore();
  const n = Math.max(1, Math.min(30, parseInt(String(raw), 10) || 1));
  if (n > currentDay) {
    return (
      <Page>
        <DarkHeader big={`DAY ${pad2(n)}`} kicker="Locked" title={DAYS[n - 1].title} topInset={false} />
        <View style={{ padding: 20 }}>
          <Body>This page unlocks on day {n} of your reset. One day at a time — today's work is the only work that counts.</Body>
          <Btn title="Go to today" onPress={() => router.replace('/today')} style={{ marginTop: 20 }} />
        </View>
      </Page>
    );
  }
  return <DayView n={n} showNav topInset={false} />;
}
