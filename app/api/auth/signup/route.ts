import { NextRequest, NextResponse } from "next/server";
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import pool from "@/lib/db";
import { hashPassword, signSession, SESSION_COOKIE, SESSION_MAX_AGE, ROLE_ROUTES, UserRole } from "@/lib/auth";

export const runtime = "nodejs";

interface ParentInfoBody {
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  phone: string;
  email: string;
}

interface GuardianBody extends ParentInfoBody {}

interface ChildBody {
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  address: string;
  health: string;
  note: string;
  photo: string | null;
}

interface SignupBody {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  child?: ChildBody;
  motherEnabled?: boolean;
  mother?: ParentInfoBody | null;
  fatherEnabled?: boolean;
  father?: ParentInfoBody | null;
  guardians?: GuardianBody[];
  contactEmail?: string;
}

function splitFullName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  return { first: parts[0] || fullName.trim(), last: parts.slice(1).join(" ") || "" };
}

export async function POST(req: NextRequest) {
  let body: SignupBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const { fullName, email, password, role } = body;

  if (!fullName?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: "يرجى تعبئة جميع الحقول المطلوبة" }, { status: 400 });
  }
  if (!["parent", "teacher", "admin"].includes(role)) {
    return NextResponse.json({ error: "نوع حساب غير صالح" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "كلمة المرور قصيرة جدًا" }, { status: 400 });
  }

  if (role === "parent") {
    const c = body.child;
    if (
      !c ||
      !c.name?.trim() ||
      !c.lastname?.trim() ||
      !c.dob ||
      !c.pob?.trim() ||
      !c.address?.trim() ||
      !c.health?.trim()
    ) {
      return NextResponse.json({ error: "يرجى تعبئة معلومات الطفل" }, { status: 400 });
    }
    if (!body.motherEnabled && !body.fatherEnabled) {
      return NextResponse.json({ error: "يرجى اختيار الأم أو الأب أو كليهما" }, { status: 400 });
    }
  }

  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Email must be unique across all accounts
    const [existing] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email.trim()]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return NextResponse.json({ error: "هذا البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    let requestId: number | null = null;
    let teacherId: number | null = null;

    if (role === "parent") {
      const c = body.child!;

      const [requestResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO registration_requests
           (user_id, status, name, lastname, dob, pob, address, health, note, photo_path, contact_email)
         VALUES (0, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.name.trim(),
          c.lastname.trim(),
          c.dob,
          c.pob.trim(),
          c.address.trim(),
          c.health.trim(),
          c.note?.trim() || null,
          c.photo || null,
          body.contactEmail?.trim() || null,
        ]
      );
      requestId = requestResult.insertId;

      if (body.motherEnabled && body.mother) {
        const m = body.mother;
        await conn.query(
          `INSERT INTO registration_request_parents (request_id, type, name, lastname, dob, pob, phone, email)
           VALUES (?, 'mother', ?, ?, ?, ?, ?, ?)`,
          [
            requestId,
            m.name.trim(),
            m.lastname.trim(),
            m.dob || null,
            m.pob?.trim() || null,
            m.phone?.trim() || null,
            m.email?.trim() || null,
          ]
        );
      }

      if (body.fatherEnabled && body.father) {
        const f = body.father;
        await conn.query(
          `INSERT INTO registration_request_parents (request_id, type, name, lastname, dob, pob, phone, email)
           VALUES (?, 'father', ?, ?, ?, ?, ?, ?)`,
          [
            requestId,
            f.name.trim(),
            f.lastname.trim(),
            f.dob || null,
            f.pob?.trim() || null,
            f.phone?.trim() || null,
            f.email?.trim() || null,
          ]
        );
      }

      // Max 2 guardians — enforced here client-side-payload-wise; the
      // official student_guardians table also has a DB trigger capping
      // this at promotion time.
      const guardians = (body.guardians || []).slice(0, 2);
      for (const g of guardians) {
        if (!g.name?.trim() || !g.lastname?.trim() || !g.phone?.trim()) continue;
        await conn.query(
          `INSERT INTO registration_request_guardians (request_id, name, lastname, dob, pob, phone, email)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            requestId,
            g.name.trim(),
            g.lastname.trim(),
            g.dob || null,
            g.pob?.trim() || null,
            g.phone.trim(),
            g.email?.trim() || null,
          ]
        );
      }

      await conn.query(
        `INSERT INTO admin_activity_log (icon, color, title, target_page, target_ref_type, target_ref_id, is_read)
         VALUES ('🧒', 'var(--sage)', ?, 'students', 'registration_request', ?, 0)`,
        [`طلب تسجيل جديد بانتظار المراجعة: ${c.name.trim()} ${c.lastname.trim()}`, requestId]
      );
    }

    if (role === "teacher") {
      const { first, last } = splitFullName(fullName);
      const [teacherResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO teachers (status, name, lastname) VALUES ('pending', ?, ?)`,
        [first, last]
      );
      teacherId = teacherResult.insertId;

      await conn.query(
        `INSERT INTO admin_activity_log (icon, color, title, target_page, target_ref_type, target_ref_id, is_read)
         VALUES ('👩‍🏫', 'var(--sky)', ?, 'teachers', 'teacher', ?, 0)`,
        [`طلب انضمام أستاذ جديد: ${fullName.trim()}`, teacherId]
      );
    }

    // NOTE: allowing public signup for role "admin" is a security risk in
    // production — see the message accompanying this file.
    const [userResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO users (role, full_name, email, password_hash, teacher_id, student_id, request_id, is_active)
       VALUES (?, ?, ?, ?, ?, NULL, ?, 1)`,
      [role, fullName.trim(), email.trim(), passwordHash, teacherId, requestId]
    );
    const userId = userResult.insertId;

    // The request row needed a user_id at insert time but the user didn't
    // exist yet — back-fill it now that we have it.
    if (requestId) {
      await conn.query(`UPDATE registration_requests SET user_id = ? WHERE id = ?`, [userId, requestId]);
    }

    await conn.commit();

    const token = signSession({ userId, role, email: email.trim() });
    const res = NextResponse.json({ redirect: ROLE_ROUTES[role] });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Signup error:", err);
    return NextResponse.json({ error: "تعذر إنشاء الحساب، حاول مرة أخرى" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}