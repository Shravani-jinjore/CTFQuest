#!/bin/bash
set -e
cd "$(dirname "$0")/.."

read -s -p "MySQL password for ctfquest: " MYSQL_PWD; echo
export MYSQL_PWD
SQL=$(mktemp)

# add slug title description difficulty xp hint1 hint2 hint3
add() {
  local slug="$1" title="$2" desc="$3" diff="$4" xp="$5"
  local flag="CTFQUEST{$(openssl rand -hex 8)}"
  echo "Building $title ..."
  docker build -q --build-arg FLAG="$flag" --build-arg CHALLENGE="$slug" \
    -t "ctfquest/linux-$slug" challenges/linux/pack > /dev/null
  cat >> "$SQL" <<EOF
UPDATE challenges SET flag_hash=SHA2('$flag',256), docker_image='ctfquest/linux-$slug' WHERE title='$title';
INSERT INTO challenges (category_id,title,description,difficulty,xp_reward,flag_hash,docker_image)
  SELECT id,'$title','$desc','$diff',$xp,SHA2('$flag',256),'ctfquest/linux-$slug'
  FROM categories WHERE name='Linux'
  AND NOT EXISTS (SELECT 1 FROM challenges WHERE title='$title');
INSERT IGNORE INTO hints (challenge_id,level,content) SELECT id,1,'$6' FROM challenges WHERE title='$title';
INSERT IGNORE INTO hints (challenge_id,level,content) SELECT id,2,'$7' FROM challenges WHERE title='$title';
INSERT IGNORE INTO hints (challenge_id,level,content) SELECT id,3,'$8' FROM challenges WHERE title='$title';
EOF
}

add run-the-script "Run the Script" \
  "There is a script called reveal.sh in your home folder, but it cannot be run directly. Make it print the flag." \
  easy 50 \
  "A file needs the execute permission to run as a program. Without it you can still hand it to an interpreter." \
  "The interpreter for this script is bash." \
  "Try: bash reveal.sh"

add env-hunt "Environment Hunt" \
  "A secret key is stored in an environment variable. Find it." \
  easy 50 \
  "Environment variables are named values that every program can read." \
  "There is a command that lists all of them." \
  "Try: env | grep VAULT"

add log-detective "Log Detective" \
  "server.log has thousands of lines. Exactly one line contains a secret token. Find it without reading them all." \
  medium 75 \
  "You need a tool that searches inside files for text." \
  "The tool is grep. The secret line contains the word ALERT." \
  "Try: grep ALERT server.log"

add history-secrets "History Secrets" \
  "Someone typed a secret into this terminal a while ago. Their command history remembers it." \
  medium 75 \
  "Bash keeps a record of old commands in a hidden file in your home folder." \
  "That file is called .bash_history." \
  "Try: cat .bash_history"

add unpack-it "Unpack It" \
  "backup.tar.gz holds the flag. Extract it. Your home folder is read-only, so extract somewhere else." \
  hard 100 \
  "A tar.gz is a compressed archive. The tar command can open it." \
  "Use -x to extract, -z for gzip and -f for the file. You can also use -C to choose the target folder. /tmp is writable." \
  "Try: tar -xzf backup.tar.gz -C /tmp then cat /tmp/flag.txt"

add deep-dive "Deep Dive" \
  "A flag file is hidden many folders deep and its name starts with a dot. Find it." \
  hard 100 \
  "Searching folder by folder would take forever." \
  "The find command searches all subfolders at once. Remember it can search by name pattern." \
  "Try: find . -name '*.txt' then cat the result"

mysql -u ctfquest ctfquest < "$SQL"
rm "$SQL"
echo "Done."
mysql -u ctfquest ctfquest -e "SELECT id, title, difficulty, xp_reward FROM challenges ORDER BY id;"