import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Disclaimer, QuoteCredits } from '@/components/Intro';
import { Body, Btn, DarkHeader, Display, Mono, Page, SecTag } from '@/components/ui';
import { AUTHOR, BOOK_TITLE, CREDITS } from '@/data/content';
import { exportBackup } from '@/lib/backup';
import { confirm, notify } from '@/lib/confirm';
import { formatTime, prettyDate } from '@/lib/dates';
import { cancelReminders, remindersSupported, scheduleDailyReminder } from '@/lib/notifications';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

export default function SettingsScreen() {
  const { data, setSettings, resetAll, currentDay } = useStore();
  const s = data.settings;
  const [busy, setBusy] = useState(false);

  const apply = async (enabled: boolean, hour: number, minute: number) => {
    setSettings({ reminderEnabled: enabled, reminderHour: hour, reminderMinute: minute });
    if (!remindersSupported) return;
    try {
      setBusy(true);
      if (enabled) {
        const id = await scheduleDailyReminder(hour, minute);
        setSettings({ reminderIds: [id] });
      } else {
        await cancelReminders();
        setSettings({ reminderIds: [] });
      }
    } catch (e) {
      setSettings({ reminderEnabled: false });
      notify('Reminder not set', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const shift = (mins: number) => {
    let t = (s.reminderHour * 60 + s.reminderMinute + mins + 1440) % 1440;
    t = Math.round(t / 15) * 15 % 1440;
    apply(s.reminderEnabled, Math.floor(t / 60), t % 60);
  };

  const onReset = async () => {
    const ok = await confirm('Reset all progress?', 'This permanently deletes your Day 0 setup, all 30 daily pages, reviews and settings on this phone. Export a backup first if you want to keep it.', 'Delete everything', true);
    if (!ok) return;
    await cancelReminders().catch(() => {});
    await resetAll();
  };

  return (
    <Page>
      <DarkHeader kicker={`Day ${currentDay} of 30 · started ${prettyDate(data.day0.startDate)}`} title="Settings & about" />
      <View style={st.body}>
        <SecTag title="Daily reminder" />
        <View style={st.row}>
          <View style={{ flex: 1 }}>
            <Text style={st.rowTitle}>Remind me every day</Text>
            <Text style={st.rowSub}>{remindersSupported ? 'A local notification from this phone. No account, no internet needed.' : 'Reminders work in the iPhone / Android app, not in a web browser.'}</Text>
          </View>
          <Switch value={s.reminderEnabled} disabled={busy} onValueChange={(v) => apply(v, s.reminderHour, s.reminderMinute)}
            trackColor={{ true: C.black, false: '#ccc' }} thumbColor={s.reminderEnabled ? C.yellow : '#fff'} {...({ activeThumbColor: C.yellow } as object)} />
        </View>
        <View style={st.timeRow}>
          <Pressable onPress={() => shift(-15)} style={st.step} accessibilityLabel="15 minutes earlier"><Text style={st.stepText}>−</Text></Pressable>
          <View style={st.timeBox}>
            <Mono style={{ fontSize: 9.5, color: '#888' }}>Time</Mono>
            <Display style={{ fontSize: 34 }}>{formatTime(s.reminderHour, s.reminderMinute)}</Display>
          </View>
          <Pressable onPress={() => shift(15)} style={st.step} accessibilityLabel="15 minutes later"><Text style={st.stepText}>+</Text></Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[[6, 0], [7, 0], [12, 0], [20, 0]].map(([h, m]) => (
            <Pressable key={h} onPress={() => apply(s.reminderEnabled, h, m)} style={[st.chip, s.reminderHour === h && s.reminderMinute === m && st.chipOn]}>
              <Mono style={[{ fontSize: 10 }, s.reminderHour === h && s.reminderMinute === m && { color: C.yellow }]}>{formatTime(h, m)}</Mono>
            </Pressable>
          ))}
        </View>

        <SecTag title="Your setup" style={st.sec} />
        <Btn kind="outline" title="Edit Day 0 setup" onPress={() => router.push('/edit-setup')} />
        <Btn kind="outline" title="Read this first & the 5 rules" onPress={() => router.push('/about')} style={{ marginTop: 10 }} />

        <SecTag title="Your data" style={st.sec} />
        <Body style={st.note}>Everything you write stays on this phone. There's no account and no server. Export a backup to keep a copy in Files, Drive, email or notes.</Body>
        <Btn kind="black" title="Export backup (JSON)" onPress={() => exportBackup(data).catch((e) => notify('Export failed', String(e)))} />
        <Btn kind="outline" title="Reset all progress" onPress={onReset} style={{ marginTop: 10, borderColor: '#c00' }} />

        <SecTag title="About" style={st.sec} />
        <View style={st.about}>
          <Display style={{ color: C.yellow, fontSize: 30 }}>Discipline Reset</Display>
          <Mono style={{ color: C.white, marginTop: 6 }}>The {BOOK_TITLE} app</Mono>
          <Mono style={{ color: C.white, marginTop: 14 }}>By {AUTHOR}</Mono>
          <Mono style={{ color: '#888', marginTop: 4 }}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Mono>
        </View>
        <View style={{ marginTop: 16, gap: 14 }}>
          <QuoteCredits />
          <Disclaimer />
          <Text style={st.copy}>{CREDITS.copyright}</Text>
        </View>
      </View>
    </Page>
  );
}

const st = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 22 },
  sec: { marginTop: 30 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontFamily: F.bold, fontSize: 16, color: C.black },
  rowSub: { fontFamily: F.body, fontSize: 13, color: '#666', marginTop: 2, lineHeight: 18 },
  timeRow: { flexDirection: 'row', alignItems: 'stretch', marginTop: 14, gap: 8 },
  step: { width: 56, borderWidth: 2.5, borderColor: C.black, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: F.heavy, fontSize: 26, color: C.black },
  timeBox: { flex: 1, borderWidth: 2.5, borderColor: C.black, alignItems: 'center', paddingVertical: 6, backgroundColor: C.yellow },
  chip: { flex: 1, borderWidth: 1.5, borderColor: C.black, paddingVertical: 8, alignItems: 'center' },
  chipOn: { backgroundColor: C.black },
  note: { fontSize: 14, lineHeight: 20, color: '#444', marginBottom: 12 },
  about: { backgroundColor: C.black, padding: 18, borderLeftWidth: 8, borderLeftColor: C.yellow },
  copy: { fontFamily: F.body, fontSize: 13, color: '#444' },
});
