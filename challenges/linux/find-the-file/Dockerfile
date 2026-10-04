FROM ubuntu:24.04

ARG FLAG
RUN test -n "$FLAG" \
    && useradd -m -s /bin/bash player \
    && mkdir -p /home/player/projects/alpha/notes /home/player/projects/beta/archive /home/player/documents \
    && echo "nothing here" > /home/player/documents/todo.txt \
    && echo "just notes" > /home/player/projects/alpha/notes/ideas.txt \
    && echo "$FLAG" > /home/player/projects/beta/archive/secret.txt \
    && chown -R player:player /home/player \
    && chmod -R a-w /home/player/projects /home/player/documents

USER player
WORKDIR /home/player

CMD ["sleep", "infinity"]