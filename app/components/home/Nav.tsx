'use client';

import { useState } from 'react';

const LINKS = [
  { href: '#about', label: 'من نحن' },
  { href: '#pricing', label: 'الأسعار' },
  { href: '#events', label: 'الأحداث' },
  { href: '#jobs', label: 'وظائف شاغرة' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#" className="brand">
          <span className="blocks">
            <span>ط</span>
            <span>ف</span>
          </span>
          فضاء الطفل
        </a>

        <nav className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          <a href="/login/register" className="nav-cta">سجّل طفلك</a>
        </nav>

        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="القائمة">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href="/login/register" className="nav-cta" onClick={() => setOpen(false)}>سجّل طفلك</a>
        </div>
      )}
    </header>
  );
}