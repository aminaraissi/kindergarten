'use client';

import { useState } from 'react';
import type { PricingPlan } from '../types';

interface Props {
  plans: PricingPlan[];
  onAdd: (data: Omit<PricingPlan, 'id'>) => void;
  onSave: (id: number, patch: Partial<PricingPlan>) => void;
  onDelete: (id: number) => void;
}

interface FormState {
  name: string;
  price: string;
  period: string;
  desc: string;
  featured: boolean;
  featuresText: string;
}

const emptyForm: FormState = { name: '', price: '', period: '', desc: '', featured: false, featuresText: '' };

function toFeatures(text: string): string[] {
  return text
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);
}

function toFeaturesText(features: string[]): string {
  return features.join('\n');
}

export default function PricingTab({ plans, onAdd, onSave, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<FormState>(emptyForm);
  const [form, setForm] = useState<FormState>(emptyForm);

  function startEdit(p: PricingPlan) {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      price: p.price,
      period: p.period,
      desc: p.desc,
      featured: p.featured,
      featuresText: toFeaturesText(p.features),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyForm);
  }

  function saveEdit(id: number) {
    if (!draft.name.trim()) {
      alert('يرجى إدخال اسم الباقة');
      return;
    }
    onSave(id, {
      name: draft.name.trim(),
      price: draft.price.trim(),
      period: draft.period.trim(),
      desc: draft.desc.trim(),
      featured: draft.featured,
      features: toFeatures(draft.featuresText),
    });
    setEditingId(null);
    setDraft(emptyForm);
  }

  function handleAdd() {
    if (!form.name.trim() || !form.price.trim()) {
      alert('يرجى إدخال اسم الباقة والسعر على الأقل');
      return;
    }
    onAdd({
      name: form.name.trim(),
      price: form.price.trim(),
      period: form.period.trim(),
      desc: form.desc.trim(),
      featured: form.featured,
      features: toFeatures(form.featuresText),
    });
    setForm(emptyForm);
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sun)', color: '#4A3A0A' }}>💳</div>
            <h2>باقات الاشتراك</h2>
          </div>
        </div>

        <div id="list-pricing">
          {plans.length === 0 && <div className="empty-msg">لا توجد باقات مضافة بعد.</div>}
          {plans.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <div className="ent-row" key={p.id} data-id={p.id}>
                {isEditing ? (
                  <div className="ent-body" style={{ width: '100%' }}>
                    <div className="edit-grid">
                      <div>
                        <label>اسم الباقة</label>
                        <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                      </div>
                      <div>
                        <label>السعر</label>
                        <input type="text" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="مثال: 6,500" />
                      </div>
                      <div>
                        <label>فترة الاشتراك</label>
                        <input type="text" value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} placeholder="مثال: دج / شهريًا" />
                      </div>
                      <div>
                        <label>وصف مختصر</label>
                        <input type="text" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label>المزايا (سطر لكل ميزة)</label>
                        <textarea
                          rows={4}
                          value={draft.featuresText}
                          onChange={(e) => setDraft({ ...draft, featuresText: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>
                          <input
                            type="checkbox"
                            checked={draft.featured}
                            onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                          /> إبراز هذه الباقة (الأكثر اختيارًا)
                        </label>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button className="abtn save" onClick={() => saveEdit(p.id)}>حفظ</button>
                      <button className="abtn cancel" onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="ent-body">
                      <div className="ent-title">
                        {p.name}
                        {p.featured && <span className="status-badge active">الأكثر اختيارًا</span>}
                      </div>
                      <div className="ent-sub">{p.price} {p.period} · {p.desc}</div>
                      {p.features.length > 0 && (
                        <div className="ent-sub" style={{ marginTop: 5 }}>
                          {p.features.join(' · ')}
                        </div>
                      )}
                    </div>
                    <div className="ent-actions">
                      <button className="abtn edit" onClick={() => startEdit(p)}>تعديل</button>
                      <button className="abtn reject" onClick={() => onDelete(p.id)}>حذف</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="add-new-box">
          <h3>➕ إضافة باقة جديدة</h3>
          <div className="edit-grid">
            <div><label>اسم الباقة</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label>السعر</label><input type="text" placeholder="مثال: 6,500" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><label>فترة الاشتراك</label><input type="text" placeholder="مثال: دج / شهريًا" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></div>
            <div><label>وصف مختصر</label><input type="text" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>المزايا (سطر لكل ميزة)</label>
              <textarea rows={4} value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} />
            </div>
            <div>
              <label>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> إبراز هذه الباقة
              </label>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-sage" onClick={handleAdd}>إضافة الباقة</button>
          </div>
        </div>
      </div>
    </section>
  );
}