import { NextResponse } from "next/server";
import { demoProject } from "@/lib/mining/demo";
import { runDecisionWorkflow } from "@/lib/mining/praxios";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const decisionId = body?.decisionId ?? demoProject.decisions[0]?.id;

  if (!decisionId) {
    return NextResponse.json({ error: "decisionId required" }, { status: 400 });
  }

  try {
    return NextResponse.json(runDecisionWorkflow(demoProject, decisionId));
  } catch {
    return NextResponse.json({ error: "decision not found" }, { status: 404 });
  }
}
