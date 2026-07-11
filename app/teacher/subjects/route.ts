import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";

interface SubjectRow extends RowDataPacket {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [rows] = await pool.query<SubjectRow[]>("SELECT id, name, icon, color FROM subjects ORDER BY id");
  return NextResponse.json({ subjects: rows });
}