import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { datasetRecords, recordRelationships } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id: datasetId, recordId } = await params;

    const [record] = await db
      .select()
      .from(datasetRecords)
      .where(eq(datasetRecords.id, recordId))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Fetch related records (Parent, Subsidiary, Partner)
    const relationships = await db
      .select({
        id: recordRelationships.id,
        relationshipType: recordRelationships.relationshipType,
        metadata: recordRelationships.metadata,
        createdAt: recordRelationships.createdAt,
        relatedRecordId: recordRelationships.targetRecordId,
        companyName: datasetRecords.companyName,
        status: datasetRecords.status,
        revenue: datasetRecords.revenue,
      })
      .from(recordRelationships)
      .leftJoin(
        datasetRecords,
        eq(recordRelationships.targetRecordId, datasetRecords.id)
      )
      .where(
        or(
          eq(recordRelationships.sourceRecordId, recordId),
          eq(recordRelationships.targetRecordId, recordId)
        )
      )
      .limit(10);

    // Mock historical changes log for enterprise record audit trail
    const historicalChanges = [
      {
        field: "revenue",
        oldValue: `$${(Number(record.revenue) * 0.85).toFixed(2)}`,
        newValue: `$${Number(record.revenue).toFixed(2)}`,
        changedBy: "system.sync@datascope.io",
        timestamp: new Date(new Date(record.updatedAt).getTime() - 86400000 * 14).toISOString(),
      },
      {
        field: "contractTier",
        oldValue: "Mid-Market",
        newValue: record.contractTier,
        changedBy: "admin@datascope.io",
        timestamp: new Date(new Date(record.updatedAt).getTime() - 86400000 * 45).toISOString(),
      },
      {
        field: "status",
        oldValue: "Pending",
        newValue: record.status,
        changedBy: "analyst@datascope.io",
        timestamp: new Date(new Date(record.updatedAt).getTime() - 86400000 * 90).toISOString(),
      },
    ];

    return NextResponse.json({
      record,
      relationships,
      historicalChanges,
    });
  } catch (err: unknown) {
    console.error("GET record details error:", err);
    return NextResponse.json(
      { error: "Failed to fetch record details", details: String(err) },
      { status: 500 }
    );
  }
}
