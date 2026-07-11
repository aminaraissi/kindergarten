const PLANS = [
  {
    name: 'الاشتراك الشهري',
    desc: 'مناسب للتجربة أو الالتحاق في منتصف السنة',
    price: '6,500',
    period: 'دج / شهريًا',
    featured: false,
    features: ['دوام يومي كامل', 'وجبة إفطار ووجبة خفيفة', 'متابعة تربوية شهرية', 'أنشطة فنية وحركية'],
  },
  {
    name: 'الاشتراك الفصلي',
    desc: 'الأنسب لمعظم الأولياء — توفير ملحوظ',
    price: '17,500',
    period: 'دج / 3 أشهر',
    featured: true,
    features: ['كل مزايا الاشتراك الشهري', 'خصم عن السعر الشهري', 'تقرير تربوي كل شهر', 'أولوية التسجيل في الأنشطة الخارجية'],
  },
  {
    name: 'الاشتراك السنوي',
    desc: 'أفضل قيمة على مدار السنة الدراسية',
    price: '62,000',
    period: 'دج / سنويًا',
    featured: false,
    features: ['كل مزايا الاشتراك الفصلي', 'أكبر نسبة توفير', 'حقيبة وزي الروضة هدية', 'دعوة لفعاليات الأولياء الحصرية'],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-shell">
      <div className="section-head">
        <span className="section-tag" style={{ background: 'rgba(240,180,41,.16)', color: 'var(--sun-dark)' }}>
          الأسعار
        </span>
        <h2>باقات الاشتراك</h2>
        <p>اختر الباقة المناسبة لكم. جميع الأسعار قابلة للدفع مباشرة في مقر الروضة.</p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div className={`price-card ${plan.featured ? 'featured' : ''}`} key={plan.name}>
            {plan.featured && <span className="price-badge">الأكثر اختيارًا</span>}
            <h3>{plan.name}</h3>
            <div className="desc">{plan.desc}</div>
            <div className="price-amount">{plan.price} <span>دج</span></div>
            <div className="price-period">{plan.period}</div>
            <ul className="price-features">
              {plan.features.map((f) => (
                <li key={f}><span className="tick">✓</span> {f}</li>
              ))}
            </ul>
            <a
              href="/login/register"
              className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'center' }}
            >
              اختر هذه الباقة
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}