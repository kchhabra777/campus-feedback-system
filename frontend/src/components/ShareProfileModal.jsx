import React, { useState } from 'react';
import { 
  X, Copy, Check, Share2, ExternalLink, MessageCircle, Globe, Send, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export const ShareProfileModal = ({ teacher, isOpen, onClose }) => {
  if (!isOpen || !teacher) return null;

  const [copied, setCopied] = useState(false);

  const teacherId = teacher.id || teacher.userId || teacher.user?.id;
  const shareUrl = `${window.location.origin}/teacher/${encodeURIComponent(teacherId)}`;
  const teacherName = teacher.fullName || 'Faculty Member';
  const teacherDept = teacher.department || 'TIET';

  const shareText = `Check out authentic student reviews and ratings for Prof. ${teacherName} (${teacherDept}) on RateProf:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!', {
        description: 'You can now paste and share it in your batch WhatsApp group or Reddit.'
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${teacherName} - RateProf Reviews`,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`RateProf: Student Reviews & Insights for ${teacherName} (${teacherDept})`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  const initials = teacherName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(180deg, #18181b 0%, #111113 100%)',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient color glow line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '24px',
          right: '24px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.8) 35%, rgba(168, 85, 247, 0.7) 70%, transparent 100%)',
          zIndex: 20
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#a1a1aa',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#a1a1aa';
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.35))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
            }}>
              <Share2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fafafa', letterSpacing: '-0.02em' }}>
                Share Professor Profile
              </h3>
              <span style={{ fontSize: '12.5px', color: '#a1a1aa', marginTop: '2px', display: 'block' }}>
                Share authentic ratings & reviews with batchmates
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Teacher Summary Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {initials || 'TP'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {teacherName}
              </div>
              <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                {teacher.designation || 'Faculty'} • {teacherDept}
              </div>
            </div>
          </div>

          {/* Copy Link Field */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>
              Public Profile Link
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  padding: '8px 12px',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: copied ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: copied ? '#4ade80' : '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: copied ? 'none' : '0 2px 10px rgba(37, 99, 235, 0.3)'
                }}
              >
                {copied ? (
                  <>
                    <Check size={15} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Share Platforms */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px', display: 'block' }}>
              Quick Share Channels
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(37, 211, 102, 0.08)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  color: '#4ade80',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 211, 102, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 211, 102, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.25)';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#25D366',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MessageCircle size={18} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>WhatsApp</div>
                  <div style={{ fontSize: '11px', color: '#86efac' }}>Batch & Lab Groups</div>
                </div>
              </a>

              {/* Reddit */}
              <a
                href={redditUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 69, 0, 0.08)',
                  border: '1px solid rgba(255, 69, 0, 0.25)',
                  color: '#fb923c',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 69, 0, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(255, 69, 0, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 69, 0, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 69, 0, 0.25)';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#FF4500',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Globe size={18} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>Reddit</div>
                  <div style={{ fontSize: '11px', color: '#fdba74' }}>r/ThaparUniversity</div>
                </div>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  color: '#38bdf8',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.25)';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#0ea5e9',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Send size={16} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>Telegram</div>
                  <div style={{ fontSize: '11px', color: '#7dd3fc' }}>Channels & chats</div>
                </div>
              </a>

              {/* Native Device Share */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    color: '#c084fc',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.16)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#a855f7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Share2 size={16} />
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>More Options</div>
                    <div style={{ fontSize: '11px', color: '#d8b4fe' }}>System share sheet</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11.5px',
            color: '#71717a',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
            <span>Sharing authentic reviews helps classmates make informed elective choices and encourages faculty accountability.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShareProfileModal;
