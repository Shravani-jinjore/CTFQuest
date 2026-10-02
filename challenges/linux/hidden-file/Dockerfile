FROM ubuntu:24.04

RUN useradd -m -s /bin/bash player

RUN echo "CTFQUEST{h1dd3n_f1l3_f0und}" > /home/player/.secret_flag.txt \
    && chown player:player /home/player/.secret_flag.txt \
    && chmod 444 /home/player/.secret_flag.txt

USER player
WORKDIR /home/player

CMD ["sleep", "infinity"]