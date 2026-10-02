const Docker = require('dockerode');

const docker = new Docker();

function containerName(userId, challengeId) {
  return `ctfquest-u${userId}-c${challengeId}`;
}

async function stopChallenge(userId, challengeId) {
  const container = docker.getContainer(containerName(userId, challengeId));
  try {
    await container.remove({ force: true });
  } catch (err) {
    if (err.statusCode !== 404) throw err;
  }
}

async function startChallenge(userId, challengeId, image) {
  await stopChallenge(userId, challengeId);

  const container = await docker.createContainer({
    Image: image,
    name: containerName(userId, challengeId),
    Labels: { ctfquest: 'true' },
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
  return containerName(userId, challengeId);
}

module.exports = { startChallenge, stopChallenge };