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
  Info,
  Crown,
  ExternalLink,
  Share2
} from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { updatePageSEO, buildTeacherSchema } from '../utils/seo';
import { SuggestTeacherModal } from '../components/SuggestTeacherModal';
import { TeacherAIInsights } from '../components/TeacherAIInsights';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import CloudLoader from '../components/ui/quantum-cloud-loader';
import { Marquee } from '../components/ui/marquee';
import { TAG_THEMES } from '../lib/tagTheme';
import BorderBeam from '../components/ui/border-beam';
import AnimatedTabs from '../components/ui/animated-tabs';
import NumberTicker from '../components/ui/number-ticker';
import CommandMenu from '../components/ui/command-menu';


export const StudentDashboard = () => {
  const { user, onboardStudent } = useAuth();
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
  const [isCmdMenuOpen, setIsCmdMenuOpen] = useState(false);

  // Write review modal
  const [reviewingTeacher, setReviewingTeacher] = useState(null);

  // Suggest teacher name modal
  const [suggestTeacher, setSuggestTeacher] = useState(null);
  const [suggestionToast, setSuggestionToast] = useState(null);

  // Change batch modal
  const studentBatch = user?.studentProfile?.batch || user?.detectedBatch || '3Q11';
  const rawBranch = user?.studentProfile?.branch || 'COE';
  const branchMatch = rawBranch.match(/\(([^)]+)\)/);
  const studentBranch = branchMatch ? branchMatch[1] : rawBranch;
  const studentRollNo = user?.studentProfile?.rollNumber || '';

  const isStudentCR = Boolean(user?.studentProfile?.isCR);
  const unverifiedBatchFaculty = eligibleTeachers.filter(t => 
    Boolean(
      t.fullName?.startsWith("Teacher (") ||
      t.code === t.fullName ||
      /^[A-Z0-9]{2,5}$/.test(t.fullName?.trim() || '')
    )
  );

  const [isChangeBatchOpen, setIsChangeBatchOpen] = useState(false);
  const [newBatchInput, setNewBatchInput] = useState(studentBatch);
  const [newBranchInput, setNewBranchInput] = useState(studentBranch);
  const [updatingBatch, setUpdatingBatch] = useState(false);
  const [batchUpdateMsg, setBatchUpdateMsg] = useState('');

  const handleUpdateBatchSubmit = async (e) => {
    e.preventDefault();
    if (!newBatchInput) return;
    setUpdatingBatch(true);
    try {
      await onboardStudent({
        fullName: user?.studentProfile?.fullName || '',
        rollNumber: studentRollNo,
        branch: newBranchInput,
        batch: newBatchInput,
        yearOfStudy: user?.studentProfile?.yearOfStudy || (newBatchInput.startsWith('4') ? 4 : newBatchInput.startsWith('3') ? 3 : newBatchInput.startsWith('2') ? 2 : 1)
      });
      setBatchUpdateMsg('✨ Batch successfully updated! Refreshing teachers...');
      setTimeout(() => {
        setIsChangeBatchOpen(false);
        setBatchUpdateMsg('');
        fetchDashboardData();
      }, 700);
    } catch (err) {
      alert(err.message || 'Failed to update batch');
    } finally {
      setUpdatingBatch(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch eligible teachers
      const eligibleRes = await api.getEligibleTeachers(studentBatch, studentBranch).catch(() => ({ teachers: [] }));
      setEligibleTeachers(eligibleRes.teachers || []);

      // 2. Fetch all teachers and ratings summary in parallel
      const [allRes, summaryRes] = await Promise.all([
        api.getAllTeachers().catch(() => ({ teachers: [] })),
        api.getRatingsSummary().catch(() => null)
      ]);
      
      const allT = allRes.teachers || [];
      if (summaryRes?.ratings) {
        setTeacherRatingsMap(summaryRes.ratings);
      } else {
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
      }
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

  // Global Command+K / Ctrl+K shortcut for quick search & actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      const newRatings = {
        overallRating: Number(rObj.overallRating) || 0,
        recentRating: Number(rObj.recentRating) || 0,
        totalReviews: Number(rObj.totalReviews) || reviewsList.length
      };
      setSelectedTeacherRatings(newRatings);

      // Dynamically update SEO and Rich Results Schema
      updatePageSEO({
        title: `${teacher.fullName} Reviews, Ratings & Courses | RateProf`,
        description: `Read verified student feedback, ratings, and course allocations for ${teacher.fullName} (${teacher.department}) at Thapar University.`,
        url: `https://www.rateprof.tech/teacher/${encodeURIComponent(teacher.id || teacher.userId)}`,
        schema: buildTeacherSchema(teacher, newRatings)
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
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Batch <strong>{studentBatch}</strong> • Branch <strong>{studentBranch}</strong> • Year <strong>{user?.studentProfile?.yearOfStudy || 1}</strong></span>
              <button
                onClick={() => {
                  setNewBatchInput(studentBatch);
                  setNewBranchInput(studentBranch);
                  setBatchUpdateMsg('');
                  setIsChangeBatchOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '11.5px', height: '24px' }}
                title="Change batch if your tutorial/lab was reshuffled"
              >
                Change Batch
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-neutral" style={{ padding: '8px 14px', fontSize: '13px' }}>
              <NumberTicker value={eligibleTeachers.length} decimalPlaces={0} /> Eligible Teachers Taught You
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <img
                  src={
                    selectedTeacher.avatarUrl ||
                    (selectedTeacher.fullName?.toLowerCase().includes('anjula') || selectedTeacher.code?.toUpperCase() === 'AMH'
                      ? '/anjula-mehto.png'
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeacher.fullName || selectedTeacher.code || 'Faculty')}&background=2563eb&color=fff&bold=true`)
                  }
                  alt={selectedTeacher.fullName}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-light)' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeacher.fullName || selectedTeacher.code || 'Faculty')}&background=2563eb&color=fff&bold=true`;
                  }}
                />
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span>{selectedTeacher.fullName}</span>
                    {selectedTeacher.code && !selectedTeacher.fullName.includes(selectedTeacher.code) && (
                      <span className="badge badge-neutral" style={{ fontSize: '12px', padding: '2px 8px' }}>
                        {selectedTeacher.code}
                      </span>
                    )}
                  </h2>
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

                  {/* Special Academic & Research Details for Dr. Anjula Mehto */}
                  {(selectedTeacher.fullName?.toLowerCase().includes('anjula') || selectedTeacher.code?.toUpperCase() === 'AMH') && (
                    <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)', maxWidth: '750px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Specialization: <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Wireless Sensor Networks (WSNs), Internet of Things (IoT), Machine Learning</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <strong>Education:</strong> Ph.D. (ABV-IIITM Gwalior, 2021) • M.Tech (MANIT Bhopal) • B.E. (UIT-RGPV Bhopal)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <a 
                          href="mailto:anjula.mehto@thapar.edu" 
                          className="badge badge-neutral"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11.5px', color: 'var(--primary)' }}
                        >
                          ✉️ anjula.mehto@thapar.edu
                        </a>
                        <a 
                          href="https://scholar.google.com/citations?user=kAS_U9YAAAAJ&hl=en&oi=ao" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="badge badge-neutral"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11.5px', color: '#2563eb' }}
                        >
                          <ExternalLink size={12} /> Google Scholar (h-index / Citations)
                        </a>
                        <a 
                          href="https://www.linkedin.com/in/dr-anjula-mehto-29b64396/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="badge badge-neutral"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11.5px', color: '#0077b5' }}
                        >
                          <ExternalLink size={12} /> LinkedIn Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const publicUrl = `${window.location.origin}/teacher/${encodeURIComponent(selectedTeacher.id || selectedTeacher.userId)}`;
                    navigator.clipboard.writeText(publicUrl);
                    alert(`Public Profile Link copied to clipboard!\n${publicUrl}\nYou can share this in your batch WhatsApp group or Reddit.`);
                  }}
                  className="btn btn-secondary"
                  title="Copy shareable link for batch WhatsApp groups & Reddit"
                >
                  <Share2 size={16} />
                  <span>Share Profile</span>
                </button>
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
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '9px 18px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #18122B 0%, #2D033B 100%)',
                    color: 'white', fontWeight: 600, border: '1px solid rgba(168, 85, 247, 0.4)',
                    boxShadow: '0 4px 18px rgba(168, 85, 247, 0.25)',
                    cursor: 'pointer'
                  }}
                >
                  <BorderBeam size={80} duration={6} borderWidth={1.5} colorFrom="#ec4899" colorTo="#a855f7" />
                  <Sparkles size={18} style={{ position: 'relative', zIndex: 1, color: '#f472b6' }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>Generate AI Insights</span>
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
                    <NumberTicker value={selectedTeacherRatings?.overallRating || 0} decimalPlaces={2} />
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
                    <NumberTicker value={selectedTeacherRatings?.recentRating || 0} decimalPlaces={2} />
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
                  <NumberTicker value={selectedTeacherReviews.length} decimalPlaces={0} />
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
          {/* Live Campus Tags Marquee Ribbon */}
          <div style={{ marginBottom: '22px', padding: '10px 0', border: '1px solid var(--border-light)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <Marquee pauseOnHover={true} duration={26}>
              {Object.values(TAG_THEMES).map(theme => (
                <span 
                  key={theme.name} 
                  style={{ 
                    margin: '0 16px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: theme.color, 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    background: theme.bg, 
                    border: `1px solid ${theme.borderSubtle}`,
                    boxShadow: `0 0 8px ${theme.borderSubtle}`
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.border }} />
                  #{theme.name}
                </span>
              ))}
            </Marquee>
          </div>

          {/* CR Portal Banner if student is CR */}
          {isStudentCR && (
            <div className="card" style={{
              marginBottom: '20px',
              padding: '18px 22px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: '#fef3c7', color: '#b45309',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Crown size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Batch {studentBatch} Class Representative Portal
                  </h3>
                  <span className="badge badge-warning" style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                    CR Role Active
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 12px 0' }}>
                  {unverifiedBatchFaculty.length > 0
                    ? `You have ${unverifiedBatchFaculty.length} faculty teaching batch ${studentBatch} who currently only have timetable initials/codes. Verify their full names below so your batchmates can review them!`
                    : `Awesome job! All faculty teaching batch ${studentBatch} have verified names.`}
                </p>

                {unverifiedBatchFaculty.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {unverifiedBatchFaculty.map(t => (
                      <button
                        key={t.id || t.userId}
                        type="button"
                        onClick={() => setSuggestTeacher(t)}
                        className="btn btn-sm"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <span>Identify: <strong>{t.fullName}</strong></span>
                        <span style={{ color: '#d97706', fontSize: '11px' }}>→ Fill</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabs and Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <AnimatedTabs
              activeTab={tab}
              onChange={setTab}
              tabs={[
                {
                  id: 'eligible',
                  label: `Teachers Who Taught You (${eligibleTeachers.length})`,
                  icon: BookOpen
                },
                {
                  id: 'all',
                  label: `All Campus Faculty (${allTeachers.length})`,
                  icon: Users
                }
              ]}
            />

            {/* Quick Actions & Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsCmdMenuOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Search size={14} color="#a855f7" />
                <span>Quick Finder</span>
                <kbd style={{
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace'
                }}>
                  ⌘K
                </kbd>
              </button>

              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter teachers by name or dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <CloudLoader />
              <p style={{ marginTop: '12px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Loading faculty directory...
              </p>
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
                    onSuggestName={(t) => setSuggestTeacher(t)}
                    isCR={isStudentCR}
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

      {/* Global Command Menu & Spotlight Search */}
      <CommandMenu
        isOpen={isCmdMenuOpen}
        onClose={() => setIsCmdMenuOpen(false)}
        teachers={allTeachers}
        onSelectTeacher={(t) => {
          handleViewReviews(t);
        }}
      />

      {/* Change Batch & Section Modal */}
      {isChangeBatchOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              Update Batch / Section
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              If your tutorial or lab subgroup was reshuffled, or your branch changed, update it here. Your dashboard and eligible teachers will refresh immediately.
            </p>

            <form onSubmit={handleUpdateBatchSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Batch Group / Subgroup *</label>
                <input
                  type="text"
                  list="change-batch-list"
                  className="form-input"
                  placeholder="e.g. 3Q12, 3C11, 2C11, 1A11"
                  value={newBatchInput}
                  onChange={(e) => setNewBatchInput(e.target.value.toUpperCase().trim())}
                  required
                />
                <datalist id="change-batch-list">
                  <option value="3Q11" />
                  <option value="3Q12" />
                  <option value="3Q13" />
                  <option value="3C11" />
                  <option value="3C12" />
                  <option value="2Q11" />
                  <option value="2C11" />
                  <option value="1A11" />
                  <option value="1B11" />
                  <option value="4C11" />
                  <option value="4Q11" />
                </datalist>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Enter your official tutorial/lab sub-group (e.g. 3Q11, 3C11, 2C11, 1A11, 4C11).
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Engineering Branch *</label>
                <select
                  className="form-select"
                  value={newBranchInput}
                  onChange={(e) => setNewBranchInput(e.target.value)}
                  required
                >
                  <option value="COE">Computer Engineering (COE)</option>
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="COPC">Computer Science - Patiala (COPC)</option>
                  <option value="ENC">Electronics & Computer (ENC)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="ELE">Electrical Engineering (EE)</option>
                  <option value="MEC">Mechanical Engineering (ME)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                  <option value="CHE">Chemical Engineering (CHE)</option>
                  <option value="BT">Biotechnology (BT)</option>
                </select>
              </div>

              {batchUpdateMsg && (
                <div style={{ marginBottom: '14px', fontSize: '12.5px', color: '#10b981', fontWeight: 600 }}>
                  {batchUpdateMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={updatingBatch}
                  onClick={() => setIsChangeBatchOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingBatch}
                  className="btn btn-primary btn-sm"
                >
                  {updatingBatch ? 'Updating...' : 'Save & Refresh Teachers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suggest Teacher Name Modal */}
      {suggestTeacher && (
        <SuggestTeacherModal
          teacher={suggestTeacher}
          isOpen={Boolean(suggestTeacher)}
          onClose={() => setSuggestTeacher(null)}
          isCR={isStudentCR}
          studentBatch={studentBatch}
          onSuccess={(msg) => {
            setSuggestionToast(msg);
            setTimeout(() => setSuggestionToast(null), 6000);
          }}
        />
      )}

      {/* Suggestion Toast Notification */}
      {suggestionToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={18} />
          <span>{suggestionToast}</span>
          <button
            onClick={() => setSuggestionToast(null)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px', fontSize: '18px' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
