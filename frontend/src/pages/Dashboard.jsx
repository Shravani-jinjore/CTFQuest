import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

function Dashboard({ user }) {
  const [me, setMe] = useState(user);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_URL}/api/auth/me`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setMe(data))
      .catch(() => {});

    fetch(`${API_URL}/api/badges`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setBadges(data))
      .catch(() => {});
  }, []);

  const percent = me.xp_per_level ? (me.xp_into_level / me.xp_per_level) * 100 : 0;

  return (
    <div>
      <h2 className="page-title">Welcome, {me.username}</h2>
      <p className="page-sub">Here is your progress.</p>

      <div className="stats">
        <div className="stat"><div className="num">{me.level ?? 1}</div><div className="label">Level</div></div>
        <div className="stat"><div className="num">{me.xp}</div><div className="label">Total XP</div></div>
        <div className="stat"><div className="num">🔥 {me.streak_days ?? 0}</div><div className="label">Day streak</div></div>
      </div>

      <div className="card">
        <h3>Next level</h3>
        <div className="bar"><div style={{ width: `${percent}%` }} /></div>
        <p className="muted" style={{ marginTop: 8 }}>
          {me.xp_into_level ?? 0} / {me.xp_per_level ?? 100} XP
        </p>
      </div>

      <div className="card">
        <h3>Badges</h3>
        {badges.map((b) => (
          <div key={b.code} className={`badge-item ${b.earned ? '' : 'locked'}`}>
            <span className="emoji">{b.earned ? '🏅' : '🔒'}</span>
            <div>
              <strong>{b.name}</strong>
              <div className="muted">{b.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;