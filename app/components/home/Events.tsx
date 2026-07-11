const EVENTS = [
  {
    day: '18', month: 'جويلية',
    title: 'خروج ترفيهي إلى الحديقة العامة',
    desc: 'يوم كامل من الألعاب والأنشطة الجماعية في الهواء الطلق لجميع الأقسام.',
    tag: 'نشاط خارجي',
  },
  {
    day: '25', month: 'جويلية',
    title: 'معرض رسومات الأطفال',
    desc: 'معرض مفتوح للأولياء لعرض أعمال أطفالهم الفنية خلال الفصل الدراسي.',
    tag: 'فعالية فنية',
  },
  {
    day: '02', month: 'أوت',
    title: 'اجتماع أولياء الأمور الفصلي',
    desc: 'لقاء تعريفي بتقدم الأطفال التربوي ومناقشة برنامج الفصل القادم.',
    tag: 'اجتماع',
  },
];

export default function Events() {
  return (
    <section id="events" className="section-shell">
      <div className="section-head">
        <span className="section-tag" style={{ background: 'rgba(127,168,201,.16)', color: 'var(--sky-dark)' }}>
          الأحداث
        </span>
        <h2>الفعاليات القادمة</h2>
        <p>تابعوا آخر الأنشطة والفعاليات التي تنظمها الروضة لأطفالكم وللأولياء.</p>
      </div>

      <div className="events-grid">
        {EVENTS.map((e) => (
          <div className="event-card" key={e.title}>
            <div className="event-date">
              <div className="d">{e.day}</div>
              <div className="m">{e.month}</div>
            </div>
            <div className="event-body">
              <h3>{e.title}</h3>
              <p>{e.desc}</p>
              <span className="event-tag">{e.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}