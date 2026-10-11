-- ============================================================
-- CTFQuest Learning Content
-- Git, Linux, Docker — Topics & Lessons
-- ============================================================

-- ============================================================
-- LINUX TOPICS & LESSONS
-- ============================================================

-- Topic: Files and Folders (already seeded in seed.sql, skip if exists)
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Files and Folders', 1 FROM categories WHERE name = 'Linux';

-- Lessons for "Files and Folders" (already in seed.sql, kept here for reference)
INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Navigating with pwd, ls and cd',
'pwd prints the folder you are standing in. ls lists what is inside it. cd moves you into another folder.

Commands:
  pwd          → show current directory
  ls           → list files and folders
  ls -l        → long listing (permissions, size, date)
  ls -a        → show hidden files too
  cd /tmp      → move to /tmp
  cd ..        → go up one level
  cd ~         → go to your home directory

Try it: open a terminal, type pwd, then ls, then cd /tmp and pwd again.', 1
FROM topics t WHERE t.title = 'Files and Folders';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Hidden files',
'In Linux, any file whose name starts with a dot is hidden from a normal ls.

Examples:
  .bashrc     → shell config
  .gitignore  → git ignore rules
  .env        → environment variables

Commands:
  ls -a        → show all files including hidden
  ls -la       → long listing including hidden

Hidden files store config and secrets — CTF flags are often hidden this way!', 2
FROM topics t WHERE t.title = 'Files and Folders';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Reading files with cat, less and head',
'cat prints a file to the screen all at once.
less lets you scroll through long files (press q to quit).
head shows the first 10 lines; tail shows the last 10.

Commands:
  cat notes.txt         → print entire file
  cat -n notes.txt      → print with line numbers
  less bigfile.txt      → scroll through file
  head -5 file.txt      → first 5 lines
  tail -5 file.txt      → last 5 lines
  tail -f log.txt       → follow a growing log file

Tip: flags in CTF challenges are often hidden inside text files.', 3
FROM topics t WHERE t.title = 'Files and Folders';

-- ----------------------------------------------------------------
-- Linux Topic 2: Permissions & Users
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Permissions and Users', 2 FROM categories WHERE name = 'Linux';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Understanding file permissions',
'Every file has three permission sets: owner, group, and others.
Each set has read (r=4), write (w=2), and execute (x=1) bits.

Example: -rwxr-xr--
  - → regular file (d = directory)
  rwx → owner can read, write, execute
  r-x → group can read and execute
  r-- → others can only read

Commands:
  ls -l          → see permissions
  chmod 755 f    → rwxr-xr-x
  chmod 644 f    → rw-r--r--
  chmod +x f     → add execute for everyone
  chown user f   → change owner

Numbers are sums: 7=rwx, 6=rw-, 5=r-x, 4=r--', 1
FROM topics t WHERE t.title = 'Permissions and Users';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Users, groups and sudo',
'Linux is a multi-user system. Every process runs as a user.

Commands:
  whoami           → print current username
  id               → show user ID, group IDs
  groups           → list your groups
  su - username    → switch to another user
  sudo command     → run command as root
  sudo -l          → list what you can run as sudo

/etc/passwd stores usernames and home dirs.
/etc/shadow stores password hashes (root only).

In CTFs, privilege escalation often involves sudo misconfigurations.', 2
FROM topics t WHERE t.title = 'Permissions and Users';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'SUID, SGID and sticky bit',
'Special permission bits add extra power to executables.

SUID (Set User ID) — file runs as its owner, not the caller.
  ls -l shows s in owner execute position: -rwsr-xr-x
  Example: /usr/bin/passwd has SUID so any user can change their password.

SGID (Set Group ID) — file runs as its group.
  Shows s in group execute position.

Sticky bit — on directories, only the owner can delete their own files.
  Shows t in others execute position: drwxrwxrwt (e.g., /tmp)

Commands:
  find / -perm -4000 2>/dev/null    → find SUID files
  chmod u+s file                    → set SUID
  chmod g+s file                    → set SGID

SUID binaries are a classic CTF privilege escalation vector.', 3
FROM topics t WHERE t.title = 'Permissions and Users';

-- ----------------------------------------------------------------
-- Linux Topic 3: Searching and Piping
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Searching and Piping', 3 FROM categories WHERE name = 'Linux';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Finding files with find',
'find searches the filesystem for files matching criteria.

Syntax: find [path] [options]

Examples:
  find . -name "flag.txt"           → find by name
  find / -name "*.log" 2>/dev/null  → find all .log files
  find . -type d                    → only directories
  find . -type f -size +1M          → files larger than 1 MB
  find / -perm -4000 2>/dev/null    → SUID files
  find . -newer reference.txt       → newer than a file
  find . -name "*.txt" -exec cat {} \;  → find and run a command

2>/dev/null silences "permission denied" errors.', 1
FROM topics t WHERE t.title = 'Searching and Piping';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Grep — searching inside files',
'grep searches for a pattern inside text.

Commands:
  grep "flag" notes.txt          → find lines with "flag"
  grep -r "CTF" .                → recursive search in all files
  grep -i "flag" file.txt        → case-insensitive
  grep -n "error" log.txt        → show line numbers
  grep -v "DEBUG" log.txt        → invert match (exclude)
  grep -E "flag\{.*\}" file.txt  → extended regex

Common patterns:
  grep -r "password" /etc        → search for passwords in /etc
  grep -oP "flag\{[^}]+\}" f    → extract a flag from a file

Flags in CTF challenges often match a pattern like FLAG{...} or flag{...}.', 2
FROM topics t WHERE t.title = 'Searching and Piping';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Pipes and redirection',
'Pipes connect command output to the next command input.
Redirection sends output to files.

Pipe:
  command1 | command2
  ls -la | grep ".txt"           → list only .txt files
  cat file | sort | uniq         → sort and deduplicate

Redirection:
  command > file.txt             → overwrite file with output
  command >> file.txt            → append output to file
  command 2> errors.txt          → redirect errors
  command &> all.txt             → redirect both stdout and stderr
  command < input.txt            → read stdin from file

Useful combos:
  cat /etc/passwd | cut -d: -f1  → list all usernames
  ps aux | grep nginx            → find nginx process
  history | grep ssh             → find past ssh commands', 3
FROM topics t WHERE t.title = 'Searching and Piping';

-- ----------------------------------------------------------------
-- Linux Topic 4: Processes and Networking
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Processes and Networking', 4 FROM categories WHERE name = 'Linux';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Managing processes',
'A process is a running program. Every process has a PID (Process ID).

Commands:
  ps aux             → list all running processes
  top / htop         → live process monitor
  kill PID           → terminate process by PID
  kill -9 PID        → force kill
  killall nginx      → kill all processes named nginx
  jobs               → list background jobs in shell
  bg / fg            → send job to background / foreground
  nohup cmd &        → run command that survives logout
  pgrep nginx        → find PID of a named process

Process states: R (running), S (sleeping), Z (zombie), T (stopped)

Tip: In CTF privilege escalation, check for processes running as root.', 1
FROM topics t WHERE t.title = 'Processes and Networking';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Networking basics — netstat, ss, curl',
'Linux provides tools to inspect network connections and make HTTP requests.

Inspect connections:
  ss -tuln            → listening TCP/UDP ports
  netstat -tuln       → same (older tool)
  ss -tp              → show connections with processes
  ip a                → show network interfaces and IPs
  ip r                → show routing table

Make HTTP requests:
  curl http://site.com               → GET request
  curl -I http://site.com            → headers only
  curl -d "key=val" http://site.com  → POST form data
  curl -H "Token: abc" http://...    → custom header
  wget http://site.com/file          → download a file

In CTFs, open ports and local services often hide flags or entry points.', 2
FROM topics t WHERE t.title = 'Processes and Networking';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Environment variables',
'Environment variables are key=value pairs available to all processes.

Commands:
  env                  → list all environment variables
  echo $HOME           → print a single variable
  export MY_VAR=hello  → set a variable for this session
  unset MY_VAR         → remove a variable
  printenv PATH        → print PATH

Important variables:
  PATH    → directories searched for commands
  HOME    → your home directory
  USER    → current username
  SHELL   → your default shell
  TERM    → terminal type

CTF tip: secrets and flags are sometimes stored in environment variables.
  env | grep -i flag
  env | grep -i secret', 3
FROM topics t WHERE t.title = 'Processes and Networking';


-- ============================================================
-- GIT TOPICS & LESSONS
-- ============================================================

-- ----------------------------------------------------------------
-- Git Topic 1: Git Basics
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Git Basics', 1 FROM categories WHERE name = 'Git';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'What is Git and why use it?',
'Git is a distributed version control system. It tracks changes to files so you can:
  • Go back to any previous version
  • Work on features in parallel (branches)
  • Collaborate without overwriting each other''s work

Key concepts:
  Repository (repo) — a folder tracked by Git
  Commit         — a saved snapshot of your files
  Branch         — a parallel line of development
  Remote         — a copy of the repo on another machine (e.g., GitHub)

Setup (do this once):
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"

Create a repo:
  git init myproject    → create new repo
  git clone URL         → copy an existing repo

CTF tip: public GitHub repos sometimes have secrets or flags left in commit history.', 1
FROM topics t WHERE t.title = 'Git Basics';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Staging and committing changes',
'Git has three areas: working directory, staging area (index), and repository.

Workflow:
  1. Edit files in your working directory
  2. Stage the changes you want to save
  3. Commit the staged snapshot

Commands:
  git status               → see what changed / what is staged
  git add file.txt         → stage a file
  git add .                → stage everything
  git add -p               → interactively choose hunks to stage
  git commit -m "message"  → commit staged changes
  git commit -am "message" → stage all tracked files and commit
  git diff                 → show unstaged changes
  git diff --staged        → show staged changes

Good commit messages: short summary, present tense.
  "Add login page" ✓    "added stuff" ✗', 2
FROM topics t WHERE t.title = 'Git Basics';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Viewing history with git log',
'git log shows the list of commits from newest to oldest.

Commands:
  git log                      → full log
  git log --oneline            → one line per commit
  git log --oneline --graph    → ASCII branch graph
  git log -n 5                 → last 5 commits
  git log -- path/to/file      → commits touching a file
  git show HASH                → show a specific commit''s diff
  git diff HEAD~1 HEAD         → changes since last commit

Each commit has:
  • A hash (e.g., a3f2c1d) — unique identifier
  • Author and date
  • Commit message
  • A diff (the actual changes)

CTF tip: sensitive data (passwords, keys, flags) accidentally committed are
still visible in git log even after being deleted. Always check the full history.', 3
FROM topics t WHERE t.title = 'Git Basics';

-- ----------------------------------------------------------------
-- Git Topic 2: Branching and Merging
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Branching and Merging', 2 FROM categories WHERE name = 'Git';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Working with branches',
'Branches let you develop features in isolation without affecting the main code.

Commands:
  git branch               → list branches (* = current)
  git branch feature-x     → create a new branch
  git switch feature-x     → switch to that branch
  git switch -c feature-x  → create and switch (shortcut)
  git branch -d feature-x  → delete a merged branch
  git branch -D feature-x  → force delete

HEAD points to the current commit / branch.

Typical workflow:
  git switch -c fix/login-bug
  # make changes
  git add .
  git commit -m "Fix login bug"
  git switch main
  git merge fix/login-bug

Remote branches:
  git fetch              → download remote changes
  git pull               → fetch + merge
  git push origin branch → push branch to remote', 1
FROM topics t WHERE t.title = 'Branching and Merging';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Merging and resolving conflicts',
'Merging brings two branches together.

Commands:
  git merge feature-x          → merge feature-x into current branch
  git merge --no-ff feature-x  → always create a merge commit
  git merge --abort            → cancel a merge in progress

Conflicts happen when two branches change the same line differently.
Git marks conflicts in the file like this:

  <<<<<<< HEAD
  your version
  =======
  their version
  >>>>>>> feature-x

To resolve:
  1. Open the file and edit it to the correct final version
  2. Remove the conflict markers (<<<<, ====, >>>>)
  3. git add the file
  4. git commit

Tip: git status always shows which files have conflicts.', 2
FROM topics t WHERE t.title = 'Branching and Merging';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Rebase and cherry-pick',
'Rebase replays commits on top of another branch, giving a cleaner linear history.

Rebase:
  git rebase main          → replay current branch commits on top of main
  git rebase -i HEAD~3     → interactive rebase: reorder/squash last 3 commits
  git rebase --abort       → cancel rebase in progress

Interactive rebase actions (edit the list in your editor):
  pick   → keep commit as-is
  squash → combine with previous commit
  reword → keep but edit the message
  drop   → remove the commit entirely

Cherry-pick:
  git cherry-pick HASH     → apply a single commit from another branch

When to use each:
  merge  → preserves full history, good for shared branches
  rebase → cleaner history, good for local feature branches before merging

Never rebase commits that have already been pushed to a shared remote.', 3
FROM topics t WHERE t.title = 'Branching and Merging';

-- ----------------------------------------------------------------
-- Git Topic 3: Remote Repositories
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Remote Repositories', 3 FROM categories WHERE name = 'Git';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Working with remotes',
'A remote is a copy of your repository on another server (GitHub, GitLab, etc.).

Commands:
  git remote -v                      → list remotes with URLs
  git remote add origin URL          → add a remote named "origin"
  git remote remove origin           → remove a remote
  git remote rename origin upstream  → rename a remote

Pushing and pulling:
  git push origin main          → push local main to remote
  git push -u origin main       → push and set upstream (first time)
  git pull origin main          → fetch + merge from remote
  git fetch origin              → download but do not merge
  git push origin --delete branch   → delete remote branch

Cloning:
  git clone https://github.com/user/repo.git
  git clone git@github.com:user/repo.git   → SSH clone

CTF tip: Use git log --all --oneline on a cloned repo to see every
branch and commit, including ones not checked out locally.', 1
FROM topics t WHERE t.title = 'Remote Repositories';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Git secrets and forensics',
'Git history is permanent — deleted files and old commits are recoverable.

Investigating a repo:
  git log --all --oneline         → all commits across all branches
  git log --all --full-history -- "*.env"  → find commits touching .env
  git show HASH:path/to/file      → view a file as it was at a commit
  git diff HASH1 HASH2            → diff between two commits
  git stash list                  → list stashed changes
  git stash show -p stash@{0}     → show a stash diff
  git reflog                      → local history of HEAD movements

Finding secrets:
  git log -p | grep -i "password"
  git log -p | grep -i "flag"
  git log --all -p -- .env

Tools:
  trufflehog    → scans git history for secrets
  gitleaks      → similar secret scanner

Always check: branches, stashes, tags, and reflog — not just main!', 2
FROM topics t WHERE t.title = 'Remote Repositories';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Tags and releases',
'Tags mark specific commits with a meaningful name, usually version numbers.

Commands:
  git tag                       → list all tags
  git tag v1.0                  → create lightweight tag at HEAD
  git tag -a v1.0 -m "Release"  → annotated tag with message
  git tag -a v1.0 HASH          → tag a specific past commit
  git push origin v1.0          → push a tag to remote
  git push origin --tags        → push all tags

  git checkout v1.0             → check out a tagged commit
  git show v1.0                 → show tag details
  git tag -d v1.0               → delete local tag
  git push origin --delete v1.0 → delete remote tag

Annotated vs lightweight:
  Annotated tags store author, date, message — preferred for releases.
  Lightweight tags are just a pointer with no extra info.', 3
FROM topics t WHERE t.title = 'Remote Repositories';


-- ============================================================
-- DOCKER TOPICS & LESSONS
-- ============================================================

-- ----------------------------------------------------------------
-- Docker Topic 1: Docker Fundamentals
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Docker Fundamentals', 1 FROM categories WHERE name = 'Docker';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'What is Docker and how does it work?',
'Docker packages applications into containers — isolated environments that run
the same way on any machine.

Key concepts:
  Image      — a read-only blueprint (like a class)
  Container  — a running instance of an image (like an object)
  Dockerfile — instructions to build an image
  Registry   — a store of images (Docker Hub is the default)
  Layer      — images are built in layers; unchanged layers are cached

Why Docker?
  • "Works on my machine" is gone — containers are identical everywhere
  • Lightweight: shares the host OS kernel (not a full VM)
  • Fast startup: seconds, not minutes
  • Easy cleanup: remove a container, nothing is left behind

Architecture:
  Docker CLI → Docker daemon (dockerd) → containerd → runc → container

Install check:
  docker --version
  docker info', 1
FROM topics t WHERE t.title = 'Docker Fundamentals';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Running your first container',
'docker run creates and starts a container from an image.

Basic usage:
  docker run hello-world           → download and run a test image
  docker run ubuntu echo "hello"   → run a command in ubuntu container
  docker run -it ubuntu bash       → interactive shell in ubuntu
  docker run -d nginx              → run nginx in background (detached)
  docker run --name myapp nginx    → give container a name
  docker run --rm ubuntu ls        → auto-remove container when it exits

Useful flags:
  -i    → keep stdin open (interactive)
  -t    → allocate a pseudo-TTY (terminal)
  -d    → detached (background) mode
  --rm  → remove container automatically after exit
  -p 8080:80  → map host port 8080 to container port 80
  -e KEY=val  → set environment variable
  -v /host:/container  → mount a host directory

List containers:
  docker ps        → running containers
  docker ps -a     → all containers (including stopped)', 2
FROM topics t WHERE t.title = 'Docker Fundamentals';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Managing images and containers',
'Commonly used Docker management commands:

Images:
  docker images            → list local images
  docker pull ubuntu       → download image from registry
  docker rmi ubuntu        → remove an image
  docker image prune       → remove unused images

Containers:
  docker ps                → list running containers
  docker ps -a             → list all containers
  docker stop NAME         → gracefully stop container
  docker kill NAME         → force stop container
  docker rm NAME           → remove a stopped container
  docker container prune   → remove all stopped containers

Inspecting:
  docker logs NAME         → view container stdout/stderr
  docker logs -f NAME      → follow logs in real time
  docker inspect NAME      → detailed JSON info
  docker stats             → live CPU/RAM usage
  docker exec -it NAME sh  → open shell in running container
  docker diff NAME         → show filesystem changes

Clean up everything:
  docker system prune -a   → remove all unused images, containers, networks', 3
FROM topics t WHERE t.title = 'Docker Fundamentals';

-- ----------------------------------------------------------------
-- Docker Topic 2: Building Images
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Building Images', 2 FROM categories WHERE name = 'Docker';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Writing a Dockerfile',
'A Dockerfile is a script of instructions that Docker executes to build an image.

Common instructions:
  FROM ubuntu:22.04            → base image (always first)
  WORKDIR /app                 → set working directory
  COPY . .                     → copy files from host into image
  RUN apt-get update && \
      apt-get install -y curl  → run shell commands during build
  ENV PORT=3000                → set environment variable
  EXPOSE 3000                  → document which port the app uses
  CMD ["node", "server.js"]    → default command when container starts
  ENTRYPOINT ["node"]          → fixed entrypoint (CMD becomes args)

Example Dockerfile for a Node.js app:
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3000
  CMD ["node", "index.js"]

Best practices:
  • Use specific tags (node:20-alpine), not "latest"
  • Copy package.json before source code (better caching)
  • Combine RUN commands with && to reduce layers
  • Use .dockerignore to exclude node_modules, .git, etc.', 1
FROM topics t WHERE t.title = 'Building Images';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Building and tagging images',
'docker build reads a Dockerfile and creates an image.

Commands:
  docker build .                    → build from current directory
  docker build -t myapp:1.0 .       → build and tag as myapp:1.0
  docker build -t myapp .           → tag as myapp:latest
  docker build -f custom.Dockerfile .  → use a different Dockerfile
  docker build --no-cache .         → rebuild from scratch

Image tags:
  Format: name:tag  (e.g., nginx:1.25, ubuntu:22.04)
  "latest" is just a convention — it is not always the newest version.

  docker tag myapp:1.0 myapp:latest    → add another tag
  docker tag myapp user/myapp:1.0      → prepare for push to Docker Hub

Push to Docker Hub:
  docker login
  docker push user/myapp:1.0

Build context:
  Everything in the directory you pass to build is the "context".
  Use .dockerignore to exclude large/sensitive files:
    node_modules
    .git
    .env
    *.log', 2
FROM topics t WHERE t.title = 'Building Images';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Multi-stage builds and image optimization',
'Multi-stage builds produce small final images by separating build from runtime.

Example — Go application:
  # Stage 1: build
  FROM golang:1.22 AS builder
  WORKDIR /app
  COPY . .
  RUN go build -o server .

  # Stage 2: runtime (tiny image)
  FROM alpine:3.19
  COPY --from=builder /app/server /server
  CMD ["/server"]

The final image contains only the binary, not the Go compiler.
Result: image drops from ~1 GB to ~10 MB.

Optimization tips:
  • Use alpine or distroless base images
  • Combine RUN commands: RUN apt update && apt install -y curl && rm -rf /var/lib/apt/lists/*
  • Copy only what you need
  • Order layers from least to most frequently changed
  • Use .dockerignore

Check image size:
  docker images myapp
  docker history myapp:1.0   → see layer-by-layer sizes', 3
FROM topics t WHERE t.title = 'Building Images';

-- ----------------------------------------------------------------
-- Docker Topic 3: Docker Compose
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Docker Compose', 3 FROM categories WHERE name = 'Docker';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Introduction to Docker Compose',
'Docker Compose manages multi-container applications with a YAML file.

A docker-compose.yml defines:
  services   → the containers to run
  networks   → how containers communicate
  volumes    → persistent storage

Example:
  version: "3.9"
  services:
    web:
      image: nginx
      ports:
        - "8080:80"
    db:
      image: mysql:8
      environment:
        MYSQL_ROOT_PASSWORD: secret
        MYSQL_DATABASE: mydb
      volumes:
        - db_data:/var/lib/mysql
  volumes:
    db_data:

Key commands:
  docker compose up          → start all services
  docker compose up -d       → start in background
  docker compose down        → stop and remove containers
  docker compose logs        → view logs from all services
  docker compose ps          → list service containers
  docker compose build       → rebuild images

Services in the same compose file can reach each other by service name.
(e.g., web can connect to db:3306)', 1
FROM topics t WHERE t.title = 'Docker Compose';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Volumes and networking in Compose',
'Volumes persist data beyond a container''s lifetime. Networking connects services.

Volumes:
  # Named volume (managed by Docker)
  volumes:
    - db_data:/var/lib/mysql

  # Bind mount (maps host path to container path)
  volumes:
    - ./src:/app/src

  Commands:
    docker volume ls           → list volumes
    docker volume inspect db_data
    docker volume rm db_data   → delete (data is gone!)

Networking:
  All services in a compose file share a default network.
  They reach each other by service name as hostname.
  Example: a "web" service connects to MySQL at host "db", port 3306.

  Custom networks:
    networks:
      frontend:
      backend:
    service:
      networks:
        - frontend
        - backend

  Expose vs ports:
    ports: "8080:80"  → accessible from host at localhost:8080
    expose: "80"      → only accessible by other containers, not the host', 2
FROM topics t WHERE t.title = 'Docker Compose';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Compose environment variables and secrets',
'Compose supports environment variables and external .env files.

In docker-compose.yml:
  services:
    web:
      environment:
        - NODE_ENV=production
        - DB_HOST=db
        - DB_PASS=${DB_PASS}   # reads from host env or .env file

.env file (same directory as compose file):
  DB_PASS=supersecret
  API_KEY=abc123

  Compose automatically loads .env when you run docker compose up.

env_file directive:
  services:
    web:
      env_file:
        - .env
        - .env.production

Override files:
  docker-compose.yml          → base config
  docker-compose.override.yml → auto-merged (dev overrides)
  docker-compose.prod.yml     → apply with: docker compose -f docker-compose.yml -f docker-compose.prod.yml up

Security warning:
  Never commit .env files with real secrets to Git.
  Use docker secrets or a vault for production credentials.

CTF tip: docker-compose.yml and .env files found in repositories
often contain passwords, API keys, and flags.', 3
FROM topics t WHERE t.title = 'Docker Compose';

-- ----------------------------------------------------------------
-- Docker Topic 4: Docker Security
-- ----------------------------------------------------------------
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Docker Security', 4 FROM categories WHERE name = 'Docker';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Container isolation and escape basics',
'Containers are isolated but share the host kernel — they are not as isolated as VMs.

Default isolation:
  • Namespaces: separate PID, network, filesystem, user, IPC
  • cgroups: limit CPU and RAM
  • Seccomp: restrict syscalls

Common misconfigurations:
  --privileged flag         → gives full host access (dangerous!)
  Mounted docker socket     → -v /var/run/docker.sock:/var/run/docker.sock
  Running as root in container → best practice: use USER directive
  Writable host paths mounted → can modify host files

Privilege escalation via docker socket:
  If a container can access the Docker socket, it can run new privileged containers.
  docker run -v /:/host --privileged alpine chroot /host sh
  This gives root access to the entire host filesystem.

Best practices:
  • Never run --privileged unless absolutely required
  • Never mount the Docker socket
  • Run containers as non-root: USER 1001
  • Use read-only filesystems: --read-only
  • Scan images: docker scout cves myimage', 1
FROM topics t WHERE t.title = 'Docker Security';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT t.id, 'Inspecting containers for secrets',
'Containers and images can leak sensitive information.

Inspect a running container:
  docker inspect NAME              → full JSON config, env vars, mounts
  docker inspect NAME | grep -i env
  docker exec -it NAME env         → list environment variables
  docker exec -it NAME cat /etc/passwd

Inspect image layers:
  docker history IMAGE             → see commands used to build image
  docker save IMAGE -o img.tar     → export image as tar
  tar -xf img.tar                  → extract layers
  # each layer is a tar — extract and browse the filesystem

Look for:
  • Environment variables (passwords, API keys)
  • Files copied in but not deleted (.env, credentials.json)
  • Commands in RUN layers that show passwords in shell history
  • Mounted secrets left in the filesystem

Tools:
  dive IMAGE   → interactive TUI to explore image layers
  trivy IMAGE  → vulnerability and secret scanner

CTF tip: Run docker history on the challenge image and docker inspect
on a running container to find hidden flags.', 2
FROM topics t WHERE t.title = 'Docker Security';
