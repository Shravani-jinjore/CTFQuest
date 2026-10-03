const Docker = require('dockerode');

const docker = new Docker();

const TIMEOUT_MS = (Number(process.env.CHALLENGE_TIMEOUT_MINUTES) || 30) * 60 * 1000;
const MAX_CONTAINERS_PER_USER = 2;
const timers = new Map();

function containerName(userId, challengeId) {
  return `ctfquest-u${userId}-c${challengeId}`;
}

async function stopChallenge(userId, challengeId) {
  const name = containerName(userId, challengeId);
  clearTimeout(timers.get(name));
  timers.delete(name);

  try {
    await docker.getContainer(name).remove({ force: true });
  } catch (err) {
    if (err.statusCode !== 404) throw err;
  }
}

async function startChallenge(userId, challengeId, image) {
  await stopChallenge(userId, challengeId);
  const name = containerName(userId, challengeId);

  const running = await docker.listContainers({
    all: true,
    filters: { label: [`ctfquest.user=${userId}`] },
  });
  if (running.length >= MAX_CONTAINERS_PER_USER) {
    const err = new Error('container limit reached');
    err.code = 'LIMIT';
    throw err;
  }

  const container = await docker.createContainer({
    Image: image,
    name,
    Labels: { ctfquest: 'true', 'ctfquest.user': String(userId) },
    HostConfig: {
      Memory: 128 * 1024 * 1024,
      NanoCpus: 500000000,
      PidsLimit: 64,
      NetworkMode: 'none',
      CapDrop: ['ALL'],
      SecurityOpt: ['no-new-privileges'],
      ReadonlyRootfs: true,
      Tmpfs: { '/tmp': '' },
    },
  });
  await container.start();

  const timer = setTimeout(() => {
    stopChallenge(userId, challengeId).catch(console.error);
  }, TIMEOUT_MS);
  timers.set(name, timer);

  return name;
}

async function cleanupAll() {
  const list = await docker.listContainers({
    all: true,
    filters: { label: ['ctfquest=true'] },
  });
  for (const info of list) {
    await docker.getContainer(info.Id).remove({ force: true });
  }
  return list.length;
}

module.exports = {
  startChallenge,
  stopChallenge,
  cleanupAll,
  TIMEOUT_MS,
  docker,
  containerName,
};