FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    coreutils \
    findutils \
    grep \
    sed \
    gawk \
    diffutils \
    tar \
    gzip \
    bzip2 \
    xz-utils \
    unzip \
    file \
    binutils \
    gcc \
    libc6-dev \
    xxd \
    python3 \
    git \
    netcat-openbsd \
    curl \
    jq \
    procps \
    nano \
    vim-tiny \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash player

COPY submit.sh /usr/local/bin/submit
RUN chmod 755 /usr/local/bin/submit

USER player
WORKDIR /home/player

CMD ["sleep", "infinity"]
