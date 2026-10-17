import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';
const TRACK_METADATA = {
  Linux: {
    icon: '🐧',
    tag: 'Foundation Track',
    desc: 'Master terminal navigation, file permissions, shell pipes, grep, sed, awk, and process forensics.',
    levelsCount: '43 Challenges',
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)'
  },
  Git: {
    icon: '🌿',
    tag: 'Version Control',
    desc: 'Inspect commit archaeology, recover lost branches, untangle merge conflicts, and explore reflogs.',
    levelsCount: '6 Challenges',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)'
  },
  Docker: {
    icon: '🐳',
    tag: 'Container Security',
    desc: 'Analyze Dockerfiles, inspect container runtime specs, extract compose environment secrets.',
    levelsCount: '3 Challenges',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)'
  }
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => setError('Could not load learning tracks.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 className="page-title">Learning Tracks</h2>
        <p className="page-sub">
          Step-by-step interactive theory and hands-on lessons before attempting arena challenges.
        </p>
      </div>

      {error && <p style={{ color: 'var(--bad)', marginBottom: '16px' }}>{error}</p>}
      {loading && <p className="muted">Loading tracks...</p>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {categories.map((c) => {
          const meta = TRACK_METADATA[c.name] || {
            icon: '📘',
            tag: 'Core Track',
            desc: 'Fundamental concepts and hands-on guidance.',
            levelsCount: 'Lessons & Practice',
            gradient: 'var(--panel)'
          };

          return (
            <Link
              key={c.id}
              to={`/learn/category/${c.id}`}
              className="tile"
              style={{ background: meta.gradient, padding: '28px 24px' }}
            >
              <div className="tile-top-row">
                <span className="pill category" style={{ fontSize: '0.72rem' }}>
                  {meta.tag}
                </span>
                <span className="pill xp" style={{ fontSize: '0.72rem' }}>
                  {meta.levelsCount}
                </span>
              </div>

              <div className="icon" style={{ fontSize: '3rem', margin: '8px 0' }}>
                {meta.icon}
              </div>

              <h3 style={{ fontSize: '1.45rem', marginBottom: '8px' }}>
                {c.name} Mastery
              </h3>

              <p className="muted" style={{ fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {meta.desc}
              </p>

              <div className="tile-footer">
                <span style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '0.92rem' }}>
                  Explore Topics & Lessons →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Categories;