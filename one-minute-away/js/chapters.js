// ============================================================
// Chapters 0–5. Prologue (4:04), the street that remembers,
// the girl at the house, the House of Almost, when you were away,
// water under the door. (Later chapters, endings and the title
// are in chapters2.js.)
// ============================================================
import { THREE, U, mat, TEX, boxGeo } from "./ps1.js";
import { Character, SpriteActor } from "./actors.js";
import { isWatched } from "./world.js";
import { pic } from "./art.js";
import { itemURL } from "./assets.js";
import * as S from "./scenes.js";
import { R, A, N, HER, at, pin, yawAt, peepCanvas, herPage, relabel, grade, addTint, clockBack, minuteMap, stalker, reach } from "./story.js";
import { CH6, CH7, CH8, CH9, CH10, CH11, CH12, CH13, CH14, CH15, ENDINGS, buildTitle, decideEnding } from "./chapters2.js";
export { ENDINGS, buildTitle, decideEnding };

// ============================================================
// PROLOGUE — 4:04
// ============================================================
async function prologue(G) {
  const P = G.player;
  G.state.place = "Ocean Parkway";
  await G.load(S.buildParkway);
  const W = G.world;
  G.pov("Rufki");
  // see-through windows so we can watch him in the car
  G._car.children[1].material = mat({ color: 0x2a3440, opacity: 0.35 });
  // the passenger door (hinged at its front edge)
  const hinge = new THREE.Group();
  hinge.position.set(9.08, 0, 0.9);
  const door = new THREE.Mesh(boxGeo(0.06, 0.7, 1.1), mat({ map: TEX.cloth([70, 66, 74], "car70,66,74") }));
  door.position.set(0, 0.62, -0.55);
  hinge.add(door);
  W.add(hinge);
  P.ghost = true;
  P.frozen = true;
  P.place(10.4, -0.15, 0);
  P.pos.y = 0.05;
  P.ch.pose("sitPhone");
  G.audio.ambience({ wind: 0.5, drone: 0.25, note: 40, traffic: 0.15, bright: 260 });
  G.clock("4:04");
  await G.cutscene(async () => {
    G.shot([12.2, 1.55, 3.6], [10.3, 1.0, -0.2], 44);
    G.ui.setFade(1);
    G.audio.ring(); G.caption("A phone is ringing");
    await G.wait(2.2);
    G.audio.ring();
    await G.fade(0, 2.2);
    G.music.play("fog", 4);
    await G.say([N("October 24, 2026. Ocean Parkway, Brooklyn. Four minutes past four in the morning."), N("He is parked in the service lane. Her name lights up the phone.")]);
    await G.say([A("Hey, baby?"), N("He waits."), A("Do you remember where we first met?"), R("Of course I do. What's wrong?"), A("You need to remember something else."), R("Remember what?")]);
    // the dome light: somebody has opened the passenger door from the inside
    G._dome.on = true;
    G.audio.dome();
    G.caption("The dome light clicks on");
    await G.wait(0.5);
    G.audio.carDoor(true);
    G.caption("The passenger door opens");
    await G.tween(0.9, (k) => (hinge.rotation.y = k * 1.05));
    G.shot([10.5, 1.45, 0.9], [9.5, 0.7, -0.3], 52);
    G.audio.sting(true);
    await G.say([N("Halfway through her question, the passenger door swings open from the inside.")]);
    await G.still("car", { hold: 5, text: "The seat is empty.", rev: true });
    G.shot([12.2, 1.55, 3.6], [10.3, 1.0, -0.2], 44);
    await G.say([A("Before we met... how close were we?"), R("One minute.")]);
    // the window across the street brightens each time she breathes
    G.shot([9.4, 1.6, -1.6], [-15, 5.5, 4], 40);
    const win = G._breathWin;
    for (let i = 0; i < 3; i++) {
      G.audio.breath(0.06);
      G.caption("She breathes");
      await G.tween(0.6, (k) => win.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.9));
      await G.wait(0.4);
    }
    await G.say([N("A pause. Across the street, one apartment window brightens each time she takes a breath.")]);
    G.shot([12.2, 1.55, 3.6], [10.3, 1.0, -0.2], 44);
    await G.say([A("Then why can't you find me?")]);
    G.audio.busy();
    G.caption("The line goes dead", 2.4);
    await G.wait(1.4);
    await G.fade(1, 0.8);
  });
  G.music.play(null, 1);

  // ---------------- Argjila: the hallway of front doors ----------------
  await G.handoff("Argjila", "A hallway lined with front doors");
  await G.load(S.buildHallway);
  const H = G.world;
  G.pov("Argjila");
  G.state.place = "the hallway";
  G.clock("4:04");
  G.audio.ambience({ wind: 0.05, drone: 0.35, note: 46, bright: 200, verb: 0.4 });
  G.music.play("dread", 3);
  P.ch.pose("phone");
  await G.fade(0, 1.2);
  await G.cutscene(() => G.say([N("She dials him from a hallway lined with front doors."), N("Through each peephole she can see him, in the same car.")]));
  P.ch.pose(null);
  G.objective("LOOK THROUGH THE DOORS. ONE OF THEM IS LISTENING.");
  const peep = async (text) => {
    G.audio.creak(0.6);
    await G.item({ title: "PEEPHOLE", canvas: peepCanvas(/open/.test(text)), round: true, text });
  };
  let heard = false;
  const doors = [
    { key: "a", pos: pin(H, "doorA", 1.4), label: "THE DOOR", verb: "PEEPHOLE", use: async () => { P.ch.pose("listen"); await peep("Ocean Parkway in fog. The parked car. Him, with the phone still against his ear."); P.ch.pose(null); } },
    { key: "b", pos: pin(H, "doorB", 1.4), label: "THE DOOR", verb: "PEEPHOLE", use: async () => { P.ch.pose("listen"); await peep("The same car. The same fog. The passenger door is open now."); P.ch.pose(null); } },
    { key: "c", pos: pin(H, "doorC", 1.4), label: "THE FAR DOOR", verb: "LISTEN", use: async () => {
      P.ch.pose("listen");
      G.audio.setMuffle(true);
      G.caption("Someone speaks on the other side");
      await G.say([N("This one has no view. She puts her ear to it instead."), R("Argjila...", { slow: true, fx: { vol: 0.55 } }), N("He says her name so quietly she almost misses it.")]);
      G.audio.setMuffle(false);
      P.ch.pose(null);
      heard = true;
    } },
  ];
  // the doors can be visited in any order; the far one matters
  const used = new Set();
  while (!heard) {
    const left = doors.filter((d) => !used.has(d.key));
    const k = await G.interactAny(left);
    used.add(k);
  }
  G.objective("SLIDE THE CHAIN ACROSS. TWICE.");
  for (let i = 0; i < 2; i++) {
    await G.interactOnce({ pos: pin(H, "chain", 1.3), label: "THE CHAIN", verb: "SLIDE", r: 1.6, use: async () => {
      P.ch.pose("chain");
      G.audio.chainClick();
      G.caption(i === 0 ? "The chain clicks" : "The chain clicks again");
      await G.wait(0.5);
      P.ch.pose(null);
    } });
  }
  await G.wait(0.4);
  await G.fade(1, 0.6);

  // ---------------- back to Rufki ----------------
  await G.handoff("Rufki", "Two clicks in the car speaker");
  await G.load(S.buildParkway);
  G.pov("Rufki");
  G._car.children[1].material = mat({ color: 0x2a3440, opacity: 0.35 });
  P.ghost = true; P.frozen = true;
  P.place(10.4, -0.15, 0); P.pos.y = 0.05; P.ch.pose("sitPhone");
  G.clock("4:04");
  await G.cutscene(async () => {
    G.shot([12.2, 1.55, 3.6], [10.3, 1.0, -0.2], 44);
    await G.fade(0, 0.8);
    G.audio.chainClick(0.2); G.audio.chainClick(0.75);
    G.caption("Two clicks in the car speaker", 3);
    await G.wait(1.6);
    await G.say([N("Outside, on his side of it, he hears two clicks in the car speaker.")]);
    G.audio.textBeep();
    await G.phone({ contact: "ARGJILA", date: "OCT 24", messages: [{ from: "them", text: "Don't follow me if I don't recognize you.", time: "4:04" }, { from: "them", text: "Whatever you do, don't let the clock reach 4:05.", time: "4:04" }] });
    G.audio.engineDie();
    G.caption("The engine dies");
    G._dome.on = false;
    await G.wait(1.2);
    await G.say([N("The engine dies. Outside, Brooklyn has emptied. Fog rolls down the road.")]);
    await G.fade(1, 1);
  });
  P.ch.pose(null);
  G.objective("FIND ARGJILA.");
}

// ============================================================
// CHAPTER 1 — THE STREET THAT REMEMBERS
// ============================================================
async function ch1(G) {
  const P = G.player;
  // ---- the sidewalk by the car ----
  await G.load(S.buildSidewalk);
  let W = G.world;
  G.pov("Rufki");
  G.state.place = "Ocean Parkway";
  G.clock("4:04");
  G.audio.ambience({ wind: 0.6, drone: 0.3, note: 41, traffic: 0, bright: 220 });
  G.music.play("fog", 2);
  // a fog plane far up the sidewalk: the next crossing disappears into it
  await G.fade(0, 1.5);
  G.objective("FIND ARGJILA.");
  G.caption("A telephone rings, somewhere ahead", 3);
  G.audio.ring(0.03);
  // the childhood photograph under the streetlamp
  await G.interactOnce({ pos: pin(W, "photo", 0.2), label: "SOMETHING UNDER THE LAMP", verb: "PICK UP", sparkle: true, use: async () => {
    P.ch.pose("crouch");
    await G.wait(0.5);
    await G.item({ title: "A CHILDHOOD PHOTOGRAPH", img: itemURL("childhood"), text: "Him, small, beside a girl whose face has been scratched out. On the back: You passed each other more times than you know." });
    G.give({ name: "Childhood photograph", prop: "photo", text: "You passed each other more times than you know." });
    P.ch.pose(null);
  } });
  G.objective("FOLLOW THE RINGING.");
  const [ex, ez] = at(W, "exit");
  await reach(G, ex, ez, 1.6);
  await G.fade(1, 1);

  // ---- the block that knows too much (3D) ----
  await G.load(S.buildStreet);
  W = G.world;
  await G.fade(0, 1);
  G.state.place = "the street that remembers";
  const ring = setInterval(() => G.mode === "play" && G.audio.ring(0.04), 3000);
  // the door number changes whenever he isn't looking
  let lastSeen = true, nIdx = 0;
  const nums = ["APT 1", "APT 2025", "APT 4:04", "APT 1", "APT 0"];
  W.every(() => {
    const d = G._numDoor;
    const seen = isWatched(P, d.position, 0.9);
    if (lastSeen && !seen) { nIdx = (nIdx + 1) % nums.length; relabel(d, nums[nIdx]); }
    lastSeen = seen;
  });
  W.interact({ pos: [-6.6, 1.6, 28], label: "APARTMENT DOOR", use: async () => { await G.say([N("The number on the door is not the number it was a second ago.")]); } });
  W.interact({ pos: [6.0, 1.8, 26], label: "STREET SIGN", verb: "READ", use: async () => { await G.say([N("The street signs show dates instead of names. OCT 24 2025. APR 4 2026.")]); } });
  G.objective("ANSWER THE PAYPHONE.");
  await G.interactOnce({ pos: [G._payphone[0], 1.4, G._payphone[1]], label: "PAYPHONE", verb: "ANSWER", use: async () => {
    clearInterval(ring);
    P.ch.pose("phone");
    G.audio.receiver(false);
    G.audio.staticBurst(0.8);
    await G.say([["line", "...", { fx: { vol: 0.5 } }], N("Static. Then, very far away, her voice again."), A("Then why can't you find me?", { fx: { vol: 0.6 } })]);
    G.audio.receiver(true);
    P.ch.pose(null);
  } });
  clearInterval(ring);
  await G.cutscene(async () => {
    G.shot([2, 2.4, 60], [8.6, 0.4, 68], 48);
    G.audio.breath(0.04);
    await G.say([N("The intersection divides. A warmly lit doorway on one side. On the other, a dark stairwell going down."), ["fakeA", "Rufki? I'm right here."], N("A woman's silhouette calls from below the stairs.")]);
    G.release();
  });
  G.objective("CHOOSE A WAY.");
  const loopBack = async () => {
    await G.fade(1, 0.8);
    P.place(0, 58, 0);
    await clockBack(G, "4:03");
    G.music.play("loop", 1);
    await G.fade(0, 0.8);
    await G.say([N("Either way brings him back to the same corner. But the clock now says 4:03."), N("Time is moving backward.")]);
  };
  await G.interactAny([
    { key: "home", pos: [-7.4, 1.4, 68], label: "THE WARM DOORWAY", verb: "ENTER", use: loopBack },
    { key: "stairs", pos: [8.2, 1, 66.4], label: "THE STAIRWELL", verb: "GO DOWN", use: loopBack },
  ]);
  // a familiar detail shows the way: two chain clicks mid-block
  await G.wait(0.8);
  G.audio.chainClick(0); G.audio.chainClick(0.5);
  G.caption("Two chain clicks, back down the block, on the right", 4);
  G.objective("FOLLOW THE SOUND.");
  await G.interactOnce({ pos: [6.4, 1.4, 50], label: "APT 1", verb: "OPEN", use: async () => { G.audio.door(); await G.fade(1, 0.8); } });

  // ---- the apartment, the television, the hallway ----
  await G.load(S.buildApartment);
  W = G.world;
  G.state.place = "an apartment";
  G.music.play("dread", 2);
  G.audio.ambience({ wind: 0, drone: 0.4, note: 44, bright: 180, verb: 0.4 });
  await G.fade(0, 1);
  await G.interactOnce({ pos: [-2.2, 1, 4.2], label: "THE TELEVISION", verb: "WATCH", use: async () => {
    G.shot([-0.8, 1.4, 2.2], [-2.2, 0.9, 4.6], 40);
    await G.say([N("On an old television, two children walk on opposite sides of a Brooklyn road."), N("Just before they might notice one another, the footage freezes.")]);
    G.audio.reverseTick();
    G._tv.freeze?.();
    await G.say([["keeper", "Some things are only meant to happen once."]]);
    G.release();
  } });
  const her = G.npc(Character, "argjila", 0, 40.4, Math.PI);
  G.objective("THE END OF THE HALL.");
  await reach(G, 0, 37.5, 1.6);
  await G.cutscene(async () => {
    P.frozen = true;
    G.shot([0.7, 1.6, 36.6], [0, 1.4, 40.4], 42);
    await G.say([R("Argjila!"), A("Do I know you?"), R("It's me. Rufki. You called me."), A("I'm sorry. I don't think we've met yet.")]);
    her.face(0);
    await G.wait(0.3);
    G.audio.door();
    await G.flicker(her, 0, 1);
    await G.say([N("She walks through the door. He follows.")]);
    P.frozen = false;
    await G.fade(1, 0.4, "#f4f0e8");
    G.audio.textBeep();
    await G.wait(0.6);
  });
  G.ui.setFade(1, "#f4f0e8");
  await G.say([["sys", "OCTOBER 24, 2025"]]);
}

// ============================================================
// CHAPTER 2 — THE GIRL AT THE HOUSE
// Argjila's side first: she waits, and the player only knows
// what she knew then.
// ============================================================
async function ch2(G) {
  const P = G.player;
  await G.load(S.buildHouseIn);
  let W = G.world;
  G.pov("Argjila");
  G.state.place = "the house";
  G.clock("4:04", "");
  G.ui.clock("OCT 24, 2025");
  G.music.play("waiting", 3);
  G.audio.ambience({ wind: 0.1, drone: 0.1, note: 52, traffic: 0.1, bright: 400, verb: 0.2 });
  await G.fade(0, 1.6, "#000");
  await G.say([N("October 24, 2025."), N("She is at the house, waiting for a boy named Rufki.")]);
  G.objective("WAIT.");
  // places to let the eye rest; nothing here tells her what to feel
  const focus = [
    { key: "window", pos: [-3.6, 1.6, 6.2], label: "THE WINDOW", use: () => G.say([N("The street outside. Leaves on the sidewalk. Nobody yet.")]) },
    { key: "clock", pos: [0, 1.8, 13.4], label: "THE KITCHEN CLOCK", use: () => G.say([N("The kitchen clock.")]) },
    { key: "phone", pos: [1.2, 1, 10.8], label: "YOUR PHONE", verb: "CHECK", use: () => G.phone({ contact: "", date: "OCT 24", messages: [{ from: "them", text: "No new messages.", time: "" }] }) },
    { key: "mirror", pos: [3.6, 1.5, 1.2], label: "THE PICTURE", use: () => G.say([N("A picture on the wall of somebody else's ordinary day.")]) },
    { key: "page", pos: [-1, 1, 9.4], label: "THE MINUTE BEFORE", verb: "REMEMBER", use: () => herPage(G, "before") },
  ];
  const seen = new Set();
  // the kitchen clock ticks only when she moves; stand still and someone upstairs keeps walking
  let still = 0, steps = 0, warned = false;
  W.onPlayerStep = () => { G.audio.tick(0.08); still = 0; };
  W.every((dt) => {
    if (!G.canMove()) return;
    if (P.speed < 0.1) still += dt; else still = 0;
    if (still > 2.6) {
      steps += dt;
      if (steps > 0.55) { steps = 0; G.audio.upstairs(0.6 - Math.random() * 1.2, 0.12); G.caption("Footsteps upstairs", 1.2); }
      if (!warned && still > 5) { warned = true; G.say([N("She is the only one home in this memory.")]); }
    }
  });
  while (seen.size < 3) seen.add(await G.interactAny(focus.filter((f) => !seen.has(f.key))));
  await G.wait(1.2);
  // the knock
  G.audio.knock();
  G.caption("Three knocks at the front door", 3);
  G.objective("LOOK THROUGH THE PEEPHOLE.");
  const visitor = G.npc(Character, "rufki", 0, -2.6, 0);
  visitor.pose(null);
  let answered = false;
  while (!answered) {
    await G.interactOnce({ pos: [0, 1.6, 0.6], label: "FRONT DOOR", verb: "PEEPHOLE", use: async () => {
      P.ch.pose("listen");
      G.ui.peep(true);
      G.shot([0, 1.62, 0.1], [0, 1.5, -2.6], 70);
      await G.say([N("In the peephole, Rufki is halfway up the steps. Both of his hands are in view.")]);
      G.audio.knock(0, 0.6);
      G.caption("Another knock. His hands haven't moved.", 3);
      G.audio.sting(true);
      await G.wait(1.2);
      G.ui.peep(false);
      G.release();
      await G.say([["visitor", "I know what you're afraid he'll say."], ["visitor", "I can tell him you changed your mind. Then you'd never have to find out."]]);
      const c = await G.choose("The thing at the door is waiting.", ["Let it answer for you", "Step back from the door"]);
      P.ch.pose(null);
      if (c === 0) {
        await G.say([["visitor", "Good. I'll tell him."]]);
        G.audio.chainClick(); G.audio.chainClick(0.4);
        await clockBack(G, "4:03");
        await G.fade(1, 0.6);
        P.place(0.5, 9.5, Math.PI);
        await G.fade(0, 0.8);
        await G.say([N("The kitchen again. The clock again. Something in the room is a minute behind."), N("Three knocks.")]);
        G.audio.knock();
        G.caption("Three knocks at the front door", 3);
      } else answered = true;
    } });
  }
  await G.fade(1, 0.8);

  // ---- Rufki outside: every house has the same number ----
  await G.handoff("Rufki", "Outside");
  await G.load(S.buildHouseOut);
  W = G.world;
  G.pov("Rufki");
  G.state.place = "the block";
  await G.fade(0, 1);
  await G.say([N("Every house on the block has the same number."), N("Through one window, a girl crosses the kitchen, doubles back, then stops to listen.")]);
  G.objective("FIND THE RIGHT DOOR. KNOCK WITH YOUR OWN HAND.");
  const houses = G._houses;
  let right = false;
  while (!right) {
    const k = await G.interactAny(houses.map((h, i) => ({ key: i, pos: [-7.6, 1.6, h.z], label: "11", verb: "KNOCK", r: 1.8 })));
    P.ch.pose("knock");
    G.audio.knock();
    await G.wait(0.8);
    P.ch.pose(null);
    if (k === 3) right = true;
    else {
      await G.wait(0.5);
      G.audio.knock(0, 0.35);
      G.caption("Something on the other side knocks back", 3);
      G.audio.sting(true);
      await G.wait(0.6);
    }
  }
  // her side: the knock and his hand falling at the same instant
  await G.handoff("Argjila", "The knock");
  await G.load(S.buildHouseIn);
  W = G.world;
  G.pov("Argjila");
  P.place(0, 1.4, Math.PI);
  G.npc(Character, "rufki", 0, -2.6, 0);
  await G.fade(0, 0.6);
  G.audio.knock();
  G.caption("Three knocks", 2);
  await G.cutscene(async () => {
    G.ui.peep(true);
    G.shot([0, 1.62, 0.1], [0, 1.5, -2.6], 70);
    await G.say([N("This time she hears the knock and sees his hand fall at the same instant.")]);
    G.ui.peep(false);
    G.release();
  });
  await G.choose("", ["Open the door"]);
  G.audio.chainClick();
  G.audio.door();
  await G.fade(1, 1.2, "#f4f0e8");
  G.music.play("memory", 2);
  grade(1, 1, 1, 1);
  await herPage(G, "first");
  await G.lines(["The door opens.", "What happens next is theirs."], { hold: 4 });

  // ---- the double, the photographs, the Unmet ----
  await G.load(S.buildGallery);
  W = G.world;
  G.pov("Rufki");
  G.state.place = "a room full of photographs";
  G.music.play("dread", 2);
  G.audio.ambience({ wind: 0, drone: 0.5, note: 41, bright: 160, verb: 0.5 });
  await G.fade(0, 1);
  await G.say([N("The memory plays correctly. In the background, a second Rufki stands very still. He follows him into a room full of photographs.")]);
  G.objective("LOOK AT THE PHOTOGRAPHS.");
  const ph = [[1.6, 12, "pass", "THEY PASS WITHOUT SPEAKING"], [-1.6, 20, "never", "ARGJILA NEVER ARRIVES"], [1.6, 28, "alone", "RUFKI STANDS ALONE"]];
  ph.forEach(([x, z, k, t]) => W.interact({ pos: [x, 1.6, z], label: t, verb: "LOOK", r: 1.5, use: () => G.item({ title: "A DIFFERENT FIRST ENCOUNTER", canvas: pic(k), text: t.charAt(0) + t.slice(1).toLowerCase() + "." }) }));
  W.interact({ pos: [-1.6, 1.6, 2.2], label: "THE REAL ONE", verb: "LOOK", r: 1.5, use: () => G.item({ title: "OCTOBER 24, 2025", canvas: pic("meeting"), text: "The real one." }) });
  const dbl = new SpriteActor("other", { emissive: 0.1 });
  dbl.setPos(0, 0, 35).face(Math.PI);
  W.addActor(dbl);
  await reach(G, 0, 31, 2.2);
  await G.cutscene(async () => {
    G.shot([0.9, 1.6, 29.5], [0, 1.6, 35], 42);
    await G.wait(0.6);
    G.audio.heartbeat();
    await G.say([N("Under the last photograph: WHAT IF SHE NEVER CAME?"), N("The double turns. Its face is blank."), ["other", "You know how easily this could have never happened?"]]);
    await G.flicker(dbl, 0, 0.8);
    G.release();
  });
  // the Unmet approaches whenever it is not being watched
  const un = new SpriteActor("unmet", { emissive: 0.05, sway: 0.04 });
  un.setPos(0, 0, 41).face(Math.PI);
  W.addActor(un);
  G.audio.sting();
  G.rig.shake = 0.08;
  G.music.play("chase", 0.5);
  await G.say([N("Something steps out of the last photograph. It has never been met, and it wants to be.")]);
  G.objective("KEEP YOUR EYES ON IT. BACK AWAY TO THE REAL PHOTOGRAPH.");
  G.ui.toast("TIP: WALK BACKWARD. RUNNING TURNS YOUR BACK.", 5);
  P.faceTarget = un.root.position;
  const stop = stalker(G, un, { speed: 5, lights: G._galLights, onCatch: async () => {
    await G.cutscene(async () => {
      G.audio.hit();
      addTint(0.5, 0.5, 0.5); await G.wait(0.1); addTint();
      await G.fade(1, 0.3);
      await G.say([N("It reaches him. For a moment he cannot remember her name.")]);
      P.place(0, 27, 0);
      un.setPos(0, 0, 41);
      await G.fade(0, 0.6);
    });
  } });
  await reach(G, 0, 3, 1.6);
  stop();
  P.faceTarget = null;
  await G.cutscene(async () => {
    G.shot([1.2, 1.8, 1.2], [0, 1.4, 8], 50);
    G.music.play("dread", 1);
    await G.say([N("His back touches the real photograph. The Unmet stops.")]);
    await G.flicker(un, 0, 1.5);
    await G.say([["unmet", "There's more than one way this story ends."]]);
    G.audio.tick(0.25);
    G.clock("4:04:01");
    await G.say([N("The clock advances one second.")]);
    await G.fade(1, 1.5);
  });
}

// ============================================================
// CHAPTER 3 — THE HOUSE OF ALMOST
// ============================================================
async function ch3(G) {
  const P = G.player;
  await G.load(S.buildBalcony);
  let W = G.world;
  G.pov("Rufki");
  G.state.place = "the House of Almost";
  G.clock("4:04:01");
  G.music.play("dread", 2);
  G.audio.ambience({ wind: 0.4, drone: 0.35, note: 38, bright: 200, verb: 0.5 });
  await G.fade(0, 1.5);
  await G.say([N("He wakes in an immense apartment building over Ocean Parkway. Every window shows a different year."), N("The House of Almost holds every moment they were physically near each other and still strangers.")]);
  G.objective("GO INSIDE.");
  await G.interactOnce({ pos: pin(W, "door", 1.4), label: "THE DOOR", verb: "OPEN", use: async () => { G.audio.door(); await G.fade(1, 0.8); } });

  await G.load(S.buildAlmostHall);
  W = G.world;
  await G.fade(0, 1);
  G.objective("WALK THROUGH THE NEAR MISSES. A NOTE ON THE FAR DOOR.");
  let interfered = false;
  const kids = {
    sidewalks: [[8, 8, 0], [8, 12, Math.PI]],
    corner: [[7, 20.5, 0], [12.5, 23.5, -Math.PI / 2]],
    school: [[6, 32, 0], [11, 36, Math.PI]],
  };
  const rooms = {};
  for (const r of S.ALMOST) {
    const [a, b] = kids[r.id];
    const kr = new SpriteActor("kidR"); kr.setPos(a[0], 0, a[1]).face(a[2]); W.addActor(kr);
    const ka = new SpriteActor("kidA"); ka.setPos(b[0], 0, b[1]).face(b[2]); W.addActor(ka);
    rooms[r.id] = { kr, ka };
    W.interact({ pos: [b[0], 1, b[1]], label: "THE GIRL", verb: "APPROACH", r: 1.8, use: async () => {
      const c = await G.choose(`${r.name}, ${r.year}. She has not seen him. The boy is right there.`, ["Call out to them", "Let the moment pass"]);
      if (c === 0) {
        interfered = true;
        G.flag("interfered");
        G.audio.sting();
        G.glitch(1);
        await G.say([N("A child turns and sees him. The building fractures.")]);
        await G.flicker(ka, 0, 0.6);
        G.glitch(0);
      } else {
        await G.say([N("He lets it pass. They walk on, a few steps apart, the way it happened.")]);
        G.us();
      }
    } });
  }
  W.interact({ pos: [0, 1.6, 44.6], label: "THE NOTE", verb: "READ", use: () => G.say([N("DO NOT MAKE THEM MEET.")]) });
  if (G.state.flags.ngplus) {
    // New Game+: the photograph can be examined from both sides
    W.interact({ pos: [-1.5, 1.2, 40], label: "THE PHOTOGRAPH (FRONT)", use: async () => { await G.item({ title: "THE PHOTOGRAPH", img: itemURL("childhood"), text: "Two children at a crossing. Neither has seen the other yet." }); G.flag("photoFront"); } });
    W.interact({ pos: [-1.5, 1.2, 42], label: "THE PHOTOGRAPH (BACK)", use: async () => { await G.say([N("On the back, in pencil: 4:05.")]); G.flag("photoBack"); } });
  }
  await reach(G, 0, 43.5, 1.6);
  await G.cutscene(async () => {
    G.shot([1.2, 1.7, 41], [0, 1.4, 45], 46);
    if (interfered) {
      G.audio.rumble(2);
      const dbl = new SpriteActor("other"); dbl.setPos(0.4, 0, 44.4).face(Math.PI); W.addActor(dbl);
      await G.say([N("A photograph changes. A person disappears from a later scene. The 2025 meeting replays without her."), ["other", "You wanted more time with her. So I gave you a world where you met earlier."], R("Where is she?"), ["other", "Somewhere you never learned to love."]]);
      await G.flicker(dbl, 0, 1);
    }
    await G.say([N("The missed connections weren't a broken past. They were how the two of them became the people who eventually found each other."), N("The past isn't fixed by a better one. Each moment has to go back in its true order.")]);
  });
  // restore the order: earliest first
  const years = [["2009", "THE SCHOOL CORRIDOR"], ["2013", "OPPOSITE SIDEWALKS"], ["2019", "THE MISSED CORNER"]];
  let ok = false;
  while (!ok) {
    const pick = [];
    let pool = [...years];
    for (let i = 0; i < 3; i++) {
      const c = await G.choose(`Hang the moments back in order (${i + 1} of 3).`, pool.map(([y, n]) => n), { title: "THE TRUE ORDER" });
      pick.push(pool[c][0]);
      pool.splice(c, 1);
    }
    ok = pick.join() === "2009,2013,2019";
    if (!ok) { await clockBack(G, "4:03"); await G.say([N("The frames slide crooked. Try again.")]); }
  }
  G.audio.repair();
  G.clock("4:04:01");
  const child = new SpriteActor("kidA"); const [cx, cz] = [0.6, 44.2];
  child.setPos(cx, 0, cz).face(Math.PI); W.addActor(child);
  await G.cutscene(async () => {
    await G.say([["kidA", "Was it worth waiting?"], R("Every second.")]);
    await G.fade(1, 1);
  });
  // the reveal Argjila asked for: the opening means something different now
  G.music.play("memory", 2);
  await G.item({ title: "OCEAN PARKWAY", canvas: minuteMap(), text: "Two dots on the same boulevard." });
  await G.say([HER("We once lived about a minute away from each other on Ocean Parkway, and for all that time we were just two people living our separate lives."), HER("One minute. That is literally nothing."), HER("The part that gets me isn't that we were a minute apart. It's that we could have kept being a minute apart forever and never become us.")]);
  G.give({ name: "The minute map", img: null, text: "About a minute apart on Ocean Parkway." });
}

// ============================================================
// CHAPTER 4 — WHEN YOU WERE AWAY (Argjila, Nov 2025 – Feb 2026)
// Built only from what she shared. No invented messages.
// ============================================================
async function ch4(G) {
  const P = G.player;
  await G.load((W) => S.buildBedroom(W, G, { tone: "night" }));
  const W = G.world;
  G.pov("Argjila");
  G.state.place = "her room";
  grade(1.08, 0.96, 0.9);
  G.ui.clock("NOV 2025");
  G.music.play("waiting", 2);
  G.audio.ambience({ wind: 0.15, drone: 0.08, note: 55, traffic: 0.1, bright: 380 });
  await G.fade(0, 1.2);
  await G.say([HER("The beginning was not just big declarations. It was the stupid, sweet little things that somehow stayed with me.")]);
  G.objective("OPEN AN OLD MESSAGE.");
  await G.interactOnce({ pos: pin(W, "desk", 1), label: "YOUR PHONE", verb: "OPEN", use: async () => {
    P.ch.pose("phone");
    const r = await G.phone({ contact: "RUFKI", date: "NOV 2025", messages: [{ from: "them", text: "[ a photo: he is showing you his biceps ]", time: "Nov" }], replies: ["I blame you for my addiction."] });
    if (r === 0) G.us();
    P.ch.pose(null);
  } });
  await G.say([HER("I love that this is the sort of detail I remember. Not some grand scene. Just you being you and me getting attached to the little things.")]);
  await G.interactOnce({ pos: pin(W, "bedside", 1), label: "YOUR PHONE", verb: "TEXT HIM", use: async () => {
    P.ch.pose("phone");
    await G.phone({ contact: "RUFKI", date: "LATE 2025", messages: [], replies: ["I just want huggless"], closeLabel: "Put the phone down" });
    P.ch.pose(null);
  } });
  await G.say([HER("You were becoming somebody I looked for, somebody I wanted to tell things to, somebody whose messages could change the feeling of a day.")]);
  await G.interactOnce({ pos: pin(W, "dresser", 1.2), label: "WHEN I KNEW", verb: "REMEMBER", use: () => herPage(G, "realized") });
  // December: the distance
  await G.fade(1, 1);
  G.ui.clock("DEC 2025");
  grade(0.8, 0.86, 1.05);
  G.music.play("sorrow", 2);
  await G.fade(0, 1);
  await G.say([N("December. He goes away, and he will be gone until around the middle of February.")]);
  // the winter confidante: a quiet listening beat
  const [fx, fz] = at(W, "chair");
  const friend = new SpriteActor("confidante", { sitting: true }); friend.setPos(fx, 0, fz).face(Math.PI / 2); W.addActor(friend);
  await G.cutscene(async () => {
    await G.say([N("That winter she tells one of her best friends how much she likes Rufki."), N("Her friend lets her finish.")]);
    await G.wait(3.5);
    await G.flicker(friend, 0, 1.4);
  });
  let waited = 0;
  while (waited < 2) {
    const c = await G.choose("The phone is in her hand.", ["Revisit a message", "Close the phone and wait"]);
    if (c === 0) {
      await G.phone({ contact: "RUFKI", date: "JAN 2026", messages: [{ from: "them", text: "▒▒▒ ▒▒▒▒ ▒▒▒▒ ▒▒▒", time: "" }, { from: "me", text: "▒▒▒▒ ▒▒▒ ▒▒", time: "" }, { from: "them", text: "▒▒▒▒▒ ▒▒ ▒▒▒", time: "" }] });
      await G.say([HER("We said we missed each other. We talked about wishing the other person were there and about seeing each other again.")]);
    } else {
      waited++;
      G.ui.clock(waited === 1 ? "JAN 2026" : "FEB 2026");
      G.audio.page();
      await G.say([waited === 1 ? HER("For me, falling for somebody was not only about being next to them. It was also about realizing that I missed their presence when it was not there.") : N("Weeks pass the way they pass.")]);
    }
  }
  G.ui.clock("FEB 3, 2026");
  G.audio.textBeep();
  await G.phone({ contact: "RUFKI", date: "FEB 3", messages: [{ from: "them", text: "[ he asks you to be his Valentine ]", time: "Feb 3" }] });
  await G.say([HER("I want you to know that I count those things.")]);
  // something doesn't belong in this memory
  G.audio.textBeep();
  G.caption("A call from an unknown number", 2.5);
  await G.wait(0.6);
  const ans = await G.choose("UNKNOWN NUMBER · 4:04", ["Answer", "Let it ring"]);
  if (ans === 0) { G.audio.staticBurst(0.6); await G.say([["fakeA", "Do you have a minute?"], N("It is her own voice. Then the line is empty.")]); G.flag("heardCopy"); }
  else await G.say([N("It rings until it doesn't.")]);
  G.ui.clock("FEB 15, 2026");
  grade(1.06, 0.98, 0.9);
  G.music.play("waiting", 2);
  await G.say([N("Around February 15, he comes back.")]);
  await herPage(G, "reunion");
  await G.say([HER("I know the difference between someone I merely talk to and someone I am actually looking forward to having back in my world. With you, that difference mattered.")]);
  await G.fade(1, 1.2);
}

// ============================================================
// CHAPTER 5 — WATER UNDER THE DOOR (April 4, 2026)
// ============================================================
async function ch5(G) {
  const P = G.player;
  const enter = async (pov, spot) => {
    await G.load(S.buildBathhouse);
    G.pov(pov);
    G.placeAt(spot);
    G.state.place = "the Williamsburg Bathhouse";
    G.ui.clock("APR 4, 2026");
    return G.world;
  };
  let W = await enter("Rufki", "start");
  G.music.play("memory", 2);
  G.audio.ambience({ wind: 0, drone: 0.15, note: 49, water: 0.5, bright: 500, verb: 0.6 });
  const drips = setInterval(() => G.mode === "play" && G.audio.drip(Math.random() * 2 - 1), 1700);
  // Argjila sits on the far deck; in the water, her reflection is already leaving
  const [ax, az] = at(W, "her");
  const her = G.npc(Character, "argjila", ax, az, Math.PI);
  her.pose("sit");
  const [rx0, rz0] = at(W, "reflection");
  const refl = new Character("doubleA");
  refl.root.scale.y = -1;
  refl.setPos(rx0, -0.5, rz0).face(Math.PI);
  W.add(refl.root);
  G.idle(refl);
  G.steam(3);
  await G.fade(0, 1.6);
  await G.still("roof", { hold: 6, text: "April 4, 2026. Up on the roof, steam rises off the water into the cold." });
  await G.say([N("Argjila is sitting beside the pool, on the night they become official."), N("In the reflection, she is already getting up to leave.")]);
  await G.tween(2.5, (k) => G.steam(3 * (1 - k)));
  G.steam(0);
  const [re, rze] = at(W, "reflectionEnd");
  G.walkTo(refl, re, rze, 0.9);
  G.objective("FOLLOW THE REFLECTION?");
  const c = await G.interactAny([
    { key: "follow", pos: pin(W, "edgeNear", 0.3), label: "THE REFLECTION", verb: "FOLLOW", r: 1.8 },
    { key: "her", pos: [ax, 1, az], label: "ARGJILA", verb: "GO TO HER", r: 2.5 },
  ]);
  if (c === "follow") {
    G.audio.splash();
    G.caption("A splash", 1.6);
    await G.fade(1, 0.4);
    await G.load(S.buildChanging);
    await G.fade(0, 0.6);
    G.audio.slap();
    G.caption("Wet footsteps. Nobody here.", 2.4);
    await G.say([N("He splashes into an empty changing room. Her real voice is still coming from behind him."), A("Rufki?", { fx: { vol: 0.6 } })]);
    await G.fade(1, 0.6);
    W = await enter("Rufki", "start");
    const h2 = G.npc(Character, "argjila", ax, az, Math.PI); h2.pose("sit");
    await G.fade(0, 0.6);
  }
  // ---- her side ----
  await G.fade(1, 0.6);
  await G.handoff("Argjila", "The same night, from the other side of the pool");
  W = await enter("Argjila", "argStart");
  const [hx, hz] = at(W, "rufkiFar");
  const him = G.npc(Character, "rufki", hx, hz, Math.PI);
  await G.fade(0, 0.8);
  await G.say([N("From her side, she sees him turn away."), N("The room has given her a towel with one word stitched into it.")]);
  G.objective("THE TOWEL.");
  const [tx, tz] = at(W, "towel");
  let carried = 0;
  while (true) {
    await G.interactOnce({ pos: [tx, 0.6, tz], label: "TOWEL", verb: carried ? "PICK IT UP AGAIN" : "PICK UP", r: 1.6, use: async () => {
      await G.item({ title: "THE TOWEL", prop: "towel", text: "FINE." });
    } });
    carried++;
    G.glitch(1);
    G.audio.whoosh();
    G.caption("The exit is farther away", 2.4);
    // the room stretches: a slow dolly-zoom away from the exit
    const f0 = G.rig.cfg.fov || 55;
    await G.tween(0.8, (k) => G.rig.set({ fov: f0 + 9 * k }));
    G.glitch(0);
    const k = await G.choose("The towel says FINE.", ["Keep holding it", "Set it down"]);
    if (k === 1) break;
  }
  G.rig.set({ fov: 55 });
  G.give({ name: "Towel marked FINE", prop: "towel", text: "Set down." });
  await G.cutscene(async () => {
    G.zoom(1.8, P.ch);
    await G.say([A("I was still talking.")]);
    G.zoom(1);
  });
  // ---- Rufki sits back on the tile and hears the end of her sentence ----
  await G.fade(1, 0.5);
  await G.handoff("Rufki", "Sit back down");
  W = await enter("Rufki", "tileHim");
  const [ax2, az2] = at(W, "tileHer");
  const her2 = G.npc(Character, "argjila", ax2, az2, Math.PI);
  P.place(...at(W, "edgeNear"), 0);
  await G.fade(0, 0.8);
  G.objective("SIT WITH HER.");
  await G.interactOnce({ pos: [ax2, 0.6, az2], label: "THE TILE BESIDE HER", verb: "SIT", r: 2.2, use: async () => {
    P.place(...at(W, "tileHim"), Math.PI);
    P.ghost = true;
    P.ch.pose("sit");
    her2.pose("sit");
    G.zoom(1.6, her2, 0.5);
    await G.say([N("He sits back on the tile. This time he hears the end of her sentence."), HER("You were not just the guy I liked anymore."), HER("It felt like the natural next step in something we were already building.")]);
    G.zoom(1);
  } });
  // the label changes
  await G.lines(["GETTING TO KNOW YOU"], { hold: 1.6 });
  G.audio.repair();
  await G.lines(["MY BOYFRIEND"], { hold: 2.6, cls: "warm" });
  await G.say([HER("Mine includes what it meant to be able to say “my boyfriend” and know I meant you.")]);
  P.ch.pose(null);
  P.ghost = false;
  // the photographs under the water
  G.objective("LIFT THE PHOTOGRAPHS FROM THE POOL. ONE AT A TIME.");
  const photos = [
    ["couple", "APRIL 4, 2026", "Official.", "rooftop"],
    ["iloveyou", "“I LOVE YOU”", "Said out loud."],
    ["families", "APRIL 15, 2026", "Dinner with his parents. It went well.", "dinner"],
    ["ordinary", "THE ORDINARY DAYS", "All the days in between."],
  ];
  let dark = 1;
  for (const [i, [kind, title, text, img]] of photos.entries()) {
    const [px, pz] = at(W, "photo" + i);
    await G.interactOnce({ pos: [px, 0.2, pz], label: "SOMETHING UNDER THE WATER", verb: "LIFT", r: 1.5, sparkle: true, use: async () => {
      P.ch.pose("crouch");
      G.audio.splash();
      await G.wait(0.4);
      await G.item({ title, ...(img ? { img: itemURL(img) } : { canvas: pic(kind) }), text });
      dark -= 0.12;
      G.U.uTint.value.setRGB(dark, dark, dark * 1.05);
      P.ch.pose(null);
    } });
  }
  await G.interactOnce({ pos: pin(W, "bottom", 0.2), label: "THE BOTTOM OF THE POOL", verb: "REACH", r: 1.8, sparkle: true, use: async () => {
    P.ch.pose("crouch");
    await G.item({ title: "AT THE BOTTOM", img: itemURL("ringhouse"), text: "A ring, beside a picture of a house that doesn't exist yet. Two small figures stand next to the couple. Their faces are blurred." });
    P.ch.pose(null);
  } });
  await G.cutscene(async () => {
    await G.flicker(her2, 0, 1.2);
    clearInterval(drips);
    await G.say([N("When he looks up, she is gone. Her voice carries across the roof."), A("Don't search for a future if you forget how we got here.", { fx: { vol: 0.8 } })]);
    G.audio.rumble(2.5);
    G.caption("The pool drains", 2.5);
    G.shot([7, 4.5, -2], [0, -1, 6], 50);
    await G.tween(2.6, (k) => { G._water.position.y = -0.25 - k * 1.5; G.U.uTint.value.setRGB(dark * (1 - k * 0.4), dark * (1 - k * 0.35), dark * (1 - k * 0.25)); });
    G._water.visible = false;
    G._bathDoor.visible = true;
    G.audio.door();
    await G.say([N("The pool drains completely. At the edge of the roof stands a door that was not there before: THE THINGS WE NEVER SAID.")]);
    G.release();
  });
  G.flag("receiver");
  await G.item({ title: "AN OPEN LINE", prop: "rotary", text: "From now on he can set the receiver down without hanging up. She chooses when to speak into it." });
  G.give({ name: "Open receiver", prop: "rotary", text: "Leave the line open. Let her choose when to speak." });
  grade();
  await G.fade(1, 1.2);
}

// ============================================================
// Chapter registry (one shared save; ids match game_data.json)
// ============================================================
export const CHAPTERS = [
  { id: "ocean", name: "4:04", date: "October 24, 2026", pov: "RUFKI + ARGJILA", bg: "ocean", clock: "4:04", tip: "Every audio cue has a caption. Two clicks mean somebody on the other side heard you.", run: prologue },
  { id: "street", name: "The Street That Remembers", date: "October 24, 2026", pov: "RUFKI", bg: "ocean", tip: "At a wrong turn the clocks run backward. A familiar sound shows the way back.", run: ch1 },
  { id: "house", name: "The Girl at the House", date: "October 24, 2025", pov: "ARGJILA + RUFKI", bg: "hallway", clock: "OCT 24", tip: "The Unmet only moves when you are not looking at it. Walk backward. Don't run.", run: ch2 },
  { id: "almost", name: "The House of Almost", date: "Before 2025", pov: "RUFKI", bg: "almost", tip: "Some near misses are how two people become the ones who find each other.", run: ch3 },
  { id: "away", name: "When You Were Away", date: "November 2025 – February 2026", pov: "ARGJILA", bg: "bedroom", clock: "NOV 2025", tip: "Some pages stay blank until the person who lived them writes them.", run: ch4 },
  { id: "bathhouse", name: "Water Under the Door", date: "April 4, 2026", pov: "RUFKI + ARGJILA", bg: "bathhouse", clock: "APR 4", tip: "Listen to the end of the sentence before you answer.", run: ch5 },
  { id: "dance", name: "One More Turn", date: "May 2026", pov: "ARGJILA + RUFKI", bg: "dance", clock: "MAY", tip: "The double never misses a beat. That is how you know.", run: CH6 },
  { id: "return", name: "The Day We Came Back", date: "May 2026", pov: "RUFKI + ARGJILA", bg: "car", clock: "MAY", tip: "If the odometer doesn't move, neither are you.", run: CH7 },
  { id: "park", name: "The Park Near Target", date: "2026", pov: "RUFKI + ARGJILA", bg: "park", tip: "There is no timer. Hold on as long as you want.", run: CH8 },
  { id: "keepsakes", name: "Room to Be Me", date: "Summer – October 2026", pov: "ARGJILA", bg: "bedroom", clock: "OCT 4", tip: "Quiet doesn't mean small.", run: CH9 },
  { id: "waterfront", name: "The Quiet Days", date: "Summer 2026", pov: "ARGJILA + RUFKI", bg: "waterfront", clock: "SUMMER", tip: "A payphone that rings after you pass it is optional. So is everything it shows you.", run: CH10 },
  { id: "unread", name: "The Unread Room", date: "Secret", pov: "ARGJILA", bg: "unread", optional: true, tip: "Match her pose. Then hang up and leave.", run: CH11 },
  { id: "unsaid", name: "The Unsaid", date: "Nowhere", pov: "RUFKI + ARGJILA", bg: "cords", tip: "The true line hums. Let her choose the words that go down it.", run: CH12 },
  { id: "empty", name: "The World Without Her", date: "October 2026", pov: "RUFKI", bg: "bedroom", tip: "Everyone knows Rufki. Nobody knows her.", run: CH13 },
  { id: "tower", name: "The Clock Tower", date: "4:04:56", pov: "RUFKI + ARGJILA", bg: "tower", clock: "4:04:56", tip: "The elevator returns you to unfinished memories.", run: CH14 },
  { id: "crossing", name: "One Minute Away", date: "4:04:59", pov: "RUFKI + ARGJILA", bg: "ocean", clock: "4:04:59", tip: "Warm light and two clicks: the real way. Blue light and a backward tick: the trap.", run: CH15 },
];
