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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/tiet-logo-full.png"
            alt="Thapar Institute of Engineering & Technology"
            style={{
              height: '90px',
              maxWidth: '100%',
              objectFit: 'contain',
              marginBottom: '16px',
              display: 'inline-block'
            }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Faculty Feedback System
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Transparent & Honest Campus Reviews for Thapar University
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '30px', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
            <button
              onClick={() => { setIsSignup(true); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '15px',
                fontWeight: 700,
                color: isSignup ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: isSignup ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setIsSignup(false); setError(''); setSuccessMsg(''); setOtpSent(false); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '15px',
                fontWeight: 700,
                color: !isSignup ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: !isSignup ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {/* Email Input */}
            <div className="form-group">
              <label className="form-label">Thapar Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. kchhabra_be24@thapar.edu or faculty@thapar.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSignup && otpSent}
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
                    (Role automatically assigned by backend)
                  </span>
                </div>
              )}

              {emailStatus && (
                <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px' }}>
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
                style={{ width: '100%', marginTop: '8px' }}
              >
                <KeyRound size={16} />
                <span>{loading ? "Sending Code..." : "Send Verification OTP"}</span>
              </button>
            ) : (
              <>
                {/* OTP Input for Signup */}
                {isSignup && otpSent && (
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">6-Digit Verification Code</label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Resend OTP
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-input"
                      placeholder="Enter 6-digit code sent to your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ letterSpacing: '4px', fontWeight: 700, fontSize: '16px' }}
                    />
                  </div>
                )}

                {/* Password Input */}
                <div className="form-group">
                  <label className="form-label">{isSignup ? "Create Password" : "Password"}</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={isSignup ? "Minimum 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
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

        {/* Security Footer Notice */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
          🔒 Restricted to verified Thapar University faculty and students.
        </div>
      </div>
    </div>
  );
};
