# Agent Instructions

## User-confirmed active frontend

- This checkout is branch `21UCD`: User Centered Design, explicitly requested on 13 September 2026.
- Work on mobile accessibility here. Preserve the approved PC layout and behavior.
- Keep desktop baseline checkout `D:/BIG-SLICK-GAMES/GAMES/21holdem` on `21WEBDEVNEXT` untouched.
- Edit `frontend/`, the black-and-gold site confirmed by the user.
- Existing desktop Docker source preview: `http://192.168.0.109:3100/lobby`. Do not repoint it to this checkout. Future UCD previews must use a separate Docker service/port.
- Public site: `https://21-holdem.com`.
- On 15 September 2026 the user rejected the mobile redesign and requested a fresh start. Source was restored to original-site snapshot `f1b4f95`; the former mobile work and pending daily-reward/device-routing changes are backed up on `backup/21UCD-before-restart-20260915`.
- Local fresh-source preview: `http://192.168.0.109:3106/lobby`, using `docker-compose.ucd.yml`. The prior public `/mobile` release remains deployed separately; do not treat it as this branch's current source or redeploy the rejected redesign.
- Do not switch to `WEBDEV`, `21WEBDEV`, or either `website/` prototype without an explicit user request.
- See `docs/ACTIVE_FRONTEND.md` for the current deployment mapping.
- Creating this branch does not authorize deploying UCD changes over the current desktop/live build. See `docs/21UCD.md` for branch scope.

## Mandatory Runtime Rule

- Never use `localhost` or locally started host services for this project.
- Always use the Docker-based services and the configured local Mongo server.
- No exceptions. Do not start, test against, or recommend `localhost` URLs, local host ports, or non-Docker runtime paths.
