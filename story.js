// ==============================
// WORLDS END(S) — PLAY NOVEL
// Full Story File (Chapters 1–2)
// ==============================

const Story = [

  // -------- START --------
{ type: "label", id: "start" },

{ type: "narr", text: `
WORLD END(S)

Tap to begin.
` },
  // ==============================
  // CHAPTER 1 — THE DAY THE SKY BURNED
  // ==============================

  { type: "narr", text: `
CHAPTER 1 — THE DAY THE SKY BURNED

The meteor blazed across the sky, leaving a trail of fire in its wake.

At first, people thought it was a miracle.
A rare light. A once-in-a-lifetime moment.

Phones rose into the air like candles.
Voices overlapped—excited, disbelieving, hungry for proof.

The sky answered with heat.

When it struck the ground, the impact was felt for miles around.

But it wasn’t a rock that landed on Earth.

It was a ship.
`},

  { type: "narr", text: `
The next hours were chaos wrapped in fascination.

News helicopters circled the crater.
Scientists arrived in convoys.
Officials spoke carefully into microphones about “containment” and “unknown material.”

And through it all, the same thought kept returning:

This doesn’t feel like discovery.
`},

  { type: "speaker", name: "Rufki", text: `
“This feels like the beginning of something we don’t control.”
`},

  { type: "choice",
    prompt: "As the site is sealed off, what do you focus on?",
    options: [
      {
        text: "Watch the ship. Learn everything you can.",
        effect: () => { State.vars.truth += 1; },
        goto: "ch1_truth"
      },
      {
        text: "Help keep people calm.",
        effect: () => { State.vars.mercy += 1; },
        goto: "ch1_mercy"
      },
      {
        text: "Leave. Something feels wrong.",
        effect: () => { State.vars.resolve += 1; },
        goto: "ch1_resolve"
      }
    ]
  },

  { type: "label", id: "ch1_truth" },
  { type: "narr", text: `
You stay longer than you should.

You notice details others miss—how the ship hums, how the air feels charged near it.
You swear the surface shifts when no one is looking.
`},
  { type: "goto", id: "ch1_end" },

  { type: "label", id: "ch1_mercy" },
  { type: "narr", text: `
You help guide people away from the site.
You calm shaking hands, answer questions you don’t have answers for.

Fear spreads slower when someone stands still.
`},
  { type: "goto", id: "ch1_end" },

  { type: "label", id: "ch1_resolve" },
  { type: "narr", text: `
You leave before they tell you to.

Something in your chest tightens as you walk away.
Instinct, not logic.
`},
  { type: "goto", id: "ch1_end" },

  { type: "label", id: "ch1_end" },
  { type: "narr", text: `
That night, the world ignites.

This is the moment history will name later.
The moment people will argue about.
The moment they’ll say they “felt coming.”

But you don’t feel clever.
You don’t feel brave.

You feel one thing:

The beginning.
`},

  { type: "end",
    title: "End of Chapter 1",
    body: `
Chapter 1 complete.

Next: The Betas

(Your choices are saved and will affect tone later.)
`},

  // ==============================
  // CHAPTER 2 — THE BETAS
  // ==============================

  { type: "label", id: "ch2_start" },
  { type: "bg", value: "chaos" },

  { type: "narr", text: `
CHAPTER 2 — THE BETAS

You don’t remember falling back.

You remember the sound first—
a wet, sharp rhythm like something cutting through meat.

Then the crowd breaks.

This thing didn’t come to be studied.

It came to hunt.
`},

  { type: "speaker", name: "Rufki", text: `
“Move! Don’t stare—MOVE!”
`},

  { type: "narr", text: `
The Beta moves with impossible precision.
It doesn’t attack randomly.

It chooses.
`},

  { type: "choice",
    prompt: "Someone is pinned under debris. The Beta is close.",
    options: [
      {
        text: "Pull them free.",
        effect: () => { State.vars.mercy += 1; },
        goto: "ch2_save"
      },
      {
        text: "Get to cover.",
        effect: () => { State.vars.resolve += 1; },
        goto: "ch2_cover"
      },
      {
        text: "Track the Beta’s movement.",
        effect: () => { State.vars.truth += 1; },
        goto: "ch2_track"
      }
    ]
  },

  { type: "label", id: "ch2_save" },
  { type: "narr", text: `
You lift until your arms scream.

The person lives.

That has to be enough.
`},
  { type: "goto", id: "ch2_common" },

  { type: "label", id: "ch2_cover" },
  { type: "narr", text: `
You survive.

That matters too.
`},
  { type: "goto", id: "ch2_common" },

  { type: "label", id: "ch2_track" },
  { type: "narr", text: `
It’s not just hunting.

It’s learning.
`},
  { type: "goto", id: "ch2_common" },

  { type: "label", id: "ch2_common" },
  { type: "bg", value: "ship" },

  { type: "narr", text: `
Two days later, leaked footage surfaces.

Not one Beta.

Several.
`},

  { type: "speaker", name: "Rufki", text: `
“…They’re multiplying.”
`},

  { type: "narr", text: `
On the third day, the city changes.

Not by invasion.

By silence.
`},

  { type: "choice",
    prompt: "A message appears: “If you want answers, come alone.”",
    options: [
      {
        text: "Go.",
        effect: () => { State.vars.resolve += 1; },
        goto: "ch2_meet"
      },
      {
        text: "Trace the message.",
        effect: () => { State.vars.truth += 1; },
        goto: "ch2_trace"
      },
      {
        text: "Reply first.",
        effect: () => { State.vars.mercy += 1; },
        goto: "ch2_reply"
      }
    ]
  },

  { type: "label", id: "ch2_meet" },
  { type: "narr", text: `
“They’re not here to negotiate,” the stranger says.

“They’re here to replace.”
`},
  { type: "goto", id: "ch2_end" },

  { type: "label", id: "ch2_trace" },
  { type: "narr", text: `
No signal source.

As if the message came from the static itself.
`},
  { type: "goto", id: "ch2_end" },

  { type: "label", id: "ch2_reply" },
  { type: "narr", text: `
The reply comes instantly:

“Someone who survived the first wave.”
`},
  { type: "goto", id: "ch2_end" },

  { type: "label", id: "ch2_end" },
  { type: "bg", value: "beta" },

  { type: "narr", text: `
Outside, the sky is quiet.

Too quiet.

A signal.
A countdown.

And somewhere out there, the Betas are learning your planet’s name.
`},

  { type: "end",
    title: "End of Chapter 2",
    body: `
Chapter 2 complete.

Next: Resistance

(Your choices continue to affect the future.)
`},
];
