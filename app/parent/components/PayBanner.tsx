'use client';

import type { PaymentReminder } from '../types';

interface Props {
  reminder: PaymentReminder;
  onMarkPaid: () => void;
}

export default function PayBanner({ reminder, onMarkPaid }: Props) {
  if (!reminder.show) return null;

  return (
    <div className="pay-banner-wrap">
      <div className="pay-banner">
        <div className="msg">
          <span className="ic">⏰</span>
          <div>
            <b>{reminder.title || 'تذكير بموعد الدفع'}</b>
            <span>{reminder.message || ''}</span>
          </div>
        </div>
        <button className="pay-btn" onClick={onMarkPaid}>
          تم الدفع ✓
        </button>
      </div>
    </div>
  );
}