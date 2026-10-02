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
      <h2>Challenges</h2>
      {error && <p>{error}</p>}
      <ul>
        {challenges.map((c) => (
          <li key={c.id}>
            <Link to={`/challenges/${c.id}`}>{c.title}</Link> ({c.difficulty}, {c.xp_reward} XP)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Challenges;