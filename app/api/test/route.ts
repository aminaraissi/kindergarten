import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT NOW() AS server_time"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}