# One Minute Away — The Road Between Us

A PS1-style psychological horror love story. It runs in any browser, with no install and no build step.

> October 24, 2026. 4:04 AM. Ocean Parkway, Brooklyn.
> Rufki gets a call from Argjila: *"Before we met… how close were we?"*
> Whatever you do, don't let the clock reach 4:05.

## Play

Open `one-minute-away/index.html` from any static host, such as GitHub Pages. You can also run it locally:

```bash
python3 -m http.server   # from the repo root, then open http://localhost:8000/one-minute-away/
```

To jump straight into a chapter, add a hash to the URL, for example `index.html#chapter=4` for April Fourth. Chapters are numbered 0 to 9. This is handy for showing a specific scene to someone.

| Action  | Gamepad   | Keyboard          | Touch                  |
|---------|-----------|-------------------|------------------------|
| Walk    | Left stick / D-pad | WASD / arrows | Drag on the left half |
| Run     | □         | Shift             | □, or push the stick to the edge |
| Examine / confirm | ✕ | Space / E / Enter | ✕ |
| Back    | ○         | Q / Backspace     | ○                      |
| Journal | △         | Tab / J           | △                      |
| Pause   | Start     | Esc / P           | START                  |

Controls default to **Modern**, where you push the stick in the direction you want to walk. Switch to **Tank** in Options for the classic 1999 feel.

## The PS1 look

Everything is drawn by one custom shader (`js/ps1.js`) into a 320×240 framebuffer, which is then scaled up with nearest-neighbour filtering:

- Vertex snapping to the low-res pixel grid gives the classic PS1 "wobble".
- Textures are mapped affinely, with no perspective correction, so they warp and swim.
- Lighting is per-vertex (Gouraud) from up to six nearby lights, with per-vertex fog and a short draw distance.
- Colour is 15-bit with 4×4 ordered dithering.
- Every texture is a procedural 16 to 64 px canvas.
- The optional CRT filter adds scanlines, a vignette and glass curvature.

Jitter, dithering, CRT and a widescreen hack can each be toggled in Options.

## Walking

The movement controller in `js/world.js` (`Player`) works like this:

- Movement is camera-relative and analog, with acceleration and friction.
- The character turns at a limited rate and slows while pivoting, so there's no skating or snapping.
- When the camera cuts, your direction holds steady until you let go of the stick.
- Collision slides along walls, and stairs and pool steps are followed smoothly.
- The walk cycle in `js/actors.js` is keyed to actual ground speed, so feet don't slide. It uses two-bone legs, counter-swinging arms, a hip bob and a torso twist.
- Footsteps are synthesised for each surface: street, wood, tile, water and carpet.

## Story

The game has a prologue, eight chapters and a final chapter. It ends in one of five endings, followed by a post-credits scene:

| # | Ending | How |
|---|--------|-----|
| 1 | **Always** (true) | Recover every memory, don't interfere with the past, and share enough quiet moments (*The Memory of Us*) |
| 2 | **The One Who Waited** | Finish the game without the full memory |
| 3 | **4:04 Forever** | Accept the Keeper's offer |
| 4 | **The Other Me** | Stay in the safe world |
| 5 | **Before We Knew** (secret) | Get the true ending, then get it again on a New Game+ |

All audio is synthesised with WebAudio, so there are no asset files. The only dependency is three.js r160, vendored in `vendor/`.
