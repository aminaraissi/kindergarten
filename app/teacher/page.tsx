"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

/* =========================================================
   Types
========================================================= */
type AttStatus = "present" | "absent" | "late";
type TabId = "students" | "attendance" | "lessons" | "note" | "schedule";

interface Subject {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Student {
  id: number;
  name: string;
  seed: string;
  points: number;
}

interface LessonFeedItem {
  id: number;
  icon: string;
  subject: string;
  title: string;
  desc: string;
  date: string;
}

interface NoteFeedItem {
  id: number;
  icon: string;
  student: string;
  type: string;
  text: string;
  date: string;
}

interface Notification {
  id: number;
  icon: string;
  color: string;
  title: string;
  time: string;
  read: boolean;
}

interface ScheduleCell {
  subject: string;
  room: string;
}

const ATT_LABELS: Record<AttStatus, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
};

// جدول الحصص لسع ماعندوش جدول ديال قاعدة البيانات — باقي ثابت (static) حاليًا
const SCHEDULE_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const SCHEDULE_SLOTS = ["08:00-09:00", "09:00-10:00", "10:15-11:15", "11:15-12:15"];
const SCHEDULE_GRID: (ScheduleCell | null)[][] = [
  [{ subject: "اللغة العربية", room: "قاعة 3" }, { subject: "النشاط الفني", room: "قاعة 3" }, null, { subject: "السلوك والقيم", room: "قاعة 3" }],
  [{ subject: "الرياضيات", room: "قاعة 3" }, null, { subject: "اللغة العربية", room: "قاعة 3" }, null],
  [null, { subject: "النشاط الفني", room: "قاعة 3" }, { subject: "الرياضيات", room: "قاعة 3" }, null],
  [{ subject: "اللغة العربية", room: "قاعة 3" }, { subject: "الرياضيات", room: "قاعة 3" }, null, null],
  [null, { subject: "السلوك والقيم", room: "قاعة 3" }, { subject: "النشاط الفني", room: "قاعة 3" }, { subject: "اللغة العربية", room: "قاعة 3" }],
  [{ subject: "الرياضيات", room: "قاعة 3" }, null, null, { subject: "النشاط الفني", room: "قاعة 3" }],
];

const NOTE_TYPES: { value: string; icon: string; label: string }[] = [
  { value: "positive", icon: "👍", label: "ملاحظة إيجابية" },
  { value: "behavior", icon: "⚠️", label: "تنبيه سلوكي" },
  { value: "academic", icon: "📚", label: "ملاحظة دراسية" },
  { value: "health", icon: "🏥", label: "ملاحظة صحية" },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherPage() {
  const router = useRouter();

  /* ---------------- profile / nav ---------------- */
  const [teacherName, setTeacherName] = useState("");
  const [className, setClassName] = useState("");
  const [classId, setClassId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("students");
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ---------------- data ---------------- */
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<Record<number, AttStatus>>({});
  const [attDate, setAttDate] = useState(todayISO());
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [lessonsFeed, setLessonsFeed] = useState<LessonFeedItem[]>([]);
  const [newLessonSubject, setNewLessonSubject] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");

  const [notesFeed, setNotesFeed] = useState<NoteFeedItem[]>([]);
  const [noteStudentId, setNoteStudentId] = useState<number | null>(null);
  const [noteTypeValue, setNoteTypeValue] = useState(NOTE_TYPES[0].value);
  const [noteText, setNoteText] = useState("");

  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* ---------------- initial load ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) {
          router.push("/login");
          return;
        }
        setTeacherName(meData.user.fullName);

        const [studentsRes, subjectsRes, lessonsRes, notesRes, notifRes] = await Promise.all([
          fetch("/api/teacher/students"),
          fetch("/api/teacher/subjects"),
          fetch("/api/teacher/lessons"),
          fetch("/api/teacher/notes"),
          fetch("/api/teacher/notifications"),
        ]);

        const studentsData = await studentsRes.json();
        const subjectsData = await subjectsRes.json();
        const lessonsData = await lessonsRes.json();
        const notesData = await notesRes.json();
        const notifData = await notifRes.json();

        setClassId(studentsData.classId);
        setClassName(studentsData.className || "بلا قسم بعد");
        setStudents(studentsData.students || []);
        setSubjects(subjectsData.subjects || []);
        if (subjectsData.subjects?.[0]) setNewLessonSubject(subjectsData.subjects[0].id);
        if (studentsData.students?.[0]) setNoteStudentId(studentsData.students[0].id);
        setLessonsFeed(lessonsData.lessons || []);
        setNotesFeed(notesData.notes || []);
        setNotifications(notifData.notifications || []);
      } catch (err) {
        console.error(err);
        setLoadError("تعذر تحميل بيانات القسم، تأكد من الاتصال بقاعدة البيانات");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- attendance for selected date ---------------- */
  const loadAttendance = useCallback(async (date: string) => {
    const res = await fetch(`/api/teacher/attendance?date=${date}`);
    const data = await res.json();
    setAttendanceToday(data.statusByStudent || {});
  }, []);

  useEffect(() => {
    if (!loading) loadAttendance(attDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attDate, loading]);

  /* ---------------- helpers ---------------- */
  async function toggleNotifPanel() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await fetch("/api/teacher/notifications", { method: "PATCH" });
    }
  }

  function setStudentStatus(studentId: number, status: AttStatus) {
    setAttendanceToday((prev) => ({ ...prev, [studentId]: status }));
  }

  async function handleAddLesson() {
    const subj = subjects.find((s) => s.id === newLessonSubject);
    const title = newLessonTitle.trim();
    if (!subj || !title) {
      alert("يرجى إدخال عنوان النشاط أو الدرس");
      return;
    }
    const res = await fetch("/api/teacher/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: subj.id, title, desc: newLessonDesc.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "تعذر إضافة الدرس");
      return;
    }
    setLessonsFeed((prev) => [
      { id: Date.now(), icon: subj.icon, subject: subj.name, title, desc: newLessonDesc.trim() || "بدون وصف إضافي", date: "الآن" },
      ...prev,
    ]);
    setNewLessonTitle("");
    setNewLessonDesc("");
    fetch("/api/teacher/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []));
  }

  async function handleSendNote() {
    const student = students.find((s) => s.id === noteStudentId);
    const noteType = NOTE_TYPES.find((t) => t.value === noteTypeValue)!;
    const text = noteText.trim();
    if (!student || !text) {
      alert("يرجى كتابة نص الملاحظة");
      return;
    }
    const res = await fetch("/api/teacher/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, noteType: noteType.value, text }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "تعذر إرسال الملاحظة");
      return;
    }
    setNotesFeed((prev) => [
      { id: Date.now(), icon: noteType.icon, student: student.name, type: noteType.label.replace("ملاحظة ", ""), text, date: "الآن" },
      ...prev,
    ]);
    setNoteText("");
    fetch("/api/teacher/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []));
  }

  async function handleSaveAttendance() {
    if (!attDate) {
      alert("يرجى اختيار التاريخ");
      return;
    }
    const entries = Object.entries(attendanceToday).map(([id, status]) => ({
      studentId: +id,
      status: status as AttStatus,
    }));
    if (entries.length === 0) {
      alert("يرجى تحديد حالة كل تلميذ قبل الحفظ");
      return;
    }
    setSavingAttendance(true);
    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: attDate, entries }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "تعذر حفظ الحضور");
        return;
      }
      const notifRes = await fetch("/api/teacher/notifications");
      const notifData = await notifRes.json();
      setNotifications(notifData.notifications || []);
      alert("تم حفظ الحضور وإرسال الإشعارات لأولياء التلاميذ ✓");
    } finally {
      setSavingAttendance(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const TABS: { id: TabId; label: string }[] = [
    { id: "students", label: "👨‍🎓 تلاميذ القسم" },
    { id: "attendance", label: "🗓️ تسجيل الحضور" },
    { id: "lessons", label: "📘 الدروس والأنشطة" },
    { id: "note", label: "✉️ إرسال ملاحظة" },
    { id: "schedule", label: "📅 جدول حصصي" },
  ];

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: "Almarai, sans-serif", direction: "rtl" }}>جاري التحميل...</div>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="row-main">
          <div className="brand">
            <span className="blocks">
              <span>ط</span>
              <span>ف</span>
            </span>
            فضاء الطفل <span className="demo-tag">لوحة الأستاذ</span>
          </div>

          <div className="row-right">
            <div className="mini-profile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Sara&backgroundColor=c0e8d5" alt="صورة الأستاذة" />
              <div className="mp-info">
                <b>{teacherName}</b>
                <span>قسم {className}</span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <button className="bell-btn" onClick={toggleNotifPanel} title="الإشعارات">
                🔔
                {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
              </button>
              <div className={`notif-panel${notifOpen ? " open" : ""}`}>
                <h4>سجل الإشعارات</h4>
                <div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">لا توجد إشعارات حاليًا.</div>
                  ) : (
                    [...notifications].reverse().map((n) => (
                      <div className="notif-item" key={n.id}>
                        <div className="notif-icon" style={{ background: n.color }}>
                          {n.icon}
                        </div>
                        <div className="txt">
                          <b>{n.title}</b>
                          <span className="time">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>

        <nav className="tabs-row">
          {TABS.map((t) => (
            <button key={t.id} className={activeTab === t.id ? "active" : ""} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="shell">
        {loadError && <div className="login-error" style={{ marginBottom: 16 }}>⚠️ {loadError}</div>}
        {!loadError && !classId && (
          <div className="card">
            <p className="hint" style={{ margin: 0 }}>
              حسابك ماعندوش قسم مرتبط بيه بعد فقاعدة البيانات. تواصل مع الإدارة باش تربط حسابك بقسم (جدول <code>classes</code>، عمود <code>teacher_id</code>).
            </p>
          </div>
        )}

        {activeTab === "students" && (
          <section className="page-fade">
            <div className="card">
              <div className="card-head">
                <div className="ic" style={{ background: "var(--sky)" }}>
                  👨‍🎓
                </div>
                <h2>تلاميذ القسم — {className}</h2>
              </div>
              <p className="hint">قائمة تلاميذ قسمك مع مجموع نقاطهم الحالي.</p>
              <div>
                {students.length === 0 && <div className="empty-msg">لا يوجد تلاميذ فهاد القسم بعد.</div>}
                {students.map((s) => (
                  <div className="student-row" key={s.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${s.seed}`} alt={s.name} />
                    <div className="student-info">
                      <b>{s.name}</b>
                      <span>القسم: {className}</span>
                    </div>
                    <div className="student-pts">{s.points} ن</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "attendance" && (
          <section className="page-fade">
            <div className="card">
              <div className="card-head">
                <div className="ic" style={{ background: "var(--sky-dark)" }}>
                  🗓️
                </div>
                <h2>تسجيل حضور القسم</h2>
              </div>
              <div className="att-toolbar">
                <label>تاريخ اليوم:</label>
                <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} />
              </div>
              <div>
                {students.map((s) => {
                  const current = attendanceToday[s.id];
                  return (
                    <div className="att-row" key={s.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${s.seed}`} alt={s.name} />
                      <div className="nm">{s.name}</div>
                      <div className="att-choices">
                        <button
                          className={`att-choice present${current === "present" ? " sel" : ""}`}
                          onClick={() => setStudentStatus(s.id, "present")}
                        >
                          حاضر
                        </button>
                        <button
                          className={`att-choice late${current === "late" ? " sel" : ""}`}
                          onClick={() => setStudentStatus(s.id, "late")}
                        >
                          متأخر
                        </button>
                        <button
                          className={`att-choice absent${current === "absent" ? " sel" : ""}`}
                          onClick={() => setStudentStatus(s.id, "absent")}
                        >
                          غائب
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="admin-actions">
                <button className="btn btn-sky" onClick={handleSaveAttendance} disabled={savingAttendance}>
                  {savingAttendance ? "جاري الحفظ..." : "💾 حفظ الحضور وإرسال الإشعارات"}
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "lessons" && (
          <section className="page-fade">
            <div className="card">
              <div className="card-head">
                <div className="ic" style={{ background: "var(--sage)" }}>
                  📘
                </div>
                <h2>إضافة درس أو نشاط للقسم</h2>
              </div>
              <p className="hint">كل إضافة هنا تصل مباشرة لجميع أولياء تلاميذ القسم.</p>
              <div className="admin-grid">
                <div>
                  <label>المادة</label>
                  <select
                    value={newLessonSubject ?? ""}
                    onChange={(e) => setNewLessonSubject(+e.target.value)}
                  >
                    {subjects.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>عنوان النشاط / الدرس</label>
                  <input
                    type="text"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="مثال: نشاط الألوان الأساسية"
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>وصف مختصر</label>
                  <input
                    type="text"
                    value={newLessonDesc}
                    onChange={(e) => setNewLessonDesc(e.target.value)}
                    placeholder="مثال: تعرّف الأطفال على الألوان الأولية"
                  />
                </div>
              </div>
              <div className="admin-actions">
                <button className="btn btn-sage" onClick={handleAddLesson}>
                  ＋ إضافة ونشر للقسم
                </button>
              </div>
              <hr className="sep" />
              <h3 style={{ fontSize: 14, margin: "0 0 10px" }}>آخر الدروس والأنشطة المضافة</h3>
              <div>
                {lessonsFeed.length === 0 ? (
                  <div className="empty-msg">لم تتم إضافة أي درس أو نشاط بعد.</div>
                ) : (
                  lessonsFeed.map((l) => (
                    <div className="feed-item" key={l.id}>
                      <div className="feed-icon">{l.icon}</div>
                      <div className="feed-body">
                        <h3>{l.title}</h3>
                        <p>
                          {l.desc} — <b>{l.subject}</b>
                        </p>
                      </div>
                      <div className="feed-date">{l.date}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "note" && (
          <section className="page-fade">
            <div className="card">
              <div className="card-head">
                <div className="ic" style={{ background: "var(--blush)" }}>
                  ✉️
                </div>
                <h2>إرسال ملاحظة لولي التلميذ</h2>
              </div>
              <div className="admin-grid">
                <div>
                  <label>اختر التلميذ</label>
                  <select value={noteStudentId ?? ""} onChange={(e) => setNoteStudentId(+e.target.value)}>
                    {students.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>نوع الملاحظة</label>
                  <select value={noteTypeValue} onChange={(e) => setNoteTypeValue(e.target.value)}>
                    {NOTE_TYPES.map((t) => (
                      <option value={t.value} key={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>نص الملاحظة</label>
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="مثال: كانت ريم متعاونة جدًا اليوم في النشاط الجماعي"
                  />
                </div>
              </div>
              <div className="admin-actions">
                <button className="btn btn-blush" onClick={handleSendNote}>
                  ✉️ إرسال الملاحظة
                </button>
              </div>
              <hr className="sep" />
              <h3 style={{ fontSize: 14, margin: "0 0 10px" }}>الملاحظات المرسلة</h3>
              <div>
                {notesFeed.length === 0 ? (
                  <div className="empty-msg">لم يتم إرسال أي ملاحظة بعد.</div>
                ) : (
                  notesFeed.map((n) => (
                    <div className="feed-item" key={n.id}>
                      <div className="feed-icon">{n.icon}</div>
                      <div className="feed-body">
                        <h3>{n.student}</h3>
                        <p>{n.text}</p>
                      </div>
                      <div className="feed-date">{n.date}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "schedule" && (
          <section className="page-fade">
            <div className="card">
              <div className="card-head">
                <div className="ic" style={{ background: "var(--sun)", color: "#4A3A0A" }}>
                  📅
                </div>
                <h2>جدول حصصي الأسبوعي</h2>
              </div>
              <p className="hint">الجدول ثابت حاليًا.</p>
              <div style={{ overflowX: "auto" }}>
                <table className="sched-table">
                  <tbody>
                    <tr>
                      <th>التوقيت</th>
                      {SCHEDULE_DAYS.map((d) => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                    {SCHEDULE_SLOTS.map((slot, si) => (
                      <tr key={slot}>
                        <th>{slot}</th>
                        {SCHEDULE_DAYS.map((_, di) => {
                          const cell = SCHEDULE_GRID[di]?.[si];
                          return cell ? (
                            <td className="slot-filled" key={di}>
                              {cell.subject}
                              <small>{cell.room}</small>
                            </td>
                          ) : (
                            <td className="slot-empty" key={di}>
                              —
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer"></footer>
    </>
  );
}