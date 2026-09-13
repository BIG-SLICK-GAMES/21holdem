Riverboat background scaling correction
======================================

Asset: `frontend/public/images/shop/riverboat-room-v2.webp` (1536 × 1024).
PNG original: `frontend/public/images/shop/riverboat-room-v2.png`.
Edited with the built-in image generation tool, then encoded to WebP without resizing.
Edit target: existing `riverboat-lounge-scene.png` shop preview.
The separate equipped table sprite is unchanged by this correction.

Final edit prompt:

Edit this exact Riverboat Lounge game background. Remove ONLY the large central red poker table and its pedestal, reconstructing the patterned carpet and room floor behind it. Preserve the existing warm sunset riverboat lounge, arched windows, river and paddle steamer, woodwork, brass lamps, staircase, chairs, and red carpet. Extend the room naturally left and right into a wide landscape 1536x1024 composition, pulled back to show the room at natural scale. The center foreground must be empty floor for a separately rendered game table. Same illustration/render style, same warm amber/red palette, same room identity. No central table, no people, no text, no UI, no new props. This is a room-only background asset, not a screenshot or interface.

The game uses centered `background-size: cover` for this room rather than `max(100vw, 300vh) auto`. The room is painted once on `.game-room-art` inside a fixed `.game-room-viewport`. The game does not render the shared `.main-layout-background` container. Scale/position controls operate on that single image. Other shop previews keep their existing crop until they have their own room-only assets.
