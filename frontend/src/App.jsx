import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Topics from './pages/Topics';
import Lesson from './pages/Lesson';
import Challenges from './pages/Challenges';
import Challenge from './pages/Challenge';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

import { API_URL } from './config';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  if (loading) return <p className="muted" style={{ padding: 40 }}>Loading...</p>;

  return (
    <div>
      <div className="navbar-wrapper">
        <header className="navbar">
          <Link to="/" className="brand-wrapper">
            <div className="brand-logo-icon">🏴‍☠️</div>
            <span className="brand">CTFQuest</span>
            <span className="brand-badge">Arena</span>
          </Link>
          <nav className="nav-links">
            <NavLink to="/learn">Learn</NavLink>
            <NavLink to="/challenges">Challenges</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
                <div className="nav-user-badge">
                  <div className="user-avatar-pill">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{user.username}</span>
                  <span className="nav-xp-pill">⚡ {user.xp ?? 0} XP</span>
                </div>
                <button
                  className="secondary"
                  onClick={handleLogout}
                  style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/register">
                  <button style={{ padding: '7px 16px', fontSize: '0.88rem' }}>
                    Register →
                  </button>
                </Link>
              </>
            )}
          </nav>
        </header>
      </div>

      <main>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route path="/learn" element={<Categories />} />
          <Route path="/learn/category/:id" element={<Topics />} />
          <Route path="/categories/:id/topics" element={<Topics />} />
          <Route path="/learn/lesson/:id" element={<Lesson />} />
          <Route path="/lessons/:id" element={<Lesson />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<Challenge />} />
          <Route path="/leaderboard" element={<Leaderboard currentUser={user} />} />
          <Route
            path="/admin"
            element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer style={{
        marginTop: '64px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        color: 'var(--text-dim)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏴‍☠️</span>
          <strong style={{ color: 'var(--text-muted)' }}>CTFQuest</strong> — Interactive Cybersecurity & Linux Training
        </div>
        <div>
          52 Progressive Challenges • Sandboxed Web Terminals • Level Gating
        </div>
      </footer>
    </div>
  );
}

export default App;