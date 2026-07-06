# 21 Holdem Frontend Control Files

These files are intended for quick adjustment without digging through the large game scene.

## Player Seat Positions

`frontend/src/views/game/profileLayoutControls.json`

- Move each profile with `xPercent`, `yPercent`, `moveRightPx`, and `moveDownPx`.
- Seat `1` is the bottom-left visual seat, then seats continue around the table.

## Game Element Sizes

`frontend/src/views/game/gameElementControls.json`

- `playerProfile.avatarSizePx`: profile circle size.
- `playerProfile.actionLabelTopPx`: action pill vertical position.
- `playerProfile.cardBackWidthPx` / `cardBackHeightPx`: small card-back icon size.
- `bottomConsole.mobileHeightPx`: bottom action window height.
- `bottomConsole.holeCardHeightOffsetPx`: how much smaller your hole cards are than the bottom window.
- `bottomConsole.foldedHoleCardOpacity`: your card opacity after folding.

## Frontend Timing

`frontend/src/scenes/level/gameTimingControls.js`

- `actionLabels.durationMs`: how long action pills live.
- `potTransfer.animationDurationMs`: chip flight duration.
- `potTransfer.startDelayMs`: delay before chips launch.
- `potTransfer.chipStaggerMs`: delay between chip sprites.
- `potTransfer.afterAnimationBufferMs`: extra wait after chip animation.

## Action Labels

`frontend/src/scenes/level/actionControls.js`

- Change text for `Call`, `Raise`, `Stand`, `Check`, `Fold`, `Bust`, and combo labels.

## Backend Timing

`backend/app/game/boardManager/TwentyOneHoldem/config/timing.js`

- `playerTurnHandoffPauseMs`: pause between one player's turn ending and the next player's timer starting.
- Community-card delay.
- Bot decision timing.
- Tutorial bot timing.

`backend/app/game/boardManager/TwentyOneHoldem/config/turnTiming.js`

- Single place that calculates player turn duration from table settings.
- Live turns and reconnect/resume now use the same duration.
