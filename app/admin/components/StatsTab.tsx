import type { ClassItem, Student, Teacher } from '../types';
import { paymentStatus } from '../utils';

interface Props {
  students: Student[];
  teachers: Teacher[];
  classes: ClassItem[];
}

export default function StatsTab({ students, teachers, classes }: Props) {
  const activeStudents = students.filter((s) => s.status === 'active');
  const activeTeachersCount = teachers.filter((t) => t.status === 'active').length;
  const activeClassesCount = classes.filter((c) => c.status === 'active').length;
  const pendingCount =
    students.filter((s) => s.status === 'pending').length +
    teachers.filter((t) => t.status === 'pending').length +
    classes.filter((c) => c.status === 'pending').length;

  const paymentInfos = activeStudents.map((s) => paymentStatus(s));
  const paidCount = paymentInfos.filter((i) => i.status === 'ok').length;
  const dueSoonCount = paymentInfos.filter((i) => i.status === 'due_soon').length;
  const overdueCount = paymentInfos.filter((i) => i.status === 'overdue').length;

  const dist: Record<string, number> = {};
  activeStudents.forEach((s) => {
    const cls = classes.find((c) => c.id === s.sectionId);
    const sec = cls ? cls.name : 'غير محدد';
    dist[sec] = (dist[sec] || 0) + 1;
  });
  const distEntries = Object.entries(dist);
  const maxVal = Math.max(1, ...distEntries.map(([, v]) => v));

  return (
    <section className="page active">
      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sage)' }}>📊</div>
            <h2>نظرة عامة</h2>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card sage"><div className="num">{activeStudents.length}</div><div className="lbl">تلاميذ نشطون</div></div>
          <div className="stat-card sky"><div className="num">{activeTeachersCount}</div><div className="lbl">أساتذة نشطون</div></div>
          <div className="stat-card blush"><div className="num">{activeClassesCount}</div><div className="lbl">أقسام نشطة</div></div>
          <div className="stat-card sun"><div className="num">{pendingCount}</div><div className="lbl">طلبات قيد الانتظار</div></div>
        </div>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <div className="stat-card sage"><div className="num">{paidCount}</div><div className="lbl">الدفع محدَّث</div></div>
          <div className="stat-card sun"><div className="num">{dueSoonCount}</div><div className="lbl">تبقى لهم أسبوع للدفع</div></div>
          <div className="stat-card blush"><div className="num">{overdueCount}</div><div className="lbl">متأخرون عن الدفع</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="left">
            <div className="ic" style={{ background: 'var(--sky)' }}>📈</div>
            <h2>توزيع التلاميذ حسب الأقسام</h2>
          </div>
        </div>
        {distEntries.length === 0 ? (
          <div className="empty-msg">لا يوجد تلاميذ نشطون بعد.</div>
        ) : (
          <div>
            {distEntries.map(([name, count]) => {
              const pct = Math.round((count / maxVal) * 100);
              return (
                <div className="dist-row" key={name}>
                  <div className="dist-name">{name}</div>
                  <div className="dist-track">
                    <div className="dist-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="dist-num">{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}