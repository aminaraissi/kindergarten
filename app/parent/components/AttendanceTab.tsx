import type { AttendanceRecord, AttendanceStatus } from '../types';

const ATT_LABELS: Record<AttendanceStatus, string> = {
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',
};

const ATT_ICONS: Record<AttendanceStatus, string> = {
  present: '✓',
  absent: '✕',
  late: '⏱',
};

interface Props {
  attendance: AttendanceRecord[];
}

export default function AttendanceTab({ attendance }: Props) {
  const presentCount = attendance.filter((r) => r.status === 'present').length;
  const absentCount = attendance.filter((r) => r.status === 'absent').length;
  const lateCount = attendance.filter((r) => r.status === 'late').length;

  const sorted = [...attendance].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="page active">
      <div className="card sec-attendance">
        <div className="card-head">
          <div className="ic">🗓️</div>
          <h2>متابعة الحضور</h2>
        </div>

        <div className="att-stats">
          <div className="att-stat present">
            <div className="num">{presentCount}</div>
            <div className="lbl">أيام حضور</div>
          </div>
          <div className="att-stat absent">
            <div className="num">{absentCount}</div>
            <div className="lbl">أيام غياب</div>
          </div>
          <div className="att-stat late">
            <div className="num">{lateCount}</div>
            <div className="lbl">أيام تأخر</div>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="empty-msg">لا يوجد سجل حضور بعد.</div>
        ) : (
          <div>
            {sorted.map((r, idx) => (
              <div className="att-item" key={idx}>
                <div className={`att-badge ${r.status}`}>{ATT_ICONS[r.status]}</div>
                <div className="att-body">
                  <div className="status-txt">{ATT_LABELS[r.status]}</div>
                  {r.note && <div className="note">{r.note}</div>}
                </div>
                <div className="att-date">{r.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}