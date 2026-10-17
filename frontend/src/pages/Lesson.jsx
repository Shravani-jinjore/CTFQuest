import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/lessons/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => setLesson(data))
      .catch(() => setError('Lesson not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: '2rem' }}>⚠️</p>
        <h3>Lesson Not Found</h3>
        <p className="muted">{error}</p>
        <Link to="/learn"><button className="secondary">← Back to Learning Tracks</button></Link>
      </div>
    );
  }

  if (loading || !lesson) return <p className="muted" style={{ padding: '32px 0' }}>Loading lesson content...</p>;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ margin: 0 }}>
          <Link to="/learn" style={{ color: 'var(--text-muted)' }}>← Back to Tracks</Link>
        </p>
        <span className="pill xp">Lesson #{lesson.position}</span>
      </div>

      <div className="card" style={{ padding: '32px 36px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '18px' }}>{lesson.title}</h2>

        <div style={{
          background: 'rgba(10, 14, 24, 0.7)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          margin: '20px 0'
        }}>
          <p className="lesson-text" style={{ margin: 0 }}>
            {lesson.content}
          </p>
        </div>

        <div style={{
          padding: '16px 20px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '10px',
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong style={{ color: '#fff' }}>Ready to apply what you learned?</strong>
            <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
              Jump directly into the arena terminal and solve the corresponding challenge.
            </p>
          </div>
          <Link to="/challenges">
            <button style={{ padding: '10px 22px' }}>
              Practice in Arena →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Lesson;