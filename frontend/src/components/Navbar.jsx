import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Award, BookOpen } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('home')}>
          <img
            src="/tiet-navbar-logo.png"
            alt="Thapar Institute Logo"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div>
            <div className="brand-title">Faculty Feedback</div>
            <div className="brand-subtitle">Transparent & Honest Campus Reviews</div>
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user.role === 'STUDENT' ? (
                <span className="badge badge-student">
                  <User size={12} />
                  {user.studentProfile?.rollNumber || user.detectedBatch || 'Student'}
                  {user.studentProfile?.branch ? ` (${user.studentProfile.branch})` : ''}
                </span>
              ) : (
                <span className="badge badge-teacher">
                  <Award size={12} />
                  {user.teacherProfile?.fullName || 'Faculty'}
                </span>
              )}
            </div>

            <button onClick={logout} className="btn btn-subtle btn-sm" title="Log out">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
