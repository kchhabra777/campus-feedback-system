"use client";
import React, { useState, useEffect, useRef } from "react";
import { Zap, Play, Pause, RotateCw } from "lucide-react";

export default function RadialOrbitalTimeline({
  timelineData,
}) {
  const [expandedItems, setExpandedItems] = useState({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef(null);

  // Check if any card is currently expanded
  const hasExpandedCard = Object.values(expandedItems).some(Boolean);

  // Smooth 60FPS continuous rotation
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Only rotate when autoRotate is on, not hovered over a card, and no card is expanded
      if (autoRotate && !hasExpandedCard && !isHovered) {
        setRotationAngle((prev) => (prev + 12 * delta) % 360); // 12 degrees per second
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [autoRotate, hasExpandedCard, isHovered]);

  const toggleItem = (itemId) => {
    setExpandedItems((prev) => {
      const isCurrentlyOpen = !!prev[itemId];
      if (isCurrentlyOpen) {
        return {};
      }
      return { [itemId]: true };
    });
  };

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 260; // Comfortable orbit radius
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    return { x, y, angle };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none'
      }}
      onClick={() => setExpandedItems({})}
    >
      {/* Background Ambient Radial Glow */}
      <div 
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Orbit Controls (Bottom Center) */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          borderRadius: '999px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          zIndex: 100
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: autoRotate ? '#c084fc' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          {autoRotate ? <Pause size={14} /> : <Play size={14} />}
          {autoRotate ? "Orbiting" : "Paused"}
        </button>
        <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
        <button
          onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px'
          }}
          title="Rotate 45 degrees"
        >
          <RotateCw size={13} />
          Step
        </button>
      </div>

      {/* Central Orbit Container */}
      <div style={{ position: 'relative', width: '800px', height: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Orbital Track Rings */}
        <div 
          style={{
            position: 'absolute',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            transform: `rotate(${rotationAngle * 0.5}deg)`,
            pointerEvents: 'none'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            width: '560px',
            height: '560px',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none'
          }}
        />

        {/* Center Futuristic Core */}
        <div 
          style={{
            position: 'absolute',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #a855f7 0%, #6366f1 60%, #030712 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 60px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.4)',
            zIndex: 10
          }}
        >
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 0 25px #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Zap size={20} color="#9333ea" />
          </div>
        </div>

        {/* Orbital Nodes */}
        {timelineData.map((item, index) => {
          const position = calculateNodePosition(index, timelineData.length);
          const isExpanded = expandedItems[item.id];
          const Icon = item.icon;
          const glowColor = item.glowColor || "#ec4899";

          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: isExpanded ? 500 : 20,
                cursor: 'pointer'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
            >
              {/* Outer Glow Halo */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-14px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${glowColor}60 0%, transparent 70%)`,
                  opacity: isExpanded ? 1 : 0.6,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }}
              />

              {/* Node Circular Button */}
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: isExpanded ? glowColor : '#090d16',
                  border: `2px solid ${isExpanded ? '#ffffff' : glowColor}`,
                  boxShadow: isExpanded 
                    ? `0 0 35px ${glowColor}, 0 0 70px ${glowColor}60` 
                    : `0 0 16px ${glowColor}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transform: isExpanded ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={24} color="#ffffff" />
              </div>

              {/* Node Title Label */}
              <div
                style={{
                  position: 'absolute',
                  top: '64px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isExpanded ? '#ffffff' : '#cbd5e1',
                  textShadow: isExpanded ? `0 0 12px ${glowColor}` : '0 2px 6px rgba(0,0,0,0.9)',
                  letterSpacing: '0.3px',
                  pointerEvents: 'none',
                  transition: 'color 0.3s ease'
                }}
              >
                {item.title}
              </div>

              {/* Expanded Card Popup */}
              {isExpanded && (
                <div
                  style={{
                    position: 'absolute',
                    top: position.y < 0 ? '80px' : '-290px',
                    left: position.x < 0 ? '10px' : '-310px',
                    width: '360px',
                    backgroundColor: '#090d16',
                    border: `1px solid ${glowColor}`,
                    borderRadius: '18px',
                    padding: '22px',
                    boxShadow: `0 25px 60px rgba(0, 0, 0, 0.95), 0 0 40px ${glowColor}40`,
                    zIndex: 1000,
                    cursor: 'default',
                    color: '#ffffff'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Card Category & Date Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span 
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: `${glowColor}25`,
                        border: `1px solid ${glowColor}60`,
                        color: glowColor,
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.5px'
                      }}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                      {item.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 10px 0', color: '#f8fafc' }}>
                    {item.title}
                  </h3>

                  {/* Summary Body Text */}
                  <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#cbd5e1', margin: '0 0 18px 0', fontWeight: 450 }}>
                    {item.content}
                  </p>

                  {/* Strength Bar */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                        <Zap size={13} color={glowColor} />
                        Consensus Strength
                      </span>
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>{item.energy}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${item.energy}%`, 
                          height: '100%', 
                          backgroundColor: glowColor,
                          boxShadow: `0 0 10px ${glowColor}`,
                          borderRadius: '999px'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
