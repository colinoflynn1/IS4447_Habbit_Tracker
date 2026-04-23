import { HabitLog } from '@/app/_layout';

// Counts consecutive days a habit was completed, ending today or yesterday.
// A boolean habit counts as completed if value > 0.
// A count habit counts as completed if value > 0 (any progress that day).
// I include yesterday in the start so the streak does not break before midnight.
export function calculateStreak(logs: HabitLog[], habitId: number): number {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId && l.value > 0)
    .map((l) => l.date);

  if (habitLogs.length === 0) return 0;

  // Use a Set for fast lookups
  const dateSet = new Set(habitLogs);

  // Start from today or yesterday (whichever is the latest log).
  // This stops a one-day gap (today not yet logged) from breaking the streak.
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let cursor: Date;
  if (dateSet.has(todayStr)) {
    cursor = today;
  } else if (dateSet.has(yesterdayStr)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (dateSet.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
