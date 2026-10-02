import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/lessons/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => setLesson(data))
      .catch(() => setError('Lesson not found.'));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!lesson) return <p>Loading...</p>;

  return (
    <div>
      <p><Link to="/learn">← Back to learning</Link></p>
      <h2>{lesson.title}</h2>
      <p>{lesson.content}</p>
    </div>
  );
}

export default Lesson;