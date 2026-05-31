# Deployment Preflight Checklist

This checklist prepares a deploy; it does not deploy anything by itself.

## Local Repo Checks

- Run `.\scripts\safety-check.ps1`.
- Run `.\scripts\backend-syntax-check.ps1`.
- Run `.\scripts\preflight.ps1` before a tagged release or production deploy.
- Confirm `git status --short` contains only intentional source, docs, script, or template changes.
- Confirm no real `.env` files are present.
- Confirm `frontend/build`, `node_modules`, `backups`, `.codex-mailbox`, `_backup*`, zip files, and copy scratch files are not tracked.

## Server-Only Checks

- Confirm production env files exist only on EC2.
- Confirm `SYSTEM_BOT_PASSWORD`, `JWT_SECRET`, `HASH_KEY`, Stripe secrets, SMTP credentials, AWS keys, Google secrets, Square secrets, and Razorpay secrets are server-only values.
- Confirm MongoDB and Redis remain private services.
- Confirm backups exist before updating the live backend or frontend build.

## Release Checks

- Frontend endpoint must be `https://21-holdem.com`.
- Backend `BASE_API_PATH` must be `https://21-holdem.com/api/v1`.
- Backend port must match PM2 and Apache proxy mapping.
- Smoke test after deployment:
  - `https://21-holdem.com`
  - login
  - guest login
  - guest board join
  - guest table load
  - Socket.IO gameplay connection
