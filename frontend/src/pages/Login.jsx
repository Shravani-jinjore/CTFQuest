import { useState } from 'react';

const API_URL = 'http://localhost:5000';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

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
      await loadProfile();
    } catch (err) {
      setMessage('Could not reach the server. Is the backend running?');
    }
  }

  async function loadProfile() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok) {
      setUser(data);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.username}!</h2>
        <p>Role: {user.role} | XP: {user.xp}</p>
        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log in</button>
      <p>{message}</p>
    </form>
  );
}

export default Login;