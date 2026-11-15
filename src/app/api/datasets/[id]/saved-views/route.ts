import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedViews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: datasetId } = await params;
    const views = await db
      .select()
      .from(savedViews)
      .where(eq(savedViews.datasetId, datasetId))
      .orderBy(desc(savedViews.createdAt));

    return NextResponse.json(views);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch saved views", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: datasetId } = await params;
    const body = await request.json();

    const [created] = await db
      .insert(savedViews)
      .values({
        name: body.name || "Untitled View",
        description: body.description || "",
        datasetId,
        createdById: body.createdById || "00000000-0000-0000-0000-000000000000",
        searchConditions: body.searchConditions || {},
        filters: body.filters || [],
        sortingConfig: body.sortingConfig || [],
        visibleColumns: body.visibleColumns || [],
        isShared: Boolean(body.isShared),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("POST saved views error:", err);
    return NextResponse.json(
      { error: "Failed to create saved view", details: String(err) },
      { status: 500 }
    );
  }
}
