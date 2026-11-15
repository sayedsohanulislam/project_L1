import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import { sql } from "drizzle-orm";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://datascope:datascope_secret_password@localhost:5432/datascope_db";

const client = postgres(connectionString, { max: 10, idle_timeout: 30 });
const db = drizzle(client, { schema });

const COUNTRIES = [
  "Germany",
  "United States",
  "United Kingdom",
  "France",
  "Japan",
  "Canada",
  "Australia",
  "Singapore",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Brazil",
  "India",
  "Ireland",
  "Norway",
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail & E-commerce",
  "Energy & Utilities",
  "Telecommunications",
  "Aerospace & Defense",
  "Pharmaceuticals",
  "Automotive",
];

const STATUSES = ["Active", "Pending", "Archived", "Suspended", "Completed"];
const CONTRACT_TIERS = ["Enterprise", "Mid-Market", "Startup"];
const DEPARTMENTS = ["Operations", "Sales", "Finance", "Engineering", "Marketing", "Legal", "Procurement"];

const PREFIXES = [
  "Apex", "Nova", "Omni", "Vanguard", "Summit", "Quantum", "Hyper", "Strata",
  "Aero", "Pulse", "Nexus", "Vertex", "Sol", "Terra", "Aura", "Prime", "Synapse",
  "Helix", "Vector", "Optima", "Fortis", "Zenith", "Cobalt", "Beacon", "Alpha"
];

const SUFFIXES = [
  "Technologies", "Solutions", "Dynamics", "Systems", "Global", "Logistics",
  "Capital", "Ventures", "Networks", "Industries", "Analytics", "Labs",
  "Holdings", "Robotics", "Health", "Cloud", "Consulting", "Group", "Interactive"
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number, decimals: number = 0): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function getRandomDateWithinDays(daysBack: number): Date {
  const date = new Date();
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(date.getTime() - offset);
}

export async function seedDatabase(targetRecords = 100000) {
  console.log("Starting DataScope Database Seeding...");
  console.log(`Target dataset records: ${targetRecords.toLocaleString()}`);

  const startTime = Date.now();

  // 1. Ensure extensions
  await client`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
  await client`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`;
  await client`CREATE EXTENSION IF NOT EXISTS "btree_gin";`;

  // 2. Clear existing records for a fresh seed
  console.log("Cleaning up existing test data...");
  await db.delete(schema.searchHistory);
  await db.delete(schema.recordRelationships);
  await db.delete(schema.savedViews);
  await db.delete(schema.datasetRecords);
  await db.delete(schema.datasetFields);
  await db.delete(schema.accessPermissions);
  await db.delete(schema.datasets);
  await db.delete(schema.userPreferences);
  await db.delete(schema.users);

  // 3. Seed Users
  console.log("Seeding default platform users (Admin, Data Analyst, Viewer)...");
  const defaultPasswordHash = await bcrypt.hash("DataScope@2026", 10);

  const [adminUser] = await db
    .insert(schema.users)
    .values({
      name: "Alexander Vance (Admin)",
      email: "admin@datascope.io",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    })
    .returning();

  const [analystUser] = await db
    .insert(schema.users)
    .values({
      name: "Dr. Elena Rostova (Lead Analyst)",
      email: "analyst@datascope.io",
      passwordHash: defaultPasswordHash,
      role: "DATA_ANALYST",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    })
    .returning();

  const [viewerUser] = await db
    .insert(schema.users)
    .values({
      name: "Marcus Thorne (Viewer)",
      email: "viewer@datascope.io",
      passwordHash: defaultPasswordHash,
      role: "VIEWER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    })
    .returning();

  // 4. Seed User Preferences
  console.log("Seeding user preferences...");
  await db.insert(schema.userPreferences).values([
    {
      userId: adminUser.id,
      theme: "dark",
      tableDensity: "compact",
      defaultPageSize: 50,
      customSettings: { showMetricsBar: true, autoRefreshIntervalSec: 60 },
    },
    {
      userId: analystUser.id,
      theme: "dark",
      tableDensity: "standard",
      defaultPageSize: 25,
      customSettings: { showMetricsBar: true, highContrastHighlights: true },
    },
    {
      userId: viewerUser.id,
      theme: "dark",
      tableDensity: "comfortable",
      defaultPageSize: 25,
      customSettings: { showMetricsBar: false },
    },
  ]);

  // 5. Seed Primary Datasets
  console.log("Seeding primary enterprise datasets...");
  const [b2bDataset] = await db
    .insert(schema.datasets)
    .values({
      name: "Global Enterprise B2B Accounts",
      description:
        "Comprehensive registry of multinational B2B commercial accounts, contract tiers, compliance status, and revenue telemetry.",
      category: "Sales & Finance",
      dataSource: "Enterprise SAP ERP & Salesforce Sync",
      totalRecords: targetRecords,
      createdById: adminUser.id,
    })
    .returning();

  const [logisticsDataset] = await db
    .insert(schema.datasets)
    .values({
      name: "Global Supply Chain & Logistics Hub",
      description:
        "International shipping logistics, carrier performance, warehouse distribution tiers, and customs compliance.",
      category: "Supply Chain",
      dataSource: "Fleet Telematics & Cargo WMS",
      totalRecords: 1250,
      createdById: adminUser.id,
    })
    .returning();

  // 6. Seed Dataset Fields
  console.log("Seeding dataset schema field metadata...");
  const fields = [
    { key: "recordNumber", label: "Record #", type: "number", order: 1 },
    { key: "companyName", label: "Company Name", type: "string", order: 2 },
    { key: "contactEmail", label: "Contact Email", type: "string", order: 3 },
    { key: "status", label: "Status", type: "string", order: 4 },
    { key: "country", label: "Country", type: "string", order: 5 },
    { key: "industry", label: "Industry", type: "string", order: 6 },
    { key: "revenue", label: "Annual Revenue", type: "currency", order: 7 },
    { key: "riskScore", label: "Risk Score", type: "number", order: 8 },
    { key: "contractTier", label: "Contract Tier", type: "string", order: 9 },
    { key: "department", label: "Department", type: "string", order: 10 },
    { key: "createdAt", label: "Created Date", type: "date", order: 11 },
  ];

  await db.insert(schema.datasetFields).values(
    fields.map((f) => ({
      datasetId: b2bDataset.id,
      fieldKey: f.key,
      fieldLabel: f.label,
      fieldType: f.type,
      orderIndex: f.order,
      isSearchable: true,
      isFilterable: true,
      isSortable: true,
    }))
  );

  // 7. Seed Dataset-level Access Permissions
  console.log("Configuring dataset-level role-based permissions...");
  await db.insert(schema.accessPermissions).values([
    {
      datasetId: b2bDataset.id,
      userId: adminUser.id,
      role: "ADMIN",
      canRead: true,
      canWrite: true,
      canDelete: true,
    },
    {
      datasetId: b2bDataset.id,
      userId: analystUser.id,
      role: "DATA_ANALYST",
      canRead: true,
      canWrite: true,
      canDelete: false,
    },
    {
      datasetId: b2bDataset.id,
      userId: viewerUser.id,
      role: "VIEWER",
      canRead: true,
      canWrite: false,
      canDelete: false,
    },
  ]);

  // 8. Generate 100,000+ Records in Streaming Batches
  console.log(`Generating and inserting ${targetRecords.toLocaleString()} records in batches...`);
  const batchSize = 2500;
  const totalBatches = Math.ceil(targetRecords / batchSize);

  let currentRecordNumber = 1;
  const firstBatchIds: string[] = [];

  for (let b = 0; b < totalBatches; b++) {
    const currentBatchCount = Math.min(batchSize, targetRecords - b * batchSize);
    const recordsToInsert = [];

    for (let i = 0; i < currentBatchCount; i++) {
      const recNum = currentRecordNumber++;
      const prefix = getRandomItem(PREFIXES);
      const suffix = getRandomItem(SUFFIXES);
      const companyName = `${prefix} ${suffix} ${recNum > 500 ? recNum : ""}`.trim();
      const domain = `${prefix.toLowerCase()}-${suffix.toLowerCase()}`.replace(/[^a-z0-9-]/g, "");
      const contactEmail = `contact@${domain}${recNum}.com`;
      const country = getRandomItem(COUNTRIES);
      const industry = getRandomItem(INDUSTRIES);
      const status = getRandomItem(STATUSES);
      const contractTier = getRandomItem(CONTRACT_TIERS);
      const department = getRandomItem(DEPARTMENTS);
      const revenue = getRandomNumber(5000, 2500000, 2).toString();
      const riskScore = getRandomNumber(2.0, 95.5, 2).toString();
      const createdAt = getRandomDateWithinDays(365);

      recordsToInsert.push({
        datasetId: b2bDataset.id,
        recordNumber: recNum,
        companyName,
        contactEmail,
        status,
        country,
        industry,
        revenue,
        riskScore,
        department,
        contractTier,
        data: {
          employeeCount: Math.floor(Math.random() * 5000) + 20,
          annualGrowthRate: `${getRandomNumber(-10, 45, 1)}%`,
          renewalQuarter: `Q${Math.floor(Math.random() * 4) + 1} 2026`,
          complianceTier: getRandomItem(["SOC2-TypeII", "ISO-27001", "HIPAA", "GDPR-Certified"]),
          primaryRegion: getRandomItem(["EMEA", "APAC", "AMER", "LATAM"]),
        },
        createdAt,
        updatedAt: createdAt,
      });
    }

    const inserted = await db
      .insert(schema.datasetRecords)
      .values(recordsToInsert)
      .returning({ id: schema.datasetRecords.id });

    if (b === 0) {
      firstBatchIds.push(...inserted.slice(0, 100).map((r) => r.id));
    }

    if ((b + 1) % 5 === 0 || b === totalBatches - 1) {
      const progress = (((b + 1) * batchSize) / targetRecords) * 100;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `Batch ${b + 1}/${totalBatches} committed (${Math.min((b + 1) * batchSize, targetRecords).toLocaleString()} records, ${Math.min(100, Math.round(progress))}% in ${elapsed}s)`
      );
    }
  }

  // 9. Seed Record Relationships
  console.log("Generating record relationships (Parent-Child, Subsidiaries)...");
  if (firstBatchIds.length >= 20) {
    const relationships = [];
    for (let r = 0; r < 15; r++) {
      relationships.push({
        sourceRecordId: firstBatchIds[r],
        targetRecordId: firstBatchIds[r + 1],
        relationshipType: getRandomItem(["Subsidiary", "Regional Partner", "Cross-Sell Account", "Joint Venture"]),
        metadata: { establishedYear: 2020 + (r % 5), synergyScore: getRandomNumber(75, 99) },
      });
    }
    await db.insert(schema.recordRelationships).values(relationships);
  }

  // 10. Seed Saved Views
  console.log("Seeding predefined saved views for immediate exploration...");
  await db.insert(schema.savedViews).values([
    {
      name: "Active German Enterprise Accounts > $10,000",
      description: "Pre-configured view filtering Active accounts in Germany with high revenue yield.",
      datasetId: b2bDataset.id,
      createdById: analystUser.id,
      searchConditions: { query: "" },
      filters: [
        { field: "status", operator: "equals", value: "Active" },
        { field: "country", operator: "equals", value: "Germany" },
        { field: "revenue", operator: "greater_than", value: 10000 },
      ],
      sortingConfig: [{ column: "revenue", direction: "desc" }],
      visibleColumns: [
        "recordNumber",
        "companyName",
        "status",
        "country",
        "industry",
        "revenue",
        "riskScore",
        "contractTier",
      ],
      isShared: true,
    },
    {
      name: "High Risk US Tech Accounts",
      description: "Monitoring list of Technology accounts based in United States with risk score >= 50.",
      datasetId: b2bDataset.id,
      createdById: analystUser.id,
      searchConditions: { query: "Tech" },
      filters: [
        { field: "country", operator: "equals", value: "United States" },
        { field: "industry", operator: "equals", value: "Technology" },
        { field: "riskScore", operator: "greater_than", value: 50 },
      ],
      sortingConfig: [{ column: "riskScore", direction: "desc" }],
      visibleColumns: [
        "recordNumber",
        "companyName",
        "contactEmail",
        "country",
        "riskScore",
        "status",
      ],
      isShared: true,
    },
    {
      name: "Recent Contracts (Last 30 Days)",
      description: "All enterprise contracts initiated within the last 30 operational days.",
      datasetId: b2bDataset.id,
      createdById: adminUser.id,
      searchConditions: { query: "" },
      filters: [
        { field: "createdAt", operator: "last_n_days", value: 30 },
      ],
      sortingConfig: [{ column: "createdAt", direction: "desc" }],
      visibleColumns: [
        "recordNumber",
        "companyName",
        "contractTier",
        "department",
        "revenue",
        "createdAt",
      ],
      isShared: false,
    },
  ]);

  // 11. Seed Search History
  console.log("Seeding search history logs for audit and performance metrics...");
  await db.insert(schema.searchHistory).values([
    {
      userId: analystUser.id,
      datasetId: b2bDataset.id,
      queryText: "Quantum Dynamics",
      filters: { country: "Germany", status: "Active" },
      resultsCount: 42,
      executionTimeMs: "14.25",
      searchMethod: "FULL_TEXT",
    },
    {
      userId: analystUser.id,
      datasetId: b2bDataset.id,
      queryText: "Alpha Technologies",
      filters: { industry: "Technology" },
      resultsCount: 118,
      executionTimeMs: "8.50",
      searchMethod: "TRIGRAM",
    },
    {
      userId: adminUser.id,
      datasetId: b2bDataset.id,
      queryText: "Omni Solutions",
      filters: { contractTier: "Enterprise" },
      resultsCount: 89,
      executionTimeMs: "11.10",
      searchMethod: "FULL_TEXT",
    },
  ]);

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Successfully completed DataScope seeding in ${totalDuration}s!`);
  console.log("Demo Credentials:");
  console.log("  - Admin:         admin@datascope.io   / DataScope@2026 (Role: ADMIN)");
  console.log("  - Lead Analyst:  analyst@datascope.io / DataScope@2026 (Role: DATA_ANALYST)");
  console.log("  - Viewer:        viewer@datascope.io  / DataScope@2026 (Role: VIEWER)");
}

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.includes("seed")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed with error:", err);
      process.exit(1);
    });
}
