import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = await verifySessionToken(token);

  return NextResponse.json({ user });
}