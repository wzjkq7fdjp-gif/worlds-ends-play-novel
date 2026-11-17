// ============================================================
// Chapters: Prologue → Chapter 4
// (Chapter 5 → Final, endings and the title attract scene live
//  in chapters2.js)
// ============================================================
import { THREE, U, mat, TEX, boxGeo, planeGeo } from "./ps1.js";
import { Character } from "./actors.js";
import { isWatched, angDiff } from "./world.js";
import { pic, tvScreen } from "./art.js";
import { CH5, CH6, CH7, CH8, FINAL, ENDINGS, buildAttract, decideEnding } from "./chapters2.js";
export { ENDINGS, buildAttract, decideEnding };

export const NIGHT = { fog: 0x23272f, near: 3, far: 30, ambient: [0.3, 0.31, 0.37], dir: [0.16, 0.17, 0.24] };
const env = (W, o) => W.env({ ...o, ambient: o.ambient && new THREE.Color(...o.ambient), dir: o.dir && new THREE.Color(...o.dir) });
export { env };

// a person who stands still but breathes / idles
export function npc(G, preset, x, z, yaw = 0, over) {
  const c = new Character(preset, over);
  c.setPos(x, G.world.groundAt(x, z), z).face(yaw);
  G.world.add(c.root);
  G.idle(c);
  return c;
}
export function fadeChar(G, ch, to = 0, dur = 1.2) {
  // PS1-style "dissolve": flicker the character in/out
  return new Promise((res) => {
    let t = 0;
    const fn = (dt) => {
      t += dt;
      const k = Math.min(1, t / dur);
      ch.root.visible = to > 0 ? Math.random() < k : Math.random() > k;
      if (k >= 1) { ch.root.visible = to > 0; G.world.updaters = G.world.updaters.filter((f) => f !== fn); res(); }
    };
    G.world.every(fn);
  });
}
// Animate a value over time (game-time aware)
export function tween(G, dur, fn) {
  return new Promise((res) => {
    let t = 0;
    const u = (dt) => {
      t += dt;
      const k = Math.min(1, t / dur);
      fn(k);
      if (k >= 1) { G.world.updaters = G.world.updaters.filter((f) => f !== u); res(); }
    };
    G.world.every(u);
  });
}
export async function whiteFlash(G, hold = 0.4) {
  await G.fade(1, 0.5, "#f4f0e8");
  await G.wait(hold);
}

// ============================================================
// PROLOGUE — 4:04 AM
// ============================================================
function buildPrologue(W, G) {
  env(W, { ...NIGHT, far: 40 });
  W.boulevard(-24, 35, { lit: 0.18 });
  W.boulevard(45, 96, { lit: 0.12, flicker: true });
  // cross street
  W.ground(0, 40, 46, 10, TEX.road(), { scale: 6 });
  W.ground(0, 40, 30, 10.02, TEX.asphalt(), { scale: 4, y: 0.005 });
  for (const s of [-1, 1]) W.collider(s * 22, 35, s * 23, 45);
  W.bounds = { x0: -22, z0: -24, x1: 22, z1: 96 };
  // crosswalk stripes
  for (let x = -4; x <= 4; x += 1.2) W.mesh(boxGeo(0.6, 0.01, 2.2), mat({ color: 0xb8b4a8 }), x, 0.01, 34);
  W.streetSign(13.6, 34.5, "OCEAN PKWY", "AVE U");
  // the car
  const car = W.car(10, 0, 0, [62, 66, 82], { lights: true });
  G._car = car;
  W.car(-10, 12, Math.PI, [90, 40, 36]);
  W.car(10, 22, 0, [40, 60, 50]);
  W.hydrant(12.6, 6);
  W.trash(12.8, 18);
  // payphone
  W.payphone(13.4, 31.5, -Math.PI / 2);
  // the warm doorway (north-east corner)
  W.building(19, 50, 8, 9, 12, TEX.facade([120, 90, 70], 0.6, 77));
  W.door(14.88, 50, -Math.PI / 2, { tint: "#6a3a22", glow: 0.5 });
  W.light(14.2, 2.6, 50, 0xffc070, 7);
  W.glow(14.6, 2.4, 50, 1.8, 0xffb060);
  // the stairwell (mall, north side) — a railing frame and darkness below
  const dark = mat({ color: 0x050506 });
  W.mesh(boxGeo(2.2, 0.02, 3.2), dark, 6.5, 0.01, 50);
  const rail = mat({ map: TEX.metal(), color: 0x2e4a32 });
  W.mesh(boxGeo(0.08, 1.0, 3.2), rail, 5.4, 0.5, 50);
  W.mesh(boxGeo(0.08, 1.0, 3.2), rail, 7.6, 0.5, 50);
  W.mesh(boxGeo(2.2, 1.0, 0.08), rail, 6.5, 0.5, 51.6);
  W.collider(5.3, 48.4, 7.7, 51.7);
  W.sign(6.5, 1.35, 48.3, "DOWN", 0, { w: 0.9, h: 0.22, bg: "#1a3a1a", tw: 32, th: 8, size: 7 });
  W.light(6.5, 0.4, 50, 0x6080a0, 3.5);
  return { start: [8.6, 0.2, 0], cam: { yaw: 0, pitch: 0.34, dist: 6.2, height: 1.3 } };
}

async function prologue(G) {
  const W = await G.load(buildPrologue);
  const P = G.player;
  G.ui.setFade(1, "#000");
  G.clock(null);
  G.audio.ambience({ wind: 0.3, drone: 0.15, note: 55, traffic: 0.7, ramp: 0.5 });
  await G.card({ kicker: "PROLOGUE", title: "4:04 AM", sub: "OCTOBER 24, 2026 · OCEAN PARKWAY, BROOKLYN" });
  // inside the car, looking out through the windscreen
  P.ch.setVisible(false);
  G.rig.shot([10.2, 1.25, -0.4], [10, 1.0, 12]);
  G.fade(0, 2.5);
  G.audio.bell(0.03);
  await G.wait(1.2);
  G.clock("4:04");
  await G.wait(1.4);
  G.audio.tone(180, 0.3, "square", 0.04);
  G.audio.tone(180, 0.3, "square", 0.04, 0.45);
  await G.wait(1);
  G.rig.shot([11.6, 1.6, 2.6], [10, 1.2, 0]);
  await G.say([
    { text: "Rufki sits in his parked car along Ocean Parkway. His phone lights up: ARGJILA." },
    ["RUFKI", "Hey, baby?"],
    { text: "...He waits." },
    ["ARGJILA", "Do you remember where we first met?"],
    ["RUFKI", "Of course I do. What's wrong?"],
    ["ARGJILA", "You need to remember something else."],
    ["RUFKI", "Remember what?"],
    ["ARGJILA", "Before we met... how close were we?"],
    ["RUFKI", "...One minute."],
    { text: "A pause. Static breathes on the line." },
    ["ARGJILA", "Then why can't you find me?"],
  ]);
  // engine dies, the city empties
  G.audio.engineDie();
  G.audio.ambience({ wind: 0.55, drone: 0.35, note: 49, traffic: 0, ramp: 3 });
  G.rig.shake = 0.06;
  await G.wait(1.6);
  await tween(G, 3, (k) => { U.uFogFar.value = 40 - k * 14; });
  await G.say([
    { text: "The call ends. The engine dies. Outside, Brooklyn has emptied." },
    { phone: true, who: "TEXT FROM ARGJILA", text: "Don't follow me if I don't recognize you." },
    { phone: true, who: "TEXT FROM ARGJILA", text: "Whatever you do, don't let the clock reach 4:05." },
  ]);
  await G.fade(1, 0.6);
  G.audio.door();
  P.ch.setVisible(true);
  P.place(8.5, 1.2, 0);
  G.rig.release(true);
  await G.wait(0.3);
  G.fade(0, 1.2);
  G.objective("FIND ARGJILA.");
  await G.wait(2.2);
  G.objective("FOLLOW THE RINGING TELEPHONE.");
  // ringing gets louder as you get closer
  let ringT = 0, ringing = true;
  W.every((dt) => {
    if (!ringing) return;
    ringT -= dt;
    if (ringT <= 0) {
      ringT = 3.2;
      const d = Math.hypot(P.pos.x - 13.4, P.pos.z - 31.5);
      G.audio.bell(Math.max(0.006, 0.09 - d * 0.0025));
    }
  });
  W.trigger({ x0: -20, z0: 14, x1: 20, z1: 16, enter: () => G.ui.whisper("The streetlights hum. Nobody else is here.") });
  await G.interactOnce({
    pos: [13.4, 1.4, 31.5], label: "RINGING TELEPHONE", verb: "ANSWER", r: 1.8,
    use: async () => {
      ringing = false;
      P.ch.pose("phone");
      G.audio.noise(1.4, 2600, 0.4, 0.15, "highpass");
      G.rig.shot([11.2, 1.9, 29.8], [13.4, 1.3, 31.5]);
      await G.say([
        { text: "Static. Then wind, as if the line opens onto the street itself." },
        ["VOICE", "...Rufki? I'm right here."],
        { text: "The receiver goes dead in his hand." },
      ]);
      G.rig.release();
    },
  });
  // a silhouette in the stairwell, warm light from a doorway
  const sil = npc(G, "argjila", 6.5, 51.2, Math.PI, { shirt: [20, 20, 24], pants: [14, 14, 16], skin: "#202024", hair: "#101012", face: "blank" });
  sil.root.position.y = -0.9;
  G.audio.sting(true);
  G.ui.whisper("\"Rufki? I'm right here.\"");
  G.rig.shot([10.6, 2.4, 40], [7.5, 0.6, 50]);
  await G.wait(2.4);
  G.rig.release();
  G.objective("THE INTERSECTION DIVIDES. CHOOSE A WAY.");
  let chosen = null;
  const done = new Promise((res) => {
    const a = W.interact({ pos: [14.6, 1.2, 50], label: "THE WARMLY LIT DOORWAY", verb: "ENTER", r: 1.8, use: async () => { chosen = "door"; a.remove(); b.remove(); res(); } });
    const b = W.interact({ pos: [6.5, 1, 48.2], label: "THE DARK STAIRWELL", verb: "DESCEND", r: 1.8, use: async () => { chosen = "stair"; a.remove(); b.remove(); res(); } });
  });
  await G.guard(done);
  await G.cutscene(async () => {
    if (chosen === "door") {
      await whiteFlash(G);
      await G.say([
        { text: "A warm hallway. Her coat on a hook. The smell of her shampoo." },
        { text: "Every door he opens is the same door. The hallway folds back on itself..." },
      ]);
    } else {
      await G.fade(1, 0.8);
      await G.say([
        { text: "He goes down. The silhouette steps back with every step he takes." },
        ["VOICE", "Not yet."],
        { text: "The stairs climb upward again, though he never turned around..." },
      ]);
    }
    sil.root.visible = false;
    P.place(0, 40, 0);
    G.rig.release(true);
    G.fade(0, 1.4);
    G.audio.sting();
    await G.wait(1.2);
    G.clock("4:03");
    await G.say([
      { text: "He is back at the intersection." },
      { text: "The clock reads 4:03 AM." },
      ["RUFKI", "...It's going backward."],
    ]);
    await G.fade(1, 1.6);
  });
}

// ============================================================
// CHAPTER 1 — THE STREET THAT REMEMBERS
// ============================================================
function buildStreet1(W, G) {
  env(W, { ...NIGHT, fog: 0x1c2026, near: 2, far: 24 });
  // narrow residential street
  W.ground(0, 35, 8, 80, TEX.road(), { scale: 5 });
  for (const s of [-1, 1]) {
    W.ground(s * 5.5, 35, 3, 80, TEX.sidewalk(), { scale: 1.5 });
    W.mesh(boxGeo(0.2, 0.12, 80, 1), mat({ map: TEX.concrete() }), s * 4, 0.06, 35);
    W.blockRow(s * 7, -5, 75, s, { lit: 0.15, minH: 8 });
  }
  W.bounds = { x0: -7, z0: -4, x1: 7, z1: 74 };
  for (let z = 4; z < 72; z += 12) {
    W.lamp(-6.4, z, { side: 1, flicker: z === 40 ? 0.45 : 0 });
    W.lamp(6.4, z + 6, { side: -1 });
  }
  W.car(-3, 16, Math.PI, [50, 52, 60]);
  W.car(3, 33, 0, [80, 70, 50]);
  W.trash(-6.4, 22); W.hydrant(6.2, 12);
  // street signs that show dates instead of names
  W.streetSign(6.2, 26, "OCT 24 2025", "APR 4 2026");
  W.streetSign(-6.2, 52, "4:04 ST", "OCT 24 2026");
  // apartment door whose number keeps changing
  const d = W.door(-6.98, 28, Math.PI / 2, { label: "APT 404" });
  G._numDoor = d;
  // building entrance (to the impossible hallway)
  W.door(6.98, 62, -Math.PI / 2, { label: "APT 404", tint: "#3a2418" });
  W.light(6.2, 2.5, 62, 0xffcf90, 5);
  W.glow(6.7, 2.3, 62, 1, 0xffb060);
  return { start: [0, 2, 0], cam: { yaw: 0, pitch: 0.36, dist: 6, height: 1.3 } };
}

function buildApartment(W, G) {
  env(W, { fog: 0x0a0a0c, near: 3, far: 22, ambient: [0.2, 0.17, 0.15], dir: [0.05, 0.05, 0.05] });
  W.surface = "carpet";
  // TV room (z 0..6), opening into an impossibly long hallway (z 6..40)
  W.room(-3, 0, 3, 6, 2.8, { floor: TEX.carpet(), wall: TEX.wallpaper(), skip: ["n"] });
  W.bounds = { x0: -3, z0: 0, x1: 3, z1: 42 };
  W.wall(-2.1, 6, 1.8, 2.8, Math.PI, TEX.wallpaper());
  W.wall(2.1, 6, 1.8, 2.8, Math.PI, TEX.wallpaper());
  W.box(-2.2, 0, 1.5, 1.4, 0.8, 0.8, mat({ map: TEX.cloth([80, 60, 50], "couch") }));
  const tv = tvScreen();
  G._tv = tv;
  W.tv(-2.2, 4.6, Math.PI, tv.tex);
  W.every((dt) => tv.update(dt));
  W.light(1.8, 2.4, 1.5, 0xffc890, 6);
  W.box(2.4, 0, 1.2, 0.5, 0.6, 0.5, mat({ map: TEX.wood() }));
  W.glow(2.4, 1.05, 1.2, 0.5, 0xffd090);
  W.light(-2.2, 1, 4.2, 0x8090b0, 3.5);
  // hallway
  W.ground(0, 24, 2.4, 36, TEX.carpet([60, 30, 34], "hallcarpet"), { scale: 1.5 });
  W.ceiling(0, 24, 2.4, 36, 2.6, TEX.concrete([60, 56, 50], "ceil2"));
  W.wall(-1.2, 24, 36, 2.6, Math.PI / 2, TEX.wallpaper([86, 80, 62], "wp2"));
  W.wall(1.2, 24, 36, 2.6, -Math.PI / 2, TEX.wallpaper([86, 80, 62], "wp2"));
  W.wall(0, 42, 2.4, 2.6, Math.PI, TEX.wallpaper([86, 80, 62], "wp2"));
  W.collider(-3, 6, -1.2, 42); W.collider(1.2, 6, 3, 42);
  const nums = ["401", "402", "403", "405", "1999", "2009", "406", "4:04"];
  nums.forEach((n, i) => {
    const z = 10 + i * 4;
    const side = i % 2 ? 1 : -1;
    W.door(side * 1.17, z, side > 0 ? -Math.PI / 2 : Math.PI / 2, { label: "APT " + n, solid: false });
    if (i % 2 === 0) W.light(0, 2.3, z, 0xffd8a0, 5, { flicker: i === 4 ? 0.4 : 0 });
  });
  W.door(0, 41.9, Math.PI, { label: "APT 404", tint: "#5a2a1a" });
  return { start: [0.8, 1, -Math.PI * 0.75], cam: { yaw: Math.PI * 0.92, pitch: 0.42, dist: 4, height: 1.3 }, camZones: [{ x0: -3, z0: 6, x1: 3, z1: 42, cam: { yaw: 0, pitch: 0.3, dist: 3.6, height: 1.4 } }] };
}

async function ch1(G) {
  let W = await G.load(buildStreet1);
  const P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.45, drone: 0.4, note: 46, bright: 200 });
  await G.card({ kicker: "CHAPTER 1", title: "THE STREET THAT REMEMBERS", sub: "THE FIRST NIGHT · A NEIGHBORHOOD THAT KNOWS TOO MUCH" });
  G.clock("4:03");
  G.fade(0, 1.5);
  await G.wait(0.8);
  await G.say([{ text: "The streets around Ocean Parkway are recognizable, and wrong." }]);
  G.objective("FIND THE PHOTOGRAPH UNDER THE STREETLAMP.");
  W.trigger({ x0: -7, z0: 22, x1: 7, z1: 25, enter: () => G.ui.whisper("The street signs show dates instead of names.") });
  // the changing apartment number
  let swapT = 0, alt = false;
  W.every((dt) => {
    swapT += dt;
    if (swapT > 1 && !isWatched(P, { x: -6.98, z: 28 }, 0.9)) {
      swapT = 0;
      alt = !alt;
      const l = G._numDoor.userData.label;
      l.material.uniforms.uMap.value = TEX.text(alt ? "APT 403" : "APT 404", { w: 48, h: 12, bg: "#c8b878", fg: "#201810", size: 8, border: false });
    }
  });
  W.trigger({ x0: -7, z0: 26, x1: 0, z1: 30, enter: () => G.ui.whisper(alt ? "APT 403... it said 404 a second ago." : "APT 404.") });
  await G.interactOnce({
    pos: [-5.6, 0.25, 40], label: "SOMETHING UNDER THE LAMP", verb: "PICK UP", sparkle: true, r: 1.6,
    use: async () => {
      await G.item({ title: "CHILDHOOD PHOTOGRAPH", canvas: pic("childhood"), text: "Rufki as a boy, beside a girl whose face has been scratched out.\n\nOn the back: \"You passed each other more times than you know.\"" });
      await G.say([["RUFKI", "That's me... that's our old block."]]);
    },
  });
  G.objective("ENTER THE BUILDING. APARTMENT 404.");
  await G.interactOnce({ pos: [6.6, 1, 62], label: "APT 404", verb: "ENTER", r: 1.6 });
  G.audio.door();
  await G.fade(1, 0.7);
  W = await G.load(buildApartment);
  G.audio.ambience({ wind: 0.1, drone: 0.35, note: 52, bright: 300, verb: 0.35 });
  G.fade(0, 1);
  G._tv.set("static");
  G.audio.staticLevel(0.25);
  G.objective("THE TELEVISION IS ON.");
  await G.interactOnce({
    pos: [-2.2, 1, 4.3], label: "OLD TELEVISION", verb: "WATCH", r: 1.7,
    use: async () => {
      G.audio.staticLevel(0);
      G._tv.set("play");
      G.rig.shot([-1.4, 1.2, 2.8], [-2.2, 0.85, 4.6], true, 40);
      await G.say([{ text: "Two children walk on opposite sides of a Brooklyn road, toward the same corner..." }]);
      await G.wait(2.4);
      G._tv.set("frozen");
      G.audio.sting(true);
      await G.wait(0.8);
      await G.say([
        { text: "Just before they might notice one another, the footage freezes." },
        ["VOICE ON THE TV", "Some things are only meant to happen once."],
      ]);
      G._tv.set("static");
      G.rig.release();
    },
  });
  G.objective("FIND ARGJILA.");
  // Argjila at the end of the hallway that should not exist
  const arg = npc(G, "argjila", 0, 40.6, Math.PI);
  W.trigger({ x0: -2, z0: 7, x1: 2, z1: 9, enter: () => G.ui.whisper("This hallway should not exist.") });
  await new Promise((res) => W.trigger({ x0: -2, z0: 33, x1: 2, z1: 42, enter: res }));
  await G.cutscene(async () => {
    G.rig.shot([0.7, 1.5, 34.5], [0, 1.4, 40.5], true, 45);
    await G.say([
      ["RUFKI", "Argjila!"],
      { text: "She looks at him the way you look at a stranger who knows your name." },
      ["ARGJILA", "Do I know you?"],
      ["RUFKI", "It's me. It's Rufki. You called me."],
      ["ARGJILA", "I'm sorry. I don't think we've met yet."],
    ]);
    arg.face(0);
    G.audio.door();
    await fadeChar(G, arg, 0, 1.2);
    G.rig.release();
  });
  G.objective("FOLLOW ARGJILA THROUGH THE DOOR.");
  await G.interactOnce({ pos: [0, 1, 41.4], label: "APT 404", verb: "FOLLOW", r: 1.6 });
  await whiteFlash(G, 0.6);
  G.audio.ambience({ wind: 0.1, drone: 0, traffic: 0.8, ramp: 1 });
  await G.lines(["The fog is gone. Brooklyn is full of people.", "His phone reads OCTOBER 24, 2025.", "The day they met."], { hold: 6 });
}

// ============================================================
// CHAPTER 2 — THE FIRST TIME
// ============================================================
function buildFirstDay(W, G) {
  env(W, { fog: 0xb8b0a0, near: 10, far: 48, ambient: [0.55, 0.53, 0.5], dir: [0.55, 0.5, 0.42], dirVec: [-0.4, -1, 0.3], sat: 0.08 });
  W.surface = "street";
  W.ground(0, 0, 60, 14, TEX.road(), { scale: 6 });
  for (const s of [-1, 1]) W.ground(0, s * 10, 60, 6, TEX.sidewalk(), { scale: 1.5 });
  W.ground(0, 20, 60, 14, TEX.grass(), { scale: 3 });
  // facades on the south side, a little park on the north
  for (let x = -28; x < 28; x += 8) W.building(x + 4, -17, 7.8, 8, 10 + ((x * 7) % 9 + 9) % 6, TEX.facade([140, 110, 90], 0.1, 31 + x));
  W.bounds = { x0: -28, z0: -12.8, x1: 28, z1: 26 };
  // café front with tables
  W.sign(-8, 3.2, -12.9, "CAFÉ", 0, { w: 3, h: 0.6, bg: "#3a1e14", fg: "#f0d8a0", tw: 64, th: 12, size: 9, unlit: true });
  W.table(-10, -10.6, { w: 0.8, d: 0.8, chairs: false });
  W.table(-6, -10.6, { w: 0.8, d: 0.8 });
  for (let x = -24; x < 26; x += 10) { W.tree(x, 13 + ((x / 10) % 2) * 3); }
  W.bench(0, 13.2, Math.PI);
  W.bench(-14, 13.2, Math.PI);
  W.railing(-28, 26, 28);
  W.lamp(6, 12.6, { side: -1, range: 6 });
  W.car(-18, -3, Math.PI / 2, [150, 40, 40]);
  W.car(14, 3, -Math.PI / 2, [60, 80, 120]);
  W.payphone(16, -10.5, 0);
  W.door(20, -12.9, 0, { tint: "#2a2a30", sign: "THE OTHER DOOR" });
  return { start: [-20, -9, Math.PI / 2], cam: { yaw: Math.PI * 0.38, pitch: 0.42, dist: 7.5, height: 1.2 } };
}

function buildGallery(W, G) {
  env(W, { fog: 0x0a090c, near: 3, far: 20, ambient: [0.22, 0.2, 0.22], dir: [0.04, 0.04, 0.05] });
  W.surface = "wood";
  W.room(-2, 0, 2, 42, 3, { floor: TEX.wood([70, 50, 36], "galfloor"), wall: TEX.concrete([70, 66, 62], "galwall"), ceil: TEX.concrete([30, 30, 30], "galceil") });
  const lights = [];
  for (let z = 4; z < 42; z += 6) lights.push(W.light(0, 2.7, z, 0xe8d8c0, 6));
  W.frame(-1.95, 1.6, 2.2, Math.PI / 2, canvasFor("authentic"), 0.9, 0.68, { glow: 0.4 });
  W.frame(1.95, 1.6, 12, -Math.PI / 2, canvasFor("pass"), 0.9, 0.68);
  W.frame(-1.95, 1.6, 20, Math.PI / 2, canvasFor("never"), 0.9, 0.68);
  W.frame(1.95, 1.6, 28, -Math.PI / 2, canvasFor("alone"), 0.9, 0.68);
  for (let z = 6; z < 40; z += 3.2) W.frame((z * 7) % 2 > 1 ? -1.95 : 1.95, 1.2 + ((z * 3) % 1) * 0.8, z + 1.3, (z * 7) % 2 > 1 ? Math.PI / 2 : -Math.PI / 2, canvasFor(["pass", "never", "alone", "meeting"][Math.floor(z) % 4]), 0.4, 0.3, { glow: 0.05 });
  G._galLights = lights;
  return { start: [0, 3.5, 0], cam: { yaw: 0, pitch: 0.28, dist: 4.2, height: 1.45 } };
}
const texFromCanvas = new Map();
function canvasFor(kind) {
  if (texFromCanvas.has(kind)) return texFromCanvas.get(kind);
  const t = new THREE.CanvasTexture(pic(kind));
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  texFromCanvas.set(kind, t);
  return t;
}
export { canvasFor };

async function ch2(G) {
  let W = await G.load(buildFirstDay);
  const P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.15, drone: 0.15, note: 65, traffic: 0.5, bright: 500 });
  await G.card({ kicker: "CHAPTER 2", title: "THE FIRST TIME", sub: "OCTOBER 24, 2025 · A MEMORY WITH MISSING PIECES" });
  G.clock("4:03");
  // the younger Rufki waits near the bench; Argjila is missing
  const young = npc(G, "rufki", -1.5, 12.4, Math.PI * 0.85);
  const her = npc(G, "argjila", 1.8, 11.4, -Math.PI * 0.6);
  her.root.visible = false;
  // strangers with blurred faces, walking back and forth
  const strangers = [];
  for (let i = 0; i < 6; i++) {
    const s = new Character("stranger", { shirt: [[90, 84, 78], [60, 70, 90], [110, 80, 60]][i % 3] });
    const z = i % 2 ? -10 : 9.4, x0 = -26 + i * 9;
    s.setPos(x0, 0, z);
    W.add(s.root);
    strangers.push({ s, z, dir: i % 2 ? 1 : -1, x: x0 });
  }
  W.every((dt) => {
    for (const o of strangers) {
      o.x += o.dir * dt * 1.1;
      if (o.x > 26) o.dir = -1;
      if (o.x < -26) o.dir = 1;
      o.s.root.position.set(o.x, 0, o.z);
      o.s.face(o.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
      o.s.update(dt, 1.1);
    }
  });
  G.fade(0, 1.5);
  await G.wait(0.6);
  await G.say([
    { text: "He moves through the day they met. Nobody can see him." },
    { text: "The colour has drained out of everything. Strangers have no faces. Somewhere a conversation is missing its words." },
  ]);
  G.objective("RECOVER THREE MISSING FRAGMENTS.");
  const got = () => {
    G.mem("fragments");
    const n = G.state.memory.fragments;
    tween(G, 1.5, (k) => (U.uSat.value = 0.08 + (n - 1 + k) * 0.3));
    G.audio.ambience({ wind: 0.1, drone: 0.15 - n * 0.04, note: 65, traffic: 0.5 + n * 0.15, bright: 500 + n * 300 });
    G.objective(n < 3 ? `RECOVER THE MISSING FRAGMENTS. (${n} / 3)` : "RESTORE THE MEETING AT THE BENCH.");
  };
  const frags = [
    { pos: [-6, 0.85, -10.6], label: "PHOTO FRAGMENT", t: "A torn corner of a photograph: her coat sleeve, his hand, the café window.", k: "authentic" },
    { pos: [9.8, 1.0, 16], label: "VOICE FRAGMENT", t: "Caught in the leaves, a voice: \"...is this seat taken?\"", k: null },
    { pos: [-14, 0.6, 13.2], label: "MEETING KEEPSAKE", t: "A paper coffee cup. Two names written on it in marker, one of them spelled wrong.", k: null },
  ];
  await Promise.all(frags.map((f) => G.interactOnce({
    pos: f.pos, label: f.label, verb: "TAKE", sparkle: true, r: 1.6,
    use: async () => { await G.item({ title: f.label, canvas: f.k ? pic(f.k) : null, text: f.t }); got(); },
  })));
  await G.interactOnce({
    pos: [0, 1, 12.6], label: "THE BENCH", verb: "RESTORE THE MEETING", r: 2,
    use: async () => {
      U.uSat.value = 1;
      G.rig.shot([4.5, 2.2, 5], [0, 1.1, 12.5], true, 48);
      await fadeChar(G, her, 1, 1.2);
      G.audio.chime();
      await G.walkTo(her, 0.6, 11.6, 1.2);
      her.faceToward(-1.5, 12.4);
      young.faceToward(0.6, 11.6);
      await G.say([
        { text: "The memory plays the way it really happened." },
        ["ARGJILA (2025)", "Is this seat taken?"],
        ["RUFKI (2025)", "Only if you're staying."],
        ["ARGJILA (2025)", "...That's a terrible line."],
        ["RUFKI (2025)", "I know. I panicked."],
        { text: "She sits anyway. Colour floods back into the street. Traffic. Laughter. The rhythm of the conversation returns." },
      ]);
      G.rig.release();
    },
  });
  // the double
  const dbl = npc(G, "other", 20, -11.6, Math.PI);
  G.audio.sting(true);
  G.rig.shot([10, 2.0, -4], [20, 1.4, -11.6], true, 40);
  await G.say([{ text: "In the background stands a second Rufki. Same coat. Same walk. No face." }]);
  G.rig.release();
  G.objective("FOLLOW THE DOUBLE.");
  await G.wait(0.5);
  dbl.face(Math.PI);
  await fadeChar(G, dbl, 0, 1);
  await G.interactOnce({ pos: [20, 1, -12.4], label: "THE OTHER DOOR", verb: "ENTER", r: 1.8 });
  G.audio.door();
  await G.fade(1, 0.8);
  // ---------------- gallery & the Unmet ----------------
  W = await G.load(buildGallery);
  G.audio.ambience({ wind: 0, drone: 0.5, note: 41, bright: 160, verb: 0.5 });
  G.fade(0, 1);
  G.objective("A ROOM FULL OF PHOTOGRAPHS.");
  const ph = [
    [1.6, 12, "pass", "THEY PASS WITHOUT SPEAKING"],
    [-1.6, 20, "never", "ARGJILA NEVER ARRIVES"],
    [1.6, 28, "alone", "RUFKI STANDS ALONE"],
  ];
  ph.forEach(([x, z, k, t]) => W.interact({ pos: [x, 1.6, z], label: t, verb: "LOOK", r: 1.5, use: async () => { await G.item({ title: "A DIFFERENT FIRST ENCOUNTER", canvas: pic(k), text: t.charAt(0) + t.slice(1).toLowerCase() + "." }); } }));
  W.interact({ pos: [-1.6, 1.6, 2.2], label: "AUTHENTIC MEETING", verb: "LOOK", r: 1.5, use: async () => { await G.item({ title: "AUTHENTIC MEETING", canvas: pic("authentic"), text: "The real one. A bench, a bad line, and her laughing at it." }); } });
  const dbl2 = npc(G, "other", 0, 35, Math.PI);
  await new Promise((res) => W.trigger({ x0: -2, z0: 29, x1: 2, z1: 42, enter: res }));
  await G.cutscene(async () => {
    G.rig.shot([0.9, 1.6, 29.5], [0, 1.6, 35], true, 42);
    dbl2.face(Math.PI);
    await G.wait(0.6);
    G.audio.heartbeat();
    await G.say([
      { text: "The double turns. Where its face should be, there is nothing." },
      ["THE DOUBLE", "You know how easily this could have never happened?"],
    ]);
    await fadeChar(G, dbl2, 0, 0.8);
    G.rig.release();
  });
  // ---- the Unmet: it only moves while it isn't being watched ----
  const un = new Character("unmet");
  W.add(un.root);
  const ustart = { x: 0, z: 41 };
  un.setPos(ustart.x, 0, ustart.z).face(Math.PI);
  G.audio.sting();
  G.rig.shake = 0.08;
  await G.say([{ text: "Something steps out of the last photograph. It has never been met, and it wants to be." }]);
  G.objective("FACE THE UNMET. RETREAT TO THE REAL PHOTO. DON'T TURN YOUR BACK.");
  G.ui.toast("TIP: WALK BACKWARD. RUNNING TURNS YOUR BACK.", 5);
  P.faceTarget = un.root.position;
  let blackout = 0, nextBlack = 3.5, caught = false, won = false;
  const lights = G._galLights;
  const loop = W.every((dt) => {
    if (won || !G.canMove()) { un.update(dt, 0); return; }
    nextBlack -= dt;
    if (nextBlack <= 0 && blackout <= 0) { blackout = 0.6 + Math.random() * 0.3; nextBlack = 2.2 + Math.random() * 1.4; G.audio.noise(0.1, 4000, 2, 0.1); G.audio.heartbeat(); }
    const dark = blackout > 0;
    if (dark) blackout -= dt;
    lights.forEach((l) => (l.on = !dark));
    U.uAmbient.value.setRGB(dark ? 0.03 : 0.22, dark ? 0.03 : 0.2, dark ? 0.04 : 0.22);
    const watched = isWatched(P, un.root.position, 0.62) && !dark;
    const dx = P.pos.x - un.root.position.x, dz = P.pos.z - un.root.position.z, d = Math.hypot(dx, dz);
    let spd = 0;
    if (!watched) spd = dark ? 3.5 : 5.2;
    if (spd > 0 && d > 0.5) {
      un.root.position.x += (dx / d) * spd * dt;
      un.root.position.z += (dz / d) * spd * dt;
      un.faceToward(P.pos.x, P.pos.z);
    }
    un.update(dt, spd * 0.6);
    G.audio.staticLevel(Math.max(0, 1 - d / 9));
    if (d < 0.9 && !caught) {
      caught = true;
      G.cutscene(async () => {
        G.audio.hit();
        U.uAdd.value.setRGB(0.5, 0.5, 0.5);
        await G.wait(0.1);
        U.uAdd.value.setRGB(0, 0, 0);
        await G.fade(1, 0.3);
        await G.say([{ text: "It reaches him. For a moment he cannot remember her name." }]);
        P.place(0, 27, 0);
        un.setPos(ustart.x, 0, ustart.z);
        lights.forEach((l) => (l.on = true));
        blackout = 0; nextBlack = 3;
        G.rig.release(true);
        await G.fade(0, 0.6);
        caught = false;
      });
    }
  });
  await new Promise((res) => W.trigger({ x0: -2, z0: 0, x1: 2, z1: 4.2, enter: res }));
  won = true;
  P.faceTarget = null;
  lights.forEach((l) => (l.on = true));
  G.audio.staticLevel(0);
  await G.cutscene(async () => {
    G.rig.shot([1.2, 1.8, 1.2], [0, 1.4, 8], true, 50);
    await G.say([{ text: "His back touches the real photograph. The Unmet stops." }]);
    await fadeChar(G, un, 0, 1.5);
    await G.say([["THE UNMET", "There's more than one way this story ends."]]);
    G.audio.tick(0.25);
    G.clock("4:04:01");
    await G.say([{ text: "The clock advances one second." }]);
    await G.fade(1, 1.5);
  });
}

// ============================================================
// CHAPTER 3 — THE HOUSE OF ALMOST
// ============================================================
// Rooms open off a long hallway, deliberately out of chronological order:
//   room A (z 6..14):  OPPOSITE SIDEWALKS (2013)
//   room B (z 18..26): THE MISSED CORNER  (2019)
//   room C (z 30..38): THE SCHOOL CORRIDOR (2009)
const ROOMS = [
  { id: "sidewalks", name: "OPPOSITE SIDEWALKS", year: "2013", z0: 6, z1: 14 },
  { id: "corner", name: "THE MISSED CORNER", year: "2019", z0: 18, z1: 26 },
  { id: "school", name: "THE SCHOOL CORRIDOR", year: "2009", z0: 30, z1: 38 },
];
function buildHouse(W, G) {
  env(W, { fog: 0x0e0d10, near: 4, far: 26, ambient: [0.2, 0.18, 0.18], dir: [0.06, 0.06, 0.08] });
  W.surface = "wood";
  // hallway x -2..2, z 0..46
  W.ground(0, 23, 4, 46, TEX.wood([80, 56, 40], "hfloor"), { scale: 1.5 });
  W.ceiling(0, 23, 4, 46, 3.2, TEX.concrete([50, 46, 44], "hceil"));
  W.wall(-2, 23, 46, 3.2, Math.PI / 2, TEX.wallpaper([90, 70, 70], "hwp"));
  W.wall(0, 0, 4, 3.2, 0, TEX.wallpaper([90, 70, 70], "hwp"));
  W.wall(0, 46, 4, 3.2, Math.PI, TEX.wallpaper([90, 70, 70], "hwp"));
  W.collider(-3, 0, -2, 46);
  // east wall with door gaps at the middle of each room
  let zc = 0;
  for (const r of ROOMS) {
    const g0 = (r.z0 + r.z1) / 2 - 0.8, g1 = (r.z0 + r.z1) / 2 + 0.8;
    W.wall(2, (zc + g0) / 2, g0 - zc, 3.2, -Math.PI / 2, TEX.wallpaper([90, 70, 70], "hwp"));
    zc = g1;
  }
  W.wall(2, (zc + 46) / 2, 46 - zc, 3.2, -Math.PI / 2, TEX.wallpaper([90, 70, 70], "hwp"));
  // windows on the west wall, each showing a different year
  ["1996", "2001", "2009", "2013", "2019", "2025"].forEach((y, i) => {
    const z = 4 + i * 7.4;
    W.sign(-1.97, 1.7, z, y, Math.PI / 2, { w: 1.2, h: 1.0, bg: ["#1a2a4a", "#4a3a2a", "#6a7a8a", "#8a8070", "#3a3a4a", "#d0a070"][i], fg: "#ffffff", tw: 32, th: 28, size: 8, unlit: true });
    W.light(-1.5, 1.8, z, 0x8090b0, 4);
  });
  for (let z = 3; z < 46; z += 8) W.light(0, 3, z, 0xffd0a0, 6, { flicker: z === 27 ? 0.3 : 0 });
  W.bounds = { x0: -2, z0: 0, x1: 14, z1: 46 };
  // the rooms
  for (const r of ROOMS) {
    const cz = (r.z0 + r.z1) / 2;
    const floor = r.id === "school" ? TEX.tile("#a8a8a0", "#8a8a80", "schooltile") : TEX.sidewalk();
    W.ground(8, cz, 12, r.z1 - r.z0, floor, { scale: 1.5 });
    W.ceiling(8, cz, 12, r.z1 - r.z0, 3.2, TEX.concrete([40, 40, 44], "rceil"));
    W.wall(8, r.z0, 12, 3.2, 0, r.id === "school" ? TEX.concrete([120, 130, 110], "schoolwall") : TEX.brick());
    W.wall(8, r.z1, 12, 3.2, Math.PI, r.id === "school" ? TEX.concrete([120, 130, 110], "schoolwall") : TEX.brick());
    W.wall(14, cz, r.z1 - r.z0, 3.2, -Math.PI / 2, r.id === "school" ? TEX.concrete([120, 130, 110], "schoolwall") : TEX.facade([110, 90, 80], 0.3, 5));
    W.sign(2.03, 2.75, cz, `${r.name} · ${r.year}`, -Math.PI / 2, { w: 2.4, h: 0.3, bg: "#101010", fg: "#e8d8b0", tw: 128, th: 16, size: 8, unlit: true });
    W.light(8, 2.8, cz, r.id === "school" ? 0xe0f0ff : 0xffe0b0, 9);
    const wt = r.id === "school" ? TEX.concrete([120, 130, 110], "schoolwall") : TEX.brick();
    W.wall(2.01, (r.z0 + cz - 0.8) / 2, cz - 0.8 - r.z0, 3.2, Math.PI / 2, wt, { solid: false });
    W.wall(2.01, (cz + 0.8 + r.z1) / 2, r.z1 - cz - 0.8, 3.2, Math.PI / 2, wt, { solid: false });
    if (r.id === "sidewalks") {
      W.ground(8, cz, 12, 3, TEX.road(), { scale: 4, y: 0.01 });
    } else if (r.id === "corner") {
      W.box(11.5, 0, cz - 2.2, 5, 3.2, 3.2, mat({ map: TEX.brick([100, 70, 60], "cornerbrick") }));
      W.streetSign(8.6, cz - 0.4, "AVE J", "E 4 ST");
    } else {
      for (let z = r.z0 + 0.6; z < r.z1 - 0.6; z += 0.7) W.box(13.6, 0, z, 0.5, 1.9, 0.6, mat({ map: TEX.metal(), color: 0x5a7a9a }), { solid: false });
      W.collider(13.3, r.z0, 14, r.z1);
    }
  }
  W.door(0, 45.9, Math.PI, { sign: "THE FAR DOOR", tint: "#3a2a20" });
  W.sign(0, 2.1, 45.85, "DO NOT MAKE THEM MEET", Math.PI, { w: 1.6, h: 0.25, bg: "#e8e0c8", fg: "#801010", tw: 96, th: 12, size: 8 });
  // the restore-the-order frames
  return { start: [0, 1.5, 0], cam: { yaw: 0, pitch: 0.42, dist: 4.4, height: 1.3 }, camZones: ROOMS.map((r) => ({ x0: 2.3, z0: r.z0, x1: 14, z1: r.z1, cam: { yaw: -Math.PI / 2, pitch: 0.55, dist: 5.2, height: 1 } })) };
}

async function ch3(G) {
  const W = await G.load(buildHouse);
  const P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.1, drone: 0.45, note: 44, bright: 240, verb: 0.4 });
  await G.card({ kicker: "CHAPTER 3", title: "THE HOUSE OF ALMOST", sub: "BEFORE 2025 · EVERY NEAR MISS, EVERY LIFE NOT LIVED" });
  G.clock("4:04:01");
  G.fade(0, 1.4);
  await G.wait(0.5);
  await G.say([
    { text: "An immense building overlooking Ocean Parkway. Every window shows a different year." },
    { text: "The House of Almost holds every moment when they were close, and still strangers." },
  ]);
  G.objective("WITNESS THE THREE NEAR MISSES. DO NOT CHANGE THEM.");
  const seen = new Set();
  const vignette = async (r) => {
    const cz = (r.z0 + r.z1) / 2;
    const kr = npc(G, "kidR", 0, 0, 0);
    const ka = npc(G, "kidA", 0, 0, 0);
    G.rig.shot([4.2, 2.6, cz], [9.5, 0.6, cz], true, 55);
    if (r.id === "sidewalks") {
      kr.setPos(4, 0, cz - 2.2); ka.setPos(13, 0, cz + 2.2);
      await Promise.all([G.walkTo(kr, 13, cz - 2.2, 1.3), G.walkTo(ka, 4, cz + 2.2, 1.3), G.wait(2.2).then(() => G.say([{ text: "2013. Opposite sidewalks of the same street. Neither of them looks up." }]))]);
    } else if (r.id === "corner") {
      kr.setPos(9.5, 0, r.z1 - 0.6); ka.setPos(13.4, 0, cz + 0.2);
      await Promise.all([G.walkTo(kr, 9.5, r.z0 + 0.6, 1.2), G.walkTo(ka, 13.4, r.z1 - 0.6, 1.0), G.wait(1.6).then(() => G.say([{ text: "2019. Just around a corner from each other. One minute apart." }]))]);
    } else {
      kr.setPos(4, 0, cz - 1); ka.setPos(12.5, 0, cz + 1);
      await Promise.all([G.walkTo(kr, 12.5, cz - 1, 1.4), G.walkTo(ka, 4, cz + 1, 1.2), G.wait(1.8).then(() => G.say([{ text: "2009. The same school corridor, on the same afternoon. She drops a pencil. He is already gone." }]))]);
    }
    if (seen.size === 2 && !seen.has(r.id)) {
      // the last near miss: the temptation
      kr.setPos(8, 0, cz - 1.2); ka.setPos(8, 0, cz + 1.2);
      kr.faceToward(8, cz + 4); ka.faceToward(8, cz - 4);
      const c = await G.choose("He could step into this moment. One word, and they would meet years earlier.", ["LET THE CHILDREN PASS", "MAKE THEM NOTICE EACH OTHER"]);
      if (c === 1) {
        G.flag("interfered");
        kr.faceToward(4, cz);
        G.audio.sting(true);
        G.rig.shake = 0.25;
        U.uTint.value.setRGB(1.2, 0.6, 0.6);
        U.uSat.value = 0.3;
        await G.say([
          { text: "A child turns and sees the adult Rufki. The building fractures." },
          { text: "A photograph changes. Someone disappears from a later scene. The 2025 meeting replays without Argjila." },
          ["THE DOUBLE", "You wanted more time with her. So I gave you a world where you met earlier."],
          ["RUFKI", "Where is she?"],
          ["THE DOUBLE", "Somewhere you never learned to love."],
        ]);
        U.uTint.value.setRGB(1, 1, 1);
        U.uSat.value = 1;
      } else {
        await G.say([{ text: "He lets them pass. Some distances have to be walked." }]);
      }
    }
    kr.root.visible = ka.root.visible = false;
    G.rig.release();
  };
  await Promise.all(ROOMS.map((r) => G.interactOnce({
    pos: [6, 1, (r.z0 + r.z1) / 2], label: "NEAR CHILDREN", verb: "OBSERVE", r: 2.6,
    use: async () => { await vignette(r); seen.add(r.id); G.objective(seen.size < 3 ? `WITNESS THE NEAR MISSES. (${seen.size} / 3)` : "THE HOUSE REARRANGES ITS MEMORIES."); },
  })));
  // ---- restore the order ----
  G.audio.sting(true);
  G.rig.shake = 0.15;
  await G.say([{ text: "The hallway lurches. Three frames slide out of the wall, shuffled out of time." }]);
  const order = ["school", "sidewalks", "corner"];
  const frames = [
    { id: "corner", z: 41, k: "pass" },
    { id: "school", z: 43, k: "tv" },
    { id: "sidewalks", z: 39, k: "childhood" },
  ];
  frames.forEach((f) => {
    const r = ROOMS.find((x) => x.id === f.id);
    W.frame(-1.95, 1.6, f.z, Math.PI / 2, canvasFor(f.k), 0.7, 0.52, { glow: 0.3 });
    W.sign(-1.95, 1.15, f.z, r.name, Math.PI / 2, { w: 1.2, h: 0.18, bg: "#101010", fg: "#d8c8a0", tw: 96, th: 12, size: 7 });
  });
  G.objective("RESTORE THE NEAR MISSES TO THE ORDER THEY HAPPENED.");
  let step = 0;
  await new Promise((done) => {
    frames.forEach((f) => {
      const r = ROOMS.find((x) => x.id === f.id);
      const it = W.interact({
        pos: [-1.6, 1.4, f.z], label: r.name, verb: "SET IN PLACE", r: 1.3,
        use: async () => {
          if (order[step] === f.id) {
            step++;
            it.enabled = false;
            G.audio.chime();
            G.ui.toast(`${r.name} · ${r.year}`);
            if (step === 3) done();
          } else {
            G.audio.hit();
            G.rig.shake = 0.15;
            await G.say([{ text: "Static. The frames shuffle back. That is not the order it happened in." }]);
            step = 0;
            W.interacts.forEach((x) => (x.enabled = true));
          }
        },
      });
    });
  });
  G.state.flags.order = true;
  await G.cutscene(async () => {
    const kid = npc(G, "kidA", 0, 44.4, Math.PI);
    G.rig.shot([0.8, 1.6, 39.5], [0, 0.9, 44], true, 48);
    await G.say([
      { text: "The past isn't broken because they failed to meet sooner. Those missed connections made the people who eventually found one another." },
      ["A CHILD", "Was it worth waiting?"],
    ]);
    const c = await G.choose("", ["EVERY SECOND.", "...I DON'T KNOW YET."]);
    if (c === 0) G.mem("us");
    await G.say([["A CHILD", c === 0 ? "Okay. Then go." : "That's okay. Nobody does."]]);
    await fadeChar(G, kid, 0, 1);
    G.rig.release();
  });
  G.objective("FIND THE EXIT. THE FAR DOOR.");
  await G.interactOnce({ pos: [0, 1, 45.4], label: "THE FAR DOOR", verb: "OPEN", r: 1.6 });
  G.audio.door();
  await G.fade(1, 1.2);
}

// ============================================================
// CHAPTER 4 — APRIL FOURTH
// ============================================================
function buildBathhouse(W, G) {
  env(W, { fog: 0x0a1a28, near: 6, far: 30, ambient: [0.16, 0.24, 0.32], dir: [0.05, 0.1, 0.14] });
  W.surface = "tile";
  const tile = TEX.tile();
  const tileB = TEX.tile("#7ab0d0", "#5a90b8", "pooltile");
  // deck and room
  W.room(-10, -12, 10, 12, 6, { floor: false, wall: TEX.tile("#c8d4d8", "#a0b4c0", "walltile"), ceil: TEX.concrete([40, 50, 60], "bceil") });
  // deck strips around the pool opening
  W.ground(0, -9, 20, 6, tile, { scale: 1 });
  W.ground(0, 9, 20, 6, tile, { scale: 1 });
  W.ground(-7.5, 0, 5, 12, tile, { scale: 1 });
  W.ground(7.5, 0, 5, 12, tile, { scale: 1 });
  // pool: x -5..5, z -6..6, floor -1.8
  const deckMat = mat({ map: tile });
  // re-lay the deck around the pool (the room floor sits under the water)
  W.floor(-5, -6, 5, 6, -1.8);
  W.floor(-1.2, -6, 1.2, -2.8, 0, { axis: "z", a0: -6, a1: -2.8, y0: 0, y1: -1.8 });
  W.surfaceRect(-5, -6, 5, 6, "water");
  const wallM = mat({ map: tileB });
  W.mesh(planeGeo(10, 12, 1), mat({ map: tileB }), 0, -1.8, 0);
  // pool walls (inner faces)
  for (const [x, z, w, ry] of [[0, 6, 10, Math.PI], [5, 0, 12, -Math.PI / 2], [-5, 0, 12, Math.PI / 2], [-3.1, -6, 3.8, 0], [3.1, -6, 3.8, 0]]) {
    const m = W.mesh(new THREE.PlaneGeometry(w, 1.8, 4, 1), wallM, x, -0.9, z, ry);
  }
  // hide the room floor inside the pool with a dark rim; deck lips
  const lip = mat({ color: 0xe8eef0 });
  W.mesh(boxGeo(10.4, 0.1, 0.25), lip, 0, 0.0, 6.1);
  W.mesh(boxGeo(0.25, 0.1, 12.2), lip, 5.1, 0.0, 0);
  W.mesh(boxGeo(0.25, 0.1, 12.2), lip, -5.1, 0.0, 0);
  W.mesh(boxGeo(3.8, 0.1, 0.25), lip, -3.1, 0.0, -6.1);
  W.mesh(boxGeo(3.8, 0.1, 0.25), lip, 3.1, 0.0, -6.1);
  // steps
  for (let i = 0; i < 6; i++) W.mesh(boxGeo(2.4, 0.3, 0.55), mat({ map: tileB }), 0, -0.15 - i * 0.3, -5.7 + i * 0.55);
  // edge colliders (thin)
  W.collider(-5.1, 5.95, 5.1, 6.15); W.collider(4.95, -6.1, 5.15, 6.1); W.collider(-5.15, -6.1, -4.95, 6.1);
  W.collider(-5.1, -6.15, -1.25, -5.95); W.collider(1.25, -6.15, 5.1, -5.95);
  // water surface
  const water = W.ground(0, 0, 10, 12, TEX.water([40, 120, 170], "poolwater"), { y: -0.25, wave: 1, scroll: [0.02, 0.01], opacity: 0.6 });
  water.material.uniforms.uEmissive.value = 0.25;
  water.renderOrder = 2;
  G._water = water;
  // the room floor would show through the pool — cut it with an opaque dark sheet under the deck level
  // columns & lights
  for (const x of [-8, 8]) for (const z of [-4, 4]) W.box(x, 0, z, 0.8, 6, 0.8, mat({ map: TEX.tile("#d0d8dc", "#b0c0c8", "coltile") }));
  for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) W.light(x, -1.4, z, 0x40a0ff, 7);
  W.light(0, 5, 0, 0x80b0d0, 14);
  for (let i = -8; i <= 8; i += 4) W.sign(i, 4.6, 11.95, "", Math.PI, { w: 2.2, h: 1.2, bg: "#9ac0e0", fg: "#9ac0e0", tw: 8, th: 8, unlit: true });
  W.bench(-8.8, 0, Math.PI / 2); W.bench(8.8, 0, -Math.PI / 2);
  W.sign(0, 4.2, -11.95, "WILLIAMSBURG BATHHOUSE", 0, { w: 4, h: 0.5, bg: "#0a2030", fg: "#9ad8f0", tw: 128, th: 16, size: 9, unlit: true });
  // the hidden door, revealed when the pool drains
  const door = W.door(0, 11.9, Math.PI, { tint: "#1a1a20", sign: "THE THINGS WE NEVER SAID", solid: false });
  door.visible = false;
  G._bathDoor = door;
  W.water = { y: -0.25 };
  // fixed cinematic corner cameras, like the old survival-horror games
  return {
    start: [0, -9.5, 0], cam: { yaw: 0, pitch: 0.5, dist: 5, height: 1.0 },
    camZones: [
      { x0: -10, z0: -12, x1: 10, z1: 0, cam: { fixed: [7.2, 5.2, -9.6], height: 0.6 } },
      { x0: -10, z0: 0, x1: 10, z1: 12, cam: { fixed: [-7.2, 5.2, 9.6], height: 0.6 } },
    ],
  };
}

async function ch4(G) {
  const W = await G.load(buildBathhouse);
  const P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0, drone: 0.2, note: 58, water: 1, bright: 400, verb: 0.6 });
  await G.card({ kicker: "CHAPTER 4", title: "APRIL FOURTH", sub: "APRIL 4, 2026 · WILLIAMSBURG BATHHOUSE" });
  G.clock("4:04:01");
  // underwater effect
  W.every(() => {
    const under = P.pos.y + 1.5 < W.water.y && G._water.visible;
    if (under !== W._under) {
      W._under = under;
      G.audio.setMuffle(under);
      if (under) { U.uTint.value.setRGB(0.55, 0.85, 1.1); U.uFogNear.value = 1; U.uFogFar.value = 12; G.audio.splash(); }
      else { U.uTint.value.setRGB(1, 1, 1); U.uFogNear.value = W._fogN ?? 6; U.uFogFar.value = W._fogF ?? 30; }
    }
  });
  const arg = npc(G, "argjila", 0, 7.4, Math.PI);
  G.fade(0, 1.4);
  await G.wait(0.4);
  await G.say([{ text: "Soft blue light. The water is perfectly still. She is waiting beside the pool." }]);
  G.objective("SPEAK TO ARGJILA BESIDE THE POOL.");
  await G.interactOnce({
    pos: [0, 1.2, 7.4], label: "ARGJILA", verb: "TALK", r: 2,
    use: async () => {
      G.rig.shot([2.6, 1.7, 4.6], [0, 1.5, 7.2], true, 45);
      arg.faceToward(P.pos.x, P.pos.z);
      await G.say([
        { text: "For the first time since the nightmare began, she knows him." },
        ["ARGJILA", "Rufki."],
        ["RUFKI", "You remember me."],
        ["ARGJILA", "Of course I do. Tonight's the night, remember? April fourth."],
      ]);
      await G.fade(1, 0.8);
      G.audio.chime();
      await G.say([{ text: "They hold each other for a long time." }]);
      G.mem("us");
      await G.fade(0, 0.8);
      await G.say([
        ["ARGJILA", "The best part wasn't just one big moment."],
        ["ARGJILA", "It was all the little moments that made me want to stay."],
        { text: "Below the surface, photographs rest on the tiles." },
      ]);
      G.rig.release();
    },
  });
  G.objective("USE THE STEPS. RETRIEVE FOUR PHOTOS.");
  W._fogN = 6; W._fogF = 30;
  const photos = [
    { pos: [-3.2, -1.55, -2.5], k: "couple", t: "BECOMING A COUPLE", d: "April 4, 2026. \"So... are we official?\" \"I thought we already were.\"" },
    { pos: [3.4, -1.55, -1], k: "iloveyou", t: "I LOVE YOU", d: "He said it first, by accident, in the middle of a sentence about parking." },
    { pos: [-2.8, -1.55, 3.6], k: "families", t: "OUR FAMILIES", d: "Two families at one long table. Too much food. Everyone talking at once." },
    { pos: [3.0, -1.55, 4.2], k: "ordinary", t: "ORDINARY DAYS", d: "Errands. Traffic. A song in the car. The days that deepened everything." },
  ];
  await Promise.all(photos.map((p) => G.interactOnce({
    pos: p.pos, label: "PHOTOGRAPH", verb: "RETRIEVE", sparkle: true, r: 1.5,
    use: async () => {
      await G.item({ title: p.t, canvas: pic(p.k), text: p.d });
      G.mem("photos");
      const n = G.state.memory.photos;
      // the water darkens with every memory recovered
      W.lights.forEach((l) => l.color.copy(l.base).multiplyScalar(1 - n * 0.16));
      U.uAmbient.value.multiplyScalar(0.85);
      W._fogF = 30 - n * 4;
      G.objective(n < 4 ? `RETRIEVE FOUR PHOTOS. (${n} / 4)` : "EXAMINE THE RING AT THE POOL BOTTOM.");
    },
  })));
  await G.interactOnce({
    pos: [0, -1.6, 1], label: "SOMETHING GLINTING", verb: "EXAMINE", sparkle: true, r: 1.5,
    use: async () => {
      await G.item({ title: "RING AND A POSSIBLE FUTURE", canvas: pic("ring"), text: "A wedding ring, beside a picture of a house that does not exist yet.\nTwo small figures stand beside the couple. Their faces are blurred." });
      G.flag("ring");
    },
  });
  arg.root.visible = false;
  G.objective("SURFACE.");
  await new Promise((res) => W.trigger({ x0: -1.2, z0: -7, x1: 1.2, z1: -5.6, enter: res, once: true }));
  await G.cutscene(async () => {
    G.rig.shot([0, 3.6, -9], [0, 0, 6], true, 55);
    await G.say([
      { text: "When he surfaces, Argjila is gone. Her voice echoes off the tiles." },
      ["ARGJILA", "Don't search for a future if you forget how we got here."],
    ]);
    G.audio.noise(4, 300, 0.5, 0.3, "lowpass");
    G.audio.ambience({ water: 0, drone: 0.5, note: 41, ramp: 4 });
    await tween(G, 4, (k) => { G._water.position.y = -0.25 - k * 1.55; W.water.y = G._water.position.y; });
    G._water.visible = false;
    G._bathDoor.visible = true;
    G.audio.sting(true);
    await G.say([{ text: "The pool drains completely. In the far wall: a door that was not there before." }]);
    G.rig.release();
  });
  G.objective("THE POOL DRAINS. FIND THE FAR DOOR.");
  await G.interactOnce({ pos: [0, 1, 11.4], label: "THE THINGS WE NEVER SAID", verb: "OPEN", r: 1.6 });
  G.audio.door();
  await G.fade(1, 1.2);
}

export const CHAPTERS = [
  { name: "PROLOGUE · 4:04 AM", sub: "Ocean Parkway. A call at 4:04.", run: prologue },
  { name: "1 · THE STREET THAT REMEMBERS", sub: "A neighborhood that knows too much.", run: ch1 },
  { name: "2 · THE FIRST TIME", sub: "October 24, 2025.", run: ch2 },
  { name: "3 · THE HOUSE OF ALMOST", sub: "Every near miss.", run: ch3 },
  { name: "4 · APRIL FOURTH", sub: "Williamsburg Bathhouse.", run: ch4 },
  { name: "5 · THE UNSAID", sub: "The nightmare's emotional center.", run: CH5 },
  { name: "6 · THE QUIET DAYS", sub: "Summer 2026.", run: CH6 },
  { name: "7 · THE OTHER RUFKI", sub: "A world in which she never existed.", run: CH7 },
  { name: "8 · THE CLOCK TOWER", sub: "The truth about 4:04.", run: CH8 },
  { name: "FINAL · ONE MINUTE AWAY", sub: "4:04:59 AM.", run: FINAL },
];
