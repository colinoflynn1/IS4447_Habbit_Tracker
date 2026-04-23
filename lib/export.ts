import { Category, Habit, HabitLog } from '@/app/_layout';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Wrap a value in quotes if it contains a comma, quote or newline.
function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportLogsToCsv(
  logs: HabitLog[],
  habits: Habit[],
  categories: Category[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (logs.length === 0) {
      return { ok: false, error: 'You have no logs to export yet.' };
    }

    // Build the CSV. Header row first then one row per log.
    const header = ['Date', 'Habit', 'Category', 'Value', 'Unit', 'Notes'];
    const rows = logs
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((log) => {
        const habit = habits.find((h) => h.id === log.habitId);
        const category = habit
          ? categories.find((c) => c.id === habit.categoryId)
          : undefined;
        return [
          csvEscape(log.date),
          csvEscape(habit?.name ?? 'Unknown'),
          csvEscape(category?.name ?? ''),
          csvEscape(log.value),
          csvEscape(habit?.unit ?? ''),
          csvEscape(log.notes ?? ''),
        ].join(',');
      });

    const csv = [header.join(','), ...rows].join('\n');
    const filename = `habit-logs-${new Date().toISOString().slice(0, 10)}.csv`;

    // expo-file-system v19 exposes File and Paths. Older versions used
    // writeAsStringAsync with documentDirectory. I try the new API first
    // and fall back to the old one if it is not available.
    const fs: any = FileSystem;
    let filePath: string;

    if (fs.File && fs.Paths?.document) {
      const file = new fs.File(fs.Paths.document, filename);
      file.create();
      file.write(csv);
      filePath = file.uri;
    } else if (fs.writeAsStringAsync && fs.documentDirectory) {
      filePath = fs.documentDirectory + filename;
      await fs.writeAsStringAsync(filePath, csv);
    } else {
      return {
        ok: false,
        error: 'File system is not available on this device.',
      };
    }

    // Open the share sheet so the user can save it or send it on.
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export habit logs',
      });
    }

    return { ok: true };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: 'Could not export. Make sure your device allows file sharing.',
    };
  }
}
