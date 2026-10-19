import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_URL } from '../config';

function Dashboard({ user }) {
  const [me, setMe] = useState(user);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);

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

    fetch(`${API_URL}/api/challenges`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setChallenges(data))
      .catch(() => {});
  }, []);

  const percent = me.xp_per_level ? Math.min(100, Math.round((me.xp_into_level / me.xp_per_level) * 100)) : 0;
  const solvedChallenges = challenges.filter((c) => c.completed);
  const nextChallenge = challenges.find((c) => !c.locked && !c.completed);
  const earnedBadgesCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      {/* Profile Header Banner */}
      <div className="card" style={{
        padding: '32px 28px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(18, 24, 38, 0.85) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.35)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 8px 24px var(--accent-glow)'
            }}>
              {me.username ? me.username[0].toUpperCase() : 'H'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{me.username}</h2>
                <span className="pill xp" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#fff' }}>
                  {me.title ?? 'Newbie'}
                </span>
                {me.role === 'admin' && (
                  <span className="pill category" style={{ fontSize: '0.7rem' }}>Admin</span>
                )}
              </div>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.92rem' }}>
                {me.email} • Rank Level {me.level ?? 1}
              </p>
            </div>
          </div>

          {nextChallenge ? (
            <Link to={`/challenges/${nextChallenge.id}`}>
              <button style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                Resume Quest: Level #{nextChallenge.id} →
              </button>
            </Link>
          ) : (
            <Link to="/challenges">
              <button className="secondary" style={{ padding: '12px 24px' }}>
                Browse Challenges →
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat">
          <div className="num" style={{ color: '#818cf8' }}>{me.level ?? 1}</div>
          <div className="label">Player Level · {me.title ?? 'Newbie'}</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: '#fbbf24' }}>{me.xp ?? 0}</div>
          <div className="label">Total XP Earned</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: '#34d399' }}>
            {solvedChallenges.length} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', fontWeight: 500 }}>/ {challenges.length || 52}</span>
          </div>
          <div className="label">Levels Conquered</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: '#f43f5e' }}>🔥 {me.streak_days ?? 0}</div>
          <div className="label">Day Solving Streak</div>
        </div>
      </div>

      {/* Level Progression Card */}
      <div className="card">
        <div className="tile-top-row" style={{ marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Level {me.level ?? 1} Progression</h3>
            <span className="muted" style={{ fontSize: '0.88rem' }}>
              Earn {me.xp_per_level ? me.xp_per_level - (me.xp_into_level ?? 0) : 100} more XP to reach Level {(me.level ?? 1) + 1}
            </span>
          </div>
          <span className="pill xp" style={{ fontWeight: 700 }}>{percent}% Complete</span>
        </div>
        <div className="bar" style={{ height: '14px' }}>
          <div style={{ width: `${percent}%` }} />
        </div>
        <p className="muted" style={{ marginTop: '10px', marginBottom: 0, fontSize: '0.88rem' }}>
          <strong style={{ color: '#fff' }}>{me.xp_into_level ?? 0}</strong> / {me.xp_per_level ?? 100} XP progress into Level {me.level ?? 1}
        </p>
      </div>

      {/* Badges & Achievements */}
      <div className="card">
        <div className="tile-top-row" style={{ marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Badges & Achievements</h3>
            <span className="muted" style={{ fontSize: '0.88rem' }}>
              Unlock special achievements through speed, streaks, and hintless solves.
            </span>
          </div>
          <span className="pill completed">
            {earnedBadgesCount} of {badges.length} Unlocked
          </span>
        </div>

        <div className="badge-grid">
          {badges.map((b) => (
            <div key={b.code} className={`badge-item ${b.earned ? '' : 'locked'}`}>
              <span className="emoji">{b.earned ? '🏅' : '🔒'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <strong style={{ color: b.earned ? '#fff' : 'var(--text-muted)' }}>{b.name}</strong>
                  {b.earned && (
                    <span className="pill completed" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                      Unlocked
                    </span>
                  )}
                </div>
                <div className="muted" style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                  {b.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;