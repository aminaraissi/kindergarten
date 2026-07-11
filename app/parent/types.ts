export interface Child {
  name: string;
  lastname: string;
  section: string;
  avatarUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  points: number;
}

export interface Lesson {
  icon: string;
  subject: string;
  title: string;
  desc: string;
  date: string;
}

export interface Task {
  type: string;
  title: string;
  done: boolean;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface NotificationItem {
  icon: string;
  color: string;
  title: string;
  time: string;
  read: boolean;
}

export interface PaymentReminder {
  show: boolean;
  title?: string;
  message?: string;
}

export type TabKey = 'lessons' | 'tasks' | 'points' | 'attendance';