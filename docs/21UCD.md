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

No mobile redesign has been implemented by creating this branch.
The next design step is mobile gameplay mockups in normal and Easy View modes.
Future implementations should isolate mobile components/styles and verify desktop behavior remains unchanged.

## Isolation

- Leave the original checkout and its uncommitted files on `21WEBDEVNEXT` unchanged.
- Leave `https://21-holdem.com` and the desktop Docker preview at `http://192.168.0.109:3100/lobby` unchanged.
- Use a separate Docker service/port for future UCD previews; do not start host services.
- No deployment, staging promotion or PR merge is part of branch creation.
