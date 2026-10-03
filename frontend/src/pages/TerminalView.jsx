import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

const WS_URL = 'ws://localhost:5000/ws/terminal';

function TerminalView({ challengeId }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cols: 80,
      rows: 20,
      cursorBlink: true,
      fontSize: 14,
      theme: { background: '#0b0d12' },
    });
    term.open(boxRef.current);

    // Copy: selecting text copies it automatically
    term.onSelectionChange(() => {
      const text = term.getSelection();
      if (text) navigator.clipboard.writeText(text).catch(() => {});
    });

    // Ctrl+C copies if text is selected (otherwise it interrupts), Ctrl+V pastes
    term.attachCustomKeyEventHandler((e) => {
      if (e.type !== 'keydown') return true;
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (ctrl && key === 'c' && term.hasSelection()) {
        navigator.clipboard.writeText(term.getSelection()).catch(() => {});
        return false;
      }
      if (ctrl && key === 'v') {
        e.preventDefault();
        navigator.clipboard.readText().then((t) => term.paste(t)).catch(() => {});
        return false;
      }
      return true;
    });

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
        ws.send(JSON.stringify({ type: 'resize', cols: 80, rows: 20 }));
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

  return <div ref={boxRef} className="terminal-box" />;
}

export default TerminalView;