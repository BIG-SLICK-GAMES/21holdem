# 21 Hold'em Figma Game Screen Template

Target Figma file created:

`https://www.figma.com/design/aFLZ02uEF8yOtW44RZ3wnQ`

The Figma Starter MCP limit blocked additional writes after file creation, so the actual template generator is staged locally at:

`scripts/figma/21holdem-game-template.use_figma.js`

## Runtime Sources

- React shell and seat overlay: `frontend/src/views/game/index.jsx`
- Seat percentages: `frontend/src/views/game/profileLayoutControls.json`
- Per-seat UI sizing: `frontend/src/views/game/gameElementControls.json`
- Phaser frame and table: `frontend/src/scenes/Level.js`
- Bottom console and top utility menu: `frontend/src/views/game/GameActionOverlay.jsx`
- Game CSS: `frontend/src/assets/scss/views/game/_game.scss`

## Template Frame

- Canvas: `1080 x 1920`
- Layout mode: mobile
- Phaser playfield offset: `-180`
- Default dev layout:
  - `uiScale: 1.5`
  - `tableOffsetY: -200`
  - `tableScale: 1`
  - `headerOffsetY: 0`
  - `potOffsetY: 0`
  - `footerOffsetY: 0`
  - `playerProfilesOffsetY: 0`
  - `playerProfilesScale: 1`

## Core Asset Uploads

Upload these PNGs into the Figma file, then place their image hashes into `ASSET_HASHES` at the top of the generator script:

- `frontend/src/assets/images/bg/game_bg.png`
- `frontend/src/assets/images/gameplay/portrate_table.png`
- `frontend/src/assets/images/card/card_front.png`
- `frontend/src/assets/images/card/card_back.png`
- `frontend/src/assets/images/gameplay/chip_icon.png`
- `frontend/src/assets/images/icons/new21.png`
- `frontend/src/assets/images/icons/newflush.png`
- `frontend/src/assets/images/icons/newstraight.png`

The script still runs without hashes, using labeled fallback shapes so the layer structure and positions are preserved.

## Layer Contract

- `LOCKED/background and table assets`: non-editable backdrop and table reference.
- `LOCKED/phaser container_body + table`: Phaser table area and watermark.
- `LOCKED/phaser HUD layers`: pot, community cards, deck placeholder.
- `ADJUST/react seat overlay from profileLayoutControls.json`: editable player seat anchors.
- `ADJUST/react GameActionOverlay`: editable top utility, action rows, and bottom console.
- `GUIDE/source controls and layer map`: notes embedded in the frame for traceability.

## Next Figma Pass

After the Figma subscription or MCP limit is fixed:

1. Upload the core assets to the existing file.
2. Copy returned image hashes into `ASSET_HASHES`.
3. Run `scripts/figma/21holdem-game-template.use_figma.js` through `use_figma` against file key `aFLZ02uEF8yOtW44RZ3wnQ`.
4. Inspect the generated frame screenshot and tune the `ADJUST/` groups only.

Do not use localhost for capture or verification on this project. Use the Docker dev stack and configured Mongo services only.
