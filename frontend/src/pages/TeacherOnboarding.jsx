import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_BATCHES, ALLOWED_ACADEMIC_YEARS } from '../api/client';
import { Award, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';

export const TeacherOnboarding = () => {
  const { user, onboardTeacher } = useAuth();
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: 'var(--bg-main)' }}>
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
            <label className="form-label">Full Name & Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dr. B. V. Raghav"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Department & Designation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="Computer Science and Engineering">Computer Science & Eng (CSED)</option>
                <option value="Electronics and Communication Engineering">Electronics & Comm (ECED)</option>
                <option value="Electrical and Instrumentation Engineering">Electrical & Inst (EIED)</option>
                <option value="Mechanical Engineering">Mechanical Eng (MED)</option>
                <option value="Civil Engineering">Civil Eng (CED)</option>
                <option value="Chemical Engineering">Chemical Eng (CHED)</option>
                <option value="Biotechnology">Biotechnology (BTD)</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Humanities & Social Sciences">Humanities (HSS)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <select
                className="form-select"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer / Visiting Faculty">Lecturer / Visiting Faculty</option>
              </select>
            </div>
          </div>

          {/* Course Offerings Section */}
          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} />
                <span>Courses & Batches Taught *</span>
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
                style={{
                  background: 'var(--bg-card-subtle)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '12px',
                  position: 'relative',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Course Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. UCS405"
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
                      placeholder="e.g. Discrete Mathematics"
                      value={offering.courseName}
                      onChange={(e) => handleOfferingChange(idx, 'courseName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Batch Taught</label>
                    <select
                      className="form-select"
                      value={offering.batchTaught}
                      onChange={(e) => handleOfferingChange(idx, 'batchTaught', e.target.value)}
                      required
                      style={{ fontSize: '12px' }}
                    >
                      <option value="ALL">ALL Batches</option>
                      <optgroup label="3rd Year (3Q Batches)">
                        {ALLOWED_BATCHES.filter(b => b.startsWith('3')).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </optgroup>
                      <optgroup label="2nd Year (2Q Batches)">
                        {ALLOWED_BATCHES.filter(b => b.startsWith('2')).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '12px' }}>Branch</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. COE or ALL"
                      value={offering.branchTaught}
                      onChange={(e) => handleOfferingChange(idx, 'branchTaught', e.target.value)}
                    />
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
      </div>
    </div>
  );
};
