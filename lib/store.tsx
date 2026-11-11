import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState as RNAppState } from 'react-native';
import { dayNumberOn, todayISO } from './dates';
import { emptyDay, emptyReview, hydrate, initialData } from './defaults';
import type { AppData, Day0, DayEntry, FinalReview, NextPlan, Settings, WeekReview } from './types';

const KEY = 'discipline-reset:v1';

type Ctx = {
  ready: boolean;
  data: AppData;
  today: string;
  /** Current reset day (1..30), clamped. 0 when the start date is in the future. */
  currentDay: number;
  /** Raw day number (can exceed 30 when the reset is over). */
  rawDay: number;
  setDay0: (p: Partial<Day0>) => void;
  completeOnboarding: () => void;
  setDay: (n: number, p: Partial<DayEntry>) => void;
  setReview: (w: number, p: Partial<WeekReview>) => void;
  setGraph: (p: Partial<AppData['graph']>) => void;
  setFinal: (p: Partial<FinalReview>) => void;
  setNext: (p: Partial<NextPlan>) => void;
  setSettings: (p: Partial<Settings>) => void;
  resetAll: () => Promise<void>;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(initialData);
  const [today, setToday] = useState(todayISO());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(data);
  latest.current = data;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((s) => { if (s) setData(hydrate(JSON.parse(s))); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const flush = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    AsyncStorage.setItem(KEY, JSON.stringify(latest.current)).catch(() => {});
  }, []);

  // Autosave (debounced) whenever data changes.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 350);
  }, [data, ready, flush]);

  // Keep "today" fresh: on foreground and once a minute (handles midnight rollover).
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') setToday(todayISO());
      else flush();
    });
    const t = setInterval(() => setToday(todayISO()), 60000);
    return () => { sub.remove(); clearInterval(t); };
  }, [flush]);

  const value = useMemo<Ctx>(() => {
    const rawDay = dayNumberOn(data.day0.startDate, today);
    const currentDay = rawDay < 1 ? 0 : Math.min(30, rawDay);
    return {
      ready, data, today, rawDay, currentDay,
      setDay0: (p) => setData((d) => ({ ...d, day0: { ...d.day0, ...p } })),
      completeOnboarding: () => setData((d) => ({ ...d, onboarded: true })),
      setDay: (n, p) => setData((d) => ({
        ...d,
        days: { ...d.days, [String(n)]: { ...(d.days[String(n)] ?? emptyDay()), ...p, updatedAt: Date.now() } },
      })),
      setReview: (w, p) => setData((d) => ({
        ...d, reviews: { ...d.reviews, [String(w)]: { ...(d.reviews[String(w)] ?? emptyReview()), ...p } },
      })),
      setGraph: (p) => setData((d) => ({ ...d, graph: { ...d.graph, ...p } })),
      setFinal: (p) => setData((d) => ({ ...d, final: { ...d.final, ...p } })),
      setNext: (p) => setData((d) => ({ ...d, next: { ...d.next, ...p } })),
      setSettings: (p) => setData((d) => ({ ...d, settings: { ...d.settings, ...p } })),
      resetAll: async () => {
        await AsyncStorage.removeItem(KEY);
        setData(initialData());
      },
    };
  }, [data, ready, today]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore must be used inside StoreProvider');
  return c;
}

export function useDay(n: number): DayEntry {
  const { data } = useStore();
  return data.days[String(n)] ?? emptyDay();
}
