import React, { useState } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { isSignedIn } = useUser();
  const { authError } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #eef2f6 100%)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* 1. Top Institutional Navigation Bar */}
      <header style={{
        width: '100%',
        height: '68px',
        background: '#ffffff',
        borderBottom: '2px solid #b91c1c',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 40px)',
        flexShrink: 0
      }}>
        {/* Left: Thapar Official Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/tiet-navbar-logo.png"
            alt="Thapar Institute of Engineering & Technology"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        {/* Right: Verified Institutional Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#991b1b'
        }}>
          <ShieldCheck size={15} color="#b91c1c" />
          <span style={{ letterSpacing: '0.01em' }}>TIET 3rd-Party SSO Portal</span>
        </div>
      </header>

      {/* 2. Main Content & Authentication Card */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 36px 16px',
        width: '100%'
      }}>
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          
          {/* Prominent Center Thapar Crest */}
          <div style={{ marginBottom: '16px' }}>
            <img
              src="/tiet-logo-full.png"
              alt="Thapar Institute Crest"
              style={{
                height: '80px',
                maxWidth: '280px',
                width: 'auto',
                objectFit: 'contain',
                margin: '0 auto 10px auto',
                display: 'block'
              }}
            />
            <h1 style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 6px 0',
              fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)'
            }}>
              Faculty Feedback System
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0,
              fontWeight: 400
            }}>
              Transparent & Honest Campus Reviews for Thapar University
            </p>
          </div>

          {/* Error Banner for Non-Thapar Accounts */}
          {authError && (
            <div style={{
              margin: '0 auto 18px auto',
              maxWidth: '440px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '12px',
              color: '#991b1b',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
              boxShadow: '0 2px 6px rgba(185, 28, 28, 0.08)'
            }}>
              <AlertCircle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {/* Clerk 3rd-Party Authentication Widget */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginBottom: '16px'
          }}>
            {isSignup ? (
              <SignUp
                routing="hash"
                signInUrl="#/login"
                appearance={{
                  variables: {
                    colorPrimary: '#b91c1c',
                    colorText: '#0f172a',
                    fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)'
                  },
                  elements: {
                    card: {
                      boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    },
                    footer: { display: 'none' }
                  }
                }}
              />
            ) : (
              <SignIn
                routing="hash"
                signUpUrl="#/signup"
                appearance={{
                  variables: {
                    colorPrimary: '#b91c1c',
                    colorText: '#0f172a',
                    fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)'
                  },
                  elements: {
                    card: {
                      boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    },
                    footer: { display: 'none' }
                  }
                }}
              />
            )}
          </div>

          {/* Toggle Switch between Log In and Sign Up */}
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setIsSignup(!isSignup)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isSignup
                ? "Already registered? Switch to Sign In"
                : "New to portal? Switch to Sign Up"}
            </button>
          </div>

          {/* Security Notice & University Attribution */}
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#64748b',
            lineHeight: 1.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <span>🔒</span>
              <span>Protected by Clerk 3rd-Party Identity Verification</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Thapar Institute of Engineering & Technology (Deemed to be University), Patiala
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
