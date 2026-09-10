import React, { useState } from 'react';
import { api } from '../api/client';
import { Sparkles, Crown, X, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export const SuggestTeacherModal = ({ teacher, isOpen, onClose, isCR = false, studentBatch = '', onSuccess }) => {
  if (!isOpen || !teacher) return null;

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState(teacher.department || 'CSED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const teacherCourses = teacher.courses || teacher.offerings || [];
  const teacherId = teacher.userId || teacher.user?.id || teacher.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter the professor's full name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.suggestTeacherName(teacherId, {
        suggestedName: fullName.trim(),
        suggestedDept: department.trim(),
        notes: notes.trim()
      });

      if (onSuccess) {
        onSuccess(res.message || "Thank you! Name submitted for verification.");
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit suggestion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }} onClick={onClose}>
      <div 
        className="card" 
        style={{
          width: '100%', maxWidth: '480px', padding: '28px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: isCR ? '#fef3c7' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isCR ? '#d97706' : '#2563eb'
          }}>
            {isCR ? <Crown size={20} /> : <Sparkles size={20} />}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              {isCR ? "CR Faculty Identification" : "Suggest Professor's Full Name"}
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Help campus peers identify their faculty
            </span>
          </div>
        </div>

        {/* CR Highlight Banner */}
        {isCR && (
          <div style={{
            margin: '14px 0', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', color: '#b45309'
          }}>
            <Crown size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Batch {studentBatch} CR:</strong> Your submission will be stamped with an official <strong>CR Verified</strong> badge for high-priority 1-click admin approval.
            </div>
          </div>
        )}

        {/* Context: Current Code & Course info */}
        <div style={{
          padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card-subtle)', margin: '14px 0',
          border: '1px solid var(--border-light)', fontSize: '13px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Name / Code:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{teacher.fullName}</strong>
          </div>
          {teacherCourses.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={12} /> Courses Taught:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {teacherCourses.map((c, i) => (
                  <span key={i} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                    {c.courseCode} ({c.batchTaught} - {c.ltp || 'L'})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Professor's Verified Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Rajesh Kumar Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Department
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CSED, ECED, MED"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Source / Verification Note (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Course coordinator, Announced in lecture, Syllabus sheet"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : isCR ? "Submit as CR" : "Submit Suggestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
