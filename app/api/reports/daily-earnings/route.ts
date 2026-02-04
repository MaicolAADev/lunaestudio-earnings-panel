import { NextResponse } from "next/server";
import { getDailyEarningsReportController } from "@/src/modules/reportsrddd/daily-earnings.controller";

export async function GET(req: Request) {
  try {
    const result = await getDailyEarningsReportController(req);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
