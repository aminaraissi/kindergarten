import type { Lesson } from '../types';

interface Props {
  lessons: Lesson[];
}

export default function LessonsTab({ lessons }: Props) {
  return (
    <section className="page active">
      <div className="card sec-lessons">
        <div className="card-head">
          <div className="ic">📘</div>
          <h2>الدروس والأنشطة</h2>
        </div>

        {lessons.length === 0 ? (
          <div className="empty-msg">لا توجد دروس أو أنشطة مضافة بعد.</div>
        ) : (
          <div>
            {lessons.map((l, idx) => (
              <div className="list-item" key={idx}>
                <div className="li-icon">{l.icon}</div>
                <div className="li-body">
                  <h3>{l.title}</h3>
                  <p>{l.desc}</p>
                  <span className="li-tag">{l.subject}</span>
                </div>
                <div className="li-date">{l.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}