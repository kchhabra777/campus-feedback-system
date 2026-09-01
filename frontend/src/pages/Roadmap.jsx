"use client";
import React from 'react';
import { Tag, ListFilter, Sparkles } from "lucide-react";
import RadialOrbitalTimeline from "../components/ui/radial-orbital-timeline";
import { ArrowLeft } from 'lucide-react';

const timelineData = [
  {
    id: 1,
    title: "Tags + Bar Chart",
    date: "This Week",
    content: "Predefined student tags on reviews, aggregated into a percentage bar chart on each teacher's profile once they cross a 5-review threshold.",
    icon: Tag,
    status: "in-progress",
    relatedIds: [2],
    energy: 60,
  },
  {
    id: 2,
    title: "Curated Highlights",
    date: "Phase 2",
    content: "Top-5 most-helpful reviews shown by default, 'would take again %' headline stat, and a 'Based on N reviews' trust label next to the chart.",
    icon: ListFilter,
    status: "pending",
    relatedIds: [1, 3],
    energy: 20,
  },
  {
    id: 3,
    title: "AI + Trend Insights",
    date: "Phase 3",
    content: "Semester-over-semester rating trend, AI-generated one-line summaries, a 'similar teachers' recommender, and a teacher right-to-reply feature.",
    icon: Sparkles,
    status: "pending",
    relatedIds: [2],
    energy: 5,
  },
];

export function Roadmap({ onBack }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: 'black' }}>
      <button 
        onClick={onBack}
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          zIndex: 999, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'white',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} />
        Back to App
      </button>
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  );
}

export default Roadmap;
