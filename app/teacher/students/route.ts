import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";
import { getTeacherClass } from "@/lib/teacherClass";

interface StudentRow extends RowDataPacket {
  id: number;
  name: string;
  lastname: string;
  photo_path: string | null;
  points: number | null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const klass = await getTeacherClass(user.teacherId);
  if (!klass) {
    return NextResponse.json({ classId: null, className: null, students: [] });
  }

  const [rows] = await pool.query<StudentRow[]>(
    `SELECT s.id, s.name, s.lastname, s.photo_path, COALESCE(SUM(p.points), 0) AS points
     FROM students s
     LEFT JOIN student_subject_points p ON p.student_id = s.id
     WHERE s.section_id = ? AND s.status = 'active'
     GROUP BY s.id, s.name, s.lastname, s.photo_path
     ORDER BY s.name`,
    [klass.id]
  );

  const students = rows.map((r) => ({
    id: r.id,
    name: `${r.name} ${r.lastname}`,
    seed: r.name,
    points: Number(r.points) || 0,
  }));

  return NextResponse.json({ classId: klass.id, className: klass.name, students });
}