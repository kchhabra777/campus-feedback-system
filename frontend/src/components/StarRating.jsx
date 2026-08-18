import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 0, max = 5, size = 16, interactive = false, onRatingChange }) => {
  const stars = [];

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <Star
        key={i}
        size={size}
        fill={isFilled ? 'var(--star-gold)' : 'none'}
        color={isFilled ? 'var(--star-gold)' : 'var(--star-empty)'}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          transition: 'transform 0.1s ease'
        }}
        onClick={() => interactive && onRatingChange && onRatingChange(i)}
      />
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {stars}
    </div>
  );
};
