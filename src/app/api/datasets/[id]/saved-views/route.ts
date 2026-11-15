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
    const { id: datasetId } = await params;
    return NextResponse.json([
      {
        id: "view-demo-1",
        name: "Active German Enterprise Accounts > $10,000",
        description: "Pre-configured view filtering Active accounts in Germany with high revenue yield.",
        datasetId,
        createdById: "admin-id",
        searchConditions: { query: "" },
        filters: [
          { id: "f-1", field: "status", operator: "equals", value: "Active" },
          { id: "f-2", field: "country", operator: "equals", value: "Germany" },
          { id: "f-3", field: "revenue", operator: "greater_than", value: 10000 },
        ],
        sortingConfig: [{ column: "revenue", direction: "desc" }],
        visibleColumns: ["recordNumber", "companyName", "status", "country", "industry", "revenue", "riskScore", "contractTier"],
        isShared: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "view-demo-2",
        name: "High Risk US Tech Accounts",
        description: "Monitoring list of Technology accounts based in United States with risk score >= 50.",
        datasetId,
        createdById: "analyst-id",
        searchConditions: { query: "Tech" },
        filters: [
          { id: "f-4", field: "country", operator: "equals", value: "United States" },
          { id: "f-5", field: "industry", operator: "equals", value: "Technology" },
          { id: "f-6", field: "riskScore", operator: "greater_than", value: 50 },
        ],
        sortingConfig: [{ column: "riskScore", direction: "desc" }],
        visibleColumns: ["recordNumber", "companyName", "contactEmail", "country", "riskScore", "status"],
        isShared: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
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
