import { openDatabaseSync } from 'expo-sqlite';

export type ThemeName = 'light' | 'dark';

export type Theme = {
  name: ThemeName;
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  primary: string;
  primaryMuted: string;
  primaryFaint: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  warning: string;
  success: string;
  inputBg: string;
  inputBorder: string;
  shadow: string;
};

export const lightTheme: Theme = {
  name: 'light',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#0F172A',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  primary: '#0F766E',
  primaryMuted: '#475569',
  primaryFaint: '#F0FDFA',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FCA5A5',
  warning: '#92400E',
  success: '#16A34A',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  shadow: '#000000',
};

export const darkTheme: Theme = {
  name: 'dark',
  background: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  primary: '#14B8A6',
  primaryMuted: '#94A3B8',
  primaryFaint: '#134E4A',
  danger: '#F87171',
  dangerBg: '#3F1212',
  dangerBorder: '#7F1D1D',
  warning: '#FBBF24',
  success: '#4ADE80',
  inputBg: '#1E293B',
  inputBorder: '#475569',
  shadow: '#000000',
};

// Persist the chosen theme in the existing session table by adding a column.
const themeDb = openDatabaseSync('habits.db');
themeDb.execSync(`
  CREATE TABLE IF NOT EXISTS prefs (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    theme TEXT NOT NULL DEFAULT 'light'
  );
  INSERT OR IGNORE INTO prefs (id, theme) VALUES (1, 'light');
`);

export function getStoredTheme(): ThemeName {
  const result = themeDb.getFirstSync<{ theme: string }>(
    'SELECT theme FROM prefs WHERE id = 1'
  );
  return result?.theme === 'dark' ? 'dark' : 'light';
}

export function setStoredTheme(theme: ThemeName) {
  themeDb.runSync('UPDATE prefs SET theme = ? WHERE id = 1', theme);
}

export function getTheme(name: ThemeName): Theme {
  return name === 'dark' ? darkTheme : lightTheme;
}
