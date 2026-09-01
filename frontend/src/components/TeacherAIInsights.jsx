import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, BookOpen, Scale, Users, FileText, Activity, X } from 'lucide-react';
import RadialOrbitalTimeline from './ui/radial-orbital-timeline';
import { api } from '../api/client';

export const TeacherAIInsights = ({ teacherId, teacherName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    const fetchAISummary = async () => {
      try {
        setLoading(true);
        const data = await api.getTeacherAISummary(teacherId);
        
        if (!data || !data.summary) {
          throw new Error("Invalid response from AI");
        }

        const summary = data.summary;

        const formattedData = [
          {
            id: 1,
            title: "Teaching Quality",
            date: "AI Synthesis",
            content: summary.teaching || "No data available.",
            category: "Teaching",
            icon: FileText,
            relatedIds: [2, 5],
            status: "completed",
            energy: 100,
            glowColor: "#ec4899" // Pink
          },
          {
            id: 2,
            title: "Grading & Fairness",
            date: "AI Synthesis",
            content: summary.grading || "No data available.",
            category: "Grading",
            icon: Scale,
            relatedIds: [3],
            status: "completed",
            energy: 90,
            glowColor: "#06b6d4" // Cyan
          },
          {
            id: 3,
            title: "Approachability",
            date: "AI Synthesis",
            content: summary.approachability || "No data available.",
            category: "Support",
            icon: Users,
            relatedIds: [4],
            status: "completed",
            energy: 85,
            glowColor: "#f59e0b" // Amber
          },
          {
            id: 4,
            title: "Course Workload",
            date: "AI Synthesis",
            content: summary.workload || "No data available.",
            category: "Workload",
            icon: BookOpen,
            relatedIds: [5],
            status: "completed",
            energy: 70,
            glowColor: "#8b5cf6" // Purple
          },
          {
            id: 5,
            title: "Overall Vibe",
            date: "AI Synthesis",
            content: summary.overall || "No data available.",
            category: "Overall",
            icon: Activity,
            relatedIds: [1],
            status: "completed",
            energy: 95,
            glowColor: "#10b981" // Emerald
          }
        ];

        setTimelineData(formattedData);
      } catch (err) {
        console.error("Failed to load AI Insights", err);
        setError(err.message || "Failed to generate AI insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchAISummary();
  }, [teacherId]);

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(3, 7, 18, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
        fontFamily: 'inherit'
      }}
    >
      {/* Top Header */}
      <div 
        style={{
          position: 'absolute',
          top: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 100,
          pointerEvents: 'none',
          width: '90%',
          maxWidth: '650px'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={20} color="#c084fc" />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
            AI Synthesis: <span style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{teacherName}</span>
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
          Click any orbiting node to inspect AI-summarized insights across 5 core evaluation metrics.
        </p>
      </div>

      {/* Top Right Close Button */}
      <div style={{ position: 'absolute', top: '24px', right: '32px', zIndex: 100 }}>
        <button 
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <X size={15} />
          Close
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
          <Loader2 className="animate-spin" size={40} color="#c084fc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 6px 0', color: '#f8fafc' }}>Synthesizing Student Reviews...</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Gemini 3.5 is categorizing consensus patterns</p>
        </div>
      ) : error ? (
        <div 
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center',
            maxWidth: '420px',
            color: '#ffffff'
          }}
        >
          <h3 style={{ color: '#f87171', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>Synthesis Failed</h3>
          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 20px 0' }}>{error}</p>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      ) : (
        <RadialOrbitalTimeline timelineData={timelineData} />
      )}
    </div>
  , document.body);
};
