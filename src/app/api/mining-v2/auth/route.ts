import { NextResponse } from "next/server";
import {
  createMiningSessionToken,
  MINING_V2_COOKIE,
  verifyMiningPassword,
} from "@/lib/mining-v2/auth";

export async function POST(request: Request) {
  const password = process.env.DMI_ACCESS_PASSWORD;
  const secret = process.env.DMI_SESSION_SECRET;

  if (!password || !secret) {
    return NextResponse.json(
      { error: "Acceso V2 no configurado en el entorno." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const candidate = typeof body?.password === "string" ? body.password : "";

  if (!candidate || !(await verifyMiningPassword(candidate, password))) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const ttl = Number(process.env.DMI_SESSION_TTL_SECONDS ?? "43200");
  const token = await createMiningSessionToken(secret, Number.isFinite(ttl) ? ttl : 43200);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(MINING_V2_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: Number.isFinite(ttl) ? ttl : 43200,
  });

  return response;
}
