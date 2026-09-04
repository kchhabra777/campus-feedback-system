import React, { useEffect, useState } from "react";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 1,
  className = "",
  style = {}
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const target = Number(value) || 0;

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;
    const duration = 1200; // ms

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing: easeOutExpo curve for silky smooth tick up
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    const timeout = setTimeout(() => {
      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, delay]);

  return (
    <span className={className} style={{ display: "inline-block", fontVariantNumeric: "tabular-nums", ...style }}>
      {decimalPlaces === 0 ? Math.round(displayValue) : displayValue.toFixed(decimalPlaces)}
    </span>
  );
}

export default NumberTicker;
