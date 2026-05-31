# Guest Auth Hotfix

## Issue

- `POST /api/v1/auth/guestLogin` worked.
- `POST /api/v1/poker/guest/board/join` initially failed with `404` until the backend route was updated.
- After the route was reachable, the join request failed with `401 Unauthorized`.
- The failure was caused by guest token format and return-shape mismatch between frontend and backend auth handling.

## Fix

- `frontend/src/query/guest.query.js` normalizes guest tokens and sends a clean `Authorization` header.
- `frontend/src/views/guest/session.js` accepts token returns from response headers, `data.authorization`, or `data.sToken`.
- `backend/app/routers/middleware/index.js` accepts raw JWT or `Bearer <token>` format before comparing against `user.sToken`.
- `backend/app/routers/game/auth/lib/controllers.js` generates guest token `_id` as a string and returns `authorization` in the `guestLogin` response body as well as the response header.

## Expected Result

- `guestLogin` returns a valid guest token.
- Guest board join receives `Authorization`.
- `isGuestAuthenticated` accepts the guest user.
- Guest table loads.
