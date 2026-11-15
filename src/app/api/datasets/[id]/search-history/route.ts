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
    return NextResponse.json(
      { error: "Failed to fetch search history", details: String(err) },
      { status: 500 }
    );
  }
}
