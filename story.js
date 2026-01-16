/* ============================================================================
   WORLD END(S) — Story File
   Chapter 1 (LONG, with choices from the start)
   Tracks: truth, resolve, mercy, hope, fear (+ optional flags)
   IMPORTANT: This file must define Story globally so engine.js can read it.
============================================================================ */

(() => {
  // Safe stat defaults (won’t overwrite existing saves)
  window.State = window.State || {};
  State.vars = State.vars || {};
  State.vars.truth ??= 0;
  State.vars.resolve ??= 0;
  State.vars.mercy ??= 0;
  State.vars.hope ??= 0;
  State.vars.fear ??= 0;
  State.vars.flags ??= {};

  // Your story data
  window.Story = [
    // ============================================================
    // ENTRY POINT
    // ============================================================
    { type: "label", id: "start" },
    { type: "bg", value: "impact" },
    { type: "music", value: "" },

    { type: "narr", text: `WORLD END(S)

Tap to begin.` },

    // ============================================================
    // CHAPTER 1 — THE DAY THE SKY BURNED
    // ============================================================
    { type: "label", id: "ch1_start" },

    { type: "narr", text: `CHAPTER 1 — THE DAY THE SKY BURNED

The meteor didn’t arrive like a warning.

It arrived like a verdict.

A blade of fire carved the night sky bright enough to turn the city’s windows into mirrors.
People pointed.
People cheered.
Phones rose like candles.

For one breath, the world felt united.

Then the air changed.

Heat rolled in waves.
The light didn’t fade the way shooting stars do.

It stayed.
It descended.

And deep in your chest—where instinct lives before thought—you felt it:

This wasn’t a rock.

This was an arrival.` },

    { type: "choice",
      prompt: "When the sky burns, what do you do first?",
      options: [
        {
          text: "Record it. Proof matters more than comfort.",
          effect: () => { State.vars.truth += 1; State.vars.flags.recordedMeteor = true; },
          goto: "ch1_record"
        },
        {
          text: "Call someone you love. If this is the end, you won’t be alone.",
          effect: () => { State.vars.hope += 1; State.vars.flags.calledLovedOne = true; },
          goto: "ch1_call"
        },
        {
          text: "Run toward impact. If people are in danger, you need to be there.",
          effect: () => { State.vars.resolve += 1; State.vars.flags.ranTowardImpact = true; },
          goto: "ch1_run"
        },
        {
          text: "Freeze. Watch. Listen. Fear can be information.",
          effect: () => { State.vars.fear += 1; State.vars.flags.froze = true; },
          goto: "ch1_freeze"
        },
      ]
    },

    // ----------------------------
    // BRANCH: RECORD
    // ----------------------------
    { type: "label", id: "ch1_record" },
    { type: "narr", text: `You lift your phone.

The screen shakes—your hands aren’t steady.
But you keep filming anyway.

The streak hits the outskirts with a sound you feel more than hear.
A dull pressure thumps through the city like a second heartbeat.
Car alarms sing in panicked harmony.

Your camera catches the moment the horizon blooms.
Not orange. Not red.

White.

A white that looks wrong in nature.

A caption slips into your mind without permission:

Impact site: unknown.
Object: unknown.
Intent: unknown.

But the footage is real.

And later—when people start lying—real will matter.` },

    { type: "choice",
      prompt: "A crowd forms behind you, excited—like this is fireworks. Do you warn them?",
      options: [
        {
          text: "Yes. Tell them to back away, loudly.",
          effect: () => { State.vars.mercy += 1; State.vars.flags.warnedCrowd = true; },
          goto: "ch1_warned"
        },
        {
          text: "No. You keep recording. Evidence first.",
          effect: () => { State.vars.truth += 1; State.vars.flags.keptRecording = true; },
          goto: "ch1_keptRecording"
        },
      ]
    },

    { type: "label", id: "ch1_warned" },
    { type: "narr", text: `You turn and raise your voice.

“This isn’t safe! Get back—move!”

Some laugh.
A few roll their eyes.
But a mother grabs her kid’s wrist and pulls them away.

A man in a suit hesitates, then follows.
Like your certainty gave his fear permission to exist.

You didn’t save everyone.

But you saved someone.

And that matters.` },
    { type: "goto", id: "ch1_toimpact" },

    { type: "label", id: "ch1_keptRecording" },
    { type: "narr", text: `You don’t speak.

You keep the lens aimed at the horizon like it’s a weapon.
Because in a world that will soon be full of screams, proof is a kind of mercy too.

Someone behind you says, “It’s fine. It’s just a meteor.”

Your video captures the moment the city lights flicker—
and you know the truth before anyone else:

Meteors don’t kill power grids from miles away.` },
    { type: "goto", id: "ch1_toimpact" },

    // ----------------------------
    // BRANCH: CALL
    // ----------------------------
    { type: "label", id: "ch1_call" },
    { type: "narr", text: `You call.

The line rings once.
Twice.

Then a voice answers—sleepy, confused.

“You seeing this?” you ask.

A pause.

Then: “Yeah.”

And in that single word, you hear it:
someone else felt the same wrongness you did.

You want to say I love you.
You want to say I’m scared.
You want to say If this ends, at least we existed.

But the city shakes again, harder.
A second thunder rolls through concrete.

The call crackles.

You say, “Stay inside. Lock your doors.”

They say, “You too.”

You lie.

“Yeah,” you say.

Then you hang up, because you already know you’re not staying inside.` },

    { type: "choice",
      prompt: "You’re close to the impact zone. Sirens are converging. What do you do?",
      options: [
        {
          text: "Head straight there. You can’t help from a distance.",
          effect: () => { State.vars.resolve += 1; State.vars.flags.wentToImpact = true; },
          goto: "ch1_toimpact"
        },
        {
          text: "Try to guide civilians away first. One life at a time.",
          effect: () => { State.vars.mercy += 1; State.vars.flags.guidedCivilians = true; },
          goto: "ch1_civilians"
        },
      ]
    },

    { type: "label", id: "ch1_civilians" },
    { type: "narr", text: `You sprint into the street.

People are gathered in clusters like they’re waiting for a concert to start.
You point away from the glow.

“Back. Go home. Now.”

A teenager laughs. “Why? You a cop?”

You shake your head. “No. I’m someone who doesn’t want to watch you die.”

That lands.

A few follow.
Then more.

You don’t know if they’ll listen all the way—
but you started the movement.

And in a panic, momentum is salvation.` },
    { type: "goto", id: "ch1_toimpact" },

    // ----------------------------
    // BRANCH: RUN TOWARD IMPACT
    // ----------------------------
    { type: "label", id: "ch1_run" },
    { type: "narr", text: `You don’t think. You move.

Your feet slap pavement.
Wind cuts your eyes.
The sky’s glow paints every street sign with a sick, pale sheen.

As you run, you pass a small shrine taped to a lamppost—candles, photos, names.
The city was already mourning something.

Tonight, it will add more names.

Up ahead, the police line tries to form.
A fire truck blocks an intersection.
People argue with responders.

You don’t argue.

You find the gap where chaos hasn’t sealed yet, and you slip through.

Because the world is burning and you refuse to be the type of person who watches from far away.` },

    { type: "choice",
      prompt: "You spot an injured bystander near the curb—bleeding, stunned. Do you stop?",
      options: [
        {
          text: "Stop. Help them. If you can’t protect one person, what’s the point?",
          effect: () => { State.vars.mercy += 1; State.vars.flags.helpedBystander = true; },
          goto: "ch1_helped"
        },
        {
          text: "Keep going. The bigger threat is ahead.",
          effect: () => { State.vars.resolve += 1; State.vars.flags.keptGoing = true; },
          goto: "ch1_toimpact"
        },
      ]
    },

    { type: "label", id: "ch1_helped" },
    { type: "narr", text: `You kneel beside them.

Their eyes are wide—like they can’t believe pain is real.
You tear fabric, press it to the wound, speak softly.

“Breathe. Stay with me.”

Somewhere, sirens wail.
Somewhere, something cracks the sky again.

But here—right here—you keep one human being anchored to life.

When you finally stand, your hands are red.

And your resolve feels heavier.

Not weaker.

Heavier.

Like you picked up responsibility and decided to carry it.` },
    { type: "goto", id: "ch1_toimpact" },

    // ----------------------------
    // BRANCH: FREEZE
    // ----------------------------
    { type: "label", id: "ch1_freeze" },
    { type: "narr", text: `You freeze.

Not because you’re a coward.

Because part of you is listening.

The sky makes a sound that isn’t thunder.
A high, distant whine—like metal under strain.
Like a door being forced open.

Every instinct you own tells you to remember this.

To catalog it.
To survive it.

The light pulses once.
Twice.

And then the ground answers with a low vibration that crawls up your bones.

You exhale and realize you’ve been holding your breath for too long.

Fear isn’t always weakness.

Sometimes it’s the first honest thing you feel.` },

    { type: "choice",
      prompt: "You finally move. Which direction?",
      options: [
        {
          text: "Toward the impact. Fear can’t steer your life.",
          effect: () => { State.vars.resolve += 1; State.vars.flags.facedFear = true; },
          goto: "ch1_toimpact"
        },
        {
          text: "Away from it. You’ll regroup, plan, and come back smarter.",
          effect: () => { State.vars.truth += 1; State.vars.fear += 1; State.vars.flags.regrouped = true; },
          goto: "ch1_regroup"
        },
      ]
    },

    { type: "label", id: "ch1_regroup" },
    { type: "narr", text: `You step back.

You don’t run.
Not yet.

You move like a chess player refusing a trap.

You take a side street, get high ground, and watch the impact zone from a safer angle.
From here you see details others miss:

—A ring of scorched air, like the atmosphere itself was scraped raw.
—A strange stutter in the city lights, synchronized with the pulses of that white glow.

Whatever landed is still *doing something.*

You whisper: “Okay.”

And for the first time tonight, that word sounds like a plan.` },
    { type: "goto", id: "ch1_toimpact" },

    // ============================================================
    // CONVERGE: IMPACT ZONE
    // ============================================================
    { type: "label", id: "ch1_toimpact" },
    { type: "narr", text: `The impact zone looks like a crater from a nightmare.

Not a hole.

A wound.

Steam rises in twisting columns.
The ground is glass in places, melted smooth.
The air smells like hot copper and burned rain.

Emergency lights paint everything in red-and-blue pulses.
But the crater’s glow is whiter, colder, and it doesn’t blink for anyone.

Then you see it.

Not rock.

Metal.

Curved panels half-buried, like ribs.
A shape too clean to be natural, too large to be an aircraft, too wrong to be anything human.

A ship.

And as if your realization was permission—

something inside the crater moves.` },

    { type: "choice",
      prompt: "A hatch seam appears—quietly, like it’s unfolding. Do you get closer or fall back?",
      options: [
        {
          text: "Get closer. You need to know what’s coming out.",
          effect: () => { State.vars.truth += 1; State.vars.resolve += 1; State.vars.flags.closeToHatch = true; },
          goto: "ch1_hatch_close"
        },
        {
          text: "Fall back. You’ll observe from cover and warn others.",
          effect: () => { State.vars.truth += 1; State.vars.flags.tookCover = true; },
          goto: "ch1_hatch_cover"
        },
      ]
    },

    { type: "label", id: "ch1_hatch_close" },
    { type: "narr", text: `You step closer until heat licks your face.

The seam widens with a soft hiss.
A breath of air escapes—stale, chemical, not from Earth.

A shadow slides forward.

First you think: insect.

Then you see the geometry of it:
armor plates layered like a beetle’s shell,
limbs jointed wrong,
eyes that reflect light without understanding it.

And behind it—more movement.

Not one.

Many.

Someone behind you whispers, “Oh my God.”

You don’t say anything.

Because saying it makes it real.

And it’s already real.` },

    { type: "goto", id: "ch1_first_contact" },

    { type: "label", id: "ch1_hatch_cover" },
    { type: "narr", text: `You duck behind a wrecked car and watch through shattered glass.

From here, you see it clearly:
the seam isn’t forced.

It’s *designed*.

The hatch opens like a flower made of steel.

A pressure wave of cold air spills out, crawling across the crater like fog.
A shape emerges—armored, jointed, alive.

You count.

One. Two. Three.

Then you stop counting, because the number keeps rising.

You whisper, “This is an invasion.”

And for the first time tonight, the word feels exact.` },

    { type: "goto", id: "ch1_first_contact" },

    // ============================================================
    // FIRST CONTACT
    // ============================================================
    { type: "label", id: "ch1_first_contact" },
    { type: "narr", text: `They don’t roar.

They *click*.

A rapid, wet-sounding rhythm—like language without vowels.

One of the creatures turns its head toward the crowd.

And then everything happens at once:

—A responder raises a weapon.
—Someone screams.
—A child cries.

The creature lunges.

It moves too fast for its size.
A blur of blades and plated limbs.

The first human it hits goes down like a puppet with its strings cut.

Panic detonates.

People stampede.
Cars crash.
Sirens become a choir of failure.

Your lungs tighten.

This is the moment the world stops being normal.

This is the moment it becomes a story of survival.` },

    { type: "choice",
      prompt: "Do you fight, flee, or lead?",
      options: [
        {
          text: "Fight. Even unarmed, you won’t watch people die.",
          effect: () => { State.vars.resolve += 2; State.vars.flags.ch1_fight = true; },
          goto: "ch1_fight"
        },
        {
          text: "Flee—then return with help. You can’t win this alone.",
          effect: () => { State.vars.truth += 1; State.vars.fear += 1; State.vars.flags.ch1_flee = true; },
          goto: "ch1_flee"
        },
        {
          text: "Lead people to safety. Survival is also a victory.",
          effect: () => { State.vars.mercy += 2; State.vars.flags.ch1_lead = true; },
          goto: "ch1_lead"
        },
      ]
    },

    { type: "label", id: "ch1_fight" },
    { type: "narr", text: `You grab the nearest thing you can—metal pipe, broken signpost, anything—and you run toward the chaos.

A creature turns.
Its eyes reflect you like you’re already dead.

You swing anyway.

The strike rings off armor.
Your hands go numb.

The creature snaps forward—
and at the last second a blast of force slams it sideways.

Not an explosion.

A shove.

Something invisible.

The creature skids across glassed earth and crashes into wreckage.

A voice in your ear, over comms you didn’t realize were active:

“MOVE!”

A massive machine drops between you and the creatures.

A mech.

Human-made.
Huge.
Armor plated.
The cockpit lights glow like a new sunrise.

And in your mind a name forms like prophecy:

Rufki.` },

    { type: "goto", id: "ch1_mechs_arrive" },

    { type: "label", id: "ch1_flee" },
    { type: "narr", text: `You back away, heart hammering, forcing your legs to obey.

You sprint through smoke and screaming crowds, weaving around collisions.
You’re not running from responsibility—
you’re running to get *resources*.

You find a working radio in a security booth.
Your fingers shake as you key the mic.

“This is an invasion,” you say. “Not a meteor. Not a freak accident. I repeat—non-human hostiles at the impact site.”

Static.

Then a response: “Say again?”

You grit your teeth. “They’re killing people.”

A pause.

Then: “All units—lockdown protocols. Evac routes. Send the pilots.”

Pilots.

You don’t know what that means yet.

But the word feels like hope with a uniform on.` },

    { type: "goto", id: "ch1_mechs_arrive" },

    { type: "label", id: "ch1_lead" },
    { type: "narr", text: `You grab strangers by the shoulders and point.

“This way—NOW!”

You push a collapsed man behind a concrete barrier.
You lift a kid who’s too small to run fast.
You become a voice in the storm, cutting through fear with direction.

A creature skitters toward the crowd.

You see it choose its target.

You throw yourself between them anyway.

And right as its blade-limb comes down—

a wall of light slices the air.

Not fire.

Energy.

The creature splits, armor and ichor scattering across the glassed ground.

A second machine lands—sleek and fast—like a blade given legs.

A voice echoes through external speakers:

“Civilians—GET CLEAR!”

You look up.

Mechs.

Multiple.

A team.

And at their center—one unit moves like it’s conducting the others, syncing them, boosting them, making them *better*.

Rufki.` },

    { type: "goto", id: "ch1_mechs_arrive" },

    // ============================================================
    // THE TEAM REVEAL
    // ============================================================
    { type: "label", id: "ch1_mechs_arrive" },
    { type: "bg", value: "battle" },
    { type: "music", value: "" },

    { type: "narr", text: `Steel giants clash against insect nightmares.

The creatures—later you’ll learn people call them *betas*—swarm like a living storm.
They climb wreckage.
They leap.
They tear.

But the mechs hold.

A telekinetic shove hurls a beta into another.
An energy blast burns through armor plates with surgical precision.
A super-soldier mech charges like a battering ram, fists turning exoskeleton into shrapnel.

And the leader—

Rufki.

His mech’s systems pulse, and the others respond like instruments tuned to the same song.
As if his will is an amplifier.

As if he can control and enhance multiple mechs at once.

He doesn’t just fight.

He coordinates.

He *leads*.

Over comms, you hear names shouted through chaos:

“Muhammad—left flank!”
“Niko—clear the rooftops!”
“Alban—hold the line!”

The world is ending.

And a handful of young pilots are standing in front of it like a shield.` },

    { type: "choice",
      prompt: "This is your first real choice that echoes long-term: what do you admire most in them?",
      options: [
        {
          text: "Rufki’s leadership. A hero is someone who becomes the center of gravity.",
          effect: () => { State.vars.hope += 1; State.vars.resolve += 1; State.vars.flags.admireLeadership = true; },
          goto: "ch1_end"
        },
        {
          text: "Muhammad’s raw protection. Power used to push danger away from others.",
          effect: () => { State.vars.mercy += 1; State.vars.flags.admireProtection = true; },
          goto: "ch1_end"
        },
        {
          text: "Niko’s precision. Control, intelligence, and calculated risk.",
          effect: () => { State.vars.truth += 1; State.vars.flags.admirePrecision = true; },
          goto: "ch1_end"
        },
        {
          text: "Alban’s courage. The one who steps forward when everyone else steps back.",
          effect: () => { State.vars.resolve += 1; State.vars.flags.admireCourage = true; },
          goto: "ch1_end"
        },
      ]
    },

    // ============================================================
    // CHAPTER 1 END — HOOK INTO CHAPTER 2
    // ============================================================
    { type: "label", id: "ch1_end" },
    { type: "narr", text: `The betas fall back—not because they’re defeated…
but because they’ve learned something.

They’ve learned humans can fight back.

Rufki’s mech turns, scanning the crater, the streets, the skyline.
As if he’s searching for the hand behind the swarm.

For a second, your eyes meet the cockpit’s glass.

You can’t see his face clearly.

But you can feel the weight of his decision:

This isn’t a one-night battle.

This is a war.

And tonight was only the first page.

End of Chapter 1.

Next: The First Stand.` },

    // This label is where you'll paste Chapter 2 next
    { type: "label", id: "ch2_start" },
    { type: "narr", text: `CHAPTER 2 — (Paste Chapter 2 here)

(When you paste your Chapter 2 code, replace this placeholder.)` },
  ];
})();