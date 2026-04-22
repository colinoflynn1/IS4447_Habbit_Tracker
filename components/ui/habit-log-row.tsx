import { db } from '@/db/client';
import { habitLogs as habitLogsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { and, eq } from 'drizzle-orm';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Category, Habit, HabitLog } from '@/app/_layout';

type Props = {
  habit: Habit;
  category: Category | undefined;
  todaysLog: HabitLog | undefined;
  userId: number;
  today: string;
  onChange: () => Promise<void>;
};

// Shows one habit as a row for the Today screen.
// Boolean habits get a tick/untick button.
// Count habits get minus and plus buttons that write to the database.
export default function HabitLogRow({
  habit,
  category,
  todaysLog,
  userId,
  today,
  onChange,
}: Props) {
  const value = todaysLog?.value ?? 0;
  const isBoolean = habit.metricType === 'boolean';
  const isDone = isBoolean && value > 0;

  // Save the log for today. If one already exists for this habit I update it,
  // otherwise I insert a new row.
  const saveValue = async (newValue: number) => {
    if (todaysLog) {
      if (newValue <= 0 && isBoolean) {
        // For boolean habits, unticking just deletes the log.
        await db
          .delete(habitLogsTable)
          .where(eq(habitLogsTable.id, todaysLog.id));
      } else if (newValue <= 0 && !isBoolean) {
        // For count habits, going below zero also deletes the log.
        await db
          .delete(habitLogsTable)
          .where(eq(habitLogsTable.id, todaysLog.id));
      } else {
        await db
          .update(habitLogsTable)
          .set({ value: newValue })
          .where(eq(habitLogsTable.id, todaysLog.id));
      }
    } else if (newValue > 0) {
      await db.insert(habitLogsTable).values({
        userId,
        habitId: habit.id,
        date: today,
        value: newValue,
        notes: null,
      });
    }
    await onChange();
  };

  const handleToggle = () => saveValue(isDone ? 0 : 1);
  const handleIncrement = () => saveValue(value + 1);
  const handleDecrement = () => saveValue(Math.max(0, value - 1));

  const color = category?.color ?? '#0F766E';

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Ionicons
          name={(category?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
          size={18}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{habit.name}</Text>
        <Text style={styles.sub}>
          {isBoolean
            ? isDone
              ? 'Done today'
              : 'Not logged yet'
            : value > 0
              ? `${value}${habit.unit ? ' ' + habit.unit : ''} today`
              : 'Not logged yet'}
        </Text>
      </View>

      {isBoolean ? (
        <Pressable
          accessibilityLabel={isDone ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
          accessibilityRole="button"
          onPress={handleToggle}
          style={[
            styles.tickButton,
            { backgroundColor: isDone ? color : 'transparent', borderColor: color },
          ]}
        >
          {isDone ? (
            <Ionicons name="checkmark" size={22} color="#FFFFFF" />
          ) : null}
        </Pressable>
      ) : (
        <View style={styles.counterGroup}>
          <Pressable
            accessibilityLabel={`Decrease ${habit.name}`}
            accessibilityRole="button"
            onPress={handleDecrement}
            style={[styles.counterButton, value <= 0 ? styles.counterDisabled : null]}
          >
            <Ionicons name="remove" size={18} color="#0F172A" />
          </Pressable>
          <Text style={styles.counterValue}>{value}</Text>
          <Pressable
            accessibilityLabel={`Increase ${habit.name}`}
            accessibilityRole="button"
            onPress={handleIncrement}
            style={[styles.counterButton, { backgroundColor: color, borderColor: color }]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  sub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  tickButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  counterGroup: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  counterButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  counterDisabled: {
    opacity: 0.4,
  },
  counterValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 34,
    textAlign: 'center',
  },
});
