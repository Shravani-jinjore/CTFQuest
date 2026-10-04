import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';
const MEDALS = ['🥇', '🥈', '🥉'];

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
      <h2 className="page-title">Leaderboard</h2>
      <p className="page-sub">Top players by XP.</p>
      {error && <p>{error}</p>}
      <div className="card">
        <table>
          <thead>
            <tr><th>#</th><th>Player</th><th>Level</th><th>Solved</th><th>XP</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="rank">{MEDALS[i] || i + 1}</td>
                <td>{r.username}</td>
                <td>{r.level}</td>
                <td>{r.solved}</td>
                <td><strong>{r.xp}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;