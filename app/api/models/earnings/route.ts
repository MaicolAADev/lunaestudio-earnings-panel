import { NextResponse } from "next/server";
import { getModelEarningsController } from "@/src/modules/earnings/earnings.controller";

export async function GET(req: Request) {
  try {
    const result = await getModelEarningsController(req);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
