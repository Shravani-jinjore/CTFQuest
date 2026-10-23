const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const DATABASE_URL = 'mysql://3qCmEsrLksmAGjk.root:U9a9FwssBymLsQLb@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/ctfquest';

async function seed() {
  console.log('Connecting to TiDB Cloud database...');
  const connection = await mysql.createConnection({
    uri: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  console.log('Connected! 🚀');

  // 1. Populate Learning Content
  console.log('\n--- 1. Populating Learning Content (885 lines of lessons) ---');
  const learningSqlPath = path.join(__dirname, '../backend/sql/learning_content.sql');
  if (fs.existsSync(learningSqlPath)) {
    const learningSql = fs.readFileSync(learningSqlPath, 'utf8');
    await connection.query(learningSql);
    console.log('✓ Learning content seeded successfully!');
  }

  // 2. Populate 52 Challenges
  console.log('\n--- 2. Populating All 52 Challenges ---');
  const challengesPath = path.join(__dirname, 'all_challenges.json');
  const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

  const [categories] = await connection.query('SELECT id, name FROM categories');
  const catMap = {};
  for (const c of categories) {
    catMap[c.name.toLowerCase()] = c.id;
  }

  for (const c of challenges) {
    const catId = catMap[c.category.toLowerCase()] || catMap['linux'];
    const flagHash = crypto.createHash('sha256').update(c.flag).digest('hex');
    const image = `ctfquest/${c.slug}`;

    // Check if challenge exists
    const [existing] = await connection.query(
      'SELECT id FROM challenges WHERE id = ? OR title = ?',
      [c.id, c.title]
    );

    let challengeId = c.id;

    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO challenges (id, category_id, title, description, difficulty, xp_reward, flag_hash, docker_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, catId, c.title, c.description, c.difficulty, c.xp, flagHash, image]
      );
      console.log(`+ Added Level #${c.id}: ${c.title} (${c.category})`);
    } else {
      challengeId = existing[0].id;
      await connection.query(
        `UPDATE challenges
         SET category_id = ?, title = ?, description = ?, difficulty = ?, xp_reward = ?, flag_hash = ?, docker_image = ?
         WHERE id = ?`,
        [catId, c.title, c.description, c.difficulty, c.xp, flagHash, image, challengeId]
      );
      console.log(`~ Updated Level #${challengeId}: ${c.title}`);
    }

    // Add hints
    if (Array.isArray(c.hints)) {
      for (let i = 0; i < c.hints.length; i++) {
        const level = i + 1;
        const hintContent = c.hints[i];
        await connection.query(
          `INSERT IGNORE INTO hints (challenge_id, level, content) VALUES (?, ?, ?)`,
          [challengeId, level, hintContent]
        );
      }
    }
  }

  const [totalChallenges] = await connection.query('SELECT COUNT(*) as count FROM challenges');
  const [totalLessons] = await connection.query('SELECT COUNT(*) as count FROM lessons');
  const [totalTopics] = await connection.query('SELECT COUNT(*) as count FROM topics');

  console.log('\n========================================');
  console.log(`🎉 ALL DONE! Database status:`);
  console.log(`   - Challenges: ${totalChallenges[0].count} / 52`);
  console.log(`   - Topics:     ${totalTopics[0].count}`);
  console.log(`   - Lessons:    ${totalLessons[0].count}`);
  console.log('========================================');

  await connection.end();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
