# 21UCD mobile experience

Requested public address: https://21-holdem.com/mobile. Local development: http://192.168.0.109:3106/mobile.

Published and verified on 14 September 2026. Frontend commit: `5f17842`. Public release: `/var/www/html/releases/21ucd-mobile-20260914/build`; alias target: `/var/www/html/mobile_build/build`. Mobile index SHA256: `d3c9322a49b56a0bf7ab2379e1ec16079cb385bfcbadb8747d7db7d62a05af7f`.

Branding refreshed later on 14 September 2026 with the original chip logo, host artwork, and black-and-gold palette. Current release: `/var/www/html/releases/21ucd-mobile-branding-20260914/build`; mobile index SHA256: `ac7b190909cdd672949582c246fea29280a27da5ad5799739cbcc0540d00d130`. The larger controls, Easy View, and mobile navigation are retained. Production build and local/public browser checks passed for loaded artwork, practice, authentication routing, shop, 320/390/768-pixel widths, and 200% text reflow. The desktop index checksum remains unchanged.

The `/mobile/*` route owns its own layout and scoped styles. The regular lobby, login and desktop game routes keep their existing presentation. Mobile includes a larger lobby, top sign-in, separate account creation, rewards, a single-column cosmetic shop, rules, a four-step no-timer practice hand, and persistent Easy View settings.

The user explicitly chose the original animated game table for live play. The mobile lobby prioritizes sign-in and live tables, with practice optional below them. Joining or returning to a table opens the original visible Phaser game at `/mobile/game`, using existing server actions and account chips. The mobile layout wrapper and its document classes are removed during live play. Accessible HTML game controls remain in source but are no longer the selected live presentation. Practice remains a separate local simulation and guided illustration.

The original live renderer uses its `gameplay-layout` wrapper so the canvas inherits the required viewport sizing. The mobile-only `ucd-original-game` class hides table/background adjustment tools that otherwise cover Exit on a phone; the PC tools are unchanged.

Mobile classes are added and removed on route entry/exit, including the override needed to undo Phaser's fixed document height. Lobby and practice retain Easy View and text reflow. Live play uses the original game controls and canvas confirmation dialogs. Popup and preload handling select accessible dialogs only when the hidden accessible engine wrapper exists, rather than assuming every `/mobile` route needs them. No custom accessibility styles apply to the original live game or desktop outside the mobile classes.

## Release isolation

Original live-game entry release (14 September 2026): `/var/www/html/releases/21ucd-mobile-live-entry-20260914/build`, index SHA256 `f5c4ab24d5240f1ac51ea6b1737228104f865f662b21b5c20425b7c9134bf466`. Production build and table-loading recovery checks passed. A temporary local account joined the original visible table, sent Fold over its real socket, opened and confirmed the original canvas Exit dialog, and returned to the mobile lobby. The account and its test ledger entries were removed. Desktop index checksum unchanged.

Practice motion release (14 September 2026): `/var/www/html/releases/21ucd-mobile-motion-20260914/build`, index SHA256 `0608f7d9b47ee013b1f41862ed0042347dff992aae22b9456836cdb80a457d21`. Opponents now have full-size private card backs, staggered deals, animated showdown reveals, action outlines and bet-chip/pot feedback. New deals restart card animations; later community cards animate on arrival. Reduced motion removes the effects without delaying play. Production and public browser checks passed for motion, cards, redeals, complete hands and responsive results; 200% text checks passed locally. Desktop index unchanged.

Playable practice release (14 September 2026): `/var/www/html/releases/21ucd-mobile-playable-20260914/build`, index SHA256 `daa57759a6fb27fb1508a0f20cb7b539cda129687c968fe17ab423df53b65914`. Public and Docker production checks passed for loaded replica artwork, five complete hands, hidden/revealed opponent cards, folding/redealing, no game/wallet writes, 320/390/768-pixel layouts and enlarged result screens. Guided walkthrough, navigation and 200% text checks also passed. Desktop index checksum unchanged.

Latest release (14 September 2026): `/var/www/html/releases/21ucd-mobile-practice-20260914/build`, index SHA256 `61fc09d2f1f7f91b6b8cb0c199b31c5786e3c24457a2b97794d84602fb678780`. Guided-table artwork, pot updates, practice progression, navigation, Easy View, narrow viewports and 200% text checks passed against the Docker production build and public HTTPS site. Desktop index checksum unchanged.

Build in Docker with `PUBLIC_URL=/mobile`, `GENERATE_SOURCEMAP=false`, and `DISABLE_ESLINT_PLUGIN=true`. The public mobile files live in their own release directory, exposed by an Apache `/mobile/` alias. The existing desktop DocumentRoot and build symlink stay unchanged. Deep links fall back to the mobile index. Static files use the `/mobile/static/` prefix.

Public mobile uses the existing live API, accounts, chips and sockets. Local development uses the separate UCD database. The unshipped daily reward backend policy in this branch is NOT deployed merely by publishing this frontend; the chest describes whatever policy the server supplies. Keep this distinction when promoting backend work.

The deployment stages changed assets in `/dev/shm`, hardlinks existing immutable media into the mobile release, and uses rsync temporary-file replacement for changed files. Never overwrite shared hardlinks in place. The baseline desktop index SHA256 before this release is `7136417d3fe75f8da3e638aec4c56fa99fedf148320c0c7ff3f464f11942f793`.

## Validation

`/mobile/practice` now opens a playable, local simulation with the original game table image and three practice opponents. The Guided walkthrough button retains the four-step lesson. The simulation uses a shuffled deck, private/visible cards, ace-aware totals, basic call/check/raise/fold and Hit/Stand, four possible shared cards, showdown and split pots. Opponents respond using only their own cards and the visible board. Each deal resets all practice stacks to 1,000; no wallet/API/socket writes occur. Double Down, all-ins, live timing and advanced betting are outside this basic practice simulation. Run `node scripts/test-practice-game.mjs` inside the frontend Docker service to check scoring, locked hands, payouts and 300 complete simulated hands.

The mobile guided hand now reuses the original tutorial's casino backdrop, four player portraits and host artwork around a red-and-gold table. Practice blinds, balance and pot are illustrative: calling 10 moves the example balance from 1,000 to 990 and the pot from 15 to 25. Its four manual steps remain untimed, end at the locked total, and never send game actions. Cards and guidance remain HTML that can wrap with enlarged text.

- Browser flows: practice progression, Easy View persistence, rewards sign-in destination, separate signup, single-column shop, and clean runtime logs.
- Viewports: 320, 390 and 768 pixels; simulated 200% text with reachable final actions.
- Real local test account: join a table, receive socket player/card/pot/turn data, send a legal action, confirm exit, and return to the mobile lobby.
- Table-image recovery regression script remains passing.
- Production-path checks and public verification are required before release completion.

The production-path browser checks and public HTTPS browser checks passed, including deep links, practice progression, Easy View persistence, reward sign-in routing and the shop. A real local account also exercised the production build's socket join/action/exit flow. The live desktop index checksum was unchanged after enabling the alias. No real customer account was used for tests.

Apache includes `/etc/apache2/21holdem-mobile.conf` from the existing TLS virtual host. Its prior configuration is saved in the mobile release as `../apache-before.conf`. To withdraw the mobile route, remove that include, validate Apache configuration and reload; leave the desktop symlink alone. The release root must remain mode 755 and static files mode 644. Normalize tar/rsync modes when packaging Windows-built files.

The local QA scripts and screenshots are in `D:/BIG-SLICK-GAMES/.codex-runtime/`. No production account credentials are included in source.
