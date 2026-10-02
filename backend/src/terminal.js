const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const { docker, containerName } = require('./challengeManager');

function send(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

function attachTerminal(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws/terminal',
    maxPayload: 64 * 1024,
  });

  wss.on('connection', (ws) => {
    let stream = null;
    let exec = null;
    let authenticating = false;

    const authTimer = setTimeout(() => {
      if (!stream) ws.close(1008, 'auth timeout');
    }, 5000);

    ws.on('error', console.error);

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      // Step 1: the first valid message must be "auth"
      if (!stream) {
        if (msg.type !== 'auth' || authenticating) return;
        authenticating = true;

        try {
          const user = jwt.verify(msg.token, process.env.JWT_SECRET);
          const challengeId = Number(msg.challengeId);
          if (!Number.isInteger(challengeId)) throw new Error('bad challenge id');

          const container = docker.getContainer(containerName(user.id, challengeId));
          const info = await container.inspect();
          if (!info.State.Running) throw new Error('challenge is not running');

          exec = await container.exec({
            Cmd: ['/bin/bash'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
          });
          stream = await exec.start({ hijack: true, stdin: true, Tty: true });

          stream.on('data', (chunk) => send(ws, { type: 'output', data: chunk.toString() }));
          stream.on('end', () => ws.close());
          send(ws, { type: 'ready' });
        } catch (err) {
          authenticating = false;
          send(ws, { type: 'error', message: 'could not open terminal' });
          ws.close(1008, 'rejected');
        }
        return;
      }

      // Step 2: after auth, accept input and resize
      if (msg.type === 'input' && typeof msg.data === 'string') {
        stream.write(msg.data);
      } else if (msg.type === 'resize') {
        const cols = Math.min(Math.max(Number(msg.cols) || 80, 1), 500);
        const rows = Math.min(Math.max(Number(msg.rows) || 24, 1), 200);
        exec.resize({ w: cols, h: rows }).catch(() => {});
      }
    });

    ws.on('close', () => {
      clearTimeout(authTimer);
      if (stream) stream.end();
    });
  });
}

module.exports = attachTerminal;