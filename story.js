Whats this ?  /* ============================================================
   WORLD END(S) — story.js
   Works with engine.js that reads: window.Story (array of nodes)
   Node types used:
     - label: { type:"label", id:"some_id" }
     - narr:  { type:"narr", text:`...` }
     - say:   { type:"say", who:"Name", text:`...` }
     - choice:{ type:"choice", prompt:"...", options:[{text, effect, goto}, ...] }
     - goto:  { type:"goto", id:"label_id" }
     - set:   { type:"set", key:"varName", value:0 }   (optional)
     - add:   { type:"add", key:"varName", value:1 }   (optional)
     - if:    { type:"if", cond:(S)=>boolean, then:"label", else:"label" } (optional)
   Stats tracked (for endings later):
     truth, resolve, mercy, hope, fear
   ============================================================ */

(() => {
  // Ensure stats exist even if engine doesn't pre-create them
  window.State = window.State || {};
  State.vars = State.vars || {};
  State.vars.truth ??= 0;
  State.vars.resolve ??= 0;
  State.vars.mercy ??= 0;
  State.vars.hope ??= 0;
  State.vars.fear ??= 0;

  const add = (k, v) => () => { State.vars[k] = (State.vars[k] ?? 0) + v; };
  const setv = (k, v) => () => { State.vars[k] = v; };

  // ============================================================
  // STORY ARRAY
  // ============================================================
  window.Story = [
    // -------------------------
    // MAIN MENU HANDOFF POINT
    // (engine.js can goto "start" when pressing Start)
    // -------------------------
    { type: "label", id: "start" },

    { type: "bg", value: "gradient" },
    { type: "music", value: "" },

    { type: "narr", text: `
WORLD END(S)

Tap the screen to advance.
Choices shape your endings.

(If you're seeing this, story.js is loading correctly.)
`},

    // Player’s very first meaningful choice (sets tone)
    {
      type: "choice",
      prompt: "Before the sky breaks… what kind of person are you when something feels wrong?",
      options: [
        {
          text: "I document everything. Truth matters.",
          effect: add("truth", 1),
          goto: "ch1_open_record"
        },
        {
          text: "I move first. People need action, not theories.",
          effect: add("resolve", 1),
          goto: "ch1_open_move"
        },
        {
          text: "I look for who might be hurt. Protect them first.",
          effect: add("mercy", 1),
          goto: "ch1_open_protect"
        },
        {
          text: "I try to keep people calm. If we lose hope, we lose everything.",
          effect: add("hope", 1),
          goto: "ch1_open_hope"
        }
      ]
    },

    // ============================================================
    // CHAPTER 1 — THE DAY THE SKY BURNED (LONG)
    // ============================================================
    { type: "label", id: "ch1_open_record" },
    { type: "label", id: "ch1_open_move" },
    { type: "label", id: "ch1_open_protect" },
    { type: "label", id: "ch1_open_hope" },

    { type: "bg", value: "impact" },

    { type: "narr", text: `
CHAPTER 1 — THE DAY THE SKY BURNED

The meteor didn’t arrive like a warning.

It arrived like a verdict.

A blade of fire carved the night open—bright enough to bleach the city’s color, loud enough to rattle glass in its frames. People poured onto balconies, rooftops, sidewalks. Phones rose like candles.

For one breath, the world felt united.

Then the air changed.

Heat rolled in waves. The light didn’t fade the way shooting stars fade.

It *stayed*.
It *descended*.

And deep in your chest—where instinct lives—you felt it:

This isn’t natural.
This isn’t ours.
`},

    { type: "narr", text: `
Sirens began late, like the city itself needed a second to believe what it was seeing.

A streak slammed into the outskirts—far enough that the skyline still stood, close enough that the shock traveled through the ground like a second heartbeat.

Windows shivered.

People screamed.

Then… silence.

That’s what scared you most.

Because silence means the world is holding its breath.
`},

    {
      type: "choice",
      prompt: "The impact site is on the edge of the city. News feeds are chaos. What do you do *first*?",
      options: [
        {
          text: "Run toward the impact. If there are survivors, they need help now.",
          effect: add("resolve", 1),
          goto: "ch1_choice_run"
        },
        {
          text: "Call it in, coordinate, and gather info before moving.",
          effect: add("truth", 1),
          goto: "ch1_choice_coord"
        },
        {
          text: "Help people nearby—kids, elderly, anyone panicking.",
          effect: add("mercy", 1),
          goto: "ch1_choice_help"
        },
        {
          text: "Find high ground and watch. Something about this feels like a trap.",
          effect: add("fear", 1),
          goto: "ch1_choice_watch"
        }
      ]
    },

    { type: "label", id: "ch1_choice_run" },
    { type: "narr", text: `
You move.

Not because you’re fearless—because fear wastes time.

You weave through streets choked with people and headlights. The closer you get, the more the air tastes like metal and burnt rain. Ash falls like gray snow.

Somewhere ahead, something *hums*—low, deep, wrong—like a giant engine sleeping under the earth.
`},
    { type: "goto", id: "ch1_meet_team" },

    { type: "label", id: "ch1_choice_coord" },
    { type: "narr", text: `
You breathe. You force your hands steady.

You pull every feed you can—police chatter, emergency dispatch, amateur livestreams. People keep calling it a meteor, but the footage tells a different story:

The “rock” changed direction.

Midair.

Like it was steering.

You mark routes. You flag hazards. You send coordinates and warnings—because if this is *intelligent*, rushing in blind is how heroes die for nothing.
`},
    { type: "goto", id: "ch1_meet_team" },

    { type: "label", id: "ch1_choice_help" },
    { type: "narr", text: `
You stop where others stampede.

A child’s crying cuts through the sirens. Someone’s grandmother sits on a curb, shaking, clutching a purse like it’s a lifeline. You kneel, you speak, you guide, you get them moving.

It’s not glamorous.

But later—when history tries to decide what mattered most—someone will still be alive because you chose them over adrenaline.
`},
    { type: "goto", id: "ch1_meet_team" },

    { type: "label", id: "ch1_choice_watch" },
    { type: "narr", text: `
You climb. You watch.

From high ground, you see the impact zone smoking like an open wound. Rescue vehicles slow at the perimeter—then stop completely, as if an invisible line has been drawn.

And then you see it:

A shape in the crater.
Not rock.
Not debris.

*Hull.*

Something landed here on purpose.

Your stomach turns.

Because you understand the oldest rule:
If something crosses the stars to reach you, it didn’t come just to say hello.
`},
    { type: "goto", id: "ch1_meet_team" },

    // --- meet the core cast, first “game” feeling scene
    { type: "label", id: "ch1_meet_team" },

    { type: "narr", text: `
By the time you reach the perimeter, the air is thick with static.

Floodlights paint the smoke. Soldiers shout. Engineers argue. Cameras hover like vultures.

Then the ground trembles again—not from aftershock.

From *movement*.

A section of the crater wall peels open like a wound splitting wider.

And something climbs out.
`},

    { type: "narr", text: `
They are insect-like, but not like anything nature makes on Earth.

Their bodies are plated, segmented, too efficient. Their limbs fold and unfold with mechanical precision. Their eyes reflect light like dead gems.

Someone whispers, “Aliens…”

Someone else laughs—high, hysterical—because the human brain sometimes tries to turn terror into a joke.

The creatures don’t laugh.

They *listen*.

Then they lunge.
`},

    { type: "narr", text: `
The first attack is fast.

A beta crosses twenty feet like it’s nothing. Claws tear into armor. Another spits something that hisses on contact—acid or something worse.

Screams erupt.

The perimeter collapses in seconds.

And in the chaos, you hear a voice in your comms—steady, commanding, *furious*:
“Form up! Protect civilians first! If you can’t fight, move people away from the line!”
`},

    { type: "say", who: "Rufki", text: `This is Rufki. If you can hear me, get behind cover. Do NOT engage alone.` },

    { type: "narr", text: `
Rufki.

The name spreads fast—because people cling to names when they need a symbol.

You spot him near a transport rig—young, battle-worn, eyes locked like he’s already accepted that today might be his last.

Around him: machines.

Not tanks. Not drones.

Mechs.

Metal giants with human hearts inside.
`},

    { type: "narr", text: `
Three others move with him like they’ve been forged together:

Muhammad — calm, focused. He lifts a wrecked barrier with a gesture like the world is weightless, slamming it down between civilians and claws. Telekinesis, controlled like a blade.

Niko — lightning in a human body. He flicks his hand and energy blooms—clean, bright, surgical—dropping a beta mid-leap. He doesn’t waste motion. He doesn’t waste breath.

Alban — a wall. When a beta charges, Alban meets it head-on. The creature hits him like a truck—and bounces. Strength and durability beyond normal, like the universe forgot to give him a limit.
`},

    { type: "say", who: "Muhammad", text: `Rufki—more incoming. Left flank.` },
    { type: "say", who: "Niko", text: `I see them. Five… no, seven.` },
    { type: "say", who: "Alban", text: `Good.` },

    { type: "narr", text: `
Rufki raises a hand—fingers spread like he’s conducting an orchestra.

Your stomach tightens as the mechs respond.

Not one mech.

Multiple.

They move smoother, faster, *together*—as if a single mind threads through them.

Rufki’s gift isn’t brute force.

It’s command.

Enhance. Synchronize. Push beyond safe limits—then pull back before the machine tears itself apart.
`},

    {
      type: "choice",
      prompt: "A beta breaks through toward a family trapped behind a crushed car. Your move?",
      options: [
        {
          text: "Rush the beta and distract it—pull it away, even if it targets you.",
          effect: add("resolve", 1),
          goto: "ch1_save_family_resolve"
        },
        {
          text: "Shout directions and help the family crawl out while staying in cover.",
          effect: add("mercy", 1),
          goto: "ch1_save_family_mercy"
        },
        {
          text: "Watch its pattern—then call out a precise opening to Rufki’s team.",
          effect: add("truth", 1),
          goto: "ch1_save_family_truth"
        },
        {
          text: "Freeze for a second—then move, because fear is real but not in charge.",
          effect: add("hope", 1),
          goto: "ch1_save_family_hope"
        }
      ]
    },

    { type: "label", id: "ch1_save_family_resolve" },
    { type: "narr", text: `
You go in.

The beta turns—eyes catching you like a spotlight. You throw something—metal, stone, anything. It hisses and charges.

For a heartbeat, you think: *this was stupid.*

Then a mech foot slams down between you and the creature, cracking asphalt like glass.

Rufki’s voice snaps through comms: “Good bait. Move the civilians—NOW!”
`},
    { type: "goto", id: "ch1_after_save" },

    { type: "label", id: "ch1_save_family_mercy" },
    { type: "narr", text: `
You don’t chase glory. You chase survival.

You point. You direct. You pull the smallest kid first, then the parent, then the last one—hands trembling, breath ragged.

The beta lunges—

And Muhammad yanks it sideways with invisible force, smashing it into a wall hard enough to crater concrete.

He looks at you once—an unspoken nod.

You did your part.
`},
    { type: "goto", id: "ch1_after_save" },

    { type: "label", id: "ch1_save_family_truth" },
    { type: "narr", text: `
You study it.

The beta’s forelimb twitches before it pounces. It always overcommits with the right claw first.

You shout: “Right claw leads—dodge left!”

Niko hears you. Moves like he already knew. Energy flashes. The beta drops mid-strike.

Rufki’s voice, sharp with approval: “Keep calling patterns. That helps more than you think.”
`},
    { type: "goto", id: "ch1_after_save" },

    { type: "label", id: "ch1_save_family_hope" },
    { type: "narr", text: `
Fear hits you like a wave.

Then you push through it.

You raise your voice—not in panic, but in command—like you’re lending your calm to everyone who’s drowning.

“MOVE! This way! Don’t stop—keep going!”

The family stumbles free at the last second. Alban slams into the beta like a wrecking ball and keeps it away from them.

You realize something:

Hope isn’t a feeling.

It’s a decision.
`},
    { type: "goto", id: "ch1_after_save" },

    { type: "label", id: "ch1_after_save" },
    { type: "narr", text: `
The perimeter becomes a battlefield.

Smoke. Screams. Metal.

But Rufki’s team holds a line that shouldn’t be holdable.

They carve space for evacuation.
They buy minutes the world will never repay.

And just when it seems like the betas might retreat—

A larger one rises from the crater.

Its plates are thicker. Its movements… smarter.

It doesn’t rush.

It *points*.

As if giving orders.

The smaller betas respond instantly.

That’s when you understand the second rule:

They’re not just monsters.

They’re organized.
`},

    { type: "say", who: "Rufki", text: `That one’s a commander. If it controls the swarm, we take it down.` },
    { type: "say", who: "Muhammad", text: `If I pin it, can you strike?` },
    { type: "say", who: "Niko", text: `I’ll burn a path.` },
    { type: "say", who: "Alban", text: `I’ll break it.` },

    { type: "narr", text: `
Rufki lifts his hand again—mechs synchronize tighter than before. You can almost *see* the invisible thread connecting them, pulling them into one perfect formation.

This is where heroes are born:

Not in safety.
Not in speeches.

In the moment you choose to stand when running would be easier.
`},

    {
      type: "choice",
      prompt: "Rufki glances your way. You’re not in a mech. You’re still here. He shouts: “You—can you help?”",
      options: [
        {
          text: "“Tell me where.” Step into danger without hesitation.",
          effect: add("resolve", 1),
          goto: "ch1_help_where"
        },
        {
          text: "“Give me a job that saves civilians.” You prioritize lives over kills.",
          effect: add("mercy", 1),
          goto: "ch1_help_civ"
        },
        {
          text: "“I can call patterns and weaknesses.” You act as their eyes.",
          effect: add("truth", 1),
          goto: "ch1_help_call"
        },
        {
          text: "“We can win this.” You throw belief into the air like fuel.",
          effect: add("hope", 1),
          goto: "ch1_help_hope"
        }
      ]
    },

    { type: "label", id: "ch1_help_where" },
    { type: "narr", text: `
You point yourself like a weapon.

Rufki snaps coordinates. You sprint, dragging a crate of emergency flares into position—creating a bright marker the mechs can see through smoke.

“Target marked!” you shout.

Muhammad pins the commander.
Niko blasts open the armor seam.
Alban drives through with a brutal strike.

The commander collapses.

The swarm hesitates.

For the first time tonight—

They look unsure.
`},
    { type: "goto", id: "ch1_end" },

    { type: "label", id: "ch1_help_civ" },
    { type: "narr", text: `
You don’t chase the commander.

You chase the people it would kill.

You guide a wave of civilians through a gap—hands pushing strollers, shoulders carrying the injured, voices cracking but moving.

Behind you, the team fights like a storm.

Ahead of you, life continues by inches.

When you finally look back, the commander is down.

And the street is… quieter.

Not safe.

But quieter.
`},
    { type: "goto", id: "ch1_end" },

    { type: "label", id: "ch1_help_call" },
    { type: "narr", text: `
You watch the commander’s armor.

You notice a rhythm—plates flexing when it issues signals. A soft seam near the neck that opens for a heartbeat.

“Neck seam opens when it signals!” you yell.

Rufki’s mechs adjust instantly. Muhammad forces it to signal—then Niko threads an energy blade through the opening.

Alban finishes it.

The commander drops like a tower losing its foundation.

The swarm stutters—confused, angry, suddenly less controlled.
`},
    { type: "goto", id: "ch1_end" },

    { type: "label", id: "ch1_help_hope" },
    { type: "narr", text: `
You raise your voice like it can become armor.

“We’re still here! We’re still fighting! Keep moving—don’t stop!”

You see it in people’s eyes—fear turning into motion, despair turning into direction.

Rufki’s team strikes the commander in a coordinated burst that looks almost unreal—like a cutscene the world doesn’t deserve.

The commander falls.

And even though the night is still burning—

Somewhere inside the crowd, something fragile survives:

Belief.
`},
    { type: "goto", id: "ch1_end" },

    { type: "label", id: "ch1_end" },
    { type: "narr", text: `
By dawn, the city is changed.

The crater still smokes.
The skyline still stands.

But the world is no longer innocent.

The footage goes global.
Governments make promises.
Scientists argue about origin, intent, biology.

And one name begins to feel inevitable:

Betas.

Not because they’re simple.

Because humanity has always tried to rename horror into something manageable.

Rufki and his team don’t celebrate.

They don’t have time.

Because the betas weren’t an accident.

They were an arrival.

And the first day the sky burned…

was only the opening chapter.
`},

    // Chapter 1 complete -> go to chapter 2 start label
    { type: "goto", id: "ch2_start" },

    // ============================================================
    // CHAPTER 2 — HOLD THE LINE (medium, but solid)
    // (You can paste your longer version later if you want;
    //  this ensures the game isn't blank after Ch1.)
    // ============================================================
    { type: "label", id: "ch2_start" },
    { type: "bg", value: "war" },
    { type: "music", value: "" },

    { type: "narr", text: `
CHAPTER 2 — HOLD THE LINE

The sound of gunfire echoes through streets that used to be loud with music.

Now the only rhythm is: reload, breathe, survive.

Rufki’s team has been fighting for hours. Mechs are scarred, systems running hot, pilots pushing past what bodies are supposed to handle.

And still the betas keep coming.
`},

    { type: "say", who: "Muhammad", text: `We can’t keep this up much longer. They just… keep coming.` },
    { type: "say", who: "Rufki", text: `We hold until reinforcements arrive. If they reach the city center, it’s over.` },
    { type: "say", who: "Alban", text: `Then they don’t reach it.` },
    { type: "say", who: "Niko", text: `Left side is breaking. I’m moving.` },

    { type: "narr", text: `
Rufki tracks three mechs at once—boosting one pilot’s stability, pushing another’s thrusters, rerouting power to keep a shield online that should’ve died minutes ago.

This is what leadership is:
Not a crown.

A burden you carry until your spine is screaming.

Then you carry it anyway.
`},

    {
      type: "choice",
      prompt: "A beta pack targets an evacuation route. Rufki has one decision to make. What do you push for?",
      options: [
        {
          text: "Protect the evacuation route, even if it costs ground elsewhere.",
          effect: add("mercy", 1),
          goto: "ch2_evacuate"
        },
        {
          text: "Take the offensive and break the pack fast—save time, save lives.",
          effect: add("resolve", 1),
          goto: "ch2_offense"
        },
        {
          text: "Analyze the route—find a choke point and turn it into a trap.",
          effect: add("truth", 1),
          goto: "ch2_trap"
        },
        {
          text: "Rally everyone—if morale collapses, the city collapses.",
          effect: add("hope", 1),
          goto: "ch2_rally"
        }
      ]
    },

    { type: "label", id: "ch2_evacuate" },
    { type: "narr", text: `
You choose people over pride.

The team shifts. Shields angle toward the route. Alban becomes a moving wall. Muhammad lifts debris into barricades. Niko clears anything that gets too close.

The convoy survives.

A small victory.

But in war, small victories are what keep you alive long enough to see the big one.
`},
    { type: "goto", id: "ch2_end" },

    { type: "label", id: "ch2_offense" },
    { type: "narr", text: `
You choose speed.

Rufki pushes systems into the red. Niko becomes a streak of light. Alban tears through the pack like a battering ram. Muhammad pins the largest beta long enough for a clean finish.

The pack breaks.

The route holds.

But the cost is heat—overload warnings screaming across cockpit glass.
`},
    { type: "goto", id: "ch2_end" },

    { type: "label", id: "ch2_trap" },
    { type: "narr", text: `
You choose precision.

You funnel the pack into a narrow street between collapsed buildings. Muhammad seals the exit with telekinetic force. Niko hits them with controlled bursts that herd them deeper.

Then Rufki syncs the mechs.

One coordinated strike.

The pack drops like dominoes.

For a moment, the city breathes.
`},
    { type: "goto", id: "ch2_end" },

    { type: "label", id: "ch2_rally" },
    { type: "narr", text: `
You choose spirit.

You speak into the comms—calm, sharp, unwavering.

“Hold. Don’t break. We are the line.”

It’s not magic.

But the team steadies.

And in the second that steadiness creates, they make the moves that keep the evacuation route alive.
`},
    { type: "goto", id: "ch2_end" },

    { type: "label", id: "ch2_end" },
    { type: "narr", text: `
Night falls again.

And still the betas keep coming.

Rufki looks at the burning horizon and understands something the world hasn’t accepted yet:

This isn’t a single invasion.

It’s a campaign.

And if humanity is going to survive…

they’ll need more than machines.

They’ll need a reason.

They’ll need a meaning.

They’ll need heroes.
`},

    // Stop here for now. (You can add chapter 3+ later.)
    // Move from Chapter 2 to Chapter 3
{ type: "goto", id: "ch3_start" },

// ============================================================
// CHAPTER 3 — THE WEAKNESS
// ============================================================
{ type: "label", id: "ch3_start" },
// ============================================================
// CHAPTER 3 — THE WEAKNESS
// ============================================================

{ type: "label", id: "ch3_start" },
{ type: "bg", value: "ship" },
{ type: "music", value: "" },

{ type: "narr", text: `
CHAPTER 3 — THE WEAKNESS

By day three, the city stops pretending this is temporary.

The streets aren’t “evacuated.”
They’re abandoned.

The skyline isn’t “holding strong.”
It’s holding its breath.

And the betas… they aren’t just attacking.

They’re learning.

Every hour, the swarms adjust. They stop charging open lanes. They stop biting armor that can’t be pierced. They begin striking joints, targeting comm arrays, destroying fuel lines—like they’ve read your manuals.

Like they’ve already fought humans before.
`},

{ type: "narr", text: `
Your team regroups in a half-collapsed underground transit station repurposed into a base.

The air smells like oil, sweat, and overheated circuitry.

Mechs stand in silence like injured giants—patchwork repairs, scorch marks, dents in places steel should never bend.

Rufki sits with his elbows on his knees, staring at a tactical map like he’s trying to force the universe to confess.
`},

{ type: "say", who: "Rufki", text: `We’re not losing because they’re stronger. We’re losing because they’re adapting faster than we can.` },

{ type: "say", who: "Muhammad", text: `We’ve held them back… but every time we win a fight, the next one costs more.` },

{ type: "say", who: "Alban", text: `Then we hit harder.` },

{ type: "say", who: "Niko", text: `That’s the problem. “Harder” is predictable.` },

{ type: "narr", text: `
Silence spreads after Niko speaks.

Not awkward silence.

The kind that means he said something true, and nobody wants it to be.

Niko steps forward and throws down a chunk of beta plating on the table. It’s black-gray, layered like armor… but the inside is wrong. Not bone. Not meat.

Something in between.
`},

{ type: "say", who: "Niko", text: `I’ve been studying the remains. Watching their movement. Recording their reactions.` },

{ type: "say", who: "Rufki", text: `And?` },

{ type: "narr", text: `
Niko doesn’t answer right away.

He looks at Muhammad, then Alban.

Then he looks at you.

Like he’s measuring whether you can handle the truth.
`},

{ type: "narr", text: `
He taps the plating. A faint ripple runs across it, like a nerve twitching.

It reacts.

Even after death.
`},

{ type: "say", who: "Niko", text: `They’re not just organisms. They’re… networked.` },

{ type: "narr", text: `
Rufki’s eyes sharpen. Muhammad leans forward. Alban’s jaw tightens.

Niko continues.
`},

{ type: "say", who: "Niko", text: `Every pack has a pattern. Every pack has a “leader.” When the leader dies, the rest hesitate—like the signal drops.` },

{ type: "say", who: "Muhammad", text: `So… it’s a hive?` },

{ type: "say", who: "Niko", text: `Yes. But worse.` },

{ type: "narr", text: `
Niko flips a tablet around. Grainy footage plays—beta movement slowed down frame by frame.

At first it looks random.

Then you see it.

Tiny micro-pauses. Group turns. Synchronized flanks.

The betas aren’t reacting to *each other*.

They’re reacting to a command you can’t hear.
`},

{ type: "say", who: "Niko", text: `They’re receiving something. A frequency. A pulse.` },

{ type: "say", who: "Rufki", text: `From the ship?` },

{ type: "narr", text: `
Niko nods once.

That nod feels like a door closing.
`},

{ type: "say", who: "Niko", text: `From the ship… and possibly from somewhere else.` },

{ type: "narr", text: `
Outside, a distant boom shakes dust from the ceiling.

Not artillery.

Impact.

Something arriving again.

The city’s bones flinch under it.
`},

// -------- Choice: how Rufki leads the strategy ----------
{
  type: "choice",
  prompt: "Rufki looks around the table. The team needs direction. How do you push the strategy?",
  options: [
    {
      text: "We need hard intel. Find the signal source and expose it.",
      effect: () => { State.vars.truth += 1; },
      goto: "ch3_truth_path"
    },
    {
      text: "We save lives first. Pull civilians back and fortify safe corridors.",
      effect: () => { State.vars.mercy += 1; },
      goto: "ch3_mercy_path"
    },
    {
      text: "We strike now. Decapitate the hive before it grows.",
      effect: () => { State.vars.resolve += 1; },
      goto: "ch3_resolve_path"
    },
    {
      text: "If we panic, we die. We need a symbol—hope has to stay alive.",
      effect: () => { State.vars.hope += 1; },
      goto: "ch3_hope_path"
    }
  ]
},

{ type: "label", id: "ch3_truth_path" },
{ type: "narr", text: `
You force the conversation onto one track:

Answers.

Because without answers, every battle is just a delay until extinction.

Rufki nods slowly. He’s not smiling, but something steadies in him.
`},
{ type: "goto", id: "ch3_common" },

{ type: "label", id: "ch3_mercy_path" },
{ type: "narr", text: `
You remind them what the mission always was:

People.

Not victory screenshots. Not headlines.

Lives.

Rufki’s eyes soften for half a second—then harden again.
`},
{ type: "goto", id: "ch3_common" },

{ type: "label", id: "ch3_resolve_path" },
{ type: "narr", text: `
You say what everyone’s thinking but nobody wants to own:

We cannot wait for permission to survive.

Rufki’s voice drops.
`},
{ type: "say", who: "Rufki", text: `Then we cut the head off.` },
{ type: "goto", id: "ch3_common" },

{ type: "label", id: "ch3_hope_path" },
{ type: "narr", text: `
You talk about morale like it’s fuel—because it is.

You’ve seen the difference between a crowd that believes and a crowd that gives up.

Rufki takes a slow breath.
`},
{ type: "say", who: "Rufki", text: `Then we become what they need us to be.` },
{ type: "goto", id: "ch3_common" },

// -------- Common plan reveal ----------
{ type: "label", id: "ch3_common" },

{ type: "narr", text: `
Niko slides a rough map toward Rufki.

A ring around the crater.

Hot zones.

Patrol routes.

And one point circled so many times the paper looks bruised.
`},

{ type: "say", who: "Niko", text: `Every time a commander issues a signal, it creates a spike. The spike always aligns… to that point.` },

{ type: "narr", text: `
Rufki stares at the circled spot.

It’s a substation near the crater—old infrastructure, heavy power, buried lines.

A place people used to ignore.

Now it feels like the center of the world.
`},

{ type: "say", who: "Muhammad", text: `A relay?` },

{ type: "say", who: "Niko", text: `A relay—or a doorway.` },

{ type: "narr", text: `
Alban cracks his knuckles, sound sharp in the underground chamber.
`},

{ type: "say", who: "Alban", text: `Then we break it.` },

{ type: "narr", text: `
Niko shakes his head.

This time, he looks almost… afraid.
`},

{ type: "say", who: "Niko", text: `It’s not that simple.` },

{ type: "narr", text: `
He points to a waveform on his tablet—a repeating pattern, like a heartbeat.

But it’s not human.

And it’s getting louder.
`},

{ type: "say", who: "Niko", text: `I think the signal is tied to their nervous system. If we hit it wrong, they won’t scatter…` },

{ type: "say", who: "Niko", text: `…they’ll frenzy.` },

{ type: "narr", text: `
Rufki leans back, rubbing his temples.

The kind of exhaustion that doesn’t come from fighting.

It comes from realizing the world is bigger than your strength.
`},

{ type: "say", who: "Rufki", text: `So what’s your plan, Niko?` },

{ type: "narr", text: `
Niko hesitates.

Then he says it.

And the air in the room changes.
`},

{ type: "say", who: "Niko", text: `We don’t destroy the relay.` },

{ type: "say", who: "Niko", text: `We hijack it.` },

{ type: "narr", text: `
Muhammad’s eyes widen. Alban blinks like he didn’t hear right. Rufki goes still.
`},

{ type: "say", who: "Muhammad", text: `You want to… speak their language?` },

{ type: "say", who: "Niko", text: `Not speak it. Jam it. Interrupt it.` },

{ type: "narr", text: `
He taps the plating again, harder.

A ripple.

A response.
`},

{ type: "say", who: "Niko", text: `If we can cut the signal for even a minute, their coordination collapses. Commanders lose control. Packs stop moving like one mind.` },

{ type: "say", who: "Alban", text: `And then we kill them.` },

{ type: "say", who: "Niko", text: `And then we survive.` },

{ type: "narr", text: `
Rufki’s fingers tighten on the table.

Because he understands what Niko isn’t saying:

A plan like this isn’t safe.

It’s not tested.

And the moment it fails—

The betas won’t just hunt the city.

They’ll hunt *you*.
`},

// -------- Choice: risk acceptance ----------
{
  type: "choice",
  prompt: "Niko’s plan is risky and untested. Rufki needs consensus. What do you say?",
  options: [
    {
      text: "We do it. No more reacting—this is our chance to take control.",
      effect: () => { State.vars.resolve += 1; },
      goto: "ch3_accept"
    },
    {
      text: "We need proof first. One field test before we bet the city.",
      effect: () => { State.vars.truth += 1; },
      goto: "ch3_test_first"
    },
    {
      text: "If it endangers civilians, we don’t do it. We relocate first.",
      effect: () => { State.vars.mercy += 1; },
      goto: "ch3_relocate"
    },
    {
      text: "We do it—but we make it mean something. We fight like heroes.",
      effect: () => { State.vars.hope += 1; },
      goto: "ch3_hero"
    }
  ]
},

{ type: "label", id: "ch3_accept" },
{ type: "narr", text: `
You don’t hesitate.

Because you’ve seen what hesitation costs.

Rufki nods once, slow and final.
`},
{ type: "goto", id: "ch3_hook" },

{ type: "label", id: "ch3_test_first" },
{ type: "narr", text: `
You insist on proof.

Not because you doubt Niko—because this world punishes blind faith.

Niko nods reluctantly.
`},
{ type: "say", who: "Niko", text: `One test… then we commit.` },
{ type: "goto", id: "ch3_hook" },

{ type: "label", id: "ch3_relocate" },
{ type: "narr", text: `
You draw the line where it matters:

Civilians don’t become collateral.

Rufki exhales through his nose.
`},
{ type: "say", who: "Rufki", text: `Then we clear the corridor first. No one dies because we were impatient.` },
{ type: "goto", id: "ch3_hook" },

{ type: "label", id: "ch3_hero" },
{ type: "narr", text: `
You say the word out loud:

Hero.

Not as a title.

As a promise.

Rufki’s eyes lift. For a moment, he looks younger—like the weight shifts into purpose.
`},
{ type: "say", who: "Rufki", text: `Then we do this the right way.` },
{ type: "goto", id: "ch3_hook" },

// -------- Hook into Chapter 4 ----------
{ type: "label", id: "ch3_hook" },
{ type: "bg", value: "chaos" },

{ type: "narr", text: `
The meeting ends with action.

Engineers rush to assemble a jammer rig out of whatever still works.

Muhammad recalibrates his focus—because telekinesis isn’t just power, it’s precision.

Alban sharpens his blade, not because he needs to, but because it gives his hands something to do besides shake.

Rufki walks through the hangar, looking at the mechs like they’re not machines.

Like they’re coffins you climb into willingly.
`},

{ type: "narr", text: `
And outside… the betas shift.

Not attacking.

Positioning.

Like they can feel something coming.

Like the hive mind is turning its attention toward the one place the humans are finally trying to think like predators.
`},

{ type: "say", who: "Rufki", text: `Tomorrow we stop running.` },

{ type: "narr", text: `
Somewhere beyond the crater, the signal spikes again—sharp enough to make teeth ache.

The lights flicker.

The air tastes like static.

And for the first time, you wonder:

What if the betas aren’t the invasion…

…what if they’re just the scouts?
`},

{ type: "narr", text: `
End of Chapter 3.

Next: CHAPTER 4 — THE JAMMER
`},

{ type: "goto", id: "ch4_start" },
  ];
})();