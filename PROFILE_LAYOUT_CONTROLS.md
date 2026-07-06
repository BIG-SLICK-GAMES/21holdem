# Profile Layout Controls

Edit this file:

`frontend/src/views/game/profileLayoutControls.json`

After changing it, rebuild/restart Docker frontend.

Use these controls for each seat:

- `xPercent`: horizontal position inside the table area. `0` is far left, `50` is center, `100` is far right.
- `yPercent`: vertical position inside the table area. `0` is top, `50` is middle, `100` is bottom.
- `moveRightPx`: fine tune left/right. Positive moves right, negative moves left.
- `moveDownPx`: fine tune up/down. Positive moves down, negative moves up.

Example:

```json
"seats": {
  "3": { "xPercent": 33, "yPercent": 36, "moveRightPx": 0, "moveDownPx": 0 }
}
```

That places seat `3` on the left upper rail. To move it slightly up, set `moveDownPx` to `-10`.
