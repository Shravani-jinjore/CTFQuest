#!/bin/bash
set -e
H=/home/player

case "$CHALLENGE" in
  run-the-script)
    printf '#!/bin/bash\necho "%s"\n' "$FLAG" > $H/reveal.sh
    chmod 644 $H/reveal.sh
    ;;
  env-hunt)
    echo "export VAULT_KEY=$FLAG" >> $H/.bashrc
    ;;
  log-detective)
    awk -v f="$FLAG" 'BEGIN{for(i=1;i<=4000;i++){print "INFO request " i " ok"; if(i==2711) print "ALERT token " f}}' > $H/server.log
    ;;
  history-secrets)
    printf 'ls\ncd /tmp\nexport BACKUP_CODE=%s\nexit\n' "$FLAG" > $H/.bash_history
    ;;
  unpack-it)
    mkdir /tmp/w
    echo "$FLAG" > /tmp/w/flag.txt
    tar -czf $H/backup.tar.gz -C /tmp/w flag.txt
    rm -r /tmp/w
    ;;
  deep-dive)
    mkdir -p $H/a/b/c/d/e/f/g
    echo "$FLAG" > $H/a/b/c/d/e/f/g/.key.txt
    ;;
  *)
    echo "unknown challenge: $CHALLENGE"; exit 1
    ;;
esac