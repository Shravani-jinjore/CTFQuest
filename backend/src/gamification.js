const XP_PER_LEVEL = 100;

function levelInfo(xp) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xp_into_level: xp % XP_PER_LEVEL,
    xp_per_level: XP_PER_LEVEL,
  };
}

async function awardBadges(conn, userId, hintsUsed) {
  const [[user]] = await conn.query('SELECT streak_days FROM users WHERE id = ?', [userId]);

  const codes = ['first_solve'];
  if (hintsUsed === 0) codes.push('no_hints');
  if (user.streak_days >= 3) codes.push('streak_3');

  

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