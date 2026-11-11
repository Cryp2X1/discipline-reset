import { emptyDay } from './defaults';
import type { AppData, DayEntry } from './types';

export type DayStatus = 'done' | 'partial' | 'missed' | 'today' | 'locked';

export function hasActivity(e: DayEntry | undefined): boolean {
  if (!e) return false;
  return (
    e.nn.some(Boolean) || e.fixed.some(Boolean) || e.challengeDone || !!e.challengeNotes || e.score != null ||
    !!e.woke || !!e.screen || e.focus.some((f) => f.done || !!f.task) || !!e.hard || e.hardDone ||
    e.reflection.some(Boolean)
  );
}

/** A day is "done" when all 3 non-negotiables are checked (the 2-minute minimum counts). */
export function isDone(e: DayEntry | undefined): boolean {
  return !!e && e.nn.every((m) => m === 'done' || m === 'min');
}

export function dayStatus(data: AppData, n: number, currentDay: number): DayStatus {
  if (n > currentDay) return 'locked';
  const e = data.days[String(n)];
  if (isDone(e)) return 'done';
  if (n === currentDay) return hasActivity(e) ? 'partial' : 'today';
  return hasActivity(e) ? 'partial' : 'missed';
}

export function entry(data: AppData, n: number): DayEntry {
  return data.days[String(n)] ?? emptyDay();
}

/** Current streak of done days, ending today (or yesterday if today isn't done yet). */
export function currentStreak(data: AppData, currentDay: number): number {
  let d = currentDay;
  if (!isDone(data.days[String(d)])) d -= 1;
  let s = 0;
  while (d >= 1 && isDone(data.days[String(d)])) { s++; d--; }
  return s;
}

export function longestStreak(data: AppData, upTo: number): number {
  let best = 0, run = 0;
  for (let d = 1; d <= Math.min(30, upTo); d++) {
    if (isDone(data.days[String(d)])) { run++; best = Math.max(best, run); } else run = 0;
  }
  return best;
}

export function daysCompleted(data: AppData, upTo: number): number {
  let c = 0;
  for (let d = 1; d <= Math.min(30, upTo); d++) if (isDone(data.days[String(d)])) c++;
  return c;
}

/** Count of times a day was missed right after another missed day (past days only). */
export function missedTwice(data: AppData, currentDay: number): number {
  let c = 0;
  for (let d = 2; d < currentDay; d++) {
    if (!isDone(data.days[String(d)]) && !isDone(data.days[String(d - 1)])) c++;
  }
  return c;
}

export function totalChecks(data: AppData, upTo: number): number {
  let c = 0;
  for (let d = 1; d <= Math.min(30, upTo); d++) {
    const e = data.days[String(d)];
    if (!e) continue;
    c += e.nn.filter((m) => m === 'done').length + e.fixed.filter(Boolean).length +
      (e.focus.some((f) => f.done) ? 1 : 0) + (e.hardDone ? 1 : 0);
  }
  return c;
}

export function averageScore(data: AppData, from: number, to: number): number | null {
  const s: number[] = [];
  for (let d = from; d <= to; d++) { const v = data.days[String(d)]?.score; if (v != null) s.push(v); }
  if (!s.length) return null;
  return Math.round((s.reduce((a, b) => a + b, 0) / s.length) * 10) / 10;
}

export function focusBlocksDone(data: AppData, from: number, to: number): number {
  let c = 0;
  for (let d = from; d <= to; d++) c += data.days[String(d)]?.focus.filter((f) => f.done).length ?? 0;
  return c;
}

export function nnDaysDone(data: AppData, i: number, from: number, to: number): number {
  let c = 0;
  for (let d = from; d <= to; d++) { const m = data.days[String(d)]?.nn[i]; if (m === 'done' || m === 'min') c++; }
  return c;
}

export const weekOf = (d: number): 1 | 2 | 3 | 4 => (d <= 7 ? 1 : d <= 14 ? 2 : d <= 21 ? 3 : 4);
