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
},// ==============================
// CHAPTER 2 — HOLD THE LINE
// (Based on your Chapter 2: hours-long fight, mechs battered, city center defense)
// ==============================

{ type: "label", id: "ch2_start" },
{ type: "bg", value: "battle" },
{ type: "music", value: "" },

{ type: "narr", text: `
CHAPTER 2 — HOLD THE LINE
`},

{ type: "narr", text: `
Gunfire echoes through the streets.
Metal screams.
Concrete turns to dust.
`},

{ type: "narr", text: `
Rufki and his team have been fighting for hours.
`},

{ type: "narr", text: `
Their mechs are battered—armor plates scorched, joints grinding, alarms blinking like warnings from a dying world.
`},

{ type: "speaker", name: "Muhammad", text: `
“We can’t keep this up much longer!”
`},

{ type: "speaker", name: "Muhammad", text: `
“These things just keep coming!”
`},

{ type: "narr", text: `
Your comms crackle under the strain.
Even radio signals sound afraid.
`},

{ type: "speaker", name: "Rufki", text: `
“We hold until reinforcements arrive.”
`},

{ type: "speaker", name: "Rufki", text: `
“We can’t let them reach the city center.”
`},

{ type: "narr", text: `
Ahead, the Betas pour through the broken avenue like a living tide.
Not random. Not frantic.
Organized.
`},

{ type: "choice",
  prompt: "A swarm is pushing hard from the left flank. What call do you make?",
  options: [
    {
      text: "Send Alban to smash the flank head-on.",
      effect: () => { State.vars.resolve += 2; State.vars.fear += 1; },
      goto: "ch2_left_alban"
    },
    {
      text: "Have Muhammad lift debris to create a choke point.",
      effect: () => { State.vars.truth += 1; State.vars.resolve += 1; },
      goto: "ch2_left_choke"
    },
    {
      text: "Order a retreat to protect civilians behind you.",
      effect: () => { State.vars.mercy += 2; State.vars.hope += 1; },
      goto: "ch2_left_retreated"
    }
  ]
},

{ type: "label", id: "ch2_left_alban" },
{ type: "speaker", name: "Alban", text: `
“Finally.”
`},

{ type: "narr", text: `
Alban charges like a battering ram.
His mech’s fists slam into Beta armor with brutal rhythm—CRACK—CRACK—CRACK.
`},

{ type: "narr", text: `
For a moment, it works.
The flank bends.
But the swarm doesn’t break.
It adapts—climbing, circling, seeking joints.
`},

{ type: "narr", text: `
You feel your stomach drop.
They’re learning.
`},

{ type: "goto", id: "ch2_common_after_left" },

{ type: "label", id: "ch2_left_choke" },
{ type: "speaker", name: "Muhammad", text: `
“Copy.”
`},

{ type: "narr", text: `
Muhammad’s mind reaches out.
Cars lift.
Concrete slabs rise.
A wall forms in midair and slams down—
turning the street into a narrow kill tunnel.
`},

{ type: "narr", text: `
Betas collide into the choke point, forced into a tighter flow.
`},

{ type: "narr", text: `
It’s not victory.
But it’s control.
`},

{ type: "goto", id: "ch2_common_after_left" },

{ type: "label", id: "ch2_left_retreated" },
{ type: "speaker", name: "Rufki", text: `
“Fall back—NOW. Keep them off the civilians.”
`},

{ type: "narr", text: `
You hate giving ground.
But you see people behind you—families trapped between rubble and fear.
`},

{ type: "narr", text: `
Your team pulls back in formation, covering the retreat.
Your mech takes hits meant for strangers.
`},

{ type: "narr", text: `
A scream turns into silence somewhere behind you.
You don’t look.
You keep moving.
`},

{ type: "goto", id: "ch2_common_after_left" },

{ type: "label", id: "ch2_common_after_left" },
{ type: "narr", text: `
Niko darts through the air, energy blazing from his hands.
`},

{ type: "speaker", name: "Niko", text: `
“We’re not going to let them win.”
`},

{ type: "narr", text: `
He sounds calm.
But you can hear the strain behind it.
His power flickers between precision and exhaustion.
`},

{ type: "narr", text: `
A Beta leaps—too fast—aimed straight at the evac route.
`},

{ type: "choice",
  prompt: "It’s going to hit the civilians. You have seconds.",
  options: [
    {
      text: "Take the hit—put your mech between the Beta and the people.",
      effect: () => { State.vars.mercy += 2; State.vars.resolve += 1; State.vars.hope += 1; },
      goto: "ch2_shield"
    },
    {
      text: "Order Niko to overload it with energy (risky).",
      effect: () => { State.vars.truth += 1; State.vars.resolve += 1; State.vars.fear += 1; },
      goto: "ch2_overload"
    },
    {
      text: "Freeze it with Muhammad’s telekinesis and study its armor seams.",
      effect: () => { State.vars.truth += 2; },
      goto: "ch2_freeze_study"
    }
  ]
},

{ type: "label", id: "ch2_shield" },
{ type: "narr", text: `
You slam your mech forward and take the impact.
`},

{ type: "narr", text: `
Claws rake your chassis.
Warning lights flare red.
Your systems scream.
`},

{ type: "narr", text: `
But the civilians behind you live another minute.
And sometimes, a minute is everything.
`},

{ type: "goto", id: "ch2_midbattle" },

{ type: "label", id: "ch2_overload" },
{ type: "speaker", name: "Rufki", text: `
“Niko—overload it!”
`},

{ type: "speaker", name: "Niko", text: `
“…That could blow my core.”
`},

{ type: "speaker", name: "Rufki", text: `
“Do it anyway.”
`},

{ type: "narr", text: `
Niko’s energy spikes.
The Beta convulses as arcs rip through its joints.
`},

{ type: "narr", text: `
For a second—victory.
Then Niko’s mech stutters, smoke spilling from vents.
`},

{ type: "speaker", name: "Niko", text: `
“I’m… fine.”
`},

{ type: "narr", text: `
He’s lying.
But you let him.
Because you need him.
`},

{ type: "goto", id: "ch2_midbattle" },

{ type: "label", id: "ch2_freeze_study" },
{ type: "speaker", name: "Rufki", text: `
“Muhammad—pin it!”
`},

{ type: "narr", text: `
The Beta stops mid-leap—suspended like an insect in amber.
`},

{ type: "narr", text: `
You lean in, scanning the plates.
Overlapping armor.
Protected joints.
But…
`},

{ type: "narr", text: `
There’s a seam under the throat.
A thin line that flexes when it breathes.
`},

{ type: "narr", text: `
A weakness.
Small.
But real.
`},

{ type: "goto", id: "ch2_midbattle" },

{ type: "label", id: "ch2_midbattle" },
{ type: "narr", text: `
Hours pass like a blur of alarms and bloodless screams.
`},

{ type: "narr", text: `
Your hands ache from gripping the controls.
Your jaw is locked so tight it hurts to breathe.
`},

{ type: "speaker", name: "Muhammad", text: `
“Rufki—look!”
`},

{ type: "narr", text: `
A second wave crests the horizon.
Not just more Betas.
Different ones.

Bigger.
Heavier.
Built for breaking lines.
`},

{ type: "narr", text: `
Your HUD labels them with a new warning:
UNKNOWN CLASS
`},

{ type: "speaker", name: "Alban", text: `
“I’ll hold them back as long as I can!”
`},

{ type: "narr", text: `
He sounds like someone trying to convince himself.
`},

{ type: "choice",
  prompt: "Alban is about to charge the new class alone. What do you do?",
  options: [
    {
      text: "Let him. You need someone to stop the breach.",
      effect: () => { State.vars.resolve += 2; State.vars.fear += 1; State.vars.flags.alban_risked = true; },
      goto: "ch2_alban_charge"
    },
    {
      text: "Order him back—no solo heroics.",
      effect: () => { State.vars.mercy += 1; State.vars.truth += 1; State.vars.flags.alban_saved = true; },
      goto: "ch2_alban_back"
    },
    {
      text: "Go with him. If anyone falls, you fall together.",
      effect: () => { State.vars.resolve += 1; State.vars.mercy += 1; State.vars.hope += 1; State.vars.flags.rufki_frontline = true; },
      goto: "ch2_alban_together"
    }
  ]
},

{ type: "label", id: "ch2_alban_charge" },
{ type: "narr", text: `
Alban charges like thunder.
`},

{ type: "narr", text: `
He hits the new-class Beta—
and for the first time, you see Alban get pushed back.
`},

{ type: "narr", text: `
His mech skids.
Armor dents.
A warning tone you’ve never heard before.
`},

{ type: "narr", text: `
He can hold.
But it’s costing him.
`},

{ type: "goto", id: "ch2_endpush" },

{ type: "label", id: "ch2_alban_back" },
{ type: "speaker", name: "Rufki", text: `
“Alban, NO. Fall back. We do this as a unit.”
`},

{ type: "narr", text: `
Alban hesitates—anger flashing.
Then he obeys.
`},

{ type: "narr", text: `
You form a defensive line together.
It’s uglier.
Slower.
But no one is left alone.
`},

{ type: "goto", id: "ch2_endpush" },

{ type: "label", id: "ch2_alban_together" },
{ type: "narr", text: `
You push your mech forward beside Alban’s.
`},

{ type: "speaker", name: "Rufki", text: `
“Together.”
`},

{ type: "speaker", name: "Alban", text: `
“…Together.”
`},

{ type: "narr", text: `
Two mechs hit the new-class Beta at once.
Your systems synchronize—your power threading through both frames.
For a second, you feel it:

A hidden strength.
A connection.
A way to become more than one machine.
`},

{ type: "goto", id: "ch2_endpush" },

{ type: "label", id: "ch2_endpush" },
{ type: "narr", text: `
The line holds.
Barely.
`},

{ type: "narr", text: `
Sirens in the distance shift pitch.
New engines roar—friendly ones.
Reinforcements.
`},

{ type: "narr", text: `
The Betas don’t retreat like animals.
They withdraw like soldiers.
Clean.
Coordinated.
As if the point was never to win today…
`},

{ type: "narr", text: `
…only to measure you.
`},

{ type: "speaker", name: "Rufki", text: `
“They were testing us.”
`},

{ type: "speaker", name: "Muhammad", text: `
“That’s… not possible.”
`},

{ type: "speaker", name: "Niko", text: `
“It is if they’re learning.”
`},

{ type: "narr", text: `
You look out over the ruined street and feel your stomach twist.
`},

{ type: "narr", text: `
Because if they learned from this…

What are they building for next?
`},

{ type: "end",
  title: "End of Chapter 2",
  body: `
Chapter 2 complete.

Next: The Plan
(Your choices are already shaping what kind of hero you become.)
`
},// ==============================
// CHAPTER 3 — THE PLAN
// ==============================

{ type: "label", id: "ch3_start" },
{ type: "bg", value: "base" },
{ type: "music", value: "" },

{ type: "narr", text: `
CHAPTER 3 — THE PLAN
`},

{ type: "narr", text: `
The fighting doesn’t stop after the battle.
It just moves indoors.
`},

{ type: "narr", text: `
Your team regroups in a makeshift base on the outskirts of the city.
Concrete walls.
Flickering lights.
The smell of coolant and burned metal.
`},

{ type: "narr", text: `
Everyone looks exhausted.
Not just physically.

Spiritually.
`},

{ type: "speaker", name: "Rufki", text: `
“We can’t keep fighting like this.”
`},

{ type: "speaker", name: "Rufki", text: `
“We’ll run out of pilots before they run out of Betas.”
`},

{ type: "speaker", name: "Muhammad", text: `
“We’ve tried everything we can think of.”
`},

{ type: "speaker", name: "Muhammad", text: `
“They adapt faster than we can react.”
`},

{ type: "narr", text: `
Alban leans against the wall, arms crossed.
Armor dents still visible across his mech feed.
`},

{ type: "speaker", name: "Alban", text: `
“We need their weakness.”
`},

{ type: "speaker", name: "Alban", text: `
“Something that actually puts them down.”
`},

{ type: "narr", text: `
The room falls silent.
Because no one has an answer.
`},

{ type: "narr", text: `
Then Niko speaks.
Quiet.
Careful.
`},

{ type: "speaker", name: "Niko", text: `
“I might have something.”
`},

{ type: "narr", text: `
Every eye turns toward him.
`},

{ type: "speaker", name: "Niko", text: `
“I’ve been watching how they move.”
`},

{ type: "speaker", name: "Niko", text: `
“They’re not just reacting to us.”
`},

{ type: "speaker", name: "Niko", text: `
“They’re synchronizing.”
`},

{ type: "narr", text: `
He brings up a holographic projection.
Beta movement paths overlap—interlock—repeat.
`},

{ type: "speaker", name: "Niko", text: `
“They share a signal.”
`},

{ type: "speaker", name: "Niko", text: `
“And if that signal can be disrupted…”
`},

{ type: "narr", text: `
The implication hangs in the air.
`},

{ type: "speaker", name: "Rufki", text: `
“…They fall apart.”
`},

{ type: "speaker", name: "Niko", text: `
“Or they turn on each other.”
`},

{ type: "speaker", name: "Niko", text: `
“I don’t know which.”
`},

{ type: "narr", text: `
Muhammad exhales slowly.
`},

{ type: "speaker", name: "Muhammad", text: `
“What’s the catch?”
`},

{ type: "speaker", name: "Niko", text: `
“The signal runs hot.”
`},

{ type: "speaker", name: "Niko", text: `
“If I overload it, it could burn me out.”
`},

{ type: "speaker", name: "Niko", text: `
“Or worse.”
`},

{ type: "narr", text: `
The room tightens.
`},

{ type: "choice",
  prompt: "Niko is offering a dangerous plan. How do you respond?",
  options: [
    {
      text: "Approve it. Risk is the price of survival.",
      effect: () => { State.vars.resolve += 2; State.vars.fear += 1; },
      goto: "ch3_approve"
    },
    {
      text: "Demand more data before anyone risks their life.",
      effect: () => { State.vars.truth += 2; },
      goto: "ch3_analyze"
    },
    {
      text: "Refuse. There has to be another way.",
      effect: () => { State.vars.mercy += 2; State.vars.hope += 1; },
      goto: "ch3_refuse"
    }
  ]
},

{ type: "label", id: "ch3_approve" },
{ type: "narr", text: `
You nod.
Slowly.
`},

{ type: "speaker", name: "Rufki", text: `
“We don’t win wars by playing it safe.”
`},

{ type: "speaker", name: "Rufki", text: `
“If this works, we save thousands.”
`},

{ type: "narr", text: `
Niko meets your eyes.
No fear.
Just acceptance.
`},

{ type: "goto", id: "ch3_common" },

{ type: "label", id: "ch3_analyze" },
{ type: "narr", text: `
You raise a hand.
`},

{ type: "speaker", name: "Rufki", text: `
“Not yet.”
`},

{ type: "speaker", name: "Rufki", text: `
“We break down the signal first.”
`},

{ type: "narr", text: `
Niko nods, relieved.
Alban looks frustrated.
`},

{ type: "narr", text: `
Time bought.
But time costs lives too.
`},

{ type: "goto", id: "ch3_common" },

{ type: "label", id: "ch3_refuse" },
{ type: "narr", text: `
You shake your head.
`},

{ type: "speaker", name: "Rufki", text: `
“I won’t trade one of us for a theory.”
`},

{ type: "narr", text: `
Niko exhales.
Muhammad looks relieved.
Alban looks away.
`},

{ type: "narr", text: `
Hope preserved.
But pressure builds.
`},

{ type: "goto", id: "ch3_common" },

{ type: "label", id: "ch3_common" },
{ type: "narr", text: `
Plans form.
Simulations run.
Arguments flare and fade.
`},

{ type: "narr", text: `
Hours pass.
Then alarms sound.
`},

{ type: "bg", value: "radar" },

{ type: "narr", text: `
Multiple Beta clusters detected.
All converging.
`},

{ type: "speaker", name: "Muhammad", text: `
“They’re not spreading out.”
`},

{ type: "speaker", name: "Muhammad", text: `
“They’re gathering.”
`},

{ type: "narr", text: `
Niko looks at the signal readout.
His face goes pale.
`},

{ type: "speaker", name: "Niko", text: `
“They felt us watching.”
`},

{ type: "speaker", name: "Niko", text: `
“They’re reinforcing the network.”
`},

{ type: "narr", text: `
Whatever decision you made…
`},

{ type: "narr", text: `
There won’t be time to rethink it.
`},

{ type: "speaker", name: "Rufki", text: `
“Everyone to your mechs.”
`},

{ type: "speaker", name: "Rufki", text: `
“We either break them here…”
`},

{ type: "speaker", name: "Rufki", text: `
“…or we lose the city.”
`},

{ type: "end",
  title: "End of Chapter 3",
  body: `
Chapter 3 complete.

Next: Execution
(The path forward is now locked.)
`
},// ==============================
// CHAPTER 4 — EXECUTION
// ==============================

{ type: "label", id: "ch4_start" },
{ type: "bg", value: "hangar" },
{ type: "music", value: "" },

{ type: "narr", text: `
CHAPTER 4 — EXECUTION
`},

{ type: "narr", text: `
The hangar smells like oil, ozone, and fear.
`},

{ type: "narr", text: `
Technicians move fast.
Too fast.
`},

{ type: "narr", text: `
No jokes.
No music.
Just hands tightening bolts and eyes refusing to meet.
`},

{ type: "narr", text: `
Everyone here knows what this is.
`},

{ type: "narr", text: `
Not a mission.
`},

{ type: "narr", text: `
A gamble.
`},

{ type: "speaker", name: "Muhammad", text: `
“Signal clusters are converging exactly where Niko predicted.”
`},

{ type: "speaker", name: "Muhammad", text: `
“If this fails… they’ll overrun the inner districts in under twenty minutes.”
`},

{ type: "narr", text: `
Alban flexes his hands.
Metal creaks through the feed.
`},

{ type: "speaker", name: "Alban", text: `
“Then we don’t let it fail.”
`},

{ type: "narr", text: `
Niko stands apart from the others.
Silent.
Focused.
`},

{ type: "narr", text: `
The signal interface floats beside him—complex, unstable, alive.
`},

{ type: "speaker", name: "Rufki", text: `
“Talk to me.”
`},

{ type: "speaker", name: "Niko", text: `
“If I push the signal hard enough…”
`},

{ type: "speaker", name: "Niko", text: `
“…their coordination collapses.”
`},

{ type: "speaker", name: "Niko", text: `
“But my nervous system becomes part of the circuit.”
`},

{ type: "narr", text: `
The words hang heavy.
`},

{ type: "speaker", name: "Rufki", text: `
“And if it overloads?”
`},

{ type: "speaker", name: "Niko", text: `
“Then I don’t unplug.”
`},

{ type: "narr", text: `
No one speaks.
`},

{ type: "choice",
  prompt: "Before launch, Niko looks to you for final authorization. What do you say?",
  options: [
    {
      text: "“I trust you. Do what you have to do.”",
      effect: () => { State.vars.resolve += 2; State.vars.fear += 1; State.vars.flags.niko_authorized = true; },
      goto: "ch4_launch"
    },
    {
      text: "“We pull you out the second it destabilizes.”",
      effect: () => { State.vars.mercy += 2; State.vars.hope += 1; State.vars.flags.niko_safeguard = true; },
      goto: "ch4_launch"
    },
    {
      text: "“We monitor everything. No blind risks.”",
      effect: () => { State.vars.truth += 2; State.vars.flags.niko_monitored = true; },
      goto: "ch4_launch"
    }
  ]
},

{ type: "label", id: "ch4_launch" },
{ type: "bg", value: "launch" },

{ type: "narr", text: `
Engines roar.
`},

{ type: "narr", text: `
The hangar doors peel open.
`},

{ type: "narr", text: `
Your mech lifts, systems syncing automatically under your control.
`},

{ type: "narr", text: `
You feel it—that strange pull—
as if your machine is listening to you instead of responding.
`},

{ type: "speaker", name: "Rufki", text: `
“All units—sync on me.”
`},

{ type: "narr", text: `
The battlefield blooms into view.
`},

{ type: "bg", value: "battlefield" },

{ type: "narr", text: `
Betas flood the streets below.
Not scattered.
Not panicked.
`},

{ type: "narr", text: `
Formations.
Cover.
Advance patterns.
`},

{ type: "narr", text: `
An army.
`},

{ type: "speaker", name: "Muhammad", text: `
“They’ve adjusted since last time.”
`},

{ type: "speaker", name: "Alban", text: `
“Good.”
`},

{ type: "speaker", name: "Alban", text: `
“I was hoping they would.”
`},

{ type: "narr", text: `
The first clash is violent.
`},

{ type: "narr", text: `
Metal on armor.
Energy tearing through air.
Telekinetic force ripping the ground apart.
`},

{ type: "narr", text: `
But this time…
`},

{ type: "narr", text: `
You’re watching the signal.
`},

{ type: "narr", text: `
Lines of light threading between Betas.
`},

{ type: "narr", text: `
A living network.
`},

{ type: "speaker", name: "Niko", text: `
“I’m in.”
`},

{ type: "bg", value: "signal" },

{ type: "narr", text: `
The signal spikes.
`},

{ type: "narr", text: `
Your HUD flickers.
Static crawls across every channel.
`},

{ type: "narr", text: `
Betas hesitate.
Just for a second.
`},

{ type: "speaker", name: "Muhammad", text: `
“They’re stalling!”
`},

{ type: "speaker", name: "Alban", text: `
“Press it!”
`},

{ type: "choice",
  prompt: "The signal is destabilizing the Betas—but Niko’s vitals are spiking.",
  options: [
    {
      text: "Push the attack. End it fast.",
      effect: () => { State.vars.resolve += 2; State.vars.fear += 1; },
      goto: "ch4_push"
    },
    {
      text: "Pull pressure and stabilize Niko.",
      effect: () => { State.vars.mercy += 2; State.vars.hope += 1; },
      goto: "ch4_stabilize"
    },
    {
      text: "Split focus—half offense, half signal analysis.",
      effect: () => { State.vars.truth += 2; },
      goto: "ch4_balance"
    }
  ]
},

{ type: "label", id: "ch4_push" },
{ type: "narr", text: `
You drive the team forward.
`},

{ type: "narr", text: `
Betas collapse into each other.
Coordination fractures.
`},

{ type: "narr", text: `
Niko’s voice tightens.
`},

{ type: "speaker", name: "Niko", text: `
“I can… hold it…”
`},

{ type: "goto", id: "ch4_common" },

{ type: "label", id: "ch4_stabilize" },
{ type: "narr", text: `
You pull back.
Create breathing room.
`},

{ type: "narr", text: `
The Betas recover slightly—but Niko’s vitals steady.
`},

{ type: "speaker", name: "Niko", text: `
“…Thanks.”
`},

{ type: "goto", id: "ch4_common" },

{ type: "label", id: "ch4_balance" },
{ type: "narr", text: `
You split control.
`},

{ type: "narr", text: `
Systems strain under the load.
`},

{ type: "narr", text: `
You learn more—but everything slows.
`},

{ type: "goto", id: "ch4_common" },

{ type: "label", id: "ch4_common" },
{ type: "narr", text: `
Then it happens.
`},

{ type: "narr", text: `
A new frequency cuts through the signal.
`},

{ type: "narr", text: `
Not Beta.
Not human.
`},

{ type: "bg", value: "unknown" },

{ type: "narr", text: `
Something else is listening.
`},

{ type: "speaker", name: "Rufki", text: `
“…That’s not them.”
`},

{ type: "speaker", name: "Muhammad", text: `
“Rufki—something just piggybacked on the signal.”
`},

{ type: "speaker", name: "Niko", text: `
“…Oh no.”
`},

{ type: "narr", text: `
The Betas freeze.
Every single one.
`},

{ type: "narr", text: `
Then they all turn their heads.
At once.
`},

{ type: "narr", text: `
Not toward you.
`},

{ type: "narr", text: `
Toward the sky.
`},

{ type: "narr", text: `
You feel it in your bones.
`},

{ type: "narr", text: `
This was never just a weapon.
`},

{ type: "narr", text: `
It was a door.
`},

{ type: "end",
  title: "End of Chapter 4",
  body: `
Chapter 4 complete.

Next: Aftermath
(You have been noticed.)
`
},// ==============================
// CHAPTER 5 — AFTERMATH
// ==============================

{ type: "label", id: "ch5_start" },
{ type: "bg", value: "ruins" },
{ type: "music", value: "" },

{ type: "narr", text: `
CHAPTER 5 — AFTERMATH
`},

{ type: "narr", text: `
The city doesn’t celebrate victory.
`},

{ type: "narr", text: `
It exhales.
`},

{ type: "narr", text: `
Fires burn where buildings once stood.
Sirens cry without urgency—just habit.
Smoke drifts upward like the world is trying to leave itself.
`},

{ type: "narr", text: `
The Betas are gone.
Not destroyed.
Withdrawn.
`},

{ type: "narr", text: `
That’s worse.
`},

{ type: "speaker", name: "Muhammad", text: `
“All hostile signatures have vanished.”
`},

{ type: "speaker", name: "Muhammad", text: `
“No pursuit vectors. No retreat path.”
`},

{ type: "speaker", name: "Alban", text: `
“They didn’t run.”
`},

{ type: "speaker", name: "Alban", text: `
“They were recalled.”
`},

{ type: "narr", text: `
Your mech powers down.
The silence afterward is almost painful.
`},

{ type: "narr", text: `
You climb out into the wreckage.
Boots crunch over glass and twisted metal.
`},

{ type: "narr", text: `
People are emerging from hiding.
Slow.
Careful.
Like animals after a fire.
`},

{ type: "narr", text: `
Some look at you with awe.
Others with fear.
A few with anger.
`},

{ type: "speaker", name: "Civilian", text: `
“Is it over?”
`},

{ type: "narr", text: `
You don’t answer.
Because you don’t know.
`},

{ type: "narr", text: `
Behind you, Niko collapses to one knee.
`},

{ type: "speaker", name: "Rufki", text: `
“Niko!”
`},

{ type: "narr", text: `
You catch him before he hits the ground.
His skin is cold.
His eyes unfocused.
`},

{ type: "speaker", name: "Niko", text: `
“I can still… hear it.”
`},

{ type: "speaker", name: "Rufki", text: `
“The signal?”
`},

{ type: "speaker", name: "Niko", text: `
“…Everything.”
`},

{ type: "narr", text: `
Muhammad scans him.
Readings spike and fall like a dying waveform.
`},

{ type: "speaker", name: "Muhammad", text: `
“Neural overload.”
`},

{ type: "speaker", name: "Muhammad", text: `
“He didn’t just connect.”
`},

{ type: "speaker", name: "Muhammad", text: `
“He left a piece of himself in there.”
`},

{ type: "narr", text: `
Niko looks at you.
Really looks.
`},

{ type: "speaker", name: "Niko", text: `
“Did it work?”
`},

{ type: "choice",
  prompt: "How do you answer him?",
  options: [
    {
      text: "“Yes. You saved the city.”",
      effect: () => { State.vars.hope += 2; State.vars.mercy += 1; },
      goto: "ch5_truth_soft"
    },
    {
      text: "“It worked… but they noticed us.”",
      effect: () => { State.vars.truth += 2; },
      goto: "ch5_truth_hard"
    },
    {
      text: "Say nothing. Just nod.",
      effect: () => { State.vars.resolve += 1; State.vars.fear += 1; },
      goto: "ch5_truth_silent"
    }
  ]
},

{ type: "label", id: "ch5_truth_soft" },
{ type: "narr", text: `
Niko exhales.
A faint smile breaks through the pain.
`},
{ type: "goto", id: "ch5_base_return" },

{ type: "label", id: "ch5_truth_hard" },
{ type: "narr", text: `
Niko closes his eyes.
`},
{ type: "speaker", name: "Niko", text: `
“…Figures.”
`},
{ type: "goto", id: "ch5_base_return" },

{ type: "label", id: "ch5_truth_silent" },
{ type: "narr", text: `
Niko studies your face.
He understands anyway.
`},
{ type: "goto", id: "ch5_base_return" },

{ type: "label", id: "ch5_base_return" },
{ type: "bg", value: "base" },

{ type: "narr", text: `
Night falls by the time you return to base.
`},

{ type: "narr", text: `
The victory report plays on repeat.
“Successful defense.”
“Minimal losses.”
“Human resilience.”
`},

{ type: "narr", text: `
You turn it off.
`},

{ type: "narr", text: `
The numbers don’t show the screams.
Or the hesitation before pulling a trigger.
Or the look in Niko’s eyes when the signal spoke back.
`},

{ type: "narr", text: `
Later, alone, you review the captured data.
`},

{ type: "narr", text: `
The signal wasn’t just coordination.
`},

{ type: "narr", text: `
It was observation.
`},

{ type: "narr", text: `
The Betas weren’t learning tactics.
`},

{ type: "narr", text: `
They were studying intent.
`},

{ type: "narr", text: `
What humanity values.
Who hesitates.
Who sacrifices.
`},

{ type: "narr", text: `
And one pattern appears again and again.
`},

{ type: "narr", text: `
You.
`},

{ type: "choice",
  prompt: "This data is dangerous. What do you do with it?",
  options: [
    {
      text: "Share it with the team immediately.",
      effect: () => { State.vars.truth += 2; State.vars.hope += 1; },
      goto: "ch5_share"
    },
    {
      text: "Keep it to yourself—for now.",
      effect: () => { State.vars.resolve += 2; State.vars.fear += 1; },
      goto: "ch5_hide"
    },
    {
      text: "Erase the most disturbing parts.",
      effect: () => { State.vars.mercy += 2; },
      goto: "ch5_erase"
    }
  ]
},

{ type: "label", id: "ch5_share" },
{ type: "narr", text: `
The room grows quiet as they read.
No one speaks.
But everyone understands the weight just increased.
`},
{ type: "goto", id: "ch5_end" },

{ type: "label", id: "ch5_hide" },
{ type: "narr", text: `
You lock the file behind multiple encryptions.
If the burden exists—
you’ll carry it.
`},
{ type: "goto", id: "ch5_end" },

{ type: "label", id: "ch5_erase" },
{ type: "narr", text: `
You hesitate…
Then delete.
`},

{ type: "narr", text: `
Some knowledge saves lives.
Some only tells you how they’ll be lost.
`},
{ type: "goto", id: "ch5_end" },

{ type: "label", id: "ch5_end" },
{ type: "narr", text: `
That night, sleep doesn’t come easy.
`},

{ type: "narr", text: `
And when it does—
`},

{ type: "narr", text: `
You dream of a small figure alone in the ruins.
`},

{ type: "narr", text: `
Crying.
`},

{ type: "narr", text: `
Waiting.
`},

{ type: "narr", text: `
Someone you haven’t met yet.
`},

{ type: "narr", text: `
But already feel responsible for.
`},

{ type: "end",
  title: "End of Chapter 5",
  body: `
Chapter 5 complete.

Next: The Girl in the Alley
(The cost of survival becomes personal.)
`
},