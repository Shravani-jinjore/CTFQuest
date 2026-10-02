import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

function Admin() {
  const [challenges, setChallenges] = useState([]);
  const [message, setMessage] = useState('');
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
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  function loadChallenges() {
    fetch(`${API_URL}/api/challenges`)
      .then((res) => res.json())
      .then((data) => setChallenges(data))
      .catch(() => setMessage('Could not load challenges.'));
  }

  useEffect(loadChallenges, []);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setMessage('');

    const body = {
      ...form,
      category_id: Number(form.category_id),
      xp_reward: Number(form.xp_reward),
    };

    const response = await fetch(`${API_URL}/api/admin/challenges`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (response.ok) {
      setMessage(`Created "${data.title}" (id ${data.id}).`);
      setForm((current) => ({ ...current, title: '', description: '', flag: '' }));
      loadChallenges();
    } else {
      setMessage(`Error: ${data.error}`);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this challenge and all its hints and attempts?')) return;

    const response = await fetch(`${API_URL}/api/admin/challenges/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const data = await response.json();

    setMessage(response.ok ? 'Deleted.' : `Error: ${data.error}`);
    loadChallenges();
  }

  return (
    <div>
      <h2>Admin: Challenges</h2>
      <p>{message}</p>

      <ul>
        {challenges.map((c) => (
          <li key={c.id}>
            #{c.id} {c.title} ({c.difficulty}, {c.xp_reward} XP){' '}
            <button onClick={() => handleDelete(c.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Create challenge</h3>
      <form onSubmit={handleCreate}>
        <input placeholder="Category id (1=Linux, 2=Git, 3=Docker)" value={form.category_id}
          onChange={(e) => updateField('category_id', e.target.value)} />
        <input placeholder="Title" value={form.title}
          onChange={(e) => updateField('title', e.target.value)} />
        <input placeholder="Description" value={form.description}
          onChange={(e) => updateField('description', e.target.value)} />
        <select value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value)}>
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
        <input placeholder="XP reward" value={form.xp_reward}
          onChange={(e) => updateField('xp_reward', e.target.value)} />
        <input placeholder="Flag, e.g. CTFQUEST{...}" value={form.flag}
          onChange={(e) => updateField('flag', e.target.value)} />
        <input placeholder="Docker image (optional)" value={form.docker_image}
          onChange={(e) => updateField('docker_image', e.target.value)} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default Admin;