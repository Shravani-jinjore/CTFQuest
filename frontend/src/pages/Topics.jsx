import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Topics() {
  const { id } = useParams();
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/categories/${id}/topics`)
      .then((res) => res.json())
      .then((data) => setTopics(data))
      .catch(() => setError('Could not load topics.'));
  }, [id]);

  return (
    <div>
      <p><Link to="/learn">← All categories</Link></p>
      {error && <p>{error}</p>}
      {topics.length === 0 && !error && <p className="muted">No topics yet.</p>}
      {topics.map((topic) => (
        <div className="card" key={topic.id}>
          <h3>{topic.title}</h3>
          <ul className="lesson-list">
            {topic.lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <Link to={`/learn/lesson/${lesson.id}`}>{i + 1}. {lesson.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Topics;