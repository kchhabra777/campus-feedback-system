import React from 'react';
import { StarRating } from './StarRating';
import { Award, BookOpen, Clock, TrendingUp, ChevronRight, Edit3 } from 'lucide-react';
import { TiltCard } from './ui/tilt-card';

export const TeacherCard = ({ teacher, ratings, onViewReviews, onWriteReview, canReview = false }) => {
  const rObj = ratings?.rating || ratings || {};
  const overallRating = Number(rObj.overallRating) || 0;
  const recentRating = Number(rObj.recentRating) || 0;
  const totalReviews = Number(rObj.totalReviews) || 0;

  return (
    <TiltCard 
      className="card" 
      tiltLimit={7} 
      scale={1.025} 
      spotlight={true} 
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {teacher.fullName}
          </h3>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <Award size={13} />
            <span>{teacher.designation || 'Faculty'} · {teacher.department}</span>
          </div>
        </div>
      </div>

      {/* Two-Tier Ratings Badge Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0', padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={11} />
            <span>Overall (Time-Decay)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: overallRating > 0 ? 'var(--star-gold)' : 'var(--text-muted)' }}>
              {overallRating > 0 ? overallRating.toFixed(1) : 'N/A'}
            </span>
            {overallRating > 0 && <StarRating rating={overallRating} size={14} />}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={11} />
            <span>Current Rating</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: recentRating > 0 ? '#2563eb' : 'var(--text-muted)' }}>
              {recentRating > 0 ? recentRating.toFixed(1) : 'N/A'}
            </span>
            {recentRating > 0 && <StarRating rating={recentRating} size={14} />}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Based on {totalReviews} {totalReviews === 1 ? 'student review' : 'student reviews'}
      </div>

      {/* Courses & Batches Taught */}
      <div style={{ flex: 1, marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <BookOpen size={12} />
          <span>Courses Taught:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {teacher.courses && teacher.courses.length > 0 ? (
            teacher.courses.map((c, i) => (
              <span key={i} className="badge badge-neutral" style={{ fontSize: '11.5px' }}>
                {c.courseCode} ({c.batchTaught} - {c.ltp || 'L'})
              </span>
            ))
          ) : teacher.offerings && teacher.offerings.length > 0 ? (
            teacher.offerings.map((c, i) => (
              <span key={i} className="badge badge-neutral" style={{ fontSize: '11.5px' }}>
                {c.courseCode} ({c.batchTaught} - {c.ltp || 'L'})
              </span>
            ))
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No courses registered yet</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', position: 'relative', zIndex: 20 }}>
        <button
          onClick={() => onViewReviews(teacher)}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
        >
          <span>View Reviews</span>
          <ChevronRight size={14} />
        </button>

        {canReview && (
          <button
            onClick={() => onWriteReview(teacher)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <Edit3 size={14} />
            <span>Write Review</span>
          </button>
        )}
      </div>
    </TiltCard>
  );
};
