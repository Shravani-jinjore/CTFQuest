const DEFAULT_PROD_URL = 'https://ctfquest-backend-meq1.onrender.com';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? 'http://localhost:5000' : DEFAULT_PROD_URL)
).replace(/\/+$/, '');

function getWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  try {
    const parsed = new URL(API_URL);
    const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${parsed.host}/ws/terminal`;
  } catch {
    return isLocalhost ? 'ws://localhost:5000/ws/terminal' : 'wss://ctfquest-backend-meq1.onrender.com/ws/terminal';
  }
}

export const WS_URL = getWsUrl();
