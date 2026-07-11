'use client';

import { useEffect, useRef, useState } from 'react';
import type { ActivityLogItem, LogTarget, TabKey } from '../types';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'stats', label: '📊 إحصائيات المدرسة' },
  { key: 'students', label: '🧒 التلاميذ' },
  { key: 'teachers', label: '👩‍🏫 الأساتذة' },
  { key: 'classes', label: '🏫 الأقسام' },
  { key: 'messages', label: '📣 الإشعارات والرسائل' },
];

interface Props {
  activityLog: ActivityLogItem[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onPanelOpened: () => void;
  onNotificationClick: (target: LogTarget | null | undefined) => void;
}

export default function Header({
  activityLog,
  activeTab,
  onTabChange,
  onPanelOpened,
  onNotificationClick,
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

  const unreadCount = activityLog.filter((n) => !n.read).length;

  function togglePanel() {
    const next = !panelOpen;
    setPanelOpen(next);
    if (next) onPanelOpened();
  }

  function handleClickItem(target: LogTarget | null | undefined) {
    setPanelOpen(false);
    onNotificationClick(target);
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
            <div className="av">إد</div>
            <div className="mp-info">
              <b>الإدارة</b>
              <span>حساب المدير</span>
            </div>
          </div>

          <div style={{ position: 'relative' }} ref={wrapRef}>
            <button className="bell-btn" onClick={togglePanel} title="الإشعارات">
              🔔
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>

            {panelOpen && (
              <div className="notif-panel" style={{ display: 'block' }}>
                <h4>سجل الأنشطة</h4>
                <div>
                  {activityLog.length === 0 ? (
                    <div className="notif-empty">لا يوجد نشاط بعد.</div>
                  ) : (
                    [...activityLog].reverse().map((n) => (
                      <div
                        className="notif-item"
                        key={n.id}
                        onClick={() => handleClickItem(n.target)}
                      >
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