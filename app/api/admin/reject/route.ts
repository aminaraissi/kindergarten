import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

interface RequestRow extends RowDataPacket {
  id: number;
  status: "pending" | "approved" | "rejected";
  name: string;
  lastname: string;
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

  let reason: string | undefined;
  try {
    const body = await req.json();
    reason = body?.reason;
  } catch {
    // body is optional for rejection
  }

  try {
    const [rows] = await pool.query<RequestRow[]>(
      "SELECT id, status, name, lastname FROM registration_requests WHERE id = ?",
      [requestId]
    );
    const request = rows[0];

    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    if (request.status !== "pending") {
      return NextResponse.json({ error: "تمت مراجعة هذا الطلب من قبل" }, { status: 409 });
    }

    await pool.query(
      `UPDATE registration_requests
       SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [session.userId, reason?.trim() || null, requestId]
    );

    // The parent's account stays active (they may resubmit or contact the
    // school) but is no longer linked to a pending request.
    await pool.query(`UPDATE users SET request_id = NULL WHERE request_id = ?`, [requestId]);

    await pool.query(
      `INSERT INTO admin_activity_log (icon, color, title, target_page, target_ref_type, target_ref_id, is_read)
       VALUES ('✕', 'var(--danger)', ?, 'students', 'registration_request', ?, 0)`,
      [`تم رفض طلب: ${request.name} ${request.lastname}`, requestId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reject registration request error:", err);
    return NextResponse.json({ error: "تعذر رفض الطلب، حاول مرة أخرى" }, { status: 500 });
  }
}