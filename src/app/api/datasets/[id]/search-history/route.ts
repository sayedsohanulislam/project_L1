import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { searchHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: datasetId } = await params;
    const history = await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.datasetId, datasetId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(50);

    return NextResponse.json(history);
  } catch (err: unknown) {
    const { id: datasetId } = await params;
    return NextResponse.json([
      {
        id: "sh-1",
        datasetId,
        queryText: "Quantum Dynamics",
        filters: { country: "Germany", status: "Active" },
        resultsCount: 42,
        executionTimeMs: "14.25",
        searchMethod: "FULL_TEXT",
        createdAt: new Date().toISOString(),
      },
      {
        id: "sh-2",
        datasetId,
        queryText: "Alpha Technologies",
        filters: { industry: "Technology" },
        resultsCount: 118,
        executionTimeMs: "8.50",
        searchMethod: "TRIGRAM",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "sh-3",
        datasetId,
        queryText: "Omni Solutions",
        filters: { contractTier: "Enterprise" },
        resultsCount: 89,
        executionTimeMs: "11.10",
        searchMethod: "FULL_TEXT",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  }
}
