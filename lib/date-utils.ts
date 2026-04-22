import { HabitLog } from '@/app/_layout';

// Returns YYYY-MM-DD for today.
export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// Returns the YYYY-MM-DD dates for the current week (Monday to Sunday).
export function currentWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // I want the week to start on Monday. In JavaScript Sunday is 0 and
  // Saturday is 6, so I adjust for that.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysFromMonday + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Returns the YYYY-MM-DD dates for the current calendar month.
export function currentMonthDates(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Returns the last N days as YYYY-MM-DD, oldest first.
export function lastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Sums the values of all logs for a habit within a list of dates.
export function sumHabitLogs(
  logs: HabitLog[],
  habitId: number,
  dates: string[]
): number {
  const set = new Set(dates);
  return logs
    .filter((l) => l.habitId === habitId && set.has(l.date))
    .reduce((total, l) => total + l.value, 0);
}

// Counts how many logs exist on a given date across all habits.
// Used for the "habits logged per day" chart.
export function countLogsByDate(logs: HabitLog[], date: string): number {
  return logs.filter((l) => l.date === date && l.value > 0).length;
}

// Short display label for a date e.g. "Mon" or "12 Apr".
export function shortDateLabel(date: string, mode: 'day' | 'date'): string {
  const d = new Date(date);
  if (mode === 'day') {
    return d.toLocaleDateString('en-GB', { weekday: 'short' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
