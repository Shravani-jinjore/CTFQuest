import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>CTFQuest</h1>
      <nav>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/learn">Learn</Link>
            <Link to="/challenges">Challenges</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/learn">Learn</Link>
            <Link to="/challenges">Challenges</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </>
        )}
      </nav>

      <Routes>
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
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;