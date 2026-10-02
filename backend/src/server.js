const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const app = require('./app');
const { cleanupAll } = require('./challengeManager');
const attachTerminal = require('./terminal');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`CTFQuest backend listening on http://localhost:${PORT}`);
  try {
    const removed = await cleanupAll();
    console.log(`Cleaned up ${removed} leftover challenge container(s)`);
  } catch (err) {
    console.error('Docker cleanup failed. Is Docker running?', err.message);
  }
});

attachTerminal(server);