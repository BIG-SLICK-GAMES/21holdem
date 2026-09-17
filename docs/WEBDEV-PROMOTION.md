# Approved 21UCD promotion to WEBDEV

On 18 September 2026 the user approved the current 21UCD site, explicitly requested replacing all of WEBDEV with 21UCD, and authorised publishing it at https://21-holdem.com.

- Approved source checkout: `D:/BIG-SLICK-GAMES/GAMES/21holdem-21UCD`, branch `21UCD`.
- Production promotion branch: `WEBDEV`, replaced with the complete approved source snapshot. This is not a merge of the former WEBDEV application. `main` remains unchanged.
- Frontend: `frontend/`. Build in Docker with `PUBLIC_URL=/`, empty `REACT_APP_API_ENDPOINT` and `REACT_APP_SOCKET_URL`, and `GENERATE_SOURCEMAP=false`.
- Main site: `/var/www/html/game_build/build`, an atomic symlink to the current release build. Planned release: `/var/www/html/releases/webdev-ucd-20260918/build`.
- Previous main release retained for rollback: `/var/www/html/releases/21webdevnext-single-room-20260913/build`.
- Existing `/mobile` alias continues serving `/var/www/html/mobile_build/build` independently.
- Retain old static assets for existing open tabs. Keep the deployed backend, API/Socket.IO proxies, database, and admin site unchanged.
- The previous WEBDEV history is backed up as `backup/WEBDEV-before-UCD-20260918`. Preserve edits in the former WEBDEV local checkout and the 21WEBDEVNEXT desktop checkout.

This approval supersedes earlier instructions limiting 21UCD to `/mobile`. Git branches have no nested hierarchy; WEBDEV is the production branch before promotion to main.
