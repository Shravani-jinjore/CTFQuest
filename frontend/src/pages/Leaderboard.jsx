import { useState, useEffect } from 'react';

import { API_URL } from '../config';
const MEDALS = ['🥇', '🥈', '🥉'];

function Leaderboard({ currentUser }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data);
      })
      .catch(() => setError('Could not load the leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  const top3 = rows.slice(0, 3);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Hacker Leaderboard</h2>
        <p className="page-sub">
          Global rankings of elite players ordered by total XP earned through conquered CTF challenges.
        </p>
      </div>

      {error && <p style={{ color: 'var(--bad)', marginBottom: '16px' }}>{error}</p>}

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="podium-container">
          {top3.map((player, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const rankClass = isFirst ? 'first' : isSecond ? 'second' : 'third';
            const crown = isFirst ? '👑' : '';

            return (
              <div key={player.id} className={`podium-card ${rankClass}`}>
                {crown && <div style={{ fontSize: '1.6rem', marginBottom: '-6px' }}>{crown}</div>}
                <div className="podium-rank-badge">{MEDALS[index]}</div>
                <div className="podium-username">{player.username}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '8px 0 12px' }}>
                  <span className="pill xp" style={{ fontSize: '0.72rem' }}>Level {player.level}</span>
                  <span className="pill completed" style={{ fontSize: '0.72rem' }}>{player.solved} Solved</span>
                </div>
                <div className="podium-xp">{player.xp} XP</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Full Arena Standings</h3>
          <span className="muted" style={{ fontSize: '0.85rem' }}>{rows.length} Total Contenders</span>
        </div>

        {loading ? (
          <p className="muted" style={{ padding: '32px', textAlign: 'center' }}>Loading standings...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Operative</th>
                <th>Rank Title</th>
                <th style={{ textAlign: 'center' }}>Challenges Solved</th>
                <th style={{ textAlign: 'right' }}>Total XP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isMe = currentUser && (currentUser.id === r.id || currentUser.username === r.username);

                return (
                  <tr key={r.id} className={isMe ? 'highlight-me' : ''}>
                    <td className="rank" style={{ color: i < 3 ? '#fbbf24' : 'var(--text-muted)' }}>
                      {MEDALS[i] || `#${i + 1}`}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isMe
                            ? 'linear-gradient(135deg, var(--accent), var(--cyan))'
                            : 'rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#fff'
                        }}>
                          {r.username ? r.username[0].toUpperCase() : 'H'}
                        </div>
                        <span style={{ fontWeight: 600, color: isMe ? '#818cf8' : '#fff' }}>
                          {r.username} {isMe && <span style={{ fontSize: '0.78rem', color: 'var(--cyan)' }}>(You)</span>}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="pill xp" style={{ fontSize: '0.75rem' }}>
                        Level {r.level}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pill completed" style={{ fontSize: '0.75rem' }}>
                        {r.solved} / 52
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#fbbf24', fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>
                        {r.xp} XP
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && rows.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }} className="muted">
            No rankings recorded yet. Be the first to solve a challenge and claim #1!
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;