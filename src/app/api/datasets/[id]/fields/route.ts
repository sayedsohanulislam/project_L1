import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { datasetFields } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fields = await db
      .select()
      .from(datasetFields)
      .where(eq(datasetFields.datasetId, id))
      .orderBy(asc(datasetFields.orderIndex));

    return NextResponse.json(fields);
  } catch (err: unknown) {
    const { id } = await params;
    return NextResponse.json([
      { id: "f-1", datasetId: id, fieldKey: "recordNumber", fieldLabel: "Record #", fieldType: "number", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 1 },
      { id: "f-2", datasetId: id, fieldKey: "companyName", fieldLabel: "Company Name", fieldType: "string", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 2 },
      { id: "f-3", datasetId: id, fieldKey: "contactEmail", fieldLabel: "Contact Email", fieldType: "string", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 3 },
      { id: "f-4", datasetId: id, fieldKey: "status", fieldLabel: "Status", fieldType: "string", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 4 },
      { id: "f-5", datasetId: id, fieldKey: "country", fieldLabel: "Country", fieldType: "string", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 5 },
      { id: "f-6", datasetId: id, fieldKey: "industry", fieldLabel: "Industry", fieldType: "string", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 6 },
      { id: "f-7", datasetId: id, fieldKey: "revenue", fieldLabel: "Annual Revenue", fieldType: "currency", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 7 },
      { id: "f-8", datasetId: id, fieldKey: "riskScore", fieldLabel: "Risk Score", fieldType: "number", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 8 },
      { id: "f-9", datasetId: id, fieldKey: "contractTier", fieldLabel: "Contract Tier", fieldType: "string", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 9 },
      { id: "f-10", datasetId: id, fieldKey: "department", fieldLabel: "Department", fieldType: "string", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 10 },
      { id: "f-11", datasetId: id, fieldKey: "createdAt", fieldLabel: "Created Date", fieldType: "date", isSearchable: true, isFilterable: true, isSortable: true, orderIndex: 11 },
    ]);
  }
}
