import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Roles Enum / Constants
export const USER_ROLES = ["ADMIN", "DATA_ANALYST", "VIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// 2. Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 50 }).$type<UserRole>().default("DATA_ANALYST").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ]
);

// 3. Datasets Table
export const datasets = pgTable(
  "datasets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    dataSource: varchar("data_source", { length: 150 }).notNull(),
    totalRecords: integer("total_records").default(0).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("datasets_category_idx").on(table.category),
    index("datasets_created_by_idx").on(table.createdById),
  ]
);

// 4. Dataset Fields Table (Metadata for dynamic columns & schema)
export const datasetFields = pgTable(
  "dataset_fields",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .references(() => datasets.id, { onDelete: "cascade" })
      .notNull(),
    fieldKey: varchar("field_key", { length: 100 }).notNull(),
    fieldLabel: varchar("field_label", { length: 150 }).notNull(),
    fieldType: varchar("field_type", { length: 50 }).notNull(), // 'string' | 'number' | 'boolean' | 'date' | 'currency'
    isSearchable: boolean("is_searchable").default(true).notNull(),
    isFilterable: boolean("is_filterable").default(true).notNull(),
    isSortable: boolean("is_sortable").default(true).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [
    index("dataset_fields_dataset_id_idx").on(table.datasetId),
    uniqueIndex("dataset_fields_dataset_field_idx").on(table.datasetId, table.fieldKey),
  ]
);

// 5. Dataset Records Table (100,000+ benchmark records with high-performance indexes)
export const datasetRecords = pgTable(
  "dataset_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .references(() => datasets.id, { onDelete: "cascade" })
      .notNull(),
    recordNumber: integer("record_number").notNull(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(), // 'Active', 'Pending', 'Archived', 'Suspended', 'Completed'
    country: varchar("country", { length: 100 }).notNull(),
    industry: varchar("industry", { length: 100 }).notNull(),
    revenue: numeric("revenue", { precision: 14, scale: 2 }).notNull(),
    riskScore: numeric("risk_score", { precision: 5, scale: 2 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    contractTier: varchar("contract_tier", { length: 50 }).notNull(), // 'Enterprise', 'Mid-Market', 'Startup'
    data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("dataset_records_dataset_id_idx").on(table.datasetId),
    index("dataset_records_status_idx").on(table.status),
    index("dataset_records_country_idx").on(table.country),
    index("dataset_records_industry_idx").on(table.industry),
    index("dataset_records_revenue_idx").on(table.revenue),
    index("dataset_records_created_at_idx").on(table.createdAt),
    // Composite indexes for common compound multi-column filters & sorting:
    index("dataset_records_composite_filter_idx").on(table.datasetId, table.status, table.country),
    index("dataset_records_dataset_created_idx").on(table.datasetId, table.createdAt),
    index("dataset_records_dataset_revenue_idx").on(table.datasetId, table.revenue),
    // GIN Trigram index for fuzzy text search on company name
    index("dataset_records_company_trgm_idx").using("gin", sql`(${table.companyName} gin_trgm_ops)`),
  ]
);

// 6. Record Relationships Table
export const recordRelationships = pgTable(
  "record_relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceRecordId: uuid("source_record_id")
      .references(() => datasetRecords.id, { onDelete: "cascade" })
      .notNull(),
    targetRecordId: uuid("target_record_id")
      .references(() => datasetRecords.id, { onDelete: "cascade" })
      .notNull(),
    relationshipType: varchar("relationship_type", { length: 100 }).notNull(), // 'Parent-Child', 'Subsidiary', 'Cross-Sell', 'Partner'
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("record_rel_source_idx").on(table.sourceRecordId),
    index("record_rel_target_idx").on(table.targetRecordId),
  ]
);

// 7. Saved Views Table
export const savedViews = pgTable(
  "saved_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    datasetId: uuid("dataset_id")
      .references(() => datasets.id, { onDelete: "cascade" })
      .notNull(),
    createdById: uuid("created_by_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    searchConditions: jsonb("search_conditions").$type<Record<string, unknown> | null>(),
    filters: jsonb("filters").$type<Array<{ field: string; operator: string; value: unknown }>>().default([]).notNull(),
    sortingConfig: jsonb("sorting_config").$type<Array<{ column: string; direction: "asc" | "desc" }>>().default([]).notNull(),
    visibleColumns: jsonb("visible_columns").$type<string[]>().default([]).notNull(),
    isShared: boolean("is_shared").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("saved_views_dataset_id_idx").on(table.datasetId),
    index("saved_views_created_by_idx").on(table.createdById),
    index("saved_views_shared_idx").on(table.isShared),
  ]
);

// 8. Search History Table
export const searchHistory = pgTable(
  "search_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    datasetId: uuid("dataset_id")
      .references(() => datasets.id, { onDelete: "cascade" })
      .notNull(),
    queryText: text("query_text").default("").notNull(),
    filters: jsonb("filters").$type<Record<string, unknown>>().default({}).notNull(),
    resultsCount: integer("results_count").default(0).notNull(),
    executionTimeMs: numeric("execution_time_ms", { precision: 8, scale: 2 }).default("0").notNull(),
    searchMethod: varchar("search_method", { length: 50 }).default("FULL_TEXT").notNull(), // 'FULL_TEXT', 'TRIGRAM', 'EXACT'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("search_history_user_idx").on(table.userId),
    index("search_history_dataset_idx").on(table.datasetId),
    index("search_history_created_at_idx").on(table.createdAt),
  ]
);

// 9. User Preferences Table
export const userPreferences = pgTable(
  "user_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    theme: varchar("theme", { length: 50 }).default("dark").notNull(),
    tableDensity: varchar("table_density", { length: 50 }).default("compact").notNull(), // 'compact' | 'standard' | 'comfortable'
    defaultPageSize: integer("default_page_size").default(25).notNull(),
    preferredViewId: uuid("preferred_view_id").references(() => savedViews.id, { onDelete: "set null" }),
    customSettings: jsonb("custom_settings").$type<Record<string, unknown>>().default({}).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_preferences_user_id_idx").on(table.userId),
  ]
);

// 10. Access Permissions Table (Dataset-Level RBAC)
export const accessPermissions = pgTable(
  "access_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .references(() => datasets.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).$type<UserRole>(), // Alternatively role-wide permission
    canRead: boolean("can_read").default(true).notNull(),
    canWrite: boolean("can_write").default(false).notNull(),
    canDelete: boolean("can_delete").default(false).notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("access_perm_dataset_user_idx").on(table.datasetId, table.userId),
    index("access_perm_dataset_role_idx").on(table.datasetId, table.role),
  ]
);
