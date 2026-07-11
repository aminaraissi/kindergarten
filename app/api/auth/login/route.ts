import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, roleHomeRoute } from "@/lib/session";
import { verifyPassword } from "@/lib/password";

interface UserRow extends RowDataPacket {
  id: number;
  role: "admin" | "teacher" | "parent";
  full_name: string;
  email: string;
  password_hash: string;
  teacher_id: number | null;
  student_id: number | null;
  is_active: number;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, role, full_name, email, password_hash, teacher_id, student_id, is_active FROM users WHERE email = ? LIMIT 1",
      [String(email).trim().toLowerCase()]
    );

    const user = rows[0];
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      role: user.role,
      fullName: user.full_name,
      email: user.email,
      teacherId: user.teacher_id,
      studentId: user.student_id,
    };

    const token = await createSessionToken(sessionUser);

    const res = NextResponse.json({ user: sessionUser, redirect: roleHomeRoute(user.role) });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "تعذر الاتصال بقاعدة البيانات، حاول مرة أخرى" }, { status: 500 });
  }
}