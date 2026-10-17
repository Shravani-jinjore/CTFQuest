import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import TerminalView from './TerminalView';
import TuxCelebration from '../components/TuxCelebration';

const API_URL = 'http://localhost:5000';
const CATEGORY_NAMES = { 1: 'Linux', 2: 'Git', 3: 'Docker' };
const CATEGORY_ICONS = { 1: '🐧', 2: '🌿', 3: '🐳' };

function Challenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hints, setHints] = useState([]);
  const [hintMessage, setHintMessage] = useState('');
  const [session, setSession] = useState(0);
  const [envMessage, setEnvMessage] = useState('');
  const [solved, setSolved] = useState(false);
  const [nextId, setNextId] = useState(null);
  const [prevId, setPrevId] = useState(null);
  const [nextChallenge, setNextChallenge] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    setSolved(false);
    setMessage('');
    setFlag('');
    setCelebration(null);
    setSession(0);
    setEnvMessage('Initializing terminal environment...');

    let isMounted = true;
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch challenge info
    fetch(`${API_URL}/api/challenges/${id}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setChallenge(data);
        if (data.completed) {
          setSolved(true);
        }

        // If level is locked, do not auto-start terminal environment
        if (data.locked) {
          setEnvMessage('');
          return;
        }

        // 2. Automatically start the environment and open the terminal if logged in
        if (token) {
          fetch(`${API_URL}/api/challenges/${id}/start`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(async (r) => {
              if (!isMounted) return;
              if (r.ok) {
                setSession(Date.now());
                setEnvMessage('');
              } else {
                const d = await r.json().catch(() => ({}));
                setEnvMessage(d.error ? `Notice: ${d.error}` : 'Could not auto-start terminal');
              }
            })
            .catch(() => {
              if (isMounted) setEnvMessage('Could not reach backend to start terminal.');
            });
        } else {
          setEnvMessage('Log in to launch the private terminal environment.');
        }
      })
      .catch(() => {
        if (isMounted) setError('Challenge not found.');
      });

    // 3. Find next and previous challenge IDs
    fetch(`${API_URL}/api/challenges`, { headers })
      .then((res) => res.json())
      .then((list) => {
        if (!isMounted) return;
        const sorted = [...list].sort((a, b) => a.id - b.id);
        const currentIndex = sorted.findIndex((c) => c.id === Number(id));
        if (currentIndex !== -1) {
          const nextItem = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
          setNextId(nextItem ? nextItem.id : null);
          setPrevId(currentIndex > 0 ? sorted[currentIndex - 1].id : null);
          setNextChallenge(nextItem);
        }
      })
      .catch(() => {});

    // 4. Fetch hints if unlocked
    if (token) {
      fetch(`${API_URL}/api/challenges/${id}/hints`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (isMounted && Array.isArray(data)) setHints(data);
        })
        .catch(() => {});
    } else {
      setHints([]);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function callEnv(action) {
    if (challenge?.locked) return false;
    setEnvMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setEnvMessage('Please log in first.');
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/api/challenges/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setEnvMessage(`Error: ${data.error}`);
        return false;
      }
      return true;
    } catch {
      setEnvMessage('Could not reach the server.');
      return false;
    }
  }

  async function handleStart() {
    if (challenge?.locked) return;
    setSession(0);
    setEnvMessage('Starting terminal container...');
    if (await callEnv('start')) {
      setSession(Date.now());
      setEnvMessage('');
    }
  }

  async function handleStop() {
    setSession(0);
    await callEnv('stop');
    setEnvMessage('Terminal container stopped.');
  }

  async function handleStuck() {
    if (challenge?.locked) return;
    setHintMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setHintMessage('Please log in to use hints.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/challenges/${id}/hints/next`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setHints((current) => [...current, data]);
      } else {
        setHintMessage(data.error === 'no more hints' ? 'No more hints available.' : `Error: ${data.error}`);
      }
    } catch {
      setHintMessage('Could not reach the server.');
    }
  }

  async function handleSubmit(event, directFlag = null) {
    if (event) event.preventDefault();
    if (challenge?.locked) {
      setMessage('This level is locked. Complete the previous level first.');
      return;
    }
    const submissionFlag = directFlag !== null ? directFlag : flag;
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in to submit a flag.');
      return;
    }
    if (!submissionFlag || !submissionFlag.trim()) {
      setMessage('Please enter a flag to submit.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/challenges/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ flag: submissionFlag.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        if (data.error === 'already completed') {
          setSolved(true);
        }
      } else if (data.correct) {
        const badgeText = data.badges_earned && data.badges_earned.length
          ? ` 🏆 New badge earned: ${data.badges_earned.join(', ')}!`
          : '';
        const successMsg = `🎉 Correct flag! You earned ${data.xp_awarded} XP!${badgeText}`;
        setMessage(successMsg);
        setSolved(true);

        // Trigger cute Tux celebration popup!
        setCelebration({
          challengeTitle: challenge?.title || `Level #${id}`,
          xpAwarded: data.xp_awarded,
          badgesEarned: data.badges_earned || [],
          nextId: nextId,
          nextTitle: nextChallenge ? nextChallenge.title : null,
        });
      } else {
        setMessage(data.message || 'Wrong flag. Keep trying!');
      }
    } catch {
      setMessage('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚠️</p>
        <h2>Challenge Not Found</h2>
        <p className="muted">{error}</p>
        <Link to="/challenges"><button className="secondary">← Back to All Challenges</button></Link>
      </div>
    );
  }

  if (!challenge) {
    return <p className="muted" style={{ padding: '40px 0' }}>Loading challenge environment...</p>;
  }

  // Locked Screen
  if (challenge.locked) {
    return (
      <div>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '18px' }}>
          <p style={{ margin: 0 }}>
            <Link to="/challenges" style={{ color: 'var(--text-muted)' }}>← All Challenges</Link>
          </p>
          <div className="row" style={{ gap: '8px' }}>
            {prevId && (
              <Link to={`/challenges/${prevId}`}>
                <button className="secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  ← Previous Level (#{prevId})
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="card" style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'linear-gradient(180deg, rgba(15, 20, 32, 0.9) 0%, rgba(10, 14, 24, 0.95) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '24px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: '0 0 32px var(--bad-glow)'
          }}>
            🔒
          </div>

          <span className="pill locked" style={{ marginBottom: '14px' }}>Level #{challenge.id} Locked</span>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>{challenge.title}</h2>
          <p className="muted" style={{ maxWidth: '540px', margin: '0 auto 28px', fontSize: '1.05rem', lineHeight: 1.7 }}>
            This level cannot be opened yet. In accordance with the CTFQuest progressive arena rules,
            you must complete the previous level{' '}
            {challenge.prev_title ? (
              <strong style={{ color: '#fff' }}>&ldquo;{challenge.prev_title}&rdquo;</strong>
            ) : (
              'first'
            )}{' '}
            before this challenge unlocks.
          </p>

          <div className="row" style={{ justifyContent: 'center', gap: '14px' }}>
            {challenge.prev_id && (
              <Link to={`/challenges/${challenge.prev_id}`}>
                <button style={{ padding: '12px 26px' }}>
                  Go to Level #{challenge.prev_id}: {challenge.prev_title || 'Previous'} →
                </button>
              </Link>
            )}
            <Link to="/challenges">
              <button className="secondary" style={{ padding: '12px 22px' }}>
                View All Challenges
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const running = session > 0;
  const isNextUnlocked = Boolean(solved || challenge.completed || (nextChallenge && !nextChallenge.locked));
  const categoryName = CATEGORY_NAMES[challenge.category_id] || 'Linux';
  const categoryIcon = CATEGORY_ICONS[challenge.category_id] || '🚩';

  return (
    <div>
      {celebration && (
        <TuxCelebration
          challengeTitle={celebration.challengeTitle}
          xpAwarded={celebration.xpAwarded}
          badgesEarned={celebration.badgesEarned}
          nextId={celebration.nextId}
          nextTitle={celebration.nextTitle}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* Top Header & Navigation Bar */}
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <Link to="/challenges" style={{ color: 'var(--text-muted)' }}>← All Challenges</Link>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ color: 'var(--text-dim)' }}>{categoryIcon} {categoryName}</span>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>Level #{challenge.id}</span>
        </div>

        <div className="row" style={{ gap: '8px' }}>
          {prevId && (
            <Link to={`/challenges/${prevId}`}>
              <button className="secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                ← Prev (#{prevId})
              </button>
            </Link>
          )}

          {nextId && (
            isNextUnlocked ? (
              <Link to={`/challenges/${nextId}`}>
                <button className="secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  Next (#{nextId}) →
                </button>
              </Link>
            ) : (
              <button
                className="secondary"
                disabled
                title="Complete this level to unlock the next level"
                style={{ padding: '6px 14px', fontSize: '0.85rem', opacity: 0.5, cursor: 'not-allowed' }}
              >
                Next 🔒
              </button>
            )
          )}
        </div>
      </div>

      {/* Challenge Mission Briefing */}
      <div className="card">
        <div className="tile-top-row" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pill category">{categoryIcon} {categoryName}</span>
            <span className={`pill ${challenge.difficulty}`}>{challenge.difficulty}</span>
            <span className="pill xp">+{challenge.xp_reward} XP</span>
          </div>
          {solved && (
            <span className="pill completed" style={{ fontSize: '0.8rem' }}>
              ✓ Solved
            </span>
          )}
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>
          Level #{challenge.id}: {challenge.title}
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
          {challenge.description}
        </p>
      </div>

      {/* Completion Banner */}
      {solved && (
        <div className="card" style={{
          borderColor: 'var(--good)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(18, 24, 38, 0.9) 100%)',
          boxShadow: '0 0 32px var(--good-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎉</span>
            <h3 style={{ color: 'var(--good)', margin: 0, fontSize: '1.35rem' }}>Level Completed!</h3>
          </div>
          <p style={{ color: '#f1f5f9', margin: '4px 0 12px' }}>{message}</p>
          {nextId ? (
            <div className="row" style={{ marginTop: '14px' }}>
              <p className="muted" style={{ margin: 0 }}>
                ⚡ Auto-advancing to Level #{nextId}...
              </p>
              <button onClick={() => navigate(`/challenges/${nextId}`)} style={{ padding: '8px 20px' }}>
                Go to Level #{nextId} now →
              </button>
            </div>
          ) : (
            <div className="row" style={{ marginTop: '14px' }}>
              <p className="muted" style={{ margin: 0 }}>🏆 Congratulations! You have completed all 52 available levels!</p>
              <Link to="/dashboard"><button className="secondary">View Dashboard</button></Link>
            </div>
          )}
        </div>
      )}

      {/* Terminal Workspace Frame */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="terminal-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="window-dots">
              <div className="window-dot red" />
              <div className="window-dot yellow" />
              <div className="window-dot green" />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              terminal@ctfquest:~ (level-{challenge.id})
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: running ? '#10b981' : 'var(--text-dim)'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: running ? '#10b981' : 'var(--text-dim)',
                boxShadow: running ? '0 0 8px #10b981' : 'none',
                display: 'inline-block'
              }} />
              {running ? 'Running' : 'Idle'}
            </div>
          </div>

          <div className="row" style={{ gap: '8px' }}>
            <button
              className="secondary"
              onClick={handleStart}
              style={{ padding: '6px 14px', fontSize: '0.84rem' }}
            >
              {running ? 'Restart Terminal' : 'Open Terminal'}
            </button>
            {running && (
              <button
                className="danger"
                onClick={handleStop}
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
              >
                Stop
              </button>
            )}
          </div>
        </div>

        {envMessage && (
          <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {envMessage}
          </div>
        )}

        <div className="terminal-box">
          {running ? (
            <TerminalView key={session} challengeId={id} onAutoSubmit={(f) => handleSubmit(null, f)} />
          ) : (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem'
            }}>
              <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🖥️</p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Terminal container is currently idle.</p>
              <button onClick={handleStart} style={{ padding: '8px 20px' }}>
                Launch Terminal Environment
              </button>
            </div>
          )}
        </div>

        <div className="terminal-tips-bar">
          <div>
            💡 <strong style={{ color: '#fff' }}>Pro-tip:</strong> Selecting text auto-copies • <kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>Ctrl+V</kbd> pastes
          </div>
          <div>
            You can type <code style={{ color: '#38bdf8' }}>submit CTFQUEST&#123;...&#125;</code> inside the terminal!
          </div>
        </div>
      </div>

      {/* Flag Submission Card */}
      <div className="card">
        <h3 style={{ marginBottom: '8px' }}>Submit Captured Flag</h3>
        <p className="muted" style={{ marginBottom: '16px' }}>
          Enter the flag discovered from the terminal environment (format: <code>CTFQUEST&#123;...&#125;</code>).
        </p>

        <form onSubmit={(e) => handleSubmit(e)} className="row">
          <input
            style={{ fontFamily: 'var(--font-mono)' }}
            placeholder="CTFQUEST{...}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            disabled={submitting}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Submit Flag →'}
          </button>
        </form>

        {message && !solved && (
          <div style={{
            marginTop: '14px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fbbf24',
            fontSize: '0.9rem'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Hints Card */}
      <div className="card">
        <div className="tile-top-row" style={{ marginBottom: '6px' }}>
          <h3 style={{ margin: 0 }}>Need a Hint?</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Each hint reduces final reward by 10%
          </span>
        </div>
        <p className="muted">
          Stuck on a command or concept? Hints reveal step-by-step guidance without giving away the full answer immediately.
        </p>

        <button className="secondary" onClick={handleStuck} style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
          💡 Get Hint {hints.length > 0 ? `(${hints.length} unlocked)` : ''}
        </button>

        {hintMessage && (
          <p style={{ marginTop: '12px', color: 'var(--warn)', fontSize: '0.9rem' }}>{hintMessage}</p>
        )}

        {hints.length > 0 && (
          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hints.map((h) => (
              <div
                key={h.level}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px 18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="pill xp" style={{ fontSize: '0.7rem' }}>Hint #{h.level}</span>
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {h.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Challenge;