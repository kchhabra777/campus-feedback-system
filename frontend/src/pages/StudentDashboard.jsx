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
import { Sparkles } from 'lucide-react';
import { TeacherAIInsights } from '../components/TeacherAIInsights';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

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
  const [selectedTeacherTags, setSelectedTeacherTags] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSort, setReviewSort] = useState('recent');
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);

  // Write review modal
  const [reviewingTeacher, setReviewingTeacher] = useState(null);

  const studentBatch = user?.studentProfile?.batch || user?.detectedBatch || '3Q11';
  const rawBranch = user?.studentProfile?.branch || 'COE';
  const branchMatch = rawBranch.match(/\(([^)]+)\)/);
  const studentBranch = branchMatch ? branchMatch[1] : rawBranch;
  const studentRollNo = user?.studentProfile?.rollNumber || '';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch eligible teachers
      const eligibleRes = await api.getEligibleTeachers(studentBatch, studentBranch).catch(() => ({ teachers: [] }));
      setEligibleTeachers(eligibleRes.teachers || []);

      // 2. Fetch all teachers
      const allRes = await api.getAllTeachers().catch(() => ({ teachers: [] }));
      
      const allT = allRes.teachers || [];
      const ratMap = {};
      
      const limitedT = allT.slice(0, 15);
      await Promise.all(limitedT.map(async (t) => {
        const id = t.userId || t.user?.id || t.id;
        try {
          const r = await api.getTeacherRatings(id);
          ratMap[id] = r.rating || { overallRating: 0, recentRating: 0, totalReviews: 0 };
        } catch {
          ratMap[id] = { overallRating: 0, recentRating: 0, totalReviews: 0 };
        }
      }));
      setTeacherRatingsMap(ratMap);
      setAllTeachers(allT);
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
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
      const [reviewsRes, ratingRes, tagsRes] = await Promise.all([
        api.getTeacherReviews(teacherId),
        api.getTeacherRatings(teacherId).catch(() => null),
        api.getTeacherTagStats(teacherId).catch(() => null)
      ]);
      const rObj = ratingRes?.rating || ratingRes || {};
      const reviewsList = reviewsRes.reviews || [];
      setSelectedTeacherReviews(reviewsList);
      setSelectedTeacherTags(tagsRes || null);
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

  const sortedReviews = [...selectedTeacherReviews].sort((a, b) => {
    if (reviewSort === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      const aHelpful = (a.upvotes || 0) - (a.downvotes || 0);
      const bHelpful = (b.upvotes || 0) - (b.downvotes || 0);
      if (bHelpful !== aHelpful) return bHelpful - aHelpful;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setReviewingTeacher(selectedTeacher)}
                  className="btn btn-primary"
                >
                  <MessageSquarePlus size={16} />
                  <span>Write Feedback Review</span>
                </button>
                <button 
                  onClick={() => setIsAIInsightsOpen(true)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 16px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    color: 'white', fontWeight: 600, border: 'none',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={18} />
                  Generate AI Insights
                </button>
              </div>
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

          {/* Community Tags */}
          <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Community Tags</h3>
            {selectedTeacherTags && selectedTeacherTags.sufficientData && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                Based on {selectedTeacherTags.totalReviewsWithTags} reviews
              </p>
            )}
            
            {!selectedTeacherTags ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading tag statistics...</div>
            ) : !selectedTeacherTags.sufficientData ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', marginTop: '12px' }}>
                {selectedTeacherTags.needed} more reviews needed to unlock insights for this teacher.
              </div>
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={selectedTeacherTags.stats}
                    margin={{ top: 10, right: 40, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.7}/>
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      width={170}
                      tick={{ fill: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                      contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-light)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      formatter={(val) => [`${val}%`, 'Frequency']}
                    />
                    <Bar 
                      dataKey="percentage" 
                      radius={[4, 4, 4, 4]} 
                      barSize={16} 
                      background={{ fill: 'rgba(255,255,255,0.04)', radius: [4, 4, 4, 4] }}
                      label={{ position: 'right', fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, formatter: (val) => `${val}%` }}
                    >
                      {selectedTeacherTags.stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Transparent Student Reviews ({selectedTeacherReviews.length})
            </h3>
            {selectedTeacherReviews.length > 0 && (
              <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                {['recent', 'helpful'].map(mode => (
                  <button 
                    key={mode} 
                    onClick={() => setReviewSort(mode)} 
                    style={{ 
                      padding: '8px 20px', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      border: 'none', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s', 
                      background: reviewSort === mode ? 'var(--primary)' : 'transparent', 
                      color: reviewSort === mode ? '#fff' : 'var(--text-secondary)' 
                    }}
                  >
                    {mode === 'recent' ? 'Most Recent' : 'Highest Liked'}
                  </button>
                ))}
              </div>
            )}
          </div>

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
            sortedReviews.map((rev) => (
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

      
      {isAIInsightsOpen && selectedTeacher && (
        <TeacherAIInsights 
          teacherId={selectedTeacher.userId || selectedTeacher.id || selectedTeacher.user?.id}
          teacherName={selectedTeacher.fullName || selectedTeacher.name}
          onClose={() => setIsAIInsightsOpen(false)}
        />
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
