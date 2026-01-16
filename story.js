/* Worlds End(s) — Play Novel (Ch 1–2)
   iPhone-safe VN engine: tap-to-advance + choices + save/load.
   Shows errors on-screen if something breaks.
*/

(function () {
  const $ = (id) => document.getElementById(id);

  const UI = {
    screen: $("screen"),
    speaker: $("speaker"),
    text: $("text"),
    choices: $("choices"),
    toast: $("toast"),
    err: $("err"),
    btnNext: $("btnNext"),
    btnBack: $("btnBack"),
    btnSave: $("btnSave"),
    btnLoad: $("btnLoad"),
    btnMenu: $("btnMenu"),
  };

  // On-screen error reporting (so we don’t need console)
  window.addEventListener("error", (e) => showErr("JS ERROR:\n" + (e.message || e.error || e)));
  window.addEventListener("unhandledrejection", (e) => showErr("PROMISE ERROR:\n" + (e.reason?.message || e.reason || e)));

  function showErr(msg) {
    UI.err.classList.remove("hidden");
    UI.err.textContent = String(msg);
  }

  const SAVE_KEY = "we_novel_save_v1";

  const State = {
    i: 0,
    vars: { mercy: 0, resolve: 0, truth: 0 },
    visited: [],
  };

  function toast(msg) {
    UI.toast.textContent = msg;
    UI.toast.classList.remove("hidden");
    setTimeout(() => UI.toast.classList.add("hidden"), 1200);
  }

  // STORY (Chapters 1–2)
  const Story = [
    { type: "label", id: "start" },
    { type: "narr", text: `WORLD END(S)\n\nTap to begin.` },

    // ==========================
    // CHAPTER 1 — THE DAY THE SKY BURNED
    // ==========================
    { type: "narr", text:
`CHAPTER 1 — THE DAY THE SKY BURNED

The meteor blazed across the sky, leaving a trail of fire in its wake.

At first, people thought it was a miracle.
A rare light. A once-in-a-lifetime moment.
Phones rose into the air like candles.
Voices overlapped—excited, disbelieving, hungry to witness history.

Then the sky answered with heat.

When it struck the ground, the impact was felt for miles around.

But it wasn’t a rock that landed on Earth.

It was a ship.` },

    { type: "narr", text:
`The next hours were chaos wrapped in fascination.

News helicopters circled the crater.
Scientists arrived in convoys.
Officials spoke carefully into microphones about “unknown material” and “no immediate danger.”

And through it all, the same thought kept repeating in your head:

This doesn’t feel like discovery.

It feels like an arrival.` },

    { type: "speaker", name: "Rufki", text:
`“Keep your eyes open. If this thing has a door… it has something behind it.”` },

    { type: "narr", text:
`Your friends laugh like you’re being dramatic.

But then the perimeter alarms spike.

A shape moves inside the wreckage—too fast, too sharp.
Something insect-like.

The first Beta steps into the light…

…and the whole world ignites.` },

    { type: "choice",
      prompt: "You see the Beta for the first time. What’s your first move?",
      options: [
        { text: "Step forward and get a better look.", effect: () => State.vars.truth++, goto: "ch1_truth" },
        { text: "Pull people back and warn them.", effect: () => State.vars.mercy++, goto: "ch1_mercy" },
        { text: "Scan for exits and cover.", effect: () => State.vars.resolve++, goto: "ch1_resolve" },
      ]
    },

    { type: "label", id: "ch1_truth" },
    { type: "narr", text:
`You lean in—dangerously close.

You memorize details:
Segmented plating. No wasted motion. A head that tilts like it’s listening.

This isn’t wildlife.

It’s engineered.` },
    { type: "goto", id: "ch1_common" },

    { type: "label", id: "ch1_mercy" },
    { type: "narr", text:
`“Back up! Get away from it!”

Your warning hits people before panic does.
A few actually listen.
That matters.

It always matters.` },
    { type: "goto", id: "ch1_common" },

    { type: "label", id: "ch1_resolve" },
    { type: "narr", text:
`You don’t waste time staring.

Your eyes find angles, barriers, exits.
Your body moves before your fear can catch up.

Survival is a skill. You practice it instantly.` },
    { type: "goto", id: "ch1_common" },

    { type: "label", id: "ch1_common" },
    { type: "narr", text:
`The first scream comes from the front line.

Then the second.
Then a chain reaction of screams that turns the crowd into a wave.

The Beta moves like a blade through smoke.

And you realize something that makes your stomach drop:

It’s not confused.

It’s not scared.

It knows exactly what it’s doing.` },

    { type: "speaker", name: "Rufki", text:
`“We’re not watching history…”` },

    { type: "speaker", name: "Rufki", text:
`“…We’re watching the beginning.”` },

    { type: "end", title: "End of Chapter 1", body:
`Chapter 1 complete.

Next: The Betas

(Your choices are saved and will affect tone later.)` },

    // ==========================
    // CHAPTER 2 — THE BETAS
    // ==========================
    { type: "label", id: "ch2_start" },

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

    { type: "speaker", name: "Rufki", text: `“Move! Don’t stare—MOVE!”` },

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

    { type: "speaker", name: "Rufki", text: `“…Armor.”` },

    { type: "narr", text:
`It isn’t just tough.
It’s designed.

Segment plates overlap like a living tank.
Joints are protected.
Eyes set deep.

This isn’t an animal.

This is an answer to a question humanity hasn’t even asked yet.` },

    { type: "choice",
      prompt: "In the stampede, you see someone pinned under a fallen barrier. What do you do?",
      options: [
        { text: "Go back and pull them free.", effect: () => State.vars.mercy++, goto: "ch2_save" },
        { text: "Keep moving and get to cover.", effect: () => State.vars.resolve++, goto: "ch2_cover" },
        { text: "Shout for help while you scan for the Beta.", effect: () => State.vars.truth++, goto: "ch2_shout" },
      ]
    },

    { type: "label", id: "ch2_save" },
    { type: "narr", text:
`You pivot hard against the tide of bodies.

The barrier is heavier than it looks—metal twisted and hot.
The person under it is half-conscious, eyes wide.

You heave.
Pain shoots up your shoulders.

The barrier shifts—enough.

You drag them free and shove them toward the nearest doorway.

They don’t thank you.

But they’re alive.` },
    { type: "goto", id: "ch2_common" },

    { type: "label", id: "ch2_cover" },
    { type: "narr", text:
`You force yourself to keep moving.

It feels wrong—like betrayal.
But staying in the open is suicide.

You slip behind a shattered divider, breath ragged.
From here you catch flashes of the Beta—like a nightmare skipping frames.` },
    { type: "goto", id: "ch2_common" },

    { type: "label", id: "ch2_shout" },
    { type: "narr", text:
`“HELP! OVER HERE!”

Your shout cuts through the noise for a second.
A couple people glance your way, but panic doesn’t organize itself.

Still—your eyes stay sharp.
You track the Beta’s pattern: it angles toward choke points.
It’s not just chasing prey.

It’s controlling the field.` },
    { type: "goto", id: "ch2_common" },

    { type: "label", id: "ch2_common" },
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
`Two days later, leaked footage hits your phone.

Grainy video from inside the perimeter.

A shape.

Not one.

Several.` },

    { type: "speaker", name: "Rufki", text: `“…They’re multiplying.”` },

    { type: "narr", text:
`The video ends with static.

But the static doesn’t sound random.
It sounds… patterned.
Like interference.
Like something broadcasting on a frequency your world wasn’t built to hear.` },

    { type: "narr", text:
`On the third day, your city changes.

Not by explosion.

By silence.

Streets empty faster than they should.
Stores close without explanation.
Hospitals get “new protocols.”
Police radios run nonstop.

Everyone is waiting for the next thing to happen.

And then it does.` },

    { type: "narr", text:
`A second impact hits the outskirts.

No warning. No fireball.

Just a distant thud that you feel in your teeth.

Then another.

Then another.

As if something is arriving in pieces.

Or… as if the first ship was never alone.` },

    { type: "speaker", name: "Rufki", text: `“This is a landing.”` },

    { type: "choice",
      prompt: "A private message hits your phone from an unknown number: “If you want answers, come alone.”",
      options: [
        { text: "Go. Answers matter more than fear.", effect: () => State.vars.resolve++, goto: "ch2_meet" },
        { text: "Don’t go. Track the number instead.", effect: () => State.vars.truth++, goto: "ch2_track" },
        { text: "Reply: “Who are you?”", effect: () => State.vars.mercy++, goto: "ch2_reply" },
      ]
    },

    { type: "label", id: "ch2_meet" },
    { type: "narr", text:
`You go.

Not because it’s smart.
Because waiting is worse.

The meeting point is under an old overpass where the city’s lights don’t reach.
A figure stands there like a cutout against the dark.

They don’t introduce themselves.

They just say one sentence that changes the shape of your future.` },
    { type: "speaker", name: "Unknown", text: `“They’re not here to negotiate. They’re here to replace.”` },
    { type: "goto", id: "ch2_after" },

    { type: "label", id: "ch2_track" },
    { type: "narr", text:
`You don’t go.

You pull the number apart instead—reverse lookups, traces, anything.

The result is impossible:
No carrier. No registration.

As if the message didn’t come from a phone at all.

Then your screen flickers once.

And a new message appears, already knowing what you did.` },
    { type: "speaker", name: "Unknown", text: `“Smart. But you’re running out of time.”` },
    { type: "goto", id: "ch2_after" },

    { type: "label", id: "ch2_reply" },
    { type: "narr", text:
`Your fingers hover, then type:

“Who are you?”

The reply comes instantly.

No delay. No typing bubble.

Just words, clean as a blade:` },
    { type: "speaker", name: "Unknown", text: `“Someone who survived the first wave.”` },
    { type: "goto", id: "ch2_after" },

    { type: "label", id: "ch2_after" },
    { type: "narr", text:
`That night, you stop calling it an “incident.”

You call it what it is:

A war—before the first battle line even forms.

You sit alone with the city’s distant sirens and your own thoughts, and you understand something you didn’t understand before:

If humanity waits for permission to fight, it will die waiting.

If humanity waits for a hero, it will die hoping.

So you begin to plan.

Not as a soldier.
Not as a politician.

As someone who refuses to be prey.` },

    { type: "speaker", name: "Rufki", text: `“If we’re going to survive… we need something bigger than fear.”` },

    { type: "end", title: "End of Chapter 2", body:
`Chapter 2 complete.

Next: Resistance

(Your choices continue to affect tone and the final message.)` },
  ];

  // Build label map
  const labels = {};
  Story.forEach((s, idx) => { if (s.type === "label") labels[s.id] = idx; });

  function currentStep() { return Story[State.i]; }

  function renderStep(step) {
    // Clear choices every step
    UI.choices.innerHTML = "";
    UI.choices.classList.add("hidden");

    if (!step) return;

    if (step.type === "speaker") {
      UI.speaker.textContent = step.name;
      UI.speaker.classList.remove("hidden");
      UI.text.textContent = step.text;
    } else if (step.type === "narr") {
      UI.speaker.classList.add("hidden");
      UI.text.textContent = step.text;
    } else if (step.type === "choice") {
      UI.speaker.classList.add("hidden");
      UI.text.textContent = step.prompt;

      UI.choices.classList.remove("hidden");
      step.options.forEach((opt) => {
        const b = document.createElement("button");
        b.className = "choiceBtn";
        b.textContent = opt.text;
        b.onclick = () => {
          try { opt.effect?.(); } catch (e) { showErr(e); }
          gotoLabel(opt.goto);
        };
        UI.choices.appendChild(b);
      });
    } else if (step.type === "goto") {
      gotoLabel(step.id);
      return;
    } else if (step.type === "end") {
      UI.speaker.classList.add("hidden");
      UI.text.textContent = `${step.title}\n\n${step.body}`;
    }
  }

  function gotoLabel(id) {
    const idx = labels[id];
    if (typeof idx !== "number") {
      showErr("Missing label: " + id);
      return;
    }
    State.i = idx;
    renderStep(currentStep());
  }

  function next() {
    const step = currentStep();
    if (!step) return;

    // If choices are visible, don't skip them
    if (step.type === "choice") return;

    // Move to next step
    State.visited.push(State.i);
    State.i = Math.min(State.i + 1, Story.length - 1);

    // Auto-skip label steps
    while (Story[State.i] && Story[State.i].type === "label") {
      State.i++;
      if (State.i >= Story.length) break;
    }

    renderStep(currentStep());
  }

  function back() {
    const prev = State.visited.pop();
    if (typeof prev === "number") {
      State.i = prev;
      renderStep(currentStep());
    }
  }

  function saveGame() {
    const payload = { i: State.i, vars: State.vars, visited: State.visited };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    toast("Saved");
  }

  function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { toast("No save found"); return; }
    const data = JSON.parse(raw);
    State.i = data.i ?? 0;
    State.vars = data.vars ?? State.vars;
    State.visited = data.visited ?? [];
    toast("Loaded");
    renderStep(currentStep());
  }

  function menu() {
    const m =
`Menu
- Save: stores progress on this phone
- Load: restores your last save
- Restart: clears save + restarts`;

    const ok = confirm(m + "\n\nPress OK to Restart, Cancel to close.");
    if (ok) {
      localStorage.removeItem(SAVE_KEY);
      State.i = 0;
      State.vars = { mercy: 0, resolve: 0, truth: 0 };
      State.visited = [];
      toast("Restarted");
      renderStep(currentStep());
    }
  }

  // Wire up UI
  UI.btnNext.onclick = next;
  UI.btnBack.onclick = back;
  UI.btnSave.onclick = saveGame;
  UI.btnLoad.onclick = loadGame;
  UI.btnMenu.onclick = menu;

  // Tap story area to advance (mobile friendly)
  UI.screen.addEventListener("click", (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    if (tag === "button") return;
    next();
  });

  // Start
  // Skip initial label automatically
  if (Story[0].type === "label") State.i = 1;
  renderStep(currentStep());
  toast("JS loaded ✅");
})();
