/* =========================================================
   WORLD END(S) — STORY (story.js)
   Works with engine.js I sent you.
   IMPORTANT: uses a GLOBAL variable: window.Story
   Node types supported:
   - label, bg, music, narr, say, choice, jump, end
   ========================================================= */

(() => {
  // Make sure State exists (engine.js also does this, but safe)
  window.State = window.State || {};
  State.vars = State.vars || { truth: 0, resolve: 0, mercy: 0, hope: 0, fear: 0 };
  State.flags = State.flags || {};

  // Helper to safely add stats inside choice effects
  const add = (k, n) => { State.vars[k] = (State.vars[k] || 0) + n; };

  window.Story = [
    // ============================================================
    // ENTRY
    // ============================================================
    { type: "label", id: "start" },
    { type: "bg", value: "impact" },
    { type: "music", value: "" },

    { type: "narr", text: `WORLD END(S)

Tap the screen to advance.
Choices shape your endings.

Stats:
Truth  • Resolve • Mercy • Hope • Fear` },

    { type: "choice",
      prompt: "Start a new game?",
      options: [
        {
          text: "Yes — Begin Chapter 1",
          effect: () => {
            // reset for fresh run
            State.vars.truth = 0;
            State.vars.resolve = 0;
            State.vars.mercy = 0;
            State.vars.hope = 0;
            State.vars.fear = 0;
            State.flags = {};
          },
          goto: "ch1_start"
        },
        {
          text: "No — I’m just testing",
          effect: () => { add("truth", 1); },
          goto: "test_room"
        }
      ]
    },

    // ============================================================
    // TEST ROOM (for debugging)
    // ============================================================
    { type: "label", id: "test_room" },
    { type: "narr", text: `TEST ROOM

If you can read this, story.js is loading and the engine is working.

Tap Next to return.` },
    { type: "choice",
      prompt: "Return to start?",
      options: [
        { text: "Back to Start", effect: () => {}, goto: "start" }
      ]
    },

    // ============================================================
    // CHAPTER 1 — LONG
    // ============================================================
    { type: "label", id: "ch1_start" },
    { type: "bg", value: "impact" },

    { type: "narr", text: `CHAPTER 1 — THE DAY THE SKY BURNED

The meteor didn’t arrive like a warning.

It arrived like a verdict.

A blade of fire cut across the night so bright it turned every window into a mirror.
People spilled into streets and onto balconies.
Phones rose like candles—like the city was holding vigil for something it didn’t understand yet.

For one breath, the world felt united.

Then the air changed.

Heat rolled in waves.
The light didn’t fade the way shooting stars fade.

It stayed.
It descended.

And deep in your chest—where instinct lives before thought—you felt it:

This wasn’t a rock.

This was an arrival.` },

    { type: "choice",
      prompt: "When the sky burns, what do you do first?",
      options: [
        {
          text: "Record it. Proof matters when the lies start.",
          effect: () => { add("truth", 1); State.flags.recorded = true; },
          goto: "ch1_record"
        },
        {
          text: "Call someone you love. If this is the end, you won’t be alone.",
          effect: () => { add("hope", 1); State.flags.called = true; },
          goto: "ch1_call"
        },
        {
          text: "Run outside toward the glow. If people need help, you want to be there.",
          effect: () => { add("resolve", 1); State.flags.ran = true; },
          goto: "ch1_run"
        },
        {
          text: "Freeze and listen. Fear can be information.",
          effect: () => { add("fear", 1); State.flags.froze = true; },
          goto: "ch1_freeze"
        }
      ]
    },

    // ----------------------------
    // RECORD PATH
    // ----------------------------
    { type: "label", id: "ch1_record" },
    { type: "narr", text: `You lift your phone.

The screen shakes—your hands aren’t steady.
But you keep filming anyway.

The streak hits the outskirts with a sound you feel more than hear.
A pressure thumps through the city like a second heartbeat.
Car alarms scream.
Distant glass shivers and fails.

Your camera catches the moment the horizon blooms—
not orange, not red, but white.

A white that looks wrong in nature.

You whisper without meaning to:
“This isn’t a meteor.”` },

    { type: "choice",
      prompt: "A crowd behind you is cheering like it’s fireworks. Do you warn them?",
      options: [
        {
          text: "Warn them. Loudly.",
          effect: () => { add("mercy", 1); State.flags.warned = true; },
          goto: "ch1_warned"
        },
        {
          text: "Keep filming. Evidence first.",
          effect: () => { add("truth", 1); State.flags.keptfilming = true; },
          goto: "ch1_keepfilming"
        }
      ]
    },

    { type: "label", id: "ch1_warned" },
    { type: "narr", text: `You turn and raise your voice.

“This isn’t safe! Get back—move!”

Some people laugh.
Some roll their eyes.
But a mother grabs her kid and pulls them away.
A man in a suit hesitates, then follows.
Like your certainty gave his fear permission to exist.

You didn’t save everyone.

But you saved someone.` },
    { type: "jump", to: "ch1_to_crater" },

    { type: "label", id: "ch1_keepfilming" },
    { type: "narr", text: `You keep the lens aimed at the horizon like it’s a weapon.

Because you know what comes next.
Officials will call it a “containment incident.”
News anchors will say “uncertain origin.”
People will argue online like truth is a preference.

But your video is real.

And real will matter.

The city lights flicker in sync with the crater’s glow.

Meteors don’t do that.` },
    { type: "jump", to: "ch1_to_crater" },

    // ----------------------------
    // CALL PATH
    // ----------------------------
    { type: "label", id: "ch1_call" },
    { type: "narr", text: `You call.

It rings once… twice…

Then a voice answers—sleepy, confused.

“You seeing this?” you ask.

A pause.

Then: “Yeah.”

You want to say I love you.
You want to say I’m scared.
You want to say If this ends, at least we existed.

But the city shakes again, harder.
The call crackles.

You say, “Stay inside. Lock your doors.”

They say, “You too.”

You lie.

“Yeah,” you say.

Then you hang up—because you already know you’re not staying inside.` },

    { type: "choice",
      prompt: "Sirens are converging on the impact zone. What’s your move?",
      options: [
        {
          text: "Go straight there. You can’t help from a distance.",
          effect: () => { add("resolve", 1); State.flags.wentimpact = true; },
          goto: "ch1_to_crater"
        },
        {
          text: "Guide civilians away first. One life at a time.",
          effect: () => { add("mercy", 1); State.flags.guided = true; },
          goto: "ch1_guided"
        }
      ]
    },

    { type: "label", id: "ch1_guided" },
    { type: "narr", text: `You sprint into the street.

People gather in clusters like they’re waiting for a show.
You point away from the glow.

“Back. Go home. Now.”

A teenager laughs. “Why? You a cop?”

You shake your head. “No. I’m someone who doesn’t want to watch you die.”

That lands.

A few follow.
Then more.

In panic, momentum is salvation.` },
    { type: "jump", to: "ch1_to_crater" },

    // ----------------------------
    // RUN PATH
    // ----------------------------
    { type: "label", id: "ch1_run" },
    { type: "narr", text: `You don’t think. You move.

Your feet slap pavement.
Wind cuts your eyes.
The sky’s glow paints every street sign with a sick, pale sheen.

Up ahead, police lines try to form.
A fire truck blocks an intersection.
People argue with responders.

You don’t argue.

You find a gap in the chaos and slip through.

Because the world is burning and you refuse to watch from far away.` },

    { type: "choice",
      prompt: "You spot someone injured near the curb—bleeding, stunned. Do you stop?",
      options: [
        {
          text: "Stop. Help them.",
          effect: () => { add("mercy", 1); State.flags.helped = true; },
          goto: "ch1_helped"
        },
        {
          text: "Keep going. The bigger threat is ahead.",
          effect: () => { add("resolve", 1); State.flags.keptgoing = true; },
          goto: "ch1_to_crater"
        }
      ]
    },

    { type: "label", id: "ch1_helped" },
    { type: "narr", text: `You kneel beside them.

Their eyes are wide—like they can’t believe pain is real.
You tear fabric, press it to the wound, speak softly.

“Breathe. Stay with me.”

When you finally stand, your hands are red.

And your resolve feels heavier.
Not weaker.

Heavier—like you picked up responsibility and decided to carry it.` },
    { type: "jump", to: "ch1_to_crater" },

    // ----------------------------
    // FREEZE PATH
    // ----------------------------
    { type: "label", id: "ch1_freeze" },
    { type: "narr", text: `You freeze.

Not because you’re a coward.

Because part of you is listening.

The sky makes a sound that isn’t thunder:
a high, distant whine—like metal under strain.
Like a door being forced open.

The light pulses once.
Twice.

The ground answers with a vibration that crawls up your bones.

You exhale and realize you’ve been holding your breath too long.

Fear isn’t always weakness.

Sometimes it’s the first honest thing you feel.` },

    { type: "choice",
      prompt: "You finally move. Which direction?",
      options: [
        {
          text: "Toward the impact. Fear can’t steer your life.",
          effect: () => { add("resolve", 1); State.flags.facedfear = true; },
          goto: "ch1_to_crater"
        },
        {
          text: "Find high ground first. Observe, then move.",
          effect: () => { add("truth", 1); add("fear", 1); State.flags.observed = true; },
          goto: "ch1_observe"
        }
      ]
    },

    { type: "label", id: "ch1_observe" },
    { type: "narr", text: `You don’t run away.

You reposition.

A side street, then stairs, then a rooftop edge.
From above, the impact zone looks like a wound in the city’s body.
Steam rises in columns. Sirens circle like vultures.

You see details others miss:
—The crater’s glow pulses in a rhythm.
—The streetlights flicker in sync.
—The air above the wreck looks… warped.

Whatever landed is still doing something.

You whisper: “Okay.”

And for the first time tonight, that word sounds like a plan.` },
    { type: "jump", to: "ch1_to_crater" },

    // ============================================================
    // CONVERGE: THE CRATER
    // ============================================================
    { type: "label", id: "ch1_to_crater" },
    { type: "narr", text: `The impact zone is not a hole.

It’s a scar.

The ground is glass in places, melted smooth.
Ash falls like dirty snow.
The air smells like burned rain and hot copper.

Emergency lights paint everything in red-blue pulses.
But the crater’s glow is whiter, colder—
and it doesn’t blink for anyone.

Then you see it:

Curved metal panels half-buried like ribs.

A shape too clean to be natural.

A ship.

And as if your realization was permission—

something inside the crater moves.` },

    { type: "choice",
      prompt: "A seam appears—quietly, like it’s unfolding. Do you get closer or fall back?",
      options: [
        {
          text: "Get closer. You need to know what’s coming out.",
          effect: () => { add("truth", 1); add("resolve", 1); State.flags.close = true; },
          goto: "ch1_close"
        },
        {
          text: "Fall back. Observe from cover and warn others.",
          effect: () => { add("truth", 1); State.flags.cover = true; },
          goto: "ch1_cover"
        }
      ]
    },

    { type: "label", id: "ch1_close" },
    { type: "narr", text: `You step close enough that heat kisses your face.

The seam widens with a soft hiss.
Air escapes—stale, chemical, not from Earth.

A shadow slides forward.

At first you think: insect.

Then you see the geometry of it:
armor plates overlapping like a living tank,
joints protected,
eyes set deep.

This isn’t an animal.

This is a design.` },
    { type: "jump", to: "ch1_attack" },

    { type: "label", id: "ch1_cover" },
    { type: "narr", text: `You duck behind a wrecked car and watch through cracked glass.

The hatch opens like a flower made of steel.

A shape crawls out—armored, jointed, alive.

Then another.
And another.

Not one.

Several.

You whisper, “This is an invasion.”

And for the first time tonight, the word feels exact.` },
    { type: "jump", to: "ch1_attack" },

    // ============================================================
    // ATTACK + TEAM TEASE
    // ============================================================
    { type: "label", id: "ch1_attack" },
    { type: "narr", text: `They don’t roar.

They click.

A sharp wet rhythm like language without vowels.

A responder raises a rifle.
The muzzle flashes.

The shots hit.

The creature doesn’t fall.

It only… adjusts.

Then it lunges.

Too fast.
Too clean.

The first human it strikes goes down like a puppet with its strings cut.

Panic detonates.

People stampede.
Cars collide.
Sirens become a choir of failure.

And you understand something cold and simple:

This thing didn’t come to be studied.

It came to hunt.` },

    { type: "choice",
      prompt: "In the chaos, what do you do?",
      options: [
        {
          text: "Fight. Even unarmed, you won’t watch people die.",
          effect: () => { add("resolve", 2); },
          goto: "ch1_fight"
        },
        {
          text: "Lead civilians to safety. Survival is also victory.",
          effect: () => { add("mercy", 2); },
          goto: "ch1_lead"
        },
        {
          text: "Fall back and get help. You can’t win this alone.",
          effect: () => { add("truth", 1); add("fear", 1); },
          goto: "ch1_gethelp"
        }
      ]
    },

    { type: "label", id: "ch1_fight" },
    { type: "narr", text: `You grab the nearest thing you can—metal pipe, broken signpost, anything—and charge.

Armor rings under your strike.
Your hands go numb.

The Beta snaps forward—

and an invisible force slams it sideways.

Not an explosion.

A shove.

The creature skids across glassed earth.

A voice—sharp, urgent—cuts through the chaos:

“MOVE!”

Something huge drops between you and the swarm.

A mech.

Human-made.
Armor plated.
Cockpit lights glowing like a new sunrise.

And somewhere in the mess of sound and fire, you hear a name shouted over comms:

“Rufki!”` },
    { type: "jump", to: "ch1_end" },

    { type: "label", id: "ch1_lead" },
    { type: "narr", text: `You become a voice in the storm.

“This way!”
“Keep moving!”
“Don’t stop!”

A Beta darts toward the crowd—

and a blade of blue-white energy slices the air.
The creature splits, ichor spraying like ink.

A second mech lands—sleek, fast—like a sword given legs.

External speakers boom:

“CIVILIANS—GET CLEAR!”

And in the comm chatter, you catch the names like sparks:

Muhammad.
Niko.
Alban.

Rufki.` },
    { type: "jump", to: "ch1_end" },

    { type: "label", id: "ch1_gethelp" },
    { type: "narr", text: `You retreat through smoke and screaming crowds, forcing your lungs to work.

You find a working radio in a security booth.
Your fingers shake as you key the mic.

“This is an invasion,” you say. “Non-human hostiles at the crash site.”

Static.

Then, finally: “Copy. Lockdown protocols. Evac routes. Send the pilots.”

Pilots.

You don’t know what that means yet.

But the word feels like hope with a uniform on.` },
    { type: "jump", to: "ch1_end" },

    // ============================================================
    // CHAPTER 1 END
    // ============================================================
    { type: "label", id: "ch1_end" },
    { type: "narr", text: `Steel giants clash against insect nightmares.

The creatures—later you’ll learn the world calls them *betas*—move with unnatural precision.
They don’t lash out randomly.

They choose.

They learn.

But the mechs hold the line.

And at the center of it all, you see the leader’s machine moving like it’s conducting the others—
syncing them, boosting them, making them better.

Rufki.

This isn’t a one-night battle.

This is a war.

And tonight was only the first page.

— END OF CHAPTER 1 —` },

    { type: "narr", text: `Next: CHAPTER 2 — THE BETAS

(You’ll paste Chapter 2 starting at label "ch2_start".)` },

    // Placeholder for your Chapter 2 paste
    { type: "label", id: "ch2_start" },
    { type: "narr", text: `CHAPTER 2 not pasted yet.` },

    { type: "end", text: "Thanks for playing the Chapter 1 demo." }
  ];
})();