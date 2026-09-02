import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getTagTheme } from '../lib/tagTheme';

export const WriteReviewModal = ({ teacher, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ESCAPE_TAG = "None of these fit";

  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await api.getPublicTags();
        setAvailableTags(res.tags || []);
      } catch (err) {
        console.error("Failed to load community tags");
      }
    };
    loadTags();
  }, []);

  const courses = teacher?.courses || teacher?.offerings || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTags.length === 0) {
      setError("Pick at least one tag, or 'None of these fit'.");
      return;
    }
    if (!reviewText.trim()) {
      setError("Please enter your detailed feedback text.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const courseObj = courses.find((c) => c.id === selectedCourseId || c.courseCode === selectedCourseId);
      
      const submittedCourseCode = courseObj?.courseCode || (courses[0]?.courseCode || null);
      let submittedCourseName = courseObj?.courseName || null;
      if (courseObj && courseObj.ltp) {
        submittedCourseName = `${courseObj.courseName} [${courseObj.ltp}]`;
      }

      await api.createReview({
        reviewer: {
          userId: user.id,
          name: user.studentProfile?.fullName || user.email?.split('@')[0],
          email: user.email,
          rollNumber: user.studentProfile?.rollNumber || '',
          batch: user.studentProfile?.batch || user.detectedBatch || '',
          branch: user.studentProfile?.branch || ''
        },
        reviewee: {
          userId: teacher.userId || teacher.user?.id || teacher.id
        },
        courseCode: submittedCourseCode,
        courseName: submittedCourseName,
        rating,
        tags: selectedTags,
        reviewText: reviewText.trim(),
        context: `Batch ${user.studentProfile?.batch || user.detectedBatch || '3Q11'} - ${user.studentProfile?.branch || 'Engineering'}`
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagClick = (tag) => {
    if (tag === ESCAPE_TAG) {
      if (selectedTags.includes(ESCAPE_TAG)) {
        setSelectedTags([]);
      } else {
        setSelectedTags([ESCAPE_TAG]);
      }
      return;
    }

    if (selectedTags.includes(ESCAPE_TAG)) {
      setSelectedTags([tag]);
      return;
    }

    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        setError("You can select up to 3 tags maximum.");
        return;
      }
      
      const tagObj = availableTags.find(t => t.name === tag);
      if (tagObj && tagObj.opposite && selectedTags.includes(tagObj.opposite)) {
        setError(`Cannot select '${tag}' because its opposite '${tagObj.opposite}' is already selected.`);
        return;
      }
      
      setError('');
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Write Honest Faculty Review</h2>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Feedback for <strong style={{ color: 'var(--text-primary)' }}>{teacher?.fullName}</strong> ({teacher?.department})
            </div>
          </div>
          <button onClick={onClose} className="btn btn-subtle btn-sm">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="alert alert-info" style={{ fontSize: '12.5px', marginBottom: '8px' }}>
          <CheckCircle size={16} />
          <span>
            <strong>Anonymity Guarantee:</strong> Your review will be posted anonymously. Your verified identity is securely hidden from students and faculty, and is only visible to college administrators.
          </span>
        </div>

        <div className="alert alert-info" style={{ fontSize: '12px', background: '#f8fafc', borderColor: '#e2e8f0', color: 'var(--text-secondary)' }}>
          <Clock size={15} style={{ color: 'var(--primary)' }} />
          <span>
            <strong>21-Day Cooldown Policy:</strong> You can submit one rating per faculty member every 21 days.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {courses.length > 0 && (
            <div className="form-group">
              <label className="form-label">Course Taught to You</label>
              <select
                className="form-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">Select Course...</option>
                {courses.map((c, i) => (
                  <option key={c.id || i} value={c.id || c.courseCode}>
                    {c.courseCode} - {c.courseName} (Batch {c.batchTaught}) {c.ltp ? `[${c.ltp}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Overall Rating (1 to 5 Stars)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0' }}>
              <StarRating rating={rating} size={28} interactive={true} onRatingChange={setRating} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {rating}.0 / 5.0
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Community Tags <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'normal' }}>(Select up to 3)</span></span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {availableTags.map(tagObj => {
                const tag = tagObj.name;
                const isSelected = selectedTags.includes(tag);
                const theme = getTagTheme(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      border: `1px solid ${isSelected ? theme.border : theme.borderSubtle}`,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                      backgroundColor: isSelected ? theme.activeBg : theme.bg,
                      color: theme.color,
                      boxShadow: isSelected ? theme.glow : 'none'
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex' }}>
              <button
                type="button"
                onClick={() => handleTagClick(ESCAPE_TAG)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: selectedTags.includes(ESCAPE_TAG) ? 600 : 400,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  backgroundColor: selectedTags.includes(ESCAPE_TAG) ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: selectedTags.includes(ESCAPE_TAG) ? '#f8fafc' : 'var(--text-muted)',
                  borderColor: selectedTags.includes(ESCAPE_TAG) ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-light)'
                }}
              >
                {ESCAPE_TAG}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Honest Review & Constructive Feedback</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the teacher's clarity, pace, grading fairness, accessibility for doubts, and how this course impacted your learning..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
