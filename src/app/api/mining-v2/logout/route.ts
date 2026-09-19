import { NextResponse } from "next/server";
import { MINING_V2_COOKIE } from "@/lib/mining-v2/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MINING_V2_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
