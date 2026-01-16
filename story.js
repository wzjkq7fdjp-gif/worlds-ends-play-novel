// ===================================================
// WORLD END(S) — GAME NOVEL
// story.js (WORKING TEMPLATE + LONG CHAPTER 1)
// ===================================================

// --------- REQUIRED SETUP (MUST BE OUTSIDE THE STORY ARRAY) ----------
State.vars.truth ??= 0;
State.vars.resolve ??= 0;
State.vars.mercy ??= 0;
State.vars.hope ??= 0;
State.vars.fear ??= 0;
State.vars.flags ??= {};

// --------- STORY ARRAY (EVERYTHING BELOW MUST BE INSIDE THIS ARRAY) ----------
const Story = [

  // ==============================
  // CHAPTER 1 — THE DAY THE SKY BURNED
  // ==============================
  { type: "label", id: "ch1_start" },
  { type: "bg", value: "impact" },
  { type: "music", value: "" },

  { type: "narr", text: `
CHAPTER 1 — THE DAY THE SKY BURNED

The meteor blazed across the sky, leaving a trail of fire in its wake.
It wasn’t a shooting star.
It wasn’t pretty.

It looked heavy.

Like the sky had thrown something at Earth.
`},

  { type: "narr", text: `
People flooded the street anyway.

Phones rose.
Someone laughed.
Someone said, “We’re seeing history!”

And for a moment, the world believed that history only happens in museums.
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
        effect: () => { State.vars.resolve += 1; State.vars.mercy += 1; },
        goto: "ch1_warn"
      },
      {
        text: "Freeze. You can’t look away.",
        effect: () => { State.vars.fear += 1; },
        goto: "ch1_freeze"
      }
    ]
  },

  { type: "label", id: "ch1_record" },
  { type: "narr", text: `
You raise your phone and keep it steady.

Hands trembling.
Breath shallow.

Not because you’re brave—
because you don’t trust the world to tell the truth later.
`},
  { type: "goto", value: "ch1_common1" },

  { type: "label", id: "ch1_warn" },
  { type: "narr", text: `
“Back up—BACK UP!”

You push people away from the crater line.
A kid bumps into you.
You guide them behind a parked car like it’s instinct.

Someone rolls their eyes.

Then the ground answers you.
`},
  { type: "goto", value: "ch1_common1" },

  { type: "label", id: "ch1_freeze" },
  { type: "narr", text: `
You stand still.

Your brain refuses to accept it.
Your body refuses to run.

The flame in the sky grows wider, louder—
until the world becomes one long, approaching roar.
`},
  { type: "goto", value: "ch1_common1" },

  { type: "label", id: "ch1_common1" },
  { type: "narr", text: `
The impact hits like a god slamming a fist into the city.

Windows scream.
Streetlights flicker.
Air turns thick with dust.

You feel it in your teeth.
`},

  { type: "narr", text: `
When the smoke thins, you see the crater.

And inside it—

not rock.

Metal.
`},

  { type: "bg", value: "ship" },

  { type: "narr", text: `
A ship.

Split open like a wound.
Steam rolling out like breath.
Parts of it still glowing, still alive, still… humming.
`},

  { type: "narr", text: `
Sirens arrive late.

Scientists arrive fast.

Soldiers arrive faster than that.
`},

  { type: "narr", text: `
The news calls it a “contact event.”

Officials call it “controlled.”

People call it “the greatest discovery in history.”

And you call it what it feels like:

A warning.
`},

  { type: "narr", text: `
Hours pass.

Floodlights surround the crater.
Metal barricades go up.
Voices blur into a constant murmur of questions.

Then something moves inside the wreckage.
`},

  { type: "bg", value: "beta" },

  { type: "narr", text: `
It steps out—slow and precise.

Insect-like.
Segmented armor overlapping like a living tank.
Joints protected. Eyes set deep.

It doesn’t stumble.
It doesn’t explore.

It scans.
`},

  { type: "narr", text: `
The Betas have arrived.
`},

  { type: "narr", text: `
A soldier raises his rifle.

A single shot cracks the air.

The round hits.

You SEE it hit.
`},

  { type: "narr", text: `
The Beta doesn’t fall.

It only… adjusts.
`},

  { type: "speaker", name: "Rufki", text: `
“…Armor.”
`},

  { type: "narr", text: `
The word comes out like a curse.

Armor means design.
Design means purpose.

Purpose means this was never a “visit.”
`},

  { type: "narr", text: `
The crowd breaks.

Bodies collide.
People trip over panic like it’s a physical thing.
Someone drops their phone.
Someone drops their child.

And the Beta moves—fast.
Not random.

Choosing.
`},

  { type: "choice",
    prompt: "A kid is frozen in the open street as the Beta angles toward them. What do you do?",
    options: [
      {
        text: "Sprint for the kid.",
        effect: () => { State.vars.mercy += 2; State.vars.resolve += 1; State.vars.hope += 1; },
        goto: "ch1_save_kid"
      },
      {
        text: "Distract the Beta—anything to buy time.",
        effect: () => { State.vars.resolve += 2; State.vars.fear += 1; },
        goto: "ch1_distract"
      },
      {
        text: "Watch the Beta’s movement—learn its pattern first.",
        effect: () => { State.vars.truth += 2; State.vars.fear += 1; },
        goto: "ch1_pattern"
      }
    ]
  },

  { type: "label", id: "ch1_save_kid" },
  { type: "narr", text: `
You run.

The world narrows to one thing: reach them.

You grab the kid and yank them behind a car.
Your shoulder slams metal.
Pain shoots up your arm.

The kid finally cries—like their body remembered it was alive.
`},
  { type: "goto", value: "ch1_common2" },

  { type: "label", id: "ch1_distract" },
  { type: "narr", text: `
You grab a chunk of broken sign and throw it hard.

It clatters down the street—sharp and loud.

The Beta snaps its head toward the sound.
Not like an animal.

Like a machine switching targets.

That half-second is enough.
People move.
People live.
`},
  { type: "goto", value: "ch1_common2" },

  { type: "label", id: "ch1_pattern" },
  { type: "narr", text: `
You force yourself to watch.

It angles toward choke points.
It herds the crowd into bottlenecks.
It doesn’t chase whoever’s closest—
it chases whoever can’t escape.

This isn’t instinct.

This is strategy.
`},
  { type: "goto", value: "ch1_common2" },

  { type: "label", id: "ch1_common2" },
  { type: "narr", text: `
Gunfire multiplies.
Screams multiply faster.

The Beta cuts through the chaos with impossible precision.

Then another shape moves inside the ship.

And another.

And another.
`},

  { type: "narr", text: `
That’s when the word “incident” dies.

Because one is an incident.
Several is a beginning.
`},

  { type: "narr", text: `
In the following days, reports hit every city.
Grainy footage. Static-filled audio. Entire neighborhoods going silent.

The Betas spread across the globe like the world is being tested.
Measured.
Softened.
`},

  { type: "bg", value: "base" },

  { type: "narr", text: `
And in the face of that threat, a response forms.

Not a government plan.

Not a press conference.

A team.
`},

  { type: "narr", text: `
Young pilots.
Prototype mechs.
People with abilities that shouldn’t exist but do.

Muhammad — telekinetic, moving the impossible like it’s weightless.
Niko — energy manipulator, turning power itself into a weapon.
Alban — super soldier, refusing to fall even when the body begs.

And you—

Rufki.

The one who can synchronize systems.
Control and enhance multiple mechs at once.
Make separate machines fight like one organism.
`},

  { type: "choice",
    prompt: "At the first briefing, what do you promise your team?",
    options: [
      {
        text: "“We save people first. Always.”",
        effect: () => { State.vars.mercy += 1; State.vars.hope += 1; },
        goto: "ch1_promise_common"
      },
      {
        text: "“We learn the truth. That’s how we win.”",
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
  { type: "speaker", name: "Rufki", text: `
“If they’re designed… then they can be beaten.”
`},

  { type: "narr", text: `
You don’t know it yet—

but this promise is the first thread of your ending.

Because endings aren’t decided by the last fight.

They’re decided by what you choose to be…
when it's easier to be nothing.
`},

  // If you haven't added Chapter 2 yet, keep this END.
  // When you're ready, replace this END with:
  // { type: "goto", value: "ch2_start" },
  { type: "end",
    title: "End of Chapter 1",
    body: `
Chapter 1 complete.

Next: Hold the Line
(Your choices are being recorded.)
`
  },

];