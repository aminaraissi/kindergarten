'use client';

import { useState } from 'react';
import type { ClassItem, Student, Teacher } from '../types';
import { STATUS_LABEL } from '../types';

interface Props {
  classes: ClassItem[];
  teachers: Teacher[];
  students: Student[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onArchive: (id: number) => void;
  onReactivate: (id: number) => void;
  onSave: (id: number, patch: Partial<ClassItem>) => void;
  onAdd: (data: Omit<ClassItem, 'id' | 'status'>) => void;
  onAssignStudent: (studentId: number, classId: number) => void;
}

const emptyForm = { name: '', teacherId: '', capacity: '' };

export default function ClassesTab({
  classes,
  teachers,
  students,
  onAccept,
  onReject,
  onArchive,
  onReactivate,
  onSave,
  onAdd,
  onAssignStudent,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<ClassItem>>({});
  const [form, setForm] = useState(emptyForm);
  const [assignSelections, setAssignSelections] = useState<Record<number, string>>({});

  const order: Record<string, number> = { pending: 0, active: 1, archived: 2 };
  const sorted = [...classes].sort((a, b) => order[a.status] - order[b.status]);
  const unassigned = students.filter((s) => s.status === 'active' && !s.sectionId);
  const activeTeachers = teachers.filter((t) => t.status === 'active');

  function startEdit(c: ClassItem) {
    setEditingId(c.id);
    setDraft({ ...c });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  function saveEdit(id: number) {
    onSave(id, draft);
    setEditingId(null);
    setDraft({});
  }

  function handleAdd() {
    if (!form.name.trim()) {
      alert('يرجى إدخال اسم القسم');
      return;
    }
    onAdd({
      name: form.name.trim(),
      teacherId: form.teacherId ? Number(form.teacherId) : null,
      capacity: form.capacity.trim(),
    });
    setForm(emptyForm);
  }

  function handleAssign(classId: number) {
    const val = assignSelections[classId];
    if (!val) {
      alert('يرجى اختيار تلميذ');
      return;
    }
    onAssignStudent(Number(val), classId);
    setAssignSelections((s) => ({ ...s, [classId]: '' }));
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--blush)' }}>🏫</div>
            <h2>إدارة الأقسام</h2>
          </div>
        </div>

        <div id="list-classes">
          {sorted.length === 0 && <div className="empty-msg">لا توجد أقسام.</div>}
          {sorted.map((c) => {
            const isEditing = editingId === c.id;
            const teacher = teachers.find((t) => t.id === c.teacherId);
            const teacherName = teacher ? `${teacher.name} ${teacher.lastname}` : '— بدون أستاذ —';
            const enrolled = students.filter((s) => s.sectionId === c.id);

            return (
              <div className="ent-row" key={c.id} data-id={c.id}>
                {isEditing ? (
                  <>
                    <div className="ent-icon" style={{ background: 'var(--blush)' }}>🏫</div>
                    <div className="ent-body" style={{ width: '100%' }}>
                      <div className="edit-grid">
                        <div>
                          <label>اسم القسم</label>
                          <input
                            type="text"
                            value={draft.name || ''}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label>المعلم المسؤول</label>
                          <select
                            value={draft.teacherId ?? ''}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, teacherId: e.target.value ? Number(e.target.value) : null }))
                            }
                          >
                            <option value="">— بدون أستاذ —</option>
                            {activeTeachers.map((t) => (
                              <option key={t.id} value={t.id}>{t.name} {t.lastname}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label>السعة القصوى</label>
                          <input
                            type="text"
                            value={draft.capacity || ''}
                            onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <button className="abtn save" onClick={() => saveEdit(c.id)}>حفظ</button>
                        <button className="abtn cancel" onClick={cancelEdit}>إلغاء</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ent-icon" style={{ background: 'var(--blush)' }}>🏫</div>
                    <div className="ent-body">
                      <div className="ent-title">
                        {c.name}
                        <span className={`status-badge ${c.status}`}>{STATUS_LABEL[c.status]}</span>
                      </div>
                      <div className="ent-sub">
                        المعلم: {teacherName} · السعة: {c.capacity || '—'} · عدد التلاميذ: {enrolled.length}
                      </div>
                      {enrolled.length > 0 && (
                        <div className="enrolled-list">
                          {enrolled.map((s) => `${s.name} ${s.lastname}`).join('، ')}
                        </div>
                      )}
                      {c.status === 'active' && (
                        <div className="assign-row">
                          <select
                            value={assignSelections[c.id] || ''}
                            onChange={(e) =>
                              setAssignSelections((s) => ({ ...s, [c.id]: e.target.value }))
                            }
                          >
                            <option value="">
                              {unassigned.length ? 'اختر تلميذًا غير معيّن...' : 'لا يوجد تلاميذ غير معيّنين حاليًا'}
                            </option>
                            {unassigned.map((s) => (
                              <option key={s.id} value={s.id}>{s.name} {s.lastname}</option>
                            ))}
                          </select>
                          <button
                            className="abtn accept"
                            disabled={unassigned.length === 0}
                            onClick={() => handleAssign(c.id)}
                          >
                            إضافة إلى القسم
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="ent-actions">
                      {c.status === 'pending' && (
                        <>
                          <button className="abtn accept" onClick={() => onAccept(c.id)}>قبول</button>
                          <button className="abtn reject" onClick={() => onReject(c.id)}>رفض</button>
                          <button className="abtn edit" onClick={() => startEdit(c)}>تعديل</button>
                        </>
                      )}
                      {c.status === 'active' && (
                        <>
                          <button className="abtn edit" onClick={() => startEdit(c)}>تعديل</button>
                          <button className="abtn archive" onClick={() => onArchive(c.id)}>أرشفة</button>
                        </>
                      )}
                      {c.status === 'archived' && (
                        <button className="abtn reactivate" onClick={() => onReactivate(c.id)}>إعادة تفعيل</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="add-new-box">
          <h3>➕ إضافة قسم مباشرة</h3>
          <div className="edit-grid">
            <div>
              <label>اسم القسم</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label>المعلم المسؤول</label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">— بدون أستاذ —</option>
                {activeTeachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} {t.lastname}</option>
                ))}
              </select>
            </div>
            <div>
              <label>السعة القصوى</label>
              <input
                type="text"
                placeholder="مثال: 20"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" style={{ background: 'var(--blush)', color: '#fff' }} onClick={handleAdd}>
              إضافة القسم
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}