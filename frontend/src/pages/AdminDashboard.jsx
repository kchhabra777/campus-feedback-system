import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Tag, Sparkles } from 'lucide-react';
import { TeacherAIInsights } from '../components/TeacherAIInsights';
import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { ReviewCard } from '../components/ReviewCard';
import {
  Activity, TrendingDown, ArrowLeft, Download,
  Users, MessageSquare, Star, ChevronRight, Search, AlertTriangle,
  UserPlus, UserX, Edit2, Trash2, CheckCircle2, ShieldBan
} from 'lucide-react';

/* ── tiny helpers ── */
const getRatingColor = (r) => {
  if (r === 0) return '#71717a';
  if (r < 2.5) return '#ef4444';
  if (r < 3.5) return '#f97316';
  if (r < 4.2) return '#eab308';
  return '#22c55e';
};

const RatingBar = ({ value, max = 5 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: 'var(--border-light)', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${(value / max) * 100}%`,
        background: getRatingColor(value),
        borderRadius: '99px',
        transition: 'width 0.6s ease'
      }} />
    </div>
    <span style={{ fontSize: '12px', fontWeight: 700, color: getRatingColor(value), minWidth: '28px' }}>
      {value > 0 ? value.toFixed(1) : '—'}
    </span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{
        width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
        background: accent + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={18} color={accent} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('faculty'); // faculty, students, register

  // Data
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dossier State
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const [teacherReviews, setTeacherReviews] = useState([]);
  const [teacherRatings, setTeacherRatings] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedTeacherTags, setSelectedTeacherTags] = useState(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    batchTaught: '3Q11',
    branchTaught: 'COE',
    academicYear: '2026-2027',
    ltp: 'L'
  });
  const [reviewSort, setReviewSort] = useState('recent');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Moderation
  
  const [flags, setFlags] = useState([]);
  const [communityTags, setCommunityTags] = useState([]);
  const [tagForm, setTagForm] = useState({ name: '', type: 'POSITIVE', opposite: '' });
  const [editingTagId, setEditingTagId] = useState(null);

  const loadTags = async () => {
    try {
      const res = await api.getAdminTags();
      setCommunityTags(res.tags || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'tags') loadTags();
  }, [activeTab]);

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTagId) {
        await api.updateAdminTag(editingTagId, tagForm);
      } else {
        await api.addAdminTag(tagForm);
      }
      setTagForm({ name: '', type: 'POSITIVE', opposite: '' });
      setEditingTagId(null);
      loadTags();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTag = (tag) => {
    setEditingTagId(tag.id);
    setTagForm({ name: tag.name, type: tag.type, opposite: tag.opposite || '' });
  };

  const handleDeleteTag = async (id) => {
    if(!window.confirm("Delete this tag?")) return;
    try {
      await api.deleteAdminTag(id);
      loadTags();
    } catch (e) {
      console.error(e);
    }
  };

  const [flagsLoading, setFlagsLoading] = useState(false);

  // Stats
  const [totalReviews, setTotalReviews] = useState(0);
  const [campusAvg, setCampusAvg] = useState(0);

  // Register Teacher Form
  const [regForm, setRegForm] = useState({ fullName: '', email: '', department: '', designation: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState(null);

  // Delete Confirmation Modal
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resTeachers, resStudents] = await Promise.all([
        api.getAllTeachers().catch(() => ({ teachers: [] })),
        api.getStudents().catch(() => ({ students: [] }))
      ]);

      const tList = resTeachers.teachers || [];
      setStudents(resStudents.students || []);

      const ratings = {};
      let totalR = 0, totalSum = 0, ratedCount = 0;

      for (const t of tList) {
        const id = t.userId || t.user?.id || t.id;
        try {
          const r = await api.getTeacherRatings(id);
          ratings[id] = r;
          if (r.totalReviews > 0) { totalR += r.totalReviews; totalSum += r.overallRating; ratedCount++; }
        } catch { ratings[id] = { overallRating: 0, recentRating: 0, totalReviews: 0 }; }
      }

      tList.sort((a, b) => {
        const idA = a.userId || a.user?.id || a.id;
        const idB = b.userId || b.user?.id || b.id;
        const rA = ratings[idA]?.overallRating || 0, rB = ratings[idB]?.overallRating || 0;
        const nA = ratings[idA]?.totalReviews || 0, nB = ratings[idB]?.totalReviews || 0;
        if (nA === 0 && nB > 0) return 1;
        if (nB === 0 && nA > 0) return -1;
        return rA - rB;
      });

      setTeachers(tList);
      setRatingsMap(ratings);
      setTotalReviews(totalR);
      setCampusAvg(ratedCount > 0 ? (totalSum / ratedCount).toFixed(2) : '—');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlags = async (silent = false) => {
    if (!silent) setFlagsLoading(true);
    try {
      const res = await api.getFlags();
      setFlags(res.flags || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setFlagsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'moderation') loadFlags();
  }, [activeTab]);

  const openDossier = async (teacher, isSilentRefresh = false) => {
    setSelectedTeacher(teacher);
    if (!isSilentRefresh) setReviewLoading(true);
    const id = teacher.userId || teacher.user?.id || teacher.id;
    try {
      const [rRes, ratRes, courseRes, tagsRes] = await Promise.all([
        api.getTeacherReviews(id),
        api.getTeacherRatings(id).catch(() => null),
        api.getAdminTeacherCourses(id).catch(() => ({ courses: [] })),
        api.getTeacherTagStats(id).catch(() => ({ stats: [], totalReviewsWithTags: 0 }))
      ]);
      setTeacherReviews(rRes.reviews || []);
      setTeacherRatings(ratRes || { overallRating: 0, recentRating: 0, totalReviews: 0 });
      setTeacherCourses(courseRes.courses || []);
      setSelectedTeacherTags(tagsRes);
    } finally {
      if (!isSilentRefresh) setReviewLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    try {
      const id = selectedTeacher.userId || selectedTeacher.user?.id || selectedTeacher.id;
      const res = await api.addAdminTeacherCourse(id, newCourse);
      setTeacherCourses(prev => [...prev, res.course]);
      setAddingCourse(false);
      setNewCourse({ courseCode: '', courseName: '', batchTaught: '3Q11', branchTaught: 'COE', academicYear: '2026-2027' });
    } catch (err) {
      alert("Failed to add course: " + err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course allocation?")) return;
    
    const previousCourses = [...teacherCourses];
    setTeacherCourses(prev => prev.filter(c => c.id !== courseId)); // Optimistic UI update
    
    try {
      await api.deleteAdminTeacherCourse(courseId);
    } catch (err) {
      setTeacherCourses(previousCourses); // Rollback on failure
      alert("Failed to delete course: " + err.message);
    }
  };

  const handleResolveFlag = async (flagId, action) => {
    if (action === 'delete_review' && !window.confirm("Are you sure you want to completely delete this review?")) return;
    
    const previousFlags = [...flags];
    setFlags(prev => prev.filter(f => f.flagId !== flagId)); // Optimistic UI update

    try {
      await api.resolveFlag(flagId, action);
    } catch (err) {
      setFlags(previousFlags); // Rollback on failure
      alert("Failed to resolve flag: " + err.message);
    }
  };

  const exportCsv = () => {
    if (!selectedTeacher || !teacherReviews.length) return;
    const hdr = ['Date', 'Rating', 'Reviewer', 'Roll No', 'Batch', 'Course', 'Review', 'Upvotes', 'Downvotes'];
    const rows = teacherReviews.map(r => [
      new Date(r.createdAt).toLocaleDateString(),
      r.rating,
      r.reviewerName || 'Anonymous',
      r.reviewerRollNo || 'N/A',
      r.reviewerBatch || 'N/A',
      r.courseCode || 'N/A',
      `"${(r.reviewText || '').replace(/"/g, '""')}"`,
      r.upvotes || 0,
      r.downvotes || 0
    ]);
    const csv = [hdr.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${selectedTeacher.fullName}_Reviews.csv`;
    a.click();
  };

  const handleBanToggle = async (userId, currentStatus) => {
    try {
      await api.banUser(userId, !currentStatus);
      setStudents(prev => prev.map(s => s.id === userId ? { ...s, isBanned: !currentStatus } : s));
    } catch (err) {
      alert("Failed to update ban status");
    }
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      const teacherId = teacherToDelete.userId || teacherToDelete.id;
      await api.deleteTeacher(teacherId);
      setTeachers(prev => prev.filter(t => (t.userId || t.id) !== teacherId));
      setTeacherToDelete(null);
    } catch (err) {
      alert("Failed to delete teacher");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegMessage(null);
    try {
      await api.adminRegisterTeacher(regForm);
      setRegMessage({ type: 'success', text: "Teacher registered successfully! They can now log in via email to set their password." });
      setRegForm({ fullName: '', email: '', department: '', designation: '' });
      loadData(); // refresh list
    } catch (err) {
      setRegMessage({ type: 'error', text: err.message || "Failed to register teacher" });
    } finally {
      setRegLoading(false);
    }
  };

  const sortedReviews = [...teacherReviews].sort((a, b) => {
    if (reviewSort === 'helpful') {
      const diff = ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
      if (diff !== 0) return diff;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredTeachers = teachers.filter(t =>
    !searchQuery ||
    t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    !searchQuery ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentProfile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentProfile?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const atRisk = teachers.filter(t => {
    const id = t.userId || t.user?.id || t.id;
    const r = ratingsMap[id];
    return r?.totalReviews > 0 && r?.overallRating < 3;
  }).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading campus data…</span>
      </div>
    );
  }

  return (
    <div className="admin-layout fade-in">
      {/* ── Sidebar Navigation ── */}
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '24px', paddingLeft: '14px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Admin Panel</h2>
        </div>
        
        <button className={`admin-nav-item ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => { setActiveTab('faculty'); setSelectedTeacher(null); setSearchQuery(''); }}>
          <Users size={18} />
          Faculty Leaderboard
        </button>
        
        <button className={`admin-nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => { setActiveTab('students'); setSelectedTeacher(null); setSearchQuery(''); }}>
          <Activity size={18} />
          Manage Students
        </button>
        
        <button className={`admin-nav-item ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setSelectedTeacher(null); }}>
          <UserPlus size={18} />
          Register Teacher
        </button>


        <button className={`admin-nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => { setActiveTab('moderation'); setSelectedTeacher(null); }}>
          <ShieldBan size={18} />
          Moderation
        </button>

        <button className={`admin-nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => { setActiveTab('tags'); setSelectedTeacher(null); }}>
          <Activity size={18} />
          Community Tags
        </button>
      </aside>


      {/* ── Main Content Area ── */}
      <main className="admin-main">
        {/* ── Page Header ── */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            {activeTab === 'faculty' && "Faculty Leaderboard"}
            {activeTab === 'students' && "Manage Students"}
            {activeTab === 'register' && "Register New Teacher"}
            {activeTab === 'moderation' && "Moderation Queue"}
            {activeTab === 'tags' && "Community Tags"}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {activeTab === 'faculty' && "View ratings, reviews, and remove faculty accounts."}
            {activeTab === 'students' && "Search and ban/unban student accounts."}
            {activeTab === 'register' && "Create an account for a faculty member. They will set their password via email OTP."}
            {activeTab === 'moderation' && "Review and resolve flagged content reported by students."}
            {activeTab === 'tags' && "Manage positive and constructive community tags."}
          </p>
        </div>

        {/* ── Faculty Tab ── */}
        {activeTab === 'faculty' && !selectedTeacher && (
          <div className="fade-in">
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <StatCard icon={Users}         label="Total Faculty"     value={teachers.length}  sub="Registered this semester"   accent="#3b82f6" />
              <StatCard icon={MessageSquare} label="Reviews Submitted" value={totalReviews}      sub="Campus-wide student feedback" accent="#8b5cf6" />
              <StatCard icon={Star}          label="Campus Avg Rating" value={campusAvg}          sub="Across all rated faculty"    accent="#f59e0b" />
              <StatCard icon={AlertTriangle} label="Needs Attention"   value={atRisk}             sub="Faculty below 3.0 rating"   accent="#ef4444" />
            </div>

            {/* Search */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '280px', fontSize: '14px', height: '40px' }}
                  placeholder="Search faculty or dept…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', padding: '12px 20px', background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', gap: '16px' }}>
                <span>Faculty Member</span>
                <span>Overall Rating</span>
                <span>Reviews</span>
                <span>Actions</span>
                <span></span>
              </div>

              {filteredTeachers.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>No matching faculty found.</div>
              ) : (
                filteredTeachers.map((teacher, idx) => {
                  const id = teacher.userId || teacher.user?.id || teacher.id;
                  const r = ratingsMap[id] || { overallRating: 0, totalReviews: 0 };
                  const needsAttention = r.totalReviews > 0 && r.overallRating < 3;

                  return (
                    <div key={id}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', padding: '16px 20px', borderBottom: idx < filteredTeachers.length - 1 ? '1px solid var(--border-light)' : 'none', alignItems: 'center', gap: '16px', transition: 'background 0.12s', cursor: 'pointer', background: needsAttention ? 'rgba(239,68,68,0.04)' : 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = needsAttention ? 'rgba(239,68,68,0.08)' : 'var(--bg-card-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = needsAttention ? 'rgba(239,68,68,0.04)' : 'transparent'}
                      onClick={() => openDossier(teacher)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {needsAttention && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} title="Needs attention" />}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{teacher.fullName}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{teacher.department}</div>
                        </div>
                      </div>
                      <div><RatingBar value={r.overallRating} /></div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: r.totalReviews === 0 ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {r.totalReviews === 0 ? '—' : `${r.totalReviews} reviews`}
                      </div>
                      <div>
                        <button className="btn btn-subtle btn-sm" style={{ color: '#ef4444', padding: '6px 10px' }} onClick={(e) => { e.stopPropagation(); setTeacherToDelete(teacher); }} title="Remove Teacher">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Dossier View (Inside Faculty Tab) ── */}
        {activeTab === 'faculty' && selectedTeacher && (
          <div className="fade-in">
            <button className="btn btn-subtle btn-sm" style={{ marginBottom: '24px', paddingLeft: '0' }} onClick={() => { setSelectedTeacher(null); setTeacherReviews([]); }}>
              <ArrowLeft size={16} /> Back to Leaderboard
            </button>

            <div className="card" style={{ marginBottom: '24px', padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>{selectedTeacher.fullName}</h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{selectedTeacher.designation} · {selectedTeacher.department}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setIsAIInsightsOpen(true)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', 
                      padding: '8px 16px', borderRadius: '6px',
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      color: 'white', fontWeight: 600, border: 'none',
                      boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <Sparkles size={16} />
                    Generate AI Insights
                  </button>
                  <button onClick={exportCsv} className="btn btn-secondary btn-sm" style={{ display: 'flex', gap: '6px' }}><Download size={14} /> Export CSV</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '28px' }}>
                {[
                  { label: 'Overall Rating', value: teacherRatings?.overallRating || 0 },
                  { label: 'Recent Rating (180d)', value: teacherRatings?.recentRating || 0 },
                  { label: 'Total Reviews', value: teacherRatings?.totalReviews || 0, noBar: true }
                ].map(({ label, value, noBar }) => (
                  <div key={label} className="stat-box">
                    <div className="stat-label">{label}</div>
                    {noBar ? <div className="stat-value" style={{ fontSize: '28px' }}>{value}</div> : (
                      <>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: getRatingColor(value), marginBottom: '10px' }}>{value > 0 ? value.toFixed(2) : '—'}</div>
                        <RatingBar value={value} />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: '24px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Course Allocations</h3>
                {!addingCourse && (
                  <button onClick={() => setAddingCourse(true)} className="btn btn-primary btn-sm">
                    + Add Course
                  </button>
                )}
              </div>

              {addingCourse && (
                <form onSubmit={handleAddCourse} style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-default)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <input type="text" className="form-input" placeholder="Course Code" value={newCourse.courseCode} onChange={e => setNewCourse({ ...newCourse, courseCode: e.target.value })} required />
                    <input type="text" className="form-input" placeholder="Course Name" value={newCourse.courseName} onChange={e => setNewCourse({ ...newCourse, courseName: e.target.value })} required />
                    <select className="form-input" value={newCourse.ltp} onChange={e => setNewCourse({ ...newCourse, ltp: e.target.value })}>
                      <option value="L">Lecture (L)</option>
                      <option value="T">Tutorial (T)</option>
                      <option value="P">Practical (P)</option>
                    </select>
                    <input type="text" className="form-input" placeholder="Batch" value={newCourse.batchTaught} onChange={e => setNewCourse({ ...newCourse, batchTaught: e.target.value })} required />
                    <input type="text" className="form-input" placeholder="Branch" value={newCourse.branchTaught} onChange={e => setNewCourse({ ...newCourse, branchTaught: e.target.value })} required />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setAddingCourse(false)} className="btn btn-secondary btn-sm">Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm">Save Allocation</button>
                  </div>
                </form>
              )}

              {teacherCourses.length === 0 && !addingCourse ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>No courses allocated to this teacher yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {teacherCourses.map(course => (
                    <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-default)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{course.courseCode} - {course.courseName} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({course.ltp || 'L'})</span></div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Batch: {course.batchTaught} • Branch: {course.branchTaught} • Year: {course.academicYear}</div>
                      </div>
                      <button onClick={() => handleDeleteCourse(course.id)} className="btn btn-subtle btn-sm" style={{ color: '#ef4444' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          <div className="card" style={{ marginBottom: '24px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Community Tags</h3>
            {selectedTeacherTags && selectedTeacherTags.sufficientData && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Official Review Records ({sortedReviews.length})</h3>
              <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                {['recent', 'helpful'].map(mode => (
                  <button key={mode} onClick={() => setReviewSort(mode)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: reviewSort === mode ? 'var(--primary)' : 'transparent', color: reviewSort === mode ? '#fff' : 'var(--text-secondary)' }}>
                    {mode === 'recent' ? 'Most Recent' : 'Highest Liked'}
                  </button>
                ))}
              </div>
            </div>

            {reviewLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading reviews…</div>
            ) : sortedReviews.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No reviews submitted yet.</div>
            ) : (
              sortedReviews.map(rev => <ReviewCard key={rev.reviewId} review={rev} onUpdate={() => openDossier(selectedTeacher, true)} />)
            )}
          </div>
        )}

        {/* ── Students Tab ── */}
        {activeTab === 'students' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: '36px', width: '300px', height: '40px' }} placeholder="Search name, roll no, or email…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="badge" style={{ fontSize: '14px' }}><Users size={16}/> {students.length} Students</div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', padding: '12px 20px', background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', gap: '16px' }}>
                <span>Student</span>
                <span>Roll Number</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {filteredStudents.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</div>
              ) : (
                filteredStudents.map((student, idx) => (
                  <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', padding: '16px 20px', borderBottom: idx < filteredStudents.length - 1 ? '1px solid var(--border-light)' : 'none', alignItems: 'center', gap: '16px', background: student.isBanned ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{student.studentProfile?.fullName || 'Incomplete Profile'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{student.email}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{student.studentProfile?.rollNumber || '—'}</div>
                    <div>
                      {student.isBanned ? (
                        <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}><ShieldBan size={12}/> Suspended</span>
                      ) : (
                        <span className="badge" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}><CheckCircle2 size={12}/> Active</span>
                      )}
                    </div>
                    <div>
                      <button className="btn btn-secondary btn-sm" style={{ minWidth: '100px', borderColor: student.isBanned ? '#bbf7d0' : '#fecaca', color: student.isBanned ? '#166534' : '#b91c1c' }} onClick={() => handleBanToggle(student.id, student.isBanned)}>
                        {student.isBanned ? 'Unban User' : 'Ban User'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Register Teacher Tab ── */}
        {activeTab === 'register' && (
          <div className="fade-in">
            <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Teacher Details</h2>
              
              {regMessage && (
                <div className={regMessage.type === 'error' ? 'alert-error' : 'alert-success'} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
                  {regMessage.text}
                </div>
              )}

              <form onSubmit={handleRegisterTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input required className="form-input" value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} placeholder="Dr. John Doe" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Official Thapar Email</label>
                  <input required type="email" className="form-input" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="bv.raghav@thapar.edu" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Department</label>
                  <select required className="form-select" value={regForm.department} onChange={e => setRegForm({...regForm, department: e.target.value})}>
                    <option value="">Select Department</option>
                    <option value="Computer Science and Engineering">CSED</option>
                    <option value="Mechanical Engineering">MED</option>
                    <option value="Electrical and Instrumentation">EIED</option>
                    <option value="Civil Engineering">CED</option>
                    <option value="Mathematics">SOM</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Designation</label>
                  <select required className="form-select" value={regForm.designation} onChange={e => setRegForm({...regForm, designation: e.target.value})}>
                    <option value="">Select Designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={regLoading} style={{ marginTop: '8px', padding: '12px' }}>
                  {regLoading ? 'Registering...' : 'Register Teacher Account'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Moderation Tab ── */}
        {activeTab === 'moderation' && (
          <div className="fade-in">
            {flagsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading flags…</div>
            ) : flags.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 12px', color: '#10b981' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>All Clear!</h3>
                <p>No reported reviews to moderate.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {flags.map(flag => (
                  <div key={flag.flagId} className="card" style={{ padding: '24px', borderLeft: flag.status === 'PENDING' ? '4px solid #ef4444' : '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: flag.status === 'PENDING' ? '#fef2f2' : '#ecfdf5', color: flag.status === 'PENDING' ? '#ef4444' : '#10b981', fontSize: '12px', fontWeight: 700, borderRadius: 'var(--radius-full)', marginBottom: '12px' }}>
                          <AlertTriangle size={14} style={{ marginRight: '6px' }} />
                          {flag.status}
                        </div>
                        
                        <div style={{ marginBottom: '16px', background: 'var(--bg-default)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Reported Content</div>
                          {flag.review ? (
                            <>
                              <div style={{ fontSize: '14px', marginBottom: '8px' }}>"{flag.review.reviewText}"</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Posted by: {flag.review.reviewerName} • Course: {flag.review.courseCode || 'N/A'} • {new Date(flag.review.createdAt).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Review has been deleted.</div>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Reporter Details</div>
                          <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                            <span style={{ fontWeight: 600 }}>{flag.reporterDetails?.name || flag.reporterId}</span> 
                            {flag.reporterDetails?.rollNo && ` (${flag.reporterDetails.rollNo})`}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Reason: <span style={{ fontWeight: 500 }}>{flag.reason}</span>
                          </div>
                        </div>
                      </div>

                      {flag.status === 'PENDING' && flag.review && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
                          <button onClick={() => handleResolveFlag(flag.flagId, 'dismiss')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            Dismiss (Keep Review)
                          </button>
                          <button onClick={() => handleResolveFlag(flag.flagId, 'delete_review')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                            <Trash2 size={16} style={{ marginRight: '6px' }} /> Delete Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      
        {activeTab === 'tags' && (
          <div className="admin-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Manage Tags</h3>
              
              <form onSubmit={handleTagSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Tag Name</label>
                  <input className="form-input" required value={tagForm.name} onChange={e => setTagForm({...tagForm, name: e.target.value})} placeholder="e.g. Clear Explanations" />
                </div>
                <div style={{ width: '150px' }}>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={tagForm.type} onChange={e => setTagForm({...tagForm, type: e.target.value})}>
                    <option value="POSITIVE">Positive</option>
                    <option value="CONSTRUCTIVE">Constructive</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Opposite (Optional)</label>
                  <input className="form-input" value={tagForm.opposite} onChange={e => setTagForm({...tagForm, opposite: e.target.value})} placeholder="e.g. Confusing Lectures" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 20px' }}>
                  {editingTagId ? 'Update Tag' : 'Add Tag'}
                </button>
                {editingTagId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingTagId(null); setTagForm({ name: '', type: 'POSITIVE', opposite: '' }); }} style={{ height: '42px', padding: '0 20px' }}>Cancel</button>
                )}
              </form>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tag Name</th>
                      <th>Type</th>
                      <th>Opposite</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communityTags.map(tag => (
                      <tr key={tag.id}>
                        <td style={{ fontWeight: 500 }}>{tag.name}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                            background: tag.type === 'POSITIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: tag.type === 'POSITIVE' ? '#22c55e' : '#ef4444'
                          }}>
                            {tag.type}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{tag.opposite || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleEditTag(tag)} style={{ color: 'var(--text-secondary)', marginRight: '16px' }} title="Edit"><Edit2 size={16}/></button>
                          <button onClick={() => handleDeleteTag(tag.id)} style={{ color: '#ef4444' }} title="Delete"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                    {communityTags.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No tags found. Add some!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>


      {/* ── Custom Delete Confirmation Modal ── */}
      {teacherToDelete && (
        <div className="modal-backdrop" onClick={() => setTeacherToDelete(null)}>
          <div className="modal-content fade-in" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Remove Faculty</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to completely remove <strong>{teacherToDelete.fullName}</strong> and all their data? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setTeacherToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                onClick={confirmDeleteTeacher}
                disabled={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Yes, Remove Faculty'}
              </button>
            </div>
          </div>
        </div>
      )}
    
      {isAIInsightsOpen && selectedTeacher && (
        <TeacherAIInsights 
          teacherId={selectedTeacher.userId || selectedTeacher.id || selectedTeacher.user?.id}
          teacherName={selectedTeacher.fullName || selectedTeacher.name}
          onClose={() => setIsAIInsightsOpen(false)}
        />
      )}

      
</div>
  );
};
