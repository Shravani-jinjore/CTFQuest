const XP_PER_LEVEL = 100;

function levelInfo(xp) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xp_into_level: xp % XP_PER_LEVEL,
    xp_per_level: XP_PER_LEVEL,
  };
}

module.exports = { levelInfo };