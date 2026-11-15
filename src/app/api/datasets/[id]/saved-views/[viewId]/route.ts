import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedViews } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; viewId: string }> }
) {
  try {
    const { id: datasetId, viewId } = await params;
    await db
      .delete(savedViews)
      .where(and(eq(savedViews.id, viewId), eq(savedViews.datasetId, datasetId)));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to delete saved view", details: String(err) },
      { status: 500 }
    );
  }
}
