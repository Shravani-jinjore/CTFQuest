import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';
const ICONS = { Linux: '🐧', Git: '🌿', Docker: '🐳' };

function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setError('Could not load categories.'));
  }, []);

  return (
    <div>
      <h2 className="page-title">Learn</h2>
      <p className="page-sub">Choose a path.</p>
      {error && <p>{error}</p>}
      <div className="grid">
        {categories.map((c) => (
          <Link key={c.id} to={`/learn/category/${c.id}`} className="tile">
            <div className="icon">{ICONS[c.name] || '📘'}</div>
            <h3>{c.name}</h3>
            <p className="muted">Lessons and practice</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Categories;