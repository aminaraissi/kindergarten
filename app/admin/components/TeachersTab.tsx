'use client';

import { useState } from 'react';
import type { Teacher } from '../types';
import { STATUS_LABEL } from '../types';
import { readImageFile } from '../utils';

interface Props {
  teachers: Teacher[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onArchive: (id: number) => void;
  onReactivate: (id: number) => void;
  onSave: (id: number, patch: Partial<Teacher>) => void;
  onAdd: (data: Omit<Teacher, 'id' | 'status'>) => void;
}

const emptyForm = { name: '', lastname: '', subject: '', phone: '', photo: '' };

export default function TeachersTab({
  teachers,
  onAccept,
  onReject,
  onArchive,
  onReactivate,
  onSave,
  onAdd,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Teacher>>({});
  const [form, setForm] = useState(emptyForm);

  const order: Record<string, number> = { pending: 0, active: 1, archived: 2 };
  const sorted = [...teachers].sort((a, b) => order[a.status] - order[b.status]);

  function startEdit(t: Teacher) {
    setEditingId(t.id);
    setDraft({ ...t });
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

  function handleDraftPhoto(file: File | undefined) {
    if (!file) return;
    readImageFile(file, (dataUrl) => setDraft((d) => ({ ...d, photo: dataUrl })));
  }

  function handleAdd() {
    if (!form.name.trim() || !form.lastname.trim()) {
      alert('يرجى إدخال الاسم واللقب على الأقل');
      return;
    }
    onAdd({
      name: form.name.trim(),
      lastname: form.lastname.trim(),
      subject: form.subject.trim(),
      phone: form.phone.trim(),
      photo: form.photo,
    });
    setForm(emptyForm);
  }

  function handleNewPhoto(file: File | undefined) {
    if (!file) return;
    readImageFile(file, (dataUrl) => setForm((f) => ({ ...f, photo: dataUrl })));
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sky)' }}>👩‍🏫</div>
            <h2>إدارة الأساتذة</h2>
          </div>
        </div>

        <div id="list-teachers">
          {sorted.length === 0 && <div className="empty-msg">لا يوجد أساتذة.</div>}
          {sorted.map((t) => {
            const isEditing = editingId === t.id;
            return (
              <div className="ent-row" key={t.id} data-id={t.id}>
                {isEditing ? (
                  <>
                    {draft.photo ? (
                      <div className="ent-icon has-photo"><img src={draft.photo} alt="" /></div>
                    ) : (
                      <div className="ent-icon" style={{ background: 'var(--sky)' }}>👩‍🏫</div>
                    )}
                    <div className="ent-body">
                      <div className="edit-grid">
                        <div>
                          <label>الاسم</label>
                          <input
                            type="text"
                            value={draft.name || ''}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label>اللقب</label>
                          <input
                            type="text"
                            value={draft.lastname || ''}
                            onChange={(e) => setDraft((d) => ({ ...d, lastname: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label>التخصص</label>
                          <input
                            type="text"
                            value={draft.subject || ''}
                            onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label>الهاتف</label>
                          <input
                            type="text"
                            value={draft.phone || ''}
                            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label>الصورة</label>
                          <div className="photo-row">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDraftPhoto(e.target.files?.[0])}
                            />
                            {draft.photo && <img className="photo-thumb" src={draft.photo} alt="" />}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ent-actions">
                      <button className="abtn save" onClick={() => saveEdit(t.id)}>حفظ</button>
                      <button className="abtn cancel" onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </>
                ) : (
                  <>
                    {t.photo ? (
                      <div className="ent-icon has-photo"><img src={t.photo} alt="" /></div>
                    ) : (
                      <div className="ent-icon" style={{ background: 'var(--sky)' }}>👩‍🏫</div>
                    )}
                    <div className="ent-body">
                      <div className="ent-title">
                        {t.name} {t.lastname}
                        <span className={`status-badge ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                      </div>
                      <div className="ent-sub">{[t.subject, t.phone].filter(Boolean).join(' · ')}</div>
                    </div>
                    <div className="ent-actions">
                      {t.status === 'pending' && (
                        <>
                          <button className="abtn accept" onClick={() => onAccept(t.id)}>قبول</button>
                          <button className="abtn reject" onClick={() => onReject(t.id)}>رفض</button>
                          <button className="abtn edit" onClick={() => startEdit(t)}>تعديل</button>
                        </>
                      )}
                      {t.status === 'active' && (
                        <>
                          <button className="abtn edit" onClick={() => startEdit(t)}>تعديل</button>
                          <button className="abtn archive" onClick={() => onArchive(t.id)}>أرشفة</button>
                        </>
                      )}
                      {t.status === 'archived' && (
                        <button className="abtn reactivate" onClick={() => onReactivate(t.id)}>إعادة تفعيل</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="add-new-box">
          <h3>➕ إضافة أستاذ مباشرة</h3>
          <div className="edit-grid">
            <div>
              <label>الاسم</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label>اللقب</label>
              <input type="text" value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} />
            </div>
            <div>
              <label>التخصص</label>
              <input
                type="text"
                placeholder="مثال: تربية تحضيرية"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label>الهاتف</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label>صورة الأستاذ</label>
              <div className="photo-row">
                <input type="file" accept="image/*" onChange={(e) => handleNewPhoto(e.target.files?.[0])} />
                {form.photo && <img className="photo-thumb" src={form.photo} alt="" />}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-sky" onClick={handleAdd}>إضافة الأستاذ</button>
          </div>
        </div>
      </div>
    </section>
  );
}