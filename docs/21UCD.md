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

On 15 September 2026 the user requested a fresh start from the original site. The branch source was restored to snapshot `f1b4f95`, before the mobile redesign. The user likes the app feel, but rejected the redesigned mobile version. Wait for the next design direction before rebuilding it.

All previous mobile work, including pending daily-reward and device-routing changes, is preserved on GitHub branch `backup/21UCD-before-restart-20260915` (snapshot `07d0dec`). The prior generated build was moved to `D:/BIG-SLICK-GAMES/.codex-runtime/21UCD-build-before-restart-20260915`. The former production QA container is stopped to avoid showing that stale build.

Fresh local source runs at `http://192.168.0.109:3106/lobby`. The isolated Docker configuration is retained, but the mobile-specific source and routes have been removed. The public `/mobile` deployment remains unchanged by this source reset.

## Isolation

- Leave the original checkout and its uncommitted files on `21WEBDEVNEXT` unchanged.
- Leave `https://21-holdem.com` and the desktop Docker preview at `http://192.168.0.109:3100/lobby` unchanged.
- Use the separate `docker-compose.ucd.yml` services for UCD previews; do not start host services.
- No deployment, staging promotion or PR merge is part of branch creation.
