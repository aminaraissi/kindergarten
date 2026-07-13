
import { NextRequest, NextResponse } from "next/server";
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import pool from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

interface RequestRow extends RowDataPacket {
  id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected";
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  address: string;
  health: string;
  note: string | null;
  photo_path: string | null;
}

interface ParentRow extends RowDataPacket {
  type: "mother" | "father";
  name: string | null;
  lastname: string | null;
  dob: string | null;
  pob: string | null;
  phone: string | null;
  email: string | null;
}

interface GuardianRow extends RowDataPacket {
  name: string;
  lastname: string;
  dob: string | null;
  pob: string | null;
  phone: string;
  email: string | null;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const requestId = Number(params.id);
  if (!requestId) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  let conn: PoolConnection | null = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [requestRows] = await conn.query<RequestRow[]>(
      "SELECT * FROM registration_requests WHERE id = ? FOR UPDATE",
      [requestId]
    );
    const request = requestRows[0];

    if (!request) {
      await conn.rollback();
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    if (request.status !== "pending") {
      await conn.rollback();
      return NextResponse.json({ error: "تمت مراجعة هذا الطلب من قبل" }, { status: 409 });
    }

    // 1. Create the official student record
    const [studentResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO students (status, name, lastname, dob, pob, address, health, note, photo_path)
       VALUES ('active', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [request.name, request.lastname, request.dob, request.pob, request.address, request.health, request.note, request.photo_path]
    );
    const studentId = studentResult.insertId;

    // 2. Copy parents
    const [parentRows] = await conn.query<ParentRow[]>(
      "SELECT type, name, lastname, dob, pob, phone, email FROM registration_request_parents WHERE request_id = ?",
      [requestId]
    );
    for (const p of parentRows) {
      await conn.query(
        `INSERT INTO student_parents (student_id, type, enabled, name, lastname, dob, pob, phone, email)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)`,
        [studentId, p.type, p.name, p.lastname, p.dob, p.pob, p.phone, p.email]
      );
    }

    // 3. Copy guardians (max 2 — also enforced by a DB trigger)
    const [guardianRows] = await conn.query<GuardianRow[]>(
      "SELECT name, lastname, dob, pob, phone, email FROM registration_request_guardians WHERE request_id = ? LIMIT 2",
      [requestId]
    );
    for (const g of guardianRows) {
      await conn.query(
        `INSERT INTO student_guardians (student_id, name, lastname, dob, pob, phone, email)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studentId, g.name, g.lastname, g.dob, g.pob, g.phone, g.email]
      );
    }

    // 4. Mark the request approved and link it to the new student
    await conn.query(
      `UPDATE registration_requests
       SET status = 'approved', student_id = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [studentId, session.userId, requestId]
    );

    // 5. Point the parent's account at the real student, clear the request link
    await conn.query(`UPDATE users SET student_id = ?, request_id = NULL WHERE id = ?`, [
      studentId,
      request.user_id,
    ]);

    // 6. Log it — same pattern as every other admin action
    await conn.query(
      `INSERT INTO admin_activity_log (icon, color, title, target_page, target_ref_type, target_ref_id, is_read)
       VALUES ('🧒', 'var(--sage)', ?, 'students', 'student', ?, 0)`,
      [`تم قبول: ${request.name} ${request.lastname}`, studentId]
    );

    await conn.commit();
    return NextResponse.json({ studentId });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Approve registration request error:", err);
    return NextResponse.json({ error: "تعذر قبول الطلب، حاول مرة أخرى" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}