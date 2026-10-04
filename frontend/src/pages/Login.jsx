import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      localStorage.setItem('token', data.token);
      const meResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      setUser(await meResponse.json());
      navigate('/dashboard');
    } catch (err) {
      setMessage('Could not reach the server. Is the backend running?');
    }
  }

  return (
    <div className="card auth-card">
      <h2>Welcome back</h2>
      <p className="muted">Log in to continue your quest.</p>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Log in</button>
        <p className="msg" style={{ color: 'var(--bad)' }}>{message}</p>
      </form>
      <p className="muted">No account? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default Login;