import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Courses from './components/Courses';
import Features from './components/Features';
import Trust from './components/Trust';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Courses />
      <Features />
      <Trust />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;
