import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { openDatabaseSync } from 'expo-sqlite';

// Same hash function used in the seed file. Lightweight salted hash so I am not
// storing plain passwords. Not production grade but fine for a local-only app.
export function hashPassword(password: string): string {
  let hash = 0;
  const salt = 'habit-tracker-salt';
  const combined = salt + password;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

// I store the current logged-in user id in a tiny session table inside SQLite.
// This way the user stays logged in between app restarts without needing
// another dependency like AsyncStorage.
const sessionDb = openDatabaseSync('habits.db');
sessionDb.execSync(`
  CREATE TABLE IF NOT EXISTS session (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    user_id INTEGER
  );
  INSERT OR IGNORE INTO session (id, user_id) VALUES (1, NULL);
`);

export function getStoredUserId(): number | null {
  const result = sessionDb.getFirstSync<{ user_id: number | null }>(
    'SELECT user_id FROM session WHERE id = 1'
  );
  return result?.user_id ?? null;
}

export function setStoredUserId(userId: number | null) {
  sessionDb.runSync('UPDATE session SET user_id = ? WHERE id = 1', userId);
}

export type AuthResult =
  | { ok: true; userId: number }
  | { ok: false; error: string };

export async function registerUser(
  username: string,
  password: string
): Promise<AuthResult> {
  const trimmed = username.trim();
  if (!trimmed) return { ok: false, error: 'Username is required' };
  if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters' };

  // Check the username is not already taken
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, trimmed));

  if (existing.length > 0) {
    return { ok: false, error: 'Username already taken' };
  }

  await db.insert(usersTable).values({
    username: trimmed,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });

  // Get the new user's id
  const created = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, trimmed));
  const userId = created[0].id;
  setStoredUserId(userId);
  return { ok: true, userId };
}

export async function loginUser(
  username: string,
  password: string
): Promise<AuthResult> {
  const trimmed = username.trim();
  if (!trimmed) return { ok: false, error: 'Username is required' };
  if (!password) return { ok: false, error: 'Password is required' };

  const matches = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, trimmed));

  if (matches.length === 0) {
    return { ok: false, error: 'No account with that username' };
  }

  const user = matches[0];
  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: 'Wrong password' };
  }

  setStoredUserId(user.id);
  return { ok: true, userId: user.id };
}

export function logoutUser() {
  setStoredUserId(null);
}
