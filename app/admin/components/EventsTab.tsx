'use client';

import { useState } from 'react';
import type { EventItem } from '../types';

interface Props {
  events: EventItem[];
  onAdd: (data: Omit<EventItem, 'id'>) => void;
  onSave: (id: number, patch: Partial<EventItem>) => void;
  onDelete: (id: number) => void;
}

const emptyForm = { day: '', month: '', title: '', desc: '', tag: '' };

export default function EventsTab({ events, onAdd, onSave, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);

  function startEdit(e: EventItem) {
    setEditingId(e.id);
    setDraft({ day: e.day, month: e.month, title: e.title, desc: e.desc, tag: e.tag });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyForm);
  }

  function saveEdit(id: number) {
    if (!draft.title.trim()) {
      alert('يرجى إدخال عنوان الحدث');
      return;
    }
    onSave(id, draft);
    setEditingId(null);
    setDraft(emptyForm);
  }

  function handleAdd() {
    if (!form.title.trim()) {
      alert('يرجى إدخال عنوان الحدث');
      return;
    }
    onAdd(form);
    setForm(emptyForm);
  }

  const sorted = [...events];

  return (
    <section className="page active">
      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sky)' }}>🗓️</div>
            <h2>الفعاليات والأحداث</h2>
          </div>
        </div>

        <div id="list-events">
          {sorted.length === 0 && <div className="empty-msg">لا توجد أحداث مضافة بعد.</div>}
          {sorted.map((ev) => {
            const isEditing = editingId === ev.id;
            return (
              <div className="ent-row" key={ev.id} data-id={ev.id}>
                {isEditing ? (
                  <div className="ent-body" style={{ width: '100%' }}>
                    <div className="edit-grid">
                      <div><label>اليوم</label><input type="text" placeholder="مثال: 18" value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })} /></div>
                      <div><label>الشهر</label><input type="text" placeholder="مثال: جويلية" value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })} /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label>عنوان الحدث</label><input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label>الوصف</label><input type="text" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} /></div>
                      <div><label>الوسم</label><input type="text" placeholder="مثال: نشاط خارجي" value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} /></div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button className="abtn save" onClick={() => saveEdit(ev.id)}>حفظ</button>
                      <button className="abtn cancel" onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="ent-icon" style={{ background: 'var(--sky)' }}>{ev.day || '🗓️'}</div>
                    <div className="ent-body">
                      <div className="ent-title">{ev.title}{ev.tag && <span className="status-badge active">{ev.tag}</span>}</div>
                      <div className="ent-sub">{[ev.day && ev.month ? `${ev.day} ${ev.month}` : '', ev.desc].filter(Boolean).join(' · ')}</div>
                    </div>
                    <div className="ent-actions">
                      <button className="abtn edit" onClick={() => startEdit(ev)}>تعديل</button>
                      <button className="abtn reject" onClick={() => onDelete(ev.id)}>حذف</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="add-new-box">
          <h3>➕ إضافة حدث جديد</h3>
          <div className="edit-grid">
            <div><label>اليوم</label><input type="text" placeholder="مثال: 18" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} /></div>
            <div><label>الشهر</label><input type="text" placeholder="مثال: جويلية" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label>عنوان الحدث</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label>الوصف</label><input type="text" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
            <div><label>الوسم</label><input type="text" placeholder="مثال: نشاط خارجي" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-sky" onClick={handleAdd}>إضافة الحدث</button>
          </div>
        </div>
      </div>
    </section>
  );
}