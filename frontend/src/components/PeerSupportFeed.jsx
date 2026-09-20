import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'sonner';
import { Heart, MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PeerSupportFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State for expanded comments
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.getSupportPosts();
      setPosts(data.posts || []);
    } catch (error) {
      toast.error('Failed to load support posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    
    setSubmitting(true);
    try {
      await api.createSupportPost({
        content: newPostContent,
        isAnonymous
      });
      setNewPostContent('');
      fetchPosts();
      toast.success('Your post has been shared.');
    } catch (error) {
      toast.error(error.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      // Optimistic update
      setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
      await api.upvoteSupportPost(postId);
    } catch (error) {
      // Revert on failure
      fetchPosts();
      toast.error('Failed to upvote');
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentContent = commentInputs[postId];
    if (!commentContent || !commentContent.trim()) return;

    try {
      await api.addSupportComment(postId, {
        content: commentContent,
        isAnonymous
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
      toast.success('Reply added');
    } catch (error) {
      toast.error(error.message || 'Failed to add reply');
    }
  };

  const renderAuthor = (postOrComment) => {
    if (postOrComment.isAnonymous) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={12} color="#fff" />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Anonymous Student</span>
        </span>
      );
    }
    
    const p = postOrComment.author?.studentProfile || postOrComment.author?.teacherProfile;
    if (p) {
      return (
        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
          {p.fullName} {p.batch ? `(${p.batch})` : ''}
        </span>
      );
    }
    return 'Unknown User';
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart color="var(--primary)" fill="var(--primary-subtle)" />
          Peer Support Network
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          A safe space to discuss academic stress, share advice, and support your batchmates.
        </p>
      </div>

      {/* Create Post Area */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <form onSubmit={handleCreatePost}>
          <textarea
            className="form-textarea"
            placeholder="Share what's on your mind... Are you feeling stressed about exams, need advice, or just want to vent?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            style={{ minHeight: '80px', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Post Anonymously
            </label>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={submitting || !newPostContent.trim()}
            >
              <Send size={14} />
              <span>Share</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading support posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No one has posted yet. Be the first to start a conversation.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <div key={post.id} className="card" style={{ padding: '16px' }}>
              
              {/* Post Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                {renderAuthor(post)}
                <span style={{ color: 'var(--text-muted)' }}>{formatDate(post.createdAt)}</span>
              </div>
              
              {/* Post Content */}
              <div style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--text-primary)', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <button 
                  onClick={() => handleUpvote(post.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  <Heart size={16} color={post.upvotes > 0 ? "var(--primary)" : "currentColor"} fill={post.upvotes > 0 ? "var(--primary)" : "none"} />
                  {post.upvotes > 0 ? post.upvotes : 'Support'}
                </button>
                <button 
                  onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  <MessageCircle size={16} />
                  {post.comments?.length || 0} Replies
                </button>
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <div style={{ marginTop: '16px', paddingLeft: '16px', borderLeft: '2px solid var(--border-light)' }}>
                  {post.comments && post.comments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {post.comments.map(comment => (
                        <div key={comment.id} style={{ background: 'var(--bg-card-subtle)', padding: '10px 12px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                            {renderAuthor(comment)}
                            <span style={{ color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                          </div>
                          <div style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
                            {comment.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      No replies yet.
                    </div>
                  )}
                  
                  {/* Add Reply */}
                  <form onSubmit={(e) => handleAddComment(e, post.id)} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Write a supportive reply..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                    />
                    <button type="submit" className="btn btn-secondary btn-sm" disabled={!commentInputs[post.id]?.trim()}>
                      Reply
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
