# 21UCD — User Centered Design

Created at the user's request on 13 September 2026 for mobile accessibility work.

## Baseline

- Repository: https://github.com/BIG-SLICK-GAMES/21holdem
- Branch: `21UCD`
- Isolated checkout: `D:/BIG-SLICK-GAMES/GAMES/21holdem-21UCD`
- Base commit: `8f771bba8bc5b040bc9a819409e96e635da56737` on `21WEBDEVNEXT`, plus the current tracked edits and the current frontend/shop assets, tests and documentation.
- This is a source-workspace snapshot. It also preserves pre-existing local backend edits; it is not a claim that every backend edit is deployed on production.
- The unrelated untracked `website/` prototype, dependencies, local credentials and runtime artifacts were not copied into this snapshot.

## User requirements

The user is happy with the PC website. Preserve its appearance and behavior.
Use this branch for a separate mobile presentation that improves readability and accessibility: larger cards and text, larger touch controls, stronger contrast, reduced clutter, screen-reader labels and an optional Easy View mode.

The initial branch creation was a snapshot. On 14 September 2026 the user explicitly requested the mobile redesign and publication at `https://21-holdem.com/mobile`.
That separate mobile experience is now implemented with normal and Easy View modes. See `MOBILE_PREVIEW.md` for its architecture, deployment isolation and validation.
Future implementations must keep mobile components/styles isolated and verify desktop behavior remains unchanged.

## Isolation

- Leave the original checkout and its uncommitted files on `21WEBDEVNEXT` unchanged.
- Leave `https://21-holdem.com` and the desktop Docker preview at `http://192.168.0.109:3100/lobby` unchanged.
- Use a separate Docker service/port for future UCD previews; do not start host services.
- No deployment, staging promotion or PR merge is part of branch creation.

## Local UCD preview

Open http://192.168.0.109:3106/lobby from this PC or a phone on the same LAN/Wi-Fi. Keep the PC and Docker running. The address may change if the PC's LAN IP changes.

Start from this checkout with `docker compose -f docker-compose.ucd.yml up -d`; stop with `docker compose -f docker-compose.ucd.yml stop`. Source edits are bind-mounted; frontend changes reload automatically, while backend edits require `docker compose -f docker-compose.ucd.yml restart backend`.

The preview uses a fresh `holdem_21ucd` database on the existing `holdem-mongodb` Docker service and its own Redis instance. Existing live/desktop accounts and balances are not copied. Use a separate preview account or guest play. The MongoDB container and `21holdem_default` network must already exist.

The backend uses the existing local `21holdem-game-backend` image for dependencies via `NODE_PATH`. The frontend mounts the existing `21holdem_holdem_frontend_node_modules` dependency volume read-only, with its own writable cache volume. Changes to dependencies need a separately prepared dependency volume before updating this configuration. No production payment credentials are configured.
