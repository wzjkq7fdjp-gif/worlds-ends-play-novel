(() => {
  // ============================================================
  // WORLD END(S) — story.js (FULL 26-CH BUILD)
  // Works with engine.js that reads: window.Story (array of nodes)
  //
  // Stats for endings:
  // truth, resolve, mercy, hope, fear
  // ============================================================

  window.State = window.State || {};
  State.vars = State.vars || {};
  State.vars.truth ??= 0;
  State.vars.resolve ??= 0;
  State.vars.mercy ??= 0;
  State.vars.hope ??= 0;
  State.vars.fear ??= 0;

  // Story flags
  State.vars.flags ??= {};
  State.vars.flags.mia_saved ??= false;
  State.vars.flags.mia_adopted ??= false;
  State.vars.flags.alban_saved ??= true;
  State.vars.flags.angel_trust ??= 0;
  State.vars.flags.raul_trust ??= 0;

  const add = (k, v) => () => { State.vars[k] = (State.vars[k] ?? 0) + v; };
  const flag = (k, v) => () => { State.vars.flags[k] = v; };
  const fadd = (k, v) => () => { State.vars.flags[k] = (State.vars.flags[k] ?? 0) + v; };

  const score = () =>
    (State.vars.truth ?? 0) +
    (State.vars.resolve ?? 0) +
    (State.vars.mercy ?? 0) +
    (State.vars.hope ?? 0) -
    (State.vars.fear ?? 0);

  // ============================================================
  // STORY ARRAY
  // ============================================================
  window.Story = [

    // ------------------------------------------------------------
    // START (engine's Start button should goto "start")
    // ------------------------------------------------------------
    { type: "label", id: "start" },
    { type: "bg", value: "gradient" },
    { type: "music", value: "" },

    { type: "narr", text: `
WORLD END(S)

Tap to advance.
Choices shape your path.
Endings remember who you were.
`},

    {
      type: "choice",
      prompt: "When the sky changes… what do you do first?",
      options: [
        { text: "Record everything. Truth matters.", effect: add("truth", 1), goto: "ch1_start" },
        { text: "Move now. Action saves lives.", effect: add("resolve", 1), goto: "ch1_start" },
        { text: "Find who might be hurt. Protect them.", effect: add("mercy", 1), goto: "ch1_start" },
        { text: "Keep people calm. Hope is a weapon.", effect: add("hope", 1), goto: "ch1_start" }
      ]
    },

    // ============================================================
    // CHAPTER 1 — THE DAY THE SKY BURNED
    // ============================================================
    { type: "label", id: "ch1_start" },
    { type: "bg", value: "impact" },
    { type: "narr", text: `
CHAPTER 1 — THE DAY THE SKY BURNED

The meteor carved a line of fire across the night.
People cheered—until it didn’t fade.

Shooting stars don’t steer.

This one did.

It hit the outskirts like a verdict.
And the crater… opened.
`},

    { type: "narr", text: `
They climbed out like nightmares with purpose.
Plated. Insect-like. Too coordinated.

Someone named them fast—like naming horror makes it smaller:

Betas.
`},

    { type: "narr", text: `
You see four mechs surge forward—moving as one.

Rufki at the center—his ability syncing multiple machines at once.
Muhammad—telekinesis, precise and brutal.
Niko—energy manipulation, sharp as lightning.
Alban—super-soldier strength, unbreakable.
`},

    {
      type: "choice",
      prompt: "A beta breaks toward civilians. You—",
      options: [
        { text: "Pull it away. Take the risk.", effect: add("resolve", 1), goto: "ch1_after_choice" },
        { text: "Move people first. No one dies here.", effect: add("mercy", 1), goto: "ch1_after_choice" },
        { text: "Call its pattern. Help the team strike.", effect: add("truth", 1), goto: "ch1_after_choice" },
        { text: "Fight fear and lead the crowd to safety.", effect: add("hope", 1), goto: "ch1_after_choice" }
      ]
    },

    { type: "label", id: "ch1_after_choice" },
    { type: "narr", text: `
The commander beta appears—larger, smarter, directing the swarm.

Rufki’s mechs synchronize.
A conductor with steel giants as instruments.

The commander falls.
The swarm hesitates.

And in that hesitation, the world changes.

This wasn’t a meteor.
It was an arrival.
`},
    { type: "goto", id: "ch2_start" },

    // ============================================================
    // CHAPTER 2 — HOLD THE LINE
    // ============================================================
    { type: "label", id: "ch2_start" },
    { type: "bg", value: "war" },
    { type: "narr", text: `
CHAPTER 2 — HOLD THE LINE

Gunfire echoes through streets that used to sing.
Mechs burn hot. Pilots shake. The city evacuates in waves.

And still the betas keep coming.
`},

    { type: "say", who: "Muhammad", text: "We can’t keep this up much longer. They don’t stop." },
    { type: "say", who: "Rufki", text: "We hold. If they reach the center—everything collapses." },
    { type: "say", who: "Alban", text: "Then they don’t reach it." },
    { type: "say", who: "Niko", text: "Left flank’s breaking. I’m moving." },

    {
      type: "choice",
      prompt: "What do you push Rufki to prioritize?",
      options: [
        { text: "Protect evac routes.", effect: add("mercy", 1), goto: "ch2_end" },
        { text: "Go offensive—break the wave fast.", effect: add("resolve", 1), goto: "ch2_end" },
        { text: "Set a trap—study and exploit.", effect: add("truth", 1), goto: "ch2_end" },
        { text: "Rally morale—if hope dies, we die.", effect: add("hope", 1), goto: "ch2_end" }
      ]
    },

    { type: "label", id: "ch2_end" },
    { type: "narr", text: `
Night falls again.

Rufki watches the horizon and understands:
This isn’t a single invasion.

It’s a campaign.

And if humanity survives… it’ll be because someone decided to be a hero anyway.
`},
    { type: "goto", id: "ch3_start" },

    // ============================================================
    // CHAPTER 3 — THE WEAKNESS
    // ============================================================
    { type: "label", id: "ch3_start" },
    { type: "bg", value: "base" },
    { type: "narr", text: `
CHAPTER 3 — THE WEAKNESS

The team regroups in a makeshift base.
Exhaustion sits in your bones.

The betas adapt.
They coordinate.
They learn.

You can’t win a war against learning…
unless you learn faster.
`},

    { type: "say", who: "Rufki", text: "We need a weakness. Something real." },
    { type: "say", who: "Alban", text: "I can’t punch an endless wave forever." },
    { type: "say", who: "Muhammad", text: "We’re reacting. We need control." },
    { type: "say", who: "Niko", text: "I might have an idea. But it’s risky." },

    {
      type: "choice",
      prompt: "How do you respond to Niko’s risky plan?",
      options: [
        { text: "Trust him. Execute fast.", effect: add("resolve", 1), goto: "ch4_start" },
        { text: "Demand details. No blind leaps.", effect: add("truth", 1), goto: "ch4_start" },
        { text: "Ask: who gets hurt if it fails?", effect: add("mercy", 1), goto: "ch4_start" },
        { text: "Tell him: we believe in you.", effect: add("hope", 1), goto: "ch4_start" }
      ]
    },

    // ============================================================
    // CHAPTER 4 — THE RISK
    // ============================================================
    { type: "label", id: "ch4_start" },
    { type: "bg", value: "hangar" },
    { type: "narr", text: `
CHAPTER 4 — THE RISK

Niko’s plan: disrupt the beta signal—force the swarm to lose coordination.
It means baiting a commander into range…
and surviving long enough to strike.

There’s no guarantee.

Only choice.
`},

    { type: "say", who: "Niko", text: "If we break their signal, they stumble. Then we can breathe." },
    { type: "say", who: "Rufki", text: "We do it together. No one runs alone." },

    {
      type: "choice",
      prompt: "Who do you assign to the most dangerous role?",
      options: [
        { text: "Rufki. He can sync and hold the line.", effect: add("resolve", 1), goto: "ch5_start" },
        { text: "Muhammad. Pin the commander with telekinesis.", effect: add("truth", 1), goto: "ch5_start" },
        { text: "Alban. He can survive the impact.", effect: add("resolve", 1), goto: "ch5_start" },
        { text: "Niko. His plan, his hands on the trigger.", effect: add("hope", 1), goto: "ch5_start" }
      ]
    },

    // ============================================================
    // CHAPTER 5 — THE EXECUTION
    // ============================================================
    { type: "label", id: "ch5_start" },
    { type: "bg", value: "war" },
    { type: "narr", text: `
CHAPTER 5 — THE EXECUTION

The city becomes a chessboard of fire.
You lure the commander.
You feel its attention lock onto you like a knife.

Rufki synchronizes the mechs—engines screaming.
Muhammad braces his mind—hands shaking.
Alban steps forward like a wall.
Niko charges energy—eyes burning.
`},

    {
      type: "choice",
      prompt: "The commander turns toward civilians mid-plan. What do you do?",
      options: [
        { text: "Stay on plan. End the signal now.", effect: add("truth", 1), goto: "ch5_result" },
        { text: "Break formation to save civilians.", effect: add("mercy", 1), goto: "ch5_result" },
        { text: "Taunt it—pull it back yourself.", effect: add("resolve", 1), goto: "ch5_result" },
        { text: "Shout courage and move the crowd.", effect: add("hope", 1), goto: "ch5_result" }
      ]
    },

    { type: "label", id: "ch5_result" },
    { type: "narr", text: `
The strike lands.

For one heartbeat, the commander’s signal cuts out.

The swarm… stutters.

They still kill.
But they hesitate.

And hesitation is the first crack in an unbeatable enemy.
`},
    { type: "goto", id: "ch6_start" },

    // ============================================================
    // CHAPTER 6 — VICTORY (AND THE LIE OF “OVER”)
    // ============================================================
    { type: "label", id: "ch6_start" },
    { type: "bg", value: "base" },
    { type: "narr", text: `
CHAPTER 6 — AFTER THE ROAR

It worked.

The city breathes.
People cheer.
The team laughs—exhausted, half-delirious.

But Rufki can’t shake it:

If this was only a wave…
what sent it?
`},

    { type: "say", who: "Muhammad", text: "We actually did it…" },
    { type: "say", who: "Alban", text: "We made them bleed." },
    { type: "say", who: "Niko", text: "Then we can make them fall." },
    { type: "say", who: "Rufki", text: "Or they wanted us to think that." },

    { type: "goto", id: "ch7_start" },

    // ============================================================
    // CHAPTER 7 — MIA
    // ============================================================
    { type: "label", id: "ch7_start" },
    { type: "bg", value: "streets" },
    { type: "narr", text: `
CHAPTER 7 — THE GIRL IN THE ALLEY

On patrol, Rufki hears crying.
An alley.
A small girl, bruised and terrified.

Her name: Mia.

Separated from her mother during the attack.
`},

    {
      type: "choice",
      prompt: "How does Rufki approach Mia?",
      options: [
        { text: "Gentle truth. Promise nothing you can’t keep.", effect: add("truth",1), goto: "ch7_save" },
        { text: "Protective action. Carry her to safety now.", effect: add("resolve",1), goto: "ch7_save" },
        { text: "Kindness first. Let her choose to trust.", effect: add("mercy",1), goto: "ch7_save" },
        { text: "Give her hope. Tell her she’s not alone.", effect: add("hope",1), goto: "ch7_save" }
      ]
    },

    { type: "label", id: "ch7_save" },
    { type: "add", key: "fear", value: 0 }, // harmless if engine supports add node; if not, ignored
    { type: "narr", text: `
Mia takes Rufki’s hand.

She’s light as ash.
But her grip is desperate—like she’s holding onto the last warm thing in the world.

Rufki brings her to the base.

And something inside him quietly changes.
`},
    // flag
    { type: "narr", text: `(Mia has joined your story.)` },
    { type: "choice",
      prompt: "That night, Rufki decides:",
      options: [
        { text: "We find her mother. No matter what.", effect: flag("mia_saved", true), goto: "ch8_start" },
        { text: "We keep her safe first. The search comes second.", effect: flag("mia_saved", true), goto: "ch8_start" }
      ]
    },

    // ============================================================
    // CHAPTER 8 — THE SEARCH
    // ============================================================
    { type: "label", id: "ch8_start" },
    { type: "bg", value: "streets" },
    { type: "narr", text: `
CHAPTER 8 — THE SEARCH

A week of ruins.
A week of dead ends.
Then a lead.

A building.
A whisper.
A chance.

Mia walks beside Rufki like a shadow that wants to be a daughter.
`},

    {
      type: "choice",
      prompt: "You reach the building. How do you enter?",
      options: [
        { text: "Quietly. Recon first.", effect: add("truth",1), goto: "ch8_found" },
        { text: "Fast. In and out.", effect: add("resolve",1), goto: "ch8_found" },
        { text: "Safest route. Protect Mia.", effect: add("mercy",1), goto: "ch8_found" },
        { text: "Speak to Mia. Keep her heart steady.", effect: add("hope",1), goto: "ch8_found" }
      ]
    },

    { type: "label", id: "ch8_found" },
    { type: "narr", text: `
Inside… you find her.

Mia’s mother is alive—but hollow-eyed, injured, exhausted.
When Mia runs to her, the room becomes something sacred.

For one moment, the war feels far away.

Then the walls shake.
`},
    { type: "goto", id: "ch9_start" },

    // ============================================================
    // CHAPTER 9 — A MOTHER’S LOVE
    // ============================================================
    { type: "label", id: "ch9_start" },
    { type: "bg", value: "war" },
    { type: "narr", text: `
CHAPTER 9 — A MOTHER’S LOVE

Betas breach the room.

No plan.
No time.
Only instinct.

Mia’s mother pushes her daughter toward the exit.

“RUN.”
`},

    {
      type: "choice",
      prompt: "What does Rufki do?",
      options: [
        { text: "Grab Mia and escape—protect the child.", effect: add("mercy",1), goto: "ch9_outcome" },
        { text: "Fight to save the mother too.", effect: add("resolve",1), goto: "ch9_outcome" },
        { text: "Look for an opening, a tactic, a way out.", effect: add("truth",1), goto: "ch9_outcome" },
        { text: "Promise Mia she won’t be alone—move.", effect: add("hope",1), goto: "ch9_outcome" }
      ]
    },

    { type: "label", id: "ch9_outcome" },
    { type: "narr", text: `
A blast.
A scream.
Silence.

Mia’s mother… doesn’t make it.

She saves her daughter with the oldest power on Earth:

Love that sacrifices itself.
`},
    { type: "goto", id: "ch10_start" },

    // ============================================================
    // CHAPTER 10 — PAPERWORK AND PROMISES
    // ============================================================
    { type: "label", id: "ch10_start" },
    { type: "bg", value: "base" },
    { type: "narr", text: `
CHAPTER 10 — PAPERWORK AND PROMISES

Rufki signs forms with hands that still remember blood.
He doesn’t feel like a hero.
He feels like a man holding a child’s world together with tape.

Mia sleeps in a spare room.

And Rufki decides he won’t let her become another statistic.
`},

    {
      type: "choice",
      prompt: "Rufki tells Mia:",
      options: [
        { text: "The truth—gently, completely.", effect: add("truth",1), goto: "ch10_adopt" },
        { text: "We keep moving. We survive.", effect: add("resolve",1), goto: "ch10_adopt" },
        { text: "I’m here. You’re safe with me.", effect: add("mercy",1), goto: "ch10_adopt" },
        { text: "Your mom was a hero. You can be too.", effect: add("hope",1), goto: "ch10_adopt" }
      ]
    },

    { type: "label", id: "ch10_adopt" },
    { type: "narr", text: `
Rufki begins the adoption.

Not because it’s easy.

Because some promises are heavier than fear.
`},
    { type: "narr", text: `(Flag set: Rufki adopts Mia.)` },
    { type: "choice",
      prompt: "Confirm adoption path?",
      options: [
        { text: "Yes. Rufki adopts Mia.", effect: flag("mia_adopted", true), goto: "ch11_start" },
        { text: "Yes. Rufki adopts Mia.", effect: flag("mia_adopted", true), goto: "ch11_start" }
      ]
    },

    // ============================================================
    // CHAPTER 11 — ALBAN ON THE ROOF
    // ============================================================
    { type: "label", id: "ch11_start" },
    { type: "bg", value: "base" },
    { type: "narr", text: `
CHAPTER 11 — THE ROOF

Alban disappears.

You find him on the roof with a katana, staring down at the city like he’s deciding whether to jump into it… or out of it.
`},

    { type: "say", who: "Alban", text: "I can’t do this anymore… I miss her. I miss all of it." },
    {
      type: "choice",
      prompt: "How do you pull Alban back?",
      options: [
        { text: "Truth: grief means you cared. Don’t run from it.", effect: add("truth",1), goto: "ch11_save" },
        { text: "Resolve: we keep going—together.", effect: add("resolve",1), goto: "ch11_save" },
        { text: "Mercy: it’s okay to break. We’ll hold you.", effect: add("mercy",1), goto: "ch11_save" },
        { text: "Hope: she’d want you to live for something.", effect: add("hope",1), goto: "ch11_save" }
      ]
    },

    { type: "label", id: "ch11_save" },
    { type: "narr", text: `
Alban’s grip loosens.
He breathes like he’s returning from underwater.

He stays.

A life saved without firing a shot.
`},
    { type: "goto", id: "ch12_start" },

    // ============================================================
    // CHAPTER 12 — THE DREAM
    // ============================================================
    { type: "label", id: "ch12_start" },
    { type: "bg", value: "base" },
    { type: "narr", text: `
CHAPTER 12 — THE DREAM

People are disappearing.
Rumors spread of a “figure” guiding the betas.

Then Mia wakes up shaking.

“I saw it,” she whispers.
“They’re taking people… for something.”
`},

    {
      type: "choice",
      prompt: "How does Rufki respond to Mia’s vision?",
      options: [
        { text: "Investigate. Dreams can be clues.", effect: add("truth",1), goto: "ch13_start" },
        { text: "Mobilize now. We can’t wait.", effect: add("resolve",1), goto: "ch13_start" },
        { text: "Comfort Mia first. She’s a child.", effect: add("mercy",1), goto: "ch13_start" },
        { text: "Give her purpose—she can help save lives.", effect: add("hope",1), goto: "ch13_start" }
      ]
    },

    // ============================================================
    // CHAPTER 13 — TRAINING
    // ============================================================
    { type: "label", id: "ch13_start" },
    { type: "bg", value: "training" },
    { type: "narr", text: `
CHAPTER 13 — TRAINING

The team trains like the next day is the last day.
Because it might be.

Steel rings.
Energy snaps.
Telekinesis crushes concrete.
Rufki pushes synchronization until sparks fly.

Heroes aren’t born.
They’re forged.
`},

    { type: "goto", id: "ch14_start" },

    // ============================================================
    // CHAPTER 14 — THE CLICK
    // ============================================================
    { type: "label", id: "ch14_start" },
    { type: "bg", value: "training" },
    { type: "narr", text: `
CHAPTER 14 — THE CLICK

Rufki and Muhammad spar until their muscles scream.

Then—something inside Rufki shifts.

Power opens like a door that was always there.

Not rage.

Not luck.

Something deeper.

A core.
`},

    {
      type: "choice",
      prompt: "What does Rufki believe this power is?",
      options: [
        { text: "A tool. Learn it, control it.", effect: add("truth",1), goto: "ch15_start" },
        { text: "A weapon. Use it without hesitation.", effect: add("resolve",1), goto: "ch15_start" },
        { text: "A responsibility. Protect others with it.", effect: add("mercy",1), goto: "ch15_start" },
        { text: "A symbol. Inspire people with it.", effect: add("hope",1), goto: "ch15_start" }
      ]
    },

    // ============================================================
    // CHAPTER 15 — BEFORE THE STORM
    // ============================================================
    { type: "label", id: "ch15_start" },
    { type: "bg", value: "roof" },
    { type: "narr", text: `
CHAPTER 15 — BEFORE THE STORM

The betas go quiet.

That’s when veterans get scared.

Niko joins Rufki on the roof.

“We’re ready,” Niko says.
Rufki isn’t sure that’s true.

But he’s sure of this:

They’ll stand anyway.
`},
    { type: "goto", id: "ch16_start" },

    // ============================================================
    // CHAPTER 16 — THE BROTHERS
    // ============================================================
    { type: "label", id: "ch16_start" },
    { type: "bg", value: "base" },
    { type: "narr", text: `
CHAPTER 16 — THE BROTHERS

Niko isn’t alone.

His twin brother, Soso, arrives—same eyes, different weight.
And Raul, an older strategist figure, calls them in.

“Something is coming,” Raul says.
“The betas aren’t the whole story.”
`},

    {
      type: "choice",
      prompt: "Do you trust Raul’s instincts?",
      options: [
        { text: "Yes. He sees patterns.", effect: fadd("raul_trust", 1), goto: "ch17_start" },
        { text: "Not fully. Verify everything.", effect: add("truth",1), goto: "ch17_start" }
      ]
    },

    // ============================================================
    // CHAPTER 17 — THE WARNING
    // ============================================================
    { type: "label", id: "ch17_start" },
    { type: "bg", value: "briefing" },
    { type: "narr", text: `
CHAPTER 17 — THE WARNING

Disappearances increase.
Reports get darker.
Mia has another dream—stronger, clearer.

A figure.
A leader.
A “dawn strike.”

Time is running out.
`},
    { type: "goto", id: "ch18_start" },

    // ============================================================
    // CHAPTER 18 — ANGEL
    // ============================================================
    { type: "label", id: "ch18_start" },
    { type: "bg", value: "briefing" },
    { type: "narr", text: `
CHAPTER 18 — ANGEL

A new fighter walks in: Angel.
Black suit. Silver blade. Eyes that don’t blink.

“I know what they’re planning,” she says.
“I can take you to the source.”

Trust is a weapon too.
So is betrayal.
`},

    {
      type: "choice",
      prompt: "How does Rufki treat Angel?",
      options: [
        { text: "Trust her—time is short.", effect: fadd("angel_trust", 1), goto: "ch19_start" },
        { text: "Test her—she must prove it.", effect: add("truth",1), goto: "ch19_start" },
        { text: "Protect Mia from her—keep distance.", effect: add("mercy",1), goto: "ch19_start" },
        { text: "Inspire her—if she’s here, she’s fighting with us.", effect: add("hope",1), goto: "ch19_start" }
      ]
    },

    // ============================================================
    // CHAPTER 19 — NEW MECHS
    // ============================================================
    { type: "label", id: "ch19_start" },
    { type: "bg", value: "hangar" },
    { type: "narr", text: `
CHAPTER 19 — NEW MECHS

Raul unveils upgraded mechs.
Better shields. Cleaner thrust. Weapons that hum like a promise.

Angel points to a map.

“Dawn,” she says.
“That’s when they strike.”
`},
    { type: "goto", id: "ch20_start" },

    // ============================================================
    // CHAPTER 20 — THE DAWN BATTLE
    // ============================================================
    { type: "label", id: "ch20_start" },
    { type: "bg", value: "war" },
    { type: "narr", text: `
CHAPTER 20 — DAWN

The swarm stretches like an ocean of claws.

Rufki’s team steps forward anyway.
Because heroes don’t wait for permission.
`},

    {
      type: "choice",
      prompt: "In the chaos, what do you prioritize?",
      options: [
        { text: "Save people.", effect: add("mercy",1), goto: "ch20_end" },
        { text: "Cut to the leader.", effect: add("resolve",1), goto: "ch20_end" },
        { text: "Track the signal source.", effect: add("truth",1), goto: "ch20_end" },
        { text: "Keep the team together.", effect: add("hope",1), goto: "ch20_end" }
      ]
    },

    { type: "label", id: "ch20_end" },
    { type: "narr", text: `
They win.

But the victory feels… staged.
Like the enemy is watching from somewhere higher.

Then the “boss” finally appears.
`},
    { type: "goto", id: "ch21_start" },

    // ============================================================
    // CHAPTER 21 — THE FALSE BOSS
    // ============================================================
    { type: "label", id: "ch21_start" },
    { type: "bg", value: "briefing" },
    { type: "narr", text: `
CHAPTER 21 — THE FALSE BOSS

A man with white hair and cold eyes.
He speaks like a god testing ants.

“You impressed me,” he says.
“But you don’t understand what’s coming.”

He unleashes stronger betas.

The fight begins again.
`},
    { type: "goto", id: "ch22_start" },

    // ============================================================
    // CHAPTER 22 — “VICTORY”
    // ============================================================
    { type: "label", id: "ch22_start" },
    { type: "bg", value: "war" },
    { type: "narr", text: `
CHAPTER 22 — “VICTORY”

The team fights like legends.
The white-haired boss falls.

For a moment, the world believes it’s over.

Then a hologram appears.

A new face.

A real enemy.

And a message:

“Tomorrow. Sunrise. Final test.”
`},
    { type: "goto", id: "ch23_start" },

    // ============================================================
    // CHAPTER 23 — THE BROADCAST
    // ============================================================
    { type: "label", id: "ch23_start" },
    { type: "bg", value: "base" },
    { type: "narr", text: `
CHAPTER 23 — THE BROADCAST

The city hears it.
So does the world.

Fear spreads faster than fire.

Mia grips Rufki’s hand.

“Are we going to die?” she asks.

Rufki answers with the only thing a hero can offer:

“I’m here.”
`},

    {
      type: "choice",
      prompt: "What does Rufki teach Mia right now?",
      options: [
        { text: "Truth: fear is real. We move anyway.", effect: add("truth",1), goto: "ch24_start" },
        { text: "Resolve: heroes stand when others can’t.", effect: add("resolve",1), goto: "ch24_start" },
        { text: "Mercy: we fight to protect, not to hate.", effect: add("mercy",1), goto: "ch24_start" },
        { text: "Hope: even in endings, we plant beginnings.", effect: add("hope",1), goto: "ch24_start" }
      ]
    },

    // ============================================================
    // CHAPTER 24 — GEAR UP
    // ============================================================
    { type: "label", id: "ch24_start" },
    { type: "bg", value: "hangar" },
    { type: "narr", text: `
CHAPTER 24 — GEAR UP

Final prep.
Final words.
Final checks.

Everyone carries their own fear.
But no one leaves.

Because leaving means the city dies alone.
`},
    { type: "goto", id: "ch25_start" },

    // ============================================================
    // CHAPTER 25 — THE BREAKING
    // ============================================================
    { type: "label", id: "ch25_start" },
    { type: "bg", value: "war" },
    { type: "narr", text: `
CHAPTER 25 — THE BREAKING

The final battle erupts.

The enemy isn’t just claws—
it’s strategy, cruelty, pressure.

Then disaster.

Rufki’s mech is hit.

It explodes.

He’s thrown into the rubble.
`},

    {
      type: "choice",
      prompt: "Rufki rises. Power surges. What does he become?",
      options: [
        { text: "A blade of truth—target the real enemy.", effect: add("truth",1), goto: "ch25_rage" },
        { text: "A fist of resolve—push forward no matter what.", effect: add("resolve",1), goto: "ch25_rage" },
        { text: "A shield of mercy—protect the weak even here.", effect: add("mercy",1), goto: "ch25_rage" },
        { text: "A flame of hope—make them believe again.", effect: add("hope",1), goto: "ch25_rage" }
      ]
    },

    { type: "label", id: "ch25_rage" },
    { type: "narr", text: `
Rufki fights on foot—katana in hand—moving like the world slowed down for him.

Betas fall.
People survive.
The team regroups.

And then—

The real boss arrives.
`},
    { type: "goto", id: "ch26_start" },

    // ============================================================
    // CHAPTER 26 — THE HERO’S MEANING (FINAL)
    // ============================================================
    { type: "label", id: "ch26_start" },
    { type: "bg", value: "final" },
    { type: "narr", text: `
CHAPTER 26 — WHAT IT MEANS TO BE A HERO

The boss is not just strong.
He’s *absolute*.

He tries to break them with inevitability.

“You can’t save everyone,” he says.

Rufki hears Mia’s voice in his head.
He hears the city.

And he chooses.
`},

    {
      type: "choice",
      prompt: "Final decision: what does Rufki do?",
      options: [
        { text: "Sacrifice himself to end it for good.", effect: add("resolve",1), goto: "ending_check" },
        { text: "Try to win without sacrifice—risk the world.", effect: add("fear",1), goto: "ending_check" },
        { text: "Spare the enemy if possible—end the cycle.", effect: add("mercy",1), goto: "ending_check" },
        { text: "Expose the truth to the world—break their control.", effect: add("truth",1), goto: "ending_check" }
      ]
    },

    // ============================================================
    // ENDING CHECK — routes to multiple endings
    // ============================================================
    { type: "label", id: "ending_check" },

    // TRUE ENDING: high overall score, low fear, and adoption path
    { type: "if",
      cond: (S) => {
        const v = (window.State && State.vars) ? State.vars : {};
        const flags = v.flags || {};
        const total =
          (v.truth||0) + (v.resolve||0) + (v.mercy||0) + (v.hope||0) - (v.fear||0);
        return (flags.mia_adopted === true) && total >= 6 && (v.resolve||0) >= 2;
      },
      then: "ending_true",
      else: "ending_alt_check"
    },

    { type: "label", id: "ending_alt_check" },

    // Ending: DESPAIR (fear dominates)
    { type: "if",
      cond: (S) => ((State.vars.fear||0) >= 3),
      then: "ending_despair",
      else: "ending_alt_check2"
    },

    { type: "label", id: "ending_alt_check2" },

    // Ending: VENGEANCE (resolve high, mercy low)
    { type: "if",
      cond: (S) => ((State.vars.resolve||0) >= 3 && (State.vars.mercy||0) <= 0),
      then: "ending_vengeance",
      else: "ending_alt_check3"
    },

    { type: "label", id: "ending_alt_check3" },

    // Ending: MERCY (mercy high)
    { type: "if",
      cond: (S) => ((State.vars.mercy||0) >= 3),
      then: "ending_mercy",
      else: "ending_hope"
    },

    // ============================================================
    // TRUE ENDING (your canon: sacrifice + legacy)
    // ============================================================
    { type: "label", id: "ending_true" },
    { type: "bg", value: "epilogue" },
    { type: "narr", text: `
TRUE ENDING — LEGACY

Rufki knows the cost the moment he sees the opening.
A final strike that will end the boss…
and burn out everything inside him.

He takes it anyway.

Not because he wants to die.

Because he refuses to let Mia grow up in a world that never learned what a hero is.
`},

    { type: "narr", text: `
The boss falls.

The swarm collapses without its control.

The city lives.

Rufki collapses too—quietly, like a candle refusing to flicker.

The team gathers.
Even Alban can’t pretend he isn’t breaking.
`},

    { type: "say", who: "Rufki", text: "I’m sorry… I couldn’t save everyone." },
    { type: "say", who: "Niko", text: "You saved the world." },
    { type: "say", who: "Muhammad", text: "That’s what matters." },

    { type: "narr", text: `
Mia’s hand finds Rufki’s.

Not the hand of a rescued girl anymore.

The hand of family.
`},

    { type: "narr", text: `
Rufki gives Mia the last of his strength—not power like a weapon…

but courage like a torch.

“You will protect this world,” he whispers.
“You will carry what I couldn’t.”
`},

    { type: "narr", text: `
Rufki’s eyes close.

But he isn’t gone.

Not truly.

Because later, when Mia sleeps…
she dreams of him.

Not as a ghost.

As a promise.

A final goodbye.

And a reminder:

A hero isn’t the one who wins.

A hero is the one who chooses others… even when it costs everything.
`},

    { type: "narr", text: `
THE END — TRUE ENDING
`},

    // ============================================================
    // ALT ENDINGS
    // ============================================================
    { type: "label", id: "ending_despair" },
    { type: "bg", value: "epilogue" },
    { type: "narr", text: `
ENDING — DESPAIR

Fear wins the final moment.

Rufki hesitates.
The boss exploits it.
The team survives—but the city pays.

People remember the day the sky burned…
and the day hope went quiet.

THE END — DESPAIR
`},

    { type: "label", id: "ending_vengeance" },
    { type: "bg", value: "epilogue" },
    { type: "narr", text: `
ENDING — VENGEANCE

Resolve becomes obsession.

Rufki wins—but leaves mercy behind.
The boss falls in rage, not purpose.

The city survives…
but the hero becomes a warning.

THE END — VENGEANCE
`},

    { type: "label", id: "ending_mercy" },
    { type: "bg", value: "epilogue" },
    { type: "narr", text: `
ENDING — MERCY

Rufki finds a way to end the war without becoming what he hates.
He spares what can be spared.
He protects what must be protected.

The world survives…
and humanity remains human.

THE END — MERCY
`},

    { type: "label", id: "ending_hope" },
    { type: "bg", value: "epilogue" },
    { type: "narr", text: `
ENDING — HOPE

Rufki inspires the impossible.

The boss falls, not just to strength—
but to the refusal of the human spirit to kneel.

The city rebuilds.
The team endures.
Mia grows up believing in heroes.

THE END — HOPE
`},
  ];
})();