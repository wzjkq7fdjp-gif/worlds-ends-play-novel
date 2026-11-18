// ============================================================
// Chapters 6–15, the five endings, post-credits, title scene.
// ============================================================
import { THREE, U, mat, TEX, boxGeo } from "./ps1.js";
import { Character, SpriteActor, makeKeeper } from "./actors.js";
import { isWatched } from "./world.js";
import { pic } from "./art.js";
import { propURL } from "./assets.js";
import * as S from "./scenes.js";
import { R, A, N, HER, pin, fl, toCam, herPage, grade, addTint, clockBack, reach, zone } from "./story.js";

export const buildTitle = S.buildTitle;
const idx = (G, id) => G.CHAPTERS.findIndex((c) => c.id === id);
// when a memory was revisited from the tower elevator, go back up
const backToTower = (G) => { if (G.state.flags.fromTower) { G.state.flags.fromTower = false; return { jump: idx(G, "tower") }; } return null; };

// ------------------------------------------------------------
// Small modal mini-games (driven by the shared input)
// ------------------------------------------------------------
function modal(G, html, update) {
  return G.guard(new Promise((res) => {
    const el = document.createElement("div");
    el.className = "mini";
    el.innerHTML = html;
    const m = { el, update: (dt, input) => update(dt, input, el, (v) => { G.ui.pop(m); res(v); }) };
    G.ui.push(m);
  }));
}
// press ✕ at the cue times; returns { hits, misses, stray }
function cueGame(G, { cues, window = 0.32, title = "", hint = "" }) {
  if (G.debug.auto) return Promise.resolve({ hits: cues.length, misses: 0, stray: 0 });
  let t = 0, i = 0, hits = 0, misses = 0, stray = 0;
  const end = cues[cues.length - 1] + 1.2;
  return modal(G, `<div class="mtitle2">${title}</div><div class="ring"><i></i></div><div class="mh">${hint}</div>`, (dt, input, el, done) => {
    t += dt;
    const next = cues[i];
    const ring = el.querySelector(".ring i");
    if (next != null) {
      const k = Math.max(0, Math.min(1, (next - t) / 1.2));
      ring.style.transform = `scale(${1 + k * 2.2})`;
      ring.style.opacity = k < 1 ? 1 : 0.2;
      if (t > next + window) { misses++; i++; G.audio.cancel(); el.classList.add("miss"); setTimeout(() => el.classList.remove("miss"), 200); }
    }
    if (input.pressed("x")) {
      if (next != null && Math.abs(t - next) <= window) { hits++; i++; G.audio.chainClick(); el.classList.add("hit"); setTimeout(() => el.classList.remove("hit"), 200); }
      else { stray++; G.audio.reverseTick(); }
    }
    if (t > end || i >= cues.length && t > (cues[cues.length - 1] || 0) + 0.4) done({ hits, misses, stray });
  });
}
// press a direction before the fork passes
function dirGame(G, want, time = 2.6) {
  if (G.debug.auto) return Promise.resolve(true);
  let t = 0;
  return modal(G, `<div class="mtitle2">THE FORK</div><div class="arrows"><b>◀</b><b>▲</b><b>▶</b></div><div class="mh">Follow her directions.</div>`, (dt, input, el, done) => {
    t += dt;
    const I = input;
    const d = I.pressed("left") || I.stick.x < -0.7 ? "left" : I.pressed("right") || I.stick.x > 0.7 ? "right" : I.pressed("up") || I.stick.y > 0.7 ? "up" : null;
    if (d) { G.audio.move(); done(d === want); }
    else if (t > time) done(false);
  });
}
// slide the paper map until its drawn mirror lines up with the real one
function mapAlign(G) {
  if (G.debug.auto) return Promise.resolve(true);
  let x = -60, y = 40;
  const tx = 0, ty = 0;
  return modal(G, `<div class="mtitle2">HOLD THE MAP AGAINST THE GLASS</div><div class="glass"><div class="target"></div><img class="map" src="${propURL("map")}"></div><div class="mh">Move the map. Line the drawn mirror up with the real one. ✕ to hold it there.</div>`, (dt, input, el, done) => {
    x += input.stick.x * dt * 70;
    y -= input.stick.y * dt * 70;
    x = Math.max(-90, Math.min(90, x)); y = Math.max(-60, Math.min(60, y));
    const img = el.querySelector(".map");
    img.style.transform = `translate(calc(var(--u) * ${x}), calc(var(--u) * ${y}))`;
    const close = Math.hypot(x - tx, y - ty) < 9;
    el.querySelector(".target").classList.toggle("ok", close);
    if (input.pressed("x")) { if (close) done(true); else G.audio.cancel(); }
  });
}
// hold still: any button press before the time is up fails
function stillGame(G, sec, label) {
  if (G.debug.auto) return Promise.resolve(true);
  let t = 0;
  return modal(G, `<div class="mtitle2">${label}</div><div class="bar"><i></i></div><div class="mh">Don't touch anything.</div>`, (dt, input, el, done) => {
    t += dt;
    el.querySelector(".bar i").style.width = Math.min(100, (t / sec) * 100) + "%";
    if (input.pressed("x") || input.pressed("o") || Math.hypot(input.stick.x, input.stick.y) > 0.5) done(false);
    else if (t >= sec) done(true);
  });
}
// a humming voice in the right ear, one beat ahead
function hum(G, beats = 8, bpm = 96) {
  const A = G.audio;
  if (!A.ctx) return;
  const notes = [71, 69, 66, 64, 66, 69, 71, 73];
  const dest = A.pan(0.95);
  for (let i = 0; i < beats; i++) {
    const f = 440 * Math.pow(2, (notes[i % notes.length] - 69) / 12);
    A.tone(f, 0.5, "triangle", 0.03, i * (60 / bpm) - 0.15, dest);
    A.tone(f * 2, 0.4, "sine", 0.008, i * (60 / bpm) - 0.15, dest);
  }
}
// trade places with an NPC without moving either character (POV switch)
function swapPOV(G, npc, name) {
  const P = G.player;
  const mine = { x: P.pos.x, z: P.pos.z, yaw: P.yaw, preset: P.ch.preset, pose: P.ch.poseName };
  const theirs = { x: npc.root.position.x, z: npc.root.position.z, yaw: npc.yaw, pose: npc.poseName };
  G.world.scene.remove(npc.root);
  G.pov(name);
  P.place(theirs.x, theirs.z, theirs.yaw);
  P.ch.pose(theirs.pose);
  const other = G.npc(Character, mine.preset, mine.x, mine.z, mine.yaw);
  other.pose(mine.pose);
  return other;
}

// ============================================================
// CHAPTER 6 — ONE MORE TURN (May 2026)
// ============================================================
export async function CH6(G) {
  const P = G.player;
  // the kitchen, around May 9 — kept for her to tell
  await G.load((W) => { S.paint(W, G, "hallway", { env: { ambient: [0.62, 0.5, 0.38] } }); return { start: [[230, 300], 0, 0] }; });
  let W = G.world;
  G.pov("Argjila");
  G.state.place = "May";
  G.ui.clock("MAY 9, 2026");
  G.music.play("memory", 2);
  G.audio.ambience({ wind: 0, drone: 0.1, note: 52, bright: 400 });
  await G.fade(0, 1.2);
  await G.say([N("Around May 9 there is a moment in a kitchen that the two of them call a confession.")]);
  await G.interactOnce({ pos: pin(W, 250, 230, 1.2), label: "THE KITCHEN DOOR", verb: "REMEMBER", r: 1.8, use: () => herPage(G, "kitchen") });
  await G.say([N("Some scenes matter too much to fake.")]);
  await G.fade(1, 1);

  // ---- the dance (her side) ----
  await G.load((W2) => { S.paint(W2, G, "dance"); return { start: [[150, 262], 0, 0] }; });
  W = G.world;
  G.pov("Argjila");
  G.state.place = "the May dance";
  G.ui.clock("MAY 2026");
  const center = fl(W, 165, 252);
  const him = G.npc(Character, "rufki", center[0], center[1] + 0.9, Math.PI);
  P.place(center[0], center[1] - 0.1, 0);
  P.ch.pose("dance");
  him.pose("dance");
  // the other couple at the edge, completing her moves a little early
  const [ox, oz] = fl(W, 270, 222);
  const d1 = new SpriteActor("dancer"); d1.setPos(ox, 0, oz).face(0); W.addActor(d1);
  const d2 = new Character("doubleR"); d2.setPos(ox + 0.8, 0, oz + 0.2); d2.pose("dance"); d2.early = 0.6; W.add(d2.root); G.idle(d2);
  W.every(() => { const w = isWatched(P, d1.root.position, 0.5); d1.flicker = w ? 0.35 : 0; });
  G.music.play("dance", 1.5);
  await G.fade(0, 1);
  await herPage(G, "dance");
  await G.say([N("The memory begins with the two of them dancing. The real dance stays hers. This is the nightmare's copy of it.")]);
  const spin = async () => { const c0 = P.yaw; await G.tween(0.7, (k) => { const a = k * Math.PI; P.ch.face(c0 + a); him.face(c0 + a + Math.PI); }); };
  const beat = 60 / 84;
  let r1 = await cueGame(G, { cues: [1.5, 1.5 + beat * 4, 1.5 + beat * 8].map((x) => x + 0.6), title: "ONE MORE TURN", hint: "✕ as the ring closes" });
  await spin();
  // the room slips back four seconds
  G.glitch(1);
  G.audio.reverseTick();
  G.caption("The room slips back four seconds", 3);
  await G.wait(0.5);
  G.glitch(0);
  await G.say([N("At the end of the turn, the room slips back four seconds."), N("This time his hand is cold."), N("At the edge of the floor another couple completes their movements a little early. Their faces look better the less directly she looks at them.")]);
  await G.fade(1, 0.6);

  // ---- his side: let her lead ----
  await G.handoff("Rufki", "The music keeps going");
  await G.load((W3) => { S.paint(W3, G, "dance"); return { start: [[165, 252], 0, Math.PI] }; });
  W = G.world;
  G.pov("Rufki");
  const c2 = fl(W, 165, 262);
  const real = G.npc(Character, "argjila", c2[0], c2[1], 0);
  real.pose("dance"); P.ch.pose("dance");
  const dbl = new Character("doubleA"); const [qx, qz] = fl(W, 215, 240); dbl.setPos(qx, 0, qz).faceToward(P.pos.x, P.pos.z); dbl.pose("reach"); dbl.early = 0.8; W.add(dbl.root); G.idle(dbl);
  await G.fade(0, 0.8);
  await G.say([N("From his side, the music keeps going when Argjila slows."), N("Her double offers him a hand. It never misses a beat.")]);
  let led = false;
  while (!led) {
    const c = await G.choose("The double's hand is already out.", ["Take the offered hand", "Look down"]);
    if (c === 0) {
      P.ch.pose("dance");
      await clockBack(G, "MAY 2026");
      await G.say([N("The floor circles back to the same four seconds. The same hand. The same beat.")]);
      continue;
    }
    await G.say([N("He looks down. The real Argjila has already shifted her weight."), N("Let her lead the next turn. Not the music. Her.")]);
    // cues come from her, off the beat
    const cues = [1.4 + Math.random() * 0.6, 3.3 + Math.random() * 0.8, 5.6 + Math.random() * 0.7];
    const res = await cueGame(G, { cues, window: 0.4, title: "LET HER LEAD", hint: "✕ when she moves, not when the music does" });
    if (res.hits >= 2 && res.stray <= 1) led = true;
    else { await clockBack(G, "MAY 2026"); await G.say([N("He moved on the music, not on her. Again.")]); }
  }
  G.walkTo(dbl, qx + 3, qz + 4, 1.2);
  await G.cutscene(async () => {
    G.zoom(1.5, [165, 200], 0.4);
    await G.say([N("She leads. The other couple keeps dancing, straight through the wall.")]);
    await G.flicker(dbl, 0, 1.2);
    G.zoom(1);
  });
  G.repair("dance");
  G.us();
  await G.fade(1, 1);

  // ---- her song: alone with a car radio ----
  await G.load((W4) => { S.paint(W4, G, "car", { env: { ambient: [0.3, 0.3, 0.4] } }); return {}; });
  W = G.world;
  P.ch.setVisible(false);
  P.frozen = true;
  G.pov("Argjila");
  G.music.play(null, 1);
  G.audio.ambience({ wind: 0.2, drone: 0.2, note: 44, bright: 240 });
  grade(0.8, 0.85, 1);
  await G.fade(0, 1.2);
  await G.say([N("After the dance, the nightmare leaves her alone with a car radio.")]);
  await G.choose("", ["Turn the dial"]);
  G.audio.dial();
  G.audio.staticBurst(1.1, 0.1);
  await G.wait(1);
  G.music.play("radio", 0.6);
  G.ui.toast("♪ ABOUT YOU — THE 1975", 5);
  G.caption("The radio finds “About You” (placeholder cue)", 3);
  await G.say([N("“About You,” by The 1975. Her favorite. The song that reminds her of Rufki."), N("This is her private listening. The left channel holds the music.")]);
  hum(G, 10);
  G.caption("On the right, somebody in the empty back seat is humming, one beat ahead", 4);
  G.zoom(2.2, [60, 45], 0.2);
  await G.wait(2.4);
  await G.say([N("In the mirror, the back seat is empty.")]);
  G.zoom(1);
  const r = await G.choose("The humming is a beat ahead of the song.", ["Turn off the radio", "Stay for another moment"]);
  if (r === 0) { G.music.play(null, 0.3); G.audio.receiver(true); await G.say([N("Quiet. The memory is still hers.")]); }
  else { hum(G, 6); await G.wait(3); G.music.play(null, 2); await G.say([N("She stays. The memory is still hers.")]); }
  G.flag("radioCopy");
  await herPage(G, "song");
  await G.say([N("Later, she will recognize a copied broadcast: its hum starts before her finger touches the dial.")]);
  P.ch.setVisible(true);
  grade();
  await G.fade(1, 1);
  return backToTower(G);
}

// ============================================================
// CHAPTER 7 — THE DAY WE CAME BACK (May 2026)
// ============================================================
export async function CH7(G) {
  const P = G.player;
  await G.load((W) => { S.paint(W, G, "car"); return {}; });
  const W = G.world;
  P.ch.setVisible(false);
  P.frozen = true;
  G.pov("Rufki");
  G.state.place = "the drive back";
  G.ui.clock("MAY 2026");
  G.audio.ambience({ wind: 0.4, drone: 0.25, note: 41, traffic: 0, bright: 220 });
  G.music.play("fog", 2);
  // the city lights strip that only appears when she holds the map
  const lights = document.createElement("div");
  lights.className = "citylights";
  document.getElementById("hud").append(lights);
  const cleanup = () => lights.remove();
  await G.fade(0, 1.4);
  await G.say([N("They went upstate together and came back to the city for a day in May. The tree line gives way to buildings..."), N("...until Rufki looks in the rearview mirror.")]);
  G.zoom(2.2, [60, 45], 0.2);
  G.audio.sting(true);
  await G.say([N("Ahead and behind, the same lone tree bends over the road.")]);
  G.zoom(1);
  G.audio.staticBurst(0.4, 0.06);
  await G.say([["radio", "...and on the parkway tomorrow morning, expect delays in both directions..."], N("The city station is reading tomorrow's traffic.")]);
  let arrived = false;
  while (!arrived) {
    const c = await G.choose("The dashboard offers a route marked HOME.", ["Take the route marked HOME", "Ask her what she can see"]);
    if (c === 0) {
      G.audio.whoosh();
      await clockBack(G, "MAY 2026");
      G.caption("The odometer doesn't move", 3);
      await G.say([N("The last mile loops. The odometer stays exactly where it was. The same tree.")]);
      continue;
    }
    // ---- passenger side ----
    await G.handoff("Argjila", "The passenger seat");
    G.pov("Argjila");
    await G.item({ title: "THE PAPER MAP", prop: "map", text: "A crease has swallowed the whole day back in the city. On the reverse, somebody has drawn a city block from the passenger window, side mirror in the corner." });
    let aligned = false;
    while (!aligned) aligned = await mapAlign(G);
    lights.classList.add("on");
    G.audio.repair();
    G.caption("A strip of city lights", 3);
    await G.say([N("When the drawn mirror and the real one line up, a strip of city lights appears.")]);
    // ---- driver side: follow her directions through the dark stretch ----
    await G.handoff("Rufki", "Follow her directions");
    G.pov("Rufki");
    G.music.play("chase", 1);
    const route = [["left", "Left."], ["right", "Right."], ["up", "Straight. Keep going."], ["left", "Left here."]];
    let ok = true;
    for (const [d, line] of route) {
      await G.say([A(line)]);
      if (!(await dirGame(G, d))) { ok = false; break; }
      G.audio.whoosh();
    }
    G.music.play("fog", 1);
    if (!ok) {
      lights.classList.remove("on");
      await clockBack(G, "MAY 2026");
      await G.say([N("The dark stretch folds. The same tree, ahead and behind.")]);
      continue;
    }
    arrived = true;
  }
  // arrival: traffic, a horn, the date turns over
  G.music.play("memory", 2);
  G.audio.ambience({ wind: 0.1, drone: 0.05, note: 55, traffic: 0.6, bright: 500 });
  grade(1.08, 1.02, 0.96);
  await G.say([N("Let them have the day they came back for. Traffic inches along.")]);
  G.audio.horn();
  G.caption("Somebody behind them leans on the horn", 3);
  await G.wait(0.8);
  await G.say([N("For once in this game, the sound of an impatient New Yorker is a relief.")]);
  G.ui.clock("NEXT DAY");
  G.audio.tick(0.2);
  await G.say([N("The date on the dashboard finally turns over.")]);
  G.repair("return");
  await herPage(G, "return");
  cleanup();
  P.ch.setVisible(true);
  grade();
  await G.fade(1, 1);
  return backToTower(G);
}

// ============================================================
// CHAPTER 8 — THE PARK NEAR TARGET
// ============================================================
export async function CH8(G) {
  const P = G.player;
  const load = async (start) => { await G.load((W) => { S.paint(W, G, "park"); return { start }; }); return G.world; };
  let W = await load([[284, 304], 0, -0.6]);
  G.pov("Rufki");
  G.state.place = "the park near Target";
  G.ui.clock("2026");
  G.audio.ambience({ wind: 0.3, drone: 0.1, note: 46, traffic: 0.12, bright: 300 });
  G.music.play("sorrow", 2);
  const [ax, az] = fl(W, 168, 238);
  let her = G.npc(Character, "argjila", ax, az, Math.atan2(P.pos.x - ax, P.pos.z - az));
  await G.fade(0, 1.2);
  await G.say([N("The store sign shows through the trees. Let him walk the last few steps to her.")]);
  G.objective("GO TO HER.");
  P.noRun = true;
  await reach(G, ax, az, 1.0);
  P.noRun = false;
  await G.cutscene(async () => {
    P.ch.faceToward(ax, az); P.yaw = P.ch.yaw;
    her.faceToward(P.pos.x, P.pos.z);
    P.ch.pose("cry"); her.pose("embrace");
    G.zoom(1.7, [175, 205], 0.5);
    await G.say([N("He cries in Argjila's arms by the park near Target. The camera settles while she holds him."), N("There is no timer.")]);
    await G.wait(3);
    G.audio.cartCrack(0.5);
    G.caption("A shopping cart rolls over a crack, then rolls on", 3.5);
    await G.wait(3.5);
  });
  // switch viewpoints without moving either character
  await G.handoff("Argjila", "From her shoulder");
  const him = swapPOV(G, her, "Argjila");
  P.frozen = true;
  await G.say([N("From her shoulder, she sees his hand gradually unclench.")]);
  const c = await G.choose("", ["Ask for a conversation later", "Ask him to stay beside you a little longer"]);
  G.flag("parkAsk", c);
  G.us();
  await G.wait(1.5);
  // the reflections in the dark shop glass separate
  G.zoom(1);
  await G.wait(0.4);
  const [gx, gz] = fl(W, 292, 214);
  const rR = new Character("doubleR"); rR.setPos(gx, 0, gz).face(0); rR.pose("embrace"); W.add(rR.root); G.idle(rR);
  const rA = new Character("doubleA"); rA.setPos(gx + 0.25, 0, gz + 0.35).face(Math.PI); rA.pose("embrace"); W.add(rA.root); G.idle(rA);
  grade(1, 0.85, 0.85);
  G.audio.sting(true);
  await G.say([N("Only after the embrace does the nightmare begin. In the dark shop window, their reflections separate.")]);
  rR.pose(null);
  G.walkTo(rR, gx + 4, gz + 6, 0.8);
  await G.say([N("His reflection walks off. Hers keeps holding empty air.")]);
  // back to Rufki: turn back when she calls
  await G.handoff("Rufki", "She calls");
  W = await load([[220, 300], 0, 0.9]);
  G.pov("Rufki");
  her = G.npc(Character, "argjila", ax, az, Math.atan2(P.pos.x - ax, P.pos.z - az));
  const rA2 = new Character("doubleA"); rA2.setPos(gx + 0.25, 0, gz + 0.35).face(Math.PI); rA2.pose("embrace"); W.add(rA2.root); G.idle(rA2);
  grade(1, 0.85, 0.85);
  await G.fade(0, 0.6);
  P.frozen = false;
  await G.say([A("Rufki?")]);
  G.objective("TURN BACK.");
  let turned = false;
  while (!turned) {
    const d0 = Math.hypot(P.pos.x - ax, P.pos.z - az);
    const which = await G.guard(new Promise((res) => {
      W.trigger({ x: ax, z: az, r: 1.2, enter: () => res("her"), once: true });
      const fn = W.every(() => {
        if (!G.canMove()) return;
        if (Math.hypot(P.pos.x - ax, P.pos.z - az) > d0 + 2.2) { W.updaters = W.updaters.filter((f) => f !== fn); res("away"); }
      });
    }));
    W.triggers.length = 0;
    if (which === "her") turned = true;
    else {
      G.audio.cartCrack(0.4);
      G.caption("The shopping cart rolls over the same crack again", 3);
      await clockBack(G, "2026");
      await G.fade(1, 0.4);
      G.placeAt([220, 300], 0, 0.9);
      await G.fade(0, 0.5);
      await G.say([N("Another chance to hear her."), A("Rufki?")]);
    }
  }
  grade();
  rA2.setVisible(false);
  await G.cutscene(async () => {
    her.faceToward(P.pos.x, P.pos.z);
    G.zoom(1.5, [170, 210], 0.4);
    await G.say([N("He turns back. She is still there.")]);
    G.zoom(1);
  });
  // the next day
  await G.fade(1, 1);
  G.ui.clock("THE NEXT DAY");
  await G.fade(0, 1);
  await G.say([N("The next day, he brings it up without waiting for her to ask twice."), R("You said you wanted to talk. I'm listening.")]);
  await G.choose("Her turn. She gets to be any of these, in the same conversation.", ["Hurt", "Funny", "Uncertain", "Quiet"], { title: "ARGJILA" });
  await G.say([N("She answers. Her answer belongs to her."), R("Can I ask you one more thing?")]);
  await G.choose("The scene lasts past his first question.", ["Hurt", "Funny", "Uncertain", "Quiet"], { title: "ARGJILA" });
  G.repair("park");
  await herPage(G, "park");
  await G.say([HER("Sometimes a memory does not need to look important from the outside to have meant something to the person who was there.")]);
  await G.fade(1, 1);
  return backToTower(G);
}

// ============================================================
// CHAPTER 9 — ROOM TO BE ME (Argjila)
// ============================================================
export async function CH9(G) {
  const P = G.player;
  await G.load((W) => { S.paint(W, G, "bedroom", { env: { ambient: [0.7, 0.58, 0.5] } }); return { start: [[60, 290], 0, 0] }; });
  const W = G.world;
  G.pov("Argjila");
  G.state.place = "her room";
  G.ui.clock("SUMMER 2026");
  grade(1.12, 1.0, 0.9);
  G.music.play("memory", 2);
  G.audio.ambience({ wind: 0.1, drone: 0.05, note: 55, traffic: 0.15, bright: 500 });
  await G.fade(0, 1.2);
  await G.say([HER("You have shown me love in ways I can actually point to.")]);
  G.objective("THE THINGS YOU KEPT. ONE AT A TIME.");
  const keep = [
    { key: "flowers", px: [20, 300], label: "FLOWERS", title: "FLOWERS", prop: null, kind: "ordinary", text: "You have brought me flowers again and again, sometimes only a few weeks apart." },
    { key: "ring", px: [40, 262], label: "THE PROMISE RING", title: "A PROMISE RING", kind: "ring", text: "You gave me a promise ring." },
    { key: "birthday", px: [80, 252], label: "DECORATIONS", title: "THE BIRTHDAY SURPRISE", kind: "couple", text: "You planned a birthday surprise with flowers and decorations." },
    { key: "deck", px: [120, 246], label: "A DECK OF CARDS", title: "22 REASONS", kind: "message", text: "I made a “22 reasons why I love you” deck." },
    { key: "tin", px: [105, 290], label: "A LITTLE TIN", title: "A TIN OF KISSES", kind: "iloveyou", text: "A little tin of kisses for when I was not around." },
    { key: "card", px: [70, 312], label: "A SONG CARD", title: "“ABOUT YOU”", kind: "one", text: "An “About You” song card." },
    { key: "letters", px: [140, 270], label: "LETTERS", title: "LETTERS AND PAGES", kind: "book", text: "I have made letters and small pages trying to capture what is hard for me to say all at once." },
  ];
  const seen = new Set();
  while (seen.size < keep.length) {
    const left = keep.filter((k) => !seen.has(k.key));
    const k = await G.interactAny(left.map((k) => ({ key: k.key, pos: pin(W, k.px[0], k.px[1], 0.8), label: k.label, sparkle: true, r: 1.3 })));
    const it = keep.find((x) => x.key === k);
    seen.add(k);
    await G.item({ title: it.title, canvas: pic(it.kind), text: it.text });
    G.give({ name: it.title.charAt(0) + it.title.slice(1).toLowerCase(), text: it.text });
    G.us();
  }
  await G.say([HER("I remember these things because the point was never just what you bought. It was the feeling that you had me in mind before I even walked into the room."), HER("I remember simple moments too, like being together in the backyard with fruit and grapes, or spending time at Barnes & Noble."), HER("Your affection is often easy to see. Mine is sometimes quieter. But quiet does not mean small.")]);
  G.ui.clock("OCT 4, 2026");
  G.audio.tick(0.2);
  await G.say([HER("By October 4, 2026, we had been official for six months. I could hardly believe how quickly those months had gone.")]);
  // room to be me
  G.ui.clock("A SCHOOL NIGHT");
  grade(0.95, 0.9, 1.0);
  G.music.play("waiting", 2);
  await G.say([HER("School days, classes, and just being in my own head take energy.")]);
  G.audio.textBeep();
  await G.phone({ contact: "RUFKI", date: "TONIGHT", messages: [{ from: "them", text: "[ he asks if he can stop by tonight ]", time: "" }] });
  const c = await G.choose("A quiet evening, or him, now. Neither one is wrong.", ["Spend the evening as yourself, then call him", "Call him now"]);
  // the nightmare tries to turn her space into distance
  G.audio.staticBurst(0.6, 0.08);
  grade(0.8, 0.95, 0.85);
  G.music.play("dread", 1);
  await G.say([["unsaid", "If you don't answer, he'll think you're gone."], ["unsaid", "Take the space and you'll lose him."]]);
  await G.choose("", ["That's not what this is."]);
  grade(1.05, 1, 0.95);
  G.music.play("memory", 1.5);
  await G.say([HER("I can love you deeply and still want to grow into my own person. I want you to have that room too."), HER("I want you close to me because we choose each other, not because either of us has to prove love by being available every minute.")]);
  if (c === 0) await G.say([N("She has her evening. Later, she calls him.")]);
  else await G.say([N("She calls him. Tomorrow she'll take her evening.")]);
  await G.say([HER("I have also seen you stand up for me when other people were making things uncomfortable. That mattered to me. It told me I was not alone when things got awkward.")]);
  G.us(2);
  grade();
  await G.fade(1, 1);
}

// ============================================================
// CHAPTER 10 — THE QUIET DAYS (Summer 2026)
// ============================================================
export async function CH10(G) {
  const P = G.player;
  await G.load((W) => { S.paint(W, G, "waterfront", { env: { ambient: [0.5, 0.46, 0.6] } }); return { start: [[60, 300], 0, -0.4] }; });
  const W = G.world;
  G.pov("Argjila");
  G.state.place = "the waterfront";
  G.ui.clock("SUMMER 2026");
  grade(1.08, 1.0, 0.95);
  G.music.play("memory", 2);
  G.audio.ambience({ wind: 0.3, drone: 0.05, note: 49, water: 0.5, traffic: 0.1, bright: 420 });
  const [hx, hz] = fl(W, 95, 296);
  const him = G.npc(Character, "rufki", hx, hz, 0);
  W.every((dt) => { if (!him._walking) him.faceToward(P.pos.x, P.pos.z); });
  await G.fade(0, 1.2);
  await G.say([N("Summer. The quiet days. She gets to pick where the scene lingers.")]);
  const spots = new Set();
  while (spots.size < 2) {
    const opts = [["walk", "The long waterfront walk"], ["sit", "Sit by the water"], ["song", "Put “About You” on in the parked car"]].filter(([k]) => !spots.has(k));
    const c = await G.choose("Where should it linger?", [...opts.map(([, t]) => t), ...(spots.size ? ["Move on"] : [])]);
    if (c >= opts.length) break;
    const k = opts[c][0];
    spots.add(k);
    G.us();
    if (k === "walk") {
      G.objective("WALK.");
      const [wx, wz] = fl(W, 160, 212);
      G.walkTo(him, wx - 0.6, wz, 1.2);
      await reach(G, wx, wz, 1.4);
      await G.say([N("The boards, the railing, the river. Nothing happens. That's the point.")]);
    } else if (k === "sit") {
      const [sx, sz] = fl(W, 90, 222);
      P.place(sx, sz, 0); P.ch.pose("sit");
      him.setPos(sx + 0.6, 0, sz); him.pose("sit");
      G.zoom(1.4, [100, 190], 0.3);
      await G.wait(3);
      await G.say([N("They sit by the water for a while.")]);
      G.zoom(1); P.ch.pose(null); him.pose(null);
    } else {
      G.music.play("radio", 1);
      G.ui.toast("♪ ABOUT YOU — THE 1975", 4);
      await G.say([HER("I chose “About You” by The 1975 for a reason.")]);
      await G.wait(2);
      G.music.play("memory", 2);
    }
    G.objective(null);
  }
  // his question; her answers come from her own words
  await G.cutscene(async () => {
    him.faceToward(P.pos.x, P.pos.z);
    G.zoom(1.4, [110, 210], 0.3);
    await G.say([R("If you could go back to the beginning, knowing everything you know now, would you still choose me?")]);
  });
  await G.choose("", ["“You were close to me before I knew you.”", "“We choose each other.”", "“There is still more I have not told you yet.”"], { title: "ARGJILA" });
  G.us();
  G.zoom(1);
  // the payphone rings after he has walked past it
  const [px2, pz2] = fl(W, 196, 268);
  await G.walkTo(him, px2 - 0.5, pz2 + 1.2, 1.2);
  G.walkTo(him, px2 - 2.5, pz2 + 3, 1.2);
  G.audio.bell(0.06);
  G.caption("The payphone rings. He has already walked past it.", 3.5);
  const ringing = setInterval(() => G.mode === "play" && G.audio.bell(0.05), 2600);
  const pick = await G.choose("The payphone keeps ringing.", ["Lift the receiver", "Let it ring"]);
  clearInterval(ringing);
  if (pick === 0) {
    G.audio.receiver(false);
    P.ch.pose("phone");
    await G.say([["fakeA", "Do you have a minute?"], N("It's her own voice, asking if the other person has a minute."), N("The cord runs behind the shuttered kiosk.")]);
    const f = await G.choose("", ["Follow the cord", "Hang up"]);
    P.ch.pose(null);
    if (f === 0) { G.state.flags.go_unread = true; await G.fade(1, 1); return; }
  }
  await G.say([N("It stops. She can pass it by and still find her way.")]);
  await G.fade(1, 1);
}

// ============================================================
// CHAPTER 11 — THE UNREAD ROOM (optional, Argjila alone)
// ============================================================
export async function CH11(G) {
  const P = G.player;
  await G.load((W) => { S.paint(W, G, "unread"); return { start: [[160, 312], 0, 0] }; });
  const W = G.world;
  G.pov("Argjila");
  G.state.place = "the Unread Room";
  G.ui.clock("4:04");
  G.music.play("dread", 2);
  G.audio.ambience({ wind: 0, drone: 0.45, note: 39, bright: 160, verb: 0.3 });
  const [fx, fz] = fl(W, 250, 290);
  const her = new SpriteActor("friend", { sway: 0.01 }); her.setPos(fx, 0, fz).face(-Math.PI / 2); W.addActor(her);
  await G.fade(0, 1.2);
  await G.say([N("Two chairs face each other. Both have ARGJILA written on the tape across their backs."), N("The girl opposite is her former best friend. She copied nearly everything Argjila did.")]);
  const [cx, cz] = fl(W, 70, 290);
  P.place(cx, cz, Math.PI / 2);
  P.ch.pose("sit");
  await G.choose("", ["Roll up one sleeve"]);
  P.ch.pose("sleeve");
  G.caption("She rolls up hers", 2.5);
  await G.wait(1);
  await G.choose("", ["Lower your arm"]);
  P.ch.pose("sit");
  G.audio.sting(true);
  G.caption("She keeps hers raised. She's waiting for you to copy her.", 3.5);
  await G.wait(1.2);
  await G.say([N("Her friend used to give her the silent treatment. When Argjila tried to talk things through, the conversation was shut down.")]);
  await G.choose("The rotary phone on the table.", ["Press redial"]);
  G.audio.dial();
  await G.wait(0.8);
  await G.say([N("The girl mouths Argjila's question, word for word. The line goes quiet again.")]);
  await G.choose("", ["Match her pose"]);
  P.ch.pose("raised");
  G.audio.thud(); G.audio.noise(0.4, 300, 1, 0.2, "lowpass", 0.1);
  G.caption("Both chairs scrape back to their starting marks", 3);
  await G.wait(1);
  await G.choose("", ["Hang up and walk out"]);
  G.audio.receiver(true);
  P.ch.pose(null);
  await G.flicker(her, 0, 1);
  await G.fade(1, 1);
  // a few steps on the boards
  await G.load((W2) => { S.paint(W2, G, "waterfront"); return { start: [[60, 300], 0, -0.4] }; });
  G.pov("Argjila");
  await G.fade(0, 1);
  for (let i = 0; i < 6; i++) { G.audio.step("wood"); if (i < 4) G.audio.step("wood"); await G.wait(0.45); }
  G.caption("A second pair of shoes behind her. Then only her own.", 3.5);
  await G.wait(1.5);
  await G.say([N("For a few steps she hears a second pair of shoes behind her. Then only her own."), N("She slows down to enjoy the sound of the water.")]);
  G.flag("unreadDone");
  await G.fade(1, 1);
}

// ============================================================
// CHAPTER 12 — THE UNSAID
// ============================================================
export async function CH12(G) {
  const P = G.player;
  // ---- sunset: the wrong Rufki ----
  await G.load((W) => { S.paint(W, G, "waterfront", { env: { ambient: [0.7, 0.45, 0.38] } }); return { start: [[90, 296], 0, 0] }; });
  let W = G.world;
  G.pov("Argjila");
  G.state.place = "the waterfront at sunset";
  G.ui.clock("SUNSET");
  grade(1.15, 0.85, 0.75);
  G.music.play("loop", 2);
  G.audio.ambience({ wind: 0.2, drone: 0.2, note: 44, water: 0.3, bright: 300 });
  const [wx, wz] = fl(W, 130, 296);
  const wrong = G.npc(Character, "rufki", wx, wz, -Math.PI / 2);
  wrong.early = 0.5;
  await G.fade(0, 1);
  G.audio.staticBurst(0.3, 0.04);
  G.caption("The radio turns down. Her hand hasn't reached it yet.", 3.5);
  await G.say([N("At sunset she notices that the man beside her has already turned the radio down before she reaches for it."), N("He knows the whole conversation in advance.")]);
  await G.choose("Ask him something new.", ["“What did I want to tell you after the park?”"]);
  await G.say([["fakeA", "That you'll never need anything from me."], ["fakeA", "That you're always fine."], ["fakeA", "That I already know everything you feel."], N("Three beautiful answers. Each one in her voice. None of them hers.")]);
  if (G.state.flags.receiver) await G.say([["line", "I'd like to hear it from you."], N("The real Rufki, on the open phone line.")]);
  G.music.play(null, 0.2);
  G.audio.ambience({ wind: 0, drone: 0, water: 0, traffic: 0, ramp: 0.2 });
  grade(0.7, 0.6, 0.6, 0.2);
  await G.say([N("The sunset freezes. The traffic and the water go silent."), ["other", "Who are you talking to?"]]);
  await G.fade(1, 0.2);
  await G.wait(1.2);

  // ---- the corridor of cords ----
  await G.load((W2) => { S.paint(W2, G, "cords"); return { start: [[168, 310], 0, 0] }; });
  W = G.world;
  G.pov("Rufki");
  G.state.place = "the Unsaid";
  G.clock("4:04:01");
  G.music.play("dread", 1);
  G.audio.ambience({ wind: 0, drone: 0.55, note: 36, bright: 140, verb: 0.6 });
  const un = new SpriteActor("unsaid", { emissive: 0.06, sway: 0.05 });
  const far = fl(W, 172, 182);
  un.setPos(far[0], 0, far[1]).face(Math.PI);
  W.addActor(un);
  await G.fade(0, 1);
  await G.say([N("Telephone cords pull taut between the doors. Something tall and thin is made of them."), ["unsaid", "What if she stops loving you?"], ["unsaid", "What if you aren't enough?"], ["unsaid", "What if your future disappears?"], N("It has no mouth. It speaks in their voices.")]);
  G.objective("TRACE THE TRUE PHONE LINE. LISTEN FOR THE HUM.");
  const junctions = [[168, 288], [172, 240], [174, 204]];
  let wrongs = 0;
  for (const [i, [jx, jy]] of junctions.entries()) {
    await reach(G, ...fl(W, jx, jy), 0.9);
    let done = false;
    while (!done) {
      const side = ["LEFT", "RIGHT", "CEILING"][Math.floor(Math.random() * 3)];
      const pan = side === "LEFT" ? -0.9 : side === "RIGHT" ? 0.9 : 0;
      G.audio.tone(110, 1.6, "sine", 0.05, 0, G.audio.pan(pan));
      G.audio.tone(220, 1.6, "sine", 0.02, 0, G.audio.pan(pan));
      G.caption(`A low hum, ${side === "CEILING" ? "above" : "to the " + side.toLowerCase()}`, 2.6);
      const c = await G.choose(`Junction ${i + 1}. Three cords.`, ["The left cord", "The right cord", "The cord from the ceiling"]);
      if (["LEFT", "RIGHT", "CEILING"][c] === side) { done = true; G.audio.chainClick(); }
      else {
        wrongs++;
        G.audio.sting(true);
        const p = un.root.position;
        p.x += (P.pos.x - p.x) * 0.35; p.z += (P.pos.z - p.z) * 0.35;
        await G.say([["unsaid", "Then why can't you find her?"]]);
        if (Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 1.5) {
          G.audio.hit();
          await G.fade(1, 0.3);
          un.setPos(far[0], 0, far[1]);
          await G.fade(0, 0.5);
          await G.say([N("The cords close. When they open, the corridor is longer.")]);
        }
      }
    }
  }
  // Argjila chooses the words that go down the line
  await G.handoff("Argjila", "The words that go down the line");
  G.pov("Argjila");
  let right = false;
  while (!right) {
    const c = await G.choose("Three messages wait to be sent in her name. Only one of them is true to them.", ["“I never loved you.”", "“I don't remember you.”", "“I'm scared too, but I'm still here.”"], { title: "THE TRUE LINE" });
    if (c === 2) right = true;
    else { G.audio.sting(); await G.say([["unsaid", "Yes. Say that. It's easier."], N("The line shrieks. That isn't them.")]); }
  }
  await G.handoff("Rufki", "Leave the line open");
  G.pov("Rufki");
  const ans = await G.choose("The Unsaid waits for him to finish her sentence.", ["Answer for her", "Leave the line open"]);
  if (ans === 0) {
    await clockBack(G, "4:04:00");
    await G.say([N("The corridor folds back into the waterfront, and back into the corridor again."), N("He leaves the line open this time.")]);
  }
  un.root.position.set(P.pos.x, 0, P.pos.z + 2.4);
  await G.cutscene(async () => {
    G.rig.shake = 0.1;
    await G.say([["unsaid", "YOU CAN'T PROMISE NOTHING WILL CHANGE!"], R("I know."), ["unsaid", "Then why keep going?"], R("Because loving her was never about knowing everything would be perfect. It's about choosing her anyway.")]);
    G.audio.glass();
    G.glitch(0.6);
    await G.tween(1.5, (k) => addTint(k * 0.35, k * 0.38, k * 0.32));
    G.glitch(0);
    await G.flicker(un, 0, 1);
    addTint();
    await G.say([N("The walls crack and brighten. The Unsaid retreats. It is not dead. It can come back whenever he stops trusting what he knows.")]);
  });
  await G.fade(1, 1);
}

// ============================================================
// CHAPTER 13 — THE WORLD WITHOUT HER
// ============================================================
export async function CH13(G) {
  const P = G.player;
  await G.load((W) => { S.paint(W, G, "bedroom"); return { start: [[60, 290], 0, 0] }; });
  let W = G.world;
  G.pov("Rufki");
  G.state.place = "a world without her";
  G.ui.clock("OCT 2026");
  grade(0.9, 0.9, 1, 0.5);
  G.music.play("sorrow", 2);
  G.audio.ambience({ wind: 0.1, drone: 0.2, note: 44, traffic: 0.2, bright: 300 });
  await G.fade(0, 1.4);
  await G.say([N("He wakes in his own room. Every trace of Argjila is gone.")]);
  G.objective("LOOK FOR HER.");
  const seen = new Set();
  const spots = [
    { key: "frames", pos: pin(W, 40, 250, 1.2), label: "PHOTO FRAMES", use: () => G.say([N("Empty photograph frames. Not torn out. Never filled.")]) },
    { key: "phone", pos: pin(W, 90, 300, 1), label: "HIS PHONE", use: async () => { await G.phone({ contact: "SEARCH: ARGJILA", date: "", messages: [{ from: "them", text: "No results.", time: "" }] }); } },
    { key: "photo", pos: pin(W, 130, 240, 1), label: "A PHOTOGRAPH", use: () => G.item({ title: "A PHOTOGRAPH", canvas: pic("alone"), text: "It should show the two of them. It shows only him." }) },
  ];
  while (seen.size < 3) seen.add(await G.interactAny(spots.filter((s) => !seen.has(s.key))));
  await G.say([N("People know Rufki. Nobody knows Argjila.")]);
  await G.fade(1, 1);
  await G.load((W2) => { S.paint(W2, G, "ocean", { env: { ambient: [0.62, 0.45, 0.42] } }); return { start: [[262, 312], 0, 0] }; });
  W = G.world;
  G.pov("Rufki");
  grade(1.1, 0.8, 0.7, 0.7);
  const [ox, oz] = fl(W, 214, 196);
  const other = new SpriteActor("other", { emissive: 0.08 });
  other.setPos(ox, 0, oz).face(Math.PI);
  W.addActor(other);
  await G.fade(0, 1);
  await reach(G, ox, oz, 2.2);
  await G.cutscene(async () => {
    G.zoom(1.6, [214, 150], 0.4);
    await G.say([N("At Ocean Parkway, the faceless figure from before explains what it is."), ["other", "I'm you. From a life where you never met her."], ["other", "Do you know what it's like to remember someone you've never met?"], ["other", "I remember her laugh. Her voice. The way she looks at you. But she doesn't know I exist."], ["other", "Stay here. It's empty, but it's safe. She goes on living in the real timeline. Or go back into the nightmare and risk trapping you both."]]);
    G.zoom(1);
  });
  const c = await G.choose("", ["Go back to her", "Stay in the empty world"]);
  if (c === 1) {
    await G.say([["other", "Then I'll go to her instead."], N("He steps past Rufki, wearing his face.")]);
    await G.fade(1, 1);
    return { ending: "otherme" };
  }
  await G.say([["other", "Then you should know who you're up against."], ["other", "The Unsaid is only a symptom. Something far older collects unrealized moments, lost memories, abandoned futures."], ["other", "The Keeper of Minutes. Your story with her is one of its greatest prizes."]]);
  await G.flicker(other, 0, 1.2);
  grade();
  await G.fade(1, 1);
}

// ============================================================
// CHAPTER 14 — THE CLOCK TOWER (4:04:56 → 4:04:59)
// ============================================================
export async function CH14(G) {
  const P = G.player;
  const toTower = async () => {
    await G.load((W) => { S.paint(W, G, "tower"); return { start: [[236, 236], 0, Math.PI * 1.2] }; });
    const W = G.world;
    G.pov("Rufki");
    G.state.place = "the Clock Tower";
    const k = makeKeeper(2.2);
    const [kx, kz] = fl(W, 320, 160);
    k.root.position.set(kx + 6, -2, kz + 14);
    W.actors.push(k);
    W.add(k.root);
    G._keeper = k;
    return W;
  };
  await toTower();
  G.clock("4:04:56");
  G.music.play("tower", 2);
  G.audio.ambience({ wind: 0.6, drone: 0.4, note: 36, bright: 200, verb: 0.7 });
  const ticker = setInterval(() => G.mode === "play" && G.audio.tick(0.06), 1000);
  await G.fade(0, 1.5);
  await G.say([N("Where Ocean Parkway should be, there is a tower made of impossible Brooklyn. Every clock shows 4:04.")]);
  // the elevator returns you to unfinished memories
  const missing = ["dance", "return", "park"].filter((k) => !G.state.repaired[k]);
  if (missing.length) {
    const names = { dance: "The May dance", return: "The drive back", park: "The park" };
    const c = await G.choose("The elevator can take him back to an unfinished memory.", [...missing.map((m) => names[m]), "Go on without them"], { title: "THE ELEVATOR" });
    if (c < missing.length) {
      clearInterval(ticker);
      G.state.flags.fromTower = true;
      await G.fade(1, 0.8);
      return { jump: idx(G, missing[c]) };
    }
  }
  // the Keeper's temptations
  await G.cutscene(async () => {
    G.zoom(1.5, [260, 120], 0.6);
    await G.say([["keeper", "I can keep your love without doubt, separation or death."], ["keeper", "Live the first meeting forever. A relationship with no conflict. A future already decided: a marriage, a home, children, old age."]]);
    G.zoom(1);
  });
  for (const t of ["Live the first meeting forever", "A flawless relationship, untouched by conflict", "A guaranteed future"]) {
    const c = await G.choose(t + ". Every vision is beautiful. Every vision is frozen.", ["Refuse", "Accept"], { title: "THE KEEPER'S OFFER" });
    if (c === 1) { clearInterval(ticker); return { ending: "forever" }; }
  }
  await G.say([N("Nobody inside those visions is free to change."), ["keeper", "Then hear what I told her. If the clock struck 4:05, you would disappear."], N("It was a lie. Ordinary time is the one thing that breaks the Keeper's hold on them.")]);
  // the paired doors
  G.clock("4:04:57");
  await G.say([N("The Keeper has built its tower around a car door and a front door. Open either alone and the Other Rufki steps through.")]);
  const d = await G.choose("", ["Open the car door", "Open the front door"]);
  G.audio.door();
  await G.say([["other", "One flawless loop of the dance. Forever. You'd never miss a beat."], N("Look at his hand. It is already reaching for hers before she has offered it.")]);
  const loop = await G.choose("", ["Refuse the loop", "Take it"]);
  if (loop === 1) { clearInterval(ticker); return { ending: "forever" }; }
  // 4:04:57 — Rufki: the street where she can still hear the chain
  await G.say([N("He has to find the street where Argjila can still hear the chain.")]);
  let found = false;
  while (!found) {
    const dir = Math.floor(Math.random() * 3);
    const pans = [-0.9, 0, 0.9];
    G.audio.chainClick(); setTimeout(() => G.audio.chainClick(), 450);
    G.audio.noise(0.04, 4200, 8, 0.25, "bandpass", 0, G.audio.pan(pans[dir]));
    G.caption(`A chain, ${["to the left", "straight ahead", "to the right"][dir]}`, 2.4);
    const c = await G.choose("", ["Left", "Ahead", "Right"], { title: "LISTEN" });
    if (c === dir) found = true; else await clockBack(G, "4:04:56");
  }
  G.audio.receiver(true);
  G.caption("He sets the receiver down without hanging up", 3);
  await G.say([N("He leaves the receiver open."), ["fakeA", "She'll always be happy. Just say yes for her."], A("Give me a moment to think."), N("Wait through the quiet.")]);
  let waited = false;
  while (!waited) {
    waited = await stillGame(G, 7, "THE QUIET");
    if (!waited) { G.audio.sting(true); await G.say([["fakeA", "Say yes. Say it now."], N("Not yet. Wait.")]); }
  }
  // 4:04:58 — Argjila
  G.clock("4:04:58");
  await G.handoff("Argjila", "Between the two clicks");
  G.pov("Argjila");
  G.audio.chainClick(); G.audio.breath(0.05); G.audio.chainClick(0.9);
  G.caption("A breath between two clicks", 3);
  await G.say([N("She listens for his breath between the two clicks."), N("Tell him what you want, even if you are scared it will disappoint him.")]);
  await G.choose("", ["Tell him"]);
  await G.say([N("She tells him what she wants."), HER("I want you close to me because we choose each other.")]);
  await G.choose("", ["Turn the chain yourself"]);
  G.audio.chainClick();
  G.caption("She turns the chain", 2);
  await G.say([N("On his side, the car door opens onto the street where she is standing.")]);
  // the second chair
  if (G.state.flags.unreadDone) {
    G.audio.noise(0.5, 300, 1, 0.25, "lowpass");
    G.caption("A chair scrapes toward her", 2.6);
    await G.say([N("The Keeper slides a second chair toward her. The tape on its back says ARGJILA.")]);
    await G.choose("", ["Push it back"]);
    await G.say([A("I cut her off for a reason. I like my life better this way.")]);
  }
  // 4:04:59
  G.clock("4:04:59");
  await G.handoff("Rufki", "He holds the door");
  G.pov("Rufki");
  const [ax, az] = fl(G.world, 210, 230);
  const her = G.npc(Character, "argjila", ax, az, 0.4);
  await G.cutscene(async () => {
    her.faceToward(P.pos.x, P.pos.z);
    G.zoom(1.6, [228, 190], 0.4);
    await G.say([A("I waited for you."), A("But I don't know what happens after this."), R("Neither do I."), A("Are you scared?"), R("Yeah."), A("Me too.")]);
    G.zoom(1);
    G.audio.clockStrike();
    G.rig.shake = 0.05;
    await G.say([N("The clock begins ticking."), ["keeper", "Stay, and you will never lose her."], A("That's not living."), ["keeper", "Outside these walls, everything ends eventually."], R("Maybe."), ["keeper", "Then why choose something you can't keep forever?"], R("Because I don't need forever to know it matters.")]);
  });
  const c = await G.choose("", ["Cross together", "Stay here at 4:04", "Hand over the receiver"], { title: "THE KEEPER'S OFFER" });
  clearInterval(ticker);
  if (c === 1) return { ending: "forever" };
  if (c === 2) return { ending: "otherme" };
  G.audio.rumble(3);
  G.rig.shake = 0.15;
  await G.say([N("The tower starts to come apart.")]);
  await G.fade(1, 0.8);
}

// ============================================================
// CHAPTER 15 — ONE MINUTE AWAY (the escape and the crossing)
// ============================================================
const ESCAPE = [
  { room: "hallway", start: [222, 304], yes: [262, 196], no: [204, 246] },
  { room: "bathhouse", start: [90, 290], yes: [300, 160], no: [30, 200] },
  { room: "almost", start: [70, 216], yes: [18, 206], no: [134, 216] },
  { room: "waterfront", start: [60, 300], yes: [170, 210], no: [205, 300] },
  { room: "cords", start: [176, 314], yes: [176, 190], no: [140, 252] },
];
export async function CH15(G) {
  const P = G.player;
  G.music.play("crossing", 1);
  for (let i = 0; i < ESCAPE.length; i++) {
    const E = ESCAPE[i];
    await G.load((W) => { S.paint(W, G, E.room); return { start: [E.start, 0, 0] }; });
    const W = G.world;
    G.pov("Rufki");
    G.state.place = "the collapse";
    G.clock("4:04:59");
    const her = G.npc(Character, "argjila", P.pos.x + 0.6, P.pos.z - 0.3, 0);
    her._walking = true; // the follower below drives her animation
    W.every((dt) => { const d = Math.hypot(P.pos.x - her.root.position.x, P.pos.z - her.root.position.z); if (d > 1.1) { const k = Math.min(1, dt * 2.2); her.root.position.x += (P.pos.x - her.root.position.x) * k * 0.6; her.root.position.z += (P.pos.z - her.root.position.z) * k * 0.6; her.faceToward(P.pos.x, P.pos.z); her.update(dt, 1.8); } else her.update(dt, 0); });
    // warm light + two clicks for the true route, cold light + backward tick for the false
    const [yx, yz] = fl(W, ...E.yes), [nx, nz] = fl(W, ...E.no);
    W.glow(yx, 1.2, yz, 1.4, 0xffb060);
    W.glow(nx, 1.2, nz, 1.4, 0x60a0ff);
    const cue = setInterval(() => { if (G.mode !== "play") return; G.audio.chainClick(); setTimeout(() => G.audio.chainClick(), 380); setTimeout(() => G.audio.reverseTick(), 900); }, 2600);
    G.rig.shake = 0.03;
    await G.fade(0, 0.5);
    G.objective(i === 0 ? "FOLLOW THE WARM LIGHT AND THE CLICKS. NOT THE COLD ONE." : null);
    const which = await Promise.race([zone(G, yx, yz, 0.9).then(() => "yes"), zone(G, nx, nz, 0.9).then(() => "no")]);
    clearInterval(cue);
    if (which === "no") {
      await clockBack(G, "4:04:58");
      await G.say([N("A false memory pulls them aside. Back.")]);
      i--;
    }
    await G.fade(1, 0.4);
  }
  // the final street crossing
  await G.load(S.buildCrossing);
  const W = G.world;
  env2(W);
  G.pov("Rufki");
  P.place(-1, 33, 0);
  const her = G.npc(Character, "argjila", 0, 33, 0);
  G.clock("4:04:59");
  G.music.play("sorrow", 1);
  G.audio.ambience({ wind: 0.4, drone: 0.2, note: 44, traffic: 0, bright: 260 });
  await G.fade(0, 1);
  await G.cutscene(async () => {
    G.shot([2.5, 1.6, 31], [-0.5, 1.4, 34], 46);
    her.faceToward(-1, 33);
    await G.say([N("At the last street crossing, the clock reads 4:04:59. Argjila hesitates."), A("What if we don't remember any of this?"), R("Then we'll make new memories.")]);
    P.ch.pose("reach"); her.pose("reach");
    await G.wait(0.6);
    P.ch.pose(null); her.pose(null);
    G.walkTo(her, 0, 38, 1.1);
    await G.walkTo(P.ch, -1, 38, 1.1);
    G.audio.clockStrike();
    G.clock("4:05");
    await G.fade(1, 1.6, "#f4f0e8");
  });
}
function env2(W) {
  S.env(W, { fog: 0x2a2a34, near: 6, far: 40, ambient: [0.36, 0.36, 0.42], dir: [0.2, 0.2, 0.26] });
}

// ============================================================
// Endings
// ============================================================
export function decideEnding(G) {
  const s = G.state, r = s.repaired;
  const all = r.dance && r.return && r.park;
  if (!all) return "waited";
  if (s.flags.ngplus && s.flags.photoFront && s.flags.photoBack && !s.flags.interfered) return "before";
  return "always";
}

async function endScene(G, builder) {
  await G.load(builder);
  G.player.ch.setVisible(false);
  G.player.frozen = true;
  G.ui.pov(null);
  G.mode = "cutscene";
}
async function credits(G) {
  G.music.play("always", 2);
  await G.lines(["ONE MINUTE AWAY", "THE ROAD BETWEEN US"], { hold: 4 });
  await G.lines(["A story in two points of view", "Rufki · Argjila"], { hold: 4, cls: "credits" });
  await G.lines(["Characters, creatures and places", "modeled from the original boards", "Voices synthesised offline · Kokoro-82M", "Music composed for the PS1-style sequencer"], { hold: 5, cls: "credits" });
  await G.lines(["“About You” by The 1975 is named in the story.", "The cue heard here is a placeholder."], { hold: 4, cls: "credits" });
}
async function firstMinute(G) {
  // post-credits: the street before the story began
  await endScene(G, S.buildCrossing);
  const W = G.world;
  S.env(W, { fog: 0xb8b4ac, near: 10, far: 50, ambient: [0.58, 0.56, 0.54], dir: [0.6, 0.56, 0.5], sat: 0.6 });
  const kidR = new SpriteActor("kidR"); kidR.setPos(-8, 0, 40).face(Math.PI / 2); W.addActor(kidR);
  const kidA = new SpriteActor("kidA"); kidA.setPos(8, 0, 41.5).face(-Math.PI / 2); W.addActor(kidA);
  const car = W.car(-14, 40.8, Math.PI / 2, [120, 40, 36], { solid: false });
  G.music.play("title", 2);
  G.shot([0, 2.4, 30], [0, 1, 40], 50);
  await G.fade(0, 1.5);
  const t0 = G.time;
  W.every((dt) => {
    const k = G.time - t0;
    kidR.root.position.x = Math.min(-1.2, -8 + k * 0.9);
    kidA.root.position.x = Math.max(1.2, 8 - k * 0.9);
    car.position.x = -14 + Math.max(0, k - 5.5) * 9;
  });
  await G.say([N("Long before they met, two children approach the same Brooklyn intersection from opposite directions.")]);
  await G.wait(3);
  await G.say([N("A car passes between them at the exact moment they might have seen one another. They continue on their separate ways.")]);
  await G.tween(4, (k) => G.rig.shot([0, 2.4 + k * 20, 30 - k * 4], [0, 0, 40], false, 50));
  await G.lines(["Some stories begin long before the people in them know they're part of one."], { hold: 4.5 });
  await G.lines(["“You were never lost. We just hadn't found each other yet.”"], { hold: 5 });
  await G.fade(1, 1);
  G.ui.setFade(1, "#000");
  G.ui.clock("4:04");
  G.audio.tick(0.2);
  await G.wait(1.2);
  G.audio.tick(0.25);
  G.ui.clock("4:05");
  await G.wait(1.4);
  G.ui.clock(null);
  await G.lines(["ONE MINUTE AWAY"], { hold: 3 });
}

export const ENDINGS = {
  // 1 · ALWAYS — true ending
  always: async (G) => {
    await endScene(G, S.buildSunrise);
    const W = G.world;
    G._car.children[1].material = mat({ color: 0x3a4450, opacity: 0.35 });
    const r = new Character("rufki"); r.setPos(10.4, 0.05, -0.15).face(0); r.pose("sitDrive"); W.add(r.root); G.idle(r);
    const a = new Character("argjila"); a.setPos(9.6, 0.05, -0.15).face(0); a.pose("sit"); W.add(a.root); G.idle(a);
    G.music.play("always", 2);
    G.audio.ambience({ wind: 0.2, drone: 0, traffic: 0.5, bright: 600 });
    G.shot([12.4, 1.6, 4], [10, 1, -0.2], 44);
    await G.fade(0, 2.2);
    G.clock("4:05");
    await G.say([N("They wake together in the parked car at sunrise. Both of them remember."), N("The traffic light changes twice before either of them moves the car.")]);
    await G.say([A("I've got something to tell you."), N("He turns the radio down, and waits.")]);
    await G.wait(1.5);
    await G.lines(["ALWAYS"], { hold: 3.2 });
    await G.lines(["“This is not just the story of how you found me.", "It is the story of how I saw you,", "how I kept choosing to learn you.”"], { hold: 6 });
    await G.lines(["And there is still more she hasn't told you yet."], { hold: 4 });
    await credits(G);
    await firstMinute(G);
  },
  // 2 · THE ONE WHO WAITED
  waited: async (G) => {
    await endScene(G, S.buildDayStreet);
    const W = G.world;
    const r = new Character("rufki"); r.setPos(13.4, 0, -6).face(0); W.add(r.root);
    const a = new Character("argjila"); a.setPos(13.8, 0, 14).face(Math.PI); W.add(a.root);
    G.music.play("sorrow", 2);
    G.shot([10.5, 1.7, 2], [13.6, 1.2, 4], 50);
    await G.fade(0, 1.5);
    await G.say([N("He made it out. Neither of them remembers what they were to each other."), N("Months later, two strangers pass on Ocean Parkway.")]);
    G.walkTo(r, 13.4, 9, 1.2);
    await G.walkTo(a, 13.8, -1, 1.2);
    r.face(Math.PI); a.face(0);
    await G.wait(1);
    await G.say([N("They stop. They look back at each other, struck by a familiarity they can't explain.")]);
    await G.wait(2);
    await G.lines(["THE ONE WHO WAITED", "Some memories are still missing."], { hold: 4 });
    await credits(G);
  },
  // 3 · 4:04 FOREVER
  forever: async (G) => {
    await endScene(G, (W) => { S.paint(W, G, "dance"); return {}; });
    const W = G.world;
    const [x, z] = W.backdrop.floor(165, 252);
    const r = new Character("rufki"); r.setPos(x, 0, z + 0.9).face(Math.PI); r.pose("dance"); W.add(r.root); G.idle(r);
    const a = new Character("argjila"); a.setPos(x, 0, z).face(0); a.pose("dance"); W.add(a.root); G.idle(a);
    G.music.play("dance", 1);
    G.clock("4:04");
    await G.fade(0, 1.4);
    for (let i = 0; i < 2; i++) {
      await G.say([N("The same beautiful day. The same turn. The same four seconds.")]);
      G.glitch(0.8); G.audio.reverseTick(); await G.wait(0.4); G.glitch(0);
    }
    await G.say([A("You know what I wanted to..."), N("He mouths every word before she says it."), N("The clock never moves.")]);
    G.clock("4:04", "bad");
    await G.lines(["4:04 FOREVER"], { hold: 4 });
  },
  // 4 · THE OTHER ME
  otherme: async (G) => {
    await endScene(G, (W) => { S.paint(W, G, "waterfront", { env: { ambient: [0.6, 0.5, 0.55] } }); return {}; });
    const W = G.world;
    const [x, z] = W.backdrop.floor(110, 290);
    const r = new Character("rufki"); r.setPos(x + 0.7, 0, z).face(-Math.PI / 2); r.early = 0.6; W.add(r.root); G.idle(r);
    const a = new Character("argjila"); a.setPos(x, 0, z).face(Math.PI / 2); W.add(a.root); G.idle(a);
    G.music.play("loop", 1);
    await G.fade(0, 1.4);
    await G.say([N("Someone came back wearing his face, carrying borrowed memories."), N("She senses that something is wrong."), A("What's in the little tin I gave you?"), ["other", "Candy?"], N("It is almost right.")]);
    G.music.play(null, 0.1);
    await G.fade(1, 0.15);
    await G.lines(["THE OTHER ME"], { hold: 4 });
  },
  // 5 · BEFORE WE KNEW (New Game+)
  before: async (G) => {
    await ENDINGS.always(G);
    await endScene(G, S.buildBook);
    const W = G.world;
    const k1 = new SpriteActor("kidR"); k1.setPos(-0.7, 0, -1).face(0.4); W.addActor(k1);
    const k2 = new SpriteActor("kidA"); k2.setPos(0.7, 0, -1).face(-0.4); W.addActor(k2);
    G.music.play("title", 2);
    G.shot([0, 1.8, -2.6], [0, 0.8, 0], 46);
    await G.fade(0, 1.4);
    await G.say([N("Years later, two children find an old book called One Minute Away."), N("Inside is a photograph of two people beside a clock that reads 4:05.")]);
    await G.item({ title: "ONE MINUTE AWAY", canvas: pic("book"), text: "Their parents call them from another room. On the next page is a map of a town neither parent remembers." });
    await G.lines(["BEFORE WE KNEW"], { hold: 4 });
  },
};
