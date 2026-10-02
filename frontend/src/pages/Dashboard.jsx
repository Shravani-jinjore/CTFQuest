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
      <h2>Welcome, {me.username}!</h2>
      <p>Level {me.level ?? 1} | {me.xp} XP | Streak: {me.streak_days ?? 0} day(s)</p>
      <div style={{ background: '#333a4d', borderRadius: 6, height: 12 }}>
        <div style={{ width: `${percent}%`, background: '#4f7cff', height: 12, borderRadius: 6 }} />
      </div>
      <p>{me.xp_into_level ?? 0} / {me.xp_per_level ?? 100} XP to next level</p>

      <h3>Badges</h3>
      <ul>
        {badges.map((b) => (
          <li key={b.code} style={{ opacity: b.earned ? 1 : 0.4 }}>
            {b.earned ? '🏅' : '🔒'} <strong>{b.name}</strong>: {b.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;