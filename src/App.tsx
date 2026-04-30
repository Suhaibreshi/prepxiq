import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Courses from './components/Courses';
import Features from './components/Features';
import Trust from './components/Trust';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import RegistrationForm from './components/RegistrationForm';
import ComingSoon from './components/ComingSoon';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import DashboardPage from './pages/DashboardPage';

function HomePage() {
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-otp" element={<OtpPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;