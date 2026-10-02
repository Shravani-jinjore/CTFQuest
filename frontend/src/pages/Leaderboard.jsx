import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`)
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch(() => setError('Could not load the leaderboard.'));
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      {error && <p>{error}</p>}
      <ol>
        {rows.map((r) => (
          <li key={r.id}>
            {r.username}: {r.xp} XP (level {r.level}, {r.solved} solved)
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;