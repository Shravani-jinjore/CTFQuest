import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_URL}/api/challenges`, { headers })
      .then((res) => res.json())
      .then((data) => setChallenges(data))
      .catch(() => setError('Could not load challenges.'));
  }, []);

  return (
    <div>
      <h2 className="page-title">Challenges</h2>
      <p className="page-sub">Complete each level to unlock the next challenge.</p>
      {error && <p>{error}</p>}
      <div className="grid">
        {challenges.map((c) => {
          if (c.locked) {
            return (
              <div
                key={c.id}
                className="tile locked"
                title={`Level locked. Complete "${c.prev_title || 'previous level'}" to unlock.`}
              >
                <div className="icon">🔒</div>
                <h3>{c.title}</h3>
                <span className="pill locked">Locked</span>{' '}
                <span className="pill xp">{c.xp_reward} XP</span>
                <p className="muted" style={{ fontSize: '0.8rem', marginTop: '10px', marginBottom: 0 }}>
                  🔒 Complete prelevel to unlock
                </p>
              </div>
            );
          }

          return (
            <Link
              key={c.id}
              to={`/challenges/${c.id}`}
              className={`tile ${c.completed ? 'completed' : ''}`}
            >
              <div className="icon">{c.completed ? '✅' : '🚩'}</div>
              <h3>{c.title}</h3>
              {c.completed ? (
                <span className="pill completed">Solved</span>
              ) : (
                <span className={`pill ${c.difficulty}`}>{c.difficulty}</span>
              )}{' '}
              <span className="pill xp">{c.xp_reward} XP</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Challenges;