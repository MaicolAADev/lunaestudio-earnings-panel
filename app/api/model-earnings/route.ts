import { NextResponse } from "next/server";
import {
  createModelEarningController,
  listModelEarningsController,
} from "@/src/modules/model-earnings/model-earnings.controller";

export async function GET(req: Request) {
  try {
    const result = await listModelEarningsController(req);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const result = await createModelEarningController(req);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
