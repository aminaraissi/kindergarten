import type { Subject } from '../types';

const MAX_SUBJECT_POINTS = 20;

interface Props {
  subjects: Subject[];
}

export default function PointsTab({ subjects }: Props) {
  const total = subjects.reduce((sum, s) => sum + s.points, 0);

  return (
    <section className="page active">
      <div className="card sec-points">
        <div className="card-head">
          <div className="ic">🌟</div>
          <h2>النقاط حسب المواد</h2>
        </div>

        <div className="points-total">
          <b>مجموع النقاط</b>
          <span className="big">{total}</span>
        </div>

        {subjects.length === 0 ? (
          <div className="empty-msg">لا توجد بيانات نقاط بعد.</div>
        ) : (
          <div>
            {subjects.map((s) => {
              const pct = Math.min(100, Math.round((s.points / MAX_SUBJECT_POINTS) * 100));
              return (
                <div className="subject-row" key={s.id}>
                  <div className="subj-icon" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <div className="subj-info">
                    <div className="name">{s.name}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct}%`, background: s.color }}
                      />
                    </div>
                  </div>
                  <div className="subj-pts">{s.points} ن</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}