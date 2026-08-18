import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, GraduationCap, Building, AlertCircle } from 'lucide-react';

export const StudentOnboarding = () => {
  const { user, onboardStudent } = useAuth();
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('COE');
  const [batch, setBatch] = useState(user?.detectedBatch || 'BE24');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(rollNumber.trim())) {
      setError("Roll Number must be exactly 10 numeric digits (e.g. 1024031234).");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onboardStudent({
        rollNumber: rollNumber.trim(),
        branch,
        batch: batch.toUpperCase(),
        yearOfStudy: Number(yearOfStudy)
      });
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-main)' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="badge badge-student" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <GraduationCap size={15} />
            <span>Student Profile Setup</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Complete Your Student Profile</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enter your academic credentials for campus verification and transparent feedback.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 10-Digit Roll Number */}
          <div className="form-group">
            <label className="form-label">10-Digit Roll Number *</label>
            <input
              type="text"
              maxLength={10}
              className="form-input"
              placeholder="e.g. 1024031234"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              pattern="\d{10}"
              title="Must be 10 numeric digits"
            />
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Must be exactly 10 digits as issued on your Thapar ID card.
            </span>
          </div>

          {/* Branch */}
          <div className="form-group">
            <label className="form-label">Engineering Branch *</label>
            <select
              className="form-select"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            >
              <option value="COE">Computer Engineering (COE)</option>
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="COPC">Computer Science & Engineering - Patiala (COPC)</option>
              <option value="COSE">Software Engineering (COSE)</option>
              <option value="ENC">Electronics & Computer (ENC)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="EE">Electrical Engineering (EE)</option>
              <option value="ME">Mechanical Engineering (ME)</option>
              <option value="CE">Civil Engineering (CE)</option>
              <option value="CHE">Chemical Engineering (CHE)</option>
              <option value="BT">Biotechnology (BT)</option>
            </select>
          </div>

          {/* Batch */}
          <div className="form-group">
            <label className="form-label">Admission Batch *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BE24"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              required
            />
          </div>

          {/* Year of Study */}
          <div className="form-group">
            <label className="form-label">Current Year of Study *</label>
            <select
              className="form-select"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
              required
            >
              <option value={1}>1st Year (Fresher)</option>
              <option value={2}>2nd Year (Sophomore)</option>
              <option value={3}>3rd Year (Junior)</option>
              <option value={4}>4th Year (Senior / Final)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px' }}
          >
            {loading ? "Saving Profile..." : "Save & Enter Student Portal"}
          </button>
        </form>
      </div>
    </div>
  );
};
