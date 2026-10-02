const { startChallenge, stopChallenge } = require('./src/challengeManager');

async function main() {
  const name = await startChallenge(99, 1, 'ctfquest/linux-hidden-file');
  console.log('started', name);
  await new Promise((r) => setTimeout(r, 20000));
  await stopChallenge(99, 1);
  console.log('stopped');
}
main().catch(console.error);
