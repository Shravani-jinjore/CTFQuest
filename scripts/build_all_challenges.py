#!/usr/bin/env python3
import hashlib
import json
import os
import subprocess
import sys
import tempfile

CHALLENGES = [
    # Track 1: Linux Basics & Navigation (1-10)
    {
        "id": 1,
        "slug": "linux-01-hidden-file",
        "category": "Linux",
        "title": "Hidden File",
        "difficulty": "easy",
        "xp": 50,
        "description": "A secret file is hiding inside your home directory. Regular 'ls' will not show it. Find it, read it, and submit the flag.",
        "flag": "CTFQUEST{h1dd3n_d0t_f1l3_unc0v3r3d}",
        "hints": [
            "In Linux, any filename starting with a dot '.' is considered hidden.",
            "The 'ls' command has an option to show all files, including hidden ones.",
            "Run 'ls -a' to see all files, then 'cat' the hidden secret file."
        ],
        "setup": """
echo "$FLAG" > /home/player/.secret_flag.txt
chmod 444 /home/player/.secret_flag.txt
"""
    },
    {
        "id": 2,
        "slug": "linux-02-find-the-file",
        "category": "Linux",
        "title": "Find the File",
        "difficulty": "easy",
        "xp": 50,
        "description": "A file named 'secret.txt' is hidden deep inside nested directories. Use the 'find' command to locate and read it.",
        "flag": "CTFQUEST{f1nd_c0mm4nd_p4th_tr4v3rs3r}",
        "hints": [
            "Manual directory browsing takes too long. Linux provides 'find' for searching recursively.",
            "Use 'find . -name \"secret.txt\"' to search starting from your current folder.",
            "Once find prints the path, use 'cat' on that path to read the flag."
        ],
        "setup": """
mkdir -p /home/player/projects/alpha/notes /home/player/projects/beta/archive /home/player/documents
echo "just notes" > /home/player/projects/alpha/notes/ideas.txt
echo "nothing here" > /home/player/documents/todo.txt
echo "$FLAG" > /home/player/projects/beta/archive/secret.txt
chmod 444 /home/player/projects/beta/archive/secret.txt
"""
    },
    {
        "id": 3,
        "slug": "linux-03-spaces-in-name",
        "category": "Linux",
        "title": "Spaces in the Name",
        "difficulty": "easy",
        "xp": 50,
        "description": "The secret file is named 'secret flag file.txt'. In shell commands, spaces separate arguments unless handled properly. Read the file!",
        "flag": "CTFQUEST{qu0t1ng_sp4c3s_1n_f1l3n4m3s}",
        "hints": [
            "Spaces break command line arguments into multiple words.",
            "You can wrap the entire filename in quotes or escape every space with a backslash.",
            "Try: cat \"secret flag file.txt\" or cat secret\\ flag\\ file.txt"
        ],
        "setup": """
echo "$FLAG" > "/home/player/secret flag file.txt"
chmod 444 "/home/player/secret flag file.txt"
"""
    },
    {
        "id": 4,
        "slug": "linux-04-leading-dashes",
        "category": "Linux",
        "title": "Leading Dashes",
        "difficulty": "easy",
        "xp": 50,
        "description": "There is a file named '--flag.txt' in your home folder. If you run 'cat --flag.txt', cat thinks it is a command-line flag! How can you open it?",
        "flag": "CTFQUEST{d4sh_f1l3n4m3s_n33d_d0t_sl4sh}",
        "hints": [
            "Programs parse arguments starting with '-' as configuration options.",
            "You can give an explicit relative path using './' to stop option parsing.",
            "Try: cat ./--flag.txt or cat -- --flag.txt"
        ],
        "setup": """
echo "$FLAG" > /home/player/--flag.txt
chmod 444 /home/player/--flag.txt
"""
    },
    {
        "id": 5,
        "slug": "linux-05-human-readable",
        "category": "Linux",
        "title": "Human Readable File",
        "difficulty": "easy",
        "xp": 50,
        "description": "The 'data/' directory contains many dummy files. Exactly one file is 1033 bytes in size. Find and read that specific file.",
        "flag": "CTFQUEST{f1nd_by_s1z3_1033_byt3s}",
        "hints": [
            "The 'find' command can filter files by exact byte size.",
            "Use the '-size' parameter with 'c' to specify size in bytes.",
            "Try: find data -type f -size 1033c"
        ],
        "setup": """
mkdir -p /home/player/data
for i in $(seq 1 20); do
  head -c $((600 + i * 40)) /dev/urandom | base64 | head -c $((600 + i * 20)) > "/home/player/data/sample_$i.dat"
done
python3 -c "
import sys
flag = sys.argv[1]
padding = 1033 - len(flag) - 1
with open('/home/player/data/target.dat', 'w') as f:
    f.write(flag + '\\n' + 'X' * padding)
" "$FLAG"
chmod -R 444 /home/player/data
"""
    },
    {
        "id": 6,
        "slug": "linux-06-grep-needle",
        "category": "Linux",
        "title": "Needle in a Haystack",
        "difficulty": "easy",
        "xp": 50,
        "description": "The file 'haystack.txt' contains thousands of log lines. Exactly one line starts with 'FLAG:'. Use 'grep' to filter out the noise.",
        "flag": "CTFQUEST{gr3p_1s_4lw4ys_y0ur_fr13nd}",
        "hints": [
            "Don't read the whole file manually. Use 'grep' to search text.",
            "Look for lines matching the pattern 'FLAG:'.",
            "Try: grep \"FLAG:\" haystack.txt"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/haystack.txt', 'w') as f:
    for i in range(1, 3001):
        if i == 1729:
            f.write(f'FLAG: {flag}\\n')
        else:
            f.write(f'LOG_ENTRY {i:04d}: status=ok code=0 hash=0x{i*31:08x}\\n')
" "$FLAG"
chmod 444 /home/player/haystack.txt
"""
    },
    {
        "id": 7,
        "slug": "linux-07-unique-line",
        "category": "Linux",
        "title": "Unique Occurrence",
        "difficulty": "easy",
        "xp": 50,
        "description": "In 'items.txt', every line is repeated multiple times, except for one unique line which contains the flag. Find the line that appears only once.",
        "flag": "CTFQUEST{un1qu3_l1n3s_w1th_s0rt_un1q}",
        "hints": [
            "The 'uniq' command filters duplicate lines, but requires sorted input.",
            "Pipe the sorted file into 'uniq -u' to display only unique lines.",
            "Try: sort items.txt | uniq -u"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/items.txt', 'w') as f:
    items = ['kernel_panic', 'segmentation_fault', 'null_pointer', 'stack_overflow', 'buffer_underrun']
    for item in items:
        for _ in range(7):
            f.write(f'{item}\\n')
    f.write(f'{flag}\\n')
" "$FLAG"
chmod 444 /home/player/items.txt
"""
    },
    {
        "id": 8,
        "slug": "linux-08-case-hunt",
        "category": "Linux",
        "title": "Case Insensitive Search",
        "difficulty": "easy",
        "xp": 50,
        "description": "A secret key was logged in 'log.txt', but the letters have mixed casing (like 'sEcReT_kEy'). Search without worrying about case.",
        "flag": "CTFQUEST{c4s3_1ns3ns1t1v3_gr3p_m4st3r}",
        "hints": [
            "By default, grep is case-sensitive.",
            "The '-i' flag tells grep to ignore case distinctions.",
            "Try: grep -i \"secret_key\" log.txt"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/log.txt', 'w') as f:
    for i in range(1, 100):
        f.write(f'Host node-{i:02d} heartbeat healthy\\n')
    f.write(f'sEcReT_kEy={flag}\\n')
    for i in range(101, 200):
        f.write(f'Host node-{i:02d} heartbeat healthy\\n')
" "$FLAG"
chmod 444 /home/player/log.txt
"""
    },
    {
        "id": 9,
        "slug": "linux-09-line-counting",
        "category": "Linux",
        "title": "Line Counting & Extraction",
        "difficulty": "easy",
        "xp": 50,
        "description": "The file 'entries.txt' has 5,000 lines. The flag is located exactly at line number 2450. Extract that exact line.",
        "flag": "CTFQUEST{s3d_pr1nt_sp3c1f1c_l1n3_2450}",
        "hints": [
            "You can use 'sed' to print a specific line number.",
            "Or combine 'head' and 'tail' to view a slice.",
            "Try: sed -n '2450p' entries.txt"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/entries.txt', 'w') as f:
    for i in range(1, 5001):
        if i == 2450:
            f.write(f'{flag}\\n')
        else:
            f.write(f'Entry number {i} data record\\n')
" "$FLAG"
chmod 444 /home/player/entries.txt
"""
    },
    {
        "id": 10,
        "slug": "linux-10-invert-search",
        "category": "Linux",
        "title": "Invert Search",
        "difficulty": "easy",
        "xp": 50,
        "description": "'system.log' is overwhelmed with normal heartbeats tagged '[NORMAL]'. Exactly one line has an anomaly that does NOT contain '[NORMAL]'. Filter out the normal lines!",
        "flag": "CTFQUEST{1nv3rt_m4tch_gr3p_v_fl4g}",
        "hints": [
            "You want to invert the search to match lines that do NOT contain a pattern.",
            "The '-v' flag in grep inverts the match.",
            "Try: grep -v \"\\[NORMAL\\]\" system.log"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/system.log', 'w') as f:
    for i in range(1, 1500):
        if i == 842:
            f.write(f'[SECURITY_ALERT] {flag}\\n')
        else:
            f.write(f'[NORMAL] metric check {i} passed\\n')
" "$FLAG"
chmod 444 /home/player/system.log
"""
    },

    # Track 2: Linux Permissions & Environment (11-17)
    {
        "id": 11,
        "slug": "linux-11-run-the-script",
        "category": "Linux",
        "title": "Run the Script",
        "difficulty": "easy",
        "xp": 50,
        "description": "There is a script called 'reveal.sh' in your home directory, but its execute permission is missing. Run it to get the flag.",
        "flag": "CTFQUEST{3x3cut3_p3rm1ss10n_b4sh_run}",
        "hints": [
            "A script cannot be executed directly without '+x' permission.",
            "You can grant execute permission using 'chmod +x', or pass it directly to an interpreter like 'bash'.",
            "Try: bash reveal.sh or chmod +x reveal.sh && ./reveal.sh"
        ],
        "setup": """
printf '#!/bin/bash\\necho "%s"\\n' "$FLAG" > /home/player/reveal.sh
chmod 644 /home/player/reveal.sh
"""
    },
    {
        "id": 12,
        "slug": "linux-12-env-hunt",
        "category": "Linux",
        "title": "Environment Variable Hunt",
        "difficulty": "easy",
        "xp": 50,
        "description": "A secret access key is stored in an environment variable named 'VAULT_ACCESS_TOKEN'. Read it from your shell environment.",
        "flag": "CTFQUEST{3nv_v4rs_4r3_3v3ryw3r3}",
        "hints": [
            "Environment variables are available to all running processes.",
            "You can view environment variables using 'env' or echo the specific variable.",
            "Try: echo $VAULT_ACCESS_TOKEN or env | grep VAULT"
        ],
        "setup": """
echo "export VAULT_ACCESS_TOKEN=\"$FLAG\"" >> /home/player/.bashrc
"""
    },
    {
        "id": 13,
        "slug": "linux-13-bash-history",
        "category": "Linux",
        "title": "Bash History Secrets",
        "difficulty": "easy",
        "xp": 50,
        "description": "An operator typed a secret command into this terminal session in the past. Find what they typed in their bash history.",
        "flag": "CTFQUEST{b4sh_h1st0ry_l34ks_s3cr3ts}",
        "hints": [
            "Bash saves executed commands to a history file in the user's home folder.",
            "Check for '.bash_history'.",
            "Try: cat ~/.bash_history"
        ],
        "setup": """
printf 'ls -la\\ncd /var/log\\ngrep -i alert syslog\\nexport SECRET_TOKEN="%s"\\nexit\\n' "$FLAG" > /home/player/.bash_history
chmod 644 /home/player/.bash_history
"""
    },
    {
        "id": 14,
        "slug": "linux-14-suid-binary",
        "category": "Linux",
        "title": "SUID Binary Privilege",
        "difficulty": "medium",
        "xp": 75,
        "description": "The secret file '/root/secret/flag.txt' is readable only by root. However, an administrative binary '/usr/local/bin/readflag' has the SUID bit set. Use it!",
        "flag": "CTFQUEST{su1d_b1t_pr1v1l3g3_3sc4l4t10n}",
        "hints": [
            "SUID (Set User ID) binaries run with the permissions of the file owner (root).",
            "You can find SUID binaries with 'find / -perm -4000 2>/dev/null'.",
            "Run '/usr/local/bin/readflag' directly."
        ],
        "setup": """
mkdir -p /root/secret
echo "$FLAG" > /root/secret/flag.txt
chmod 400 /root/secret/flag.txt
cat << 'EOF' > /tmp/readflag.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
int main() {
    setuid(0);
    FILE *f = fopen("/root/secret/flag.txt", "r");
    if (!f) { perror("fopen"); return 1; }
    char buf[256];
    if (fgets(buf, sizeof(buf), f)) printf("%s", buf);
    fclose(f);
    return 0;
}
EOF
gcc /tmp/readflag.c -o /usr/local/bin/readflag
rm -f /tmp/readflag.c
chmod 4755 /usr/local/bin/readflag
"""
    },
    {
        "id": 15,
        "slug": "linux-15-group-access",
        "category": "Linux",
        "title": "Group Permissions",
        "difficulty": "medium",
        "xp": 75,
        "description": "A protected file '/opt/classified/secret.txt' belongs to the 'operators' group. Check if your user is a member of this group and read the file.",
        "flag": "CTFQUEST{l1nux_gr0up_p3rm1ss10ns_0k}",
        "hints": [
            "Check which groups you belong to with 'id' or 'groups'.",
            "Examine file permissions with 'ls -l /opt/classified/secret.txt'.",
            "Read the file with 'cat /opt/classified/secret.txt'."
        ],
        "setup": """
groupadd operators
usermod -aG operators player
mkdir -p /opt/classified
echo "$FLAG" > /opt/classified/secret.txt
chown root:operators /opt/classified/secret.txt
chmod 440 /opt/classified/secret.txt
"""
    },
    {
        "id": 16,
        "slug": "linux-16-readonly-workspace",
        "category": "Linux",
        "title": "Read-Only Escape",
        "difficulty": "medium",
        "xp": 75,
        "description": "Your home directory is read-only. A generator script 'generate.sh' writes the flag to a directory specified as its argument. Pass a writable folder like /tmp!",
        "flag": "CTFQUEST{wr1t3_t0_tmp_wh3n_r0_h0m3}",
        "hints": [
            "When home is read-only, Linux provides temporary writable storage in '/tmp'.",
            "Inspect 'generate.sh' to see what parameter it expects.",
            "Run: ./generate.sh /tmp and then cat /tmp/flag.txt"
        ],
        "setup": """
cat << 'EOF' > /home/player/generate.sh
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./generate.sh <output_dir>"
  exit 1
fi
echo "FLAG_PLACEHOLDER" > "$1/flag.txt"
echo "Flag generated at $1/flag.txt"
EOF
sed -i "s|FLAG_PLACEHOLDER|$FLAG|g" /home/player/generate.sh
chmod 755 /home/player/generate.sh
"""
    },
    {
        "id": 17,
        "slug": "linux-17-file-octal",
        "category": "Linux",
        "title": "File Mode Octal Permission",
        "difficulty": "medium",
        "xp": 75,
        "description": "Inside 'vault/', there are 10 files. Exactly one file has octal permission 754 (rwxr-xr--). Find which file has permission 754 to obtain the flag.",
        "flag": "CTFQUEST{0ct4l_p3rm1ss10n_754_st4t}",
        "hints": [
            "Octal permissions represent owner, group, and other rights.",
            "The 'stat' command displays octal permissions using 'stat -c \"%a %n\" <files>'.",
            "Or use 'find vault -perm 754'."
        ],
        "setup": """
mkdir -p /home/player/vault
for i in $(seq 1 10); do
  echo "dummy file $i" > "/home/player/vault/file$i.txt"
  chmod 644 "/home/player/vault/file$i.txt"
done
echo "$FLAG" > /home/player/vault/file7.txt
chmod 754 /home/player/vault/file7.txt
"""
    },

    # Track 3: Streams, Redirection & Text Processing (18-25)
    {
        "id": 18,
        "slug": "linux-18-stderr-stdout",
        "category": "Linux",
        "title": "Standard Streams: Stderr vs Stdout",
        "difficulty": "medium",
        "xp": 75,
        "description": "The program './noisy' spews thousands of error lines to stderr (descriptor 2) while printing the true flag to stdout (descriptor 1). Discard the errors!",
        "flag": "CTFQUEST{r3d1r3ct_std3rr_t0_d3v_null}",
        "hints": [
            "In Linux, stdout is 1 and stderr is 2.",
            "Redirecting stderr to '/dev/null' silences error output.",
            "Try: ./noisy 2>/dev/null"
        ],
        "setup": """
cat << 'EOF' > /home/player/noisy
#!/bin/bash
for i in {1..2000}; do
  echo "DEBUG error message $i: warning discarded" >&2
done
echo "FLAG_PLACEHOLDER"
EOF
sed -i "s|FLAG_PLACEHOLDER|$FLAG|g" /home/player/noisy
chmod 755 /home/player/noisy
"""
    },
    {
        "id": 19,
        "slug": "linux-19-cut-columns",
        "category": "Linux",
        "title": "Cut the Columns",
        "difficulty": "medium",
        "xp": 75,
        "description": "'users.csv' has comma-separated fields: id, username, email, pin, flag, status. Find the user 'alice' and extract the flag column using 'cut'.",
        "flag": "CTFQUEST{cut_c0lumns_d3l1m1t3r_csv}",
        "hints": [
            "Use grep to isolate alice's line first.",
            "The 'cut' command accepts a delimiter with '-d' and field number with '-f'.",
            "Try: grep alice users.csv | cut -d',' -f5"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/users.csv', 'w') as f:
    f.write('id,username,email,pin,flag,status\\n')
    users = ['bob', 'carol', 'dave', 'alice', 'eve', 'frank']
    for i, u in enumerate(users, 1):
        fl = flag if u == 'alice' else 'NOPE'
        f.write(f'{i},{u},{u}@corp.local,{1000+i},{fl},active\\n')
" "$FLAG"
chmod 444 /home/player/users.csv
"""
    },
    {
        "id": 20,
        "slug": "linux-20-sed-replace",
        "category": "Linux",
        "title": "Sed Stream Editor",
        "difficulty": "medium",
        "xp": 75,
        "description": "'stream.txt' contains config parameters. Exactly one line defines 'super_secret_override'. Use 'sed' to extract the secret value.",
        "flag": "CTFQUEST{s3d_str34m_3d1t0r_p0w3r}",
        "hints": [
            "You can use sed to match and print specific patterns.",
            "Or grep for super_secret_override.",
            "Try: sed -n '/super_secret_override/p' stream.txt"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/stream.txt', 'w') as f:
    for i in range(1, 100):
        f.write(f'config_param_{i}=standard_value\\n')
    f.write(f'super_secret_override={flag}\\n')
    for i in range(101, 200):
        f.write(f'config_param_{i}=standard_value\\n')
" "$FLAG"
chmod 444 /home/player/stream.txt
"""
    },
    {
        "id": 21,
        "slug": "linux-21-awk-filter",
        "category": "Linux",
        "title": "Awk Field Filtering",
        "difficulty": "medium",
        "xp": 75,
        "description": "'scores.tsv' has tab-separated columns: Name, Subject, Score, Token. Find the row where Score is 100 and print the Token field using 'awk'.",
        "flag": "CTFQUEST{4wk_f13ld_pr0c3ss1ng_g0d}",
        "hints": [
            "Awk can filter records by column condition: '$3 == 100'.",
            "Print the 4th column using '{print $4}'.",
            "Try: awk '$3 == 100 {print $4}' scores.tsv"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/scores.tsv', 'w') as f:
    f.write('Name\\tSubject\\tScore\\tToken\\n')
    f.write('Alex\\tMath\\t88\\tTOKEN_ALEX\\n')
    f.write('Blake\\tPhysics\\t92\\tTOKEN_BLAKE\\n')
    f.write(f'Cipher\\tCyber\\t100\\t{flag}\\n')
    f.write('Dana\\tChemistry\\t76\\tTOKEN_DANA\\n')
" "$FLAG"
chmod 444 /home/player/scores.tsv
"""
    },
    {
        "id": 22,
        "slug": "linux-22-rot13-tr",
        "category": "Linux",
        "title": "ROT13 Character Translation",
        "difficulty": "medium",
        "xp": 75,
        "description": "The file 'cipher.txt' is encoded with the classic ROT13 Caesar cipher. Use the 'tr' command to translate the characters back to plaintext.",
        "flag": "CTFQUEST{r0t13_c43s4r_c1ph3r_d3c0d3d}",
        "hints": [
            "ROT13 shifts alphabetical characters by 13 positions.",
            "The 'tr' command translates characters from set 1 to set 2.",
            "Try: tr 'A-Za-z' 'N-ZA-Mn-za-m' < cipher.txt"
        ],
        "setup": """
python3 -c "
import sys, codecs
flag = sys.argv[1]
rot = codecs.encode(flag, 'rot_13')
with open('/home/player/cipher.txt', 'w') as f:
    f.write(rot + '\\n')
" "$FLAG"
chmod 444 /home/player/cipher.txt
"""
    },
    {
        "id": 23,
        "slug": "linux-23-tac-rev",
        "category": "Linux",
        "title": "Reverse Characters",
        "difficulty": "easy",
        "xp": 50,
        "description": "'reversed.txt' contains the flag written completely backwards. Reverse the string back to normal.",
        "flag": "CTFQUEST{r3v_str1ng_b4ckw4rds_c00l}",
        "hints": [
            "Linux provides the 'rev' utility to reverse lines character-by-character.",
            "Pass the file to 'rev'.",
            "Try: rev reversed.txt"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
with open('/home/player/reversed.txt', 'w') as f:
    f.write(flag[::-1] + '\\n')
" "$FLAG"
chmod 444 /home/player/reversed.txt
"""
    },
    {
        "id": 24,
        "slug": "linux-24-diff-compare",
        "category": "Linux",
        "title": "File Differences",
        "difficulty": "medium",
        "xp": 75,
        "description": "'config.orig' and 'config.new' are 150 lines long. One added line in 'config.new' contains the secret token. Find it using 'diff'.",
        "flag": "CTFQUEST{d1ff_sp0ts_th3_d1ff3r3nc3}",
        "hints": [
            "Comparing large files line-by-line is best done with 'diff'.",
            "Lines marked with '>' were added in the second file.",
            "Try: diff config.orig config.new"
        ],
        "setup": """
python3 -c "
import sys
flag = sys.argv[1]
lines_orig = [f'setting_{i}=default_val_{i}' for i in range(1, 150)]
lines_new = list(lines_orig)
lines_new.insert(88, f'secret_token={flag}')
with open('/home/player/config.orig', 'w') as f:
    f.write('\\n'.join(lines_orig) + '\\n')
with open('/home/player/config.new', 'w') as f:
    f.write('\\n'.join(lines_new) + '\\n')
" "$FLAG"
chmod 444 /home/player/config.orig /home/player/config.new
"""
    },
    {
        "id": 25,
        "slug": "linux-25-tee-pipe",
        "category": "Linux",
        "title": "Tee Pipeline Inspector",
        "difficulty": "medium",
        "xp": 75,
        "description": "The script './stream_gen.sh' emits stream packets. Use 'tee' or pipe to inspect the packets and find the flag line.",
        "flag": "CTFQUEST{t33_br4nch_st4nd4rd_str34m}",
        "hints": [
            "Run './stream_gen.sh' and pipe its output to grep.",
            "Or use 'tee' to save output to a file while viewing.",
            "Try: ./stream_gen.sh | grep CTFQUEST"
        ],
        "setup": """
cat << 'EOF' > /home/player/stream_gen.sh
#!/bin/bash
for i in {1..20}; do
  if [ $i -eq 13 ]; then
    echo "STREAM_DATA: FLAG_PLACEHOLDER"
  else
    echo "STREAM_DATA: dummy_packet_$i"
  fi
done
EOF
sed -i "s|FLAG_PLACEHOLDER|$FLAG|g" /home/player/stream_gen.sh
chmod 755 /home/player/stream_gen.sh
"""
    },

    # Track 4: Archives, Compression & Encoding (26-32)
    {
        "id": 26,
        "slug": "linux-26-tar-extract",
        "category": "Linux",
        "title": "Tar Archive Extraction",
        "difficulty": "easy",
        "xp": 50,
        "description": "A tar archive 'archive.tar' contains 'flag.txt'. Extract it to /tmp and read the secret.",
        "flag": "CTFQUEST{t4r_4rch1v3_3xtr4ct10n_34sy}",
        "hints": [
            "Tar archives bundle multiple files into one file.",
            "Extract with 'tar -xf archive.tar -C /tmp'.",
            "Read '/tmp/flag.txt'."
        ],
        "setup": """
mkdir -p /tmp/pack_tar
echo "$FLAG" > /tmp/pack_tar/flag.txt
tar -cf /home/player/archive.tar -C /tmp/pack_tar flag.txt
rm -rf /tmp/pack_tar
chmod 444 /home/player/archive.tar
"""
    },
    {
        "id": 27,
        "slug": "linux-27-gzip-decomp",
        "category": "Linux",
        "title": "Gzip Compressed Tarball",
        "difficulty": "easy",
        "xp": 50,
        "description": "'backup.tar.gz' is compressed using gzip. Extract the archive to /tmp and claim the flag.",
        "flag": "CTFQUEST{gz1p_c0mpr3ss10n_t4r_xzf}",
        "hints": [
            "The '-z' flag in tar enables gzip decompression.",
            "Use 'tar -xzf backup.tar.gz -C /tmp'.",
            "Read the extracted '/tmp/flag.txt'."
        ],
        "setup": """
mkdir -p /tmp/pack_gz
echo "$FLAG" > /tmp/pack_gz/flag.txt
tar -czf /home/player/backup.tar.gz -C /tmp/pack_gz flag.txt
rm -rf /tmp/pack_gz
chmod 444 /home/player/backup.tar.gz
"""
    },
    {
        "id": 28,
        "slug": "linux-28-bzip2-decomp",
        "category": "Linux",
        "title": "Bzip2 Compression",
        "difficulty": "medium",
        "xp": 75,
        "description": "'archive.tar.bz2' is compressed with bzip2. Decompress it into /tmp.",
        "flag": "CTFQUEST{bz1p2_c0mpr3ss10n_t4r_xjf}",
        "hints": [
            "Bzip2 compressed archives use '-j' with tar.",
            "Run 'tar -xjf archive.tar.bz2 -C /tmp'.",
            "Read '/tmp/flag.txt'."
        ],
        "setup": """
mkdir -p /tmp/pack_bz2
echo "$FLAG" > /tmp/pack_bz2/flag.txt
tar -cjf /home/player/archive.tar.bz2 -C /tmp/pack_bz2 flag.txt
rm -rf /tmp/pack_bz2
chmod 444 /home/player/archive.tar.bz2
"""
    },
    {
        "id": 29,
        "slug": "linux-29-xz-decomp",
        "category": "Linux",
        "title": "XZ Compression",
        "difficulty": "medium",
        "xp": 75,
        "description": "'package.tar.xz' uses high-ratio XZ compression. Extract the archive.",
        "flag": "CTFQUEST{xz_extr3m3_c0mpr3ss10n}",
        "hints": [
            "The '-J' option in tar handles .xz compression.",
            "Run 'tar -xJf package.tar.xz -C /tmp'.",
            "Read '/tmp/flag.txt'."
        ],
        "setup": """
mkdir -p /tmp/pack_xz
echo "$FLAG" > /tmp/pack_xz/flag.txt
tar -cJf /home/player/package.tar.xz -C /tmp/pack_xz flag.txt
rm -rf /tmp/pack_xz
chmod 444 /home/player/package.tar.xz
"""
    },
    {
        "id": 30,
        "slug": "linux-30-base64-decode",
        "category": "Linux",
        "title": "Base64 Decoding",
        "difficulty": "easy",
        "xp": 50,
        "description": "'encoded.b64' contains a base64 encoded flag string. Decode it to readable text.",
        "flag": "CTFQUEST{b4s364_d3c0d1ng_1s_34sy}",
        "hints": [
            "Base64 is a binary-to-text encoding scheme.",
            "Use the 'base64 -d' command to decode.",
            "Try: base64 -d encoded.b64"
        ],
        "setup": """
echo -n "$FLAG" | base64 > /home/player/encoded.b64
chmod 444 /home/player/encoded.b64
"""
    },
    {
        "id": 31,
        "slug": "linux-31-hexdump-decode",
        "category": "Linux",
        "title": "Hex Dump to Plaintext",
        "difficulty": "medium",
        "xp": 75,
        "description": "'dump.hex' contains raw hexadecimal byte values representing the secret. Reconstruct the plaintext ASCII flag.",
        "flag": "CTFQUEST{xxd_h3xdump_r3v3rs3_pl41n}",
        "hints": [
            "Hex values represent character ASCII codes (e.g., 43=C, 54=T, 46=F).",
            "The 'xxd' utility has a reverse mode '-r -p'.",
            "Try: xxd -r -p dump.hex"
        ],
        "setup": """
echo -n "$FLAG" | xxd -p > /home/player/dump.hex
chmod 444 /home/player/dump.hex
"""
    },
    {
        "id": 32,
        "slug": "linux-32-nested-matryoshka",
        "category": "Linux",
        "title": "Matryoshka Archive",
        "difficulty": "hard",
        "xp": 100,
        "description": "'russian_doll' is compressed in multiple layers: bzip2, gzip, and base64! Peel each layer in /tmp to find the flag.",
        "flag": "CTFQUEST{m4try0shk4_n3st3d_4rch1v3s}",
        "hints": [
            "Use the 'file' command at each stage to inspect what type of archive you have.",
            "Unpack in /tmp: bzcat russian_doll | zcat | base64 -d",
            "Or decode step by step: bunzip2, gunzip, and base64 -d."
        ],
        "setup": """
python3 -c "
import sys, gzip, bz2, base64
flag = sys.argv[1].encode()
b64 = base64.b64encode(flag)
gz = gzip.compress(b64)
bz = bz2.compress(gz)
with open('/home/player/russian_doll', 'wb') as f:
    f.write(bz)
" "$FLAG"
chmod 444 /home/player/russian_doll
"""
    },

    # Track 5: Processes, System & Networking (33-38)
    {
        "id": 33,
        "slug": "linux-33-ps-process",
        "category": "Linux",
        "title": "Process Arguments Leak",
        "difficulty": "easy",
        "xp": 50,
        "description": "A daemon process 'vault-worker' is currently running in the background. Inspect the system process list and command arguments to find the secret token.",
        "flag": "CTFQUEST{pr0c3ss_4rgum3nts_ps_4ux}",
        "hints": [
            "Processes and their command-line arguments are visible in the process table.",
            "Use 'ps aux' or 'ps -ef' to view all running processes.",
            "Look for the arguments passed to 'vault-worker'."
        ],
        "setup": """
cat << 'EOF' > /usr/local/bin/vault-worker
#!/bin/bash
while true; do sleep 3600; done
EOF
chmod 755 /usr/local/bin/vault-worker
"""
    },
    {
        "id": 34,
        "slug": "linux-34-cron-inspector",
        "category": "Linux",
        "title": "Cron Job Inspector",
        "difficulty": "easy",
        "xp": 50,
        "description": "A scheduled background task runs periodically on this machine. Inspect the cron configuration files in /etc/cron* to uncover the secret.",
        "flag": "CTFQUEST{cr0n_j0b_sch3dul3r_l34k}",
        "hints": [
            "Scheduled jobs are stored in '/etc/cron.d/', '/etc/crontab', or '/var/spool/cron'.",
            "Check the contents of files inside '/etc/cron.d/'.",
            "Try: cat /etc/cron.d/sync-job"
        ],
        "setup": """
mkdir -p /etc/cron.d
echo "* * * * * root /usr/local/bin/backup-sync --secret=$FLAG" > /etc/cron.d/sync-job
chmod 644 /etc/cron.d/sync-job
"""
    },
    {
        "id": 35,
        "slug": "linux-35-netcat-port",
        "category": "Linux",
        "title": "Local Port Listener",
        "difficulty": "medium",
        "xp": 75,
        "description": "A server service is listening locally on port 9999 (127.0.0.1:9999). Connect to it using Netcat (nc) to retrieve the flag banner.",
        "flag": "CTFQUEST{n3tc4t_l0c4l_p0rt_c0nn3ct}",
        "hints": [
            "Check listening ports with 'ss -tulpn' or 'netstat'.",
            "Connect using netcat: 'nc 127.0.0.1 9999'.",
            "The banner will print the flag immediately upon connection."
        ],
        "setup": """
cat << 'EOF' > /usr/local/bin/port-server.py
import socket, sys
flag = sys.argv[1]
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('127.0.0.1', 9999))
s.listen(10)
while True:
    try:
        conn, addr = s.accept()
        conn.sendall(f"CTFQuest Vault Service v1.0\\nFlag: {flag}\\n".encode())
        conn.close()
    except Exception:
        pass
EOF
chmod 755 /usr/local/bin/port-server.py
"""
    },
    {
        "id": 36,
        "slug": "linux-36-unix-socket",
        "category": "Linux",
        "title": "UNIX Domain Socket",
        "difficulty": "medium",
        "xp": 75,
        "description": "A local daemon is listening on a UNIX domain socket at '/tmp/service.sock'. Connect to it using Netcat with the '-U' option.",
        "flag": "CTFQUEST{un1x_d0m41n_s0ck3t_nc_u}",
        "hints": [
            "UNIX domain sockets are inter-process communication endpoints represented as files.",
            "Netcat supports UNIX sockets using the '-U' flag.",
            "Try: nc -U /tmp/service.sock"
        ],
        "setup": """
cat << 'EOF' > /usr/local/bin/socket-server.py
import socket, sys, os
flag = sys.argv[1]
sock_path = '/tmp/service.sock'
if os.path.exists(sock_path): os.remove(sock_path)
s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.bind(sock_path)
os.chmod(sock_path, 0o777)
s.listen(10)
while True:
    try:
        conn, _ = s.accept()
        conn.sendall(f"Socket authorized. Key: {flag}\\n".encode())
        conn.close()
    except Exception:
        pass
EOF
chmod 755 /usr/local/bin/socket-server.py
"""
    },
    {
        "id": 37,
        "slug": "linux-37-signal-handler",
        "category": "Linux",
        "title": "Process Signal Handler",
        "difficulty": "hard",
        "xp": 100,
        "description": "A process named 'signal-listener' is running. When it receives the SIGUSR1 signal, it dumps the secret flag to '/tmp/flag.txt'. Send the signal!",
        "flag": "CTFQUEST{s1gn4l_h4ndl3r_s1gusr1_k1ll}",
        "hints": [
            "Find the process PID using 'pgrep signal-listener' or 'ps aux'.",
            "Send user-defined signal 1 using 'kill -SIGUSR1 <PID>' or 'pkill -USR1 signal-listener'.",
            "After sending the signal, check 'cat /tmp/flag.txt'."
        ],
        "setup": """
cat << 'EOF' > /usr/local/bin/signal-listener.py
import signal, time, sys
flag = sys.argv[1]
def handler(sig, frame):
    with open('/tmp/flag.txt', 'w') as f:
        f.write(flag + '\n')
signal.signal(signal.SIGUSR1, handler)
while True: time.sleep(1)
EOF
chmod 755 /usr/local/bin/signal-listener.py
"""
    },
    {
        "id": 38,
        "slug": "linux-38-proc-fd-leak",
        "category": "Linux",
        "title": "Recover Deleted File from /proc",
        "difficulty": "hard",
        "xp": 100,
        "description": "Process 'leak-daemon' opened the flag file and then unlinked (deleted) it from disk. As long as the process holds it open, you can recover it from /proc/<PID>/fd/!",
        "flag": "CTFQUEST{pr0c_fd_f1l3_d3scr1pt0r_r3c0v3r}",
        "hints": [
            "In Linux, unlinked files with open file descriptors remain accessible in /proc.",
            "Find the PID with 'pgrep leak-daemon' or 'ps aux | grep leak-daemon'.",
            "List '/proc/<PID>/fd/' and cat the descriptor pointing to the deleted file."
        ],
        "setup": """
cat << 'EOF' > /usr/local/bin/leak-daemon.py
import os, time, sys
flag = sys.argv[1]
f = open('/tmp/.unlinked_secret', 'w')
f.write(flag + '\n')
f.flush()
f_read = open('/tmp/.unlinked_secret', 'r')
os.unlink('/tmp/.unlinked_secret')
while True: time.sleep(10)
EOF
chmod 755 /usr/local/bin/leak-daemon.py
"""
    },

    # Track 6: Binary Analysis & Checksums (39-42)
    {
        "id": 39,
        "slug": "linux-39-strings-binary",
        "category": "Linux",
        "title": "Strings in Compiled Binary",
        "difficulty": "medium",
        "xp": 75,
        "description": "'mystery_binary' is a compiled ELF executable. The developer left an unencrypted secret string in the binary. Extract printable strings with 'strings'.",
        "flag": "CTFQUEST{str1ngs_3xtr4ct_pr1nt4bl3_3lf}",
        "hints": [
            "The 'strings' command prints all sequences of printable characters in a binary file.",
            "Combine it with grep to find the CTFQUEST flag format.",
            "Try: strings mystery_binary | grep CTFQUEST"
        ],
        "setup": """
cat << 'EOF' > /tmp/binary.c
#include <stdio.h>
const char *secret = "FLAG_PLACEHOLDER";
int main() {
    printf("Access denied.\\n");
    return 1;
}
EOF
sed -i "s|FLAG_PLACEHOLDER|$FLAG|g" /tmp/binary.c
gcc /tmp/binary.c -o /home/player/mystery_binary
rm -f /tmp/binary.c
chmod 755 /home/player/mystery_binary
"""
    },
    {
        "id": 40,
        "slug": "linux-40-file-magic",
        "category": "Linux",
        "title": "Disguised File Type",
        "difficulty": "medium",
        "xp": 75,
        "description": "'image.png' is not actually a PNG image! Inspect its magic bytes using the 'file' command to discover what it really is, then extract its contents.",
        "flag": "CTFQUEST{f1l3_m4g1c_byt3s_d3t3ct10n}",
        "hints": [
            "File extensions in Linux are just names; the 'file' command examines header magic bytes.",
            "Run 'file image.png' to see its true format.",
            "If it is a zip archive, extract it to /tmp: unzip image.png -d /tmp"
        ],
        "setup": """
python3 -c "
import sys, zipfile
flag = sys.argv[1]
with zipfile.ZipFile('/home/player/image.png', 'w') as z:
    z.writestr('flag.txt', flag + '\\n')
" "$FLAG"
chmod 444 /home/player/image.png
"""
    },
    {
        "id": 41,
        "slug": "linux-41-checksum-match",
        "category": "Linux",
        "title": "SHA-256 Checksum Matcher",
        "difficulty": "medium",
        "xp": 75,
        "description": "In 'hashes/', there are 30 files. 'TARGET_HASH.txt' specifies an exact SHA-256 hash. Find the file whose checksum matches and read the flag.",
        "flag": "CTFQUEST{sh4256sum_v4l1d4t10n_m4st3r}",
        "hints": [
            "You can compute checksums for all files using 'sha256sum hashes/*'.",
            "Read 'TARGET_HASH.txt' to get the target hash.",
            "Filter the checksum list using grep with the target hash."
        ],
        "setup": """
mkdir -p /home/player/hashes
python3 -c "
import sys, hashlib
flag = sys.argv[1]
for i in range(1, 31):
    content = f'dummy file content {i*97}\\n'
    with open(f'/home/player/hashes/file_{i:02d}.dat', 'w') as f:
        f.write(content)
with open('/home/player/hashes/file_19.dat', 'w') as f:
    f.write(flag + '\\n')
target_hash = hashlib.sha256((flag + '\\n').encode()).hexdigest()
with open('/home/player/TARGET_HASH.txt', 'w') as f:
    f.write(f'Target SHA256: {target_hash}\\n')
" "$FLAG"
chmod -R 444 /home/player/hashes /home/player/TARGET_HASH.txt
"""
    },
    {
        "id": 42,
        "slug": "linux-42-python-script",
        "category": "Linux",
        "title": "Python Scripting Decryption",
        "difficulty": "medium",
        "xp": 75,
        "description": "A python script 'decryptor.py' implements XOR stream decryption. Run it or inspect the code to decrypt the secret message.",
        "flag": "CTFQUEST{pyth0n3_scr1pt1ng_d3crypt0r}",
        "hints": [
            "You can execute python scripts directly using 'python3 <script>'.",
            "Run 'python3 decryptor.py'.",
            "The decrypted flag will print to standard output."
        ],
        "setup": """
cat << 'EOF' > /home/player/decryptor.py
# XOR decryption script
encrypted = "ENCRYPTED_HEX"
key = 0x5a
plain = bytes([b ^ key for b in bytes.fromhex(encrypted)]).decode()
print("Flag:", plain)
EOF
python3 -c "
import sys
flag = sys.argv[1].encode()
key = 0x5a
enc_hex = bytes([b ^ key for b in flag]).hex()
with open('/home/player/decryptor.py', 'r') as f:
    code = f.read()
code = code.replace('ENCRYPTED_HEX', enc_hex)
with open('/home/player/decryptor.py', 'w') as f:
    f.write(code)
" "$FLAG"
chmod 755 /home/player/decryptor.py
"""
    },

    # Track 7: Git Mastery (43-48)
    {
        "id": 43,
        "slug": "git-43-branch-detective",
        "category": "Git",
        "title": "Git: Branch Detective",
        "difficulty": "medium",
        "xp": 75,
        "description": "The git repository inside 'repo/' has multiple branches. The 'main' branch looks empty. List all branches and checkout the secret feature branch.",
        "flag": "CTFQUEST{g1t_br4nch_sw1tch_ch3ck0ut}",
        "hints": [
            "List all branches using 'git branch -a'.",
            "Switch to the secret branch using 'git checkout secret-feature'.",
            "Read 'flag.txt' on that branch."
        ],
        "setup": """
mkdir -p /home/player/repo
cd /home/player/repo
git init -b main
git config user.email "player@ctfquest.local"
git config user.name "CTF Player"
echo "Project README" > README.md
git add README.md && git commit -m "Initial commit"
git checkout -b secret-feature
echo "$FLAG" > flag.txt
git add flag.txt && git commit -m "Add secret credentials"
git checkout main
"""
    },
    {
        "id": 44,
        "slug": "git-44-commit-archaeology",
        "category": "Git",
        "title": "Git: Commit Archaeology",
        "difficulty": "medium",
        "xp": 75,
        "description": "Someone accidentally committed an API secret in 'repo/', then created a new commit deleting the file. Dig into the commit history with 'git log -p'!",
        "flag": "CTFQUEST{g1t_c0mm1t_l0g_p_h1st0ry}",
        "hints": [
            "Deleting a file in git only removes it from HEAD; the history retains all versions.",
            "Use 'git log -p' to view commit diffs and historical changes.",
            "Look for the commit that added 'secret_key.txt'."
        ],
        "setup": """
mkdir -p /home/player/repo
cd /home/player/repo
git init -b main
git config user.email "player@ctfquest.local"
git config user.name "CTF Player"
echo "Initial code" > app.py
git add app.py && git commit -m "Initial release"
echo "API_KEY=$FLAG" > secret_key.txt
git add secret_key.txt && git commit -m "Accidentally added API key"
rm secret_key.txt
git add secret_key.txt && git commit -m "Remove sensitive key"
"""
    },
    {
        "id": 45,
        "slug": "git-45-stashed-away",
        "category": "Git",
        "title": "Git: Stashed Away",
        "difficulty": "medium",
        "xp": 75,
        "description": "A developer was working on a feature when they stashed their changes before switching branches. Recover the stash in 'repo/'.",
        "flag": "CTFQUEST{g1t_st4sh_p0p_s4v3d_w0rk}",
        "hints": [
            "Git stash saves uncommitted work out of the working tree.",
            "List stashes using 'git stash list'.",
            "Restore stashed files using 'git stash apply' or 'git stash pop'."
        ],
        "setup": """
mkdir -p /home/player/repo
cd /home/player/repo
git init -b main
git config user.email "player@ctfquest.local"
git config user.name "CTF Player"
echo "Production code" > main.py
git add main.py && git commit -m "Base system"
echo "$FLAG" > secret.txt
git add secret.txt
git stash push -m "WIP: security token"
"""
    },
    {
        "id": 46,
        "slug": "git-46-reflog-recovery",
        "category": "Git",
        "title": "Git: Reflog Recovery",
        "difficulty": "hard",
        "xp": 100,
        "description": "A commit containing the flag was deleted with 'git reset --hard HEAD~1'. The commit is no longer in normal log, but Git's reflog remembers it! Recover the lost commit.",
        "flag": "CTFQUEST{g1t_r3fl0g_0rph4n_c0mm1t}",
        "hints": [
            "'git log' only walks reachable commits, but 'git reflog' tracks every HEAD movement.",
            "Run 'git reflog' in 'repo/' to find the SHA of the reset commit.",
            "Use 'git show <commit_hash>' to inspect the lost commit."
        ],
        "setup": """
mkdir -p /home/player/repo
cd /home/player/repo
git init -b main
git config user.email "player@ctfquest.local"
git config user.name "CTF Player"
echo "Stable version" > version.txt
git add version.txt && git commit -m "v1.0"
echo "$FLAG" > secret_token.txt
git add secret_token.txt && git commit -m "Commit with secret"
git reset --hard HEAD~1
"""
    },
    {
        "id": 47,
        "slug": "git-47-tagged-release",
        "category": "Git",
        "title": "Git: Tagged Release Notes",
        "difficulty": "easy",
        "xp": 50,
        "description": "A secret token was stored in an annotated Git release tag. Inspect all git tags and their annotations in 'repo/'.",
        "flag": "CTFQUEST{g1t_4nn0t4t3d_t4g_n0t3s}",
        "hints": [
            "List all tags with 'git tag'.",
            "View tag messages with 'git tag -n' or 'git show v1.0.0'.",
            "The tag annotation message contains the flag."
        ],
        "setup": """
mkdir -p /home/player/repo
cd /home/player/repo
git init -b main
git config user.email "player@ctfquest.local"
git config user.name "CTF Player"
echo "Release 1.0" > release.notes
git add release.notes && git commit -m "Release prep"
git tag -a v1.0.0 -m "Release v1.0.0 key=$FLAG"
"""
    },
    {
        "id": 48,
        "slug": "git-48-merge-conflict",
        "category": "Git",
        "title": "Git: Branch Merge Conflict",
        "difficulty": "hard",
        "xp": 100,
        "description": "Two branches in 'repo/' edited the same line. Merge the 'feature' branch into 'main' and read the conflict markers to uncover the secret.",
        "flag": "CTFQUEST{g1t_m3rg3_c0nfl1ct_m4rk3rs}",
        "hints": [
            "Run 'git merge feature' inside 'repo/'.",
            "Git will pause with a merge conflict in 'note.txt'.",
            "Inspect 'note.txt' to view the conflicting content containing the flag."
        ],
        "setup": """
mkdir -p /home/player/repo
cd /home/player/repo
git init -b main
git config user.email "player@ctfquest.local"
git config user.name "CTF Player"
echo "line 1" > note.txt
git add note.txt && git commit -m "c1"
git checkout -b feature
echo "feature: $FLAG" > note.txt
git commit -am "feature edit"
git checkout main
echo "main: standard text" > note.txt
git commit -am "main edit"
"""
    },

    # Track 8: Docker & DevOps (49-51)
    {
        "id": 49,
        "slug": "docker-49-dockerfile-analysis",
        "category": "Docker",
        "title": "Docker: Dockerfile Forensics",
        "difficulty": "easy",
        "xp": 50,
        "description": "An insecure build pattern leaked sensitive credentials into the build arguments in 'app/Dockerfile'. Analyze the file to recover the leaked secret.",
        "flag": "CTFQUEST{d0ck3rf1l3_bu1ld_4rg_l34k}",
        "hints": [
            "Docker build arguments (ARG) are often mistakenly used for passwords.",
            "Read 'app/Dockerfile'.",
            "Look for SECRET_FLAG in the ARG instruction."
        ],
        "setup": """
mkdir -p /home/player/app
cat << 'EOF' > /home/player/app/Dockerfile
FROM alpine:3.19
ARG SECRET_FLAG="FLAG_PLACEHOLDER"
ENV APP_ENV=production
RUN echo "Building production image with secret: $SECRET_FLAG" > /build.log
CMD ["echo", "running"]
EOF
sed -i "s|FLAG_PLACEHOLDER|$FLAG|g" /home/player/app/Dockerfile
chmod 444 /home/player/app/Dockerfile
"""
    },
    {
        "id": 50,
        "slug": "docker-50-container-spec",
        "category": "Docker",
        "title": "Docker: Container Spec Parsing",
        "difficulty": "medium",
        "xp": 75,
        "description": "'pod-spec.json' contains a Kubernetes / Docker pod definition. Use 'jq' or Python to parse the JSON and extract the value of 'VAULT_MASTER_KEY'.",
        "flag": "CTFQUEST{c0nt41n3r_sp3c_jq_p4rs1ng}",
        "hints": [
            "Use 'jq' to parse JSON files in the command line.",
            "Query the env array: jq '.spec.containers[0].env' pod-spec.json.",
            "Or grep for 'VAULT_MASTER_KEY' inside 'pod-spec.json'."
        ],
        "setup": """
python3 -c "
import sys, json
flag = sys.argv[1]
spec = {
    'apiVersion': 'v1',
    'kind': 'Pod',
    'metadata': {'name': 'secure-vault-service'},
    'spec': {
        'containers': [{
            'name': 'vault-app',
            'image': 'vault:1.15.2',
            'env': [
                {'name': 'PORT', 'value': '8200'},
                {'name': 'VAULT_MASTER_KEY', 'value': flag}
            ]
        }]
    }
}
with open('/home/player/pod-spec.json', 'w') as f:
    json.dump(spec, f, indent=2)
" "$FLAG"
chmod 444 /home/player/pod-spec.json
"""
    },
    {
        "id": 51,
        "slug": "docker-51-compose-inspection",
        "category": "Docker",
        "title": "Docker: Compose Environment Secrets",
        "difficulty": "easy",
        "xp": 50,
        "description": "A multi-container application is configured in 'stack/docker-compose.yml'. Inspect the database environment configurations to find the hardcoded secret password.",
        "flag": "CTFQUEST{d0ck3r_c0mp0s3_s3cr3ts_f0und}",
        "hints": [
            "Docker Compose files define service environments in YAML format.",
            "Read 'stack/docker-compose.yml'.",
            "Check POSTGRES_PASSWORD under the db service."
        ],
        "setup": """
mkdir -p /home/player/stack
cat << 'EOF' > /home/player/stack/docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: "FLAG_PLACEHOLDER"
EOF
sed -i "s|FLAG_PLACEHOLDER|$FLAG|g" /home/player/stack/docker-compose.yml
chmod 444 /home/player/stack/docker-compose.yml
"""
    },

    # Grand Finale (52)
    {
        "id": 52,
        "slug": "linux-52-grand-finale",
        "category": "Linux",
        "title": "Master of the Shell (Grand Finale)",
        "difficulty": "hard",
        "xp": 100,
        "description": "The final test! A password-protected zip file 'championship.zip' contains the winning script. Decode the password from '.champion_creds', extract the zip in /tmp, and execute the winner script!",
        "flag": "CTFQUEST{ult1m4t3_sh3ll_m4st3r_c0nqu3r0r}",
        "hints": [
            "Check the hidden file '.champion_creds' in your home directory.",
            "Decode the base64 password string: echo '<string>' | base64 -d.",
            "Unzip with password: unzip -P <password> championship.zip -d /tmp, then run /tmp/win.sh!"
        ],
        "setup": """
cat << 'EOF' > /tmp/win.sh
#!/bin/bash
echo "CONGRATULATIONS CHAMPION!"
echo "FLAG: FLAG_PLACEHOLDER"
EOF
sed -i "s|FLAG_PLACEHOLDER|$FLAG|g" /tmp/win.sh
chmod 755 /tmp/win.sh

python3 -c "
import zipfile, base64
with zipfile.ZipFile('/home/player/championship.zip', 'w') as z:
    z.write('/tmp/win.sh', 'win.sh')
with open('/home/player/.champion_creds', 'w') as f:
    f.write('ARCHIVE_KEY_B64=' + base64.b64encode(b'master_shell_key').decode() + '\\n')
"
rm -f /tmp/win.sh
chmod 444 /home/player/championship.zip /home/player/.champion_creds
"""
    }
]


def run_cmd(cmd, check=True):
    res = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if check and res.returncode != 0:
        print(f"Error executing: {cmd}")
        print(f"Stderr: {res.stderr}")
        sys.exit(1)
    return res


def build_image(chal):
    slug = chal["slug"]
    flag = chal["flag"]
    setup = chal["setup"]
    image_tag = f"ctfquest/{slug}"

    cmd_line = 'CMD ["sleep", "infinity"]'
    if slug == "linux-33-ps-process":
        cmd_line = f'CMD ["/bin/bash", "-c", "/usr/local/bin/vault-worker --secret={flag} & sleep infinity"]'
    elif slug == "linux-35-netcat-port":
        cmd_line = f'CMD ["/bin/bash", "-c", "python3 /usr/local/bin/port-server.py {flag} & sleep infinity"]'
    elif slug == "linux-36-unix-socket":
        cmd_line = f'CMD ["/bin/bash", "-c", "python3 /usr/local/bin/socket-server.py {flag} & sleep infinity"]'
    elif slug == "linux-37-signal-handler":
        cmd_line = f'CMD ["/bin/bash", "-c", "python3 /usr/local/bin/signal-listener.py {flag} & sleep infinity"]'
    elif slug == "linux-38-proc-fd-leak":
        cmd_line = f'CMD ["/bin/bash", "-c", "python3 /usr/local/bin/leak-daemon.py {flag} & sleep infinity"]'

    dockerfile = f"""FROM ctfquest/challenge-base:latest
ARG FLAG="{flag}"
USER root
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh && /setup.sh && rm -f /setup.sh \\
    && chown -R player:player /home/player
USER player
WORKDIR /home/player
{cmd_line}
"""

    temp_dir = tempfile.mkdtemp()
    try:
        with open(os.path.join(temp_dir, "Dockerfile"), "w") as df:
            df.write(dockerfile)
        with open(os.path.join(temp_dir, "setup.sh"), "w") as sf:
            sf.write(f"#!/bin/bash\nset -e\nexport FLAG='{flag}'\n" + setup.strip() + "\n")
        os.chmod(os.path.join(temp_dir, "setup.sh"), 0o755)

        cmd = f"docker build -q -t {image_tag} {temp_dir}"
        res = run_cmd(cmd)
        image_id = res.stdout.strip()
        print(f"[{chal['id']:02d}/52] Built {image_tag} ({image_id[:12]})")
    finally:
        subprocess.run(f"rm -rf {temp_dir}", shell=True)


def seed_mysql():
    print("\n--- Seeding MySQL Database ---")
    sql_statements = [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "TRUNCATE TABLE hint_usage;",
        "TRUNCATE TABLE hints;",
        "TRUNCATE TABLE attempts;",
        "TRUNCATE TABLE completions;",
        "TRUNCATE TABLE challenges;",
        "SET FOREIGN_KEY_CHECKS = 1;",
        "INSERT IGNORE INTO categories (id, name) VALUES (1, 'Linux'), (2, 'Git'), (3, 'Docker');"
    ]

    for chal in CHALLENGES:
        cat_id = 1 if chal["category"] == "Linux" else (2 if chal["category"] == "Git" else 3)
        flag_hash = hashlib.sha256(chal["flag"].strip().encode("utf-8")).hexdigest()
        escaped_desc = chal["description"].replace("'", "''")
        escaped_title = chal["title"].replace("'", "''")
        docker_image = f"ctfquest/{chal['slug']}"

        sql_statements.append(f"""
INSERT INTO challenges (id, category_id, title, description, difficulty, xp_reward, flag_hash, docker_image)
VALUES ({chal['id']}, {cat_id}, '{escaped_title}', '{escaped_desc}', '{chal['difficulty']}', {chal['xp']}, '{flag_hash}', '{docker_image}');
""")
        for lvl, hint in enumerate(chal["hints"], 1):
            escaped_hint = hint.replace("'", "''")
            sql_statements.append(f"""
INSERT INTO hints (challenge_id, level, content)
VALUES ({chal['id']}, {lvl}, '{escaped_hint}');
""")

    sql_file = tempfile.NamedTemporaryFile("w", delete=False)
    sql_file.write("\n".join(sql_statements))
    sql_file.close()

    db_user = os.environ.get("DB_USER", "ctfquest")
    db_pass = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "ctfquest")
    pass_flag = f"-p'{db_pass}'" if db_pass else ""

    try:
        run_cmd(f"mysql -u {db_user} {pass_flag} {db_name} < {sql_file.name}")
        print("MySQL seeding completed successfully.")
    finally:
        os.unlink(sql_file.name)


def main():
    print(f"Building all {len(CHALLENGES)} challenges...")
    for chal in CHALLENGES:
        build_image(chal)

    seed_mysql()
    print(f"\nAll {len(CHALLENGES)} challenges built and registered successfully!")


if __name__ == "__main__":
    main()
