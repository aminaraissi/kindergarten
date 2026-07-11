'use client';

import { useState } from 'react';
import type { ClassItem, Guardian, ParentInfo, Student } from '../types';
import { STATUS_LABEL, emptyGuardian } from '../types';
import { PAID_MONTHS_LABELS, computeAge, paymentBadgeClass, paymentLabel, paymentStatus, readImageFile } from '../utils';

interface Props {
  students: Student[];
  classes: ClassItem[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onArchive: (id: number) => void;
  onReactivate: (id: number) => void;
  onSave: (id: number, patch: Partial<Student>) => void;
  onAdd: (data: Partial<Student> & { name: string; lastname: string }) => void;
}

const emptyNewForm = {
  name: '',
  lastname: '',
  dob: '',
  pob: '',
  address: '',
  health: '',
  sectionId: '',
  paymentDate: '',
  paymentMonths: '',
  photo: '',
};

function PaidMonthsSelect({
  value,
  onChange,
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">لم يُحدَّد</option>
      {Object.entries(PAID_MONTHS_LABELS).map(([m, label]) => (
        <option key={m} value={m}>{label}</option>
      ))}
    </select>
  );
}

export default function StudentsTab({
  students,
  classes,
  onAccept,
  onReject,
  onArchive,
  onReactivate,
  onSave,
  onAdd,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyNewForm);

  const order: Record<string, number> = { pending: 0, active: 1, archived: 2 };
  const sorted = [...students].sort((a, b) => order[a.status] - order[b.status]);
  const availableClasses = classes.filter((c) => c.status !== 'archived');

  function startEdit(s: Student) {
    setEditingId(s.id);
    setDraft(JSON.parse(JSON.stringify(s)));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function saveEdit() {
    if (!draft) return;
    onSave(draft.id, draft);
    setEditingId(null);
    setDraft(null);
  }

  function updateDraft<K extends keyof Student>(key: K, value: Student[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function updateParent(which: 'mother' | 'father', field: keyof ParentInfo, value: string) {
    setDraft((d) => (d ? { ...d, [which]: { ...d[which], [field]: value } } : d));
  }

  function updateGuardian(idx: number, field: keyof Guardian, value: string) {
    setDraft((d) => {
      if (!d) return d;
      const guardians = [...d.guardians];
      guardians[idx] = { ...guardians[idx], [field]: value };
      return { ...d, guardians };
    });
  }

  function addGuardian() {
    setDraft((d) => {
      if (!d) return d;
      if (d.guardians.length >= 2) return d;
      return { ...d, guardians: [...d.guardians, emptyGuardian()] };
    });
  }

  function removeGuardian(idx: number) {
    setDraft((d) => {
      if (!d) return d;
      const guardians = d.guardians.filter((_, i) => i !== idx);
      return { ...d, guardians };
    });
  }

  function handleDraftPhoto(file: File | undefined) {
    if (!file || !draft) return;
    readImageFile(file, (dataUrl) => updateDraft('photo', dataUrl));
  }

  function handleAdd() {
    if (!form.name.trim() || !form.lastname.trim()) {
      alert('يرجى إدخال الاسم واللقب على الأقل');
      return;
    }
    onAdd({
      name: form.name.trim(),
      lastname: form.lastname.trim(),
      dob: form.dob,
      pob: form.pob.trim(),
      address: form.address.trim(),
      health: form.health.trim(),
      sectionId: form.sectionId ? Number(form.sectionId) : null,
      lastPaymentDate: form.paymentDate,
      paidMonths: form.paymentMonths ? Number(form.paymentMonths) : null,
      photo: form.photo,
    });
    setForm(emptyNewForm);
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
            <div className="ic" style={{ background: 'var(--sage)' }}>🧒</div>
            <h2>إدارة التلاميذ</h2>
          </div>
        </div>

        <div id="list-students">
          {sorted.length === 0 && <div className="empty-msg">لا يوجد تلاميذ.</div>}
          {sorted.map((s) => {
            const isEditing = editingId === s.id && draft;
            if (isEditing && draft) {
              const classOptions = availableClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ));
              return (
                <div className="ent-row" key={s.id} data-id={s.id}>
                  {draft.photo ? (
                    <div className="ent-icon has-photo"><img src={draft.photo} alt="" /></div>
                  ) : (
                    <div className="ent-icon" style={{ background: 'var(--sage)' }}>🧒</div>
                  )}
                  <div className="ent-body" style={{ width: '100%' }}>
                    <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>بيانات الطفل</h3>
                    <div className="edit-grid">
                      <div><label>الاسم</label><input type="text" value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} /></div>
                      <div><label>اللقب</label><input type="text" value={draft.lastname} onChange={(e) => updateDraft('lastname', e.target.value)} /></div>
                      <div><label>تاريخ الميلاد</label><input type="date" value={draft.dob} onChange={(e) => updateDraft('dob', e.target.value)} /></div>
                      <div><label>مكان الميلاد</label><input type="text" value={draft.pob} onChange={(e) => updateDraft('pob', e.target.value)} /></div>
                      <div><label>العنوان</label><input type="text" value={draft.address} onChange={(e) => updateDraft('address', e.target.value)} /></div>
                      <div><label>الحالة الصحية</label><input type="text" value={draft.health} onChange={(e) => updateDraft('health', e.target.value)} /></div>
                      <div><label>ملاحظة</label><input type="text" value={draft.note} onChange={(e) => updateDraft('note', e.target.value)} /></div>
                      <div>
                        <label>القسم</label>
                        <select
                          value={draft.sectionId ?? ''}
                          onChange={(e) => updateDraft('sectionId', e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">غير معيّن</option>
                          {classOptions}
                        </select>
                      </div>
                      <div><label>تاريخ آخر دفعة</label><input type="date" value={draft.lastPaymentDate} onChange={(e) => updateDraft('lastPaymentDate', e.target.value)} /></div>
                      <div>
                        <label>مدة الدفع (كم شهر دفع)</label>
                        <PaidMonthsSelect value={draft.paidMonths} onChange={(v) => updateDraft('paidMonths', v)} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="pay-info-preview">{paymentLabel(paymentStatus(draft))}</div>
                      </div>
                      <div>
                        <label>صورة الطفل</label>
                        <div className="photo-row">
                          <input type="file" accept="image/*" onChange={(e) => handleDraftPhoto(e.target.files?.[0])} />
                          {draft.photo && <img className="photo-thumb" src={draft.photo} alt="" />}
                        </div>
                      </div>
                    </div>

                    <hr className="sep" />

                    <div className="parent-block">
                      <h3>
                        <span className="dot dot-mother" /> معلومات الأم
                        <label>
                          <input
                            type="checkbox"
                            checked={draft.motherEnabled}
                            onChange={(e) => updateDraft('motherEnabled', e.target.checked)}
                          /> مسجّلة
                        </label>
                      </h3>
                      <div className="edit-grid">
                        <div><label>الاسم</label><input type="text" value={draft.mother.name} onChange={(e) => updateParent('mother', 'name', e.target.value)} /></div>
                        <div><label>اللقب</label><input type="text" value={draft.mother.lastname} onChange={(e) => updateParent('mother', 'lastname', e.target.value)} /></div>
                        <div><label>تاريخ الميلاد</label><input type="date" value={draft.mother.dob} onChange={(e) => updateParent('mother', 'dob', e.target.value)} /></div>
                        <div><label>مكان الميلاد</label><input type="text" value={draft.mother.pob} onChange={(e) => updateParent('mother', 'pob', e.target.value)} /></div>
                        <div><label>الهاتف</label><input type="text" value={draft.mother.phone} onChange={(e) => updateParent('mother', 'phone', e.target.value)} /></div>
                        <div><label>البريد الإلكتروني</label><input type="text" value={draft.mother.email} onChange={(e) => updateParent('mother', 'email', e.target.value)} /></div>
                      </div>
                    </div>

                    <div className="parent-block">
                      <h3>
                        <span className="dot dot-father" /> معلومات الأب
                        <label>
                          <input
                            type="checkbox"
                            checked={draft.fatherEnabled}
                            onChange={(e) => updateDraft('fatherEnabled', e.target.checked)}
                          /> مسجّل
                        </label>
                      </h3>
                      <div className="edit-grid">
                        <div><label>الاسم</label><input type="text" value={draft.father.name} onChange={(e) => updateParent('father', 'name', e.target.value)} /></div>
                        <div><label>اللقب</label><input type="text" value={draft.father.lastname} onChange={(e) => updateParent('father', 'lastname', e.target.value)} /></div>
                        <div><label>تاريخ الميلاد</label><input type="date" value={draft.father.dob} onChange={(e) => updateParent('father', 'dob', e.target.value)} /></div>
                        <div><label>مكان الميلاد</label><input type="text" value={draft.father.pob} onChange={(e) => updateParent('father', 'pob', e.target.value)} /></div>
                        <div><label>الهاتف</label><input type="text" value={draft.father.phone} onChange={(e) => updateParent('father', 'phone', e.target.value)} /></div>
                        <div><label>البريد الإلكتروني</label><input type="text" value={draft.father.email} onChange={(e) => updateParent('father', 'email', e.target.value)} /></div>
                      </div>
                    </div>

                    <hr className="sep" />

                    <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>
                      الأشخاص المخوّل لهم اصطحاب الطفل (بحد أقصى شخصين)
                    </h3>
                    {draft.guardians.map((g, idx) => (
                      <div className="guardian-block" key={idx}>
                        <button type="button" className="remove-guardian" onClick={() => removeGuardian(idx)}>إزالة ✕</button>
                        <h3>الكفيل {idx + 1}</h3>
                        <div className="edit-grid">
                          <div><label>الاسم</label><input type="text" value={g.name} onChange={(e) => updateGuardian(idx, 'name', e.target.value)} /></div>
                          <div><label>اللقب</label><input type="text" value={g.lastname} onChange={(e) => updateGuardian(idx, 'lastname', e.target.value)} /></div>
                          <div><label>تاريخ الميلاد</label><input type="date" value={g.dob} onChange={(e) => updateGuardian(idx, 'dob', e.target.value)} /></div>
                          <div><label>مكان الميلاد</label><input type="text" value={g.pob} onChange={(e) => updateGuardian(idx, 'pob', e.target.value)} /></div>
                          <div><label>الهاتف</label><input type="text" value={g.phone} onChange={(e) => updateGuardian(idx, 'phone', e.target.value)} /></div>
                          <div><label>البريد الإلكتروني</label><input type="text" value={g.email} onChange={(e) => updateGuardian(idx, 'email', e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                    {draft.guardians.length < 2 && (
                      <button type="button" className="abtn edit" onClick={addGuardian}>＋ إضافة كفيل</button>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <button className="abtn save" onClick={saveEdit}>حفظ</button>
                      <button className="abtn cancel" onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </div>
                </div>
              );
            }

            const cls = classes.find((c) => c.id === s.sectionId);
            const secLabel = cls ? cls.name : 'غير معيّن';
            const age = computeAge(s.dob);
            const parts = [`القسم: ${secLabel}`];
            if (age !== '') parts.push(`العمر: ${age} سنوات`);
            const payInfo = paymentStatus(s);

            return (
              <div className="ent-row" key={s.id} data-id={s.id}>
                {s.photo ? (
                  <div className="ent-icon has-photo"><img src={s.photo} alt="" /></div>
                ) : (
                  <div className="ent-icon" style={{ background: 'var(--sage)' }}>🧒</div>
                )}
                <div className="ent-body">
                  <div className="ent-title">
                    {s.name} {s.lastname}
                    <span className={`status-badge ${s.status}`}>{STATUS_LABEL[s.status]}</span>
                  </div>
                  <div className="ent-sub">{parts.join(' · ')}</div>
                  <div className="ent-sub" style={{ marginTop: 5 }}>
                    <span className={`pay-badge ${paymentBadgeClass(payInfo)}`}>{paymentLabel(payInfo)}</span>
                  </div>
                </div>
                <div className="ent-actions">
                  {s.status === 'pending' && (
                    <>
                      <button className="abtn accept" onClick={() => onAccept(s.id)}>قبول</button>
                      <button className="abtn reject" onClick={() => onReject(s.id)}>رفض</button>
                      <button className="abtn edit" onClick={() => startEdit(s)}>تعديل</button>
                    </>
                  )}
                  {s.status === 'active' && (
                    <>
                      <button className="abtn edit" onClick={() => startEdit(s)}>تعديل</button>
                      <button className="abtn archive" onClick={() => onArchive(s.id)}>أرشفة</button>
                    </>
                  )}
                  {s.status === 'archived' && (
                    <button className="abtn reactivate" onClick={() => onReactivate(s.id)}>إعادة تفعيل</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="add-new-box">
          <h3>➕ إضافة تلميذ مباشرة</h3>
          <div className="edit-grid">
            <div><label>الاسم</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label>اللقب</label><input type="text" value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} /></div>
            <div><label>تاريخ الميلاد</label><input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
            <div><label>مكان الميلاد</label><input type="text" value={form.pob} onChange={(e) => setForm({ ...form, pob: e.target.value })} /></div>
            <div><label>العنوان</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><label>الحالة الصحية</label><input type="text" value={form.health} onChange={(e) => setForm({ ...form, health: e.target.value })} /></div>
            <div>
              <label>القسم</label>
              <select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
                <option value="">غير معيّن</option>
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div><label>تاريخ آخر دفعة (اختياري)</label><input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} /></div>
            <div>
              <label>مدة الدفع</label>
              <select value={form.paymentMonths} onChange={(e) => setForm({ ...form, paymentMonths: e.target.value })}>
                <option value="">لم يُحدَّد</option>
                {Object.entries(PAID_MONTHS_LABELS).map(([m, label]) => (
                  <option key={m} value={m}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>صورة التلميذ</label>
              <div className="photo-row">
                <input type="file" accept="image/*" onChange={(e) => handleNewPhoto(e.target.files?.[0])} />
                {form.photo && <img className="photo-thumb" src={form.photo} alt="" />}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '8px 0 0' }}>
            يمكن إضافة معلومات الوالدين والأشخاص المخوّل لهم اصطحاب الطفل لاحقًا عبر زر &quot;تعديل&quot;.
          </p>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-sage" onClick={handleAdd}>إضافة التلميذ</button>
          </div>
        </div>
      </div>
    </section>
  );
}