import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Topics() {
  const { id } = useParams();
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/categories/${id}/topics`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTopics(data);
      })
      .catch(() => setError('Could not load topics.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: 0, marginBottom: '14px' }}>
          <Link to="/learn" style={{ color: 'var(--text-muted)' }}>← Back to All Tracks</Link>
        </p>
        <h2 className="page-title">Curriculum Topics</h2>
        <p className="page-sub">Select a topic below to read concepts and practical commands.</p>
      </div>

      {error && <p style={{ color: 'var(--bad)', marginBottom: '16px' }}>{error}</p>}
      {loading && <p className="muted">Loading topics...</p>}

      {!loading && topics.length === 0 && !error && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</p>
          <h3>No topics created yet</h3>
          <p className="muted">Check back soon for curated lessons on this track.</p>
          <Link to="/challenges"><button>Practice in Challenge Arena</button></Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {topics.map((topic, topicIndex) => (
          <div className="card" key={topic.id} style={{ padding: '24px 28px' }}>
            <div className="tile-top-row" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pill xp" style={{ fontSize: '0.72rem' }}>
                  Module #{topicIndex + 1}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{topic.title}</h3>
              </div>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {topic.lessons.length} Lessons
              </span>
            </div>

            <ul className="lesson-list">
              {topic.lessons.map((lesson, i) => (
                <li key={lesson.id}>
                  <Link to={`/learn/lesson/${lesson.id}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700
                      }}>
                        {i + 1}
                      </span>
                      <span>{lesson.title}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--cyan)' }}>
                      Read Lesson →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Topics;