import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("Missing env var DATABASE_URL");
  }

  let connectionString = raw.trim();
  if (connectionString.startsWith("DATABASE_URL=")) {
    connectionString = connectionString.slice("DATABASE_URL=".length).trim();
  }
  if (
    (connectionString.startsWith('"') && connectionString.endsWith('"')) ||
    (connectionString.startsWith("'") && connectionString.endsWith("'"))
  ) {
    connectionString = connectionString.slice(1, -1).trim();
  }

  const isPostgresUrl =
    connectionString.startsWith("postgres://") ||
    connectionString.startsWith("postgresql://");

  if (!isPostgresUrl) {
    throw new Error(
      `Invalid DATABASE_URL. Expected a postgres connection string, got: '${connectionString}'. ` +
        "Check your Netlify environment variables (Production/Preview) and ensure you set only the URL value."
    );
  }

  return new Pool({ connectionString });
}

function getPool(): Pool {
  if (globalThis.__pgPool) return globalThis.__pgPool;

  const created = createPool();
  if (process.env.NODE_ENV !== "production") {
    globalThis.__pgPool = created;
  }
  return created;
}

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const real = getPool() as any;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
