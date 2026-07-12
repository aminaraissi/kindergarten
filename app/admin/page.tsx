'use client';

import { useEffect, useRef, useState } from 'react';
import './admin.css';
import Header from './components/Header';
import StatsTab from './components/StatsTab';
import StudentsTab from './components/StudentsTab';
import TeachersTab from './components/TeachersTab';
import ClassesTab from './components/ClassesTab';
import MessagesTab from './components/MessagesTab';
import PricingTab from './components/PricingTab';
import EventsTab from './components/EventsTab';
import JobsTab from './components/JobsTab';
import type {
  ActivityLogItem,
  ClassItem,
  EventItem,
  JobApplication,
  JobListing,
  LogTarget,
  MessageLogItem,
  PricingPlan,
  Student,
  TabKey,
  Teacher,
} from './types';
import { emptyParentInfo } from './types';
import { formatDate, paymentStatus } from './utils';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('stats');

  // NOTE: all state below starts empty on purpose (no demo/sample data).
  // Replace these with real data fetched from your API / database.
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [messagesLog, setMessagesLog] = useState<MessageLogItem[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const [highlightTarget, setHighlightTarget] = useState<LogTarget | null>(null);

  const nextIds = useRef({
    students: 1,
    teachers: 1,
    classes: 1,
    log: 1,
    messages: 1,
    pricing: 1,
    events: 1,
    jobs: 1,
    applications: 1,
  });

  function makeTarget(page: TabKey, id?: number, containerId?: string): LogTarget {
    if (id === undefined) return { page };
    return { page, selector: `#${containerId} [data-id="${id}"]` };
  }

  function pushLog(icon: string, color: string, title: string, target?: LogTarget | null) {
    const id = nextIds.current.log++;
    setActivityLog((prev) => [...prev, { id, icon, color, title, time: 'الآن', read: false, target }]);
  }

  /* ---------------- Students ---------------- */
  function addStudent(data: Partial<Student> & { name: string; lastname: string }) {
    const id = nextIds.current.students++;
    const student: Student = {
      id,
      status: 'active',
      photo: data.photo || '',
      lastPaymentDate: data.lastPaymentDate || '',
      paidMonths: data.paidMonths ?? null,
      weekReminderSent: false,
      name: data.name,
      lastname: data.lastname,
      dob: data.dob || '',
      pob: data.pob || '',
      address: data.address || '',
      health: data.health || '',
      note: '',
      motherEnabled: false,
      mother: emptyParentInfo(),
      fatherEnabled: false,
      father: emptyParentInfo(),
      guardians: [],
      sectionId: data.sectionId ?? null,
    };
    setStudents((prev) => [...prev, student]);
    pushLog('🧒', 'var(--sage)', `تمت إضافة تلميذ جديد: ${student.name} ${student.lastname}`, makeTarget('students', id, 'list-students'));
  }

  function updateStudent(id: number, patch: Partial<Student>) {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const prevKey = `${s.lastPaymentDate}|${s.paidMonths}`;
        const updated = { ...s, ...patch };
        const newKey = `${updated.lastPaymentDate}|${updated.paidMonths}`;
        if (prevKey !== newKey) updated.weekReminderSent = false;
        return updated;
      })
    );
    const s = students.find((x) => x.id === id);
    pushLog('🧒', 'var(--sage)', `تم تعديل بيانات: ${patch.name ?? s?.name ?? ''} ${patch.lastname ?? s?.lastname ?? ''}`.trim(), makeTarget('students', id, 'list-students'));
  }

  function acceptStudent(id: number) {
    const s = students.find((x) => x.id === id);
    setStudents((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'active' } : x)));
    pushLog('🧒', 'var(--sage)', `تم قبول: ${s?.name} ${s?.lastname}`, makeTarget('students', id, 'list-students'));
  }

  function rejectStudent(id: number) {
    const s = students.find((x) => x.id === id);
    setStudents((prev) => prev.filter((x) => x.id !== id));
    pushLog('✕', 'var(--danger)', `تم رفض طلب: ${s?.name} ${s?.lastname}`, makeTarget('students'));
  }

  function archiveStudent(id: number) {
    const s = students.find((x) => x.id === id);
    setStudents((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'archived' } : x)));
    pushLog('🧒', 'var(--ink-soft)', `تمت أرشفة: ${s?.name} ${s?.lastname}`, makeTarget('students', id, 'list-students'));
  }

  function reactivateStudent(id: number) {
    const s = students.find((x) => x.id === id);
    setStudents((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'active' } : x)));
    pushLog('🧒', 'var(--sage)', `إعادة تفعيل: ${s?.name} ${s?.lastname}`, makeTarget('students', id, 'list-students'));
  }

  /* ---------------- Teachers ---------------- */
  function addTeacher(data: Omit<Teacher, 'id' | 'status'>) {
    const id = nextIds.current.teachers++;
    setTeachers((prev) => [...prev, { id, status: 'active', ...data }]);
    pushLog('👩‍🏫', 'var(--sky)', `تمت إضافة أستاذ جديد: ${data.name} ${data.lastname}`, makeTarget('teachers', id, 'list-teachers'));
  }

  function updateTeacher(id: number, patch: Partial<Teacher>) {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const t = teachers.find((x) => x.id === id);
    pushLog('👩‍🏫', 'var(--sky)', `تم تعديل بيانات: ${patch.name ?? t?.name ?? ''} ${patch.lastname ?? t?.lastname ?? ''}`.trim(), makeTarget('teachers', id, 'list-teachers'));
  }

  function acceptTeacher(id: number) {
    const t = teachers.find((x) => x.id === id);
    setTeachers((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'active' } : x)));
    pushLog('👩‍🏫', 'var(--sky)', `تم قبول: ${t?.name} ${t?.lastname}`, makeTarget('teachers', id, 'list-teachers'));
  }

  function rejectTeacher(id: number) {
    const t = teachers.find((x) => x.id === id);
    setTeachers((prev) => prev.filter((x) => x.id !== id));
    pushLog('✕', 'var(--danger)', `تم رفض طلب: ${t?.name} ${t?.lastname}`, makeTarget('teachers'));
  }

  function archiveTeacher(id: number) {
    const t = teachers.find((x) => x.id === id);
    setTeachers((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'archived' } : x)));
    pushLog('👩‍🏫', 'var(--ink-soft)', `تمت أرشفة: ${t?.name} ${t?.lastname}`, makeTarget('teachers', id, 'list-teachers'));
  }

  function reactivateTeacher(id: number) {
    const t = teachers.find((x) => x.id === id);
    setTeachers((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'active' } : x)));
    pushLog('👩‍🏫', 'var(--sky)', `إعادة تفعيل: ${t?.name} ${t?.lastname}`, makeTarget('teachers', id, 'list-teachers'));
  }

  /* ---------------- Classes ---------------- */
  function addClass(data: Omit<ClassItem, 'id' | 'status'>) {
    const id = nextIds.current.classes++;
    setClasses((prev) => [...prev, { id, status: 'active', ...data }]);
    pushLog('🏫', 'var(--blush)', `تمت إضافة قسم جديد: ${data.name}`, makeTarget('classes', id, 'list-classes'));
  }

  function updateClass(id: number, patch: Partial<ClassItem>) {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const c = classes.find((x) => x.id === id);
    pushLog('🏫', 'var(--blush)', `تم تعديل قسم: ${patch.name ?? c?.name ?? ''}`, makeTarget('classes', id, 'list-classes'));
  }

  function acceptClass(id: number) {
    const c = classes.find((x) => x.id === id);
    setClasses((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'active' } : x)));
    pushLog('🏫', 'var(--blush)', `تم قبول القسم: ${c?.name}`, makeTarget('classes', id, 'list-classes'));
  }

  function rejectClass(id: number) {
    const c = classes.find((x) => x.id === id);
    setClasses((prev) => prev.filter((x) => x.id !== id));
    pushLog('✕', 'var(--danger)', `تم رفض القسم: ${c?.name}`, makeTarget('classes'));
  }

  function archiveClass(id: number) {
    const c = classes.find((x) => x.id === id);
    setClasses((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'archived' } : x)));
    pushLog('🏫', 'var(--ink-soft)', `تمت أرشفة القسم: ${c?.name}`, makeTarget('classes', id, 'list-classes'));
  }

  function reactivateClass(id: number) {
    const c = classes.find((x) => x.id === id);
    setClasses((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'active' } : x)));
    pushLog('🏫', 'var(--blush)', `إعادة تفعيل القسم: ${c?.name}`, makeTarget('classes', id, 'list-classes'));
  }

  function assignStudentToClass(studentId: number, classId: number) {
    const student = students.find((x) => x.id === studentId);
    const cls = classes.find((x) => x.id === classId);
    setStudents((prev) => prev.map((x) => (x.id === studentId ? { ...x, sectionId: classId } : x)));
    pushLog('🏫', 'var(--blush)', `تم إلحاق ${student?.name} ${student?.lastname} بقسم ${cls?.name}`, makeTarget('classes', classId, 'list-classes'));
  }

  /* ---------------- Messages ---------------- */
  function sendBroadcast(audience: string, text: string) {
    const id = nextIds.current.messages++;
    setMessagesLog((prev) => [...prev, { id, kind: 'broadcast', audience, text, time: 'الآن' }]);
    pushLog('📣', 'var(--sun-dark)', `إشعار جماعي (${audience}): ${text}`, makeTarget('messages', id, 'messages-log'));
  }

  function sendIndividual(studentId: number, text: string) {
    const student = students.find((x) => x.id === studentId);
    const audience = student ? `${student.name} ${student.lastname}` : 'تلميذ';
    const id = nextIds.current.messages++;
    setMessagesLog((prev) => [...prev, { id, kind: 'individual', audience, text, time: 'الآن' }]);
    pushLog('✉️', 'var(--blush-dark)', `رسالة إلى ${audience}: ${text}`, makeTarget('messages', id, 'messages-log'));
  }

  function sendTeacherMessage(audienceValue: string, text: string) {
    let audienceLabel = 'كل الأساتذة';
    if (audienceValue !== 'all') {
      const teacher = teachers.find((x) => x.id === Number(audienceValue));
      audienceLabel = teacher ? `${teacher.name} ${teacher.lastname}` : 'أستاذ';
    }
    const id = nextIds.current.messages++;
    setMessagesLog((prev) => [...prev, { id, kind: 'teacher', audience: audienceLabel, text, time: 'الآن' }]);
    pushLog('👩‍🏫', 'var(--sky-dark)', `رسالة للأساتذة (${audienceLabel}): ${text}`, makeTarget('messages', id, 'messages-log'));
  }

  /* ---------------- Pricing plans ---------------- */
  function addPricingPlan(data: Omit<PricingPlan, 'id'>) {
    const id = nextIds.current.pricing++;
    setPricingPlans((prev) => [...prev, { id, ...data }]);
    pushLog('💳', 'var(--sun-dark)', `تمت إضافة باقة جديدة: ${data.name}`, makeTarget('pricing', id, 'list-pricing'));
  }

  function updatePricingPlan(id: number, patch: Partial<PricingPlan>) {
    setPricingPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    const p = pricingPlans.find((x) => x.id === id);
    pushLog('💳', 'var(--sun-dark)', `تم تعديل باقة: ${patch.name ?? p?.name ?? ''}`, makeTarget('pricing', id, 'list-pricing'));
  }

  function deletePricingPlan(id: number) {
    const p = pricingPlans.find((x) => x.id === id);
    setPricingPlans((prev) => prev.filter((x) => x.id !== id));
    pushLog('🗑️', 'var(--ink-soft)', `تم حذف باقة: ${p?.name}`, makeTarget('pricing'));
  }

  /* ---------------- Events ---------------- */
  function addEvent(data: Omit<EventItem, 'id'>) {
    const id = nextIds.current.events++;
    setEvents((prev) => [...prev, { id, ...data }]);
    pushLog('🗓️', 'var(--sky)', `تمت إضافة حدث جديد: ${data.title}`, makeTarget('events', id, 'list-events'));
  }

  function updateEvent(id: number, patch: Partial<EventItem>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    const e = events.find((x) => x.id === id);
    pushLog('🗓️', 'var(--sky)', `تم تعديل حدث: ${patch.title ?? e?.title ?? ''}`, makeTarget('events', id, 'list-events'));
  }

  function deleteEvent(id: number) {
    const e = events.find((x) => x.id === id);
    setEvents((prev) => prev.filter((x) => x.id !== id));
    pushLog('🗑️', 'var(--ink-soft)', `تم حذف حدث: ${e?.title}`, makeTarget('events'));
  }

  /* ---------------- Jobs & applications ---------------- */
  function addJob(data: Omit<JobListing, 'id' | 'status'>) {
    const id = nextIds.current.jobs++;
    setJobs((prev) => [...prev, { id, status: 'open', ...data }]);
    pushLog('💼', 'var(--blush)', `تمت إضافة عرض عمل جديد: ${data.title}`, makeTarget('jobs', id, 'list-jobs'));
  }

  function updateJob(id: number, patch: Partial<JobListing>) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
    const j = jobs.find((x) => x.id === id);
    pushLog('💼', 'var(--blush)', `تم تعديل عرض عمل: ${patch.title ?? j?.title ?? ''}`, makeTarget('jobs', id, 'list-jobs'));
  }

  function deleteJob(id: number) {
    const j = jobs.find((x) => x.id === id);
    setJobs((prev) => prev.filter((x) => x.id !== id));
    pushLog('🗑️', 'var(--ink-soft)', `تم حذف عرض عمل: ${j?.title}`, makeTarget('jobs'));
  }

  function toggleJobStatus(id: number) {
    const j = jobs.find((x) => x.id === id);
    const nextStatus = j?.status === 'open' ? 'closed' : 'open';
    setJobs((prev) => prev.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)));
    pushLog('💼', 'var(--blush)', `${nextStatus === 'closed' ? 'تم إغلاق' : 'تمت إعادة فتح'} عرض: ${j?.title}`, makeTarget('jobs', id, 'list-jobs'));
  }

  // Called whenever a candidate submits the public application form.
  // Wire this to a real API route / Web3Forms webhook once the public
  // "jobs" section on the homepage posts applications to your backend.
  function receiveApplication(data: Omit<JobApplication, 'id' | 'time' | 'read'>) {
    const id = nextIds.current.applications++;
    setApplications((prev) => [...prev, { id, time: 'الآن', read: false, ...data }]);
    pushLog('📥', 'var(--sage)', `طلب توظيف جديد من: ${data.applicantName}`, makeTarget('jobs', undefined, 'list-applications'));
  }

  function markApplicationRead(id: number) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }

  function deleteApplication(id: number) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  /* ---------------- Automatic payment reminders ----------------
     Scans active students and sends a one-time reminder once their
     next payment is due within a week. */
  useEffect(() => {
    students.forEach((student) => {
      if (student.status !== 'active' || student.weekReminderSent) return;
      const info = paymentStatus(student);
      if (info.status !== 'due_soon') return;

      const text = `تذكير تلقائي: تبقى نحو أسبوع على موعد دفع رسوم ${student.name} ${student.lastname} (الدفعة القادمة بتاريخ ${formatDate(info.nextDate)})، يرجى الدفع في مقر المدرسة.`;
      const msgId = nextIds.current.messages++;
      setMessagesLog((prev) => [...prev, { id: msgId, kind: 'individual', audience: `${student.name} ${student.lastname}`, text, time: 'الآن' }]);
      pushLog('⏰', 'var(--sun-dark)', `تذكير تلقائي بالدفع: ${student.name} ${student.lastname}`, makeTarget('students', student.id, 'list-students'));
      setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, weekReminderSent: true } : s)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  /* ---------------- Notifications navigation ---------------- */
  function handleNotificationClick(target: LogTarget | null | undefined) {
    if (!target) return;
    setActiveTab(target.page);
    setHighlightTarget(target);
  }

  useEffect(() => {
    if (!highlightTarget) return;
    const timer = setTimeout(() => {
      if (highlightTarget.selector) {
        const el = document.querySelector(highlightTarget.selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('glow-highlight');
          setTimeout(() => el.classList.remove('glow-highlight'), 1700);
        }
      }
      setHighlightTarget(null);
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightTarget]);

  function markLogRead() {
    setActivityLog((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="admin-app">
      <Header
        activityLog={activityLog}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPanelOpened={markLogRead}
        onNotificationClick={handleNotificationClick}
      />

      <main className="shell">
        {activeTab === 'stats' && <StatsTab students={students} teachers={teachers} classes={classes} />}

        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            classes={classes}
            onAccept={acceptStudent}
            onReject={rejectStudent}
            onArchive={archiveStudent}
            onReactivate={reactivateStudent}
            onSave={updateStudent}
            onAdd={addStudent}
          />
        )}

        {activeTab === 'teachers' && (
          <TeachersTab
            teachers={teachers}
            onAccept={acceptTeacher}
            onReject={rejectTeacher}
            onArchive={archiveTeacher}
            onReactivate={reactivateTeacher}
            onSave={updateTeacher}
            onAdd={addTeacher}
          />
        )}

        {activeTab === 'classes' && (
          <ClassesTab
            classes={classes}
            teachers={teachers}
            students={students}
            onAccept={acceptClass}
            onReject={rejectClass}
            onArchive={archiveClass}
            onReactivate={reactivateClass}
            onSave={updateClass}
            onAdd={addClass}
            onAssignStudent={assignStudentToClass}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTab
            plans={pricingPlans}
            onAdd={addPricingPlan}
            onSave={updatePricingPlan}
            onDelete={deletePricingPlan}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab
            events={events}
            onAdd={addEvent}
            onSave={updateEvent}
            onDelete={deleteEvent}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsTab
            jobs={jobs}
            applications={applications}
            onAdd={addJob}
            onSave={updateJob}
            onDelete={deleteJob}
            onToggleStatus={toggleJobStatus}
            onMarkApplicationRead={markApplicationRead}
            onDeleteApplication={deleteApplication}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesTab
            students={students}
            teachers={teachers}
            messagesLog={messagesLog}
            onSendBroadcast={sendBroadcast}
            onSendIndividual={sendIndividual}
            onSendTeacherMessage={sendTeacherMessage}
          />
        )}
      </main>

      <footer>فضاء الطفل — لوحة تحكم الإدارة</footer>
    </div>
  );
}