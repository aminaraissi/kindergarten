import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";
import { getTeacherClass } from "@/lib/teacherClass";

interface AttRow extends RowDataPacket {
  student_id: number;
  status: "present" | "absent" | "late";
}

const STATUS_META: Record<string, { icon: string; color: string }> = {
  present: { icon: "✓", color: "var(--sage)" },
  absent: { icon: "✕", color: "var(--danger)" },
  late: { icon: "⏱", color: "var(--sun-dark)" },
};
const STATUS_LABEL: Record<string, string> = { present: "حاضر", absent: "غائب", late: "متأخر" };

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "التاريخ مطلوب" }, { status: 400 });

  const klass = await getTeacherClass(user.teacherId);
  if (!klass) return NextResponse.json({ statusByStudent: {} });

  const [rows] = await pool.query<AttRow[]>(
    `SELECT a.student_id, a.status
     FROM attendance a
     JOIN students s ON s.id = a.student_id
     WHERE s.section_id = ? AND a.att_date = ?`,
    [klass.id, date]
  );

  const statusByStudent: Record<number, string> = {};
  rows.forEach((r) => (statusByStudent[r.student_id] = r.status));

  return NextResponse.json({ statusByStudent });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { date, entries } = (await req.json()) as {
    date: string;
    entries: { studentId: number; status: "present" | "absent" | "late" }[];
  };

  if (!date || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const e of entries) {
      await conn.query(
        `INSERT INTO attendance (student_id, att_date, status) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [e.studentId, date, e.status]
      );

      const [[student]] = await conn.query<RowDataPacket[]>(
        "SELECT name, lastname FROM students WHERE id = ? LIMIT 1",
        [e.studentId]
      );
      const studentName = student ? `${student.name} ${student.lastname}` : "";
      const meta = STATUS_META[e.status];

      await conn.query(
        "INSERT INTO parent_notifications (student_id, icon, color, title) VALUES (?, ?, ?, ?)",
        [e.studentId, meta.icon, meta.color, `حضور (${date}) — ${studentName}: ${STATUS_LABEL[e.status]}`]
      );
      await conn.query(
        "INSERT INTO teacher_notifications (teacher_id, icon, color, title) VALUES (?, ?, ?, ?)",
        [user.teacherId, meta.icon, meta.color, `حضور (${date}) — ${studentName}: ${STATUS_LABEL[e.status]}`]
      );
    }

    await conn.commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("attendance save error:", err);
    return NextResponse.json({ error: "تعذر حفظ الحضور" }, { status: 500 });
  } finally {
    conn.release();
  }
}