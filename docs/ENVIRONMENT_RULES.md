# Environment Rules

- Do not hardcode localhost endpoints in source code.
- Localhost is allowed only in local environment examples and documentation.
- Production frontend `REACT_APP_API_ENDPOINT` must be `https://21-holdem.com`.
- The frontend query files append `/api/v1` themselves, so do not include `/api` or `/api/v1` in the production frontend endpoint.
- Production backend uses private EC2 services: `DB_URL=mongodb://127.0.0.1:27017/holdem_live`, `REDIS_HOST=127.0.0.1`, and `REDIS_PORT=6379`.
- Real env files must never be committed.
- Never commit Stripe secret keys, JWT secrets, hash keys, SMTP passwords, AWS keys, Google secrets, Square secrets, Razorpay secrets, or bot passwords.
