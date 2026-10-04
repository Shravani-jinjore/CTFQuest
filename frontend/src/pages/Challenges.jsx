import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/challenges`)
      .then((res) => res.json())
      .then((data) => setChallenges(data))
      .catch(() => setError('Could not load challenges.'));
  }, []);

  return (
    <div>
      <h2 className="page-title">Challenges</h2>
      <p className="page-sub">Pick one, start a terminal, and find the flag.</p>
      {error && <p>{error}</p>}
      <div className="grid">
        {challenges.map((c) => (
          <Link key={c.id} to={`/challenges/${c.id}`} className="tile">
            <div className="icon">🚩</div>
            <h3>{c.title}</h3>
            <span className={`pill ${c.difficulty}`}>{c.difficulty}</span>{' '}
            <span className="pill xp">{c.xp_reward} XP</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Challenges;