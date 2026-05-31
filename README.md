# 21 Hold'em

Clean repo-ready workspace for the 21 Hold'em frontend and backend.

## Structure

- `frontend/` - React player frontend.
- `backend/` - Node/Express game API and Socket.IO backend.
- `docs/` - local development, deployment, environment, and hotfix notes.
- `scripts/` - local-only PowerShell helpers.
- `env-templates/` - safe environment templates for deployment planning.
- `deployment-notes/` - current live-server mapping notes for operators.

## Safety Rules

- Do not commit real `.env` files.
- Do not commit secrets.
- Do not commit `node_modules`, `build`, `dist`, logs, caches, or `.git` folders copied from old projects.
- Make source changes in this repo first, then deploy through the approved deployment flow.

See `docs/ENVIRONMENT_RULES.md` before changing endpoint or environment variables.
