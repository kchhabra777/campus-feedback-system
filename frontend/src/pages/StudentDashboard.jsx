import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TeacherCard } from '../components/TeacherCard';
import { ReviewCard } from '../components/ReviewCard';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { StarRating } from '../components/StarRating';
import {
  Users,
  BookOpen,
  Award,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  TrendingUp,
  MessageSquarePlus,
  Info
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('eligible'); // 'eligible' | 'all'
  const [eligibleTeachers, setEligibleTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [teacherRatingsMap, setTeacherRatingsMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected teacher view (viewing reviews)
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedTeacherReviews, setSelectedTeacherReviews] = useState([]);
  const [selectedTeacherRatings, setSelectedTeacherRatings] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Write review modal
  const [reviewingTeacher, setReviewingTeacher] = useState(null);

  const studentBatch = user?.studentProfile?.batch || user?.detectedBatch || '3Q11';
  const studentBranch = user?.studentProfile?.branch || 'COE';
  const studentRollNo = user?.studentProfile?.rollNumber || '';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch eligible teachers
      const eligibleRes = await api.getEligibleTeachers(studentBatch, studentBranch).catch(() => ({ teachers: [] }));
      setEligibleTeachers(eligibleRes.teachers || []);

      // 2. Fetch all teachers
      const allRes = await api.getAllTeachers().catch(() => ({ teachers: [] }));
      setAllTeachers(allRes.teachers || []);

      // 3. Fetch ratings for each teacher
      const ratings = {};
      const teachersToQuery = [...(eligibleRes.teachers || []), ...(allRes.teachers || [])];
      for (const t of teachersToQuery) {
        const id = t.userId || t.user?.id || t.id;
        if (id && !ratings[id]) {
          try {
            const rData = await api.getTeacherRatings(id);
            const rObj = rData?.rating || rData || {};
            ratings[id] = {
              overallRating: Number(rObj.overallRating) || 0,
              recentRating: Number(rObj.recentRating) || 0,
              totalReviews: Number(rObj.totalReviews) || 0
            };
          } catch {
            ratings[id] = { overallRating: 0, recentRating: 0, totalReviews: 0 };
          }
        }
      }
      setTeacherRatingsMap(ratings);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, user?.studentProfile?.batch]);

  const handleViewReviews = async (teacher, isSilentRefresh = false) => {
    setSelectedTeacher(teacher);
    if (!isSilentRefresh) setReviewsLoading(true);
    const teacherId = teacher.userId || teacher.user?.id || teacher.id;
    try {
      const [reviewsRes, ratingRes] = await Promise.all([
        api.getTeacherReviews(teacherId),
        api.getTeacherRatings(teacherId).catch(() => null)
      ]);
      const rObj = ratingRes?.rating || ratingRes || {};
      const reviewsList = reviewsRes.reviews || [];
      setSelectedTeacherReviews(reviewsList);
      setSelectedTeacherRatings({
        overallRating: Number(rObj.overallRating) || 0,
        recentRating: Number(rObj.recentRating) || 0,
        totalReviews: Number(rObj.totalReviews) || reviewsList.length
      });
    } catch (err) {
      console.error("Fetch reviews error:", err);
    } finally {
      if (!isSilentRefresh) setReviewsLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchDashboardData();
    if (selectedTeacher) {
      handleViewReviews(selectedTeacher, true);
    }
  };

  const displayedTeachers = (tab === 'eligible' ? eligibleTeachers : allTeachers).filter((t) => {
    const name = t.fullName || '';
    const dept = t.department || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || dept.toLowerCase().includes(query);
  });

  return (
    <div className="main-content">
      {/* Student Welcome Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
                {user?.studentProfile?.fullName || 'Student Feedback Portal'}
              </h2>
              <span className="badge badge-verified">
                Roll: {studentRollNo}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Batch <strong>{studentBatch}</strong> • Branch <strong>{studentBranch}</strong> • Year <strong>{user?.studentProfile?.yearOfStudy || 1}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-neutral" style={{ padding: '8px 14px', fontSize: '13px' }}>
              {eligibleTeachers.length} Eligible Teachers Taught You
            </span>
          </div>
        </div>
      </div>

      {/* If viewing a specific teacher's reviews */}
      {selectedTeacher ? (
        <div>
          <button
            onClick={() => setSelectedTeacher(null)}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '16px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Teachers Directory</span>
          </button>

          {/* Teacher Profile Summary Banner */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{selectedTeacher.fullName}</h2>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {selectedTeacher.designation} • {selectedTeacher.department}
                </div>
                
                {/* Courses Tags */}
                {selectedTeacher.courses && selectedTeacher.courses.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedTeacher.courses.map((course, idx) => (
                      <span key={idx} className="badge badge-neutral" style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                        {course.courseCode} ({course.batchTaught})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setReviewingTeacher(selectedTeacher)}
                className="btn btn-primary"
              >
                <MessageSquarePlus size={16} />
                <span>Write Feedback Review</span>
              </button>
            </div>

            {/* Ratings Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <div className="card" style={{ background: 'var(--bg-card-subtle)', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={13} />
                  <span>Overall Time-Weighted Rating</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--star-gold)' }}>
                    {selectedTeacherRatings?.overallRating > 0 ? selectedTeacherRatings.overallRating.toFixed(2) : '0.00'}
                  </span>
                  <StarRating rating={selectedTeacherRatings?.overallRating || 0} size={18} />
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
                    {selectedTeacherRatings?.recentRating > 0 ? selectedTeacherRatings.recentRating.toFixed(2) : '0.00'}
                  </span>
                  <StarRating rating={selectedTeacherRatings?.recentRating || 0} size={18} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recent semester evaluation</span>
              </div>

              <div className="card" style={{ background: 'var(--bg-card-subtle)', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Student Reviews
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                  {selectedTeacherReviews.length}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified student evaluations</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
            Transparent Student Reviews ({selectedTeacherReviews.length})
          </h3>

          {reviewsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading reviews...
            </div>
          ) : selectedTeacherReviews.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
                No reviews posted for this teacher yet. Be the first student who was taught by this faculty member to share your experience!
              </p>
              <button
                onClick={() => setReviewingTeacher(selectedTeacher)}
                className="btn btn-primary btn-sm"
              >
                Write First Review
              </button>
            </div>
          ) : (
            selectedTeacherReviews.map((rev) => (
              <ReviewCard
                key={rev.reviewId}
                review={rev}
                onUpdate={handleReviewSubmitted}
              />
            ))
          )}
        </div>
      ) : (
        /* Teacher Catalog Grid */
        <div>
          {/* Tabs and Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTab('eligible')}
                className={`btn btn-sm ${tab === 'eligible' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <BookOpen size={14} />
                <span>Teachers Who Taught You ({eligibleTeachers.length})</span>
              </button>
              <button
                onClick={() => setTab('all')}
                className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Users size={14} />
                <span>All Campus Faculty ({allTeachers.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search teacher by name or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '13px' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Loading faculty directory...
            </div>
          ) : displayedTeachers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <Info size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>
                {tab === 'eligible'
                  ? `No faculty registered yet for batch ${studentBatch} (${studentBranch})`
                  : 'No faculty members match your search.'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                As teachers register and enter the courses/batches they teach, they will automatically appear here for you to review.
              </p>
            </div>
          ) : (
            <div className="grid-3">
              {displayedTeachers.map((teacher, idx) => {
                const id = teacher.userId || teacher.user?.id || teacher.id;
                const ratings = teacherRatingsMap[id] || { overallRating: 0, recentRating: 0, totalReviews: 0 };
                return (
                  <TeacherCard
                    key={id || idx}
                    teacher={teacher}
                    ratings={ratings}
                    onViewReviews={handleViewReviews}
                    onWriteReview={(t) => setReviewingTeacher(t)}
                    canReview={tab === 'eligible'}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewingTeacher && (
        <WriteReviewModal
          teacher={reviewingTeacher}
          onClose={() => setReviewingTeacher(null)}
          onSuccess={handleReviewSubmitted}
        />
      )}
    </div>
  );
};
