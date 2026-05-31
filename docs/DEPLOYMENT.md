# Deployment

This repo is prepared for deployment management, but it does not contain a script that connects to EC2 or deploys automatically.

## Required Preflight

Run these from the repo root before a production deployment:

```powershell
.\scripts\safety-check.ps1
.\scripts\backend-syntax-check.ps1
.\scripts\preflight.ps1
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the same safety checks, backend rules tests, and frontend production build on pushes and pull requests to `main`.

## Current Manual Deployment Flow

1. Push the clean repo to GitHub.
2. Confirm CI is passing on `main`.
3. EC2 pulls the repo.
4. Frontend builds from `frontend/`.
5. Frontend build output copies to `/var/www/html/game_build/build`.
6. Backend syncs to `/var/www/html/Bigslick_Game_Backend` or a future clean path.
7. PM2 process `game-apis` restarts.
8. Apache reloads.
9. Test `https://21-holdem.com`.
10. Test guest flow: `guestLogin`, guest board join, table load, and socket gameplay.

## Server Templates

Reference-only templates are in `deployment-notes/`:

- `apache-21holdem.example.conf`
- `pm2.ecosystem.example.js`
- `DEPLOYMENT_PREFLIGHT_CHECKLIST.md`

Review and adapt these on the server. Do not commit real server env files or secrets.
