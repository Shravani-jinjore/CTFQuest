import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

function Admin() {
  const [challenges, setChallenges] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category_id: 1,
    title: '',
    description: '',
    difficulty: 'easy',
    xp_reward: 50,
    flag: '',
    docker_image: '',
  });

  const token = localStorage.getItem('token');
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const loadChallenges = useCallback(() => {
    fetch(`${API_URL}/api/challenges`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChallenges(data);
      })
      .catch(() => setMessage('Could not load challenges.'));
  }, [token]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    const body = {
      ...form,
      category_id: Number(form.category_id),
      xp_reward: Number(form.xp_reward)
    };

    try {
      const response = await fetch(`${API_URL}/api/admin/challenges`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(`Created "${data.title}" (id ${data.id}).`);
        setForm({
          category_id: 1,
          title: '',
          description: '',
          difficulty: 'easy',
          xp_reward: 50,
          flag: '',
          docker_image: '',
        });
        loadChallenges();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this challenge and all its hints and attempts?')) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/challenges/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await response.json();
      setMessage(response.ok ? 'Challenge deleted successfully.' : `Error: ${data.error}`);
      loadChallenges();
    } catch {
      setMessage('Failed to delete challenge.');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Admin Operations Console</h2>
        <p className="page-sub">Create, inspect, and manage CTF challenges in the database.</p>
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            marginBottom: '18px'
          }}>
            {message}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Create New Challenge</h3>
        <form onSubmit={handleCreate}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: 0 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                TRACK CATEGORY
              </label>
              <select
                value={form.category_id}
                onChange={(e) => updateField('category_id', e.target.value)}
              >
                <option value={1}>1 - Linux Track</option>
                <option value={2}>2 - Git Track</option>
                <option value={3}>3 - Docker Track</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                DIFFICULTY
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                XP REWARD
              </label>
              <input
                type="number"
                placeholder="50"
                value={form.xp_reward}
                onChange={(e) => updateField('xp_reward', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              CHALLENGE TITLE
            </label>
            <input
              placeholder="e.g. Find the Hidden Token"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              BRIEFING / DESCRIPTION
            </label>
            <textarea
              rows={3}
              placeholder="Describe the challenge scenario and what player needs to locate..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              required
            />
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: 0 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                SECRET FLAG VALUE
              </label>
              <input
                placeholder="CTFQUEST{...}"
                value={form.flag}
                onChange={(e) => updateField('flag', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                DOCKER IMAGE TAG (OPTIONAL)
              </label>
              <input
                placeholder="ctfquest/linux-pack"
                value={form.docker_image}
                onChange={(e) => updateField('docker_image', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <button type="submit" disabled={loading} style={{ padding: '12px 28px' }}>
              {loading ? 'Creating Challenge...' : 'Publish Challenge to Arena →'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="tile-top-row" style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Existing Challenges ({challenges.length})</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {challenges.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 700 }}>
                  #{c.id}
                </span>
                <strong style={{ color: '#fff' }}>{c.title}</strong>
                <span className={`pill ${c.difficulty}`} style={{ fontSize: '0.7rem' }}>
                  {c.difficulty}
                </span>
                <span className="pill xp" style={{ fontSize: '0.7rem' }}>
                  {c.xp_reward} XP
                </span>
              </div>
              <button
                className="danger"
                onClick={() => handleDelete(c.id)}
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;