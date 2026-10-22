const path = require('path');
const CHALLENGE_VFS = {
  1: {
    files: {
      '.secret_flag.txt': 'CTFQUEST{h1dd3n_d0t_f1l3_unc0v3r3d}\n',
      'welcome.txt': 'Welcome to CTFQuest! Use "ls -a" to find hidden files.\n',
    },
    hidden: ['.secret_flag.txt'],
  },
  2: {
    files: {
      'projects/alpha/notes/ideas.txt': 'just notes\n',
      'projects/beta/archive/secret.txt': 'CTFQUEST{f1nd_c0mm4nd_p4th_tr4v3rs3r}\n',
      'documents/todo.txt': 'nothing here\n',
    },
    hidden: [],
  },
  3: {
    files: {
      'secret flag file.txt': 'CTFQUEST{qu0t1ng_sp4c3s_1n_f1l3n4m3s}\n',
    },
    hidden: [],
  },
  4: {
    files: {
      '--flag.txt': 'CTFQUEST{d4sh_f1l3n4m3s_n33d_d0t_sl4sh}\n',
    },
    hidden: [],
  },
  5: {
    files: {
      'data/sample_1.dat': 'dummy data\n',
      'data/target.dat': 'CTFQUEST{f1nd_by_s1z3_1033_byt3s}\n' + 'X'.repeat(999),
    },
    hidden: [],
  },
  6: {
    files: {
      'haystack.txt': Array.from({ length: 300 }, (_, i) =>
        i === 142
          ? 'FLAG: CTFQUEST{gr3p_1s_4lw4ys_y0ur_fr13nd}'
          : `LOG_ENTRY ${String(i).padStart(4, '0')}: status=ok code=0`
      ).join('\n') + '\n',
    },
    hidden: [],
  },
  7: {
    files: {
      'items.txt': 'kernel_panic\nkernel_panic\nCTFQUEST{un1qu3_l1n3s_w1th_s0rt_un1q}\nnull_pointer\nnull_pointer\n',
    },
    hidden: [],
  },
  8: {
    files: {
      'log.txt': 'Host node-01 healthy\nsEcReT_kEy=CTFQUEST{c4s3_1ns3ns1t1v3_gr3p_m4st3r}\nHost node-02 healthy\n',
    },
    hidden: [],
  },
  9: {
    files: {
      'entries.txt': Array.from({ length: 2500 }, (_, i) =>
        i === 2449 ? 'CTFQUEST{s3d_pr1nt_sp3c1f1c_l1n3_2450}' : `Entry number ${i + 1} data record`
      ).join('\n') + '\n',
    },
    hidden: [],
  },
  10: {
    files: {
      'system.log': '[NORMAL] metric check 1 passed\n[SECURITY_ALERT] CTFQUEST{1nv3rt_m4tch_gr3p_v_fl4g}\n[NORMAL] metric check 2 passed\n',
    },
    hidden: [],
  },
  30: {
    files: {
      'encoded.b64': Buffer.from('CTFQUEST{b4s364_d3c0d1ng_1s_34sy}\n').toString('base64') + '\n',
    },
    hidden: [],
  },
};

function createMockSession(challengeId, ws) {
  const vfs = CHALLENGE_VFS[challengeId] || {
    files: {
      'flag.txt': `CTFQUEST{level_${challengeId}_flag_solved}\n`,
      'notes.txt': `Environment running in cloud sandbox for challenge #${challengeId}.\n`,
    },
    hidden: [],
  };

  let currentDir = '/home/player';
  let inputBuffer = '';
  const prompt = '\r\n\x1b[1;32mplayer@ctfquest\x1b[0m:\x1b[1;34m~\x1b[0m$ ';

  function sendOutput(data) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  }

  // Welcome banner
  sendOutput(
    '\r\n\x1b[1;36m=====================================================\x1b[0m\r\n' +
    '\x1b[1;32m  CTFQuest Cloud Sandbox Terminal (Active)\x1b[0m\r\n' +
    `\x1b[0;90m  Challenge #${challengeId} ready. Type 'help' or commands to begin.\x1b[0m\r\n` +
    '\x1b[1;36m=====================================================\x1b[0m\r\n' +
    prompt
  );

  function executeCommand(cmdLine) {
    const raw = cmdLine.trim();
    if (!raw) {
      sendOutput(prompt);
      return;
    }

    const parts = raw.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'clear':
        sendOutput('\x1b[2J\x1b[H' + prompt);
        return;

      case 'help':
        sendOutput(
          '\r\nAvailable commands in this shell:\r\n' +
          '  ls [-a|-la]     List files (including hidden)\r\n' +
          '  cat <file>      Display file contents\r\n' +
          '  pwd             Print current working directory\r\n' +
          '  cd <dir>        Change directory\r\n' +
          '  grep <pat> <f>  Search pattern in file\r\n' +
          '  find <path>     Find files\r\n' +
          '  base64 -d <f>   Decode base64 file\r\n' +
          '  submit <flag>   Verify and submit flag\r\n' +
          '  help, clear     Shell utilities\r\n'
        );
        break;

      case 'pwd':
        sendOutput(`\r\n${currentDir}\r\n`);
        break;

      case 'ls': {
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');

        const fileKeys = Object.keys(vfs.files);
        const topLevel = new Set();

        for (const f of fileKeys) {
          const firstPart = f.split('/')[0];
          topLevel.add(firstPart);
        }

        const entries = Array.from(topLevel).filter((item) => {
          if (showAll) return true;
          return !item.startsWith('.');
        });

        if (showAll) {
          entries.unshift('.', '..');
        }

        if (showLong) {
          sendOutput('\r\ntotal ' + (entries.length * 4) + '\r\n');
          for (const e of entries) {
            const isDir = !e.includes('.') || e === '.' || e === '..';
            const perm = isDir ? 'drwxr-xr-x 2 player player 4096 Oct 22 12:00 ' : '-rw-r--r-- 1 player player 1024 Oct 22 12:00 ';
            sendOutput(`${perm}${e}\r\n`);
          }
        } else {
          sendOutput('\r\n' + entries.join('  ') + '\r\n');
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          sendOutput('\r\ncat: missing file operand\r\n');
          break;
        }
        const target = args[0].replace(/^\.\//, '').replace(/^"|"$/g, '');
        // Search matching file
        let match = vfs.files[target];
        if (!match) {
          const found = Object.keys(vfs.files).find((k) => k.endsWith(target));
          if (found) match = vfs.files[found];
        }

        if (match !== undefined) {
          const formatted = match.replace(/\n/g, '\r\n');
          sendOutput(`\r\n${formatted}`);
        } else {
          sendOutput(`\r\ncat: ${target}: No such file or directory\r\n`);
        }
        break;
      }

      case 'grep': {
        const pattern = args[0] ? args[0].replace(/-i|-v/g, '').trim() : '';
        const targetFile = args[args.length - 1];
        const ignoreCase = args.includes('-i');
        const invert = args.includes('-v');

        const content = vfs.files[targetFile] || Object.values(vfs.files)[0] || '';
        const lines = content.split('\n');
        const matching = lines.filter((line) => {
          let testLine = ignoreCase ? line.toLowerCase() : line;
          let testPattern = ignoreCase ? pattern.toLowerCase() : pattern;
          const has = testLine.includes(testPattern);
          return invert ? !has : has;
        });

        sendOutput('\r\n' + matching.slice(0, 10).join('\r\n') + '\r\n');
        break;
      }

      case 'find': {
        const allPaths = Object.keys(vfs.files).map((p) => `./${p}`);
        sendOutput('\r\n.\r\n' + allPaths.join('\r\n') + '\r\n');
        break;
      }

      case 'base64': {
        const targetFile = args[args.length - 1];
        const content = vfs.files[targetFile];
        if (content) {
          try {
            const decoded = Buffer.from(content.trim(), 'base64').toString('utf-8');
            sendOutput(`\r\n${decoded.replace(/\n/g, '\r\n')}`);
          } catch {
            sendOutput('\r\nbase64: invalid input\r\n');
          }
        } else {
          sendOutput(`\r\nbase64: ${targetFile}: No such file or directory\r\n`);
        }
        break;
      }

      case 'submit': {
        const flag = args[0];
        if (!flag) {
          sendOutput('\r\nUsage: submit <FLAG>\r\n');
        } else {
          // Output the auto-submit marker so frontend detects it automatically
          sendOutput(`\r\n[CTFQUEST_SUBMIT:${flag}]\r\nSubmitting ${flag}...\r\n`);
        }
        break;
      }

      default:
        sendOutput(`\r\nbash: ${cmd}: command not found. Type 'help' for available commands.\r\n`);
        break;
    }

    sendOutput(prompt);
  }

  return {
    handleInput(data) {
      for (let i = 0; i < data.length; i++) {
        const char = data[i];

        // Enter key
        if (char === '\r' || char === '\n') {
          const cmd = inputBuffer;
          inputBuffer = '';
          executeCommand(cmd);
        }
        // Backspace
        else if (char === '\x7f' || char === '\b') {
          if (inputBuffer.length > 0) {
            inputBuffer = inputBuffer.slice(0, -1);
            sendOutput('\b \b');
          }
        }
        // Ctrl+C
        else if (char === '\x03') {
          inputBuffer = '';
          sendOutput('^C' + prompt);
        }
        // Tab key auto-completion (\t = 0x09)
        else if (char === '\t' || char === '\x09') {
          const knownCommands = ['cat', 'clear', 'cd', 'echo', 'find', 'grep', 'help', 'ls', 'pwd', 'submit', 'base64', 'rev', 'whoami', 'id'];
          const fileList = Object.keys(vfs.files);

          const parts = inputBuffer.split(/\s+/);
          if (parts.length <= 1) {
            // Auto-complete command
            const partial = parts[0] || '';
            const matches = knownCommands.filter((c) => c.startsWith(partial));
            if (matches.length === 1) {
              const completion = matches[0].slice(partial.length) + ' ';
              inputBuffer += completion;
              sendOutput(completion);
            } else if (matches.length > 1) {
              sendOutput('\r\n' + matches.join('  ') + '\r\n' + prompt + inputBuffer);
            }
          } else {
            // Auto-complete filename argument
            const partial = parts[parts.length - 1];
            const cleanPartial = partial.replace(/^\.\//, '');
            const matches = fileList.filter((f) => f.startsWith(cleanPartial) || path.basename(f).startsWith(cleanPartial));

            if (matches.length === 1) {
              const full = matches[0];
              const remainder = full.slice(cleanPartial.length) + ' ';
              inputBuffer += remainder;
              sendOutput(remainder);
            } else if (matches.length > 1) {
              sendOutput('\r\n' + matches.join('  ') + '\r\n' + prompt + inputBuffer);
            }
          }
        }
        // Normal printable characters
        else if (char >= ' ' && char <= '~') {
          inputBuffer += char;
          sendOutput(char);
        }
      }
    },
    destroy() {},
  };
}

module.exports = {
  createMockSession,
};
