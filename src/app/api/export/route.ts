import { NextRequest } from "next/server";
import { db } from "@/db";
import { datasetRecords } from "@/db/schema";
import { and, eq, ne, gte, lte, ilike, SQL, desc, asc } from "drizzle-orm";
import Papa from "papaparse";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId, query, filters = [], sorting = [] } = body;

    const conditions: SQL[] = [eq(datasetRecords.datasetId, datasetId)];

    if (query) {
      conditions.push(ilike(datasetRecords.companyName, `%${query}%`));
    }

    for (const f of filters) {
      if (!f.field || f.value === undefined || f.value === "") continue;
      const col = (datasetRecords as unknown as Record<string, unknown>)[f.field];
      if (!col) continue;

      if (f.operator === "equals") conditions.push(eq(col as any, String(f.value)));
      else if (f.operator === "not_equals") conditions.push(ne(col as any, String(f.value)));
      else if (f.operator === "contains") conditions.push(ilike(col as any, `%${f.value}%`));
      else if (f.operator === "greater_than") conditions.push(gte(col as any, String(f.value)));
      else if (f.operator === "less_than") conditions.push(lte(col as any, String(f.value)));
    }

    const whereClause = and(...conditions);

    // Stream up to 10,000 filtered records efficiently in chunks
    const records = await db
      .select({
        "Record Number": datasetRecords.recordNumber,
        "Company Name": datasetRecords.companyName,
        "Contact Email": datasetRecords.contactEmail,
        Status: datasetRecords.status,
        Country: datasetRecords.country,
        Industry: datasetRecords.industry,
        Revenue: datasetRecords.revenue,
        "Risk Score": datasetRecords.riskScore,
        Department: datasetRecords.department,
        "Contract Tier": datasetRecords.contractTier,
        "Created Date": datasetRecords.createdAt,
      })
      .from(datasetRecords)
      .where(whereClause)
      .limit(10000);

    const csvData = Papa.unparse(records);

    return new Response(csvData, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="datascope-export-${Date.now()}.csv"`,
      },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: "Export failed", details: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
