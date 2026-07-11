import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, roleHomeRoute } from "@/lib/session";

const ROLE_FOR_PATH: Record<string, "admin" | "teacher" | "parent"> = {
  "/admin": "admin",
  "/teacher": "teacher",
  "/parent": "parent",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const matchedPrefix = Object.keys(ROLE_FOR_PATH).find((p) => pathname.startsWith(p));
  if (!matchedPrefix) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = ROLE_FOR_PATH[matchedPrefix];
  if (user.role !== requiredRole) {
    return NextResponse.redirect(new URL(roleHomeRoute(user.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/parent/:path*"],
};