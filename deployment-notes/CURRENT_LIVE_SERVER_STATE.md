# Current Live Server State

- Live EC2 IP: `52.65.47.126`
- Apache currently serves `21-holdem.com`.
- Frontend build path: `/var/www/html/game_build/build`
- Backend path: `/var/www/html/Bigslick_Game_Backend`
- Backend entry: `index.js`
- PM2 process: `game-apis`
- Backend port: `3050`
- Apache proxy: `/api/` to `127.0.0.1:3050/api/`
- DNS in Route 53 points `21-holdem.com`, `www`, and `api` to `52.65.47.126`.
- SSL renewed through Certbot, expires `2026-08-29`.
- Backups were created on EC2 before live patching.
