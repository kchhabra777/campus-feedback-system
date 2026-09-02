import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { StudentOnboarding } from './pages/StudentOnboarding';
import { TeacherOnboarding } from './pages/TeacherOnboarding';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Navbar } from './components/Navbar';
import { Roadmap } from './pages/Roadmap';
import CloudLoader from './components/ui/quantum-cloud-loader';
import { Marquee } from './components/ui/marquee';

export function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  if (window.location.pathname === '/marquee') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#fff', padding: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Campus Community Tag Marquee</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Infinite auto-scrolling with fade mask & pause on hover</p>
        
        <div style={{ width: '100%', maxWidth: '800px', padding: '20px 0', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
          <Marquee pauseOnHover={true} duration={22}>
            <span style={{ margin: '0 20px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '14px', fontWeight: 600 }}>#FairGrader</span>
            <span style={{ margin: '0 20px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '14px', fontWeight: 600 }}>#PracticalLabs</span>
            <span style={{ margin: '0 20px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontSize: '14px', fontWeight: 600 }}>#ClearConcepts</span>
            <span style={{ margin: '0 20px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', fontSize: '14px', fontWeight: 600 }}>#ProjectHeavy</span>
            <span style={{ margin: '0 20px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', fontSize: '14px', fontWeight: 600 }}>#ApproachableFaculty</span>
            <span style={{ margin: '0 20px', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', fontSize: '14px', fontWeight: 600 }}>#EngagingLectures</span>
          </Marquee>
        </div>

        <a href="/" style={{ marginTop: '28px', fontSize: '14px', color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer' }}>
          ← Back to Dashboard
        </a>
      </div>
    );
  }

  if (window.location.pathname === '/loader' || window.location.pathname === '/demo') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#fff', padding: '20px' }}>
        <CloudLoader />
        <p style={{ marginTop: '20px', fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>Quantum Cloud Loader</p>
        <a href="/" style={{ marginTop: '16px', fontSize: '13px', color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer' }}>
          ← Back to Dashboard
        </a>
      </div>
    );
  }

  if (window.location.pathname === '/roadmap') {
    return <Roadmap onBack={() => window.location.href = '/'} />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <CloudLoader />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, marginTop: '16px' }}>
          Loading Campus Feedback Portal...
        </p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Logged in but profile not complete
  if (!user.isProfileComplete) {
    if (user.role === 'STUDENT') {
      return <StudentOnboarding />;
    }
    if (user.role === 'TEACHER') {
      return <TeacherOnboarding />;
    }
  }

  // Logged in with complete profile
  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      {user.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : user.role === 'STUDENT' ? (
        <StudentDashboard />
      ) : (
        <TeacherDashboard />
      )}
    </div>
  );
}

export default App;
