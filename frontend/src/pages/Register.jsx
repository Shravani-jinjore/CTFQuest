import { useState } from 'react';
import { Link } from 'react-router-dom';

import { API_URL } from '../config';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      setOk(response.ok);
      if (response.ok) {
        setMessage(`Account successfully created for ${data.username}! You can log in now.`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setOk(false);
      setMessage('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card auth-card">
      <div className="auth-header">
        <div className="auth-logo-badge">⚔️</div>
        <h2>Create Account</h2>
        <p className="muted">Join the arena and start solving real CTF challenges.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            USERNAME / CODENAME
          </label>
          <input
            placeholder="e.g. cyber_ninja"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            PASSWORD <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(min 8 chars)</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '8px', padding: '12px' }}>
          {loading ? 'Registering...' : 'Create Operative Account →'}
        </button>

        {message && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            background: ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.12)',
            border: `1px solid ${ok ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.35)'}`,
            color: ok ? '#34d399' : '#fb7185',
            fontSize: '0.9rem'
          }}>
            {message}
            {ok && (
              <div style={{ marginTop: '8px' }}>
                <Link to="/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>
                  Proceed to Login →
                </Link>
              </div>
            )}
          </div>
        )}
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;