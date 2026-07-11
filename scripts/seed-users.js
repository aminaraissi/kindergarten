// scripts/seed-users.js
/**
 * Seed script — كيصاوب 3 comptes تجريبيين (admin, teacher, parent)
 * بنفس الإيميلات لي يمكن تحطهم فأزرار "دخول سريع للتجربة" فصفحة تسجيل الدخول.
 *
 * الاستعمال:
 *   1. تأكد .env.local معمّرة بمعلومات قاعدة البيانات ديالك
 *   2. شغّل قاعدة البيانات وتأكد أن fadaa_al_tifl.sql مستورد فيها
 *   3. node -r dotenv/config scripts/seed-users.js dotenv_config_path=.env.local
 *
 * كلمة السر ديال الثلاث comptes: demo1234
 */

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DEMO_USERS = [
  { role: "admin", full_name: "مدير النظام", email: "admin@demo.dz" },
  { role: "teacher", full_name: "سارة عمراني", email: "sara.teacher@demo.dz" },
  { role: "parent", full_name: "وليد بلحاج", email: "walid.parent@demo.dz" },
];

const DEMO_PASSWORD = "demo1234";

async function main() {
  const pool = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fadaa_al_tifl",
  });

  console.log("متصل بقاعدة البيانات ✅");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of DEMO_USERS) {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [u.email]);

    if (existing.length > 0) {
      await pool.query("UPDATE users SET password_hash = ?, is_active = 1 WHERE email = ?", [
        passwordHash,
        u.email,
      ]);
      console.log(`↻ تم تحديث: ${u.email} (${u.role})`);
      continue;
    }

    let teacherId = null;
    if (u.role === "teacher") {
      const [teacherRows] = await pool.query("SELECT id FROM teachers ORDER BY id LIMIT 1");
      if (teacherRows.length > 0) {
        teacherId = teacherRows[0].id;
      } else {
        const [result] = await pool.query(
          "INSERT INTO teachers (status, name, lastname, subject) VALUES ('active', 'سارة', 'عمراني', 'قسم النجوم الصغيرة')"
        );
        teacherId = result.insertId;
      }
    }

    let studentId = null;
    if (u.role === "parent") {
      const [studentRows] = await pool.query("SELECT id FROM students ORDER BY id LIMIT 1");
      if (studentRows.length > 0) {
        studentId = studentRows[0].id;
      }
      // إلا ماكانش تلميذ فالقاعدة، الحساب غادي يتصاوب بلا ربط — تقدر تربطو من الإدارة من بعد.
    }

    await pool.query(
      `INSERT INTO users (role, full_name, email, password_hash, teacher_id, student_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [u.role, u.full_name, u.email, passwordHash, teacherId, studentId]
    );
    console.log(`✚ تم إنشاء: ${u.email} (${u.role})`);
  }

  console.log("\nكولشي واجد! تقدر تدخل بأي من هاد الحسابات، كلمة السر: " + DEMO_PASSWORD);
  await pool.end();
}

main().catch((err) => {
  console.error("خطأ فالـ seed:", err);
  process.exit(1);
});