# WORLD ENDS — The Last Canticle

A PS1-style dark science-fantasy RPG adapted from Rufki Vila's *WORLD ENDS* (game edition). It runs in any browser, with no install and no build step.

> An alien ark lands inside an industrial city. People disappear from whole blocks. Their voices come back through radios, ventilation ducts and the living hearts of humanity's war machines.

## Play

Open `world-ends/index.html` from any static host, such as GitHub Pages. To run it locally:

```bash
python3 -m http.server   # from the repo root, then open http://localhost:8000/world-ends/
```

To jump straight into a chapter, add a hash to the URL: `index.html#chapter-0` is the prologue and `#chapter-26` is the final chapter.

| Action | Gamepad | Keyboard | Touch |
|---|---|---|---|
| Walk | Left stick | WASD / arrows | Drag on the left half |
| Run (field) / Guard (battle) | □ | Shift | □ |
| Talk / Attack (tap for a 3-hit combo) | ✕ | Space / E / Enter | ✕ |
| Dodge / Back | ○ | Q / Backspace | ○ |
| Squad command (battle) / Status (field) | △ | Tab | △ |
| Pause | Start | Esc | START |

## What's in it

**The whole story.** The game covers the prologue and all 26 chapters in order, using the novel's dialogue with the renamed cast. Aria's scenes appear in Chapters 2, 7, 10, 13–15, 19 and 23–26.

**Cutscenes** run in the game engine:
- letterbox bars and camera moves
- pixel portraits for each speaker, with their own voice blips
- comms (radio) windows
- glitching red windows when the Canticle copies someone's voice
- SYSTEM alarm text

**Combat:**
- Fight on foot or inside your Eidolon, at giant scale.
- Basic moves: a 3-hit combo, guard, a parry if you tap guard just before a hit, and a dodge with brief invincibility.
- △ pauses the battle and opens squad commands:
  - **Kaien:** Maestro Link
  - **Renji:** Anchor
  - **Raizen:** Graveseal
  - **Shion and Kyo:** Prismcraft (use Shion, then Kyo straight after, to *Braid*)
  - **Requiem:** Curved Blade
- **Resonance** pays for those commands. **Strain** builds as you use them, and holding formation with your squad cools it down.
- **Command pulses:** elites flash a red pulse. Strike during it to break the swarm's rhythm.
- **Bosses adapt:** use the same technique twice in a row and the boss counters it, so change who attacks.
- **Enemies:**
  - Scuttlewight packs that herd you
  - Gloomcasters on the rooftops (only Prismcraft can reach them)
  - Glaive Seraphs
  - Carapax Colossi (pin them first to get through their armour)
  - the Cantor Warden (cut its antennae)
  - Vael Noctyr
- **Civilians** evacuate during the highway battle.

**Minigames:**
- Breath cadence drills
- Maestro timing (a rhythm game)
- Miyu's Echo-Sight vision
- Quick-time strikes
- The final Inversion

**Music:** nine composed themes play on a WebAudio sequencer: title, base, battle, boss, Choirwell, Miyu's theme, Aria's theme, *Maestro Awakening*, and *Legacy Sigil*. There are no audio files.

**Presentation:**
- Boot screen, an animated title screen over the crater, and loading screens with a spinning Legacy Sigil and gameplay tips.
- Chapter title cards.
- An Archive of the cast and the Khethari creatures.
- Memory-card saves, chapter select, and a settings menu.
- A CRT filter, vertex wobble and dithering, each of which can be turned off.

The game is built on the same PS1 renderer as `one-minute-away/`. The only dependency is three.js r160, which is included in `vendor/`.
