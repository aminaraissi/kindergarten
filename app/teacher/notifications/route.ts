import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";

interface NotifRow extends RowDataPacket {
  id: number;
  icon: string;
  color: string;
  title: string;
  is_read: number;
  created_at: string;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [rows] = await pool.query<NotifRow[]>(
    "SELECT id, icon, color, title, is_read, created_at FROM teacher_notifications WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 30",
    [user.teacherId]
  );

  const notifications = rows.map((r) => ({
    id: r.id,
    icon: r.icon,
    color: r.color,
    title: r.title,
    read: !!r.is_read,
    time: r.created_at,
  }));

  return NextResponse.json({ notifications });
}

export async function PATCH() {
  const user = await getSessionUser();
  if (!user || user.role !== "teacher" || !user.teacherId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  await pool.query("UPDATE teacher_notifications SET is_read = 1 WHERE teacher_id = ?", [user.teacherId]);
  return NextResponse.json({ ok: true });
}