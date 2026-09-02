export const TAG_THEMES = {
  'Approachable': {
    name: 'Approachable',
    color: '#34d399',      // Emerald Green
    border: '#10b981',
    borderSubtle: 'rgba(16, 185, 129, 0.35)',
    bg: 'rgba(16, 185, 129, 0.10)',
    activeBg: 'rgba(16, 185, 129, 0.25)',
    glow: '0 0 14px rgba(16, 185, 129, 0.45)',
  },
  'Clear Explanations': {
    name: 'Clear Explanations',
    color: '#38bdf8',      // Sky Cyan
    border: '#0ea5e9',
    borderSubtle: 'rgba(14, 165, 233, 0.35)',
    bg: 'rgba(14, 165, 233, 0.10)',
    activeBg: 'rgba(14, 165, 233, 0.25)',
    glow: '0 0 14px rgba(14, 165, 233, 0.45)',
  },
  'Engaging Lectures': {
    name: 'Engaging Lectures',
    color: '#c084fc',      // Vibrant Purple
    border: '#a855f7',
    borderSubtle: 'rgba(168, 85, 247, 0.35)',
    bg: 'rgba(168, 85, 247, 0.10)',
    activeBg: 'rgba(168, 85, 247, 0.25)',
    glow: '0 0 14px rgba(168, 85, 247, 0.45)',
  },
  'Heavy Workload': {
    name: 'Heavy Workload',
    color: '#fbbf24',      // Warm Amber / Gold
    border: '#f59e0b',
    borderSubtle: 'rgba(245, 158, 11, 0.35)',
    bg: 'rgba(245, 158, 11, 0.10)',
    activeBg: 'rgba(245, 158, 11, 0.25)',
    glow: '0 0 14px rgba(245, 158, 11, 0.45)',
  },
  'Tough Grader': {
    name: 'Tough Grader',
    color: '#f87171',      // Crimson / Coral Red
    border: '#ef4444',
    borderSubtle: 'rgba(239, 68, 68, 0.35)',
    bg: 'rgba(239, 68, 68, 0.10)',
    activeBg: 'rgba(239, 68, 68, 0.25)',
    glow: '0 0 14px rgba(239, 68, 68, 0.45)',
  }
};

export const DEFAULT_TAG_THEME = {
  color: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.2)',
  borderSubtle: 'rgba(255, 255, 255, 0.12)',
  bg: 'rgba(255, 255, 255, 0.05)',
  activeBg: 'rgba(255, 255, 255, 0.15)',
  glow: '0 0 10px rgba(255, 255, 255, 0.2)',
};

export function getTagTheme(tagName) {
  return TAG_THEMES[tagName] || DEFAULT_TAG_THEME;
}
