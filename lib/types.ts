export type Mark = 'done' | 'min' | null;
export type Tuple3<T> = [T, T, T];

export interface FocusBlock { start: string; end: string; task: string; done: boolean }

export interface DayEntry {
  nn: Tuple3<Mark>;
  fixed: Tuple3<boolean>; // No phone first 30 min, Moved my body, Planned tomorrow
  challengeDone: boolean;
  challengeNotes: string;
  score: number | null;
  woke: string;
  screen: string;
  focus: FocusBlock[];
  hard: string;
  hardDone: boolean;
  reflection: Tuple3<string>;
  updatedAt: number;
}

export interface NonNegotiable { habit: string; when: string; min: string }
export interface IfThen { if: string; then: string }

export interface Day0 {
  why: [string, string, string, string];
  name: string;
  signature: string;
  startDate: string;
  nn: Tuple3<NonNegotiable>;
  protect: string;
  cutting: string;
  obstacles: string;
  ifThen: IfThen[];
  accountable: string;
  baseline: (number | null)[];
  wake: string;
  screen: string;
  strength: string;
  weakness: string;
  quit: string;
}

export interface WeekReview {
  nnNotes: Tuple3<string>;
  win: string; slip: string; pattern: string;
  keep: string; cut: string; adjust: string;
  focus: string; promise: string;
}

export interface FinalReview {
  scores: (number | null)[];
  changed: string; hardest: string; proved: string; tell: string; lesson: string;
}

export interface NextPlan {
  keep: string; level: string; add: string;
  work: string; training: string; study: string;
  standards: string; first: string; nextStart: string; signature: string;
}

export interface Settings {
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  reminderIds: string[];
}

export interface AppData {
  version: 1;
  onboarded: boolean;
  day0: Day0;
  days: Record<string, DayEntry>; // key = day number "1".."30"
  reviews: Record<string, WeekReview>; // key = week "1".."4"
  graph: { lowest: string; best: string };
  final: FinalReview;
  next: NextPlan;
  settings: Settings;
}
