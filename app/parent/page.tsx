'use client';

import { useState } from 'react';
import './parent.css';
import Header from './components/Header';
import PayBanner from './components/PayBanner';
import LessonsTab from './components/LessonsTab';
import TasksTab from './components/TasksTab';
import PointsTab from './components/PointsTab';
import AttendanceTab from './components/AttendanceTab';
import type {
  Child,
  Subject,
  Lesson,
  Task,
  AttendanceRecord,
  NotificationItem,
  PaymentReminder,
  TabKey,
} from './types';

export default function ParentDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('lessons');

  // NOTE: all state below starts empty on purpose (no demo/sample data).
  // Replace these with real data fetched from your API / database
  // (e.g. inside a useEffect, a server component, or a data-fetching hook).
  const [child] = useState<Child>({
    name: '',
    lastname: '',
    section: '',
  });

  const [subjects] = useState<Subject[]>([]);
  const [lessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [paymentReminder, setPaymentReminder] = useState<PaymentReminder>({ show: false });

  function toggleTask(index: number) {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, done: !t.done } : t))
    );
  }

  function markNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markPaymentPaid() {
    setPaymentReminder({ show: false });
  }

  return (
    <div className="parent-app">
      <Header
        child={child}
        notifications={notifications}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNotificationsOpened={markNotificationsRead}
      />

      <PayBanner reminder={paymentReminder} onMarkPaid={markPaymentPaid} />

      <main className="shell">
        {activeTab === 'lessons' && <LessonsTab lessons={lessons} />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} onToggle={toggleTask} />}
        {activeTab === 'points' && <PointsTab subjects={subjects} />}
        {activeTab === 'attendance' && <AttendanceTab attendance={attendance} />}
      </main>

      <footer>فضاء الطفل — لوحة الوالدين</footer>
    </div>
  );
}