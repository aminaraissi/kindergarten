import type { Task } from '../types';

interface Props {
  tasks: Task[];
  onToggle: (index: number) => void;
}

export default function TasksTab({ tasks, onToggle }: Props) {
  return (
    <section className="page active">
      <div className="card sec-tasks">
        <div className="card-head">
          <div className="ic">📌</div>
          <h2>مطلوب من الأستاذ</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-msg">لا توجد طلبات حاليًا.</div>
        ) : (
          <div>
            {tasks.map((t, idx) => (
              <div className="task-item" key={idx}>
                <div
                  className={`task-check ${t.done ? 'done' : ''}`}
                  onClick={() => onToggle(idx)}
                >
                  {t.done ? '✓' : ''}
                </div>
                <div className={`task-body ${t.done ? 'done-text' : ''}`}>
                  <h3>{t.title}</h3>
                  <span className="li-tag">{t.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}