import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { API_URL } from '../config';
const CATEGORY_NAMES = { 1: 'Linux', 2: 'Git', 3: 'Docker' };
const CATEGORY_ICONS = { 1: '🐧', 2: '🌿', 3: '🐳' };

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_URL}/api/challenges`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChallenges(data);
        }
      })
      .catch(() => setError('Could not load challenges.'))
      .finally(() => setLoading(false));
  }, []);

  const totalChallenges = challenges.length;
  const solvedCount = useMemo(() => challenges.filter((c) => c.completed).length, [challenges]);
  const progressPercent = totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0;

  // Next active level (first unlocked challenge that isn't completed yet)
  const currentLevel = useMemo(() => {
    return challenges.find((c) => !c.locked && !c.completed);
  }, [challenges]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catName = CATEGORY_NAMES[c.category_id]?.toLowerCase();
        if (catName !== selectedCategory.toLowerCase()) return false;
      }
      // Status filter
      if (statusFilter === 'solved' && !c.completed) return false;
      if (statusFilter === 'unlocked' && (c.locked || c.completed)) return false;
      if (statusFilter === 'locked' && !c.locked) return false;

      // Text search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDiff = c.difficulty.toLowerCase().includes(query);
        const matchesCat = (CATEGORY_NAMES[c.category_id] || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDiff && !matchesCat) return false;
      }

      return true;
    });
  }, [challenges, selectedCategory, statusFilter, search]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Challenge Arena</h2>
        <p className="page-sub">
          Complete each level to unlock the next quest in sequence. 52 progressive challenges spanning Linux, Git & Docker.
        </p>

        {/* Global Progress Bar Card */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem' }}>🏆</span>
              <strong style={{ fontSize: '1rem', color: '#fff' }}>Your Arena Progress</strong>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>{solvedCount}</span> of {totalChallenges} Solved ({progressPercent}%)
            </div>
          </div>
          <div className="bar">
            <div style={{ width: `${progressPercent}%` }} />
          </div>

          {currentLevel && (
            <div style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span className="muted" style={{ fontSize: '0.85rem' }}>CURRENT ACTIVE QUEST:</span>
                <div style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                  {CATEGORY_ICONS[currentLevel.category_id]} Level #{currentLevel.id}: {currentLevel.title}
                  <span className={`pill ${currentLevel.difficulty}`} style={{ marginLeft: '8px' }}>
                    {currentLevel.difficulty}
                  </span>
                </div>
              </div>
              <Link to={`/challenges/${currentLevel.id}`}>
                <button style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                  Resume Challenge →
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {error && <p style={{ color: 'var(--bad)', marginBottom: '16px' }}>{error}</p>}

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        {/* Track Category Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Tracks ({totalChallenges})
          </button>
          <button
            className={`filter-tab ${selectedCategory === 'linux' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('linux')}
          >
            🐧 Linux (43)
          </button>
          <button
            className={`filter-tab ${selectedCategory === 'git' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('git')}
          >
            🌿 Git (6)
          </button>
          <button
            className={`filter-tab ${selectedCategory === 'docker' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('docker')}
          >
            🐳 Docker (3)
          </button>
        </div>

        {/* Status Filter & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '9px 14px', fontSize: '0.88rem' }}
          >
            <option value="all">Status: All</option>
            <option value="unlocked">Status: Unlocked / Active</option>
            <option value="solved">Status: Solved</option>
            <option value="locked">Status: Locked</option>
          </select>

          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '9px 14px', fontSize: '0.88rem' }}
            />
          </div>
        </div>
      </div>

      {loading && <p className="muted" style={{ padding: '32px 0' }}>Loading challenges...</p>}

      {/* Challenge Grid */}
      <div className="grid">
        {filteredChallenges.map((c) => {
          const categoryName = CATEGORY_NAMES[c.category_id] || 'Linux';
          const categoryIcon = CATEGORY_ICONS[c.category_id] || '🚩';

          if (c.locked) {
            return (
              <div
                key={c.id}
                className="tile locked"
                title={`Level locked. Complete "${c.prev_title || 'previous level'}" to unlock.`}
              >
                <div className="tile-top-row">
                  <span className="pill category" style={{ fontSize: '0.7rem' }}>
                    {categoryIcon} {categoryName}
                  </span>
                  <span className="pill locked">🔒 Locked</span>
                </div>

                <div className="icon">🔒</div>
                <h3>#{c.id} {c.title}</h3>

                <p className="muted" style={{ fontSize: '0.82rem', marginBottom: 0, marginTop: '4px' }}>
                  Requires previous level: <br />
                  <strong style={{ color: 'var(--text-muted)' }}>&ldquo;{c.prev_title || 'Level ' + (c.id - 1)}&rdquo;</strong>
                </p>

                <div className="tile-footer">
                  <span className={`pill ${c.difficulty}`}>{c.difficulty}</span>
                  <span className="pill xp">+{c.xp_reward} XP</span>
                </div>
              </div>
            );
          }

          const isCurrentActive = currentLevel && currentLevel.id === c.id;

          return (
            <Link
              key={c.id}
              to={`/challenges/${c.id}`}
              className={`tile ${c.completed ? 'completed' : isCurrentActive ? 'active-level' : ''}`}
            >
              <div className="tile-top-row">
                <span className="pill category" style={{ fontSize: '0.7rem' }}>
                  {categoryIcon} {categoryName}
                </span>
                {c.completed ? (
                  <span className="pill completed">✓ Solved</span>
                ) : isCurrentActive ? (
                  <span className="pill xp" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#fff' }}>
                    ⚡ Active
                  </span>
                ) : (
                  <span className="pill" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                    Open
                  </span>
                )}
              </div>

              <div className="icon">{c.completed ? '✅' : isCurrentActive ? '🔥' : '🚩'}</div>
              <h3>#{c.id} {c.title}</h3>

              {c.first_blood_user ? (
                <div style={{ fontSize: '0.76rem', color: '#fda4af', margin: '4px 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🩸</span> 1st: <strong>@{c.first_blood_user}</strong>
                </div>
              ) : (
                <div style={{ fontSize: '0.76rem', color: '#fef08a', margin: '4px 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🩸</span> <em>1st Blood Unclaimed</em>
                </div>
              )}

              <div className="tile-footer">
                <span className={`pill ${c.difficulty}`}>{c.difficulty}</span>
                <span className="pill xp">+{c.xp_reward} XP</span>
              </div>
            </Link>
          );
        })}
      </div>

      {!loading && filteredChallenges.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</p>
          <h3>No challenges match your search</h3>
          <p className="muted">Try clearing your filters or search terms.</p>
          <button
            className="secondary"
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Challenges;