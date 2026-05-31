# Apache Mapping

- Apache serves the frontend domain `21-holdem.com`.
- Static frontend build path is `/var/www/html/game_build/build`.
- API requests are proxied from `/api/` to `127.0.0.1:3050/api/`.
- Apache must be reloaded after mapping changes.
