import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_BATCHES } from '../api/client';
import { User, GraduationCap, Building, AlertCircle } from 'lucide-react';

export const StudentOnboarding = () => {
  const { user, onboardStudent } = useAuth();
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('COE');
  const [batch, setBatch] = useState(ALLOWED_BATCHES[0]); // default to 3Q11
  const [yearOfStudy, setYearOfStudy] = useState(batch.startsWith('3') ? 3 : 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBatchChange = (newBatch) => {
    setBatch(newBatch);
    if (newBatch.startsWith('3')) {
      setYearOfStudy(3);
    } else if (newBatch.startsWith('2')) {
      setYearOfStudy(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^\d{10}$/.test(rollNumber.trim())) {
      setError("Roll Number must be exactly 10 numeric digits (e.g. 1024031234).");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onboardStudent({
        fullName: fullName.trim(),
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
            Enter your student details for verified campus transparency.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Robin Singh"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* 10-Digit Roll Number */}
          <div className="form-group">
            <label className="form-label">10-Digit Roll Number *</label>
            <input
              type="text"
              maxLength={10}
              className="form-input"
              placeholder="e.g. 1024170003"
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

          {/* Batch Group (Allowed List: 3Q11-3Q15, 2Q11-2Q15) */}
          <div className="form-group">
            <label className="form-label">Batch Group / Sub-group *</label>
            <select
              className="form-select"
              value={batch}
              onChange={(e) => handleBatchChange(e.target.value)}
              required
            >
              <optgroup label="3rd Year (3Q Batches)">
                <option value="3Q11">3Q11</option>
                <option value="3Q12">3Q12</option>
                <option value="3Q13">3Q13</option>
                <option value="3Q14">3Q14</option>
                <option value="3Q15">3Q15</option>
              </optgroup>
              <optgroup label="2nd Year (2Q Batches)">
                <option value="2Q11">2Q11</option>
                <option value="2Q12">2Q12</option>
                <option value="2Q13">2Q13</option>
                <option value="2Q14">2Q14</option>
                <option value="2Q15">2Q15</option>
              </optgroup>
            </select>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Select your active assigned campus batch group.
            </span>
          </div>

          {/* Year of Study */}
          <div className="form-group">
            <label className="form-label">Year of Study *</label>
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
