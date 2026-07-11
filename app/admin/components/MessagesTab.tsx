'use client';

import { useState } from 'react';
import type { MessageLogItem, Student, Teacher } from '../types';

interface Props {
  students: Student[];
  teachers: Teacher[];
  messagesLog: MessageLogItem[];
  onSendBroadcast: (audience: string, text: string) => void;
  onSendIndividual: (studentId: number, text: string) => void;
  onSendTeacherMessage: (audienceValue: string, text: string) => void;
}

const BROADCAST_TEMPLATES = [
  { label: '🚫 لا يوجد دراسة غدًا', text: 'تعليق الدراسة غدًا لظروف طارئة.' },
  { label: '🎉 عيد سعيد', text: 'عيدكم مبارك وكل عام وأنتم بخير 🎉' },
  { label: '🗓️ اجتماع أولياء الأمور', text: 'اجتماع أولياء الأمور يوم السبت القادم على الساعة 10 صباحًا.' },
];

export default function MessagesTab({
  students,
  teachers,
  messagesLog,
  onSendBroadcast,
  onSendIndividual,
  onSendTeacherMessage,
}: Props) {
  const activeStudents = students.filter((s) => s.status === 'active');
  const activeTeachers = teachers.filter((t) => t.status === 'active');

  const [bcAudience, setBcAudience] = useState('الجميع');
  const [bcMessage, setBcMessage] = useState('');

  const [indStudentId, setIndStudentId] = useState<string>(activeStudents[0]?.id.toString() || '');
  const [indMessage, setIndMessage] = useState('');

  const [teacherAudience, setTeacherAudience] = useState('all');
  const [teacherMessage, setTeacherMessage] = useState('');

  function handleBroadcast() {
    const text = bcMessage.trim();
    if (!text) {
      alert('يرجى كتابة نص الإشعار');
      return;
    }
    onSendBroadcast(bcAudience, text);
    setBcMessage('');
  }

  function handleIndividual() {
    const text = indMessage.trim();
    if (!indStudentId) {
      alert('يرجى اختيار تلميذ');
      return;
    }
    if (!text) {
      alert('يرجى كتابة نص الرسالة');
      return;
    }
    onSendIndividual(Number(indStudentId), text);
    setIndMessage('');
  }

  function handlePaymentTemplate() {
    const student = activeStudents.find((s) => s.id === Number(indStudentId));
    const studentName = student ? `${student.name} ${student.lastname}` : 'التلميذ';
    setIndMessage(`تذكير: تبقى أسبوع واحد على موعد دفع رسوم ${studentName}، يرجى الدفع في مقر المدرسة.`);
  }

  function handleTeacherMessage() {
    const text = teacherMessage.trim();
    if (!text) {
      alert('يرجى كتابة نص الرسالة');
      return;
    }
    onSendTeacherMessage(teacherAudience, text);
    setTeacherMessage('');
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sun)', color: '#4A3A0A' }}>📣</div>
            <h2>إشعار جماعي</h2>
          </div>
        </div>
        <div className="admin-grid">
          <div>
            <label>الجهة المستقبلة</label>
            <select value={bcAudience} onChange={(e) => setBcAudience(e.target.value)}>
              <option value="الجميع">الجميع</option>
              <option value="الأساتذة">الأساتذة فقط</option>
              <option value="التلاميذ">التلاميذ / أولياء الأمور فقط</option>
            </select>
          </div>
          <div>
            <label>نص الإشعار</label>
            <input type="text" placeholder="اكتب نص الإشعار هنا" value={bcMessage} onChange={(e) => setBcMessage(e.target.value)} />
          </div>
        </div>
        <div className="quick-templates">
          {BROADCAST_TEMPLATES.map((t) => (
            <button key={t.label} className="tmpl-btn" onClick={() => setBcMessage(t.text)}>{t.label}</button>
          ))}
        </div>
        <button className="btn btn-sage" onClick={handleBroadcast}>إرسال الإشعار</button>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--blush)' }}>✉️</div>
            <h2>رسالة فردية لتلميذ</h2>
          </div>
        </div>
        <div className="admin-grid">
          <div>
            <label>اختر التلميذ</label>
            <select value={indStudentId} onChange={(e) => setIndStudentId(e.target.value)}>
              {activeStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name} {s.lastname}</option>
              ))}
            </select>
          </div>
          <div>
            <label>نص الرسالة</label>
            <input
              type="text"
              placeholder="اكتب رسالة خاصة بهذا التلميذ"
              value={indMessage}
              onChange={(e) => setIndMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="quick-templates">
          <button className="tmpl-btn" onClick={handlePaymentTemplate}>⏰ تذكير: تبقى أسبوع للدفع</button>
        </div>
        <button className="btn" style={{ background: 'var(--blush)', color: '#fff' }} onClick={handleIndividual}>
          إرسال الرسالة
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sky)' }}>👩‍🏫</div>
            <h2>إشعار للأساتذة</h2>
          </div>
        </div>
        <div className="admin-grid">
          <div>
            <label>الجهة المستقبلة</label>
            <select value={teacherAudience} onChange={(e) => setTeacherAudience(e.target.value)}>
              <option value="all">كل الأساتذة</option>
              {activeTeachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} {t.lastname}</option>
              ))}
            </select>
          </div>
          <div>
            <label>نص الرسالة</label>
            <input
              type="text"
              placeholder="اكتب رسالة لأستاذ محدد أو لكل الأساتذة"
              value={teacherMessage}
              onChange={(e) => setTeacherMessage(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-sky" onClick={handleTeacherMessage}>إرسال</button>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sky)' }}>🗒️</div>
            <h2>سجل الرسائل المرسلة</h2>
          </div>
        </div>
        <div id="messages-log">
          {messagesLog.length === 0 ? (
            <div className="empty-msg">لم يتم إرسال أي رسائل بعد.</div>
          ) : (
            [...messagesLog].reverse().map((m) => {
              let icon = '✉️';
              let color = 'var(--blush-dark)';
              let audLabel = `رسالة فردية إلى: ${m.audience}`;
              if (m.kind === 'broadcast') {
                icon = '📣'; color = 'var(--sun-dark)'; audLabel = `إشعار جماعي إلى: ${m.audience}`;
              } else if (m.kind === 'teacher') {
                icon = '👩‍🏫'; color = 'var(--sky-dark)'; audLabel = `رسالة للأساتذة إلى: ${m.audience}`;
              }
              return (
                <div className="log-item" key={m.id} data-msg-id={m.id}>
                  <div className="log-icon" style={{ background: color }}>{icon}</div>
                  <div className="log-body">
                    <div className="aud">{audLabel}</div>
                    <div className="txt">{m.text}</div>
                  </div>
                  <div className="log-time">{m.time}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}