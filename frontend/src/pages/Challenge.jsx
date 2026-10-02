import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Challenge() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/challenges/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => setChallenge(data))
      .catch(() => setError('Challenge not found.'));
  }, [id]);

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
        setMessage(`Correct! You earned ${data.xp_awarded} XP.`);
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

      <form onSubmit={handleSubmit}>
        <input
          placeholder="CTFQUEST{...}"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
        />
        <button type="submit">Submit flag</button>
        <p>{message}</p>
      </form>
    </div>
  );
}

export default Challenge;