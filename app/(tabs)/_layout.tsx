import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon } from '@/components/TabIcon';
import { C, F } from '@/lib/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.yellow,
        tabBarInactiveTintColor: '#8a8a8a',
        tabBarStyle: { backgroundColor: C.black, borderTopColor: C.yellow, borderTopWidth: 3, height: 66 + insets.bottom, paddingTop: 6, paddingBottom: insets.bottom + 8 },
        tabBarLabelStyle: { fontFamily: F.monoBold, fontSize: 10, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
        sceneStyle: { backgroundColor: C.white },
      }}>
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: ({ color }) => <TabIcon name="today" color={String(color)} /> }} />
      <Tabs.Screen name="journey" options={{ title: 'Journey', tabBarIcon: ({ color }) => <TabIcon name="journey" color={String(color)} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color }) => <TabIcon name="progress" color={String(color)} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <TabIcon name="settings" color={String(color)} /> }} />
    </Tabs>
  );
}
