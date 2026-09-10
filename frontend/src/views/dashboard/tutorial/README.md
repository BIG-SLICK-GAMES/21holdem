# Your first hand

Learn-only React presentation. No sockets, real balances or game components are used.
The seven written guide sections remain owned by gameGuideContent.js and unchanged.

## Artwork

The user's Pictures/{2.PNG,ingame1.PNG,profile.png,table.png,takeaseat.png,win.png,card.png}
are visual references. Following the user's instruction to recreate the tutorial's
own artwork, no screenshots are included in the production scene. Cards, suit icons,
crown, chips, felt and table rim are new CSS/SVG layers. Portraits reuse the approved
profile collection. The original generated background is at
assets/images/tutorial/backgrounds/casino-salon.png (relative to src).

Generated with the built-in image_gen tool. Prompt:
"Use case: stylized-concept. Create an original portrait 2:3 background plate for a
premium animated mobile card-game tutorial, navy blue and restrained champagne gold.
An elegant intimate casino salon, symmetrical architectural brass light strips at
far left and far right, dark midnight-blue velvet walls, subtle walnut trim, warm
ceiling light at the very top, understated luxurious atmosphere with realistic 3D
materials. Camera looks slightly down into an EMPTY central playing area. The entire
middle 70 percent and lower center must be quiet dark navy with minimal detail,
intended for separately composited animated game table/cards/avatars. No table in
foreground, no people, no cards, no chips, no text, no logos, no UI, no white border,
no sparkles or confetti. Warm side lights against deep blue shadow, sharp material
details at edges and gentle depth toward the back. This is a background asset, not
a finished tutorial screenshot."

The single background and reused portraits load when the tutorial intersects the
viewport. Subsequent scenes use these same assets, so no next-scene image preload
is needed. CSS reserves the scene dimensions before images load.

## Rule decisions approved in the audit

Current server round 2 follows the first community card. Double Down adds a second
private card to the current total (including that community card), debits twice
current nMinBet, and locks. The example J + community 4 + private 5 = 19 is an
explicit earlier-hand illustration. It never changes the main J + 4 + 7 = 21 hand.
Opponents 7/8/9 plus shared 4/7 score 18/19/20. All stand and betting settles before
showdown. Pot arithmetic is an explicitly labelled no-rake 80-chip demonstration.
The written guide's first-round DD/four-community-card wording conflicts with the
server; fixing either is outside this change.

## Playback and audio

One reducer owns the scene/time/play state. Twelve reading checkpoints stop the
clock and add a navy tint mask, leaving the relevant elements above it. Continue
resumes from the same instant; no timer dismisses the explanation. Manual scene
navigation opens that scene's first checkpoint. Replay resets all checkpoints
and derived hand state. Decision buttons select the matching reading checkpoint.
The clock stops for hidden tabs, offscreen instances and unmount. Reduced motion
starts at the first checkpoint; Continue goes straight to the next checkpoint.
Arrow keys navigate; Space toggles
playback when the tutorial region itself is focused.

Audio hooks use SOUND_STATE soundOn, defaulting silent when no preference is known.
No sound plays before a gesture; rejected play promises are caught. Card/chip/click/
win hooks reuse existing audio; the optional dedicated twentyOne cue is null.
No game audio or preference storage is modified.

Optional narration is opt-in through Voice off/on. The twelve MP3 recordings in
assets/sounds/tutorial are generated from READING_STOPS text using Windows SAPI
Microsoft David Desktop at rate -1, then encoded to 64 kbps MP3. Only the current
clip loads. Voice off, changing scenes/checkpoints, leaving Learn and unmount
cancel playback. Existing SOUND_STATE mute disables narration. A hidden browser
document pauses the clip. Finishing narration never dismisses a reading pause.
