import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Users table for the register/login/logout/delete-profile requirement.
// Passwords are stored as a salted hash, never plaintext.
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

// Categories group habits (e.g. Fitness, Health, Learning).
// name + color + icon covers the brief's "name and colour/icon" requirement.
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
});

// Habits are the things the user is tracking (e.g. "Drink water", "Gym").
// metricType chooses how the habit is logged:
//   'boolean' - did it / did not do it on a date (value is always 1)
//   'count'   - how many times / how much (value is an integer like 8 glasses)
// unit is an optional display label for count habits (e.g. "glasses", "km").
export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  metricType: text('metric_type').notNull(), // 'boolean' | 'count'
  unit: text('unit'),
  createdAt: text('created_at').notNull(),
});

// Habit logs are the primary records per the brief.
// Each log has a date, a measurable metric (value), and references a habit
// (which in turn references a category — satisfying "category reference required").
// notes is optional per the brief.
export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  habitId: integer('habit_id').notNull().references(() => habits.id),
  date: text('date').notNull(), // YYYY-MM-DD — sorts correctly as text
  value: integer('value').notNull(), // 1 for boolean done, N for count
  notes: text('notes'),
});

// Targets are weekly or monthly goals.
// habitId nullable so the app can support per-habit OR global/category-level
// targets later without a schema change. The brief asks for "global or per-category"
// so leaving habitId nullable and adding categoryId keeps both routes open.
export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  habitId: integer('habit_id').references(() => habits.id),
  categoryId: integer('category_id').references(() => categories.id),
  period: text('period').notNull(), // 'weekly' | 'monthly'
  amount: integer('amount').notNull(),
});
