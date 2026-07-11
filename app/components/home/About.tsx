const ACTIVITIES = [
  { icon: '📚', color: 'var(--sage)', title: 'تعليم تحضيري', desc: 'برنامج تربوي يهيّئ الطفل للمرحلة الابتدائية عبر أنشطة الحروف والأرقام.' },
  { icon: '🎨', color: 'var(--blush)', title: 'أنشطة فنية وحركية', desc: 'رسم، موسيقى، وأنشطة حركية تنمّي الإبداع والثقة بالنفس.' },
  { icon: '🍎', color: 'var(--sun)', title: 'وجبات متوازنة', desc: 'وجبات صحية ومتوازنة يُشرف عليها فريق مختص بتغذية الأطفال.' },
  { icon: '🩺', color: 'var(--sky)', title: 'متابعة صحية', desc: 'متابعة يومية لصحة وسلامة الأطفال طوال فترة تواجدهم بالروضة.' },
];

export default function About() {
  return (
    <section id="about" className="section-shell">
      <div className="section-head">
        <span className="section-tag" style={{ background: 'rgba(124,148,115,.14)', color: 'var(--sage-dark)' }}>
          من نحن
        </span>
        <h2>روضة فضاء الطفل</h2>
        <p>
          نؤمن بأن كل طفل يستحق بيئة آمنة ومحبة تساعده على النمو الفكري والاجتماعي والعاطفي.
          فريقنا التربوي يرافق طفلكم يوميًا في رحلة تعلّم ممتعة ومتوازنة.
        </p>
      </div>

      <div className="about-grid">
        {ACTIVITIES.map((a) => (
          <div className="about-card" key={a.title}>
            <div className="about-icon" style={{ background: a.color }}>{a.icon}</div>
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}