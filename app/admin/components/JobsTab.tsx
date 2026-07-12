'use client';

import { useState } from 'react';
import type { JobApplication, JobListing } from '../types';

interface Props {
  jobs: JobListing[];
  applications: JobApplication[];
  onAdd: (data: Omit<JobListing, 'id' | 'status'>) => void;
  onSave: (id: number, patch: Partial<JobListing>) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onMarkApplicationRead: (id: number) => void;
  onDeleteApplication: (id: number) => void;
}

const emptyForm = { title: '', type: '', location: '', desc: '' };

export default function JobsTab({
  jobs,
  applications,
  onAdd,
  onSave,
  onDelete,
  onToggleStatus,
  onMarkApplicationRead,
  onDeleteApplication,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);

  function startEdit(j: JobListing) {
    setEditingId(j.id);
    setDraft({ title: j.title, type: j.type, location: j.location, desc: j.desc });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyForm);
  }

  function saveEdit(id: number) {
    if (!draft.title.trim()) {
      alert('يرجى إدخال عنوان الوظيفة');
      return;
    }
    onSave(id, draft);
    setEditingId(null);
    setDraft(emptyForm);
  }

  function handleAdd() {
    if (!form.title.trim()) {
      alert('يرجى إدخال عنوان الوظيفة');
      return;
    }
    onAdd(form);
    setForm(emptyForm);
  }

  const unreadCount = applications.filter((a) => !a.read).length;

  return (
    <section className="page active">
      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--blush)' }}>💼</div>
            <h2>عروض العمل الشاغرة</h2>
          </div>
        </div>

        <div id="list-jobs">
          {jobs.length === 0 && <div className="empty-msg">لا توجد عروض عمل مضافة بعد.</div>}
          {jobs.map((j) => {
            const isEditing = editingId === j.id;
            return (
              <div className="ent-row" key={j.id} data-id={j.id}>
                {isEditing ? (
                  <div className="ent-body" style={{ width: '100%' }}>
                    <div className="edit-grid">
                      <div><label>عنوان الوظيفة</label><input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
                      <div><label>نوع الدوام</label><input type="text" placeholder="مثال: دوام كامل" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} /></div>
                      <div><label>المكان</label><input type="text" placeholder="مثال: داخل الروضة" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label>الوصف</label><input type="text" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} /></div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button className="abtn save" onClick={() => saveEdit(j.id)}>حفظ</button>
                      <button className="abtn cancel" onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="ent-icon" style={{ background: 'var(--blush)' }}>💼</div>
                    <div className="ent-body">
                      <div className="ent-title">
                        {j.title}
                        <span className={`status-badge ${j.status === 'open' ? 'active' : 'archived'}`}>
                          {j.status === 'open' ? 'شاغرة' : 'مغلقة'}
                        </span>
                      </div>
                      <div className="ent-sub">{[j.type, j.location].filter(Boolean).join(' · ')}</div>
                      {j.desc && <div className="ent-sub" style={{ marginTop: 4 }}>{j.desc}</div>}
                    </div>
                    <div className="ent-actions">
                      <button className="abtn edit" onClick={() => startEdit(j)}>تعديل</button>
                      <button className="abtn archive" onClick={() => onToggleStatus(j.id)}>
                        {j.status === 'open' ? 'إغلاق' : 'إعادة فتح'}
                      </button>
                      <button className="abtn reject" onClick={() => onDelete(j.id)}>حذف</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="add-new-box">
          <h3>➕ إضافة عرض عمل جديد</h3>
          <div className="edit-grid">
            <div><label>عنوان الوظيفة</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label>نوع الدوام</label><input type="text" placeholder="مثال: دوام كامل" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
            <div><label>المكان</label><input type="text" placeholder="مثال: داخل الروضة" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label>الوصف</label><input type="text" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" style={{ background: 'var(--blush)', color: '#fff' }} onClick={handleAdd}>إضافة العرض</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sage)' }}>📥</div>
            <h2>طلبات التوظيف المستلمة {unreadCount > 0 && `(${unreadCount} جديد)`}</h2>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty-msg">
            لم تُستلم أي طلبات توظيف بعد. سترد هنا الطلبات المُرسَلة من صفحة &quot;وظائف شاغرة&quot; في الموقع العام
            بمجرد ربط نموذج التقديم بواجهة برمجية (API) حقيقية.
          </div>
        ) : (
          <div id="list-applications">
            {[...applications].reverse().map((a) => (
              <div className="log-item" key={a.id} data-id={a.id} style={{ opacity: a.read ? 0.75 : 1 }}>
                <div className="log-icon" style={{ background: 'var(--sage)' }}>👤</div>
                <div className="log-body">
                  <div className="aud">
                    {a.jobTitle || 'دون تحديد وظيفة'} · {a.phone} {a.email ? `· ${a.email}` : ''}
                  </div>
                  <div className="txt">{a.applicantName}: {a.message}</div>
                </div>
                <div className="ent-actions" style={{ flexDirection: 'column', gap: 6 }}>
                  {!a.read && (
                    <button className="abtn accept" onClick={() => onMarkApplicationRead(a.id)}>تمت المراجعة</button>
                  )}
                  <button className="abtn reject" onClick={() => onDeleteApplication(a.id)}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}