import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const WriteReviewModal = ({ teacher, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const courses = teacher?.courses || teacher?.offerings || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError("Please enter your detailed feedback text.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const courseObj = courses.find((c) => c.courseCode === selectedCourse);

      await api.createReview({
        reviewer: {
          userId: user.id,
          rollNumber: user.studentProfile?.rollNumber || '',
          batch: user.studentProfile?.batch || user.detectedBatch || '',
          branch: user.studentProfile?.branch || ''
        },
        reviewee: {
          userId: teacher.userId || teacher.user?.id || teacher.id
        },
        courseCode: selectedCourse || (courses[0]?.courseCode || null),
        courseName: courseObj?.courseName || null,
        rating,
        reviewText: reviewText.trim(),
        context: `Batch ${user.studentProfile?.batch || user.detectedBatch || 'BE'} - ${user.studentProfile?.branch || 'Engineering'}`
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
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

        <div className="alert alert-info" style={{ fontSize: '12.5px' }}>
          <CheckCircle size={16} />
          <span>
            <strong>Transparency Notice:</strong> Your verified roll number (<strong>{user?.studentProfile?.rollNumber}</strong>) and batch (<strong>{user?.studentProfile?.batch}</strong>) will be displayed with this review.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {courses.length > 0 && (
            <div className="form-group">
              <label className="form-label">Course Taught to You</label>
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select Course...</option>
                {courses.map((c, i) => (
                  <option key={i} value={c.courseCode}>
                    {c.courseCode} - {c.courseName} (Batch {c.batchTaught})
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
