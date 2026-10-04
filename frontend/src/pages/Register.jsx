import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      setOk(response.ok);
      setMessage(response.ok ? `Account created for ${data.username}! You can log in now.` : `Error: ${data.error}`);
    } catch (err) {
      setOk(false);
      setMessage('Could not reach the server. Is the backend running?');
    }
  }

  return (
    <div className="card auth-card">
      <h2>Create your account</h2>
      <p className="muted">Start earning XP in minutes.</p>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Create account</button>
        <p className="msg" style={{ color: ok ? 'var(--good)' : 'var(--bad)' }}>{message}</p>
      </form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}

export default Register;