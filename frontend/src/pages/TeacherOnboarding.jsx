import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_BATCHES, ALLOWED_ACADEMIC_YEARS } from '../api/client';
import { Award, Plus, Trash2, BookOpen, AlertCircle, LogOut } from 'lucide-react';

export const TeacherOnboarding = () => {
  const { user, onboardTeacher, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [designation, setDesignation] = useState('Assistant Professor');

  const [offerings, setOfferings] = useState([
    {
      courseCode: '',
      courseName: '',
      batchTaught: '3Q11',
      branchTaught: 'COE',
      academicYear: ALLOWED_ACADEMIC_YEARS[0]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddOffering = () => {
    setOfferings([
      ...offerings,
      {
        courseCode: '',
        courseName: '',
        batchTaught: '3Q11',
        branchTaught: 'COE',
        academicYear: ALLOWED_ACADEMIC_YEARS[0]
      }
    ]);
  };

  const handleRemoveOffering = (index) => {
    setOfferings(offerings.filter((_, i) => i !== index));
  };

  const handleOfferingChange = (index, field, value) => {
    const updated = [...offerings];
    updated[index][field] = value;
    setOfferings(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const validOfferings = offerings.filter(
      (off) => off.courseCode.trim() && off.courseName.trim() && off.batchTaught.trim()
    );

    if (validOfferings.length === 0) {
      setError("Please register at least one course and batch you teach.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onboardTeacher({
        fullName: fullName.trim(),
        department,
        designation,
        offerings: validOfferings
      });
    } catch (err) {
      setError(err.message || "Failed to save faculty profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: 'var(--bg-main)' }}>
      {/* Top Bar with Sign Out / Switch Account */}
      <div style={{ width: '100%', maxWidth: '680px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Signed in as: <strong style={{ color: 'var(--text-primary)' }}>{user?.email || 'Faculty'}</strong>
        </span>
        <button
          type="button"
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px'
          }}
          title="Sign out and return to login page"
        >
          <LogOut size={14} />
          <span>Switch Account</span>
        </button>
      </div>

      <div className="card" style={{ maxWidth: '680px', width: '100%', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="badge badge-teacher" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Award size={15} />
            <span>Faculty Profile Setup</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Faculty & Teaching Details</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Register the courses and student batches you teach so students in those batches can provide feedback.
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
              placeholder="e.g. Dr. Harpreet Kaur"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            {/* Department */}
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Electrical and Instrumentation Engineering">Electrical and Instrumentation Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics and Materials Science">Physics and Materials Science</option>
                <option value="School of Humanities & Social Sciences">School of Humanities & Social Sciences</option>
              </select>
            </div>

            {/* Designation */}
            <div className="form-group">
              <label className="form-label">Designation *</label>
              <select
                className="form-select"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              >
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Head of Department">Head of Department</option>
                <option value="Visiting Faculty">Visiting Faculty</option>
                <option value="Teaching Associate">Teaching Associate</option>
              </select>
            </div>
          </div>

          {/* Courses & Batches Taught */}
          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <label className="form-label" style={{ margin: 0 }}>Courses &amp; Batches You Teach *</label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Students from these specific batches will be permitted to review you.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddOffering}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} />
                <span>Add Course</span>
              </button>
            </div>

            {offerings.map((offering, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  background: 'var(--bg-card-subtle)',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Course Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. UCS503"
                      value={offering.courseCode}
                      onChange={(e) => handleOfferingChange(idx, 'courseCode', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Course Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Software Engg"
                      value={offering.courseName}
                      onChange={(e) => handleOfferingChange(idx, 'courseName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Batch Group</label>
                    <select
                      className="form-input"
                      value={offering.batchTaught}
                      onChange={(e) => handleOfferingChange(idx, 'batchTaught', e.target.value)}
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
                      <option value="ALL">ALL (Entire Branch)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Branch</label>
                    <select
                      className="form-input"
                      value={offering.branchTaught}
                      onChange={(e) => handleOfferingChange(idx, 'branchTaught', e.target.value)}
                    >
                      <option value="COE">COE</option>
                      <option value="CSE">CSE</option>
                      <option value="COPC">COPC</option>
                      <option value="ENC">ENC</option>
                      <option value="ECE">ECE</option>
                      <option value="EE">EE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                      <option value="CHE">CHE</option>
                      <option value="BT">BT</option>
                      <option value="ALL">ALL</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Academic Year</label>
                    <select
                      className="form-input"
                      value={offering.academicYear}
                      onChange={(e) => handleOfferingChange(idx, 'academicYear', e.target.value)}
                    >
                      {ALLOWED_ACADEMIC_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  {offerings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOffering(idx)}
                      className="btn btn-subtle btn-sm"
                      style={{ color: 'var(--primary)', padding: '10px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px' }}
          >
            {loading ? "Saving Faculty Profile..." : "Complete Setup & View Teacher Portal"}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Already completed setup on another account?{' '}
            <button
              type="button"
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: '13px'
              }}
            >
              Sign out &amp; Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
