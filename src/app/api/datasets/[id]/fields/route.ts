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
    return NextResponse.json(
      { error: "Failed to fetch dataset fields", details: String(err) },
      { status: 500 }
    );
  }
}
