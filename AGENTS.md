# Agent Instructions

## User-confirmed active frontend

- **18 September 2026: the user approved the current 21UCD site as the main site and explicitly requested replacing all of `WEBDEV` with this snapshot, then publishing it at `https://21-holdem.com`. This supersedes the earlier mobile-only deployment restriction below.**
- `21UCD` is the approved source; `WEBDEV` is its production promotion branch. Build `frontend/` with `PUBLIC_URL=/` for the main domain, and `/mobile` for the existing mobile preview. Preserve `main`, the backend deployment, and other local checkouts. See `docs/WEBDEV-PROMOTION.md`.

- This checkout is branch `21UCD`: User Centered Design, explicitly requested on 13 September 2026.
- Work exclusively on `21UCD` until the user explicitly resumes another branch. Its menu is now an app-style bar locked to the bottom at every viewport width. Preserve the approved PC site on its separate branch and deployment.
- Keep desktop baseline checkout `D:/BIG-SLICK-GAMES/GAMES/21holdem` on `21WEBDEVNEXT` untouched.
- Edit `frontend/`, the black-and-gold site confirmed by the user.
- Existing desktop Docker source preview: `http://192.168.0.109:3100/lobby`. Do not repoint it to this checkout. Future UCD previews must use a separate Docker service/port.
- Public site: `https://21-holdem.com`.
- On 15 September 2026 the user rejected the mobile redesign and requested a fresh start. Source was restored to original-site snapshot `f1b4f95`; the former mobile work and pending daily-reward/device-routing changes are backed up on `backup/21UCD-before-restart-20260915`.
- Local source preview: `http://192.168.0.109:3106/lobby`, using `docker-compose.ucd.yml`. The user subsequently reconfirmed that `https://21-holdem.com/mobile` must serve `21UCD`. Deploy this restored original-site branch with its new mobile bottom menu there, using `PUBLIC_URL=/mobile`. Do not restore the rejected redesign or change the main desktop deployment.
- Do not switch to `WEBDEV`, `21WEBDEV`, or either `website/` prototype without an explicit user request.
- See `docs/ACTIVE_FRONTEND.md` for the current deployment mapping.
- Creating this branch does not authorize deploying UCD changes over the current desktop/live build. See `docs/21UCD.md` for branch scope.

## Mandatory Runtime Rule

- The user explicitly instructed: **never touch the game**. App design/theme changes must exclude gameplay, its table, backgrounds, controls and mechanics. Keep app theme styles behind the non-game route marker; do not alter shared game tokens or assets.
- Specific exception subsequently authorised on 15 September: correct mobile table/player seating and remove the table/background adjuster controls on 21UCD. This does not authorise game-theme or mechanics changes.

- Never use `localhost` or locally started host services for this project.
- Always use the Docker-based services and the configured local Mongo server.
- No exceptions. Do not start, test against, or recommend `localhost` URLs, local host ports, or non-Docker runtime paths.
