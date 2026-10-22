export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

function getWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  try {
    const parsed = new URL(API_URL);
    const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${parsed.host}/ws/terminal`;
  } catch {
    return 'ws://localhost:5000/ws/terminal';
  }
}

export const WS_URL = getWsUrl();
