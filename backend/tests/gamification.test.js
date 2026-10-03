const { levelInfo } = require('../src/gamification');

test('0 XP is level 1', () => {
  expect(levelInfo(0).level).toBe(1);
});

test('130 XP is level 2 with 30 XP into the level', () => {
  const info = levelInfo(130);
  expect(info.level).toBe(2);
  expect(info.xp_into_level).toBe(30);
});