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

export function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  if (window.location.pathname === '/roadmap') {
    return <Roadmap onBack={() => window.location.href = '/'} />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Loading Campus Feedback Portal...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
