import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";
import { getTeacherClass } from "@/lib/teacherClass";

const NOTE_TYPES: Record<string, { icon: string; label: string }> = {
  positive: { icon: "👍", label: "إيجابية" },
  behavior: { icon: "⚠️", label: "سلوكية" },
  academic: { icon: "📚", label: "دراسية" },
  health: { icon: "🏥", label: "صحية" },
};
const NOTE_ICONS = Object.values(NOTE_TYPES).map((t) => t.icon);

interface NoteRow extends RowDataPacket {
  id: number;
  icon: string;
  title: string;
  created_at: string;
  name: string;
  lastname: string;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const klass = await getTeacherClass(user.teacherId);
  if (!klass) return NextResponse.json({ notes: [] });

  const placeholders = NOTE_ICONS.map(() => "?").join(",");
  const [rows] = await pool.query<NoteRow[]>(
    `SELECT n.id, n.icon, n.title, n.created_at, s.name, s.lastname
     FROM parent_notifications n
     JOIN students s ON s.id = n.student_id
     WHERE s.section_id = ? AND n.icon IN (${placeholders})
     ORDER BY n.created_at DESC
     LIMIT 30`,
    [klass.id, ...NOTE_ICONS]
  );

  const notes = rows.map((r) => {
    const type = Object.values(NOTE_TYPES).find((t) => t.icon === r.icon);
    return {
      id: r.id,
      icon: r.icon,
      student: `${r.name} ${r.lastname}`,
      type: type?.label || "",
      text: r.title,
      date: r.created_at,
    };
  });

  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { studentId, noteType, text } = (await req.json()) as {
    studentId: number;
    noteType: keyof typeof NOTE_TYPES;
    text: string;
  };

  const type = NOTE_TYPES[noteType];
  if (!studentId || !type || !text?.trim()) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[student]] = await conn.query<RowDataPacket[]>(
      "SELECT name, lastname FROM students WHERE id = ? LIMIT 1",
      [studentId]
    );
    if (!student) {
      await conn.rollback();
      return NextResponse.json({ error: "تلميذ غير موجود" }, { status: 400 });
    }

    await conn.query("INSERT INTO parent_notifications (student_id, icon, color, title) VALUES (?, ?, ?, ?)", [
      studentId,
      type.icon,
      "var(--blush-dark)",
      text.trim(),
    ]);

    await conn.query("INSERT INTO teacher_notifications (teacher_id, icon, color, title) VALUES (?, ?, ?, ?)", [
      user.teacherId,
      type.icon,
      "var(--blush-dark)",
      `ملاحظة (${type.label}) لـ ${student.name} ${student.lastname}`,
    ]);

    await conn.commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("note add error:", err);
    return NextResponse.json({ error: "تعذر إرسال الملاحظة" }, { status: 500 });
  } finally {
    conn.release();
  }
}