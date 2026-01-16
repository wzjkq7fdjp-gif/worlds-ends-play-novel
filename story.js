// ===================================================
// WORLD END(S) — PLAY NOVEL
// STORY FILE (CHAPTER 1 ONLY)
// ===================================================


// === STAT TRACKING (ENDING LOGIC) ===
// (Keep these at the very top of story.js)
State.vars.truth ??= 0;
State.vars.resolve ??= 0;
State.vars.mercy ??= 0;
State.vars.hope ??= 0;
State.vars.fear ??= 0;

// Optional flags for later use
State.vars.flags ??= {};


// ===================================================
// CHAPTER 1 — THE DAY THE SKY BURNED
// ===================================================

{ type: "label", id: "ch1_start" },
{ type: "bg", value: "impact" },
{ type: "music", value: "" },

{ type: "narr", text: `
CHAPTER 1 — THE DAY THE SKY BURNED

The meteor tore across the sky, carving a burning scar through the clouds.

For a single breath, the world stood still.
`},

{ type: "narr", text: `
People pointed.
People cheered.
Phones rose like candles in the dark.

No one ran.
Not yet.
`},

{ type: "choice",
  prompt: "When the sky burns, what do you do first?",
  options: [
    {
      text: "Record it. Truth matters when lies come later.",
      effect: () => { State.vars.truth += 1; },
      goto: "ch1_record"
    },
    {
      text: "Pull people back. Something feels wrong.",
      effect: () => { State.vars.resolve += 1; },
      goto: "ch1_warn"
    },
    {
      text: "Stand still. Just watch.",
      effect: () => { State.vars.fear += 1; },
      goto: "ch1_watch"
    }
  ]
},

{ type: "label", id: "ch1_record" },
{ type: "narr", text: `
You raise your phone, heart pounding.

If this is the end…
someone should remember how it began.
`},
{ type: "goto", value: "ch1_impact" },

{ type: "label", id: "ch1_warn" },
{ type: "narr", text: `
You shout. You pull people back.

They laugh—
then the ground trembles.
`},
{ type: "goto", value: "ch1_impact" },

{ type: "label", id: "ch1_watch" },
{ type: "narr", text: `
You do nothing.

The sky answers with fire.
`},
{ type: "goto", value: "ch1_impact" },

{ type: "label", id: "ch1_impact" },
{ type: "narr", text: `
The impact hits like the fist of a god.

Buildings shatter.
Windows scream.
The city kneels.

And then—

something opens inside the crater.
`},

// If you haven't written Chapter 2 yet, keep this as "end".
// When you're ready, change it to: { type: "goto", value: "ch2_start" },
{ type: "end",
  title: "End of Chapter 1",
  body: "Chapter 1 complete.\n\nNext: The Arrival\n\n(Your choices will matter later.)"
},