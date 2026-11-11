import { todayISO } from './dates';
import type { AppData, DayEntry, WeekReview } from './types';

export const emptyDay = (): DayEntry => ({
  nn: [null, null, null],
  fixed: [false, false, false],
  challengeDone: false,
  challengeNotes: '',
  score: null,
  woke: '',
  screen: '',
  focus: [0, 1, 2, 3].map(() => ({ start: '', end: '', task: '', done: false })),
  hard: '',
  hardDone: false,
  reflection: ['', '', ''],
  updatedAt: 0,
});

export const emptyReview = (): WeekReview => ({
  nnNotes: ['', '', ''], win: '', slip: '', pattern: '', keep: '', cut: '', adjust: '', focus: '', promise: '',
});

export const initialData = (): AppData => ({
  version: 1,
  onboarded: false,
  day0: {
    why: ['', '', '', ''],
    name: '',
    signature: '',
    startDate: todayISO(),
    nn: [0, 1, 2].map(() => ({ habit: '', when: '', min: '' })) as AppData['day0']['nn'],
    protect: '',
    cutting: '',
    obstacles: '',
    ifThen: [0, 1, 2, 3, 4, 5].map(() => ({ if: '', then: '' })),
    accountable: '',
    baseline: Array(10).fill(null),
    wake: '',
    screen: '',
    strength: '',
    weakness: '',
    quit: '',
  },
  days: {},
  reviews: {},
  graph: { lowest: '', best: '' },
  final: { scores: Array(10).fill(null), changed: '', hardest: '', proved: '', tell: '', lesson: '' },
  next: { keep: '', level: '', add: '', work: '', training: '', study: '', standards: '', first: '', nextStart: '', signature: '' },
  settings: { reminderEnabled: false, reminderHour: 7, reminderMinute: 0, reminderIds: [] },
});

/** Merge stored data over defaults so older/partial saves never crash the app. */
export function hydrate(raw: unknown): AppData {
  const base = initialData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppData>;
  const days: AppData['days'] = {};
  for (const [k, v] of Object.entries(r.days ?? {})) days[k] = { ...emptyDay(), ...v };
  const reviews: AppData['reviews'] = {};
  for (const [k, v] of Object.entries(r.reviews ?? {})) reviews[k] = { ...emptyReview(), ...v };
  return {
    ...base,
    onboarded: !!r.onboarded,
    day0: { ...base.day0, ...(r.day0 ?? {}) },
    days,
    reviews,
    graph: { ...base.graph, ...(r.graph ?? {}) },
    final: { ...base.final, ...(r.final ?? {}) },
    next: { ...base.next, ...(r.next ?? {}) },
    settings: { ...base.settings, ...(r.settings ?? {}) },
  };
}
