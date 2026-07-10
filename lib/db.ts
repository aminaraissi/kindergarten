import mysql from "mysql2/promise";

// Pool واحد مشترك عبر كل السيرفر — كيتقرا من متغيرات البيئة (.env.local)
// شوف .env.local.example لمعرفة شنو خاصك تحط.

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fadaa_al_tifl",
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    dateStrings: true,
  });
}

// فالتطوير (dev)، Next.js كيعاود يحمل الموديولات بزاف مرات (hot reload)،
// فهاد الشي كنخزنو الـ pool فـ globalThis باش ما نديرو بزاف connections.
const pool = global._mysqlPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global._mysqlPool = pool;
}

export default pool;
