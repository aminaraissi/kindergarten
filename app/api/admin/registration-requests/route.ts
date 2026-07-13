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
  dob: string;
  pob: string;
  address: string;
  health: string;
  note: string | null;
  photo_path: string | null;
  contact_email: string | null;
  created_at: string;
}

interface ParentRow extends RowDataPacket {
  request_id: number;
  type: "mother" | "father";
  name: string | null;
  lastname: string | null;
  dob: string | null;
  pob: string | null;
  phone: string | null;
  email: string | null;
}

interface GuardianRow extends RowDataPacket {
  request_id: number;
  name: string;
  lastname: string;
  dob: string | null;
  pob: string | null;
  phone: string;
  email: string | null;
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get("status") || "pending";
  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "قيمة status غير صالحة" }, { status: 400 });
  }

  try {
    const [requests] = await pool.query<RequestRow[]>(
      `SELECT id, status, name, lastname, dob, pob, address, health, note, photo_path, contact_email, created_at
       FROM registration_requests WHERE status = ? ORDER BY created_at DESC`,
      [status]
    );

    if (requests.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    const ids = requests.map((r) => r.id);
    const [parents] = await pool.query<ParentRow[]>(
      `SELECT request_id, type, name, lastname, dob, pob, phone, email
       FROM registration_request_parents WHERE request_id IN (?)`,
      [ids]
    );
    const [guardians] = await pool.query<GuardianRow[]>(
      `SELECT request_id, name, lastname, dob, pob, phone, email
       FROM registration_request_guardians WHERE request_id IN (?)`,
      [ids]
    );

    const result = requests.map((r) => ({
      id: r.id,
      status: r.status,
      child: {
        name: r.name,
        lastname: r.lastname,
        dob: r.dob,
        pob: r.pob,
        address: r.address,
        health: r.health,
        note: r.note,
        photo: r.photo_path,
      },
      contactEmail: r.contact_email,
      createdAt: r.created_at,
      mother: parents.find((p) => p.request_id === r.id && p.type === "mother") || null,
      father: parents.find((p) => p.request_id === r.id && p.type === "father") || null,
      guardians: guardians.filter((g) => g.request_id === r.id),
    }));

    return NextResponse.json({ requests: result });
  } catch (err) {
    console.error("List registration requests error:", err);
    return NextResponse.json({ error: "تعذر جلب الطلبات" }, { status: 500 });
  }
}