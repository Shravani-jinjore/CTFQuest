import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import TerminalView from './TerminalView';

const API_URL = 'http://localhost:5000';

function Challenge() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hints, setHints] = useState([]);
  const [hintMessage, setHintMessage] = useState('');
  const [running, setRunning] = useState(false);
  const [envMessage, setEnvMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/challenges/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => setChallenge(data))
      .catch(() => setError('Challenge not found.'));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_URL}/api/challenges/${id}/hints`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setHints(data))
      .catch(() => {});
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
    setRunning(false);
    if (await callEnv('start')) setRunning(true);
  }

  async function handleStop() {
    setRunning(false);
    await callEnv('stop');
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
        setHintMessage(data.error === 'no more hints' ? 'No more hints.' : `Error: ${data.error}`);
      }
    } catch (err) {
      setHintMessage('Could not reach the server.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in to submit a flag.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/challenges/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flag }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
      } else if (data.correct) {
        const badgeText = data.badges_earned.length
  ? ` New badge: ${data.badges_earned.join(', ')}!`
  : '';
setMessage(`Correct! You earned ${data.xp_awarded} XP (hints used: ${data.hints_used}).${badgeText}`);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Could not reach the server.');
    }
  }

  if (error) return <p>{error}</p>;
  if (!challenge) return <p>Loading...</p>;

  return (
    <div>
      <p><Link to="/challenges">← All challenges</Link></p>
      <h2>{challenge.title}</h2>
      <p>{challenge.difficulty} | {challenge.xp_reward} XP</p>
      <p>{challenge.description}</p>

      <h3>Environment</h3>
      <button onClick={handleStart}>{running ? 'Restart' : 'Start challenge'}</button>{' '}
      {running && <button onClick={handleStop}>Stop</button>}
      <p>{envMessage}</p>
      {running && <TerminalView key={Date.now()} challengeId={id} />}

      <h3>Submit your flag</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="CTFQUEST{...}"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
        />
        <button type="submit">Submit flag</button>
        <p>{message}</p>
      </form>

      <h3>Stuck?</h3>
      <p>Each hint you use reduces the XP reward by 10%.</p>
      <button onClick={handleStuck}>I'm stuck</button>
      <p>{hintMessage}</p>
      <ol>
        {hints.map((h) => (
          <li key={h.level}>
            <strong>Hint {h.level}:</strong> {h.content}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Challenge;