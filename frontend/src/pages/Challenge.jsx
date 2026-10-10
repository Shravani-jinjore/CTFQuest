import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import TerminalView from './TerminalView';

const API_URL = 'http://localhost:5000';

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
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null);

  useEffect(() => {
    setSolved(false);
    setMessage('');
    setFlag('');
    setSession(0);
    setEnvMessage('Initializing terminal environment...');
    setAutoAdvanceCountdown(null);

    let isMounted = true;
    const token = localStorage.getItem('token');

    // 1. Fetch challenge info
    fetch(`${API_URL}/api/challenges/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setChallenge(data);

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
          setEnvMessage('Log in to launch the terminal environment.');
        }
      })
      .catch(() => {
        if (isMounted) setError('Challenge not found.');
      });

    // 3. Find next and previous challenge IDs
    fetch(`${API_URL}/api/challenges`)
      .then((res) => res.json())
      .then((list) => {
        if (!isMounted) return;
        const sorted = [...list].sort((a, b) => a.id - b.id);
        const currentIndex = sorted.findIndex((c) => c.id === Number(id));
        if (currentIndex !== -1) {
          setNextId(currentIndex < sorted.length - 1 ? sorted[currentIndex + 1].id : null);
          setPrevId(currentIndex > 0 ? sorted[currentIndex - 1].id : null);
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
          if (isMounted) setHints(data);
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
    } catch (err) {
      setEnvMessage('Could not reach the server.');
      return false;
    }
  }

  async function handleStart() {
    setSession(0);
    setEnvMessage('Starting terminal...');
    if (await callEnv('start')) {
      setSession(Date.now());
      setEnvMessage('');
    }
  }

  async function handleStop() {
    setSession(0);
    await callEnv('stop');
    setEnvMessage('Terminal stopped.');
  }

  async function handleStuck() {
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
    } catch (err) {
      setHintMessage('Could not reach the server.');
    }
  }

  async function handleSubmit(event, directFlag = null) {
    if (event) event.preventDefault();
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
          ? ` 🏆 New badge: ${data.badges_earned.join(', ')}!`
          : '';
        const successMsg = `🎉 Correct! You earned ${data.xp_awarded} XP!${badgeText}`;
        setMessage(successMsg);
        setSolved(true);

        // Auto-advance to next challenge without manual actions
        if (nextId) {
          setAutoAdvanceCountdown(2);
          setTimeout(() => {
            navigate(`/challenges/${nextId}`);
          }, 1800);
        }
      } else {
        setMessage(data.message || 'Wrong flag. Try again!');
      }
    } catch (err) {
      setMessage('Could not reach the server.');
    }
  }

  if (error) return <p>{error}</p>;
  if (!challenge) return <p>Loading challenge...</p>;

  const running = session > 0;

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ margin: 0 }}><Link to="/challenges">← All challenges</Link></p>
        <div className="row" style={{ gap: '8px' }}>
          {prevId && (
            <Link to={`/challenges/${prevId}`}><button className="secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>← Prev</button></Link>
          )}
          {nextId && (
            <Link to={`/challenges/${nextId}`}><button className="secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Next →</button></Link>
          )}
        </div>
      </div>

      <div className="card">
        <h2>{challenge.title}</h2>
        <p className="muted">{challenge.difficulty} · {challenge.xp_reward} XP</p>
        <p>{challenge.description}</p>
      </div>

      {solved && (
        <div className="card" style={{ borderColor: 'var(--good)', background: 'rgba(61, 220, 151, 0.08)' }}>
          <h3 style={{ color: 'var(--good)' }}>🎉 Level Completed!</h3>
          <p>{message}</p>
          {nextId ? (
            <div className="row" style={{ marginTop: '12px' }}>
              <p className="muted" style={{ margin: 0 }}>
                ⚡ Auto-moving to next level...
              </p>
              <button onClick={() => navigate(`/challenges/${nextId}`)}>
                Go to next level now →
              </button>
            </div>
          ) : (
            <div className="row" style={{ marginTop: '12px' }}>
              <p className="muted" style={{ margin: 0 }}>🏆 Congratulations! You have completed all available levels!</p>
              <Link to="/dashboard"><button className="secondary">View Dashboard</button></Link>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ margin: 0 }}>Terminal Environment</h3>
          <div className="row" style={{ gap: '8px' }}>
            <button className="secondary" onClick={handleStart} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              {running ? 'Restart Terminal' : 'Open Terminal'}
            </button>
            {running && (
              <button className="danger" onClick={handleStop} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Stop
              </button>
            )}
          </div>
        </div>
        {envMessage && <p className="muted" style={{ margin: '4px 0 8px' }}>{envMessage}</p>}
        {running ? (
          <>
            <TerminalView key={session} challengeId={id} onAutoSubmit={(f) => handleSubmit(null, f)} />
            <p className="muted" style={{ marginTop: '8px' }}>
              💡 Tip: Select text to copy. Ctrl+V pastes. You can also type <code>submit CTFQUEST&#123;...&#125;</code> inside the terminal!
            </p>
          </>
        ) : (
          <p className="muted">Terminal is currently idle. Click "Open Terminal" or wait for it to load.</p>
        )}
      </div>

      <div className="card">
        <h3>Submit Flag</h3>
        <form onSubmit={(e) => handleSubmit(e)} className="row">
          <input
            placeholder="CTFQUEST{...}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
          />
          <button type="submit">Submit Flag</button>
        </form>
        {message && !solved && <p style={{ marginTop: '8px', color: 'var(--warn)' }}>{message}</p>}
      </div>

      <div className="card">
        <h3>Need a Hint?</h3>
        <p className="muted">Each hint reduces the XP reward by 10%.</p>
        <button className="secondary" onClick={handleStuck}>Get Hint</button>
        {hintMessage && <p style={{ marginTop: '8px' }}>{hintMessage}</p>}
        {hints.length > 0 && (
          <ol style={{ marginTop: '12px' }}>
            {hints.map((h) => (
              <li key={h.level}><strong>Hint {h.level}:</strong> {h.content}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default Challenge;