// --- STAT TRACKING (ENDING LOGIC) ---
State.vars.truth ??= 0;
State.vars.resolve ??= 0;
State.vars.mercy ??= 0;
State.vars.hope ??= 0;
State.vars.fear ??= 0;

// Optional flags we’ll use later (don’t worry about these yet)
State.vars.flags ??= {};
// ==============================
// CHAPTER 1 — THE DAY THE SKY BURNED
// ==============================

{ type: "label", id: "ch1_start" },
{ type: "bg", value: "impact" },
{ type: "music", value: "" },

{ type: "narr", text: `
CHAPTER 1 — THE DAY THE SKY BURNED

The meteor blazed across the sky, carving a line of fire through the clouds.
`},

{ type: "narr", text: `
People pointed. People cheered.
Phones rose like candles.
For one breath, the world felt united.
`},

{ type: "choice",
  prompt: "When the sky burns, what do you do first?",
  options: [
    {
      text: "Record it. If they lie later, you’ll have proof.",
      effect: () => { State.vars.truth += 1; State.vars.hope += 1; },
      goto: "ch1_record"
    },
    {
      text: "Pull people back. Curiosity gets people killed.",
      effect: () => { State.vars.mercy += 1; State.vars.resolve += 1; },
      goto: "ch1_warn"
    },
    {
      text: "Scan for exits and cover. You trust instincts over crowds.",
      effect: () => { State.vars.resolve += 1; State.vars.fear += 1; },
      goto: "ch1_cover"
    }
  ]
},

{ type: "label", id: "ch1_record" },
{ type: "narr", text: `
You keep your phone steady.
If this becomes a story they rewrite—your footage becomes a weapon.
`},
{ type: "goto", id: "ch1_common1" },

{ type: "label", id: "ch1_warn" },
{ type: "narr", text: `
“Back up—BACK UP!”
You shove shoulders, guide strangers, move a kid behind you.
You don’t know why you’re taking charge.
You just do.
`},
{ type: "goto", id: "ch1_common1" },

{ type: "label", id: "ch1_cover" },
{ type: "narr", text: `
You don’t stare. You calculate.
Distance. Angles. Hard cover.
Your heart is loud, but your mind is clear.
`},
{ type: "goto", id: "ch1_common1" },

{ type: "label", id: "ch1_common1" },
{ type: "narr", text: `
The impact isn’t a sound—it’s pressure in your ribs.
Windows tremble. Streetlights flicker.
Then the ground breathes dust.
`},

{ type: "narr", text: `
When the smoke thins, you see it:

Not a rock.

A ship.
`},

{ type: "bg", value: "ship" },

{ type: "narr", text: `
Metal ribs split open like a wound.
Heat rolls out of it—wrong heat, like a machine exhaling.
`},

{ type: "narr", text: `
Sirens arrive late.
Scientists arrive fast.
Soldiers arrive faster than that.
`},

{ type: "narr", text: `
At first, people are fascinated.
Because humans love mysteries… until mysteries move.
`},

{ type: "bg", value: "beta" },

{ type: "narr", text: `
Something steps into the light.

Insect-like.
Segmented armor.
A posture that doesn’t look lost.

It looks…
ready.
`},

{ type: "narr", text: `
The Betas have arrived.
`},

{ type: "narr", text: `
A soldier raises his rifle.
Muzzle flash.
A clean shot.
`},

{ type: "narr", text: `
The Beta doesn’t fall.

It only… adjusts.
`},

{ type: "speaker", name: "Rufki", text: `
“…Armor.”
`},

{ type: "narr", text: `
The word slips out like a curse.
Because “armor” means design.
And design means intent.
`},

{ type: "choice",
  prompt: "The crowd panics. You spot a kid frozen near the open street. What do you do?",
  options: [
    {
      text: "Sprint for the kid.",
      effect: () => { State.vars.mercy += 2; State.vars.resolve += 1; State.vars.hope += 1; },
      goto: "ch1_savekid"
    },
    {
      text: "Throw something to distract the Beta.",
      effect: () => { State.vars.resolve += 2; State.vars.truth += 1; },
      goto: "ch1_distract"
    },
    {
      text: "Watch the Beta’s movement—learn the pattern first.",
      effect: () => { State.vars.truth += 2; State.vars.fear += 1; },
      goto: "ch1_pattern"
    }
  ]
},

{ type: "label", id: "ch1_savekid" },
{ type: "narr", text: `
You run into the open.
Your lungs burn.
You grab the kid and pull them back behind a car.
They don’t even cry at first—just shake like a leaf.
But they’re alive.
`},
{ type: "goto", id: "ch1_common2" },

{ type: "label", id: "ch1_distract" },
{ type: "narr", text: `
You rip a metal sign from a post and hurl it.
It clatters—loud and bright.
The Beta reacts.
Not like an animal.
Like a system switching targets.
That one second saves people.
`},
{ type: "goto", id: "ch1_common2" },

{ type: "label", id: "ch1_pattern" },
{ type: "narr", text: `
You force yourself to watch.
It angles toward bottlenecks.
It herds panic.
It uses the crowd like terrain.
This isn’t a creature.

It’s a tactic.
`},
{ type: "goto", id: "ch1_common2" },

{ type: "label", id: "ch1_common2" },
{ type: "narr", text: `
The first Beta attack isn’t the end.

It’s the beginning of a spread.
`},

{ type: "narr", text: `
In the days that follow, they appear in other places.
Reports turn into footage.
Footage turns into massacres.
`},

{ type: "narr", text: `
And when the world realizes it isn’t “first contact”…
it’s an invasion…

humanity does what it always does:
it scrambles to build something bigger than fear.
`},

{ type: "bg", value: "base" },

{ type: "narr", text: `
That’s how the organization begins.

Not with speeches.

With survivors.
`},

{ type: "narr", text: `
A handful of young pilots.
Experimental mechs.
And people with abilities that should not exist… but do.
`},

{ type: "speaker", name: "Rufki", text: `
“If they’re designed… then they can be beaten.”
`},

{ type: "narr", text: `
Muhammad — telekinetic. The one who can move the impossible.
`},

{ type: "narr", text: `
Niko — energy manipulator. The one who turns power into weapons.
`},

{ type: "narr", text: `
Alban — super soldier. The one who refuses to fall.
`},

{ type: "narr", text: `
And you, Rufki—
the one who can link systems, synchronize mechs, and push them beyond limits.
`},

{ type: "choice",
  prompt: "When the first mission briefing starts, what do you promise your team?",
  options: [
    {
      text: "“We save as many people as we can. Always.”",
      effect: () => { State.vars.mercy += 1; State.vars.hope += 1; },
      goto: "ch1_promise_common"
    },
    {
      text: "“We learn everything. Truth is how we win.”",
      effect: () => { State.vars.truth += 1; State.vars.resolve += 1; },
      goto: "ch1_promise_common"
    },
    {
      text: "“We end this fast. No hesitation.”",
      effect: () => { State.vars.resolve += 2; State.vars.fear += 1; },
      goto: "ch1_promise_common"
    }
  ]
},

{ type: "label", id: "ch1_promise_common" },
{ type: "narr", text: `
Your words land heavy.
Because you can feel it already:

The ultimate test is still coming.
`},

{ type: "end",
  title: "End of Chapter 1",
  body: `
Chapter 1 complete.

Next: The Fight Begins
(Your choices will shape which endings you unlock.)
`
},