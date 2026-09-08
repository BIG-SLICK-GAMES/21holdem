# Shared UI design rules

The application UI uses one visual system. Change tokens in
`frontend/src/assets/scss/helper/_ui-tokens.scss`, rather than inventing page-specific colours or shapes.
The shared component skin is `frontend/src/assets/scss/components/_ui-system.scss`.

| Property | Rule |
| --- | --- |
| Typeface | TT Commons throughout UI; 400 body, 600 labels, 700 headings/actions |
| Black glass | Legacy `--ui-blue` and `--ui-blue-deep` token names now hold charcoal and black for secondary controls |
| Gold | Banner metallic gold `--ui-gold` for accents; `--ui-gold-gradient` for primary actions and selected controls |
| Borders | Shared smoky silver gradient borders on surfaces and controls, with smoky silver separators in connected rows |
| Corners | `--ui-radius` (0px) for square corners on UI frames. Player/available-seat indicators remain circular |
| Connected groups | Use `ui-button-row` for menus, buy-in and login/action groups: one bordered row, square internal joins and square outside corners; scroll horizontally if needed, never wrap |
| Text | `--ui-text`, `--ui-text-muted`, dark `--ui-gold-ink` on gold controls |
| Depth | Shared `--ui-shadow`; silver frosted top-bar highlights |
| States | Silver focus ring; muted disabled state; red for errors and green for success |

Gold gradient endpoints are intentional light/shadow stops from the same palette, not separate accent colours.
Image artwork and playing-card lettering retain their original content; circular player/seat indicators retain their shape.
Keep existing component geometry responsive; do not impose a fixed width to achieve consistency.
New controls should use the shared component skin and tokens. Add new component selectors there,
instead of adding another competing skin at the end of a page stylesheet.

Palette sampled from `lobby_profile_banner.webp`: midnight navy `#000b23`,
royal-blue chips `#1031a1`, metallic gold `#f7d06b`, silver lettering `#e5e4e4`
and silver shadow `#aaa8a9`. Surface blues and gold gradient stops are tonal
variants for readability. All lobby tabs use a black backdrop with animated gold bokeh. Controls use black glass and gold highlights; blue is retained only in original image artwork.

Current theme takes its finish from `lobby_daily_bonus.png`: champagne highlights,
ribbon-gold gradients, amber edge reflections, warm ivory text and smoked black glass.
Theme changes must not alter markup, layout, spacing, sizes, fonts or corner geometry.
