import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * تشفير كلمة المرور قبل حفظها في قاعدة البيانات
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * مقارنة كلمة المرور المدخلة مع المشفرة في قاعدة البيانات
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}