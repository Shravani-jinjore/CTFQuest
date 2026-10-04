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

const API_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

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
      <header className="navbar">
        <Link to="/" className="brand">CTFQuest</Link>
        <nav className="nav-links">
          <NavLink to="/learn">Learn</NavLink>
          <NavLink to="/challenges">Challenges</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
              <button className="secondary" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </header>

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
        <Route path="/learn/lesson/:id" element={<Lesson />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<Challenge />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/admin"
          element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;