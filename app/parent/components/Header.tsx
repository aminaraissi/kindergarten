'use client';

import { useEffect, useRef, useState } from 'react';
import type { Child, NotificationItem, TabKey } from '../types';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'lessons', label: '📘 الدروس والأنشطة' },
  { key: 'tasks', label: '📌 مطلوب من الأستاذ' },
  { key: 'points', label: '🌟 النقاط حسب المواد' },
  { key: 'attendance', label: '🗓️ متابعة الحضور' },
];

interface Props {
  child: Child;
  notifications: NotificationItem[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNotificationsOpened: () => void;
}

export default function Header({
  child,
  notifications,
  activeTab,
  onTabChange,
  onNotificationsOpened,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggleNotifications() {
    const next = !panelOpen;
    setPanelOpen(next);
    if (next) onNotificationsOpened();
  }

  return (
    <header className="topbar">
      <div className="row-main">
        <div className="brand">
          <span className="blocks">
            <span>ط</span>
            <span>ف</span>
          </span>
          فضاء الطفل
        </div>

        <div className="row-right">
          <div className="mini-profile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={child.avatarUrl || '/child-avatar-placeholder.png'}
              alt="صورة الطفل"
            />
            <div className="mp-info">
              <b>{child.name} {child.lastname}</b>
              <span>{child.section}</span>
            </div>
          </div>

          <div style={{ position: 'relative' }} ref={wrapRef}>
            <button className="bell-btn" onClick={toggleNotifications} title="الإشعارات">
              🔔
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>

            {panelOpen && (
              <div className="notif-panel" style={{ display: 'block' }}>
                <h4>الإشعارات</h4>
                <div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">لا توجد إشعارات حاليًا.</div>
                  ) : (
                    [...notifications].reverse().map((n, idx) => (
                      <div className="notif-item" key={idx}>
                        <div className="notif-icon" style={{ background: n.color }}>
                          {n.icon}
                        </div>
                        <div className="txt">
                          <b>{n.title}</b>
                          <span className="time">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="tabs-row">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={tab.key === activeTab ? 'active' : ''}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}