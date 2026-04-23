import { db } from '@/db/client';
import { habitLogs as habitLogsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext, Category, Habit, HabitLog } from '@/app/_layout';

type Props = {
  habit: Habit;
  category: Category | undefined;
  todaysLog: HabitLog | undefined;
  userId: number;
  today: string;
  onChange: () => Promise<void>;
};

export default function HabitLogRow({
  habit,
  category,
  todaysLog,
  userId,
  today,
  onChange,
}: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;

  const value = todaysLog?.value ?? 0;
  const isBoolean = habit.metricType === 'boolean';
  const isDone = isBoolean && value > 0;

  // Save the log for today. If one already exists for this habit I update it,
  // otherwise I insert a new row.
  const saveValue = async (newValue: number) => {
    if (todaysLog) {
      if (newValue <= 0) {
        await db.delete(habitLogsTable).where(eq(habitLogsTable.id, todaysLog.id));
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

  const color = category?.color ?? theme?.primary ?? '#0F766E';

  return (
    <View style={[styles.row, { backgroundColor: theme?.surface ?? '#FFFFFF', borderColor: theme?.border ?? '#E5E7EB' }]}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Ionicons
          name={(category?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
          size={18}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme?.text ?? '#0F172A' }]}>{habit.name}</Text>
        <Text style={[styles.sub, { color: theme?.textMuted ?? '#64748B' }]}>
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
          {isDone ? <Ionicons name="checkmark" size={22} color="#FFFFFF" /> : null}
        </Pressable>
      ) : (
        <View style={styles.counterGroup}>
          <Pressable
            accessibilityLabel={`Decrease ${habit.name}`}
            accessibilityRole="button"
            onPress={handleDecrement}
            style={[
              styles.counterButton,
              {
                backgroundColor: theme?.surface ?? '#FFFFFF',
                borderColor: theme?.inputBorder ?? '#CBD5E1',
              },
              value <= 0 ? styles.counterDisabled : null,
            ]}
          >
            <Ionicons name="remove" size={18} color={theme?.text ?? '#0F172A'} />
          </Pressable>
          <Text style={[styles.counterValue, { color: theme?.text ?? '#0F172A' }]}>{value}</Text>
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
    fontSize: 15,
    fontWeight: '700',
  },
  sub: {
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
    fontSize: 15,
    fontWeight: '700',
    minWidth: 34,
    textAlign: 'center',
  },
});
