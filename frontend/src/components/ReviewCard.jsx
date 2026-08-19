import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { ThumbsUp, ThumbsDown, MessageSquare, Flag, Send, User, Mail } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ReviewCard = ({ review, onUpdate }) => {
  const { user } = useAuth();
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
    if (hasVoted === type) return; // Prevent multiple clicks for same vote

    setIsVoting(true);
    try {
      const res = await api.voteReview(review.reviewId, type, user.id);
      setHasVoted(type);
      if (typeof res.upvotes === 'number' && typeof res.downvotes === 'number') {
        setUpvotes(res.upvotes);
        setDownvotes(res.downvotes);
      } else {
        if (type === 'UP') {
          setUpvotes((prev) => prev + 1);
          if (hasVoted === 'DOWN') setDownvotes((prev) => Math.max(0, prev - 1));
        } else {
          setDownvotes((prev) => prev + 1);
          if (hasVoted === 'UP') setUpvotes((prev) => Math.max(0, prev - 1));
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
    if (replyVoteState[replyId] === type) return; // Prevent multiple clicks on same reply vote

    setIsVotingReply((prev) => ({ ...prev, [replyId]: true }));
    try {
      const res = await api.voteReply(replyId, type, user.id);
      setReplyVoteState((prev) => ({ ...prev, [replyId]: type }));

      setReplies((prev) =>
        prev.map((r) => {
          if (r.replyId === replyId) {
            const newUp = typeof res.upvotes === 'number' ? res.upvotes : (type === 'UP' ? (r.upvotes || 0) + 1 : (r.upvotes || 0));
            const newDown = typeof res.downvotes === 'number' ? res.downvotes : (type === 'DOWN' ? (r.downvotes || 0) + 1 : (r.downvotes || 0));
            return { ...r, upvotes: newUp, downvotes: newDown };
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
    if (user.role !== 'STUDENT') {
      alert("Only students are permitted to post replies or comments.");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const authorName = user.studentProfile?.fullName
        ? `${user.studentProfile.fullName} (${user.studentProfile.rollNumber || 'Student'})`
        : (user.studentProfile?.rollNumber || `Student (${user.studentProfile?.batch || 'BE'})`);

      const authorBadge = `${user.studentProfile?.batch || 'BE'} Student`;

      const res = await api.addReply(review.reviewId, {
        authorId: user.id,
        authorRole: "STUDENT",
        authorName,
        authorBadge,
        replyText: newReply.trim()
      });

      setReplies((prev) => [...prev, { ...res.reply, upvotes: 0, downvotes: 0 }]);
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
                disabled={isVoting || hasVoted === 'UP'}
                className="btn btn-subtle btn-sm"
                style={{
                  color: hasVoted === 'UP' ? 'var(--badge-verified-text)' : 'inherit',
                  fontWeight: hasVoted === 'UP' ? 700 : 500,
                  cursor: hasVoted === 'UP' ? 'default' : 'pointer'
                }}
              >
                <ThumbsUp size={14} />
                <span>Helpful ({upvotes})</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote('DOWN')}
                disabled={isVoting || hasVoted === 'DOWN'}
                className="btn btn-subtle btn-sm"
                style={{
                  color: hasVoted === 'DOWN' ? 'var(--primary)' : 'inherit',
                  fontWeight: hasVoted === 'DOWN' ? 700 : 500,
                  cursor: hasVoted === 'DOWN' ? 'default' : 'pointer'
                }}
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
            Student Discussion & Differing Perspectives ({replies.length})
          </h4>

          {replies.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
              No student replies yet. If you have a different perspective on this course/teacher, share it below.
            </p>
          ) : (
            replies.map((reply, idx) => (
              <div key={reply.replyId || idx} className="reply-item">
                <div className="reply-meta">
                  <span>{reply.authorName}</span>
                  {reply.authorBadge && (
                    <span className="badge badge-student" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {reply.authorBadge}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 'auto' }}>
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <div style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {reply.replyText}
                </div>

                {/* Reply Upvote/Downvote Actions for Students */}
                {user?.role === 'STUDENT' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleVoteReply(reply.replyId, 'UP')}
                      disabled={isVotingReply[reply.replyId] || replyVoteState[reply.replyId] === 'UP'}
                      className="btn btn-subtle btn-sm"
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        color: replyVoteState[reply.replyId] === 'UP' ? 'var(--badge-verified-text)' : 'var(--text-secondary)',
                        fontWeight: replyVoteState[reply.replyId] === 'UP' ? 700 : 500,
                        cursor: replyVoteState[reply.replyId] === 'UP' ? 'default' : 'pointer'
                      }}
                    >
                      <ThumbsUp size={11} />
                      <span>{reply.upvotes || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVoteReply(reply.replyId, 'DOWN')}
                      disabled={isVotingReply[reply.replyId] || replyVoteState[reply.replyId] === 'DOWN'}
                      className="btn btn-subtle btn-sm"
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        color: replyVoteState[reply.replyId] === 'DOWN' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: replyVoteState[reply.replyId] === 'DOWN' ? 700 : 500,
                        cursor: replyVoteState[reply.replyId] === 'DOWN' ? 'default' : 'pointer'
                      }}
                    >
                      <ThumbsDown size={11} />
                      <span>{reply.downvotes || 0}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add Reply Form (Students Only) */}
          {user?.role === 'STUDENT' ? (
            <form onSubmit={handleAddReply} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
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
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '8px' }}>
              Faculty members can view discussion threads in read-only mode.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
