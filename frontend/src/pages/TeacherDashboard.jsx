import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ALLOWED_BATCHES } from '../api/client';
import { ReviewCard } from '../components/ReviewCard';
import { StarRating } from '../components/StarRating';
import {
  Award,
  BookOpen,
  Plus,
  Clock,
  TrendingUp,
  MessageSquare,
  Users,
  AlertCircle,
  X
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add course offering modal
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [batchTaught, setBatchTaught] = useState('3Q11');
  const [branchTaught, setBranchTaught] = useState('COE');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [courseSaving, setCourseSaving] = useState(false);
  const [courseError, setCourseError] = useState('');

  const fetchTeacherData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ratingsData, reviewsData, offeringsData] = await Promise.all([
        api.getTeacherRatings(user.id).catch(() => null),
        api.getTeacherReviews(user.id).catch(() => ({ reviews: [] })),
        api.getMyOfferings().catch(() => ({ offerings: [] }))
      ]);

      const rObj = ratingsData?.rating || ratingsData || {};
      const revList = reviewsData.reviews || [];

      setRatings({
        overallRating: Number(rObj.overallRating) || 0,
        recentRating: Number(rObj.recentRating) || 0,
        totalReviews: Number(rObj.totalReviews) || revList.length
      });
      setReviews(revList);
      setOfferings(offeringsData.offerings || []);
    } catch (err) {
      console.error("Failed to load teacher data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [user]);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim() || !batchTaught.trim()) {
      setCourseError("Please fill out all required fields.");
      return;
    }

    setCourseSaving(true);
    setCourseError('');

    try {
      await api.addCourseOffering({
        courseCode: courseCode.trim().toUpperCase(),
        courseName: courseName.trim(),
        batchTaught: batchTaught.trim().toUpperCase(),
        branchTaught: branchTaught.trim().toUpperCase(),
        academicYear: academicYear.trim()
      });

      setShowAddCourse(false);
      setCourseCode('');
      setCourseName('');
      fetchTeacherData();
    } catch (err) {
      setCourseError(err.message || "Failed to add course offering");
    } finally {
      setCourseSaving(false);
    }
  };

  return (
    <div className="main-content">
      {/* Teacher Profile Banner */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
                {user?.teacherProfile?.fullName || 'Faculty Portal'}
              </h1>
              <span className="badge badge-teacher">
                {user?.teacherProfile?.designation || 'Faculty Member'}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {user?.teacherProfile?.department} • <strong>{user?.email}</strong>
            </div>
          </div>

          <button
            onClick={() => setShowAddCourse(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add Course / Batch Taught</span>
          </button>
        </div>

        {/* Analytics Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <div className="card" style={{ background: 'var(--bg-card-subtle)', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} />
              <span>Overall Time-Weighted Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--star-gold)' }}>
                {ratings?.overallRating > 0 ? ratings.overallRating.toFixed(2) : '0.00'}
              </span>
              <StarRating rating={ratings?.overallRating || 0} size={18} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Long-term pedagogical decay</span>
          </div>

          <div className="card" style={{ background: 'var(--bg-card-subtle)', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <TrendingUp size={13} />
              <span>Current Rating (Last 180 Days)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb' }}>
                {ratings?.recentRating > 0 ? ratings.recentRating.toFixed(2) : '0.00'}
              </span>
              <StarRating rating={ratings?.recentRating || 0} size={18} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recent semester evaluation</span>
          </div>

          <div className="card" style={{ background: 'var(--bg-card-subtle)', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MessageSquare size={13} />
              <span>Total Student Reviews</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
              {reviews.length}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified student reviews</span>
          </div>
        </div>
      </div>

      {/* Courses & Batches Taught Overview */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} />
          <span>Your Registered Courses & Batches ({offerings.length})</span>
        </h3>
        {offerings.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            No courses registered yet. Click "Add Course / Batch Taught" to allow students in your batches to find and review you.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {offerings.map((off, idx) => (
              <div
                key={off.id || idx}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-light)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px'
                }}
              >
                <strong>{off.courseCode}</strong>: {off.courseName}
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Batch {off.batchTaught} • {off.branchTaught} • {off.academicYear}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Reviews Feed (Read-Only) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
            Student Feedback & Reviews ({reviews.length})
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
            Read-Only Faculty View
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No student reviews received yet. As students from your registered batches submit feedback, their transparent reviews and roll numbers will appear here.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <ReviewCard
              key={rev.reviewId}
              review={rev}
              onUpdate={fetchTeacherData}
            />
          ))
        )}
      </div>

      {/* Add Course Offering Modal */}
      {showAddCourse && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Register Course / Batch</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Add a subject and student batch you currently teach or taught previously.
                </div>
              </div>
              <button onClick={() => setShowAddCourse(false)} className="btn btn-subtle btn-sm">
                <X size={18} />
              </button>
            </div>

            {courseError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{courseError}</span>
              </div>
            )}

            <form onSubmit={handleAddCourse}>
              <div className="form-group">
                <label className="form-label">Course Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UCS405"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Discrete Mathematics"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Batch Taught *</label>
                  <select
                    className="form-select"
                    value={batchTaught}
                    onChange={(e) => setBatchTaught(e.target.value)}
                    required
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

                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. COE or ALL"
                    value={branchTaught}
                    onChange={(e) => setBranchTaught(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2024-2025"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseSaving}
                  className="btn btn-primary"
                >
                  {courseSaving ? "Saving Course..." : "Register Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
