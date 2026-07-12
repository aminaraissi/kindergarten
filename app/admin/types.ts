export type EntityStatus = 'pending' | 'active' | 'archived';

export interface ParentInfo {
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  phone: string;
  email: string;
}

export interface Guardian {
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  phone: string;
  email: string;
}

export interface Student {
  id: number;
  status: EntityStatus;
  photo: string;
  lastPaymentDate: string;
  paidMonths: number | null;
  weekReminderSent: boolean;
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  address: string;
  health: string;
  note: string;
  motherEnabled: boolean;
  mother: ParentInfo;
  fatherEnabled: boolean;
  father: ParentInfo;
  guardians: Guardian[];
  sectionId: number | null;
}

export interface Teacher {
  id: number;
  status: EntityStatus;
  photo: string;
  name: string;
  lastname: string;
  subject: string;
  phone: string;
}

export interface ClassItem {
  id: number;
  status: EntityStatus;
  name: string;
  teacherId: number | null;
  capacity: string;
}

export interface LogTarget {
  page: TabKey;
  selector?: string;
}

export interface ActivityLogItem {
  id: number;
  icon: string;
  color: string;
  title: string;
  time: string;
  read: boolean;
  target?: LogTarget | null;
}

export type MessageKind = 'broadcast' | 'individual' | 'teacher';

export interface MessageLogItem {
  id: number;
  kind: MessageKind;
  audience: string;
  text: string;
  time: string;
}

export type PaymentStatusKey = 'unknown' | 'ok' | 'due_soon' | 'overdue';

export interface PaymentInfo {
  status: PaymentStatusKey;
  nextDate: Date | null;
  daysRemaining: number | null;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  period: string;
  desc: string;
  featured: boolean;
  features: string[];
}

export interface EventItem {
  id: number;
  day: string;
  month: string;
  title: string;
  desc: string;
  tag: string;
}

export type JobStatus = 'open' | 'closed';

export interface JobListing {
  id: number;
  title: string;
  type: string;
  location: string;
  desc: string;
  status: JobStatus;
}

export interface JobApplication {
  id: number;
  jobId: number | null;
  jobTitle: string;
  applicantName: string;
  phone: string;
  email: string;
  message: string;
  time: string;
  read: boolean;
}

export type TabKey =
  | 'stats'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'messages'
  | 'pricing'
  | 'events'
  | 'jobs';

export const STATUS_LABEL: Record<EntityStatus, string> = {
  pending: 'قيد الانتظار',
  active: 'نشط',
  archived: 'مؤرشف',
};

export function emptyParentInfo(): ParentInfo {
  return { name: '', lastname: '', dob: '', pob: '', phone: '', email: '' };
}

export function emptyGuardian(): Guardian {
  return { name: '', lastname: '', dob: '', pob: '', phone: '', email: '' };
}