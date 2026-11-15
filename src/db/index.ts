import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://datascope:datascope_secret_password@localhost:5432/datascope_db";

// Use a singleton connection pool in development to avoid exhausting connections on HMR
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

export const client =
  globalForDb.conn ??
  postgres(connectionString, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.conn = client;

export const db = drizzle(client, { schema });
export default db;
