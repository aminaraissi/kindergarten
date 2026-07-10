"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

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

export default function LoginPage() {
  const router = useRouter();

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

  const selectedRole = ROLES.find((r) => r.id === role)!;
  const isSignup = mode === "signup";
  const active = isSignup ? selectedRole : { label: "", icon: NEUTRAL.icon, color: NEUTRAL.color };

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  function handleSubmit(e: FormEvent) {
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

    setLoading(true);
    // لا توجد قاعدة بيانات بعد — هذه محاكاة لتسجيل الدخول / إنشاء الحساب فقط
    window.setTimeout(() => {
      setLoading(false);
      router.push(selectedRole.route);
    }, 700);
  }

  function handleQuickDemo(r: RoleMeta) {
    setMode("login");
    setRole(r.id);
    setEmail(r.demoEmail);
    setPassword("demo1234");
    setError("");
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
              <span className="demo-tag">نسخة تجريبية — بلا قاعدة بيانات</span>
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
                    onChange={(e) => setRole(e.target.value as Role)}
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

            {!isSignup && (
              <div className="quick-demo">
                <span>دخول سريع للتجربة:</span>
                <div className="quick-demo-btns">
                  {ROLES.map((r) => (
                    <button key={r.id} type="button" onClick={() => handleQuickDemo(r)}>
                      {r.icon} {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <footer className="login-footer">
            هذه صفحة تجريبية للعرض فقط — جميع البيانات مؤقتة في المتصفح ولا يتم حفظها في أي قاعدة بيانات.
          </footer>
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
        .demo-tag {
          font-size: 11px;
          background: #fff3e0;
          color: #9a6b00;
          padding: 3px 9px;
          border-radius: 999px;
          font-weight: 600;
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
        .field label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #5a5142;
          margin-bottom: 6px;
        }
        .field input {
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid #e7e3d8;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          background: #fdfcf9;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .field input:focus {
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

        .quick-demo {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px dashed #eee;
          font-size: 12px;
          color: #999;
        }
        .quick-demo-btns {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .quick-demo-btns button {
          border: 1px solid #eee;
          background: #fafafa;
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 11.5px;
          cursor: pointer;
          color: #5a5142;
        }
        .quick-demo-btns button:hover {
          background: #f2f0e9;
        }

        .login-footer {
          margin-top: 18px;
          text-align: center;
          font-size: 10.5px;
          color: #b5ae9e;
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
