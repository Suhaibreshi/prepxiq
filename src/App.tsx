import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Courses from './components/Courses';
import Features from './components/Features';
import ExpertDoubtSolving from './components/ExpertDoubtSolving';
import Trust from './components/Trust';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import RegistrationForm from './components/RegistrationForm';
import MockTestsQA from './components/MockTestsQA';

function App() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showMockTests, setShowMockTests] = useState(false);
  const [showExpertDoubt, setShowExpertDoubt] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {showRegistration ? (
        <RegistrationForm onBack={() => setShowRegistration(false)} />
      ) : showMockTests ? (
        <MockTestsQA onBack={() => setShowMockTests(false)} />
      ) : showExpertDoubt ? (
        <ExpertDoubtSolving onBack={() => setShowExpertDoubt(false)} />
      ) : (
        <>
          <Navbar onRegisterClick={() => setShowRegistration(true)} />
          <Hero onRegisterClick={() => setShowRegistration(true)} />
          <Courses />
          <Features onMockTestsClick={() => setShowMockTests(true)} onExpertDoubtClick={() => setShowExpertDoubt(true)} />
          <Trust />
          <Footer />
          <ScrollToTop />
        </>
      )}
    </div>
  );
}

export default App;
