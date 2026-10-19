import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

const TRACK_ICONS = {
  Linux: '🐧',
  Git: '🌿',
  Docker: '🐳',
};

function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [loadedId, setLoadedId] = useState(null);
  const [showOutline, setShowOutline] = useState(false);

  const loading = loadedId !== id && !error;

  useEffect(() => {
    let ignore = false;
    fetch(`${API_URL}/api/lessons/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setLesson(data);
          setError('');
          setLoadedId(id);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Lesson not found.');
          setLoadedId(id);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight' && lesson?.next_id) {
        navigate(`/learn/lesson/${lesson.next_id}`);
      } else if (e.key === 'ArrowLeft' && lesson?.prev_id) {
        navigate(`/learn/lesson/${lesson.prev_id}`);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lesson, navigate]);

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚠️</p>
        <h2>Lesson Not Found</h2>
        <p className="muted">{error}</p>
        <Link to="/learn"><button className="secondary">← Back to Learning Tracks</button></Link>
      </div>
    );
  }

  if (loading || !lesson) {
    return <p className="muted" style={{ padding: '40px 0' }}>Loading lesson content...</p>;
  }

  const categoryIcon = TRACK_ICONS[lesson.category_name] || '📖';
  const progressPercent = lesson.total_in_track
    ? Math.round((lesson.current_index / lesson.total_in_track) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <Link to="/learn" style={{ color: 'var(--text-muted)' }}>Tracks</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          {lesson.category_id && (
            <>
              <Link to={`/learn/category/${lesson.category_id}`} style={{ color: 'var(--text-muted)' }}>
                {categoryIcon} {lesson.category_name}
              </Link>
              <span style={{ color: 'var(--border)' }}>/</span>
            </>
          )}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{lesson.topic_title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="secondary"
            onClick={() => setShowOutline(!showOutline)}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            📋 Track Outline ({lesson.current_index}/{lesson.total_in_track})
          </button>
          <span className="pill xp" style={{ fontSize: '0.78rem' }}>
            Lesson #{lesson.current_index}
          </span>
        </div>
      </div>

      {/* Track Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>{lesson.category_name} Track Progression</span>
          <span>{lesson.current_index} of {lesson.total_in_track} Lessons ({progressPercent}%)</span>
        </div>
        <div className="progress-bar-bg" style={{ height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, height: '100%' }} />
        </div>
      </div>

      {/* Curriculum Outline Dropdown/Drawer */}
      {showOutline && lesson.track_lessons && (
        <div className="card" style={{ marginBottom: '24px', padding: '18px 24px', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Full Curriculum: {lesson.category_name} Track</h4>
            <span className="muted" style={{ fontSize: '0.8rem' }}>Click any lesson to jump directly</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
            {lesson.track_lessons.map((item, idx) => {
              const isCurrent = item.id === lesson.id;
              return (
                <Link
                  key={item.id}
                  to={`/learn/lesson/${item.id}`}
                  style={{ textDecoration: 'none' }}
                  onClick={() => setShowOutline(false)}
                >
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    background: isCurrent ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: isCurrent ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', opacity: 0.7 }}>
                      #{idx + 1}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </span>
                    {isCurrent && <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>📍</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Lesson Content Card */}
      <div className="card" style={{ padding: '36px 40px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span className="pill xp" style={{ fontSize: '0.75rem' }}>
            {lesson.topic_title}
          </span>
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '22px', lineHeight: 1.3 }}>
          {lesson.title}
        </h1>

        <div style={{
          background: 'rgba(10, 14, 24, 0.8)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '28px',
          margin: '24px 0'
        }}>
          <p className="lesson-text" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.8 }}>
            {lesson.content}
          </p>
        </div>

        {/* Practice in Arena Callout */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          marginTop: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <strong style={{ color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚔️</span> Hands-on Terminal Practice
            </strong>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
              Put these concepts into action in a real sandboxed cloud container.
            </p>
          </div>
          <Link to="/challenges">
            <button className="secondary" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
              Open Arena Terminal →
            </button>
          </Link>
        </div>
      </div>

      {/* Navigation Controls (Previous & Next Lesson) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {lesson.prev_id ? (
          <Link to={`/learn/lesson/${lesson.prev_id}`} style={{ textDecoration: 'none' }}>
            <button
              className="secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>←</span>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.05em' }}>
                  Previous Lesson
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                  {lesson.prev_title}
                </div>
              </div>
            </button>
          </Link>
        ) : (
          <Link to="/learn" style={{ textDecoration: 'none' }}>
            <button className="secondary" style={{ padding: '12px 20px' }}>
              ← Learning Tracks
            </button>
          </Link>
        )}

        {lesson.next_id ? (
          <Link to={`/learn/lesson/${lesson.next_id}`} style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                textAlign: 'right',
                boxShadow: '0 0 24px rgba(99, 102, 241, 0.35)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.85, letterSpacing: '0.05em' }}>
                  Next Lesson
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  {lesson.next_title}
                </div>
              </div>
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
          </Link>
        ) : (
          <Link to="/challenges" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                boxShadow: '0 0 24px var(--accent-glow)'
              }}
            >
              <span>🎉 Track Completed! Head to Arena</span>
              <span>→</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Lesson;