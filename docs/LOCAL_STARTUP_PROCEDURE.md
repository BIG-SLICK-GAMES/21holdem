# Local Startup Procedure

Last verified: 2026-06-09

This is the current safe startup path for testing 21 Hold'em from a phone on the same network as the development PC.

## Current Shape

- Docker is used for local MongoDB and Redis only.
- The official Docker compose file is `D:\BSG DEV\DEV-Control\docker\docker-compose.dev.yml`.
- The backend runs from `D:\BSG DEV\Projects\21Holdem\backend` on port `4000`.
- The frontend runs from `D:\BSG DEV\Projects\21Holdem\frontend` on port `3003`.
- The phone opens the frontend through the PC LAN IP.
- The active local database is `bigslickgames_dev_21holdem`.

Do not use the old `D:\BIGSLICKGAMES\games\Bigslickgames` startup path for this project.

## Guardrails

- Do not touch EC2.
- Do not deploy.
- Do not point local apps at Atlas.
- Do not point local apps at `bigslickgames_live`.
- Do not delete Docker volumes during normal recovery.
- Do not use `D:\BSG DEV\SharedDevServices` for this stack.
- Keep real `.env` files ignored by Git.

## 1. Confirm The LAN IP

Run:

```powershell
ipconfig
```

Use the IPv4 address on the active home network adapter. The last verified address was:

```text
192.168.0.111
```

If the router assigns a different address, update the frontend and backend local env files to use the new LAN IP.

## 2. Start Official Local Docker Services

Run:

```powershell
docker compose -f "D:\BSG DEV\DEV-Control\docker\docker-compose.dev.yml" up -d
```

Verify:

```powershell
docker ps --filter "name=bsg-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected containers:

- `bsg-mongo-dev`
- `bsg-redis-dev`

Both should be healthy.

## 3. Backend Env

Backend env files:

- `D:\BSG DEV\Projects\21Holdem\backend\.env`
- `D:\BSG DEV\Projects\21Holdem\backend\.env.local`

Required local values:

```text
NODE_ENV=development
APP_ENV=local
GAME_ID=21holdem
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/bigslickgames_dev_21holdem
DB_URL=mongodb://127.0.0.1:27017/bigslickgames_dev_21holdem
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
BASE_API_PATH=http://192.168.0.111:4000/api/v1
FRONTEND_URL=http://192.168.0.111:3003
STRIPE_SUCCESS_URL=http://192.168.0.111:3003/shop?checkout=success
STRIPE_CANCEL_URL=http://192.168.0.111:3003/shop?checkout=cancel
```

Keep secrets such as JWT, hash, bot, and Stripe keys in ignored env files only.

## 4. Frontend Env

Frontend env files:

- `D:\BSG DEV\Projects\21Holdem\frontend\.env`
- `D:\BSG DEV\Projects\21Holdem\frontend\.env.local`

Required local values:

```text
REACT_APP_API_ENDPOINT=http://192.168.0.111:4000
REACT_APP_ENVIRONMENT=local
REACT_APP_STRIPE_PUBLISHABLE_KEY=
```

Put the Stripe publishable key in ignored local env only when testing checkout.

## 5. Start Backend

Open a terminal:

```powershell
Set-Location "D:\BSG DEV\Projects\21Holdem\backend"
npm start
```

Expected healthy output includes:

- MongoDB connected
- Redis connected
- backend listening on `4000`

Verify:

```powershell
Invoke-WebRequest -UseBasicParsing "http://192.168.0.111:4000/ping"
```

Expected result:

- HTTP `200`
- body `{}`

## 6. Start Frontend For Phone Testing

Open another terminal:

```powershell
Set-Location "D:\BSG DEV\Projects\21Holdem\frontend"
$env:HOST='0.0.0.0'
$env:PORT='3003'
$env:BROWSER='none'
$env:REACT_APP_API_ENDPOINT='http://192.168.0.111:4000'
npm start
```

Phone URL:

```text
http://192.168.0.111:3003
```

The phone must be on the same network as the development PC.

## 7. Verification Checklist

Docker:

```powershell
docker ps --filter "name=bsg-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Ports:

```powershell
netstat -ano | Select-String -Pattern ':3003 ',':4000 ',':27017 ',':6379 '
```

Backend:

```powershell
Invoke-WebRequest -UseBasicParsing "http://192.168.0.111:4000/ping"
```

Frontend:

```powershell
curl.exe -I --max-time 10 "http://192.168.0.111:3003/"
```

Login endpoint CORS:

```powershell
curl.exe --max-time 15 -s -i -X OPTIONS "http://192.168.0.111:4000/api/v1/auth/login" -H "Origin: http://192.168.0.111:3003" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

Expected login preflight result:

- HTTP `204`
- `Access-Control-Allow-Origin: *`

## 8. Fast Failure Guide

### Phone Cannot Open The Frontend

- Confirm the phone is on the same network.
- Confirm `curl.exe -I --max-time 10 "http://192.168.0.111:3003/"` works from the PC.
- Confirm the frontend was started with `HOST=0.0.0.0`.
- Check Windows firewall if the PC can open the page but the phone cannot.

### Login Shows Network Error

- Confirm backend ping returns HTTP `200`.
- Confirm the frontend env points to `http://192.168.0.111:4000`.
- Restart the frontend after changing env files, because CRA reads env at startup.
- Confirm the CORS preflight command in section 7 returns HTTP `204`.

### Docker Is Running But Login Fails

That is no longer a network error. Check the user account, password, verification state, and local restored database contents in `bigslickgames_dev_21holdem`.

## 9. Shutdown

Stop Node/CRA by closing the backend and frontend terminals.

Stop Docker services without deleting volumes:

```powershell
docker compose -f "D:\BSG DEV\DEV-Control\docker\docker-compose.dev.yml" stop
```
