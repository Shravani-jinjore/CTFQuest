# CTFQuest Security Notes

## Protections in place

| Area | Protection |
|---|---|
| Passwords | Hashed with bcrypt (cost 10), never stored or returned in plain text |
| Login errors | Same message for wrong email and wrong password, so emails can't be discovered |
| Sessions | JWT signed with `JWT_SECRET`, expires after 1 hour |
| SQL injection | Every query uses `?` placeholders |
| Flags | Stored as SHA-256 hashes. Validated only on the server. Never sent to the browser |
| XP abuse | `UNIQUE (user_id, challenge_id)` plus a transaction means XP is awarded once |
| Hints | The server decides the next level, so players can't skip ahead |
| Admin routes | `requireAdmin` checks the role in MySQL on every request, not just the token |
| Abuse | Rate limits on login/register (10 per 15 min per IP) and flag submission (10 per min per user) |
| Headers and CORS | `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`. CORS limited to the frontend origin. JSON bodies capped at 10 KB |
| Terminal | WebSocket requires a valid JWT as its first message. The container name comes from the token's user id, never from the client |

## Challenge container isolation

Each challenge runs in its own container with: non-root user, 128 MB memory, 0.5 CPU, 64 process limit, no network, all Linux capabilities dropped, `no-new-privileges`, read-only filesystem (writable `/tmp` only), a 30 minute timeout, cleanup on server start, and a cap of 2 containers per user. Challenge containers never receive the Docker socket.

## Known limitations

| Limitation | Why it matters | Future fix |
|---|---|---|
| Token stored in `localStorage` | A script injection (XSS) could steal it | HttpOnly cookie |
| Same flag for every player | One player can share the flag | Unique flag generated per session |
| Flag readable via `docker history` on the image | Anyone with access to the image can read it | Inject the flag when the container starts |
| Backend user is in the `docker` group | That group is effectively root on the host | Dedicated host or VM, rootless Docker |
| In-memory rate limiter | Resets on restart, not shared between servers | Shared store |
| Container cap is not atomic | Two simultaneous requests could pass the check | Lock or database counter |
| No HTTPS in development | Tokens travel unencrypted on localhost | HTTPS via a reverse proxy in deployment |
| JWTs can't be revoked | A stolen token works until it expires | Short expiry plus refresh tokens |
| Streak uses the database server's timezone | Edge cases near midnight | Store a timezone per user |
| Deleting a challenge removes completion records | Earned XP stays, but history is lost | Soft delete |

## Reporting an issue

Open a GitHub issue, but do not post secrets or working exploits.