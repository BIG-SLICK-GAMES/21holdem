# Daily rewards in 21UCD

The smallest valid shop chip pack wins 9,999 of 10,000 equally likely server-side random draws. The remaining draw attempts the 50,000-chip jackpot. All other packs are excluded. A missing jackpot or a closed global gate falls back to the smallest pack; without a pack below 50,000, claims are unavailable.

The jackpot is capped across all users and API processes, with eligibility returning 12 calendar months after the successful credit (UTC; February 29 clamps to February 28). This is a maximum, not a guaranteed yearly winner. While locked, the smallest pack wins 100% of claims.

The singleton `daily_reward_jackpots` document uses MongoDB's unique `_id` to reserve the award atomically. A confirmed lost daily-claim race releases its own reservation. Ambiguous failures leave `bPending: true` and block further jackpots, including after the anniversary. Operators must reconcile a pending reservation against its user's reward snapshot and transaction ID before releasing it or setting a new eligibility date. Never blindly delete this gate or reset it during a deploy. Ledger repair does not re-credit chips.

This policy starts with an empty gate when first deployed; review any previous 50,000-chip awards and seed a gate if the cap must include historical payouts. No deployment has been performed as part of this change.

Run `npm run test:daily-rewards` in an isolated Docker container with `MONGO_URI` pointing to the configured Docker MongoDB. Tests use unique temporary collections and remove them afterward.
