# Server Mapping

Current live mapping is documented in `deployment-notes/CURRENT_LIVE_SERVER_STATE.md`.

The clean target mapping is:

- Public frontend: `https://21-holdem.com`
- Public API routes: `https://21-holdem.com/api/...`
- Backend process port on EC2: `3050`
- MongoDB: private EC2 service on `127.0.0.1:27017`
- Redis: private EC2 service on `127.0.0.1:6379`

Keep deployment mapping in documentation and environment files. Do not hardcode live paths or hosts into source code.
