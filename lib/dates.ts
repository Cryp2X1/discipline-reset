// Local-calendar date helpers. Dates are stored as 'YYYY-MM-DD' strings (device local time).
import { pad2 } from './theme';

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export function addDays(s: string, n: number): string {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}
export function todayISO(): string {
  return toISODate(new Date());
}
/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86400000);
}
/** Day number of the reset for a given date (1 = start date). Can be < 1 (not started) or > 30. */
export function dayNumberOn(startDate: string, date: string = todayISO()): number {
  return daysBetween(startDate, date) + 1;
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function prettyDate(s: string): string {
  const d = parseISODate(s);
  return `${WD[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
export function shortDate(s: string): string {
  const d = parseISODate(s);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
export function formatTime(h: number, m: number): string {
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${pad2(m)} ${ap}`;
}
