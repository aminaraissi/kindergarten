"use client";

import { useRef, useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChildInfo,
  Guardian,
  ParentInfo,
  emptyChildInfo,
  emptyParentInfo,
} from "./register/types";

/* =========================================================
   Types
========================================================= */
type Role = "parent" | "teacher" | "admin";

interface RoleMeta {
  id: Role;
  label: string;
  hint: string;
  icon: string;
  color: string; // CSS var
  route: string;
  demoEmail: string;
}

const ROLES: RoleMeta[] = [
  {
    id: "parent",
    label: "ولي أمر",
    hint: "تابع أخبار طفلك اليومية",
    icon: "👪",
    color: "var(--blush, #F3B6C3)",
    route: "/parent",
    demoEmail: "walid.parent@demo.dz",
  },
  {
    id: "teacher",
    label: "أستاذ",
    hint: "سجّل الحضور وشارك الأنشطة",
    icon: "🍎",
    color: "var(--sage, #9FCBAE)",
    route: "/teacher",
    demoEmail: "sara.teacher@demo.dz",
  },
  {
    id: "admin",
    label: "إدارة",
    hint: "أشرف على أقسام الروضة",
    icon: "🗝️",
    color: "var(--sky, #9FC5E8)",
    route: "/admin",
    demoEmail: "admin@demo.dz",
  },
];

const NEUTRAL = {
  label: "",
  icon: "🔐",
  color: "var(--sun, #F4D58D)",
};

type Mode = "login" | "signup";
const MAX_GUARDIANS = 2;

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("parent");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Child registration fields (shown only when signing up as "ولي أمر") ----
  const [childPhoto, setChildPhoto] = useState<string | null>(null);
  const [child, setChild] = useState<ChildInfo>(emptyChildInfo());
  const [motherEnabled, setMotherEnabled] = useState(false);
  const [mother, setMother] = useState<ParentInfo>(emptyParentInfo());
  const [fatherEnabled, setFatherEnabled] = useState(false);
  const [father, setFather] = useState<ParentInfo>(emptyParentInfo());
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const nextGuardianId = useRef(1);

  const selectedRole = ROLES.find((r) => r.id === role)!;
  const isSignup = mode === "signup";
  const isParentSignup = isSignup && role === "parent";
  const active = isSignup ? selectedRole : { label: "", icon: NEUTRAL.icon, color: NEUTRAL.color };

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  function goAfterAuth(redirect: string) {
    const next = searchParams.get("next");
    router.push(next && next.startsWith("/") ? next : redirect);
    router.refresh();
  }

  function handleChildPhotoChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة صالح.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setChildPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function addGuardian() {
    if (guardians.length >= MAX_GUARDIANS) return;
    const id = nextGuardianId.current++;
    setGuardians((prev) => [...prev, { id, name: "", lastname: "", dob: "", pob: "", phone: "", email: "" }]);
  }

  function updateGuardian(id: number, field: keyof Omit<Guardian, "id">, value: string) {
    setGuardians((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  }

  function removeGuardian(id: number) {
    setGuardians((prev) => prev.filter((g) => g.id !== id));
  }

  function resetChildFields() {
    setChildPhoto(null);
    setChild(emptyChildInfo());
    setMotherEnabled(false);
    setMother(emptyParentInfo());
    setFatherEnabled(false);
    setFather(emptyParentInfo());
    setGuardians([]);
    setContactEmail("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (isSignup && !fullName.trim()) {
      setError("يرجى إدخال الاسم الكامل");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("صيغة البريد الإلكتروني غير صحيحة");
      return;
    }
    if (isSignup && password.length < 6) {
      setError("يجب أن تحتوي كلمة المرور على 6 خانات على الأقل");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (isParentSignup) {
      if (
        !child.name.trim() ||
        !child.lastname.trim() ||
        !child.dob ||
        !child.pob.trim() ||
        !child.address.trim() ||
        !child.health.trim()
      ) {
        setError("يرجى تعبئة جميع معلومات الطفل المطلوبة");
        return;
      }
      if (!motherEnabled && !fatherEnabled) {
        setError("يرجى اختيار الأم أو الأب أو كليهما وتعبئة معلوماتهما");
        return;
      }
      if (motherEnabled && (!mother.name.trim() || !mother.lastname.trim() || !mother.phone.trim())) {
        setError("يرجى تعبئة معلومات الأم الأساسية (الاسم، اللقب، الهاتف)");
        return;
      }
      if (fatherEnabled && (!father.name.trim() || !father.lastname.trim() || !father.phone.trim())) {
        setError("يرجى تعبئة معلومات الأب الأساسية (الاسم، اللقب، الهاتف)");
        return;
      }
      for (const g of guardians) {
        if (!g.name.trim() || !g.lastname.trim() || !g.phone.trim()) {
          setError("يرجى تعبئة معلومات جميع الكفلاء المضافين، أو إزالتهم");
          return;
        }
      }
      if (!contactEmail.trim()) {
        setError("يرجى إدخال البريد الإلكتروني لاستلام وصل التسجيل");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(contactEmail.trim())) {
        setError("صيغة البريد الإلكتروني لاستلام الوصل غير صحيحة");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup
        ? {
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            role,
            ...(isParentSignup
              ? {
                  child: { ...child, photo: childPhoto },
                  motherEnabled,
                  mother: motherEnabled ? mother : null,
                  fatherEnabled,
                  father: fatherEnabled ? father : null,
                  guardians: guardians.map(({ id, ...g }) => g),
                  contactEmail: contactEmail.trim(),
                }
              : {}),
          }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "وقع خطأ، حاول مرة أخرى");
        setLoading(false);
        return;
      }

      goAfterAuth(data.redirect || selectedRole.route);
    } catch (err) {
      console.error(err);
      setError("تعذر الاتصال بالخادم، تأكد من الاتصال وحاول مرة أخرى");
      setLoading(false);
    }
  }

  return (
    <div className="login-shell" style={{ ["--role-color" as string]: active.color }}>
      <div className="login-wrap">
        {/* -------- Illustration / brand side -------- */}
        <aside className="login-aside">
          <div className="aside-top">
            <span className="blocks">
              <span>ط</span>
              <span>ف</span>
            </span>
            <span className="aside-brand">فضاء الطفل</span>
          </div>

          <div className="aside-art" aria-hidden="true">
            <span className="shape sun">☀️</span>
            <span className="shape cloud c1">☁️</span>
            <span className="shape cloud c2">☁️</span>
            <span className="shape star s1">✦</span>
            <span className="shape star s2">✦</span>
            <span className="shape star s3">✦</span>
            <div className="aside-badge">
              <span className="aside-badge-icon">{active.icon}</span>
            </div>
          </div>

          <div className="aside-bottom">
            <h1>صباح الخير 🌤️</h1>
            <p>مساحة دافئة تجمع الأستاذ، ولي الأمر والإدارة حول يوم الطفل في الروضة.</p>
          </div>
        </aside>

        {/* -------- Form side -------- */}
        <div className="login-main">
          <div className="login-card">
            <div className="login-head">
              <h2>{isSignup ? "إنشاء حساب جديد" : "تسجيل الدخول"}</h2>
              {isParentSignup && (
                <p className="head-hint">
                  بصفتك وليّ أمر، سنحتاج أيضًا معلومات الطفل المراد تسجيله في نفس الخطوة.
                </p>
              )}
            </div>

            {/* Login / Signup toggle */}
            <div className="mode-switch" role="tablist" aria-label="تسجيل الدخول أو إنشاء حساب">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={!isSignup ? "sel" : ""}
                onClick={() => switchMode("login")}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={isSignup ? "sel" : ""}
                onClick={() => switchMode("signup")}
              >
                إنشاء حساب
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {isSignup && (
                <div className="field">
                  <label htmlFor="fullName">الاسم الكامل</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: سارة عمراني"
                    autoComplete="name"
                  />
                </div>
              )}

              {isSignup && (
                <div className="field">
                  <label htmlFor="accountType">نوع الحساب</label>
                  <select
                    id="accountType"
                    value={role}
                    onChange={(e) => {
                      const nextRole = e.target.value as Role;
                      setRole(nextRole);
                      if (nextRole !== "parent") resetChildFields();
                    }}
                  >
                    {ROLES.map((r) => (
                      <option value={r.id} key={r.id}>
                        {r.icon} {r.label} — {r.hint}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="password">كلمة المرور</label>
                <div className="pass-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div className="field">
                  <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {/* ================= Child registration (parent signup only) ================= */}
              {isParentSignup && (
                <div className="child-reg-wrap">
                  <div className="section-divider">
                    <span className="section-num">1</span>
                    <div>
                      <h3>معلومات الطفل</h3>
                      <span className="section-hint">بيانات الطفل المراد تسجيله</span>
                    </div>
                  </div>

                  <div className="field">
                    <label>
                      صورة الطفل <span className="opt">(اختياري)</span>
                    </label>
                    <div className="photo-upload">
                      <div
                        className={`photo-preview ${childPhoto ? "has-image" : ""}`}
                        style={childPhoto ? { backgroundImage: `url(${childPhoto})` } : undefined}
                      >
                        {!childPhoto && <span className="photo-placeholder">📷</span>}
                      </div>
                      <div className="photo-actions">
                        <label className="photo-btn">
                          اختيار صورة
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => handleChildPhotoChange(e.target.files?.[0])}
                          />
                        </label>
                        {childPhoto && (
                          <button type="button" className="photo-remove-btn" onClick={() => setChildPhoto(null)}>
                            إزالة الصورة
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid">
                    <div className="field">
                      <label>الاسم</label>
                      <input type="text" value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>اللقب</label>
                      <input type="text" value={child.lastname} onChange={(e) => setChild({ ...child, lastname: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>تاريخ الميلاد</label>
                      <input type="date" value={child.dob} onChange={(e) => setChild({ ...child, dob: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>مكان الميلاد</label>
                      <input type="text" value={child.pob} onChange={(e) => setChild({ ...child, pob: e.target.value })} />
                    </div>
                    <div className="field full">
                      <label>العنوان</label>
                      <input type="text" value={child.address} onChange={(e) => setChild({ ...child, address: e.target.value })} />
                    </div>
                    <div className="field full">
                      <label>الحالة الصحية</label>
                      <textarea
                        placeholder="أمراض مزمنة، حساسية، أدوية يتناولها الطفل..."
                        value={child.health}
                        onChange={(e) => setChild({ ...child, health: e.target.value })}
                      />
                    </div>
                    <div className="field full">
                      <label>
                        ملاحظة <span className="opt">(اختياري)</span>
                      </label>
                      <textarea
                        placeholder="أي معلومة إضافية ترغبون في إخبارنا بها"
                        value={child.note}
                        onChange={(e) => setChild({ ...child, note: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="section-divider">
                    <span className="section-num">2</span>
                    <div>
                      <h3>معلومات الوالدين</h3>
                      <span className="section-hint">اختر من سيتم تسجيل معلوماته</span>
                    </div>
                  </div>

                  <div className="choice-row">
                    <label className="choice">
                      <input type="checkbox" checked={motherEnabled} onChange={(e) => setMotherEnabled(e.target.checked)} />
                      <span className="box">🧡 الأم</span>
                    </label>
                    <label className="choice">
                      <input type="checkbox" checked={fatherEnabled} onChange={(e) => setFatherEnabled(e.target.checked)} />
                      <span className="box">💙 الأب</span>
                    </label>
                  </div>

                  {motherEnabled && (
                    <div className="parent-block">
                      <h3>
                        <span className="dot dot-mother" /> معلومات الأم
                      </h3>
                      <div className="grid">
                        <div className="field"><label>الاسم</label><input type="text" value={mother.name} onChange={(e) => setMother({ ...mother, name: e.target.value })} /></div>
                        <div className="field"><label>اللقب</label><input type="text" value={mother.lastname} onChange={(e) => setMother({ ...mother, lastname: e.target.value })} /></div>
                        <div className="field"><label>تاريخ الميلاد</label><input type="date" value={mother.dob} onChange={(e) => setMother({ ...mother, dob: e.target.value })} /></div>
                        <div className="field"><label>مكان الميلاد</label><input type="text" value={mother.pob} onChange={(e) => setMother({ ...mother, pob: e.target.value })} /></div>
                        <div className="field"><label>رقم الهاتف</label><input type="tel" value={mother.phone} onChange={(e) => setMother({ ...mother, phone: e.target.value })} /></div>
                        <div className="field"><label>البريد الإلكتروني</label><input type="email" value={mother.email} onChange={(e) => setMother({ ...mother, email: e.target.value })} /></div>
                      </div>
                    </div>
                  )}

                  {fatherEnabled && (
                    <div className="parent-block">
                      <h3>
                        <span className="dot dot-father" /> معلومات الأب
                      </h3>
                      <div className="grid">
                        <div className="field"><label>الاسم</label><input type="text" value={father.name} onChange={(e) => setFather({ ...father, name: e.target.value })} /></div>
                        <div className="field"><label>اللقب</label><input type="text" value={father.lastname} onChange={(e) => setFather({ ...father, lastname: e.target.value })} /></div>
                        <div className="field"><label>تاريخ الميلاد</label><input type="date" value={father.dob} onChange={(e) => setFather({ ...father, dob: e.target.value })} /></div>
                        <div className="field"><label>مكان الميلاد</label><input type="text" value={father.pob} onChange={(e) => setFather({ ...father, pob: e.target.value })} /></div>
                        <div className="field"><label>رقم الهاتف</label><input type="tel" value={father.phone} onChange={(e) => setFather({ ...father, phone: e.target.value })} /></div>
                        <div className="field"><label>البريد الإلكتروني</label><input type="email" value={father.email} onChange={(e) => setFather({ ...father, email: e.target.value })} /></div>
                      </div>
                    </div>
                  )}

                  <div className="section-divider">
                    <span className="section-num">3</span>
                    <div>
                      <h3>الأشخاص المخوّل لهم اصطحاب الطفل</h3>
                      <span className="section-hint">اختياري — بحد أقصى شخصين</span>
                    </div>
                  </div>

                  <div className="pickup-note">
                    يمكن لهؤلاء الأشخاص اصطحاب الطفل من الحضانة في حال تأخر الوالدين.
                  </div>

                  {guardians.map((g, idx) => (
                    <div className="guardian-block" key={g.id}>
                      <button type="button" className="remove-guardian" onClick={() => removeGuardian(g.id)}>
                        إزالة ✕
                      </button>
                      <h3>معلومات الكفيل {idx + 1}</h3>
                      <div className="grid">
                        <div className="field"><label>الاسم</label><input type="text" value={g.name} onChange={(e) => updateGuardian(g.id, "name", e.target.value)} /></div>
                        <div className="field"><label>اللقب</label><input type="text" value={g.lastname} onChange={(e) => updateGuardian(g.id, "lastname", e.target.value)} /></div>
                        <div className="field"><label>تاريخ الميلاد</label><input type="date" value={g.dob} onChange={(e) => updateGuardian(g.id, "dob", e.target.value)} /></div>
                        <div className="field"><label>مكان الميلاد</label><input type="text" value={g.pob} onChange={(e) => updateGuardian(g.id, "pob", e.target.value)} /></div>
                        <div className="field"><label>رقم الهاتف</label><input type="tel" value={g.phone} onChange={(e) => updateGuardian(g.id, "phone", e.target.value)} /></div>
                        <div className="field"><label>البريد الإلكتروني</label><input type="email" value={g.email} onChange={(e) => updateGuardian(g.id, "email", e.target.value)} /></div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="add-guardian-btn" disabled={guardians.length >= MAX_GUARDIANS} onClick={addGuardian}>
                    ＋ إضافة كفيل
                  </button>
                  {guardians.length >= MAX_GUARDIANS && (
                    <div className="guardian-limit-msg">تم بلوغ الحد الأقصى (شخصان).</div>
                  )}

                  <div className="section-divider">
                    <span className="section-num">4</span>
                    <div>
                      <h3>إرسال وصل التسجيل</h3>
                      <span className="section-hint">سيتم إرسال وصل التسجيل إلى هذا البريد</span>
                    </div>
                  </div>

                  <div className="field">
                    <label>البريد الإلكتروني لاستلام وصل التسجيل</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="example@domain.com"
                    />
                  </div>
                  <p className="email-note">
                    سيصلكم وصل التسجيل على هذا البريد، ويُقدَّم عند الدفع مباشرة في مقر المدرسة لإتمام قبول الطفل.
                  </p>

                  <div className="section-divider">
                    <span className="section-num">5</span>
                    <div>
                      <h3>إنشاء الحساب</h3>
                      <span className="section-hint">البريد وكلمة المرور أعلاه سيُستخدمان لتسجيل الدخول لاحقًا</span>
                    </div>
                  </div>
                </div>
              )}

              {!isSignup && (
                <div className="field-row">
                  <label className="remember">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    تذكرني
                  </label>
                  <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                    نسيت كلمة المرور؟
                  </a>
                </div>
              )}

              {error && <div className="login-error">⚠️ {error}</div>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading
                  ? isSignup
                    ? "جاري إنشاء الحساب..."
                    : "جاري الدخول..."
                  : isSignup
                  ? `إنشاء حساب كـ ${selectedRole.label}`
                  : "تسجيل الدخول"}
              </button>

              <p className="switch-hint">
                {isSignup ? (
                  <>
                    عندك حساب بالفعل؟{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); switchMode("login"); }}>
                      سجّل الدخول
                    </a>
                  </>
                ) : (
                  <>
                    ماعندكش حساب؟{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); switchMode("signup"); }}>
                      أنشئ واحد
                    </a>
                  </>
                )}
              </p>
            </form>
          </div>

          <footer className="login-footer">الحسابات والجلسات فعلية.</footer>
        </div>
      </div>

      <style jsx>{`
        .login-shell {
          min-height: 100dvh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          background: linear-gradient(180deg, #fdfaf3 0%, #f6f8f1 100%);
          padding: 28px;
          direction: rtl;
          font-family: "Tajawal", "Cairo", system-ui, sans-serif;
        }

        .login-wrap {
          width: 100%;
          max-width: 980px;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          background: #fff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(60, 50, 30, 0.08);
        }

        /* ---------- aside ---------- */
        .login-aside {
          position: relative;
          background: linear-gradient(160deg, var(--role-color) 0%, #fff7ea 130%);
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #3c3226;
          transition: background 0.4s ease;
        }

        .aside-top {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 15px;
        }

        .blocks {
          display: inline-flex;
          gap: 3px;
        }
        .blocks span {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.75);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .aside-art {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 160px;
        }

        .aside-badge {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          box-shadow: 0 12px 24px rgba(60, 50, 30, 0.12);
          transition: all 0.3s ease;
        }

        .shape {
          position: absolute;
          font-size: 22px;
          opacity: 0.85;
        }
        .shape.sun {
          top: 6%;
          left: 10%;
          font-size: 26px;
        }
        .shape.cloud.c1 {
          top: 18%;
          right: 8%;
          font-size: 24px;
        }
        .shape.cloud.c2 {
          bottom: 22%;
          right: 20%;
          font-size: 18px;
          opacity: 0.6;
        }
        .shape.star {
          color: #fff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }
        .shape.s1 {
          top: 30%;
          left: 22%;
        }
        .shape.s2 {
          bottom: 30%;
          left: 8%;
          font-size: 14px;
        }
        .shape.s3 {
          top: 12%;
          right: 30%;
          font-size: 12px;
        }

        .aside-bottom h1 {
          margin: 0 0 8px;
          font-size: 21px;
        }
        .aside-bottom p {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.7;
          opacity: 0.85;
          max-width: 30ch;
        }

        /* ---------- main / form ---------- */
        .login-main {
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-height: 100dvh;
          overflow-y: auto;
        }

        .login-card {
          width: 100%;
        }

        .login-head {
          margin-bottom: 18px;
        }
        .login-head h2 {
          margin: 0 0 6px;
          font-size: 24px;
          color: #3c3226;
        }
        .head-hint {
          margin: 0;
          font-size: 12.5px;
          color: #8a8271;
          line-height: 1.6;
        }

        .mode-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f4f2ea;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 20px;
        }
        .mode-switch button {
          border: none;
          background: transparent;
          padding: 9px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          color: #9a927e;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .mode-switch button.sel {
          background: #fff;
          color: #3c3226;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
        }

        .switch-hint {
          text-align: center;
          font-size: 12.5px;
          color: #9a927e;
          margin: 14px 0 0;
        }
        .switch-hint a {
          color: var(--role-color);
          font-weight: 700;
          text-decoration: none;
        }
        .switch-hint a:hover {
          text-decoration: underline;
        }

        .field select {
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid #e7e3d8;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13.5px;
          background: #fdfcf9;
          outline: none;
          color: #3c3226;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .field select:focus {
          border-color: var(--role-color);
        }

        .field {
          margin-bottom: 14px;
        }
        .field > label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #5a5142;
          margin-bottom: 6px;
        }
        .field > label .opt {
          font-weight: 400;
          color: #9a927e;
          font-size: 11.5px;
        }
        .field > input,
        .field > textarea,
        .pass-wrap input {
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid #e7e3d8;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: inherit;
          background: #fdfcf9;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .field > textarea {
          resize: vertical;
          min-height: 64px;
        }
        .field > input:focus,
        .field > textarea:focus,
        .pass-wrap input:focus {
          border-color: var(--role-color);
        }

        .pass-wrap {
          position: relative;
        }
        .pass-wrap input {
          padding-left: 40px;
        }
        .pass-toggle {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 15px;
        }

        .field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 12.5px;
        }
        .remember {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #5a5142;
          cursor: pointer;
        }
        .forgot-link {
          color: #9a7b3f;
          text-decoration: none;
        }
        .forgot-link:hover {
          text-decoration: underline;
        }

        .login-error {
          background: #fdecea;
          color: #b3261e;
          font-size: 12.5px;
          padding: 9px 12px;
          border-radius: 10px;
          margin-bottom: 14px;
        }

        .btn-login {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 13px;
          font-size: 14.5px;
          font-weight: 700;
          color: #3c3226;
          background: var(--role-color);
          cursor: pointer;
          transition: filter 0.15s ease, transform 0.05s ease;
        }
        .btn-login:hover {
          filter: brightness(0.96);
        }
        .btn-login:active {
          transform: translateY(1px);
        }
        .btn-login:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .login-footer {
          margin-top: 18px;
          text-align: center;
          font-size: 10.5px;
          color: #b5ae9e;
        }

        /* ---------- child registration block (parent signup) ---------- */
        .section-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 22px 0 14px;
          padding-top: 14px;
          border-top: 1px dashed #eee6d6;
        }
        .child-reg-wrap > .section-divider:first-child {
          border-top: none;
          padding-top: 0;
          margin-top: 8px;
        }
        .section-num {
          flex: none;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: var(--role-color);
          color: #3c3226;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 12.5px;
        }
        .section-divider h3 {
          margin: 0;
          font-size: 14.5px;
          color: #3c3226;
        }
        .section-hint {
          display: block;
          font-size: 11.5px;
          color: #9a927e;
          margin-top: 2px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .grid .full {
          grid-column: 1 / -1;
        }
        @media (max-width: 560px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }

        .photo-upload {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .photo-preview {
          flex: none;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 2px dashed #e7e3d8;
          background-color: #fdfcf9;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .photo-preview.has-image {
          border-style: solid;
          border-color: var(--role-color);
        }
        .photo-placeholder {
          font-size: 22px;
          opacity: 0.5;
        }
        .photo-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .photo-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1.5px dashed var(--role-color);
          color: #5a5142;
          font-weight: 700;
          font-size: 12.5px;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
        }
        .photo-remove-btn {
          background: none;
          border: none;
          color: #b3261e;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .choice-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .choice {
          flex: 1;
          min-width: 120px;
          position: relative;
        }
        .choice input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          inset: 0;
        }
        .choice .box {
          border: 1.5px solid #e7e3d8;
          border-radius: 12px;
          padding: 12px;
          text-align: center;
          font-weight: 700;
          font-size: 13px;
          background: #fdfcf9;
        }
        .choice input:checked + .box {
          border-color: var(--role-color);
          background: rgba(0, 0, 0, 0.03);
        }

        .parent-block {
          border: 1.5px dashed #e7e3d8;
          border-radius: 12px;
          padding: 16px 14px;
          margin-bottom: 14px;
        }
        .parent-block h3 {
          font-size: 13.5px;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot-mother {
          background: #e8927c;
        }
        .dot-father {
          background: #7fa8c9;
        }

        .pickup-note {
          background: rgba(244, 213, 141, 0.25);
          border: 1px solid rgba(244, 213, 141, 0.6);
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12px;
          color: #6b5313;
          margin-bottom: 14px;
        }

        .guardian-block {
          border: 1.5px solid #e7e3d8;
          border-radius: 12px;
          padding: 16px 14px;
          margin-bottom: 14px;
          position: relative;
          background: #fdfcf9;
        }
        .guardian-block h3 {
          font-size: 13.5px;
          margin: 0 0 12px;
        }
        .remove-guardian {
          position: absolute;
          top: 12px;
          left: 12px;
          background: none;
          border: none;
          color: #b3261e;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .add-guardian-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1.5px dashed var(--role-color);
          color: #5a5142;
          font-weight: 700;
          font-size: 13px;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        .add-guardian-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .guardian-limit-msg {
          font-size: 12px;
          color: #9a927e;
          margin-top: 8px;
        }

        .email-note {
          font-size: 12px;
          color: #9a927e;
          margin: -8px 0 16px;
          line-height: 1.6;
        }

        @media (max-width: 760px) {
          .login-wrap {
            grid-template-columns: 1fr;
          }
          .login-aside {
            display: none;
          }
          .login-main {
            padding: 28px 22px;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}