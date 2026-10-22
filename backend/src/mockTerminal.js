const path = require('path');

const CHALLENGE_VFS = {
  1: {
    files: {
      '.secret_flag.txt': 'CTFQUEST{h1dd3n_d0t_f1l3_unc0v3r3d}\n',
      'welcome.txt': 'Welcome to CTFQuest! Use "ls -a" to find hidden files.\n',
    },
  },
  2: {
    files: {
      'projects/alpha/notes/ideas.txt': 'just notes\n',
      'projects/beta/archive/secret.txt': 'CTFQUEST{f1nd_c0mm4nd_p4th_tr4v3rs3r}\n',
      'documents/todo.txt': 'nothing here\n',
    },
  },
  3: {
    files: {
      'secret flag file.txt': 'CTFQUEST{qu0t1ng_sp4c3s_1n_f1l3n4m3s}\n',
    },
  },
  4: {
    files: {
      '--flag.txt': 'CTFQUEST{d4sh_f1l3n4m3s_n33d_d0t_sl4sh}\n',
    },
  },
  5: {
    files: {
      'data/sample_1.dat': 'dummy data\n',
      'data/target.dat': 'CTFQUEST{f1nd_by_s1z3_1033_byt3s}\n' + 'X'.repeat(999),
    },
  },
  6: {
    files: {
      'haystack.txt': Array.from({ length: 300 }, (_, i) =>
        i === 142
          ? 'FLAG: CTFQUEST{gr3p_1s_4lw4ys_y0ur_fr13nd}'
          : `LOG_ENTRY ${String(i).padStart(4, '0')}: status=ok code=0`
      ).join('\n') + '\n',
    },
  },
  7: {
    files: {
      'items.txt': 'kernel_panic\nkernel_panic\nCTFQUEST{un1qu3_l1n3s_w1th_s0rt_un1q}\nnull_pointer\nnull_pointer\n',
    },
  },
  8: {
    files: {
      'log.txt': 'Host node-01 healthy\nsEcReT_kEy=CTFQUEST{c4s3_1ns3ns1t1v3_gr3p_m4st3r}\nHost node-02 healthy\n',
    },
  },
  9: {
    files: {
      'entries.txt': Array.from({ length: 2500 }, (_, i) =>
        i === 2449 ? 'CTFQUEST{s3d_pr1nt_sp3c1f1c_l1n3_2450}' : `Entry number ${i + 1} data record`
      ).join('\n') + '\n',
    },
  },
  10: {
    files: {
      'system.log': '[NORMAL] metric check 1 passed\n[SECURITY_ALERT] CTFQUEST{1nv3rt_m4tch_gr3p_v_fl4g}\n[NORMAL] metric check 2 passed\n',
    },
  },
  11: {
    files: {
      'reveal.sh': '#!/bin/bash\necho "CTFQUEST{3x3cut3_p3rm1ss10n_b4sh_run}"\n',
    },
  },
  13: {
    files: {
      '.bash_history': 'ls -la\ncd /var/log\ngrep -i alert syslog\nexport SECRET_TOKEN="CTFQUEST{b4sh_h1st0ry_l34ks_s3cr3ts}"\nexit\n',
    },
  },
  30: {
    files: {
      'encoded.b64': Buffer.from('CTFQUEST{b4s364_d3c0d1ng_1s_34sy}\n').toString('base64') + '\n',
    },
  },
};

function createMockSession(challengeId, ws) {
  const vfs = CHALLENGE_VFS[challengeId] || {
    files: {
      'flag.txt': `CTFQUEST{level_${challengeId}_flag_solved}\n`,
      'notes.txt': `Environment running in cloud sandbox for challenge #${challengeId}.\n`,
    },
  };

  // Build directory set from file paths
  const allDirectories = new Set(['', 'projects', 'projects/alpha', 'projects/alpha/notes', 'projects/beta', 'projects/beta/archive', 'documents', 'data']);
  for (const filePath of Object.keys(vfs.files)) {
    const parts = filePath.split('/');
    let cur = '';
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur ? `${cur}/${parts[i]}` : parts[i];
      allDirectories.add(cur);
    }
  }

  let relCwd = ''; // '' represents ~ (/home/player)
  let inputBuffer = '';

  function getPrompt() {
    const disp = relCwd ? `~/${relCwd}` : '~';
    return `\r\n\x1b[1;32mplayer@ctfquest\x1b[0m:\x1b[1;34m${disp}\x1b[0m$ `;
  }

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
    '\x1b[1;36m=====================================================\x1b[0m' +
    getPrompt()
  );

  function resolvePath(target) {
    if (!target || target === '~') return '';
    let combined = target.startsWith('/')
      ? target.replace(/^\/home\/player\/?/, '')
      : (relCwd ? `${relCwd}/${target}` : target);

    const segments = [];
    for (const part of combined.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') {
        segments.pop();
      } else {
        segments.push(part);
      }
    }
    return segments.join('/');
  }

  function getEntriesInDir(dirPath) {
    const entries = new Map(); // name -> 'dir' | 'file'
    const prefix = dirPath ? `${dirPath}/` : '';

    for (const d of allDirectories) {
      if (d && d !== dirPath && d.startsWith(prefix)) {
        const remainder = d.slice(prefix.length);
        if (!remainder.includes('/')) {
          entries.set(remainder, 'dir');
        }
      }
    }

    for (const f of Object.keys(vfs.files)) {
      if (f.startsWith(prefix)) {
        const remainder = f.slice(prefix.length);
        if (!remainder.includes('/')) {
          entries.set(remainder, 'file');
        }
      }
    }

    return entries;
  }

  function executeCommand(cmdLine) {
    const raw = cmdLine.trim();
    if (!raw) {
      sendOutput(getPrompt());
      return;
    }

    const parts = raw.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'clear':
        sendOutput('\x1b[2J\x1b[H' + getPrompt());
        return;

      case 'help':
        sendOutput(
          '\r\nAvailable commands in this shell:\r\n' +
          '  ls [-a|-la]     List files (including hidden)\r\n' +
          '  cd <dir>        Change working directory\r\n' +
          '  cat <file>      Display file contents\r\n' +
          '  pwd             Print current working directory\r\n' +
          '  find <path>     Find files recursively\r\n' +
          '  grep <pat> <f>  Search pattern in file\r\n' +
          '  base64 -d <f>   Decode base64 file\r\n' +
          '  submit <flag>   Verify and submit flag\r\n' +
          '  help, clear     Shell utilities\r\n'
        );
        break;

      case 'pwd': {
        const full = relCwd ? `/home/player/${relCwd}` : '/home/player';
        sendOutput(`\r\n${full}\r\n`);
        break;
      }

      case 'cd': {
        const target = args[0] || '~';
        const resolved = resolvePath(target);

        if (resolved === '' || allDirectories.has(resolved)) {
          relCwd = resolved;
          sendOutput('\r\n');
        } else {
          sendOutput(`\r\ncd: ${target}: No such file or directory\r\n`);
        }
        break;
      }

      case 'ls': {
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');

        const targetDir = args.find((a) => !a.startsWith('-')) || '';
        const effectiveDir = resolvePath(targetDir);

        const entriesMap = getEntriesInDir(effectiveDir);
        let names = Array.from(entriesMap.keys()).sort();

        if (!showAll) {
          names = names.filter((n) => !n.startsWith('.'));
        } else {
          names.unshift('.', '..');
        }

        if (names.length === 0) {
          sendOutput('\r\n');
          break;
        }

        if (showLong) {
          sendOutput('\r\ntotal ' + names.length * 4 + '\r\n');
          for (const name of names) {
            const isDir = name === '.' || name === '..' || entriesMap.get(name) === 'dir';
            const perm = isDir ? 'drwxr-xr-x 2 player player 4096 Oct 22 12:00 ' : '-rw-r--r-- 1 player player 1024 Oct 22 12:00 ';
            const color = isDir ? '\x1b[1;34m' : '';
            const reset = isDir ? '\x1b[0m' : '';
            sendOutput(`${perm}${color}${name}${reset}\r\n`);
          }
        } else {
          const colored = names.map((name) => {
            const isDir = name === '.' || name === '..' || entriesMap.get(name) === 'dir';
            return isDir ? `\x1b[1;34m${name}\x1b[0m` : name;
          });
          sendOutput('\r\n' + colored.join('  ') + '\r\n');
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          sendOutput('\r\ncat: missing file operand\r\n');
          break;
        }
        const target = resolvePath(args[0].replace(/^"|"$/g, ''));
        const content = vfs.files[target];

        if (content !== undefined) {
          sendOutput(`\r\n${content.replace(/\n/g, '\r\n')}`);
        } else {
          sendOutput(`\r\ncat: ${args[0]}: No such file or directory\r\n`);
        }
        break;
      }

      case 'grep': {
        const pattern = args[0] ? args[0].replace(/-i|-v/g, '').trim() : '';
        const targetArg = args[args.length - 1];
        const target = resolvePath(targetArg);
        const ignoreCase = args.includes('-i');
        const invert = args.includes('-v');

        const content = vfs.files[target];
        if (content === undefined) {
          sendOutput(`\r\ngrep: ${targetArg}: No such file or directory\r\n`);
          break;
        }

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
        const allPaths = ['.'];
        for (const d of allDirectories) {
          if (d) allPaths.push(`./${d}`);
        }
        for (const f of Object.keys(vfs.files)) {
          allPaths.push(`./${f}`);
        }
        sendOutput('\r\n' + allPaths.sort().join('\r\n') + '\r\n');
        break;
      }

      case 'base64': {
        const targetArg = args[args.length - 1];
        const target = resolvePath(targetArg);
        const content = vfs.files[target];
        if (content) {
          try {
            const decoded = Buffer.from(content.trim(), 'base64').toString('utf-8');
            sendOutput(`\r\n${decoded.replace(/\n/g, '\r\n')}`);
          } catch {
            sendOutput('\r\nbase64: invalid input\r\n');
          }
        } else {
          sendOutput(`\r\nbase64: ${targetArg}: No such file or directory\r\n`);
        }
        break;
      }

      case 'submit': {
        const flag = args[0];
        if (!flag) {
          sendOutput('\r\nUsage: submit <FLAG>\r\n');
        } else {
          sendOutput(`\r\n[CTFQUEST_SUBMIT:${flag}]\r\nSubmitting ${flag}...\r\n`);
        }
        break;
      }

      default:
        sendOutput(`\r\nbash: ${cmd}: command not found. Type 'help' for available commands.\r\n`);
        break;
    }

    sendOutput(getPrompt());
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
          sendOutput('^C' + getPrompt());
        }
        // Tab key auto-completion (\t = 0x09)
        else if (char === '\t' || char === '\x09') {
          const knownCommands = ['cat', 'clear', 'cd', 'echo', 'find', 'grep', 'help', 'ls', 'pwd', 'submit', 'base64', 'rev', 'whoami', 'id'];
          const entriesMap = getEntriesInDir(relCwd);

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
              sendOutput('\r\n' + matches.join('  ') + getPrompt() + inputBuffer);
            }
          } else {
            // Auto-complete path/filename
            const partial = parts[parts.length - 1];
            const cleanPartial = partial.replace(/^\.\//, '');

            const candidates = Array.from(entriesMap.entries()).map(([name, type]) => {
              return type === 'dir' ? `${name}/` : `${name} `;
            });

            const matches = candidates.filter((item) => item.startsWith(cleanPartial));

            if (matches.length === 1) {
              const match = matches[0];
              const remainder = match.slice(cleanPartial.length);
              inputBuffer += remainder;
              sendOutput(remainder);
            } else if (matches.length > 1) {
              // Find common prefix among matches
              let common = '';
              const first = matches[0];
              for (let ci = cleanPartial.length; ci < first.length; ci++) {
                if (matches.every((m) => m[ci] === first[ci])) {
                  common += first[ci];
                } else {
                  break;
                }
              }
              if (common) {
                inputBuffer += common;
                sendOutput(common);
              } else {
                sendOutput('\r\n' + matches.map((m) => m.trim()).join('  ') + getPrompt() + inputBuffer);
              }
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
