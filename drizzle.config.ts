import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://datascope:datascope_secret_password@localhost:5432/datascope_db",
  },
  verbose: true,
  strict: true,
});
