export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const WS_URL = import.meta.env.VITE_WS_URL || (
  typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? `wss://${window.location.hostname}:5000/ws/terminal`
    : 'ws://localhost:5000/ws/terminal'
);
