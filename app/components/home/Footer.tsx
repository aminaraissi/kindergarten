export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>فضاء الطفل</h4>
          <p>روضة أطفال توفّر بيئة تعليمية آمنة ومحفزة، تجمع بين الرعاية والتعلّم الممتع لأطفالكم.</p>
        </div>
        <div>
          <h4>روابط سريعة</h4>
          <ul className="footer-links">
            <li><a href="#about">من نحن</a></li>
            <li><a href="#pricing">الأسعار</a></li>
            <li><a href="#events">الأحداث</a></li>
            <li><a href="#jobs">وظائف شاغرة</a></li>
            <li><a href="/login">تسجيل الدخول</a></li>
          </ul>
        </div>
        <div>
          <h4>تواصل معنا</h4>
          <ul className="footer-links">
            <li>📍 حي النصر، بومرداس</li>
            <li>📞 0555 00 11 22</li>
            <li>✉️ contact@example.com</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} فضاء الطفل. جميع الحقوق محفوظة.</div>
    </footer>
  );
}

