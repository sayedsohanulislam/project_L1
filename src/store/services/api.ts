import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Dataset,
  DatasetField,
  DatasetRecord,
  PaginatedResponse,
  DatasetAnalytics,
  SavedView,
  SearchHistoryEntry,
  RecordRelationship,
  FilterCondition,
  SortCondition,
} from "@/types";

export interface RecordQueryParams {
  datasetId: string;
  query?: string;
  searchMethod?: "FULL_TEXT" | "TRIGRAM" | "EXACT";
  filters?: FilterCondition[];
  sorting?: SortCondition[];
  page?: number;
  pageSize?: number;
}

export const dataScopeApi = createApi({
  reducerPath: "dataScopeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Dataset", "Records", "SavedViews", "SearchHistory", "Analytics"],
  endpoints: (builder) => ({
    // 1. Datasets
    getDatasets: builder.query<Dataset[], void>({
      query: () => "/datasets",
      providesTags: ["Dataset"],
    }),
    getDatasetById: builder.query<Dataset, string>({
      query: (id) => `/datasets/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Dataset", id }],
    }),
    getDatasetFields: builder.query<DatasetField[], string>({
      query: (datasetId) => `/datasets/${datasetId}/fields`,
    }),

    // 2. Records (Data Explorer & Search)
    getRecords: builder.query<PaginatedResponse<DatasetRecord>, RecordQueryParams>({
      query: (params) => ({
        url: `/datasets/${params.datasetId}/records`,
        method: "POST",
        body: {
          query: params.query || "",
          searchMethod: params.searchMethod || "FULL_TEXT",
          filters: params.filters || [],
          sorting: params.sorting || [],
          page: params.page || 1,
          pageSize: params.pageSize || 25,
        },
      }),
      providesTags: ["Records"],
      keepUnusedDataFor: 300, // 5 minutes cache retention for deduplication
    }),

    // 3. Record Details with Relationships & Historical changes
    getRecordDetails: builder.query<
      {
        record: DatasetRecord;
        relationships: RecordRelationship[];
        historicalChanges: Array<{
          field: string;
          oldValue: unknown;
          newValue: unknown;
          changedBy: string;
          timestamp: string;
        }>;
      },
      { datasetId: string; recordId: string }
    >({
      query: ({ datasetId, recordId }) => `/datasets/${datasetId}/records/${recordId}`,
    }),

    // 4. Analytics
    getAnalytics: builder.query<DatasetAnalytics, string>({
      query: (datasetId) => `/datasets/${datasetId}/analytics`,
      providesTags: ["Analytics"],
      keepUnusedDataFor: 60,
    }),

    // 5. Saved Views
    getSavedViews: builder.query<SavedView[], string>({
      query: (datasetId) => `/datasets/${datasetId}/saved-views`,
      providesTags: ["SavedViews"],
    }),
    createSavedView: builder.mutation<SavedView, Partial<SavedView>>({
      query: (body) => ({
        url: `/datasets/${body.datasetId}/saved-views`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SavedViews"],
    }),
    deleteSavedView: builder.mutation<{ success: boolean }, { datasetId: string; id: string }>({
      query: ({ datasetId, id }) => ({
        url: `/datasets/${datasetId}/saved-views/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SavedViews"],
    }),

    // 6. Search History
    getSearchHistory: builder.query<SearchHistoryEntry[], string>({
      query: (datasetId) => `/datasets/${datasetId}/search-history`,
      providesTags: ["SearchHistory"],
    }),

    // 7. AI Search Assistant (Natural language to structured query)
    parseNaturalQuery: builder.mutation<
      {
        query: string;
        filters: FilterCondition[];
        sorting: SortCondition[];
        explanation: string;
      },
      { naturalQuery: string; datasetId: string }
    >({
      query: (body) => ({
        url: "/ai-search",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetDatasetsQuery,
  useGetDatasetByIdQuery,
  useGetDatasetFieldsQuery,
  useGetRecordsQuery,
  useGetRecordDetailsQuery,
  useGetAnalyticsQuery,
  useGetSavedViewsQuery,
  useCreateSavedViewMutation,
  useDeleteSavedViewMutation,
  useGetSearchHistoryQuery,
  useParseNaturalQueryMutation,
} = dataScopeApi;
