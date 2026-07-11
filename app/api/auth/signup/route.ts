import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, roleHomeRoute } from "@/lib/session";
import { hashPassword } from "@/lib/password";

type Role = "admin" | "teacher" | "parent";

function splitName(fullName: string) {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ");
  const name = parts[0] || trimmed;
  const lastname = parts.slice(1).join(" ") || "";
  return { name, lastname };
}

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const { fullName, email, password, role } = await req.json();

    if (!fullName?.trim() || !email?.trim() || !password || !role) {
      return NextResponse.json({ error: "يرجى تعبئة كل الحقول" }, { status: 400 });
    }
    if (!["admin", "teacher", "parent"].includes(role)) {
      return NextResponse.json({ error: "نوع حساب غير صالح" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: "يجب أن تحتوي كلمة المرور على 6 خانات على الأقل" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    await conn.beginTransaction();

    const [existing] = await conn.query<RowDataPacket[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [
      normalizedEmail,
    ]);
    if (existing.length > 0) {
      await conn.rollback();
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
    }

    let teacherId: number | null = null;
    const studentId: number | null = null;

    if (role === "teacher") {
      const { name, lastname } = splitName(fullName);
      const [teacherResult] = await conn.query<ResultSetHeader>(
        "INSERT INTO teachers (status, name, lastname) VALUES ('pending', ?, ?)",
        [name, lastname]
      );
      teacherId = teacherResult.insertId;
    }
    // ملاحظة: حساب "ولي أمر" كيتصاوب بلا ربط بتلميذ — الإدارة هي لي تربطو بولدو من لوحة الإدارة من بعد.

    const passwordHash = await hashPassword(password);

    const [userResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO users (role, full_name, email, password_hash, teacher_id, student_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [role as Role, fullName.trim(), normalizedEmail, passwordHash, teacherId, studentId]
    );

    await conn.commit();

    const sessionUser = {
      id: userResult.insertId,
      role: role as Role,
      fullName: fullName.trim(),
      email: normalizedEmail,
      teacherId,
      studentId,
    };

    const token = await createSessionToken(sessionUser);
    const res = NextResponse.json({ user: sessionUser, redirect: roleHomeRoute(role as Role) });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    await conn.rollback();
    console.error("signup error:", err);
    return NextResponse.json({ error: "تعذر إنشاء الحساب، حاول مرة أخرى" }, { status: 500 });
  } finally {
    conn.release();
  }
}