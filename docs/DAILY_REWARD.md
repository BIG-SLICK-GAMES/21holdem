# Daily shop reward

The Rewards page offers one randomly selected shop chip package per player per UTC calendar day. The pool reads Setting.aShop on every request; new valid chip packages participate automatically with equal probability. A package must have a positive integer nChips and a positive nPrice. An empty shop disables claims without consuming the day. The existing shop only fulfills chip packages; future non-chip products need an inventory/grant handler before joining this pool.

The server chooses with crypto.randomInt. A conditional atomic Mongo update records the timestamp and prize snapshot while incrementing chips. Old calendar claims made today still count. GET does not reset streaks or claim dates. The selected prize remains visible after refresh.

A stable transaction ID is persisted with the claim. Ledger writes are idempotent; if one fails after crediting, a later status read repairs it. The next claim repairs the prior ledger before replacing its snapshot. No credits are repeated during repair.

The chest uses generated closed/open WebP artwork, CSS motion and a gold reveal. Reduced-motion preferences disable movement. Claim errors keep the reward available for retry; the server remains authoritative after network interruptions.

Run the integration checks inside the Docker backend against its configured Mongo service:

    docker exec holdem-game-backend npm run test:daily-rewards

The check creates uniquely named temporary collections and removes those collections afterward. It covers concurrent claims, concurrent chip increments, UTC rollover, shop additions, empty shop, legacy claims and interrupted-ledger repair.
