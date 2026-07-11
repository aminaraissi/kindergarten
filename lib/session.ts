// lib/session.ts
import { SignJWT, jwtVerify } from "jose";

// هاد الملف "Edge-safe" — يقدر يتقرا من middleware.ts (JWT ديال jose بلا bcrypt)

export const SESSION_COOKIE = "fadaa_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 أيام

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: number;
  role: "admin" | "teacher" | "parent";
  fullName: string;
  email: string;
  teacherId: number | null;
  studentId: number | null;
};

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export function roleHomeRoute(role: SessionUser["role"]) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/parent";
}