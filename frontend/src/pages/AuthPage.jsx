import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const AuthPage = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [detectedRole, setDetectedRole] = useState(null);
  const [detectedBatch, setDetectedBatch] = useState(null);
  const [emailStatus, setEmailStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live email role evaluation
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setDetectedRole(null);
      setDetectedBatch(null);
      setEmailStatus('');
      return;
    }

    if (!trimmed.endsWith('@thapar.edu')) {
      setDetectedRole(null);
      setDetectedBatch(null);
      setEmailStatus('Only @thapar.edu emails are allowed');
      return;
    }

    setEmailStatus('');
    const local = trimmed.split('@')[0];
    const match = local.match(/(?:^|_|\.)be(2[3-9]|30)(?:$|_|\.|\d*)/i);

    if (match) {
      setDetectedRole('STUDENT');
      setDetectedBatch(`BE${match[1]}`);
    } else {
      setDetectedRole('TEACHER');
      setDetectedBatch(null);
    }
  }, [email]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim().toLowerCase().endsWith('@thapar.edu')) {
      setError("Please enter a valid @thapar.edu email address.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.sendOtp(email.trim());
      setOtpSent(true);
      setSuccessMsg(res.message || `Verification code sent to ${email}`);
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isSignup) {
        if (!otpSent) {
          await handleSendOtp(e);
          return;
        }
        await signup(email.trim(), password, otp.trim());
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
      position: 'relative',
      paddingBottom: '40px'
    }}>
      {/* Top Panoramic Campus Illustration */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 20px 0 20px',
        textAlign: 'center'
      }}>
        <img
          src="/thapar-campus-banner.png"
          alt="Thapar Institute Campus Architectural Illustration"
          style={{
            width: '100%',
            maxHeight: '260px',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </div>

      {/* Main Content & Form Card */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        padding: '0 20px',
        marginTop: '10px',
        textAlign: 'center'
      }}>
        {/* Title & Subtitle */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
            fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)'
          }}>
            Faculty Feedback System
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#64748b',
            margin: 0,
            fontWeight: 400
          }}>
            Transparent & Honest Campus Reviews for Thapar University
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{
          padding: '28px 32px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <button
              onClick={() => { setIsSignup(true); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '12px 10px',
                border: 'none',
                background: 'none',
                fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '15px',
                fontWeight: 700,
                color: isSignup ? '#c81e1e' : '#64748b',
                borderBottom: isSignup ? '2.5px solid #c81e1e' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setIsSignup(false); setError(''); setSuccessMsg(''); setOtpSent(false); }}
              style={{
                flex: 1,
                padding: '12px 10px',
                border: 'none',
                background: 'none',
                fontFamily: 'var(--font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '15px',
                fontWeight: 700,
                color: !isSignup ? '#c81e1e' : '#64748b',
                borderBottom: !isSignup ? '2.5px solid #c81e1e' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Log In
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {/* Email Input */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                Thapar Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. kchhabra_be24@thapar.edu or faculty@thapar.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSignup && otpSent}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Real-Time Role Detection Indicator */}
              {detectedRole && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {detectedRole === 'STUDENT' ? (
                    <span className="badge badge-student" style={{ fontSize: '12px' }}>
                      <UserCheck size={13} />
                      Student Identified ({detectedBatch})
                    </span>
                  ) : (
                    <span className="badge badge-teacher" style={{ fontSize: '12px' }}>
                      <ShieldCheck size={13} />
                      Faculty / Teacher Identified
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    (Auto-assigned)
                  </span>
                </div>
              )}

              {emailStatus && (
                <div style={{ fontSize: '12px', color: '#c81e1e', marginTop: '5px' }}>
                  {emailStatus}
                </div>
              )}
            </div>

            {/* In Signup: OTP Step */}
            {isSignup && !otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !detectedRole}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  backgroundColor: '#c81e1e',
                  borderColor: '#c81e1e',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 600,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <KeyRound size={16} />
                <span>{loading ? "Sending Code..." : "Send Verification OTP"}</span>
              </button>
            ) : (
              <>
                {/* OTP Input for Signup */}
                {isSignup && otpSent && (
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{ background: 'none', border: 'none', color: '#c81e1e', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Resend OTP
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-input"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ letterSpacing: '4px', fontWeight: 700, fontSize: '16px', borderRadius: '10px', padding: '11px 14px' }}
                    />
                  </div>
                )}

                {/* Password Input */}
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                    {isSignup ? "Create Password" : "Password"}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={isSignup ? "Minimum 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ borderRadius: '10px', padding: '11px 14px', fontSize: '14px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    backgroundColor: '#c81e1e',
                    borderColor: '#c81e1e',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 600,
                    fontSize: '15px'
                  }}
                >
                  {loading
                    ? "Processing..."
                    : isSignup
                    ? "Verify Code & Complete Sign Up"
                    : "Log In to Portal"}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Security Notice */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '13px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <span>🔒</span> Restricted to verified Thapar University faculty and students.
        </div>
      </div>
    </div>
  );
};
