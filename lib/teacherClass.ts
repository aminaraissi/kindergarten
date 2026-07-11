import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

export interface TeacherClass extends RowDataPacket {
  id: number;
  name: string;
}

export async function getTeacherClass(teacherId: number): Promise<TeacherClass | null> {
  const [rows] = await pool.query<TeacherClass[]>(
    "SELECT id, name FROM classes WHERE teacher_id = ? AND status = 'active' ORDER BY id LIMIT 1",
    [teacherId]
  );
  return rows[0] || null;
}