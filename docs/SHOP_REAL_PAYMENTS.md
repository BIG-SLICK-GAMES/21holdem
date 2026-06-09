# 21 Hold'em Shop Real Payments

This shop uses Stripe Checkout for real payment flow. Local free-credit fallback is disabled: buying chips must create a Stripe Checkout Session or fail.

## Local Env

Backend `backend\.env.local` needs:

```env
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_ME
STRIPE_CURRENCY=usd
STRIPE_SUCCESS_URL=http://192.168.0.111:3003/shop?checkout=success
STRIPE_CANCEL_URL=http://192.168.0.111:3003/shop?checkout=cancel
```

Frontend `frontend\.env.local` needs:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_ME
```

Use Stripe test keys first. Do not commit real `.env` or `.env.local` files.

## Local Webhook

For local testing, forward Stripe events to the backend:

```powershell
stripe listen --forward-to http://192.168.0.111:4000/api/v1/shop/stripe/webhook
```

Copy the printed `whsec_...` value into `backend\.env.local` as `STRIPE_WEBHOOK_SECRET`, then restart the backend.

The backend listens for `checkout.session.completed` and credits chips only after Stripe reports the session as paid.

## Flow

1. Start local Docker Mongo and Redis.
2. Start the 21 Hold'em backend on port `4000`.
3. Start the 21 Hold'em frontend on port `3003`.
4. Open the shop from the lobby or in-game shop button.
5. Choose a chip pack.
6. Stripe Checkout opens.
7. After successful payment, Stripe redirects to `/shop?checkout=success&session_id=...`.
8. The frontend calls `/api/v1/shop/confirm`.
9. The backend verifies the Checkout Session with Stripe and credits chips.

## Safety

- No Stripe key means no chips are credited.
- Local test payments should use Stripe test cards only.
- Live mode requires live `sk_live_...` and `pk_live_...` keys and a live webhook secret.
- Keep live keys out of git and out of logs.
- Do not use production Stripe keys in casual local testing.

References:
- Stripe Checkout Sessions: https://docs.stripe.com/api/checkout/sessions
- Stripe Checkout fulfillment: https://docs.stripe.com/checkout/fulfillment
