const JOBS = [
  { title: 'معلمة تربية تحضيرية', type: 'دوام كامل', location: 'داخل الروضة', desc: 'خبرة سنتين على الأقل في التعامل مع الأطفال دون سن 6 سنوات.' },
  { title: 'مربية مساعدة', type: 'دوام كامل', location: 'داخل الروضة', desc: 'شغف بالعمل مع الأطفال، لا يشترط خبرة سابقة.' },
  { title: 'مسؤول(ة) إدارية', type: 'دوام جزئي', location: 'داخل الروضة', desc: 'متابعة التسجيلات والتنسيق مع الأولياء والفريق التربوي.' },
];

export default function Jobs() {
  return (
    <section id="jobs" className="section-shell">
      <div className="section-head">
        <span className="section-tag" style={{ background: 'rgba(232,146,124,.16)', color: 'var(--blush-dark)' }}>
          انضم إلينا
        </span>
        <h2>وظائف شاغرة</h2>
        <p>نبحث دائمًا عن أعضاء فريق يشاركوننا شغف العمل مع الأطفال.</p>
      </div>

      <div className="jobs-list">
        {JOBS.map((job) => (
          <div className="job-row" key={job.title}>
            <div className="job-info">
              <h3>{job.title}</h3>
              <div className="job-meta">
                <span>{job.type}</span>
                <span>{job.location}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '8px 0 0', maxWidth: 480 }}>
                {job.desc}
              </p>
            </div>
            <a href="mailto:careers@example.com" className="btn btn-primary job-apply">قدّم الآن</a>
          </div>
        ))}
      </div>
    </section>
  );
}