import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";
import { getTeacherClass } from "@/lib/teacherClass";

interface LessonRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  subject_name: string | null;
  created_at: string;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const klass = await getTeacherClass(user.teacherId);
  if (!klass) return NextResponse.json({ lessons: [] });

  const [rows] = await pool.query<LessonRow[]>(
    `SELECT l.id, l.title, l.description, l.icon, sub.name AS subject_name, l.created_at
     FROM lessons l
     LEFT JOIN subjects sub ON sub.id = l.subject_id
     WHERE l.class_id = ?
     ORDER BY l.created_at DESC
     LIMIT 30`,
    [klass.id]
  );

  const lessons = rows.map((r) => ({
    id: r.id,
    icon: r.icon || "📘",
    subject: r.subject_name || "",
    title: r.title,
    desc: r.description || "",
    date: r.created_at,
  }));

  return NextResponse.json({ lessons });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { subjectId, title, desc } = (await req.json()) as {
    subjectId: number;
    title: string;
    desc: string;
  };

  if (!subjectId || !title?.trim()) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const klass = await getTeacherClass(user.teacherId);
  if (!klass) return NextResponse.json({ error: "ماعندكش قسم مرتبط بحسابك بعد" }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[subject]] = await conn.query<RowDataPacket[]>(
      "SELECT name, icon, color FROM subjects WHERE id = ? LIMIT 1",
      [subjectId]
    );
    if (!subject) {
      await conn.rollback();
      return NextResponse.json({ error: "مادة غير صالحة" }, { status: 400 });
    }

    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO lessons (class_id, teacher_id, subject_id, icon, title, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [klass.id, user.teacherId, subjectId, subject.icon, title.trim(), desc?.trim() || null]
    );

    const [students] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM students WHERE section_id = ? AND status = 'active'",
      [klass.id]
    );
    for (const s of students) {
      await conn.query(
        "INSERT INTO parent_notifications (student_id, icon, color, title) VALUES (?, ?, ?, ?)",
        [s.id, subject.icon, subject.color, `تم نشر: ${title.trim()} لكل أولياء القسم`]
      );
    }

    await conn.query(
      "INSERT INTO teacher_notifications (teacher_id, icon, color, title) VALUES (?, ?, ?, ?)",
      [user.teacherId, subject.icon, subject.color, `تم نشر: ${title.trim()} لكل أولياء القسم`]
    );

    await conn.commit();
    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error("lesson add error:", err);
    return NextResponse.json({ error: "تعذر إضافة الدرس" }, { status: 500 });
  } finally {
    conn.release();
  }
}