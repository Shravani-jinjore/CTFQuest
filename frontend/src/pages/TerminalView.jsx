import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

import { WS_URL } from '../config';

function TerminalView({ challengeId, onAutoSubmit }) {
  const boxRef = useRef(null);
  const submittedRef = useRef(new Set());
  const onAutoSubmitRef = useRef(onAutoSubmit);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  useEffect(() => {
    submittedRef.current.clear();
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

    const ws = new WebSocket(WS_URL);

    // Ctrl+C copies if text is selected (otherwise it interrupts), Ctrl+V pastes
    term.attachCustomKeyEventHandler((e) => {
      if (e.type !== 'keydown') return true;
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key;

      if (ctrl && key.toLowerCase() === 'c' && term.hasSelection()) {
        navigator.clipboard.writeText(term.getSelection()).catch(() => {});
        return false;
      }
      if (ctrl && key.toLowerCase() === 'v') {
        e.preventDefault();
        navigator.clipboard.readText().then((t) => term.paste(t)).catch(() => {});
        return false;
      }

      // PageUp / Up Arrow history navigation
      if (key === 'PageUp') {
        e.preventDefault();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data: '\x1b[A' }));
        }
        return false;
      }

      // PageDown / Down Arrow history navigation
      if (key === 'PageDown') {
        e.preventDefault();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data: '\x1b[B' }));
        }
        return false;
      }

      // Prevent Tab key from losing browser focus
      if (key === 'Tab') {
        e.preventDefault();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data: '\t' }));
        }
        return false;
      }

      return true;
    });

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
        if (onAutoSubmitRef.current && typeof msg.data === 'string') {
          const match = msg.data.match(/\[CTFQUEST_SUBMIT:(.+?)\]/);
          if (match && match[1]) {
            const rawFlag = match[1].trim();
            if (!submittedRef.current.has(rawFlag)) {
              submittedRef.current.add(rawFlag);
              term.write('\r\n\x1b[33m[CTFQuest] Submitting flag to server...\x1b[0m\r\n');
              onAutoSubmitRef.current(rawFlag);
            }
          }
        }
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