FROM ubuntu:24.04

ARG FLAG
RUN test -n "$FLAG" \
    && useradd -m -s /bin/bash player \
    && echo "$FLAG" > /home/player/.secret_flag.txt \
    && chown player:player /home/player/.secret_flag.txt \
    && chmod 444 /home/player/.secret_flag.txt

USER player
WORKDIR /home/player

CMD ["sleep", "infinity"]