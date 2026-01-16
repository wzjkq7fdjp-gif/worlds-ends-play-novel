/* =========================================================
   WORLDS END(S) — Story File
   Chapter 1 (Long, with choices from the start)
   Uses: State.vars.truth/resolve/mercy/hope/fear
   ========================================================= */

const Story = [
  // =======================================================
  // CHAPTER 1 — THE DAY THE SKY BURNED
  // =======================================================
  { type: "label", id: "ch1_start" },
  { type: "bg", value: "impact" },
  { type: "music", value: "" },

  { type: "narr", text: `
CHAPTER 1 — THE DAY THE SKY BURNED

The meteor didn’t arrive like a warning.
It arrived like a verdict.

A blade of fire carved the night sky—bright enough to turn clouds into paper-thin ghosts,
loud enough to make the city’s windows vibrate in their frames.

People pointed.
People cheered.
Phones rose like candles.

For one breath, the world felt united.

Then the air changed.
Heat rolled in waves.
The light didn’t fade the way shooting stars fade.

It *stayed*.
It *descended*.

And deep in your chest—where instinct lives—you felt it:
not wonder…
but countdown.
`},

  { type: "choice",
    prompt: "When the sky burns, what do you do first?",
    options: [
      {
        text: "Record it. If they lie later, you’ll have proof.",
        effect: () => { State.vars.truth += 1; State.vars.resolve += 1; },
        goto: "ch1_record"
      },
      {
        text: "Run toward the impact site. If people are hurt, you help.",
        effect: () => { State.vars.hope += 1; State.vars.resolve += 1; },
        goto: "ch1_run"
      },
      {
        text: "Call your people. If this is a threat, you organize fast.",
        effect: () => { State.vars.truth += 1; State.vars.hope += 1; },
        goto: "ch1_call"
      },
      {
        text: "Freeze. Watch. Listen. Learn what everyone else misses.",
        effect: () => { State.vars.fear += 1; State.vars.truth += 1; },
        goto: "ch1_freeze"
      }
    ]
  },

  // --- Branch: Record ---
  { type: "label", id: "ch1_record" },
  { type: "narr", text: `
You lift your phone with hands that feel too small for the moment.

The camera struggles to focus—because the sky is too bright, too wrong—
but it catches the trail: a wound of flame stitched across the stars.

Around you, strangers shout and laugh.
Some pray.
Some scream.
A kid says, “Make a wish!”

And then the sound hits.

Not a boom—
a *pressure*.
As if the sky itself has punched the earth.

Your screen shakes.
The image warps.
A few frames glitch—static crawling across the meteor’s tail like insects.

Insects.

That detail makes your stomach tighten.
`},

  { type: "choice",
    prompt: "The video glitches hard. Do you…",
    options: [
      {
        text: "Keep recording. Whatever this is, it wants to be hidden.",
        effect: () => { State.vars.truth += 1; State.vars.fear += 1; },
        goto: "ch1_to_site"
      },
      {
        text: "Stop and back up the file immediately.",
        effect: () => { State.vars.truth += 1; },
        goto: "ch1_to_site"
      }
    ]
  },

  // --- Branch: Run ---
  { type: "label", id: "ch1_run" },
  { type: "narr", text: `
You don’t think. You move.

Sirens begin to rise—one, then ten, then a whole city’s worth of panic.

You sprint toward the glow over the horizon. The air tastes metallic.
Ash drifts down like black snow.

People are running the other way, eyes wide, faces lit by distant fire.
Someone grabs your sleeve and begs, “Don’t go!”

But you do.

Because if the world ends tonight, you refuse to spend the last minutes as a bystander.
`},
  { type: "choice",
    prompt: "You see a family trapped in a traffic pileup as debris falls. Help or keep moving?",
    options: [
      {
        text: "Help them. No one dies alone if you can stop it.",
        effect: () => { State.vars.mercy += 1; State.vars.hope += 1; },
        goto: "ch1_help_family"
      },
      {
        text: "Keep moving. Seconds matter. You can save more later.",
        effect: () => { State.vars.resolve += 1; State.vars.fear += 1; },
        goto: "ch1_to_site"
      }
    ]
  },

  { type: "label", id: "ch1_help_family" },
  { type: "narr", text: `
You shove past horns and shouting, wedge your shoulder into a bent door, and pull.

A child cries.
A mother’s hands shake too hard to unbuckle the seatbelt.
You do it for her.

“Go—NOW!” you yell, guiding them away as another chunk of burning debris smashes into the street behind you.

They don’t even thank you.
They’re too scared.

And that’s fine.

Heroes don’t do it for applause.
They do it because somebody has to.
`},
  { type: "jump", goto: "ch1_to_site" },

  // --- Branch: Call your people ---
  { type: "label", id: "ch1_call" },
  { type: "narr", text: `
You turn away from the crowd and start dialing.

One call becomes five.
Five becomes a chain.

Your voice is calm—because panic is contagious and you refuse to spread it.
You tell them where to meet.
You tell them who to contact.
You tell them to bring whatever they can: medkits, power cells, radios.

You don’t know what’s coming.

But leadership is deciding to stand up *before* the danger explains itself.
`},
  { type: "choice",
    prompt: "Your teammate Muhammad answers first. What do you say?",
    options: [
      {
        text: `"Meet me. We protect civilians first."`,
        effect: () => { State.vars.mercy += 1; State.vars.hope += 1; },
        goto: "ch1_to_site"
      },
      {
        text: `"Meet me. We find the source and end it fast."`,
        effect: () => { State.vars.resolve += 1; State.vars.truth += 1; },
        goto: "ch1_to_site"
      }
    ]
  },

  // --- Branch: Freeze ---
  { type: "label", id: "ch1_freeze" },
  { type: "narr", text: `
You stand still while the city moves around you.

The human brain is built to miss details in chaos.
But you don’t look at the fire.
You look at the *pattern*.

The meteor’s trail isn’t smooth.
It pulses.
It stutters.

And for an instant, the flame parts like a curtain—
revealing something inside it.

Not rock.

Metal.

A shape.
A silhouette.
A belly of plating.

A ship.

Your throat goes dry.
`},
  { type: "choice",
    prompt: "Do you tell anyone what you saw?",
    options: [
      {
        text: "Yes. A warning now saves lives later.",
        effect: () => { State.vars.hope += 1; State.vars.truth += 1; },
        goto: "ch1_to_site"
      },
      {
        text: "No. People will panic. You need proof first.",
        effect: () => { State.vars.truth += 1; State.vars.fear += 1; },
        goto: "ch1_to_site"
      }
    ]
  },

  // =======================================================
  // Converge: Impact Site
  // =======================================================
  { type: "label", id: "ch1_to_site" },
  { type: "narr", text: `
By the time you reach the edge of the impact zone, the world looks… edited.

Streetlights flicker.
Phones die at random.
Radio stations dissolve into static.

A crater yawns in the earth like a mouth.
The ground around it is glassed—sand fused into shining black mirrors.

And in the center…

something breathes.

Not smoke—breath.
A rhythm.

A *living* sound.

A chunk of alien metal sits half-buried, split open like an egg.
Blue-white light leaks from inside, scanning the air in thin lines.

Then a shape moves.
A shadow unfolds.
It steps out of the ship like it owns the planet.

It’s insect-like, but wrong in the way nightmares are wrong:
too many joints,
too quiet,
too sure.

It turns its head toward the distant city lights.

And you realize—

it didn’t crash.

It *arrived*.
`},

  { type: "choice",
    prompt: "The first Beta emerges. What’s your instinct?",
    options: [
      {
        text: "Approach carefully. If it can be reasoned with, try.",
        effect: () => { State.vars.mercy += 1; State.vars.truth += 1; },
        goto: "ch1_first_contact"
      },
      {
        text: "Hide and observe. Learn its behavior before acting.",
        effect: () => { State.vars.truth += 1; State.vars.fear += 1; },
        goto: "ch1_observe_beta"
      },
      {
        text: "Attack. If it’s here to kill us, you strike first.",
        effect: () => { State.vars.resolve += 1; State.vars.fear += 1; },
        goto: "ch1_attack_beta"
      }
    ]
  },

  { type: "label", id: "ch1_first_contact" },
  { type: "narr", text: `
You raise both hands—slow, nonthreatening.

“Hey,” you say, voice low. “We don’t want a fight.”

The Beta’s head tilts.
A chorus of clicks answers—like nails on glass.

For one second you think:
maybe it understands.

Then the light inside the ship flares.
A second Beta steps out.
Then a third.

They don’t look at you.

They look past you.

At the city.

The first Beta’s torso opens like a flower of blades—
and a beam of pale energy slices the ground in front of you,
warning shot… or measurement.

Either way, the message is clear:

You are not the target.
You are… an obstacle.
`},
  { type: "jump", goto: "ch1_escape" },

  { type: "label", id: "ch1_observe_beta" },
  { type: "narr", text: `
You slip behind a wrecked truck and watch.

The Betas move with purpose—no wasted motion.
They’re not scouting like animals.
They’re not stumbling like lost explorers.

They’re executing a plan.

One of them taps the black glassed ground.
A thin vein of light spreads outward in a circle.

A scan.

A mapping.

A *claim*.

Your stomach twists as you realize:
this is an invasion checklist.
`},
  { type: "jump", goto: "ch1_escape" },

  { type: "label", id: "ch1_attack_beta" },
  { type: "narr", text: `
You grab a fallen piece of rebar—ridiculous against alien steel—
and charge anyway.

The Beta pivots.
Not startled.
Not angry.

Just precise.

It moves once.

Pain erupts across your side as something slams you hard enough to lift you off your feet.
You skid across glassed earth, breath knocked out.

The Beta stands over you.

And in its reflective armor, you see yourself:
small.
fragile.
human.

Then it turns away.

It doesn’t finish you.

Because it doesn’t need to.

It has a city to take.
`},
  { type: "jump", goto: "ch1_escape" },

  { type: "label", id: "ch1_escape" },
  { type: "narr", text: `
You scramble up and run as alarms begin to scream from every direction.

The Betas surge forward like a tide, moving in packs.
Their shapes blur through smoke and streetlight.

You make it to higher ground and look back—

and watch the first neighborhood ignite.

Not from fire…

from *silence*.
The lights blink out.
Cars stall.
People freeze in confusion.

And then the Betas hit.

In minutes, the city becomes a battlefield.

And you know, with cold certainty:

If humanity survives this,
it won’t be because someone was strong.

It will be because someone chose to stand.

Somewhere in the chaos, your comm buzzes.
A voice you recognize—Muhammad—ragged with urgency.

“Rufki! Where are you?!”

Rufki.

Your name finally feels like a title.

You swallow, steady your breath, and answer:

“I’m here.”

And you start moving toward the war.
`},

  { type: "choice",
    prompt: "End of Chapter 1. What does Rufki choose to value right now?",
    options: [
      {
        text: "Protect people first, even if it costs you power.",
        effect: () => { State.vars.mercy += 1; State.vars.hope += 1; },
        goto: "ch1_end"
      },
      {
        text: "Hunt the truth of the Betas, even if it scares people.",
        effect: () => { State.vars.truth += 1; State.vars.fear += 1; },
        goto: "ch1_end"
      },
      {
        text: "Win at any cost. If you hesitate, everyone dies.",
        effect: () => { State.vars.resolve += 2; State.vars.fear += 1; },
        goto: "ch1_end"
      }
    ]
  },

  { type: "label", id: "ch1_end" },
  { type: "end",
    title: "End of Chapter 1",
    body: "The Betas have arrived.\n\nNext: Chapter 2 — The First Stand\n\n(Your early choices already shape your path.)"
  },
];