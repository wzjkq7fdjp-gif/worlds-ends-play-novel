// ============================================================
// Chapters 5 → Final, the five endings, post-credits,
// and the title-screen attract scene.
// ============================================================
import { THREE, U, mat, TEX, boxGeo, planeGeo } from "./ps1.js";
import { Character, makeUnsaid, makeKeeper } from "./actors.js";
import { THEME } from "./audio.js";
import { pic } from "./art.js";
import { npc, env, fadeChar, tween, whiteFlash, canvasFor, NIGHT } from "./chapters.js";

// ============================================================
// CHAPTER 5 — THE UNSAID
// ============================================================
function buildUnsaid(W, G) {
  env(W, { fog: 0x0c0a10, near: 3, far: 19, ambient: [0.24, 0.2, 0.24], dir: [0.08, 0.06, 0.1] });
  W.surface = "carpet";
  // a corridor stitched from different places: x -3..3, z 0..62
  const sections = [
    [0, 14, TEX.carpet([70, 30, 30], "u1"), TEX.wallpaper([70, 50, 40], "uw1")],
    [14, 28, TEX.wood([60, 44, 34], "u2"), TEX.wallpaper([50, 50, 70], "uw2")],
    [28, 42, TEX.concrete([50, 50, 50], "u3"), TEX.concrete([40, 40, 46], "uw3")],
    [42, 62, TEX.asphalt(), TEX.brick([60, 40, 36], "uw4")],
  ];
  for (const [z0, z1, f, w] of sections) {
    const cz = (z0 + z1) / 2, d = z1 - z0;
    W.ground(0, cz, 6, d, f, { scale: 1.5 });
    W.ceiling(0, cz, 6, d, 3.4, TEX.concrete([20, 20, 22], "uceil"));
    W.wall(-3, cz, d, 3.4, Math.PI / 2, w);
    if (z0 !== 42) W.wall(3, cz, d, 3.4, -Math.PI / 2, w);
  }
  W.surfaceRect(-3, 14, 3, 28, "wood");
  W.surfaceRect(-3, 28, 3, 62, "street");
  W.wall(0, 0, 6, 3.4, 0, TEX.wallpaper([70, 50, 40], "uw1"));
  W.collider(-4, 0, -3, 62);
  W.collider(3, 0, 4, 42);
  W.bounds = { x0: -3, z0: 0, x1: 14, z1: 62 };
  // restaurant table in a corridor
  W.table(0.6, 9, { w: 0.9, d: 0.9, chairs: true, cloth: 0xd8d0c8, candle: true });
  // a bedroom fading into blackness
  W.bed(-1.4, 21, 0, { sheet: [120, 120, 140] });
  W.light(1.5, 2.6, 20, 0x8090c0, 5, { flicker: 0.2 });
  // the silent phone on a pedestal
  W.box(0, 0, 35, 0.6, 1.0, 0.6, mat({ map: TEX.concrete() }));
  const ph = W.mesh(boxGeo(0.18, 0.02, 0.32), mat({ color: 0x9ae0b8, unlit: true }), 0, 1.02, 35);
  W.light(0, 1.6, 35, 0x60e0a0, 6);
  W.glow(0, 1.15, 35, 0.6, 0x60e0a0);
  // a car beside motionless water (the right side opens onto black water)
  W.ground(8.5, 52, 11, 20, TEX.water([8, 10, 14], "blackwater"), { y: -0.05 });
  W.collider(3.2, 42, 14, 62);
  W.railing(3.1 - 0.0, 42, 3.1);
  W.car(1.2, 50, 0, [40, 40, 46]);
  W.lamp(-2.6, 47, { side: 1, color: 0xd0c8b0, flicker: 0.2, range: 9 });
  // end wall; the opening appears when the truth is chosen
  W.wall(0, 62, 6, 3.4, Math.PI, TEX.brick([60, 40, 36], "uw4"));
  const block = W.box(0, 0, 61.3, 2.4, 3.4, 0.6, mat({ map: TEX.brick([60, 40, 36], "uw4") }));
  G._unsaidBlock = block;
  G._unsaidBlockC = W.colliders[W.colliders.length - 1];
  for (let z = 4; z < 60; z += 9) W.light(0, 3.1, z, 0xc0a890, 7, { flicker: 0.15 });
  return { start: [0, 2, 0], cam: { yaw: 0, pitch: 0.36, dist: 4.6, height: 1.4 } };
}

export async function CH5(G) {
  const W = await G.load(buildUnsaid);
  const P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.2, drone: 0.6, note: 38, bright: 180, verb: 0.6 });
  await G.card({ kicker: "CHAPTER 5", title: "THE UNSAID", sub: "THE NIGHTMARE'S EMOTIONAL CENTER" });
  G.clock("4:04:01");
  G.fade(0, 1.4);
  await G.wait(0.4);
  await G.say([{ text: "A restaurant table in a corridor. A bedroom fading into black. A phone full of unanswered messages. Familiar places, stitched together wrong." }]);
  G.objective("FIND THE MESSAGE CONSISTENT WITH REAL MEMORIES.");
  // optional fears
  const fears = [
    [0.6, 9, "A RESTAURANT TABLE", ["The night they argued about nothing. He remembers her face as colder than it was."]],
    [-1.4, 21, "THE BED", ["Half of the bed is fading into the dark.", "The fear: one morning, waking up and she isn't there."]],
    [1.2, 50, "THE CAR", ["Parked beside water that does not move. The fear: driving home alone, not knowing why it feels like something's missing."]],
  ];
  fears.forEach(([x, z, l, t]) => W.interact({ pos: [x, 1, z], label: l, verb: "LOOK", r: 1.8, use: async () => G.say(t.map((s) => ({ text: s }))) }));
  // the creature
  const un = makeUnsaid();
  un.root.position.set(0, 0, 54);
  W.add(un.root);
  const whispers = ["WHAT IF SHE STOPS LOVING YOU?", "WHAT IF YOU AREN'T ENOUGH?", "WHAT IF YOUR FUTURE DISAPPEARS?", "SHE NEVER ANSWERED.", "YOU SAID THE WRONG THING. AGAIN."];
  let wT = 4, wi = 0, retreat = false, hitCd = 0, checkpoint = { x: 0, z: 2 };
  W.trigger({ x0: -3, z0: 26, x1: 3, z1: 28, once: false, enter: () => (checkpoint = { x: 0, z: 27 }) });
  W.every((dt) => {
    un.update(dt, retreat ? 1.2 : 0.8);
    const p = un.root.position;
    const dx = P.pos.x - p.x, dz = P.pos.z - p.z, d = Math.hypot(dx, dz);
    if (retreat) { p.z += dt * 1.6; un.root.rotation.y = 0; G.audio.staticLevel(0); return; }
    if (!G.canMove()) return;
    G.audio.staticLevel(Math.max(0, 1 - d / 10) * 0.8);
    un.root.rotation.y = Math.atan2(dx, dz);
    if (d > 1) { const s = (d > 14 ? 1.1 : 0.85) * dt; p.x += (dx / d) * s; p.z += (dz / d) * s; }
    wT -= dt;
    if (wT <= 0 && d < 16) { wT = 5 + Math.random() * 3; G.ui.whisper(whispers[wi++ % whispers.length], 3); G.audio.noise(1.5, 700, 3, 0.08); }
    hitCd -= dt;
    if (d < 1.2 && hitCd <= 0) {
      hitCd = 3;
      G.cutscene(async () => {
        G.audio.hit();
        G.rig.shake = 0.3;
        U.uAdd.value.setRGB(0.4, 0.05, 0.05);
        await G.wait(0.15);
        U.uAdd.value.setRGB(0, 0, 0);
        await G.fade(1, 0.3);
        G.ui.whisper("TRYING TO OVERPOWER IT ONLY MAKES IT STRONGER.", 3.5);
        P.place(checkpoint.x, checkpoint.z, 0);
        p.set(0, 0, Math.min(58, checkpoint.z + 18));
        G.rig.release(true);
        await G.fade(0, 0.6);
      });
    }
  });
  // the phone puzzle
  let solved = false;
  while (!solved) {
    await G.interactOnce({
      pos: [0, 1.1, 35], label: "SILENT PHONE", verb: "READ", r: 1.6,
      use: async () => {
        G.rig.shot([0.9, 1.9, 33.6], [0, 1.0, 35], true, 40);
        await G.item({ title: "UNANSWERED MESSAGES", canvas: pic("message"), text: "Three messages from Argjila. Only one of them is true." });
        const c = await G.choose("WHICH MESSAGE AGREES WITH THE TRUTH?", ["\"I NEVER LOVED YOU.\"", "\"I DON'T REMEMBER YOU.\"", "\"I'M SCARED TOO. BUT I'M STILL HERE.\""]);
        if (c === 2) { solved = true; return; }
        G.audio.sting();
        un.root.position.set(P.pos.x, 0, P.pos.z + 5);
        G.rig.release();
        await G.say([{ text: "The words crawl off the screen. That isn't her. That's the fear talking, in her voice." }]);
      },
    });
  }
  await G.cutscene(async () => {
    un.root.position.set(0, 0, 40.5);
    G.rig.shot([-2.2, 1.6, 33], [0, 2.2, 40], true, 50);
    G.audio.staticLevel(0.5);
    await G.say([
      ["THE UNSAID", "YOU CAN'T PROMISE NOTHING WILL CHANGE!"],
      ["RUFKI", "I know."],
      ["THE UNSAID", "THEN WHY KEEP GOING?"],
      ["RUFKI", "Because loving her was never about knowing everything would be perfect."],
      ["RUFKI", "It's about choosing her anyway."],
    ]);
    retreat = true;
    G.audio.staticLevel(0);
    G.audio.chime();
    await tween(G, 2.5, (k) => {
      U.uAmbient.value.setRGB(0.24 + k * 0.16, 0.2 + k * 0.18, 0.24 + k * 0.14);
      U.uFogFar.value = 17 + k * 20;
    });
    await G.say([{ text: "The walls crack and brighten. The Unsaid retreats into the dark. It isn't dead. It never is." }]);
    G._unsaidBlock.visible = false;
    G._unsaidBlockC.on = false;
    W.light(0, 2, 61, 0xfff0d0, 8);
    W.glow(0, 1.5, 61.6, 3, 0xfff0d0);
    G.rig.release();
  });
  G.objective("THE UNSAID RETREATS. FIND THE EXIT.");
  await G.interactOnce({ pos: [0, 1.2, 61], label: "THE OPENING IN THE WALL", verb: "STEP THROUGH", r: 1.8 });
  await whiteFlash(G, 0.8);
}

// ============================================================
// CHAPTER 6 — THE QUIET DAYS
// ============================================================
function buildWaterfront(W, G) {
  env(W, { fog: 0xd09068, near: 18, far: 80, ambient: [0.5, 0.4, 0.36], dir: [0.8, 0.5, 0.3], dirVec: [0.2, -0.35, 1] });
  // sky dome + sun
  const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 12, 8), mat({ map: TEX.sky("#3a3a6a", "#e08a5a", "#f8c890", "sunset"), unlit: true, noFog: true, side: THREE.BackSide }));
  W.add(sky);
  const sun = W.glow(0, 9, 85, 18, 0xffb070);
  sun.material.uniforms.uNoFog.value = 1;
  // promenade
  W.ground(0, 4, 50, 14, TEX.sidewalk(), { scale: 1.5 });
  W.ground(0, -8, 50, 10, TEX.road(), { scale: 6 });
  W.ground(0, -15, 50, 4, TEX.sidewalk(), { scale: 1.5 });
  const water = W.ground(0, 50, 160, 80, TEX.water([60, 70, 100], "duskwater"), { y: -0.8, wave: 1, scroll: [0, 0.04] });
  water.material.uniforms.uEmissive.value = 0.15;
  G._dusk = water;
  W.railing(-25, 11, 25);
  W.bounds = { x0: -24, z0: -16, x1: 24, z1: 10.8 };
  // skyline across the water (no fog, silhouettes)
  for (let i = 0; i < 26; i++) {
    const h = 6 + ((i * 37) % 23), w = 3 + (i % 4);
    const b = W.mesh(boxGeo(w, h, 3, 3, 3), mat({ map: TEX.facade([46, 40, 56], 0.4, 90 + i), color: 0x9a8a9a, noFog: true }), -60 + i * 4.8, h / 2 - 0.8, 70 + (i % 3) * 4);
  }
  for (let x = -20; x <= 20; x += 10) W.tree(x, -1.5, 1, TEX.leaves([60, 80, 40], "sumleaves"));
  W.bench(-6, 8.8, Math.PI);
  W.bench(10, 8.8, Math.PI);
  for (let x = -22; x <= 22; x += 11) W.lamp(x, 10.2, { side: -1, color: 0xffd8a0, range: 6 });
  // places from ordinary days
  W.car(-14, -8, Math.PI / 2, [70, 74, 88]);
  W.building(16, -19, 10, 4, 5, TEX.facade([140, 110, 80], 0.8, 3));
  W.sign(16, 3.6, -16.9, "DELI · GROCERY", 0, { w: 4, h: 0.6, bg: "#1a4a2a", fg: "#f0f0d0", tw: 96, th: 14, size: 9, unlit: true });
  W.light(16, 2.6, -15.5, 0xffe0b0, 6);
  W.table(-2, -14.5, { w: 0.8, d: 0.8, chairs: true });
  W.sign(-2, 2.8, -16.9, "PIZZA", 0, { w: 2, h: 0.5, bg: "#7a1a14", fg: "#f8e8c0", tw: 48, th: 12, size: 9, unlit: true });
  W.building(-4, -19, 10, 4, 5, TEX.facade([120, 80, 70], 0.7, 5));
  W.building(-22, -19, 10, 4, 7, TEX.facade([100, 90, 80], 0.3, 6));
  W.building(4, -19, 6, 4, 6, TEX.facade([110, 100, 90], 0.2, 7));
  return { start: [-18, 2, Math.PI / 2], cam: { yaw: Math.PI * 0.5, pitch: 0.28, dist: 7, height: 1.3, fov: 50 } };
}

export async function CH6(G) {
  const W = await G.load(buildWaterfront);
  const P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.25, drone: 0.08, note: 65, water: 0.8, traffic: 0.2, bright: 600, verb: 0.2 });
  await G.card({ kicker: "CHAPTER 6", title: "THE QUIET DAYS", sub: "SUMMER 2026 · LOVE IN THE ORDINARY MOMENTS" });
  G.clock("4:04:01");
  G.fade(0, 2);
  const arg = npc(G, "argjila", 4, 10.2, 0);
  await G.wait(0.5);
  await G.say([{ text: "After everything, a summer evening. Nothing has to be perfect to matter." }]);
  G.objective("SPEND TIME HERE, OR MEET ARGJILA AT THE WATER.");
  // optional moments: The Memory of Us
  const us = (label, verb, pos, lines, extra) => W.interact({
    pos, label, verb, r: 1.9, sparkle: true,
    use: async () => {
      const it = W.interacts.find((i) => i.label === label);
      it?.remove();
      if (extra) await extra();
      await G.say(lines.map((l) => (typeof l === "string" ? { text: l } : l)));
      G.mem("us");
      G.ui.toast("THE MEMORY OF US " + "♥".repeat(G.state.memory.us));
    },
  });
  us("A FAMILIAR SONG", "LISTEN", [-14, 1.2, -6.8], ["The car radio, low. The song she always skips, then always goes back to.", ["ARGJILA", "Don't you dare change it."]], async () => { G.audio.musicBox(THEME.slice(0, 14), 0.32, 0.05); });
  us("A SHARED TABLE", "SIT", [-2, 1, -13.6], ["The pizza place on the corner. They always order the same thing and always say they'll try something new next time."]);
  us("AN ORDINARY ERRAND", "GO IN", [16, 1, -16.2], ["Milk, eggs, the cereal she likes. She reads the ingredients out loud like a weather report.", ["ARGJILA", "This one has 'natural flavors.' Suspicious."]]);
  us("AN ORDINARY PHOTOGRAPH", "LOOK", [10, 0.7, 8.8], [], async () => { await G.item({ title: "AN ORDINARY PHOTOGRAPH", canvas: pic("ordinary"), text: "Nobody remembers taking it. That's what makes it good." }); });
  us("SIT BESIDE ARGJILA", "SIT", [-6, 0.7, 8.6], ["They sit and watch the water for a long time without saying anything. It's enough."]);
  await G.interactOnce({
    pos: [4, 1.2, 10.2], label: "ARGJILA AT THE WATERFRONT", verb: "TALK", r: 2,
    use: async () => {
      W.interacts.slice().forEach((i) => i.remove());
      G.rig.shot([5.8, 1.6, 7.6], [4, 1.4, 10.6], true, 42);
      arg.faceToward(P.pos.x, P.pos.z);
      await G.say([["ARGJILA", "If you could go back to the beginning, knowing everything you know now..."], ["ARGJILA", "...would you still choose me?"]]);
      const c = await G.choose("", ["IN EVERY LIFETIME.", "EVEN KNOWING THE HARD DAYS.", "I'D FIND YOU ALL OVER AGAIN."]);
      G.mem("us");
      const resp = [
        [["ARGJILA", "Every lifetime is a lot of lifetimes."], ["RUFKI", "I'm patient."]],
        [["ARGJILA", "Especially the hard days?"], ["RUFKI", "Those are the ones that made it real."]],
        [["ARGJILA", "You'd have to find me first."], ["RUFKI", "I'm getting better at it."]],
      ][c];
      await G.say(resp);
      arg.face(0);
      await G.wait(1);
      // the sunset freezes
      G._dusk.material.uniforms.uWave.value = 0;
      G._dusk.material.uniforms.uScroll.value.set(0, 0);
      G.audio.ambience({ wind: 0, drone: 0, water: 0, traffic: 0, ramp: 0.3 });
      G.rig.shake = 0;
      await G.wait(1.5);
      await G.say([{ text: "The sunset stops. The traffic and the water go silent." }]);
      arg.faceToward(P.pos.x - 1.5, P.pos.z - 3);
      await G.say([["ARGJILA", "Rufki?"], ["RUFKI", "Yeah?"], ["ARGJILA", "...Who are you talking to?"]]);
      const other = npc(G, "other", P.pos.x - 1.4, P.pos.z - 2.6, 0);
      other.faceToward(P.pos.x, P.pos.z);
      G.rig.shot([P.pos.x + 2.5, 1.7, P.pos.z + 1.5], [P.pos.x - 1.4, 1.5, P.pos.z - 2.6], true, 40);
      G.audio.sting();
      await G.wait(1.3);
      G.ui.setFade(1);
      G.audio.thud();
      await G.wait(2);
    },
  });
}

// ============================================================
// CHAPTER 7 — THE OTHER RUFKI
// ============================================================
function buildBedroom(W, G) {
  env(W, { fog: 0x20242c, near: 4, far: 18, ambient: [0.36, 0.38, 0.42], dir: [0.3, 0.32, 0.36], dirVec: [1, -0.6, 0.2] });
  W.surface = "wood";
  W.room(-3, -3, 3, 4, 2.7, { floor: TEX.wood([110, 84, 60], "bedfloor"), wall: TEX.wallpaper([120, 120, 116], "bedwall") });
  W.bed(-1.8, 1.8, 0, { sheet: [70, 80, 110] });
  W.table(1.9, 3.0, { w: 1.4, d: 0.7, tint: [90, 66, 46] });
  W.mesh(boxGeo(0.1, 0.01, 0.18), mat({ color: 0x101820 }), 1.6, 0.8, 3.0);
  W.sign(-2.97, 1.6, 0, "", Math.PI / 2, { w: 1.4, h: 1.0, bg: "#c8d8e8", fg: "#c8d8e8", tw: 8, th: 8, unlit: true });
  W.light(-2.4, 1.6, 0, 0xc8d8e8, 6);
  W.frame(2.97, 1.6, 0.4, -Math.PI / 2, canvasFor("one"), 0.6, 0.45);
  W.door(0, -2.95, 0, { tint: "#5a4a3a", solid: true });
  return { start: [-0.5, 0.5, Math.PI], cam: { fixed: [2.4, 2.4, -2.4], yaw: 0, height: 1.2 } };
}
function buildParkwayDusk(W, G) {
  env(W, { fog: 0x585e66, near: 8, far: 50, ambient: [0.44, 0.44, 0.48], dir: [0.3, 0.3, 0.34], sat: 0.55 });
  W.boulevard(-10, 70, { lit: 0.3 });
  W.car(-10, 20, Math.PI, [70, 70, 80]);
  W.car(10, 32, 0, [100, 90, 70]);
  return { start: [12.8, -6, 0], cam: { yaw: 0, pitch: 0.3, dist: 6.5, height: 1.3 } };
}

export async function CH7(G) {
  let W = await G.load(buildBedroom);
  const P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.1, drone: 0.2, note: 49, traffic: 0.3, bright: 300 });
  await G.card({ kicker: "CHAPTER 7", title: "THE OTHER RUFKI", sub: "A WORLD IN WHICH SHE NEVER EXISTED" });
  G.clock("4:04:01");
  G.fade(0, 2);
  await G.wait(0.5);
  await G.say([{ text: "He wakes in his own room. Morning. Everything is normal. Something is missing, and he can't remember what." }]);
  G.objective("SEARCH THE PHONE AND THE PHOTOGRAPH.");
  await Promise.all([
    G.interactOnce({ pos: [1.6, 1, 3.0], label: "PHONE", verb: "CHECK", r: 1.5, sparkle: true, use: async () => {
      await G.say([{ phone: true, who: "CONTACTS", text: "A... B... no 'Argjila'. No messages. No photos. No call at 4:04." }, ["RUFKI", "No. No, no, no."]]);
    } }),
    G.interactOnce({ pos: [2.6, 1.6, 0.4], label: "PHOTOGRAPH", verb: "LOOK", r: 1.5, sparkle: true, use: async () => {
      await G.item({ title: "A PHOTOGRAPH OF ONE", canvas: pic("one"), text: "The waterfront. He remembers her standing right there.\nThe picture shows only him." });
    } }),
  ]);
  G.objective("RETURN TO OCEAN PARKWAY.");
  await G.interactOnce({ pos: [0, 1, -2.5], label: "DOOR", verb: "LEAVE", r: 1.5 });
  G.audio.door();
  await G.fade(1, 0.8);
  W = await G.load(buildParkwayDusk);
  G.audio.ambience({ wind: 0.3, drone: 0.25, note: 49, traffic: 0.5, bright: 280 });
  // people who know Rufki but nobody who knows Argjila
  for (let i = 0; i < 5; i++) {
    const s = new Character("stranger", { shirt: [[90, 84, 78], [60, 70, 90], [110, 80, 60]][i % 3], face: "eyes" });
    const x = i % 2 ? 13.5 : -13.5, z0 = i * 12;
    s.setPos(x, 0, z0);
    W.add(s.root);
    let z = z0, dir = i % 2 ? 1 : -1;
    W.every((dt) => { z += dir * dt; if (z > 66) dir = -1; if (z < -6) dir = 1; s.root.position.z = z; s.face(dir > 0 ? 0 : Math.PI); s.update(dt, 1); });
  }
  const other = npc(G, "other", 6.6, 24, -Math.PI / 2);
  G.fade(0, 1.2);
  G.objective("FIND THE OTHER RUFKI.");
  await new Promise((res) => W.trigger({ x: 6.6, z: 24, r: 4.5, enter: res }));
  let res;
  await G.cutscene(async () => {
    G.rig.shot([10.5, 1.7, 20.5], [6.6, 1.5, 24], true, 45);
    other.faceToward(P.pos.x, P.pos.z);
    await G.say([
      ["THE OTHER RUFKI", "You found me. Took you long enough."],
      ["THE OTHER RUFKI", "I'm you. From the one where you never met her. Somewhere the wall between our lives got thin."],
      ["THE OTHER RUFKI", "Do you know what it's like to remember someone you've never met?"],
      ["THE OTHER RUFKI", "I remember her laugh. Her voice. The way she looks at you. But she doesn't know I exist."],
      ["THE OTHER RUFKI", "Stay here. It's empty, but it's safe. She lives on in the real timeline. Nobody gets hurt."],
      ["THE OTHER RUFKI", "Or go back into the nightmare and risk trapping you both."],
      ["THE OTHER RUFKI", "The Unsaid is only a symptom. Something older gathers lost minutes. The Keeper of Minutes. And the two of you are one of its greatest prizes."],
    ]);
    const c = await G.choose("", ["RETURN TO ARGJILA", "STAY IN THE SAFE WORLD"]);
    if (c === 1) { res = { ending: "otherme" }; return; }
    await G.say([["THE OTHER RUFKI", "...Yeah. I'd have said that too. Go. Before the clock decides for you."]]);
    await fadeChar(G, other, 0, 1.2);
    await G.fade(1, 1.4);
  });
  return res;
}

// ============================================================
// CHAPTER 8 — THE CLOCK TOWER
// ============================================================
const LEVELS = [
  { q: "THE MEMORY LOCK ASKS: WHEN DID WE FIRST MEET?", a: ["OCTOBER 24, 2026", "OCTOBER 24, 2025", "APRIL 4, 2025"], ok: 1, vision: "LIVE THE FIRST MEETING FOREVER", vpic: "meeting" },
  { q: "THE MEMORY LOCK ASKS: WHEN DID WE BECOME OFFICIAL?", a: ["APRIL 4, 2025", "OCTOBER 24, 2025", "APRIL 4, 2026"], ok: 2, vision: "A FLAWLESS LOVE, UNTOUCHED BY CONFLICT", vpic: "couple" },
  { q: "THE MEMORY LOCK ASKS: WHAT DID SHE REALLY SAY?", a: ["\"I NEVER LOVED YOU.\"", "\"I'M SCARED TOO. STILL HERE.\"", "\"I DON'T REMEMBER YOU.\""], ok: 1, vision: "A GUARANTEED FUTURE: HOME, CHILDREN, OLD AGE", vpic: "ring" },
];
function buildTower(level) {
  return (W, G) => {
    env(W, { fog: 0x07060a, near: 6, far: 34, ambient: [0.22, 0.2, 0.24], dir: [0.12, 0.1, 0.08] });
    W.surface = "street";
    // impossible Brooklyn: a floating platform made of mismatched floors
    const tiles = [TEX.asphalt(), TEX.carpet(), TEX.tile(), TEX.wood(), TEX.sidewalk()];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) W.ground(-6 + i * 4 + 2, -6 + j * 4 + 2, 4, 4, tiles[(i + j * 2 + level) % tiles.length], { scale: 1.5 });
    W.mesh(boxGeo(16.2, 3, 16.2), mat({ color: 0x15131a }), 0, -1.52, 0);
    W.bounds = { x0: -8, z0: -8, x1: 8, z1: 8 };
    // pillars with clocks, all reading 4:04
    for (const [x, z] of [[-6.5, -6.5], [6.5, -6.5], [-6.5, 4], [6.5, 4]]) {
      W.box(x, 0, z, 1, 9, 1, mat({ map: TEX.brick([70, 56, 50], "towerbrick") }));
      W.wallClock(x, 3.2, z + 0.51, 0, 0.45);
    }
    // floating fragments of the city
    W.mesh(boxGeo(5, 0.3, 3), mat({ map: TEX.road() }), -14, 6, 10).rotation.z = 0.3;
    W.mesh(boxGeo(3, 4, 3), mat({ map: TEX.facade([90, 70, 60], 0.5, 41) }), 13, 8, 6).rotation.y = 0.6;
    W.mesh(boxGeo(2, 0.1, 2), mat({ map: TEX.carpet() }), -9, 11, -4).rotation.x = 0.5;
    W.streetSign(-3, -3, "4:04 AVE", "4:04 ST");
    W.table(3.5, -3.5, { w: 0.9, d: 0.9, chairs: true, cloth: 0xd0c8c0, candle: true });
    // stairs to the memory lock
    W.stairs(0, 3, 2.4, 8, 0.25, 0.5, 1, mat({ map: TEX.concrete([80, 76, 70], "towerstep") }));
    W.mesh(boxGeo(2.4, 2, 1.2), mat({ map: TEX.concrete([80, 76, 70], "towerstep") }), 0, 1, 7.6);
    W.floor(-1.2, 7, 1.2, 8, 2);
    for (const s of [-1, 1]) W.collider(s * 1.2 + s * 0.05 - 0.05, 3, s * 1.2 + s * 0.05 + 0.05, 8);
    const lock = W.door(0, 7.95, Math.PI, { tint: "#2a2014", sign: `LEVEL ${level + 1}` });
    lock.position.y = 2;
    W.wallClock(0, 5.4, 7.9, Math.PI, 0.7);
    W.light(0, 4.5, 6.5, 0xffd890, 8);
    // the Keeper's vision: a glowing doorway
    const v = W.frame(-7.9, 1.6, -1, Math.PI / 2, canvasFor(LEVELS[level].vpic), 1.4, 1.05, { glow: 0.8, frame: 0xb08a40 });
    W.light(-7, 1.6, -1, 0xffe0a0, 6);
    W.glow(-7.6, 1.6, -1, 2.5, 0xffe0a0);
    for (let i = 0; i < 4; i++) W.light(0, 6, -4 + i * 3, 0x8070a0, 6);
    return { start: [0, -3, 0], cam: { yaw: 0, pitch: 0.5, dist: 5.2, height: 1.2 } };
  };
}
function buildDoors(W, G) {
  env(W, { fog: 0x0a0812, near: 6, far: 40, ambient: [0.3, 0.26, 0.3], dir: [0.1, 0.1, 0.12] });
  W.ground(0, 0, 18, 18, TEX.tile("#5a5260", "#3a3440", "doortile"), { scale: 1.5 });
  W.mesh(new THREE.CylinderGeometry(9.2, 9.2, 1, 16), mat({ color: 0x15131a }), 0, -0.52, 0);
  W.bounds = { x0: -8, z0: -8, x1: 8, z1: 8 };
  // rings of doors rising into the dark
  const dm = mat({ map: TEX.door("#3a2a20", "towerdoor"), emissive: 0.15 });
  const lm = mat({ color: 0xffe8b0, unlit: true });
  for (let ring = 0; ring < 6; ring++) {
    const n = 22, R = 9.5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.13;
      const d = W.mesh(boxGeo(1.1, 2.2, 0.1, 1, 2.2), Math.random() < 0.1 ? lm : dm, Math.sin(a) * R, 1.1 + ring * 2.6, Math.cos(a) * R, a + Math.PI);
    }
  }
  for (let i = 0; i < 6; i++) W.light(Math.sin(i) * 6, 2 + i * 2, Math.cos(i) * 6, 0xffc890, 8);
  return { start: [0, -6, 0], cam: { yaw: 0, pitch: 0.3, dist: 6, height: 1.3 } };
}

export async function CH8(G) {
  let result;
  for (let level = 0; level < 3; level++) {
    const W = await G.load(buildTower(level));
    const P = G.player;
    const L = LEVELS[level];
    G.ui.setFade(1);
    G.audio.ambience({ wind: 0.6, drone: 0.5, note: 41 + level * 3, bright: 240, verb: 0.7 });
    // ticking that never advances
    let tk = 0;
    W.every((dt) => { tk += dt; if (tk > 1) { tk = 0; G.audio.tick(0.05); } });
    if (level === 0) await G.card({ kicker: "CHAPTER 8", title: "THE CLOCK TOWER", sub: "THE TRUTH ABOUT 4:04" });
    else await G.card({ kicker: "THE CLOCK TOWER", title: `LEVEL ${level + 1}`, sub: "IMPOSSIBLE BROOKLYN RISES THROUGH DARKNESS", hold: 2.2 });
    G.clock("4:04");
    G.fade(0, 1.2);
    if (level === 0) {
      await G.wait(0.5);
      await G.say([{ text: "Where Ocean Parkway should stand: a tower built from impossible Brooklyn. Every clock reads 4:04." }]);
    }
    G.objective("RECALL A TRUE MEMORY TO OPEN THE NEXT STAIR.");
    // the Keeper's temptation
    W.interact({
      pos: [-7.4, 1.4, -1], label: "THE KEEPER'S VISION", verb: "LOOK", r: 2, sparkle: true,
      use: async () => {
        await G.item({ title: L.vision, canvas: pic(L.vpic), text: "Every vision is beautiful. Every vision is frozen. Nobody inside has the freedom to change." });
        await G.say([["THE KEEPER OF MINUTES", "I can keep this for you. No doubt. No separation. No ending. Only give me your minutes."]]);
        const c = await G.choose("", ["REFUSE A FROZEN LIFE", "ACCEPT THE KEEPER'S OFFER"]);
        if (c === 1) { result = { ending: "forever" }; G.signal("tower"); return; }
        await G.say([{ text: "The vision dims. Somewhere, a clock skips." }]);
        W.interacts.find((i) => i.label === "THE KEEPER'S VISION")?.remove();
      },
    });
    if (level === 0) W.trigger({ x0: -8, z0: -4, x1: 8, z1: -2, enter: () => G.ui.whisper("\"STAY, AND YOU WILL NEVER LOSE HER.\"") });
    // the memory lock
    const lockLoop = async () => {
      while (true) {
        await G.interactOnce({
          pos: [0, 3, 7.2], label: "THE MEMORY LOCK", verb: "RECALL", r: 1.7,
          use: async () => {
            const c = await G.choose(L.q, L.a);
            if (c === L.ok) { G.audio.chime(); G.signal("tower"); return; }
            G.audio.hit();
            G.rig.shake = 0.3;
            await G.say([{ text: "The clock hands spin wildly and snap back to 4:04. That is not what happened." }]);
          },
        });
        if (G.signals.tower === true) return;
      }
    };
    lockLoop();
    await G.until("tower");
    if (result) return result;
    G.audio.door();
    await G.fade(1, 0.8);
  }
  // ---- a thousand doors ----
  const W = await G.load(buildDoors);
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.3, drone: 0.3, note: 52, bright: 400, verb: 0.8 });
  await G.card({ kicker: "THE CLOCK TOWER", title: "A THOUSAND DOORS", sub: "EACH ONE A POSSIBLE FUTURE", hold: 2.4 });
  const arg = npc(G, "argjila", 0, 3, Math.PI);
  G.fade(0, 1.4);
  G.objective("REACH ARGJILA.");
  await new Promise((res) => W.trigger({ x: 0, z: 3, r: 2.6, enter: res }));
  await G.cutscene(async () => {
    G.rig.shot([2.2, 1.7, -0.6], [0, 1.5, 2.6], true, 44);
    arg.faceToward(G.player.pos.x, G.player.pos.z);
    await G.say([
      ["ARGJILA", "I waited for you."],
      ["ARGJILA", "It told me if the clock ever reached 4:05, you would disappear. So I kept it still. For you."],
      ["RUFKI", "It lied. Time doesn't take me away from you. It just... moves."],
      ["ARGJILA", "I don't know what happens after this."],
      ["RUFKI", "Neither do I."],
      ["ARGJILA", "Are you scared?"],
      ["RUFKI", "Yeah."],
      ["ARGJILA", "...Me too."],
    ]);
    G.audio.tick(0.3);
    await G.wait(1);
    G.audio.tock(0.3);
    await G.wait(1);
    G.audio.tick(0.3);
    await G.say([{ text: "Somewhere above them, the clock begins ticking." }]);
    await G.fade(1, 1.5);
  });
}

// ============================================================
// FINAL CHAPTER — ONE MINUTE AWAY
// ============================================================
// escape road along +z through places you have learned to recognise
const SEGS = [
  { z0: 0, z1: 25, name: "THE FIRST MEETING", floor: () => TEX.sidewalk(), wall: () => TEX.facade([140, 110, 90], 0.3, 31) },
  { z0: 25, z1: 50, name: "THE BATHHOUSE", floor: () => TEX.tile(), wall: () => TEX.tile("#c8d4d8", "#a0b4c0", "walltile") },
  { z0: 50, z1: 75, name: "THE HOUSE OF ALMOST", floor: () => TEX.wood([80, 56, 40], "hfloor"), wall: () => TEX.wallpaper([90, 70, 70], "hwp") },
  { z0: 75, z1: 100, name: "THE WATERFRONT", floor: () => TEX.sidewalk(), wall: () => TEX.facade([46, 40, 56], 0.4, 90) },
  { z0: 100, z1: 125, name: "THE SCHOOL CORRIDOR", floor: () => TEX.tile("#a8a8a0", "#8a8a80", "schooltile"), wall: () => TEX.concrete([120, 130, 110], "schoolwall") },
  { z0: 125, z1: 160, name: "OCEAN PARKWAY", floor: () => TEX.road(), wall: () => TEX.facade([92, 80, 72], 0.25, 11) },
];
const FORKS = [
  { z: 36, good: "THE FIRST MEETING · OCT 24, 2025", bad: "WE MET AS CHILDREN. IT WAS PERFECT.", goodLeft: true },
  { z: 72, good: "I'M SCARED TOO. STILL HERE.", bad: "NOTHING WILL EVER CHANGE.", goodLeft: false },
  { z: 108, good: "WE'LL MAKE NEW MEMORIES", bad: "STAY IN THE LAST SECOND", goodLeft: true },
];
function buildPeak(W, G) {
  env(W, { fog: 0x0a0608, near: 8, far: 50, ambient: [0.3, 0.24, 0.24], dir: [0.3, 0.2, 0.1] });
  W.ground(0, 0, 16, 16, TEX.tile("#5a5260", "#3a3440", "doortile"), { scale: 1.5 });
  W.mesh(boxGeo(16.2, 2, 16.2), mat({ color: 0x15131a }), 0, -1.02, 0);
  W.bounds = { x0: -8, z0: -8, x1: 8, z1: 8 };
  const k = makeKeeper();
  k.root.position.set(0, -1, 14);
  k.root.scale.setScalar(1.6);
  W.add(k.root);
  W.every((dt) => k.update(dt));
  W.light(0, 8, 10, 0xffc080, 22);
  W.light(0, 3, 0, 0xffa060, 10);
  return { start: [0, -4, 0], cam: { yaw: 0, pitch: 0.12, dist: 6, height: 1.6, fov: 60 } };
}
function buildEscape(W, G) {
  env(W, { fog: 0x0c0a0e, near: 6, far: 32, ambient: [0.28, 0.26, 0.28], dir: [0.12, 0.1, 0.1] });
  for (const s of SEGS) {
    const cz = (s.z0 + s.z1) / 2, d = s.z1 - s.z0;
    W.ground(0, cz, 10, d, s.floor(), { scale: 2 });
    W.wall(-5, cz, d, 4, Math.PI / 2, s.wall(), { su: 4, sv: 4 });
    W.wall(5, cz, d, 4, -Math.PI / 2, s.wall(), { su: 4, sv: 4 });
    W.sign(-4.95, 3, s.z0 + 3, s.name, Math.PI / 2, { w: 3, h: 0.4, bg: "#101010", fg: "#e8d8b0", tw: 128, th: 16, size: 8, unlit: true });
    for (let z = s.z0 + 4; z < s.z1; z += 8) W.light(0, 3.5, z, 0xffd8b0, 9, { flicker: 0.12 });
  }
  W.collider(-6, 0, -5, 160); W.collider(5, 0, 6, 160);
  W.wall(0, 0, 10, 4, 0, TEX.concrete());
  W.bounds = { x0: -5, z0: 0, x1: 5, z1: 160 };
  // forks: a divider wall and two gates; the false gate loops you back
  G._forks = FORKS.map((f) => {
    W.box(0, 0, f.z - 1, 0.6, 4, 7, mat({ map: TEX.concrete([60, 56, 60], "divider") }));
    const lx = -2.6, rx = 2.6;
    const goodX = f.goodLeft ? lx : rx, badX = f.goodLeft ? rx : lx;
    W.sign(goodX, 2.9, f.z - 4.5, f.good, Math.PI, { w: 3.9, h: 0.8, bg: "#1a1410", fg: "#ffe8b0", tw: 128, th: 26, size: 10, unlit: true });
    W.sign(badX, 2.9, f.z - 4.5, f.bad, Math.PI, { w: 3.9, h: 0.8, bg: "#1a1410", fg: "#ffe8b0", tw: 128, th: 26, size: 10, unlit: true });
    W.light(goodX, 2, f.z - 3, 0xffe0b0, 6);
    W.light(badX, 2, f.z - 3, 0xffe0b0, 6);
    return { ...f, goodX, badX };
  });
  // the crossing at the end
  for (let x = -4; x <= 4; x += 1.2) W.mesh(boxGeo(0.6, 0.01, 2.2), mat({ color: 0xc8c4b8 }), x, 0.02, 152);
  W.lamp(-4.4, 150, { side: 1, color: 0xfff0d0, range: 12 });
  W.lamp(4.4, 154, { side: -1, color: 0xfff0d0, range: 12 });
  // the darkness that eats the tower behind you
  const dark = W.mesh(boxGeo(10.4, 8, 0.6), mat({ color: 0x000000, noFog: true }), 0, 4, -3);
  const darkFog = W.mesh(new THREE.PlaneGeometry(10, 6), mat({ map: TEX.glow(), additive: true, color: 0x302030 }), 0, 2, -2);
  G._dark = { mesh: dark, fog: darkFog };
  return { start: [0, 3, 0], cam: { yaw: 0, pitch: 0.38, dist: 6.5, height: 1.2 } };
}

export async function FINAL(G) {
  let W = await G.load(buildPeak);
  let P = G.player;
  G.ui.setFade(1);
  G.audio.ambience({ wind: 0.7, drone: 0.7, note: 36, bright: 200, verb: 0.8 });
  await G.card({ kicker: "FINAL CHAPTER", title: "ONE MINUTE AWAY", sub: "4:04:59 AM · THE LAST SECOND" });
  G.clock("4:04:59");
  const arg = npc(G, "argjila", 1.2, -3.6, 0);
  G.fade(0, 1.6);
  let res;
  await G.cutscene(async () => {
    G.rig.shot([0, 1.2, -9], [0, 7, 12], true, 62);
    G.rig.shake = 0.1;
    G.audio.sting(true);
    await G.say([
      { text: "The Keeper emerges from the clock itself: a giant of interlocking memories and broken mechanisms." },
      ["THE KEEPER OF MINUTES", "Stay, and you will never lose her."],
      ["ARGJILA", "That's not living."],
      ["THE KEEPER OF MINUTES", "Outside these walls, everything ends eventually."],
      ["RUFKI", "Maybe."],
      ["THE KEEPER OF MINUTES", "Then why choose something you can't keep forever?"],
    ]);
    G.rig.shot([2.4, 1.6, -6], [0.6, 1.4, -3.6], true, 45);
    const c = await G.choose("He reaches for Argjila's hand.", ["MOVE FORWARD TOGETHER", "STAY FOREVER"]);
    if (c === 1) { res = { ending: "forever" }; return; }
    await G.say([["RUFKI", "Because I don't need forever to know it matters."]]);
    G.audio.thud();
    G.rig.shake = 0.5;
    await G.say([{ text: "The tower begins to collapse." }]);
    await G.fade(1, 0.6);
  });
  if (res) return res;
  // ---------------- the escape ----------------
  W = await G.load(buildEscape);
  P = G.player;
  G.audio.ambience({ wind: 0.8, drone: 0.8, note: 33, bright: 300, verb: 0.5 });
  const her = new Character("argjila");
  her.setPos(-1, 0, 1.5);
  W.add(her.root);
  // she follows a few steps behind
  W.every((dt) => {
    if (done) return; // the ending cutscene takes over her movement
    const p = her.root.position;
    // run alongside him, a half step behind, on his right
    const tx = P.pos.x - Math.sin(P.yaw) * 0.5 - Math.cos(P.yaw) * 0.9, tz = P.pos.z - Math.cos(P.yaw) * 0.5 + Math.sin(P.yaw) * 0.9;
    const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    if (d > 6) { p.x = tx; p.z = tz; }
    const sp = d > 0.25 ? Math.min(4.2, d * 3) : 0;
    if (sp > 0) { p.x += (dx / d) * sp * dt; p.z += (dz / d) * sp * dt; her.face(Math.atan2(dx, dz)); }
    const pr = { x: p.x, z: p.z };
    W.resolve(pr, 0.3);
    p.x = pr.x; p.z = pr.z;
    her.update(dt, sp, sp > 2.6);
  });
  G.fade(0, 0.8);
  G.objective("RUN. CHOOSE THE AUTHENTIC ROUTE.");
  G.ui.toast("HOLD □ / SHIFT TO RUN", 4);
  let darkZ = -6, check = { z: 3 }, fork = 0, done = false, flashing = false;
  const D = G._dark;
  W.every((dt) => {
    if (done) return;
    // debris and shaking
    G.rig.shake = Math.max(G.rig.shake, 0.04);
    if (Math.random() < dt * 1.2) { G.audio.thud(); G.rig.shake = 0.15; }
    if (!G.canMove()) return;
    darkZ += dt * 2.7;
    darkZ = Math.max(darkZ, P.pos.z - 26);
    D.mesh.position.z = darkZ;
    D.fog.position.z = darkZ + 0.4;
    const gap = P.pos.z - darkZ;
    G.audio.staticLevel(Math.max(0, 1 - gap / 10));
    if (gap < 0.6 && !flashing) {
      flashing = true;
      G.cutscene(async () => {
        G.audio.hit();
        await G.fade(1, 0.3);
        await G.say([{ text: "The dark closes over them. ...He opens his eyes again a little way back." }]);
        P.place(0, check.z, 0);
        her.setPos(-1, 0, check.z - 1.5);
        darkZ = check.z - 12;
        G.rig.release(true);
        await G.fade(0, 0.5);
        flashing = false;
      });
    }
    // fork gates
    const f = G._forks[fork];
    if (f && P.pos.z > f.z + 1.5) {
      const tookGood = Math.sign(P.pos.x) === Math.sign(f.goodX);
      if (tookGood) {
        G.audio.chime();
        check = { z: f.z + 2.5 };
        fork++;
        G.ui.toast(fork < 3 ? "AUTHENTIC ROUTE" : "THE STREET IS AHEAD");
      } else if (!flashing) {
        flashing = true;
        G.cutscene(async () => {
          G.audio.sting();
          U.uAdd.value.setRGB(0.3, 0.3, 0.32);
          await G.wait(0.12);
          U.uAdd.value.setRGB(0, 0, 0);
          G.ui.whisper("A FALSE MEMORY. THE ROAD LOOPS BACK.", 2.5);
          P.place(0, f.z - 9, 0);
          her.setPos(-1, 0, f.z - 10.5);
          darkZ = Math.min(darkZ, f.z - 19);
          G.rig.release(true);
          flashing = false;
        });
      }
    }
  });
  await new Promise((r) => W.trigger({ x0: -5, z0: 148, x1: 5, z1: 151, enter: r }));
  done = true;
  G.audio.staticLevel(0);
  await G.cutscene(async () => {
    G.player.place(-0.6, 150.2, 0);
    her.setPos(0.6, 0, 150.2);
    her.face(0);
    G.rig.shot([3.4, 1.6, 156], [0, 1.3, 150.4], true, 46);
    G.audio.ambience({ wind: 0.2, drone: 0.1, note: 55, bright: 600, ramp: 2 });
    G.clock("4:04:59");
    await G.say([
      { text: "The last street crossing. Ocean Parkway. The clock reads 4:04:59." },
      ["ARGJILA", "What if we don't remember any of this?"],
      ["RUFKI", "Then we'll make new memories."],
    ]);
    await G.choose("", ["STEP FORWARD TOGETHER"]);
    await Promise.all([G.walkTo(G.player.ch, -0.6, 153.5, 1.2), G.walkTo(her, 0.6, 153.5, 1.2)]);
    G.audio.tick(0.4);
    G.clock("4:05");
    await whiteFlash(G, 1.2);
  });
}

// ============================================================
// Endings
// ============================================================
export function decideEnding(G) {
  const m = G.state.memory, f = G.state.flags;
  const full = m.fragments >= 3 && m.photos >= 4 && f.ring && !f.interfered && m.us >= 3;
  return full ? "always" : "waited";
}

function buildSunrise(W, G) {
  env(W, { fog: 0xe8b890, near: 14, far: 70, ambient: [0.6, 0.52, 0.48], dir: [0.9, 0.7, 0.5], dirVec: [0.4, -0.5, 1] });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 12, 8), mat({ map: TEX.sky("#6a8ac0", "#f0b890", "#ffe0b0", "sunrise"), unlit: true, noFog: true, side: THREE.BackSide }));
  W.add(sky);
  W.boulevard(-20, 90, { lit: 0.05 });
  const car = W.car(10, 0, 0, [62, 66, 82]);
  // traffic returning to ordinary motion
  const cars = [];
  for (let i = 0; i < 5; i++) { const c = W.car(i % 2 ? 2.5 : -2.5, i * 18 - 10, i % 2 ? 0 : Math.PI, [[150, 40, 40], [60, 80, 120], [200, 190, 160]][i % 3], { solid: false, lights: true }); cars.push([c, i % 2 ? 1 : -1]); }
  W.every((dt) => cars.forEach(([c, d]) => { c.position.z += d * dt * 9; if (c.position.z > 90) c.position.z = -20; if (c.position.z < -20) c.position.z = 90; }));
  return { start: [8.6, -1.4, 0.4] };
}
function buildDayStreet(W, G) {
  env(W, { fog: 0xb8bcc0, near: 12, far: 60, ambient: [0.55, 0.55, 0.58], dir: [0.6, 0.58, 0.52] });
  W.boulevard(-20, 90, { lit: 0.05 });
  return { start: [13.5, 0, 0] };
}
function buildFrozenBench(W, G) {
  env(W, { fog: 0xe0d0b0, near: 10, far: 40, ambient: [0.62, 0.6, 0.56], dir: [0.6, 0.55, 0.45], sat: 0.6 });
  W.ground(0, 0, 40, 30, TEX.grass(), { scale: 3 });
  W.ground(0, -6, 40, 6, TEX.sidewalk(), { scale: 1.5 });
  W.bench(0, 0, Math.PI);
  for (let x = -12; x <= 12; x += 8) W.tree(x, 4);
  return { start: [-0.45, 0.1, Math.PI] };
}
function buildBook(W, G) {
  env(W, { fog: 0x1a120c, near: 4, far: 16, ambient: [0.36, 0.3, 0.24], dir: [0.2, 0.15, 0.1] });
  W.room(-3, -3, 3, 3, 2.6, { floor: TEX.carpet([90, 50, 40], "bookcarpet"), wall: TEX.wallpaper([110, 90, 70], "bookwp") });
  W.table(0, 0, { w: 1.2, d: 0.8, tint: [80, 56, 40] });
  const book = W.mesh(boxGeo(0.4, 0.06, 0.3), mat({ map: canvasFor("book") }), 0, 0.82, 0);
  W.light(0, 2.2, 0, 0xffc890, 6);
  return { start: [0, -2.5, 0] };
}
function buildCrossing(W, G) {
  env(W, { fog: 0x8a8a90, near: 10, far: 55, ambient: [0.5, 0.5, 0.54], dir: [0.5, 0.48, 0.44], sat: 0.85 });
  W.boulevard(-30, 35, { lit: 0.1 });
  W.boulevard(45, 100, { lit: 0.1 });
  W.ground(0, 40, 60, 10, TEX.road(), { scale: 6 });
  return { start: [0, 0, 0] };
}

async function endingScene(G, builder, setup) {
  await G.load(builder);
  G.player.ch.setVisible(false);
  G.player.frozen = true;
  G.mode = "cutscene";
  return setup && setup(G.world);
}

export const ENDINGS = {
  async always(G) {
    await endingScene(G, buildSunrise);
    const a = npc(G, "rufki", 8.7, -1.2, -Math.PI / 2 + 0.3), b = npc(G, "argjila", 8.7, 0.2, -Math.PI / 2 - 0.3);
    G.audio.ambience({ wind: 0.2, drone: 0.05, note: 65, traffic: 0.7, bright: 900, ramp: 3 });
    G.rig.shot([3, 1.4, -4], [9, 1.3, 0], true, 48);
    G.clock("4:05");
    G.fade(0, 3);
    G.audio.musicBox(THEME, 0.5, 0.045);
    let t = 0;
    G.world.every((dt) => { t += dt; G.rig.override.pos.set(3 - t * 0.15, 1.4 + t * 0.35, -4 - t * 0.4); G.rig.override.look.set(9, 1.3 + t * 0.15, t * 0.8); });
    await G.wait(2.5);
    await G.lines(["4:05 AM.", "They wake together in the parked car at sunrise.", "They both remember the journey.", "Their future is still unknown.", "The city returns to ordinary motion."], { cls: "clear", hold: 9 });
    await G.wait(1);
    await G.fade(1, 2);
    await G.card({ kicker: "ENDING 1 OF 5", title: "ALWAYS", sub: "THE TRUE ENDING", hold: 4 });
    if (G.state.flags.ngplus) await ENDINGS.before(G, true);
    await ENDINGS.credits(G);
    await ENDINGS.post(G);
  },
  async waited(G) {
    await endingScene(G, buildDayStreet);
    const a = new Character("rufki"), b = new Character("argjila");
    a.setPos(13.4, 0, -6).face(0); b.setPos(13.6, 0, 26).face(Math.PI);
    G.world.add(a.root); G.world.add(b.root);
    G.audio.ambience({ wind: 0.2, drone: 0.15, note: 55, traffic: 0.6, bright: 600, ramp: 3 });
    G.rig.shot([9, 2.2, 6], [13.5, 1.2, 10], true, 50);
    G.clock("4:05");
    G.fade(0, 2.5);
    await G.lines(["Rufki escapes. But neither of them remembers what they had.", "Months later, on Ocean Parkway..."], { cls: "clear", hold: 6 });
    await Promise.all([G.walkTo(a, 13.3, 14, 1.3), G.walkTo(b, 13.7, 4, 1.3)]);
    await G.wait(0.8);
    a.faceToward(13.7, 4); b.faceToward(13.3, 14);
    G.rig.shot([10.5, 1.7, 9], [13.5, 1.5, 9], true, 40);
    await G.wait(2.5);
    await G.lines(["They stop. They look back at each other,", "struck by a familiarity neither of them can explain."], { cls: "clear", hold: 6 });
    await G.fade(1, 2);
    await G.card({ kicker: "ENDING 2 OF 5", title: "THE ONE WHO WAITED", sub: "THE BITTERSWEET ENDING", hold: 4 });
    await ENDINGS.credits(G);
    await ENDINGS.post(G);
  },
  async forever(G) {
    await endingScene(G, buildFrozenBench);
    const a = npc(G, "rufki", -0.45, 0.1, Math.PI), b = npc(G, "argjila", 0.45, 0.1, Math.PI);
    a.hips.position.y = b.hips.position.y = 0.5;
    [a, b].forEach((c) => { c.legL.th.rotation.x = c.legR.th.rotation.x = -1.5; c.legL.kn.rotation.x = c.legR.kn.rotation.x = 1.5; c.update = () => {}; });
    G.audio.ambience({ wind: 0, drone: 0.2, note: 49, ramp: 1 });
    G.rig.shot([0, 1.3, -3.4], [0, 1.0, 0], true, 45);
    G.clock("4:04");
    G.fade(0, 2.5);
    G.audio.musicBox(THEME.slice(0, 7), 0.5, 0.04);
    await G.lines(["He accepts the Keeper's offer.", "They repeat a beautiful, perfectly predictable day. Forever."], { cls: "clear", hold: 6 });
    G.audio.musicBox(THEME.slice(0, 7), 0.5, 0.04);
    await G.lines(["She begins a sentence.", "He mouths every word before she speaks."], { cls: "clear", hold: 5 });
    G.audio.musicBox(THEME.slice(0, 7), 0.5, 0.04);
    await G.lines(["The clock never moves."], { cls: "clear", hold: 4 });
    await G.fade(1, 2);
    await G.card({ kicker: "ENDING 3 OF 5", title: "4:04 FOREVER", sub: "THE BAD ENDING", hold: 4 });
    await ENDINGS.credits(G);
  },
  async otherme(G) {
    await endingScene(G, buildBedroom);
    G.world.colliders = [];
    const a = npc(G, "other", -0.4, 0.2, Math.PI / 2), b = npc(G, "argjila", 0.9, 0.2, -Math.PI / 2);
    G.audio.ambience({ wind: 0, drone: 0.3, note: 46, ramp: 1 });
    G.rig.shot([2.2, 1.7, -2.2], [0.2, 1.4, 0.2], true, 45);
    G.clock("4:05");
    G.fade(0, 2);
    await G.lines(["Rufki stays in the empty, safe world.", "The other Rufki takes his place, carrying borrowed memories."], { cls: "clear", hold: 6 });
    await G.say([
      ["ARGJILA", "Do you remember the bathhouse? What I said, after?"],
      ["RUFKI?", "...You said it was all the big moments that made you want to stay."],
      { text: "It is almost right." },
    ]);
    b.faceToward(-0.4, 0.2);
    G.rig.shot([0.5, 1.6, -0.3], [0.9, 1.55, 0.2], true, 30);
    G.audio.sting(true);
    await G.wait(1.4);
    G.ui.setFade(1);
    G.audio.thud();
    await G.wait(2);
    await G.card({ kicker: "ENDING 4 OF 5", title: "THE OTHER ME", sub: "THE HORROR ENDING", hold: 4 });
    await ENDINGS.credits(G);
  },
  async before(G, chained) {
    await endingScene(G, buildBook);
    const a = npc(G, "kidR", -0.9, -0.6, Math.PI / 2 + 0.4), b = npc(G, "kidA", 0.9, -0.6, -Math.PI / 2 - 0.4);
    G.rig.shot([0, 1.6, -2.4], [0, 0.8, 0], true, 45);
    G.fade(0, 2);
    await G.lines(["Years later, two children find an old book titled ONE MINUTE AWAY."], { cls: "clear", hold: 5 });
    await G.item({ title: "ONE MINUTE AWAY", canvas: pic("book"), text: "Inside: a photograph of Rufki and Argjila beside a clock at 4:05.\nOn the next page, a map of a town neither parent remembers." });
    await G.lines(["Their parents call them from another room.", "Other lost possibilities still exist."], { cls: "clear", hold: 5 });
    await G.fade(1, 2);
    await G.card({ kicker: "ENDING 5 OF 5", title: "BEFORE WE KNEW", sub: "THE SECRET ENDING", hold: 4 });
    if (!G.meta.endings.includes("before")) { G.meta.endings.push("before"); G.saveMeta(); }
  },
  async credits(G) {
    G.ui.setFade(1);
    G.audio.musicBox(THEME, 0.5, 0.04);
    await G.lines(["ONE MINUTE AWAY", "THE ROAD BETWEEN US"], { cls: "big", hold: 4.5 });
    await G.lines(["A PS1-inspired psychological horror love story", "for Rufki and Argjila"], { hold: 4.5 });
    await G.lines(["Story · Rufki", "Ocean Parkway, Brooklyn · as itself"], { hold: 4 });
  },
  async post(G) {
    // POST-CREDITS — THE FIRST MINUTE
    await endingScene(G, buildCrossing);
    const a = new Character("kidR"), b = new Character("kidA");
    a.setPos(-14, 0, 38).face(Math.PI / 2); b.setPos(14, 0, 42).face(-Math.PI / 2);
    G.world.add(a.root); G.world.add(b.root);
    const car = G.world.car(-30, 40, Math.PI / 2, [150, 40, 40], { solid: false, lights: true });
    G.audio.ambience({ wind: 0.2, drone: 0.1, note: 55, traffic: 0.4, bright: 700, ramp: 1 });
    G.rig.shot([0, 2.2, 30], [0, 1, 40], true, 58);
    G.clock(null);
    G.fade(0, 2);
    await G.lines(["THE FIRST MINUTE"], { cls: "clear", hold: 3 });
    const walk = Promise.all([G.walkTo(a, -1.2, 38, 1.2), G.walkTo(b, 1.2, 42, 1.2)]);
    let t = 0;
    G.world.every((dt) => { t += dt; if (t > 9) car.position.x += dt * 14; });
    await walk;
    await G.wait(1.5);
    G.audio.noise(1.2, 300, 0.5, 0.2, "lowpass");
    await G.walkTo(a, -1.2, 32, 1.2).then(() => 0);
    await Promise.all([G.walkTo(a, -2, 20, 1.2), G.walkTo(b, 2, 55, 1.2), (async () => {
      let k = 0;
      G.world.every((dt) => { k += dt; G.rig.override.pos.set(0, 2.2 + k * 3, 30 - k * 1.2); });
    })(), G.lines(["Long before they met, two children approached the same Brooklyn intersection from opposite directions.", "A car passed between them at the exact moment they might have seen one another."], { cls: "clear", hold: 9 })]);
    await G.lines(["Some stories begin long before the people in them know they're part of one."], { cls: "clear", hold: 5 });
    await G.fade(1, 2);
    await G.lines(["\"You were never lost.", "We just hadn't found each other yet.\""], { cls: "quote", hold: 6 });
    G.clock("4:04");
    await G.wait(2);
    G.audio.tick(0.4);
    G.clock("4:05");
    await G.wait(1.5);
    await G.lines(["ONE MINUTE AWAY"], { cls: "big", hold: 4 });
  },
};

// ============================================================
// Title screen attract: a slow dolly down the fogged parkway
// ============================================================
export function buildAttract(W, G) {
  env(W, { fog: NIGHT.fog, near: 3, far: 34, ambient: new THREE.Color(...NIGHT.ambient), dir: new THREE.Color(...NIGHT.dir) });
  W.boulevard(-10, 120, { lit: 0.2, flicker: true });
  W.car(10, 6, 0, [62, 66, 82], { lights: true });
  W.payphone(13.4, 30, -Math.PI / 2);
  const her = new Character("argjila");
  her.setPos(12.6, 0, 58).face(Math.PI);
  W.add(her.root);
  W.light(12.2, 4, 58, 0xffd0a0, 8);
  let t = 0;
  W.every((dt) => {
    t += dt;
    her.update(dt, 0);
    const z = 2 + ((t * 1.1) % 40);
    G.rig.override.pos.set(1.5 + Math.sin(t * 0.1) * 1.2, 2.0 + Math.sin(t * 0.13) * 0.3, z);
    G.rig.override.look.set(9, 1.6, z + 20);
    her.root.visible = Math.sin(t * 0.7) > -0.6;
  });
  G.rig.shot([4, 2.2, 2], [9, 1.6, 22], true, 55);
  return { start: [0, -50, 0] };
}
