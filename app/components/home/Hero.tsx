export default function Hero() {
  return (
    <section className="hero">
      <div>
        <span className="hero-tag">🌱 روضة أطفال بمعايير تربوية حديثة</span>
        <h1>فضاء آمن ودافئ ينمّي طفلك ويحبّب له التعلّم</h1>
        <p>
          في فضاء الطفل، نجمع بين الرعاية الحنونة والأنشطة التربوية الهادفة لنمنح أطفالكم
          بيئة محفزة على الاكتشاف واللعب والتعلّم منذ نعومة أظفارهم.
        </p>
        <div className="hero-actions">
          <a href="/login/register" className="btn btn-primary">سجّل طفلك الآن</a>
          <a href="#about" className="btn btn-outline">تعرّف علينا</a>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-stat sage">
          <div className="num">+120</div>
          <div className="lbl">طفل مسجَّل</div>
        </div>
        <div className="hero-stat sky">
          <div className="num">15</div>
          <div className="lbl">مربية ومعلمة</div>
        </div>
        <div className="hero-stat blush">
          <div className="num">6</div>
          <div className="lbl">أقسام تعليمية</div>
        </div>
        <div className="hero-stat sun">
          <div className="num">+8</div>
          <div className="lbl">سنوات خبرة</div>
        </div>
      </div>
    </section>
  );
}