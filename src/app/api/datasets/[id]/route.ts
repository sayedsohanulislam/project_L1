import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { datasets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [dataset] = await db
      .select()
      .from(datasets)
      .where(eq(datasets.id, id))
      .limit(1);

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    return NextResponse.json(dataset);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch dataset", details: String(err) },
      { status: 500 }
    );
  }
}
