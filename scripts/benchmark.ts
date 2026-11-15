import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { sql, and, eq, gte, ilike } from "drizzle-orm";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://datascope:datascope_secret_password@localhost:5432/datascope_db";

const client = postgres(connectionString, { max: 5 });
const db = drizzle(client, { schema });

interface BenchmarkResult {
  operation: string;
  recordCount: number;
  iterations: number;
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  p95DurationMs: number;
  sampleResultsCount: number;
}

async function measure<T>(
  label: string,
  iterations: number,
  fn: () => Promise<T>
): Promise<BenchmarkResult> {
  const durations: number[] = [];
  let sampleCount = 0;

  // Warmup run
  const warmupRes = await fn();
  if (Array.isArray(warmupRes)) sampleCount = warmupRes.length;

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    await fn();
    const t1 = performance.now();
    durations.push(t1 - t0);
  }

  durations.sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);
  const avg = sum / durations.length;
  const p95 = durations[Math.floor(durations.length * 0.95)] || durations[durations.length - 1];

  return {
    operation: label,
    recordCount: 100000,
    iterations,
    avgDurationMs: Number(avg.toFixed(2)),
    minDurationMs: Number(durations[0].toFixed(2)),
    maxDurationMs: Number(durations[durations.length - 1].toFixed(2)),
    p95DurationMs: Number(p95.toFixed(2)),
    sampleResultsCount: sampleCount,
  };
}

export async function runBenchmarks() {
  console.log("==========================================================");
  console.log("   DATASCOPE ENTERPRISE PERFORMANCE BENCHMARK SUITE       ");
  console.log("==========================================================");

  // Check dataset size
  const [totalRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.datasetRecords);
  const total = Number(totalRes.count);
  console.log(`Current Total Records in Database: ${total.toLocaleString()}`);

  const results: BenchmarkResult[] = [];

  // 1. Pagination Benchmark (Offset 0, Page Size 50)
  results.push(
    await measure("Pagination: Page 1 (Limit 50, Offset 0)", 10, async () => {
      return db
        .select()
        .from(schema.datasetRecords)
        .orderBy(schema.datasetRecords.recordNumber)
        .limit(50)
        .offset(0);
    })
  );

  // 2. Deep Pagination (Offset 50,000, Page Size 50)
  results.push(
    await measure("Deep Pagination: Page 1000 (Limit 50, Offset 50,000)", 10, async () => {
      return db
        .select()
        .from(schema.datasetRecords)
        .orderBy(schema.datasetRecords.recordNumber)
        .limit(50)
        .offset(50000);
    })
  );

  // 3. Multi-Column Compound Filter (Status = Active, Country = Germany, Revenue > $10,000)
  results.push(
    await measure(
      "Compound Filter: Status=Active AND Country=Germany AND Revenue>10000",
      10,
      async () => {
        return db
          .select()
          .from(schema.datasetRecords)
          .where(
            and(
              eq(schema.datasetRecords.status, "Active"),
              eq(schema.datasetRecords.country, "Germany"),
              gte(schema.datasetRecords.revenue, "10000")
            )
          )
          .limit(50);
      }
    )
  );

  // 4. Trigram Fuzzy Substring Search (ILIKE %Quantum%)
  results.push(
    await measure("Fuzzy Trigram Search: Company LIKE '%Quantum%'", 10, async () => {
      return db
        .select()
        .from(schema.datasetRecords)
        .where(ilike(schema.datasetRecords.companyName, "%Quantum%"))
        .limit(50);
    })
  );

  // 5. Full-Text Search (to_tsvector)
  results.push(
    await measure("PostgreSQL Full-Text Search: 'Technology | Solutions'", 10, async () => {
      return db
        .select()
        .from(schema.datasetRecords)
        .where(
          sql`to_tsvector('english', ${schema.datasetRecords.companyName} || ' ' || ${schema.datasetRecords.industry}) @@ to_tsquery('english', 'Technology | Solutions')`
        )
        .limit(50);
    })
  );

  // 6. Analytics Aggregation (Group by Category / Status with COUNT & SUM)
  results.push(
    await measure("Analytics Aggregation: GROUP BY status, industry with COUNT & SUM(revenue)", 10, async () => {
      return db
        .select({
          status: schema.datasetRecords.status,
          industry: schema.datasetRecords.industry,
          count: sql<number>`count(*)`,
          totalRevenue: sql<number>`sum(${schema.datasetRecords.revenue}::numeric)`,
          avgRisk: sql<number>`avg(${schema.datasetRecords.riskScore}::numeric)`,
        })
        .from(schema.datasetRecords)
        .groupBy(schema.datasetRecords.status, schema.datasetRecords.industry);
    })
  );

  console.log("\n---------------- BENCHMARK RESULTS ----------------");
  console.table(
    results.map((r) => ({
      Operation: r.operation,
      "Avg (ms)": r.avgDurationMs,
      "Min (ms)": r.minDurationMs,
      "Max (ms)": r.maxDurationMs,
      "P95 (ms)": r.p95DurationMs,
      SampleRows: r.sampleResultsCount,
    }))
  );
  console.log("---------------------------------------------------\n");

  await client.end();
}

if (process.argv[1]?.endsWith("benchmark.ts") || process.argv[1]?.includes("benchmark")) {
  runBenchmarks()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Benchmark failed:", err);
      process.exit(1);
    });
}
