# 21UCD mobile experience

Requested public address: https://21-holdem.com/mobile. Local development: http://192.168.0.109:3106/mobile.

Published and verified on 14 September 2026. Frontend commit: `5f17842`. Public release: `/var/www/html/releases/21ucd-mobile-20260914/build`; alias target: `/var/www/html/mobile_build/build`. Mobile index SHA256: `d3c9322a49b56a0bf7ab2379e1ec16079cb385bfcbadb8747d7db7d62a05af7f`.

The `/mobile/*` route owns its own layout and scoped styles. The regular lobby, login and desktop game routes keep their existing presentation. Mobile includes a larger lobby, top sign-in, separate account creation, rewards, a single-column cosmetic shop, rules, a four-step no-timer practice hand, and persistent Easy View settings.

Live play runs the existing Phaser and socket engine, with a separate HTML presentation for cards, totals, pot, turn timer, action buttons, player details and confirmation dialogs. It uses the server's legal actions and existing chip accounting. The off-screen canvas is not the accessible interface. Socket disconnects hide action rows until the game reconnects; sounds start off. The practice hand is a guided illustration, not a live table or a full rules simulator.

Mobile classes are added and removed on route entry/exit, including the override needed to undo Phaser's fixed document height. Zoom and Easy View reflow rather than shrinking text. Dialogs use native modal focus management. No custom accessibility changes apply to the desktop stylesheet outside these classes.

## Release isolation

Build in Docker with `PUBLIC_URL=/mobile`, `GENERATE_SOURCEMAP=false`, and `DISABLE_ESLINT_PLUGIN=true`. The public mobile files live in their own release directory, exposed by an Apache `/mobile/` alias. The existing desktop DocumentRoot and build symlink stay unchanged. Deep links fall back to the mobile index. Static files use the `/mobile/static/` prefix.

Public mobile uses the existing live API, accounts, chips and sockets. Local development uses the separate UCD database. The unshipped daily reward backend policy in this branch is NOT deployed merely by publishing this frontend; the chest describes whatever policy the server supplies. Keep this distinction when promoting backend work.

The deployment stages changed assets in `/dev/shm`, hardlinks existing immutable media into the mobile release, and uses rsync temporary-file replacement for changed files. Never overwrite shared hardlinks in place. The baseline desktop index SHA256 before this release is `7136417d3fe75f8da3e638aec4c56fa99fedf148320c0c7ff3f464f11942f793`.

## Validation

- Browser flows: practice progression, Easy View persistence, rewards sign-in destination, separate signup, single-column shop, and clean runtime logs.
- Viewports: 320, 390 and 768 pixels; simulated 200% text with reachable final actions.
- Real local test account: join a table, receive socket player/card/pot/turn data, send a legal action, confirm exit, and return to the mobile lobby.
- Table-image recovery regression script remains passing.
- Production-path checks and public verification are required before release completion.

The production-path browser checks and public HTTPS browser checks passed, including deep links, practice progression, Easy View persistence, reward sign-in routing and the shop. A real local account also exercised the production build's socket join/action/exit flow. The live desktop index checksum was unchanged after enabling the alias. No real customer account was used for tests.

Apache includes `/etc/apache2/21holdem-mobile.conf` from the existing TLS virtual host. Its prior configuration is saved in the mobile release as `../apache-before.conf`. To withdraw the mobile route, remove that include, validate Apache configuration and reload; leave the desktop symlink alone. The release root must remain mode 755 and static files mode 644. Normalize tar/rsync modes when packaging Windows-built files.

The local QA scripts and screenshots are in `D:/BIG-SLICK-GAMES/.codex-runtime/`. No production account credentials are included in source.
