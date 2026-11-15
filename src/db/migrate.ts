import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function runMigrations() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://datascope:datascope_secret_password@localhost:5432/datascope_db";

  console.log("Connecting to PostgreSQL to run migrations...");
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log("Ensuring required PostgreSQL extensions are enabled...");
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
    await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`;
    await sql`CREATE EXTENSION IF NOT EXISTS "btree_gin";`;

    console.log("Running Drizzle schema migrations from src/db/migrations...");
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
