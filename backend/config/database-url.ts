export function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;

  if (!host || !database || !user) return undefined;

  const port = process.env.DB_PORT || '5432';
  const password = process.env.DB_PASSWORD || '';
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const auth = encodedPassword ? `${encodedUser}:${encodedPassword}` : encodedUser;

  return `postgresql://${auth}@${host}:${port}/${database}`;
}
