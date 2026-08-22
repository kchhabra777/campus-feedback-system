import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { ThumbsUp, ThumbsDown, MessageSquare, Flag, Send, User, Mail, Award } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ReviewCard = ({ review, onUpdate }) => {
  const { user } = useAuth();
  const isOwnReview = Boolean(
    user && (user.id === review.reviewerId || user.email === review.reviewerEmail)
  );
  const [replies, setReplies] = useState(review.replies || []);
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const initialUserVote = review.votes?.find((v) => v.userId === user?.id)?.voteType || null;
  const [upvotes, setUpvotes] = useState(review.upvotes || 0);
  const [downvotes, setDownvotes] = useState(review.downvotes || 0);
  const [hasVoted, setHasVoted] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);
  const [replyVoteState, setReplyVoteState] = useState({});
  const [isVotingReply, setIsVotingReply] = useState({});
  const [flagged, setFlagged] = useState(review.isFlagged || false);

  const handleVote = async (type) => {
    if (!user || user.role !== 'STUDENT' || isVoting) return;

    setIsVoting(true);
    try {
      const isUnvoting = hasVoted === type;
      const res = await api.voteReview(review.reviewId, type, user.id);
      
      setHasVoted(isUnvoting ? null : type);

      if (typeof res.upvotes === 'number' && typeof res.downvotes === 'number') {
        setUpvotes(res.upvotes);
        setDownvotes(res.downvotes);
      } else {
        if (isUnvoting) {
          if (type === 'UP') setUpvotes((prev) => Math.max(0, prev - 1));
          else setDownvotes((prev) => Math.max(0, prev - 1));
        } else {
          if (type === 'UP') {
            setUpvotes((prev) => prev + 1);
            if (hasVoted === 'DOWN') setDownvotes((prev) => Math.max(0, prev - 1));
          } else {
            setDownvotes((prev) => prev + 1);
            if (hasVoted === 'UP') setUpvotes((prev) => Math.max(0, prev - 1));
          }
        }
      }
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleVoteReply = async (replyId, type) => {
    if (!user || user.role !== 'STUDENT' || isVotingReply[replyId]) return;

    setIsVotingReply((prev) => ({ ...prev, [replyId]: true }));
    try {
      const currentVote = replyVoteState[replyId];
      const isUnvoting = currentVote === type;
      const res = await api.voteReply(replyId, type, user.id);
      
      setReplyVoteState((prev) => ({ ...prev, [replyId]: isUnvoting ? null : type }));

      setReplies((prev) =>
        prev.map((r) => {
          if (r.replyId === replyId) {
            if (typeof res.upvotes === 'number' && typeof res.downvotes === 'number') {
              return { ...r, upvotes: res.upvotes, downvotes: res.downvotes };
            }
            if (isUnvoting) {
              const newUp = type === 'UP' ? Math.max(0, (r.upvotes || 0) - 1) : (r.upvotes || 0);
              const newDown = type === 'DOWN' ? Math.max(0, (r.downvotes || 0) - 1) : (r.downvotes || 0);
              return { ...r, upvotes: newUp, downvotes: newDown };
            } else {
              const newUp = type === 'UP' ? (r.upvotes || 0) + 1 : (currentVote === 'UP' ? Math.max(0, (r.upvotes || 0) - 1) : (r.upvotes || 0));
              const newDown = type === 'DOWN' ? (r.downvotes || 0) + 1 : (currentVote === 'DOWN' ? Math.max(0, (r.downvotes || 0) - 1) : (r.downvotes || 0));
              return { ...r, upvotes: newUp, downvotes: newDown };
            }
          }
          return r;
        })
      );
    } catch (err) {
      console.error("Failed to vote on reply:", err);
    } finally {
      setIsVotingReply((prev) => ({ ...prev, [replyId]: false }));
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
      let authorName = "Student";
      let authorBadge = "Student";
      let authorRole = user.role;

      if (user.role === 'TEACHER') {
        authorName = user.teacherProfile?.fullName ? `${user.teacherProfile.fullName}` : 'Faculty Member';
        authorBadge = `${user.teacherProfile?.designation || 'Faculty'} (${user.teacherProfile?.department || 'Department'})`;
        authorRole = "TEACHER";
      } else {
        authorName = user.studentProfile?.fullName
          ? `${user.studentProfile.fullName} (${user.studentProfile.rollNumber || 'Student'})`
          : (user.studentProfile?.rollNumber || `Student (${user.studentProfile?.batch || 'BE'})`);
        authorBadge = `${user.studentProfile?.batch || 'BE'} Student`;
        authorRole = "STUDENT";
      }

      const res = await api.addReply(review.reviewId, {
        authorId: user.id,
        authorRole,
        authorName,
        authorBadge,
        replyText: newReply.trim()
      });

      setReplies((prev) => [...prev, { ...res.reply, upvotes: 0, downvotes: 0 }]);
      setNewReply('');
      if (onUpdate) onUpdate();
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
      {/* Header with Student Name, Roll No & Email */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Student Name & Roll Number */}
            <span className="badge badge-verified" style={{ fontSize: '13px', fontWeight: 700 }}>
              <User size={13} />
              {review.reviewerName ? `${review.reviewerName} (${review.reviewerRollNo || 'Verified'})` : `Roll No: ${review.reviewerRollNo || 'Verified Student'}`}
            </span>

            {/* Student Email */}
            {review.reviewerEmail && (
              <span className="badge badge-neutral" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                <Mail size={12} />
                {review.reviewerEmail}
              </span>
            )}

            {/* Batch */}
            {review.reviewerBatch && (
              <span className="badge badge-student">
                Batch {review.reviewerBatch}
              </span>
            )}

            {/* Branch */}
            {review.reviewerBranch && (
              <span className="badge badge-neutral">
                {review.reviewerBranch}
              </span>
            )}

            {/* Course Code & Name */}
            {review.courseCode && (
              <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                {review.courseCode} {review.courseName ? `• ${review.courseName}` : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
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
          {user?.role === 'STUDENT' && (
            <>
              <button
                type="button"
                onClick={() => handleVote('UP')}
                disabled={isVoting || isOwnReview}
                className="btn btn-subtle btn-sm"
                style={{
                  color: hasVoted === 'UP' ? 'var(--badge-verified-text)' : 'inherit',
                  fontWeight: hasVoted === 'UP' ? 700 : 500,
                  opacity: isOwnReview ? 0.6 : 1,
                  cursor: isOwnReview ? 'not-allowed' : isVoting ? 'default' : 'pointer'
                }}
                title={isOwnReview ? 'You cannot vote on your own review' : hasVoted === 'UP' ? 'Click again to remove your helpful vote' : 'Mark as helpful'}
              >
                <ThumbsUp size={14} />
                <span>Helpful ({upvotes})</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote('DOWN')}
                disabled={isVoting || isOwnReview}
                className="btn btn-subtle btn-sm"
                style={{
                  color: hasVoted === 'DOWN' ? 'var(--primary)' : 'inherit',
                  fontWeight: hasVoted === 'DOWN' ? 700 : 500,
                  opacity: isOwnReview ? 0.6 : 1,
                  cursor: isOwnReview ? 'not-allowed' : isVoting ? 'default' : 'pointer'
                }}
                title={isOwnReview ? 'You cannot vote on your own review' : hasVoted === 'DOWN' ? 'Click again to remove your downvote' : 'Mark as unhelpful'}
              >
                <ThumbsDown size={14} />
                <span>({downvotes})</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowReplies(!showReplies)}
            className="btn btn-subtle btn-sm"
          >
            <MessageSquare size={14} />
            <span>Discussion ({replies.length})</span>
          </button>
        </div>

        {user?.role === 'STUDENT' && (
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
        )}
      </div>

      {/* Threaded Discussion & Replies */}
      {showReplies && (
        <div className="review-replies-container">
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Transparent Discussion & Faculty Feedback ({replies.length})
          </h4>

          {replies.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
              No replies yet. Use this discussion thread to ask for constructive suggestions, share counter-opinions, or clarify questions.
            </p>
          ) : (
            replies.map((reply, idx) => {
              const isTeacherReply = reply.authorRole === 'TEACHER';
              return (
                <div
                  key={reply.replyId || idx}
                  className="reply-item"
                  style={isTeacherReply ? {
                    borderLeft: '3px solid var(--primary)',
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                    borderRadius: 'var(--radius-sm)'
                  } : {}}
                >
                  <div className="reply-meta">
                    <span style={isTeacherReply ? { fontWeight: 700, color: 'var(--primary)' } : { fontWeight: 600 }}>
                      {reply.authorName}
                    </span>
                    {reply.authorBadge && (
                      <span
                        className={`badge ${isTeacherReply ? 'badge-teacher' : 'badge-student'}`}
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        {isTeacherReply && <Award size={11} />}
                        {reply.authorBadge}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 'auto' }}>
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginBottom: '6px', fontSize: '13.5px', lineHeight: 1.5 }}>
                    {reply.replyText}
                  </div>

                  {/* Reply Upvote/Downvote Actions for Students */}
                  {user?.role === 'STUDENT' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleVoteReply(reply.replyId, 'UP')}
                        disabled={isVotingReply[reply.replyId]}
                        className="btn btn-subtle btn-sm"
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          color: replyVoteState[reply.replyId] === 'UP' ? 'var(--badge-verified-text)' : 'var(--text-secondary)',
                          fontWeight: replyVoteState[reply.replyId] === 'UP' ? 700 : 500,
                          cursor: isVotingReply[reply.replyId] ? 'default' : 'pointer'
                        }}
                        title={replyVoteState[reply.replyId] === 'UP' ? 'Click again to remove your upvote' : 'Upvote reply'}
                      >
                        <ThumbsUp size={11} />
                        <span>{reply.upvotes || 0}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVoteReply(reply.replyId, 'DOWN')}
                        disabled={isVotingReply[reply.replyId]}
                        className="btn btn-subtle btn-sm"
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          color: replyVoteState[reply.replyId] === 'DOWN' ? 'var(--primary)' : 'var(--text-secondary)',
                          fontWeight: replyVoteState[reply.replyId] === 'DOWN' ? 700 : 500,
                          cursor: isVotingReply[reply.replyId] ? 'default' : 'pointer'
                        }}
                        title={replyVoteState[reply.replyId] === 'DOWN' ? 'Click again to remove your downvote' : 'Downvote reply'}
                      >
                        <ThumbsDown size={11} />
                        <span>{reply.downvotes || 0}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Add Reply Form (Students and Teachers) */}
          {user ? (
            <form onSubmit={handleAddReply} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={
                  user.role === 'TEACHER'
                    ? "Reply to student (e.g. ask how you can improve lectures, clarify course pacing)..."
                    : "Share your perspective or counter-opinion..."
                }
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                style={{ fontSize: '13px', padding: '8px 12px' }}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !newReply.trim()}
                className="btn btn-primary btn-sm"
                style={{ minWidth: user.role === 'TEACHER' ? '140px' : '80px' }}
              >
                <Send size={13} />
                <span>{user.role === 'TEACHER' ? 'Reply as Faculty' : 'Reply'}</span>
              </button>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
};
