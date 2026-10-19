const XP_PER_LEVEL = 100;

const TITLES = [
  'Newbie', 'Explorer', 'Apprentice', 'Hacker', 'Operator',
  'Specialist', 'Expert', 'Veteran', 'Master', 'Legend',
];

function levelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return {
    level,
    title: TITLES[Math.min(level, TITLES.length) - 1],
    xp_into_level: xp % XP_PER_LEVEL,
    xp_per_level: XP_PER_LEVEL,
  };
}

async function awardBadges(conn, userId, context = {}) {
  const hintsUsed = typeof context === 'number' ? context : (context.hintsUsed ?? 0);
  const challengeId = typeof context === 'object' ? context.challengeId : null;
  const isFirstBlood = typeof context === 'object' ? Boolean(context.isFirstBlood) : false;

  const [[user]] = await conn.query('SELECT streak_days FROM users WHERE id = ?', [userId]);

  const codes = ['first_solve'];
  if (hintsUsed === 0) codes.push('no_hints');
  if (user && user.streak_days >= 3) codes.push('streak_3');
  if (user && user.streak_days >= 7) codes.push('streak_7');
  if (isFirstBlood) codes.push('first_blood');

  // Check attempts for speed_demon badge (solved on very first attempt)
  if (challengeId) {
    const [[attemptRow]] = await conn.query(
      'SELECT COUNT(*) AS total FROM attempts WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );
    if (attemptRow && attemptRow.total === 1) {
      codes.push('speed_demon');
    }
  }

  // Check track completions by category
  const [trackRows] = await conn.query(
    `SELECT c.category_id, COUNT(*) AS count
     FROM completions comp
     JOIN challenges c ON comp.challenge_id = c.id
     WHERE comp.user_id = ?
     GROUP BY c.category_id`,
    [userId]
  );

  const trackCounts = {};
  for (const row of trackRows) {
    trackCounts[row.category_id] = row.count;
  }

  // Category 1: Linux
  const linuxCount = trackCounts[1] || 0;
  if (linuxCount >= 5) codes.push('linux_pioneer');
  if (linuxCount >= 10) codes.push('linux_master');

  // Category 2: Git
  const gitCount = trackCounts[2] || 0;
  if (gitCount >= 1) codes.push('git_apprentice');
  if (gitCount >= 3) codes.push('git_master');

  // Category 3: Docker
  const dockerCount = trackCounts[3] || 0;
  if (dockerCount >= 1) codes.push('docker_novice');
  if (dockerCount >= 3) codes.push('docker_master');

  const earned = [];
  for (const code of codes) {
    const [[badge]] = await conn.query('SELECT id, name FROM badges WHERE code = ?', [code]);
    if (!badge) continue;
    const [result] = await conn.query(
      'INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
      [userId, badge.id]
    );
    if (result.affectedRows === 1) earned.push(badge.name);
  }
  return earned;
}

module.exports = { levelInfo, awardBadges };