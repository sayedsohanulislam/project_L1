export type UserRole = "ADMIN" | "DATA_ANALYST" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  dataSource: string;
  totalRecords: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetField {
  id: string;
  datasetId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: "string" | "number" | "boolean" | "date" | "currency";
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  orderIndex: number;
}

export interface DatasetRecord {
  id: string;
  datasetId: string;
  recordNumber: number;
  companyName: string;
  contactEmail: string;
  status: string;
  country: string;
  industry: string;
  revenue: string | number;
  riskScore: string | number;
  department: string;
  contractTier: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "last_n_days";
  value: string;
}

export interface SortCondition {
  column: string;
  direction: "asc" | "desc";
}

export interface SavedView {
  id: string;
  name: string;
  description?: string | null;
  datasetId: string;
  createdById: string;
  searchConditions?: Record<string, unknown> | null;
  filters: FilterCondition[];
  sortingConfig: SortCondition[];
  visibleColumns: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistoryEntry {
  id: string;
  userId?: string | null;
  datasetId: string;
  queryText: string;
  filters: Record<string, unknown>;
  resultsCount: number;
  executionTimeMs: string;
  searchMethod: "FULL_TEXT" | "TRIGRAM" | "EXACT";
  createdAt: string;
}

export interface RecordRelationship {
  id: string;
  sourceRecordId: string;
  targetRecordId: string;
  relationshipType: string;
  metadata: Record<string, unknown>;
  relatedRecordId?: string;
  companyName?: string;
  status?: string;
  revenue?: string | number;
  targetRecord?: Partial<DatasetRecord>;
}

export interface DatasetAnalytics {
  totalRecords: number;
  recordsByCategory: Array<{ category: string; count: number }>;
  recordsByStatus: Array<{ status: string; count: number }>;
  recordsByTier: Array<{ tier: string; count: number }>;
  growthTrends: Array<{ date: string; count: number; volume: number }>;
  searchActivity: Array<{ method: string; count: number; avgTimeMs: number }>;
  topCountries: Array<{ country: string; count: number; totalRevenue: number }>;
  metrics: {
    totalRevenue: number;
    avgRiskScore: number;
    activeContractRatio: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  metrics: {
    queryTimeMs: number;
    searchMethodUsed: string;
    cached: boolean;
  };
}
