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
import ComingSoon from './components/ComingSoon';

function App() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showMockTests, setShowMockTests] = useState(false);
  const [showExpertDoubt, setShowExpertDoubt] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {showRegistration ? (
        <RegistrationForm onBack={() => setShowRegistration(false)} />
      ) : showMockTests ? (
        <MockTestsQA onBack={() => setShowMockTests(false)} />
      ) : showExpertDoubt ? (
        <ExpertDoubtSolving onBack={() => setShowExpertDoubt(false)} />
      ) : comingSoonFeature ? (
        <ComingSoon featureTitle={comingSoonFeature} onBack={() => setComingSoonFeature(null)} />
      ) : (
        <>
          <Navbar onRegisterClick={() => setShowRegistration(true)} />
          <Hero onRegisterClick={() => setShowRegistration(true)} />
          <Courses />
          <Features 
            onMockTestsClick={() => setComingSoonFeature('Mock Tests')} 
            onQAClick={() => setComingSoonFeature('Q&A Practice')}
            onExpertDoubtClick={() => setComingSoonFeature('Expert Doubt Solving')} 
          />
          <Trust />
          <Footer />
          <ScrollToTop />
        </>
      )}
    </div>
  );
}

export default App;
