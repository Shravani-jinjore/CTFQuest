import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      const meResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      setUser(await meResponse.json());
      navigate('/dashboard');
    } catch {
      setMessage('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card auth-card">
      <div className="auth-header">
        <div className="auth-logo-badge">🔐</div>
        <h2>Welcome Back</h2>
        <p className="muted">Sign in to resume your CTF challenge progression.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            EMAIL OR USERNAME
          </label>
          <input
            type="text"
            placeholder="you@example.com or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            PASSWORD
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '8px', padding: '12px' }}>
          {loading ? 'Authenticating...' : 'Sign In to Arena →'}
        </button>

        {message && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            fontSize: '0.88rem'
          }}>
            {message}
          </div>
        )}
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Don't have an account yet? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;