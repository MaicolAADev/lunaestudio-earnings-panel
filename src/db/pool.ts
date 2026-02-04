import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing env var DATABASE_URL");
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

export const pool: Pool = globalThis.__pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}
