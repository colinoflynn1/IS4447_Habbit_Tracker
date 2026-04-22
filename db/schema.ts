import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// users table for the login requirement. I store a password hash, not the plain password.
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

// categories group habits. Each one has a name, a colour and an icon.
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
});

// habits are the things the user is tracking.
// metricType is either 'boolean' (did it or not) or 'count' (how many).
// unit is optional text for count habits like "glasses" or "minutes".
export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  metricType: text('metric_type').notNull(),
  unit: text('unit'),
  createdAt: text('created_at').notNull(),
});

// habit_logs are the main records. Each log has a date, a value and a habit id.
// value is 1 for boolean habits and the count for count habits.
export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  habitId: integer('habit_id').notNull().references(() => habits.id),
  date: text('date').notNull(),
  value: integer('value').notNull(),
  notes: text('notes'),
});

// targets are weekly or monthly goals for a habit.
export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  habitId: integer('habit_id').references(() => habits.id),
  categoryId: integer('category_id').references(() => categories.id),
  period: text('period').notNull(),
  amount: integer('amount').notNull(),
});
