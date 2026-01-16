const Story = [
  { type: "narr", text: " " },

  // =========================
  // CHAPTER 1 — THE DAY THE SKY BURNED
  // =========================
  { type: "bg", value: "gradient" },
  { type: "music", value: "" },

  { type: "narr", text:
`CHAPTER 1 — THE DAY THE SKY BURNED
...

The meteor blazed across the sky, leaving a trail of fire in its wake.

At first, people thought it was a miracle.
A rare light. A once-in-a-lifetime moment.
Phones rose into the air like candles.
Voices overlapped—excited, disbelieving, hungry for something beautiful to happen.

The sky answered with heat.

When it struck the ground, the impact was felt for miles around—less a crash, more a deep, violent shudder that rolled through the earth like a warning.

But it wasn’t a rock that landed on Earth.

It was a ship.` },

  { type: "narr", text:
`The next hours were chaos wrapped in fascination.

News helicopters circled the crater.
Scientists arrived in convoys.
Officials spoke carefully into microphones about safety and protocols and “nonhuman material.”

And through it all, the same thought kept repeating in your mind like a heartbeat:

This doesn’t feel like discovery.

It feels like arrival.` },

  { type: "speaker", name: "Rufki", text:
`“…That wasn’t a meteor.”` },

  { type: "narr", text:
`The world didn’t listen.

It never does at first.

People gathered near screens. People gathered near fences.
They wanted to see it. To understand it. To claim it.

To own it.

And then the Betas stepped into human history like a knife entering skin.

Insect-like shapes.
Too many limbs.
Too clean. Too intentional.
Their bodies were plated, segmented, built as if nature had been given blueprints and told to follow them.

At first, they just… moved.
Slowly. Curiously.
Almost gently.

And for a moment the world convinced itself it could survive this.

Then the first attack happened.` },

  { type: "narr", text:
`It wasn’t loud in the way people expected.

It was quick.

A single motion.
A single scream that cut off too fast.

Panic spread like fire, and the Betas followed it like hunters following blood.

They were unlike anything anyone had ever seen—
and within minutes, they proved something that would define the coming years:

They didn’t come to be studied.

They came to take.` },

  { type: "narr", text:
`In the days that followed, the damage multiplied.

Cities locked down.
Borders closed.
Emergency broadcasts played on repeat until the words lost meaning.

People still argued online about what they were seeing.
People still made jokes.
People still said, “It can’t be that bad.”

Then the footage came out.
The bodies.
The tearing.
The way the Betas moved through groups like they already knew how humans ran.

And finally—finally—the world understood:

This wasn’t a disaster.

It was a war.` },

  { type: "narr", text:
`But wars are supposed to have a front line.

This had none.

The Betas didn’t march like armies.
They spread like a disease, appearing in places that made no sense, hitting targets that felt chosen.

And humanity—humanity responded the only way it knew how at first:

With noise.

With meetings.
With speeches.
With flags and promises.

With fear dressed up as control.` },

  { type: "narr", text:
`Then the whole world ignites.

This is the moment history will name later.
The moment people will argue about.
The moment they’ll say they “felt coming.”

But you don’t feel clever.
You don’t feel brave.

You feel one thing:

The beginning.` },

  // =========================
  // CHAPTER 2 — THE BETAS
  // =========================
  { type: "label", id: "ch2_start" },
  { type: "bg", value: "chaos" },
  { type: "music", value: "" }, // optional: "assets/music/ambient2.mp3"

  { type: "narr", text:
`CHAPTER 2 — THE BETAS

You don’t remember falling back.

You remember the sound first—
a wet, sharp rhythm like something cutting through meat.

Then the crowd breaks.
Bodies collide. People trip over their own panic.
Someone drops their phone. Someone drops their child.
The air fills with one terrible realization:

This thing didn’t come to be studied.

It came to hunt.` },

  { type: "speaker", name: "Rufki", text:
`“Move! Don’t stare—MOVE!”` },

  { type: "narr", text:
`Your voice is swallowed by screams.

The Beta darts through the chaos with impossible precision, turning and correcting as if it’s reading the crowd like a map.
It doesn’t lash out randomly.
It chooses.

And when it chooses, it doesn’t miss.` },

  { type: "narr", text:
`A soldier raises his rifle. The muzzle flashes once—twice.

The shots land.
You see them hit.

The Beta doesn’t fall.

It only… adjusts.` },

  { type: "speaker", name: "Rufki", text:
`“…Armor.”` },

  { type: "narr", text:
`The word comes out like a curse.

It isn’t just tough.
It’s designed.

You catch a glimpse of its body—segment plates overlapping like a living tank, joints protected, eyes set deep.
This isn’t an animal.

This is an answer to a question humanity hasn’t even asked yet.` },

  { type: "choice",
    prompt: "In the stampede, you see someone pinned under a fallen barrier. What do you do?",
    options: [
      {
        text: "Go back and pull them free.",
        effect: () => { State.vars.mercy += 1; },
        goto: "ch2_save"
      },
      {
        text: "Keep moving and get to cover.",
        effect: () => { State.vars.resolve += 1; },
        goto: "ch2_cover"
      },
      {
        text: "Shout for help while you scan for the Beta.",
        effect: () => { State.vars.truth += 1; },
        goto: "ch2_shout"
      }
    ]
  },

  { type: "label", id: "ch2_save" },
  { type: "narr", text:
`You pivot hard against the tide of bodies.

The barrier is heavier than it looks—metal twisted and hot.
The person under it is half-conscious, eyes wide, lips moving without sound.

You hook your arms beneath the edge and heave.

Pain shoots up your shoulders.
The barrier shifts—enough.

You drag them free and shove them toward the nearest doorway.

They don’t thank you.
They can’t.

But they’re alive.` },
  { type: "goto", id: "ch2_common" },

  { type: "label", id: "ch2_cover" },
  { type: "narr", text:
`You force yourself to keep moving.

It feels wrong—like betrayal.
But staying in the open is suicide.

You slip behind a shattered concrete divider, breath ragged.
From here you can see the crowd thin out into scattered clusters.
You can see the Beta too—brief flashes of motion, like a nightmare skipping frames.` },
  { type: "goto", id: "ch2_common" },

  { type: "label", id: "ch2_shout" },
  { type: "narr", text:
`“HELP! OVER HERE!”

Your shout cuts through the noise for a second.
A couple of people glance your way, but panic doesn’t organize itself.
It only spreads.

Still—your eyes stay sharp.
You track the Beta’s pattern: it angles toward choke points, corners, bottlenecks.
It’s not just chasing prey.

It’s controlling the field.` },
  { type: "goto", id: "ch2_common" },

  { type: "label", id: "ch2_common" },
  { type: "bg", value: "ship" },

  { type: "narr", text:
`Minutes later—maybe hours—the scene collapses into sirens and orders.

Military vehicles form a hard perimeter. Soldiers shout commands nobody follows.
The crater is sealed behind walls of steel and fear.

News anchors call it a “containment incident.”
Government spokespeople call it “an isolated threat.”

But you saw the way it moved.
You saw the way it listened.

One Beta was enough to shatter the illusion of safety.

So what happens when there’s more?` },

  { type: "narr", text:
`That question follows you for the next two days.

It follows you into your sleep.
It follows you into the dead quiet of early morning when your phone buzzes with the first leaked video—
grainy footage from inside the perimeter.

A shape.

Not one.

Several.` },

  { type: "speaker", name: "Rufki", text:
`“…They’re multiplying.”` },

  { type: "bg", value: "beta" },
  { type: "narr", text:
`The video ends with static.

But the static doesn’t sound random.
It sounds… patterned.
Like interference.
Like something broadcasting on a frequency your world wasn’t built to hear.` },

  { type: "narr", text:
`On the third day, your city changes.

Not by explosion.
Not by invasion.

By silence.

Streets empty faster than they should.
Stores close without explanation.
Hospitals get “new protocols.”
Police radios run nonstop.

Everyone is waiting for the next thing to happen.

And then it does.` },

  { type: "bg", value: "impact" },
  { type: "narr", text:
`A second impact hits the outskirts.

No warning. No fireball across the sky.

Just a distant thud that you feel in your teeth.

Then another.

Then another.

As if something is arriving in pieces.

Or… as if the first ship was never alone.` },

  { type: "speaker", name: "Rufki", text:
`“This is a landing.”` },

  { type: "narr", text:
`Your hands are shaking, but your mind is clear.
Clear enough to recognize what’s happening:

The world is being paced.
Softened.
Tested.

A predator doesn’t always strike with full force.
Sometimes it circles first, watching for weaknesses.

And humanity—humanity is all weakness right now.` },

  { type: "choice",
    prompt: "A private message hits your phone from an unknown number: “If you want answers, come alone.”",
    options: [
      {
        text: "Go. Answers matter more than fear.",
        effect: () => { State.vars.resolve += 1; },
        goto: "ch2_meet"
      },
      {
        text: "Don’t go. Track the number instead.",
        effect: () => { State.vars.truth += 1; },
        goto: "ch2_track"
      },
      {
        text: "Reply: “Who are you?”",
        effect: () => { State.vars.mercy += 1; },
        goto: "ch2_reply"
      }
    ]
  },

  { type: "label", id: "ch2_meet" },
  { type: "bg", value: "chaos" },
  { type: "narr", text:
`You go.

Not because it’s smart.
Because waiting is worse.

The meeting point is under an old overpass where the city’s lights don’t reach.
A figure stands there like a cutout against the dark.

They don’t introduce themselves.

They just say one sentence that changes the shape of your future.` },

  { type: "speaker", name: "Unknown", text:
`“They’re not here to negotiate. They’re here to replace.”` },
  { type: "goto", id: "ch2_after_contact" },

  { type: "label", id: "ch2_track" },
  { type: "bg", value: "gradient" },
  { type: "narr", text:
`You don’t go.

You pull the number apart instead—reverse lookups, carrier traces, anything.

The result is impossible:
No carrier.
No registration.
As if the message didn’t come from a phone at all.

As if it came from inside the static.

Then your screen flickers once.

And a new message appears, already knowing what you did.` },

  { type: "speaker", name: "Unknown", text:
`“Smart. But you’re running out of time.”` },
  { type: "goto", id: "ch2_after_contact" },

  { type: "label", id: "ch2_reply" },
  { type: "bg", value: "gradient" },
  { type: "narr", text:
`Your fingers hover, then type:

“Who are you?”

The reply comes instantly.

No typing bubbles.
No delay.

Just words, clean as a blade.` },

  { type: "speaker", name: "Unknown", text:
`“Someone who survived the first wave.”` },
  { type: "goto", id: "ch2_after_contact" },

  { type: "label", id: "ch2_after_contact" },
  { type: "bg", value: "ship" },
  { type: "narr", text:
`That night, you stop calling it an “incident.”

You call it what it is.

A war—before the first battle line even forms.

You sit alone with the city’s distant sirens and your own thoughts, and you understand something you didn’t understand before:

If humanity waits for permission to fight, it will die waiting.

If humanity waits for a hero, it will die hoping.

So you begin to plan.

Not as a soldier.
Not as a politician.

As someone who refuses to be prey.` },

  { type: "speaker", name: "Rufki", text:
`“If we’re going to survive… we need something bigger than fear.”` },

  { type: "narr", text:
`Outside, the sky is quiet.

Too quiet.

But you can feel it now—like a hum beneath the world.

A signal.

A countdown.

And somewhere out there, the Betas are learning your planet’s name.` },

  { type: "end",
    title: "End of Chapter 2",
    body:
`Chapter 2 complete.

Next: Resistance

(Your choices continue to affect tone and the final message.)`
  },
];
