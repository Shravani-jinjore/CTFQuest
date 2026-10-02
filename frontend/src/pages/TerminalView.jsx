import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

const WS_URL = 'ws://localhost:5000/ws/terminal';

function TerminalView({ challengeId }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({ cols: 80, rows: 24, cursorBlink: true });
    term.open(boxRef.current);

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'auth',
        token: localStorage.getItem('token'),
        challengeId: Number(challengeId),
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'output') {
        term.write(msg.data);
      } else if (msg.type === 'ready') {
        ws.send(JSON.stringify({ type: 'resize', cols: 80, rows: 24 }));
        term.focus();
      } else if (msg.type === 'error') {
        term.write(`\r\n[error] ${msg.message}\r\n`);
      }
    };

    ws.onclose = () => term.write('\r\n[disconnected]\r\n');

    const sub = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    return () => {
      sub.dispose();
      ws.close();
      term.dispose();
    };
  }, [challengeId]);

  return <div ref={boxRef} />;
}

export default TerminalView;