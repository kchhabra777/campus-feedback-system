import React from 'react';
import { ShieldAlert, LogOut, Mail, AlertTriangle, ExternalLink } from 'lucide-react';

export function AccountSuspended({ user, onLogout }) {
  const email = user?.email || 'Your account';
  const fullName = user?.studentProfile?.fullName || user?.teacherProfile?.fullName || email.split('@')[0];
  const rollNumber = user?.studentProfile?.rollNumber;
  const batch = user?.studentProfile?.batch || user?.detectedBatch;
  const role = user?.role || 'STUDENT';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #090d16 0%, #030712 100%)',
      color: '#f8fafc',
      padding: '24px',
      fontFamily: 'inherit'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#0f172a',
        borderRadius: '20px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.25) 100%)',
          padding: '32px 28px 24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ef4444'
          }}>
            <ShieldAlert size={34} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            color: '#fca5a5',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '10px'
          }}>
            <AlertTriangle size={13} />
            Account Suspended
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 0 8px',
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}>
            Access Revoked
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            lineHeight: 1.5,
            margin: 0
          }}>
            This university account has been suspended by campus administration due to policy violations or disciplinary review.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px' }}>
          {/* User Details Box */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px'
            }}>
              Account Profile
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Name</span>
                <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{fullName}</strong>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Role</span>
                <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{role}</strong>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>University Email</span>
                <span style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-all' }}>{email}</span>
              </div>

              {rollNumber && (
                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Roll Number</span>
                  <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{rollNumber}</strong>
                </div>
              )}

              {batch && (
                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Batch</span>
                  <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{batch}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Restrictions Info */}
          <div style={{
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '24px'
          }}>
            <p style={{ margin: '0 0 10px' }}>
              While under suspension, you are strictly barred from:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1' }}>
              <li>Submitting course or faculty evaluations</li>
              <li>Voting, commenting, or interacting with feedback threads</li>
              <li>Accessing the student portal features</li>
            </ul>
          </div>

          {/* Administrative Appeal Notice */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <Mail size={18} style={{ color: '#38bdf8', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Questions or Appeals?</span>
              <br />
              If you believe this suspension is in error, contact the Dean of Academic Affairs (DOAA) office at{' '}
              <a
                href="mailto:admin@thapar.edu?subject=Appeal%20Account%20Suspension"
                style={{ color: '#38bdf8', textDecoration: 'underline' }}
              >
                admin@thapar.edu
              </a>.
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
            onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
          >
            <LogOut size={16} />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountSuspended;
