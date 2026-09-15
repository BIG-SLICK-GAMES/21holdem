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

Fresh local source runs at `http://192.168.0.109:3106/lobby`. The isolated Docker configuration is retained, but the mobile-specific source and routes have been removed.

After the user's follow-up on 15 September, the public mobile redesign was withdrawn too. Apache `/etc/apache2/21holdem-mobile.conf` redirects `/mobile`, its former page routes, and unknown mobile pages to the original `/lobby`. Static assets remain available for existing cached clients. The previous configuration is backed up as `/etc/apache2/21holdem-mobile.conf.before-reset-20260915`. Apache configuration and reload passed; public browser checks confirmed the original lobby and no UCD layout. The original desktop index SHA256 remains `7136417d3fe75f8da3e638aec4c56fa99fedf148320c0c7ff3f464f11942f793`.

The EC2 root disk was full. The obsolete `/tmp/21holdem-topbar-0235da7.tar.gz` deployment archive was copied to local `.codex-runtime`, SHA256-verified, then removed from EC2, recovering enough space for the configuration fix. Only about 42 MB remained afterward; disk capacity still needs attention.

## Bottom navigation and public branch preview — 15 September

The user requested an app-style bottom menu on the restored original site and explicitly reconfirmed that `/mobile` should serve `21UCD`. At widths below 768px, the existing Play, Learn, Rewards, Private and BSG Hub menu becomes a fixed black-and-gold bottom bar with labelled icons, larger touch targets and safe-area spacing. Desktop menu rules are preserved.

Build with `PUBLIC_URL=/mobile`; React Router uses this base path. Authentication redirects and the game exit fallback also retain the base path. The Apache mobile alias must serve the new build and fall back to `/mobile/index.html` for application routes, replacing the temporary withdrawal redirect. The main desktop DocumentRoot remains unchanged.

Deployed source commit `8a9a5cb` to `/var/www/html/releases/21ucd-bottom-menu-20260915/build`, linked from `/var/www/html/mobile_build/build`. Public browser checks passed at 320px, 390px and 1280px, including menu selection, touch target and label bounds, mobile entry and the settings deep link. Desktop index SHA256 stayed unchanged. The Docker production preview is available at `http://192.168.0.109:3107/mobile`; the source preview was restarted after building.

Before deploying, system journals were archived locally as `.codex-runtime/21ucd-journal-backup-20260915.tgz` and SHA256-verified (`660efcae5e5a0387c6e992dfd3ec172d9a53fe8b3478f9599fb4a6f17bacfac1`), then older journals were vacuumed to recover space. About 159 MB remained after publishing. Apache rollback configuration: `/etc/apache2/21holdem-mobile.conf.before-bottom-20260915`; previous release: `21ucd-mobile-live-entry-20260914` with the withdrawal redirect.

## Isolation

### Learn cards - 15 September

The Learn tab now uses nine swipeable, illustrated information cards with Back/Next and keyboard navigation. Interactive examples explain ace values and Hit/Stand, followed by a short quiz. The existing guided hand opens on demand and unmounts when closed or when leaving Learn. Card illustrations are native HTML/SVG, with no additional image downloads. Double Down help text now matches the backend's round-2 availability after the first community card; game mechanics are unchanged.

Release: `/var/www/html/releases/21ucd-learn-cards-20260915/build`, served only through `/mobile`. Previous mobile release: `21ucd-page-headings-20260915`. Docker production build and browser checks covered touch swipes, keyboard navigation, interactive examples, guided-hand mounting, the Play link and 320px layout. The desktop index hash remained unchanged during deployment.

The user's latest direction is to edit **21UCD only** until they explicitly resume another branch. Within 21UCD, the app menu is locked to the bottom at all viewport widths, replacing the earlier phone-only behavior and removing the scroll-driven top-menu positioning. The separate main PC site remains unchanged.

This update (`ba21f02`) is deployed at `/var/www/html/releases/21ucd-locked-menu-20260915/build`. Local and public browser checks passed at 320px, 390px and 1280px, including pinned placement after scrolling, button bounds, menu selection and deep links. The desktop index hash was unchanged. Rollback config: `/etc/apache2/21holdem-mobile.conf.before-locked-20260915`; previous mobile release: `21ucd-bottom-menu-20260915`.

- Leave the original checkout and its uncommitted files on `21WEBDEVNEXT` unchanged.
- Leave `https://21-holdem.com` and the desktop Docker preview at `http://192.168.0.109:3100/lobby` unchanged.
- Use the separate `docker-compose.ucd.yml` services for UCD previews; do not start host services.
- No deployment, staging promotion or PR merge is part of branch creation.
