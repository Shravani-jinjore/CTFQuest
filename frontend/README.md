# CTFQuest

Learn. Practice. Get Stuck. Conquer the Challenge.

A gamified platform for learning Linux, Git, and Docker through CTF-style challenges. Each challenge runs in a private, locked-down Docker container, reachable from a terminal in the browser.

## Features

- Lessons organised as categories, topics, and lessons
- CTF challenges with flag validation and a private container per player
- Browser terminal (xterm.js over WebSocket) attached to the container
- Five-level hint system ("I'm stuck"), where each hint costs 10% of the XP
- XP, levels, badges, daily streaks, and a leaderboard
- Admin API and page for managing challenges
- OpenAPI docs at `/api/docs`
- Jest, Supertest, and Newman tests, run by GitHub Actions

## Architecture

## Tech stack

React, JavaScript, CSS, Node.js, Express, MySQL, Docker, WebSockets (`ws`, xterm.js), JWT, bcrypt, Jest, Supertest, Postman/Newman, Swagger/OpenAPI, GitHub Actions.

## Run it locally

Requirements: Node 20.19+ (22 recommended), MySQL 8, Docker.

1. Copy `.env.example` to `.env` and fill in real values.
2. Create the database and user in MySQL, then load the schema and seed:
```bash
   mysql -u ctfquest -p ctfquest < backend/sql/schema.sql
   mysql -u ctfquest -p ctfquest < backend/sql/seed.sql
```
3. Build the challenge image with a flag of your choice, and save its hash:
```bash
   FLAG="CTFQUEST{$(openssl rand -hex 8)}"
   docker build --build-arg FLAG="$FLAG" -t ctfquest/linux-hidden-file challenges/linux/hidden-file
   mysql -u ctfquest -p ctfquest -e "UPDATE challenges SET flag_hash = SHA2('$FLAG', 256) WHERE title = 'Hidden File';"
```
4. Start the backend: `cd backend && npm install && npm run dev`
5. Start the frontend: `cd frontend && npm install && npm run dev`
6. Open http://localhost:5173

## Tests

```bash
cd backend
npm test
```

Tests run against a separate `ctfquest_test` database and refuse to run on any other.

## Security

See [docs/SECURITY.md](docs/SECURITY.md) for what is protected and the known limitations.