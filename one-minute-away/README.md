# One Minute Away: The Road Between Us

A PS1-style psychological horror love story told from two points of view: Rufki and Argjila, at 4:04 in the morning on Ocean Parkway, Brooklyn. It runs in any browser, with no install and no build step.

## Play

Open `one-minute-away/index.html` from any static host, such as GitHub Pages. To run it locally:

```bash
python3 -m http.server   # from the repo root, then open http://localhost:8000/one-minute-away/
```

To jump straight into a chapter, add a hash to the URL: `index.html#chapter-0` is the prologue and `#chapter-15` is the last crossing.

| Action | Gamepad | Keyboard | Touch |
|---|---|---|---|
| Walk | Left stick | WASD / arrows | Drag on the left half |
| Run | □ | Shift | □ |
| Confirm / examine | ✕ | Space / E / Enter | ✕ |
| Back | ○ | Q / Backspace | ○ |
| Memory route (map) | △ | Tab | △ |
| Pause | Start | Esc | START |

## What's in it

**Two points of view, one save.** Control passes between Rufki and Argjila at marked handoffs. What one of them does changes the other's room. For example, she slides a chain and he hears two clicks in the car speaker.

**The story:**
- Sixteen chapters: from 4:04 on Ocean Parkway, through the house on October 24, 2025, the House of Almost, the winter he was away, the Bathhouse, the May dance, the drive back, the park near Target, *Room to Be Me*, the quiet days, the optional Unread Room, the Unsaid, the world without her and the Clock Tower, to the last crossing.
- Five endings: *Always*, *The One Who Waited*, *4:04 Forever*, *The Other Me*, and *Before We Knew* (New Game+), plus a post-credits scene.

**Her side, in her words.** Argjila's chapters are built from the details she shared, and her own sentences are read in her voice. The moments she hasn't written down yet are not invented: what she noticed first, the May kitchen conversation, the dance, the drive back, the park, and why "About You" matters. They appear in the game as sealed pages that say *"This memory is Argjila's to write."*

To fill one in, open `js/memories.js`, paste her words into that memory's `text`, and the page opens in the game. It shows in the **Her Pages** menu on the title screen and in the scene where the memory appears.

**Looks like a PS1 game:**
- Rufki and Argjila are sprites drawn in five directions, with front, side and back walk cycles and eight cutscene poses each. The other side is mirrored.
- The Other Rufki, the Unmet, the Unsaid, the Keeper of Minutes, both children, the winter friend, the former best friend and the faceless dancer have their own turnarounds and animation frames.
- Every location is a modeled 3D map built from the location art and room blockouts: Ocean Parkway, the hallway of doors, the house, the House of Almost, her room, the rooftop Bathhouse pool at night, the dance studio, the car, the park, the waterfront, the Unread Room, the corridor of cords, the Clock Tower and the collapse. They use follow cameras and fixed corner cameras.
- Rendering runs at 320×240 with vertex wobble, affine textures, 15-bit colour with dithering, fog and a CRT filter. Each effect can be switched off.

**Voice acting.** Every character line is spoken; narration is read silently. The voices were synthesised offline with the Kokoro-82M neural TTS model and processed per speaker:
- the radio is band-limited
- the Keeper is slowed into a giant
- the Unsaid speaks in three borrowed voices at once
- the thing at the door sounds almost like Rufki
- the copy of Argjila is just slightly too perfect

All the voices are in one file, `assets/vo/voices.mp3`, which streams in after boot.

**Horror:**
- The Unmet moves only when you aren't looking at it.
- Clocks run backward at every wrong turn.
- A kitchen clock ticks only when she moves, and someone upstairs keeps walking when she stands still.
- A knock arrives while both of his hands are in view.
- Her reflection gets up early, and dance doubles move ahead of the beat.
- Someone in the empty back seat hums one beat ahead of the radio.
- A corridor of telephone cords has to be traced by ear while the Unsaid closes in.
- The Keeper makes its offers, and in the end the tower comes apart.

**Accessibility.** Every audio-driven cue has a caption, such as *[Chain clicks twice]*, and captions can be turned on or off. Optional auto-advancing text and separate volume controls for voice, music and everything else are in the options.

**Music.** The soundtrack is composed for a WebAudio sequencer, with no music files. "About You" by The 1975 is named in the story. The cue that plays in the game is an original placeholder until a licensed recording is supplied.

## Files

| Path | Contents |
|---|---|
| `js/actors.js` | Sprite characters (direction, walk cycle, poses), the Keeper |
| `js/chapters.js`, `js/chapters2.js` | The story |
| `js/memories.js` | Argjila's pages |
| `js/scenes.js` | The 3D maps and their named spots |
| `js/ui.js` | Interface |
| `js/voice.js` | Voice playback |
| `js/music.js` | Soundtrack |
| `assets/` | Character atlases, sprites, backgrounds, portraits, voices |

The only dependency is three.js r160, which is included in `vendor/`.
