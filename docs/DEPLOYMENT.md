# Deployment

Current deployment flow:

1. Push the clean repo to the new GitHub organization.
2. EC2 pulls the repo.
3. Frontend builds from `frontend/`.
4. Frontend build output copies to `/var/www/html/game_build/build`.
5. Backend syncs to `/var/www/html/Bigslick_Game_Backend` or a future clean path.
6. PM2 process `game-apis` restarts.
7. Apache reloads.
8. Test `https://21-holdem.com`.
9. Test guest flow: `guestLogin`, guest board join, table load, and socket gameplay.

Do not deploy directly from this clean repo workspace until the deployment path is configured and reviewed.
