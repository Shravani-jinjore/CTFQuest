import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

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
      <h2>Learn</h2>
      {error && <p>{error}</p>}
      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            <Link to={`/learn/category/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Categories;