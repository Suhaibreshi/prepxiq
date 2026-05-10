'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Courses from '@/components/Courses';
import Features from '@/components/Features';
import Trust from '@/components/Trust';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ComingSoon from '@/components/ComingSoon';

export default function StudentDashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [view, setView] = useState<'dashboard' | 'comingSoon'>('dashboard');
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/student');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (view === 'comingSoon') {
    return <ComingSoon featureTitle={comingSoonFeature || ''} onBack={() => setView('dashboard')} />;
  }

  return (
    <>
      <Navbar hideRegisterButton={true} />
      {/* We use Hero but maybe customize it to say "Welcome back" or just keep it as is */}
      <Hero hideRegisterButton={true} />
      <div id="courses">
        <Courses />
      </div>
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
