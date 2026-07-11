import type { PaymentInfo, PaymentStatusKey, Student } from './types';

export function formatDate(d: Date | null): string {
  if (!d) return '';
  return d.toISOString().split('T')[0];
}

export function computeAge(dobStr: string): string {
  if (!dobStr) return '';
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return '';
  const diffMs = Date.now() - dob.getTime();
  const years = diffMs / (365.25 * 24 * 3600 * 1000);
  return String(Math.max(0, Math.floor(years)));
}

/** Computes payment status for a student based on their last payment
 * date and how many months they paid for.
 * - 'unknown': never registered a payment
 * - 'ok': more than a week left
 * - 'due_soon': 7 days or fewer left
 * - 'overdue': past due
 */
export function paymentStatus(student: Pick<Student, 'lastPaymentDate' | 'paidMonths'>): PaymentInfo {
  if (!student.lastPaymentDate || !student.paidMonths) {
    return { status: 'unknown', nextDate: null, daysRemaining: null };
  }
  const last = new Date(student.lastPaymentDate);
  if (isNaN(last.getTime())) {
    return { status: 'unknown', nextDate: null, daysRemaining: null };
  }
  const next = new Date(last);
  next.setMonth(next.getMonth() + Number(student.paidMonths));
  const msPerDay = 24 * 3600 * 1000;
  const daysRemaining = Math.ceil((next.getTime() - Date.now()) / msPerDay);
  let status: PaymentStatusKey;
  if (daysRemaining < 0) status = 'overdue';
  else if (daysRemaining <= 7) status = 'due_soon';
  else status = 'ok';
  return { status, nextDate: next, daysRemaining };
}

export function paymentLabel(info: PaymentInfo): string {
  if (info.status === 'unknown') return 'لم يتم تسجيل أي دفعة بعد';
  const dateStr = formatDate(info.nextDate);
  if (info.status === 'overdue') {
    return `متأخر عن الدفع بـ ${Math.abs(info.daysRemaining || 0)} يوم (كان الموعد ${dateStr})`;
  }
  if (info.status === 'due_soon') {
    return `الدفعة القادمة خلال ${info.daysRemaining} يوم (${dateStr})`;
  }
  return `الدفعة القادمة: ${dateStr} (متبقي ${info.daysRemaining} يوم)`;
}

export function paymentBadgeClass(info: PaymentInfo): string {
  if (info.status === 'ok') return 'ok';
  if (info.status === 'due_soon') return 'due';
  if (info.status === 'overdue') return 'overdue';
  return 'unknown';
}

export const PAID_MONTHS_LABELS: Record<number, string> = {
  1: 'شهر واحد',
  2: 'شهرين',
  3: '3 أشهر',
  6: '6 أشهر',
  12: 'سنة كاملة (12 شهر)',
};

export function readImageFile(file: File, callback: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = (e) => callback(e.target?.result as string);
  reader.readAsDataURL(file);
}