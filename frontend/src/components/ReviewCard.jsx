import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { ThumbsUp, ThumbsDown, MessageSquare, Flag, Send } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ReviewCard = ({ review, onUpdate }) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState(review.replies || []);
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [upvotes, setUpvotes] = useState(review.upvotes || 0);
  const [downvotes, setDownvotes] = useState(review.downvotes || 0);
  const [hasVoted, setHasVoted] = useState(null);
  const [flagged, setFlagged] = useState(review.isFlagged || false);

  const handleVote = async (type) => {
    if (!user) return;
    try {
      await api.voteReview(review.reviewId, type, user.id);
      if (type === 'UP') {
        setUpvotes((prev) => (hasVoted === 'UP' ? prev : prev + 1));
        if (hasVoted === 'DOWN') setDownvotes((prev) => Math.max(0, prev - 1));
      } else {
        setDownvotes((prev) => (hasVoted === 'DOWN' ? prev : prev + 1));
        if (hasVoted === 'UP') setUpvotes((prev) => Math.max(0, prev - 1));
      }
      setHasVoted(type);
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const handleFlag = async () => {
    if (!user || flagged) return;
    const reason = window.prompt("Please state the reason for reporting this review (e.g. offensive, spam):");
    if (!reason) return;
    try {
      await api.flagReview(review.reviewId, reason, user.id);
      setFlagged(true);
      alert("Review has been reported to administrators for moderation.");
    } catch (err) {
      console.error("Flag failed:", err);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || !user) return;
    setIsSubmittingReply(true);
    try {
      const authorName = user.role === 'STUDENT'
        ? (user.studentProfile?.rollNumber || `Student (${user.detectedBatch || 'BE'})`)
        : (user.teacherProfile?.fullName || 'Faculty Member');

      const authorBadge = user.role === 'STUDENT'
        ? `${user.studentProfile?.batch || user.detectedBatch || 'BE'} Student`
        : 'Faculty';

      const res = await api.addReply(review.reviewId, {
        authorId: user.id,
        authorRole: user.role,
        authorName,
        authorBadge,
        replyText: newReply.trim()
      });

      setReplies((prev) => [...prev, res.reply]);
      setNewReply('');
    } catch (err) {
      alert(err.message || "Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      {/* Header with Student Roll & Batch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-verified" style={{ fontSize: '13px' }}>
              Roll No: {review.reviewerRollNo || 'Verified Student'}
            </span>
            {review.reviewerBatch && (
              <span className="badge badge-student">
                Batch {review.reviewerBatch}
              </span>
            )}
            {review.reviewerBranch && (
              <span className="badge badge-neutral">
                {review.reviewerBranch}
              </span>
            )}
            {review.courseCode && (
              <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                {review.courseCode} {review.courseName ? `• ${review.courseName}` : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Reviewed on {formatDate(review.createdAt)}
          </div>
        </div>

        {/* Rating Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating rating={review.rating} size={18} />
          <span style={{ fontWeight: 800, fontSize: '15px' }}>{review.rating}.0</span>
        </div>
      </div>

      {/* Review Text */}
      <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
        {review.reviewText}
      </p>

      {/* Action Bar (Upvote, Downvote, Replies, Flag) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => handleVote('UP')}
            className="btn btn-subtle btn-sm"
            style={{
              color: hasVoted === 'UP' ? 'var(--badge-verified-text)' : 'inherit',
              fontWeight: hasVoted === 'UP' ? 700 : 500
            }}
          >
            <ThumbsUp size={14} />
            <span>Helpful ({upvotes})</span>
          </button>

          <button
            onClick={() => handleVote('DOWN')}
            className="btn btn-subtle btn-sm"
            style={{
              color: hasVoted === 'DOWN' ? 'var(--primary)' : 'inherit',
              fontWeight: hasVoted === 'DOWN' ? 700 : 500
            }}
          >
            <ThumbsDown size={14} />
            <span>({downvotes})</span>
          </button>

          <button
            onClick={() => setShowReplies(!showReplies)}
            className="btn btn-subtle btn-sm"
          >
            <MessageSquare size={14} />
            <span>Discussion ({replies.length})</span>
          </button>
        </div>

        <button
          onClick={handleFlag}
          disabled={flagged}
          className="btn btn-subtle btn-sm"
          style={{ color: flagged ? 'var(--text-muted)' : 'var(--text-secondary)' }}
          title="Report review for moderation"
        >
          <Flag size={13} />
          <span>{flagged ? 'Reported' : 'Report'}</span>
        </button>
      </div>

      {/* Threaded Discussion / Replies */}
      {showReplies && (
        <div className="review-replies-container">
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Campus Discussion & Differing Opinions ({replies.length})
          </h4>

          {replies.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
              No replies yet. Have a different opinion or experience? Share your view below.
            </p>
          ) : (
            replies.map((reply, idx) => (
              <div key={reply.replyId || idx} className="reply-item">
                <div className="reply-meta">
                  <span>{reply.authorName}</span>
                  {reply.authorBadge && (
                    <span className={`badge ${reply.authorRole === 'STUDENT' ? 'badge-student' : 'badge-teacher'}`} style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {reply.authorBadge}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 'auto' }}>
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <div style={{ color: 'var(--text-primary)' }}>
                  {reply.replyText}
                </div>
              </div>
            ))
          )}

          {/* Add Reply Form */}
          {user && (
            <form onSubmit={handleAddReply} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Share your perspective or counter-opinion..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !newReply.trim()}
                className="btn btn-primary btn-sm"
              >
                <Send size={13} />
                <span>Reply</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
