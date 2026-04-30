'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Courses from '@/components/Courses';
import Features from '@/components/Features';
import Trust from '@/components/Trust';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import RegistrationForm from '@/components/RegistrationForm';
import ComingSoon from '@/components/ComingSoon';

export default function HomePage() {
  const [view, setView] = useState<'home' | 'registration' | 'comingSoon'>('home');
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  if (view === 'registration') {
    return <RegistrationForm onBack={() => setView('home')} />;
  }
  if (view === 'comingSoon') {
    return <ComingSoon featureTitle={comingSoonFeature || ''} onBack={() => setView('home')} />;
  }

  return (
    <>
      <Navbar onRegisterClick={() => setView('registration')} />
      <Hero onRegisterClick={() => setView('registration')} />
      <Courses />
      <Features
        onMockTestsClick={() => { setComingSoonFeature('Mock Tests'); setView('comingSoon'); }}
        onQAClick={() => { setComingSoonFeature('Q&A Practice'); setView('comingSoon'); }}
        onExpertDoubtClick={() => { setComingSoonFeature('Expert Doubt Solving'); setView('comingSoon'); }}
      />
      <Trust />
      <Footer />
      <ScrollToTop />
    </>
  );
}