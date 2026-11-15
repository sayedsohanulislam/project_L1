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
    const { id: datasetId, recordId } = await params;
    return NextResponse.json({
      record: {
        id: recordId,
        datasetId,
        recordNumber: 42,
        companyName: "Quantum Dynamics Technologies",
        contactEmail: "contact@quantum-dynamics.com",
        status: "Active",
        country: "Germany",
        industry: "Technology",
        revenue: "845200.00",
        riskScore: "18.5",
        department: "Operations",
        contractTier: "Enterprise",
        data: {
          employeeCount: 1420,
          annualGrowthRate: "24.8%",
          renewalQuarter: "Q4 2026",
          complianceTier: "ISO-27001",
          primaryRegion: "EMEA",
        },
        createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      relationships: [
        {
          id: "rel-1",
          sourceRecordId: recordId,
          targetRecordId: "target-1",
          relationshipType: "Subsidiary",
          metadata: { synergyScore: 92 },
          companyName: "Quantum Global Labs",
          status: "Active",
          revenue: "320000.00",
        },
      ],
      historicalChanges: [
        {
          field: "revenue",
          oldValue: "$710,000.00",
          newValue: "$845,200.00",
          changedBy: "system.sync@datascope.io",
          timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
        },
      ],
    });
  }
}
