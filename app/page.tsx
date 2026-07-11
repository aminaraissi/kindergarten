import './home.css';
import Nav from './components/home/Nav';
import Hero from './components/home/Hero';
import About from './components/home/About';
import Pricing from './components/home/Pricing';
import Events from './components/home/Events';
import Jobs from './components/home/Jobs';
import Footer from './components/home/Footer';

export default function HomePage() {
  return (
    <div className="home-page">
      <Nav />
      <Hero />
      <About />
      <Pricing />
      <Events />
      <Jobs />
      <Footer />
    </div>
  );
}