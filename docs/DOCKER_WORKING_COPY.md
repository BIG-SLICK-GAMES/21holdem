# Docker Working Copy

This repo must run through Docker services only.

## Start

```powershell
.\scripts\build-frontend-docker.ps1
docker compose up -d --build
```

## Verify

```powershell
docker compose ps
docker compose exec game-backend node -e "require('http').get('http://game-backend:4000/ping', r => { console.log(r.statusCode); process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', e => { console.error(e.message); process.exit(1); })"
docker compose exec mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok"
docker compose exec redis redis-cli ping
```

## Browser Entry

Use the Docker-published frontend port `3100` through the Windows computer name or machine address. The frontend container proxies `/api` and `/socket.io` to `game-backend` over the Docker network.

```powershell
"http://$env:COMPUTERNAME`:3100"
```

Project launcher:

```powershell
"http://$env:COMPUTERNAME`:3200"
```

## Rebuild Frontend Bundle

Run this after frontend source changes:

```powershell
.\scripts\build-frontend-docker.ps1
docker compose build game-frontend
docker compose up -d game-frontend
```

## Services

- `mongodb`: MongoDB 7 with persisted `mongodb_data`
- `redis`: Redis 7 with persisted `redis_data`
- `game-backend`: Node/Express API on the Docker network
- `game-frontend`: nginx-served React build and API/socket proxy
