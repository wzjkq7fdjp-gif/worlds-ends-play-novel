// ============================================================
// WORLD ENDS — locations.
// Human-scale (on foot) and Eidolon-scale (mech) spaces.
// ============================================================
import { THREE, U, mat, TEX, boxGeo, planeGeo, canvasTex } from "./ps1.js";
import { Character, FRAMES, makeKhethari, makeArk, makeSpire, glowK } from "./actors.js";

const C = (r, g, b) => new THREE.Color(r, g, b);
export function env(W, o) {
  W.env({ ...o, ambient: o.ambient && C(...o.ambient), dir: o.dir && C(...o.dir) });
}

// ---------- screens / textures ----------
export const SCREENS = {
  map: () => canvasTex(96, 64, (g) => {
    g.fillStyle = "#06121a"; g.fillRect(0, 0, 96, 64);
    g.strokeStyle = "#1a4a5a"; g.lineWidth = 1;
    for (let i = 0; i < 96; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); }
    for (let i = 0; i < 64; i += 8) { g.beginPath(); g.moveTo(0, i); g.lineTo(96, i); g.stroke(); }
    g.strokeStyle = "#3a8aa0";
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(Math.random() * 96, 0); g.lineTo(Math.random() * 96, 64); g.stroke(); }
    g.strokeStyle = "#ff3040"; g.lineWidth = 2; g.beginPath();
    for (let a = 0; a < 18; a += 0.2) { const r = 30 - a * 1.5; g.lineTo(60 + Math.cos(a) * r, 34 + Math.sin(a) * r * 0.7); }
    g.stroke();
    g.fillStyle = "rgba(255,40,60,0.35)";
    for (let i = 0; i < 8; i++) { const a = i * 1.9, r = 26 - i * 3; g.fillRect(60 + Math.cos(a) * r - 3, 34 + Math.sin(a) * r * 0.7 - 2, 6, 4); }
    g.fillStyle = "#ffe0a0"; g.font = "6px monospace"; g.fillText("MISSING ZONES", 3, 8); g.fillText("ARK", 56, 37);
  }, "screen-map"),
  sat: () => canvasTex(96, 64, (g) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, 96, 64);
    for (let i = 0; i < 60; i++) { g.fillStyle = "#fff"; g.fillRect(Math.random() * 96, Math.random() * 64, 1, 1); }
    g.strokeStyle = "#ff4030"; g.beginPath(); g.moveTo(5, 10); g.quadraticCurveTo(40, 20, 50, 40); g.quadraticCurveTo(58, 52, 80, 48); g.stroke();
    g.fillStyle = "#ffb060"; g.fillRect(78, 46, 4, 4);
    g.fillStyle = "#80f0a0"; g.font = "6px monospace"; g.fillText("TRAJ. CORRECTED x2", 3, 60);
  }, "screen-sat"),
  wave: () => canvasTex(64, 40, (g) => {
    g.fillStyle = "#04140c"; g.fillRect(0, 0, 64, 40);
    g.strokeStyle = "#60ffa0";
    for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 0; x < 64; x++) g.lineTo(x, 20 + Math.sin(x * (0.2 + k * 0.15)) * (8 - k * 2) + k * 2); g.stroke(); }
  }, "screen-wave"),
  red: () => canvasTex(16, 16, (g) => { g.fillStyle = "#400808"; g.fillRect(0, 0, 16, 16); g.fillStyle = "#ff3030"; g.fillRect(2, 6, 12, 4); }, "screen-red"),
};

// ---------- shared props ----------
function lightBulb(W, x, y, z, color = 0xffb060, range = 12) {
  W.mesh(boxGeo(0.25, 0.3, 0.25), mat({ color, unlit: true }), x, y, z);
  W.mesh(boxGeo(0.03, 1.5, 0.03), mat({ color: 0x111111 }), x, y + 0.9, z);
  W.glow(x, y, z, 1.6, color);
  return W.light(x, y - 0.4, z, color, range, { flicker: Math.random() < 0.2 ? 0.15 : 0 });
}
function screen(W, x, y, z, ry, tex, w = 1.2, h = 0.8) {
  const s = W.mesh(new THREE.PlaneGeometry(w, h), mat({ map: tex, unlit: true }), x, y, z, ry);
  W.light(x + Math.sin(ry) * 0.6, y, z + Math.cos(ry) * 0.6, 0x60c0d0, 4);
  return s;
}
function desk(W, x, z, ry = 0) {
  W.box(x, 0, z, 1.6, 0.76, 0.7, mat({ map: TEX.metal(), color: 0x5a6068 }), { ry });
  W.mesh(boxGeo(0.5, 0.36, 0.06), mat({ color: 0x1a1a1e }), x, 0.96, z - Math.cos(ry) * 0.2, ry);
  W.mesh(new THREE.PlaneGeometry(0.44, 0.3), mat({ map: SCREENS.wave(), unlit: true }), x + Math.sin(ry) * 0.04 - Math.sin(ry) * 0.2, 0.96, z - Math.cos(ry) * 0.2 + Math.cos(ry) * 0.04, ry);
}
function cot(W, x, z, ry = 0) {
  W.box(x, 0, z, 0.8, 0.4, 1.9, mat({ map: TEX.cloth([70, 80, 60], "cot") }), { ry });
  W.mesh(boxGeo(0.6, 0.1, 0.35), mat({ color: 0xd0d0c8 }), x, 0.45, z - Math.cos(ry) * 0.7, ry);
}
function locker(W, x, z, ry, n = 4) {
  for (let i = 0; i < n; i++) W.box(x + Math.cos(ry) * i * 0.62, 0, z - Math.sin(ry) * i * 0.62, 0.6, 2, 0.5, mat({ map: TEX.metal(), color: [0x6a7a6a, 0x5a6a7a][i % 2] }), { ry });
}
function standingFrame(W, id, x, z, ry, tarp = true) {
  const m = new Character(Object.assign({}, FRAMES[id]));
  m.setPos(x, 0, z).face(ry);
  W.add(m.root);
  W.every((dt) => m.update(dt, 0));
  W.colliderBox(x, z, 2.4, 2.4);
  // gantry
  const gm = mat({ map: TEX.metal(), color: 0x50545a });
  W.mesh(boxGeo(0.25, 7, 0.25), gm, x - 1.8 * Math.cos(ry), 3.5, z + 1.8 * Math.sin(ry));
  W.mesh(boxGeo(0.25, 7, 0.25), gm, x + 1.8 * Math.cos(ry), 3.5, z - 1.8 * Math.sin(ry));
  W.mesh(boxGeo(4, 0.2, 1), gm, x - Math.sin(ry) * 1.2, 4.6, z - Math.cos(ry) * 1.2, ry);
  if (tarp) W.mesh(new THREE.PlaneGeometry(5, 7), mat({ map: TEX.cloth([60, 64, 50], "tarp"), side: THREE.DoubleSide }), x - Math.sin(ry) * 2.2, 3.6, z - Math.cos(ry) * 2.2, ry);
  return m;
}

// ============================================================
// Title: the crater at night, the Ark breathing, a frame kneeling
// ============================================================
export function buildTitle(W, G) {
  env(W, { fog: 0x1a1024, near: 40, far: 260, ambient: [0.5, 0.42, 0.6], dir: [0.5, 0.36, 0.6], dirVec: [0.3, -0.6, 0.6] });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(250, 12, 8), mat({ map: TEX.sky("#05040c", "#2a1440", "#a03a40", "skyTitle"), unlit: true, noFog: true, side: THREE.BackSide }));
  W.add(sky);
  const halo = W.glow(0, 20, 120, 160, 0x8040a0);
  halo.material.uniforms.uNoFog.value = 1;
  W.ground(0, 0, 400, 400, TEX.asphalt(), { scale: 10 });
  const ark = makeArk(1.6);
  ark.root.position.set(0, -6, 70);
  W.add(ark.root);
  W.every((dt) => ark.update(dt));
  W.light(0, 20, 70, 0x9a60ff, 90);
  W.light(0, 4, 0, 0xff8040, 40);
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2, r = 110 + (i % 4) * 12;
    W.building(Math.sin(a) * r, 70 + Math.cos(a) * r, 14, 14, 30 + (i * 13) % 50, TEX.facade([50, 46, 56], 0.3, 200 + i));
  }
  const k = new Character(Object.assign({}, FRAMES.kaien));
  k.setPos(-16, 0, 26).face(0.5);
  k.pose = "kneel";
  W.add(k.root);
  W.every((dt) => k.update(dt, 0));
  // drifting embers
  for (let i = 0; i < 40; i++) {
    const e = W.glow((Math.random() - 0.5) * 80, Math.random() * 30, Math.random() * 90, 0.5, 0xff7030);
    W.every((dt) => { e.position.y += dt * (1 + (i % 3)); if (e.position.y > 40) e.position.y = 0; });
  }
  let t = 0;
  G.rig.shot([-20, 6, -6], [0, 16, 70], true, 50);
  W.every((dt) => {
    t += dt;
    if (!G.rig.override || G.mode !== "title") return;
    G.rig.override.pos.set(-20 + Math.sin(t * 0.05) * 14, 6 + Math.sin(t * 0.07) * 2, -6 + Math.cos(t * 0.05) * 4);
    G.rig.override.look.set(0, 16, 70);
  });
  return { start: [0, -60, 0] };
}

// ============================================================
// First Fall facility: the hangar the size of a cathedral
// ============================================================
export function buildFacility(W, G, o = {}) {
  env(W, { fog: 0x0a0c10, near: 10, far: 60, ambient: [0.28, 0.3, 0.34], dir: [0.15, 0.16, 0.2] });
  W.surface = "metal";
  W.room(-18, -14, 18, 30, 16, { floor: TEX.concrete([70, 72, 74], "facfloor"), wall: TEX.concrete([50, 52, 56], "facwall"), ceil: TEX.concrete([20, 20, 24], "facceil"), fs: 3 });
  // the fragment: ribbed half-cocoon
  const bone = mat({ map: TEX.cloth([26, 24, 30], "arkbone"), color: 0x9a96aa });
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI;
    const rib = W.mesh(boxGeo(0.6, 7, 0.6), bone, Math.cos(a) * 4, 3, 12 + Math.sin(a) * 1.5);
    rib.rotation.z = (Math.PI / 2 - a) * 0.6;
  }
  W.colliderBox(0, 12, 9, 4);
  // the Aetherheart
  const heart = W.mesh(new THREE.OctahedronGeometry(1.1, 0), mat({ color: 0x80c0ff, unlit: true }), 0, 3, 12);
  const halo = W.glow(0, 3, 12, 5, 0x6090ff);
  const L = W.light(0, 3, 12, 0x6090ff, 16);
  W.every((dt, t) => { heart.rotation.y += dt * 0.6; heart.rotation.x = Math.sin(t) * 0.2; const k = (G._heartPower ?? 0.5); halo.scale.setScalar(0.6 + k + Math.sin(t * 6) * 0.05 * k); L.color.setRGB(0.3 * k + 0.1, 0.5 * k + 0.1, 1 * k + 0.2); });
  G._heart = heart;
  for (const [x, z] of [[-6, 4], [6, 4], [-8, 16], [8, 16]]) desk(W, x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2);
  for (let z = -10; z < 30; z += 8) { lightBulb(W, -10, 12, z, 0xc8d8ff, 18); lightBulb(W, 10, 12, z, 0xc8d8ff, 18); }
  screen(W, 0, 5, 29.9, Math.PI, SCREENS.sat(), 6, 4);
  W.sign(0, 9, 29.9, "COVENANT · FIRST FALL", Math.PI, { w: 8, h: 0.8, bg: "#101014", fg: "#d0d8e0", tw: 128, th: 16, size: 9, unlit: true });
  return { start: [0, -8, 0], cam: { yaw: 0, pitch: 0.3, dist: 6 } };
}

// ============================================================
// The crater: barricades, phones raised, the Ark opening
// ============================================================
export function buildCrater(W, G) {
  env(W, { fog: 0x2a2028, near: 15, far: 110, ambient: [0.5, 0.42, 0.42], dir: [0.6, 0.4, 0.3], dirVec: [-0.3, -0.6, 0.7] });
  W.ground(0, 0, 220, 220, TEX.asphalt(), { scale: 6 });
  const ark = makeArk(0.9);
  ark.root.position.set(0, -4, 60);
  W.add(ark.root);
  W.every((dt) => ark.update(dt));
  W.light(0, 10, 50, 0x9a60ff, 50);
  for (let i = -3; i <= 3; i++) W.box(i * 3.2, 0, 22, 2.8, 1.0, 0.4, mat({ map: TEX.text("POLICE LINE", { w: 64, h: 16, bg: "#d8c030", fg: "#101010" }) }));
  for (let i = 0; i < 12; i++) { W.building(-40 - (i % 2) * 14, -20 + i * 12, 12, 11, 18 + (i * 7) % 20, TEX.facade([80, 70, 66], 0.4, i + 50)); W.building(40 + (i % 2) * 14, -20 + i * 12, 12, 11, 18 + (i * 5) % 22, TEX.facade([70, 70, 80], 0.4, i + 70)); }
  for (const [x, z, r] of [[-8, 10, 0.4], [12, 6, -1.2], [-16, -4, 2], [6, -12, 0.1]]) W.car(x, z, r, [[90, 40, 40], [60, 70, 90], [180, 170, 150], [50, 60, 50]][Math.abs(x) % 4]);
  return { start: [0, 0, 0] };
}

// ============================================================
// Covenant hangar — the base hub, reused across the campaign
// zones:  bays (x>6), comms (x<-8, z>4), briefing (x<-8, -10<z<4),
//         shelter (x<-8, z<-14), training (|x|<6, z<-14), canteen (|x|<5, -6<z<6)
// ============================================================
export function buildHangar(W, G, o = {}) {
  const night = o.night;
  env(W, { fog: night ? 0x08080c : 0x14110e, near: 10, far: 55, ambient: night ? [0.22, 0.22, 0.28] : [0.34, 0.3, 0.26], dir: [0.1, 0.09, 0.08] });
  W.surface = "street";
  W.room(-20, -30, 20, 30, 14, { floor: TEX.concrete([78, 74, 68], "hfloor2"), wall: TEX.concrete([60, 58, 54], "hwall2"), ceil: TEX.concrete([18, 18, 20], "hceil2"), fs: 2.5 });
  // stained concrete patches
  for (let i = 0; i < 10; i++) W.ground((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 54, 2 + Math.random() * 3, 2 + Math.random() * 3, TEX.concrete([50, 46, 40], "stain"), { y: 0.01 });
  // Eidolon bays
  const ids = o.frames || ["kaien", "renji", "raizen", "shion", "kyo"];
  G._frames = {};
  ids.forEach((id, i) => { G._frames[id] = standingFrame(W, id, 14, 18 - i * 9, -Math.PI / 2, i !== 0); });
  W.sign(18.5, 9, 18, "EIDOLON-0", -Math.PI / 2, { w: 4, h: 0.6, bg: "#1a1a1e", fg: "#e8e0c8", tw: 96, th: 16, size: 9, unlit: true });
  // access ladder to EIDOLON-0
  const lm = mat({ map: TEX.metal(), color: 0x7a7a50 });
  W.mesh(boxGeo(0.08, 6, 0.08), lm, 11.3, 3, 17.4); W.mesh(boxGeo(0.08, 6, 0.08), lm, 11.3, 3, 18.6);
  for (let y = 0.4; y < 6; y += 0.4) W.mesh(boxGeo(0.06, 0.05, 1.2), lm, 11.3, y, 18);
  // lockers, amber bulbs
  locker(W, -19.6, 26, Math.PI / 2, 8); locker(W, -19.6, -2, Math.PI / 2, 4);
  for (let z = -24; z <= 24; z += 8) for (const x of [-10, 2, 12]) lightBulb(W, x, 9, z, night ? 0xff9040 : 0xffb060, 14);
  // comms station
  for (const z of [6, 9, 12]) desk(W, -14, z, Math.PI / 2);
  screen(W, -19.9, 3, 9, Math.PI / 2, SCREENS.wave(), 4, 2.4);
  W.sign(-19.9, 5, 9, "COMMUNICATIONS", Math.PI / 2, { w: 4, h: 0.5, bg: "#0a1a14", fg: "#80e0a0", tw: 96, th: 12, size: 8, unlit: true });
  // briefing table + map
  W.box(-13, 0, -4, 4, 0.8, 2.4, mat({ map: TEX.metal(), color: 0x3a3e44 }));
  W.mesh(new THREE.PlaneGeometry(3.6, 2), mat({ map: SCREENS.map(), unlit: true }), -13, 0.82, -4).rotation.x = -Math.PI / 2;
  G._mapScreen = screen(W, -19.9, 3.4, -4, Math.PI / 2, SCREENS.map(), 6, 4);
  W.sign(-19.9, 6, -4, "BRIEFING", Math.PI / 2, { w: 3, h: 0.5, bg: "#1a0a0a", fg: "#ff8070", tw: 64, th: 12, size: 8, unlit: true });
  // lab corner (Shion's monitors)
  for (let i = 0; i < 3; i++) screen(W, -19.9, 2 + (i % 2) * 1.1, 1 + i * 1.3, Math.PI / 2, SCREENS.wave(), 1.2, 0.9);
  // shelter: cots
  for (let i = 0; i < 6; i++) cot(W, -16 + (i % 3) * 2.2, -20 - Math.floor(i / 3) * 4, 0);
  W.sign(-19.9, 3, -22, "SHELTER", Math.PI / 2, { w: 2.6, h: 0.5, bg: "#1a1a10", fg: "#e8d890", tw: 64, th: 12, size: 8, unlit: true });
  W.light(-14, 2.4, -22, 0xffc070, 8);
  // training mats
  W.ground(0, -22, 8, 8, TEX.cloth([40, 60, 80], "mat"), { y: 0.02, scale: 2 });
  // canteen
  for (const z of [-2, 2]) W.table(0, z, { w: 3, d: 1, tint: [90, 90, 96], chairs: true });
  // hangar doors
  const doorM = mat({ map: TEX.metal(), color: 0x6a5a40 });
  G._doorL = W.mesh(boxGeo(10, 12, 0.6), doorM, -5, 6, 29.6);
  G._doorR = W.mesh(boxGeo(10, 12, 0.6), doorM, 5, 6, 29.6);
  W.sign(0, 12.6, 29.2, "EIDOLON COVENANT", Math.PI, { w: 9, h: 0.9, bg: "#1a1410", fg: "#ffb060", tw: 128, th: 16, size: 10, unlit: true });
  return { start: o.start || [4, -6, 0], cam: { yaw: 0, pitch: 0.36, dist: 6, height: 1.4 } };
}

// ============================================================
// The southern highway (Eidolon scale)
// ============================================================
export function buildHighway(W, G, o = {}) {
  const dawn = o.dawn;
  env(W, { fog: dawn ? 0x705048 : 0x3a2a26, near: 30, far: 150, ambient: dawn ? [0.62, 0.5, 0.44] : [0.5, 0.4, 0.36], dir: dawn ? [0.9, 0.6, 0.4] : [0.6, 0.4, 0.3], dirVec: [0.4, -0.5, 0.8] });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 10, 6), mat({ map: TEX.sky(dawn ? "#3a3040" : "#1a1418", dawn ? "#c06a40" : "#6a3020", dawn ? "#e8a070" : "#a04020", dawn ? "skyDawn" : "skyFire"), unlit: true, noFog: true, side: THREE.BackSide }));
  W.add(sky);
  W.ground(0, 0, 44, 320, TEX.road(), { scale: 12 });
  for (const s of [-1, 1]) W.ground(s * 30, 0, 16, 320, TEX.sidewalk(), { scale: 4 });
  W.bounds = { x0: -36, z0: -140, x1: 36, z1: 140 };
  // towers on both sides with roofs the Gloomcasters nest on
  G._roofs = [];
  for (let i = 0; i < 18; i++) {
    for (const s of [-1, 1]) {
      const h = 18 + ((i * 17 + (s > 0 ? 7 : 0)) % 26);
      const z = -130 + i * 15;
      W.building(s * 48, z, 22, 13, h, TEX.facade([70 + (i % 3) * 10, 64, 60], 0.15, i * 3 + (s > 0 ? 9 : 0)));
      G._roofs.push({ x: s * 37.5, y: h, z });
    }
  }
  // stalled traffic, a bus, fire
  const cols = [[90, 40, 40], [60, 70, 90], [180, 170, 150], [50, 60, 50], [140, 120, 60]];
  for (let i = 0; i < 40; i++) {
    const x = -18 + (i % 6) * 7 + (Math.random() - 0.5) * 2, z = -120 + Math.floor(i / 6) * 34 + (Math.random() - 0.5) * 10;
    if (Math.abs(x) < 4 && Math.abs(z) < 30) continue;
    W.car(x, z, (Math.random() - 0.5) * 0.6 + (i % 2 ? Math.PI : 0), cols[i % 5], { solid: false, lights: i % 4 === 0 });
  }
  const bus = W.box(14, 0, 30, 3, 3.4, 12, mat({ map: TEX.cloth([180, 140, 40], "bus") }), { solid: false });
  G._bus = bus;
  for (let i = 0; i < 8; i++) {
    const x = (Math.random() - 0.5) * 50, z = (Math.random() - 0.5) * 200;
    W.light(x, 2, z, 0xff6020, 18, { flicker: 0.2 });
    const f = W.glow(x, 1.5, z, 5, 0xff6020);
    W.every((dt, t) => f.scale.setScalar(1 + Math.sin(t * 9 + x) * 0.15));
  }
  for (let i = 0; i < 6; i++) W.light(-20 + i * 8, 14, -20 + i * 20, 0xffc090, 30);
  return { start: o.start || [0, -40, 0], cam: { yaw: 0, pitch: 0.38, dist: 15, height: 3.6, fov: 58 } };
}

// ============================================================
// Burned streets at dusk / the collapsed market / the alley
// ============================================================
export function buildStreets(W, G) {
  env(W, { fog: 0x3a2e2a, near: 6, far: 46, ambient: [0.36, 0.3, 0.3], dir: [0.5, 0.32, 0.24], dirVec: [0.6, -0.4, 0.5], sat: 0.75 });
  W.boulevard(-10, 90, { lit: 0.04, trees: false, benches: false, flicker: true, lampColor: 0xffa060 });
  // rubble + burned cars + smoke
  for (let i = 0; i < 14; i++) W.box((Math.random() - 0.5) * 22, 0, Math.random() * 80, 0.6 + Math.random() * 1.5, 0.3 + Math.random() * 0.8, 0.6 + Math.random() * 1.5, mat({ map: TEX.concrete([60, 56, 52], "rubble") }));
  for (let i = 0; i < 6; i++) W.car((i % 2 ? 1 : -1) * (2 + Math.random() * 7), 6 + i * 13, Math.random() * 3, [30, 28, 26], { solid: true });
  // the collapsed market at the end, with the alley behind it
  W.box(0, 0, 86, 14, 3, 0.6, mat({ map: TEX.brick([70, 50, 44], "mkt") }));
  W.sign(0, 3.6, 85.6, "MARKET", Math.PI, { w: 4, h: 0.6, bg: "#3a1a10", fg: "#e0c090", tw: 64, th: 12, size: 9 });
  W.box(-6, 0, 80, 3, 2.4, 1.6, mat({ map: TEX.wood([60, 40, 30], "stall") }));
  W.box(6, 0, 81, 3, 1.4, 2.2, mat({ map: TEX.wood([60, 40, 30], "stall") }));
  // alley: x 8..12, z 70..88, piled trash and broken wood
  W.ground(10, 79, 4, 18, TEX.asphalt(), { y: 0.01 });
  for (let i = 0; i < 6; i++) W.box(9 + Math.random() * 2.5, 0, 72 + i * 2.6, 0.7, 0.5 + Math.random() * 0.6, 0.7, mat({ map: TEX.wood([50, 36, 26], "broken") }), { solid: i % 2 === 0 });
  W.trash(11.4, 76); W.trash(8.6, 83);
  W.light(10, 3, 84, 0x8090a0, 8, { flicker: 0.2 });
  W.bounds = { x0: -15, z0: -10, x1: 15, z1: 88 };
  return { start: [0, -4, 0], cam: { yaw: 0, pitch: 0.34, dist: 6.5 } };
}

// ============================================================
// The river apartment: half a building, half a bruise
// ============================================================
export function buildApartment(W, G) {
  env(W, { fog: 0x0e0e12, near: 4, far: 26, ambient: [0.24, 0.24, 0.28], dir: [0.06, 0.06, 0.08] });
  W.surface = "wood";
  // corridor x -2..2, z 0..34; apartment at the end (z 34..44)
  W.ground(0, 17, 4, 34, TEX.wood([70, 50, 36], "aptfl"), { scale: 1.5 });
  W.ceiling(0, 17, 4, 34, 3, TEX.concrete([40, 40, 40], "aptc"));
  W.wall(-2, 17, 34, 3, Math.PI / 2, TEX.wallpaper([80, 72, 60], "aptwp"));
  W.wall(2, 17, 34, 3, -Math.PI / 2, TEX.wallpaper([80, 72, 60], "aptwp"));
  W.wall(0, 0, 4, 3, 0, TEX.wallpaper([80, 72, 60], "aptwp"));
  W.collider(-3, 0, -2, 34); W.collider(2, 0, 3, 34);
  for (let z = 4; z < 34; z += 6) { W.door(-1.97, z, Math.PI / 2, { label: "R" + (z + 10), solid: false }); W.light(0, 2.7, z, 0xd0c8a0, 6, { flicker: z === 22 ? 0.4 : 0.05 }); }
  // the apartment
  W.room(-5, 34, 5, 44, 3, { floor: TEX.wood([60, 44, 34], "aptfl2"), wall: TEX.wallpaper([70, 64, 56], "aptwp2"), skip: ["s"], bounds: false });
  W.wall(-3.5, 34, 3, 3, Math.PI, TEX.wallpaper([70, 64, 56], "aptwp2")); W.wall(3.5, 34, 3, 3, Math.PI, TEX.wallpaper([70, 64, 56], "aptwp2"));
  W.collider(-5.2, 33.7, -2, 34.1); W.collider(2, 33.7, 5.2, 34.1);
  W.bounds = { x0: -5, z0: 0, x1: 5, z1: 44 };
  W.sign(0, 1.6, 43.95, "", Math.PI, { w: 2.6, h: 1.4, bg: "#6a7a90", fg: "#6a7a90", tw: 8, th: 8, unlit: true });
  W.light(0, 2, 43, 0x90a0c0, 9);
  W.table(2.6, 40, { w: 1, d: 0.8 });
  W.box(-3.4, 0, 41.5, 2, 0.5, 1.2, mat({ map: TEX.cloth([80, 60, 60], "aptcouch") }));
  return { start: [0, 2, 0], cam: { yaw: 0, pitch: 0.3, dist: 4.4, height: 1.5 } };
}

// ============================================================
// The roof: wind, ash, the crater glow on the horizon
// ============================================================
export function buildRoof(W, G, o = {}) {
  env(W, { fog: 0x1c1822, near: 30, far: 220, ambient: [0.34, 0.32, 0.4], dir: [0.3, 0.26, 0.36], dirVec: [0.2, -0.5, 0.8] });
  W.surface = "street";
  W.ground(0, 0, 20, 20, TEX.concrete([66, 64, 62], "rooftop"), { scale: 2 });
  for (const [x, z, w, d] of [[0, 10, 20.6, 0.4], [0, -10, 20.6, 0.4], [10, 0, 0.4, 20], [-10, 0, 0.4, 20]]) W.box(x, 0, z, w, 0.9, d, mat({ map: TEX.concrete() }));
  W.box(-6, 0, -6, 3, 2.6, 2.4, mat({ map: TEX.concrete([70, 68, 64], "hatch") }));
  W.door(-6, -4.75, 0, { tint: "#3a3a3e", solid: false });
  W.box(5, 0, -6, 2, 1.4, 2, mat({ map: TEX.metal() }));
  W.bounds = { x0: -9.6, z0: -9.6, x1: 9.6, z1: 9.6 };
  // the city below
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 120;
    const h = 10 + Math.random() * 40;
    W.mesh(boxGeo(10, h, 10, 4, 3.2), mat({ map: TEX.facade([46, 44, 52], 0.25, i), noFog: false }), Math.sin(a) * r, h / 2 - 30, Math.cos(a) * r);
  }
  const ark = makeArk(0.9);
  ark.root.position.set(0, -26, 140);
  W.add(ark.root);
  W.every((dt) => ark.update(dt));
  W.light(0, 10, 130, 0x9a60ff, 120);
  W.glow(0, 0, 135, 50, o.stage > 1 ? 0xc070ff : 0x8a50d0);
  if (o.spire) { const sp = makeSpire(70); sp.root.position.set(0, -26, 140); W.add(sp.root); W.every((dt) => sp.update(dt)); }
  // ash in the wind
  for (let i = 0; i < 30; i++) {
    const e = W.glow((Math.random() - 0.5) * 20, Math.random() * 6, (Math.random() - 0.5) * 20, 0.12, 0x9a9090);
    W.every((dt) => { e.position.x += dt * 2.5; if (e.position.x > 12) e.position.x = -12; });
  }
  return { start: [-6, -3.5, Math.PI], cam: { yaw: 0, pitch: 0.3, dist: 6 } };
}

// ============================================================
// Echo-Sight: Miyu's vision of the river
// ============================================================
export function buildEcho(W, G) {
  env(W, { fog: 0xd8d0e8, near: 4, far: 40, ambient: [0.7, 0.68, 0.8], dir: [0.3, 0.3, 0.4], sat: 0.15 });
  U.uTint.value.setRGB(0.85, 0.85, 1.05);
  W.ground(0, 30, 16, 80, TEX.sidewalk(), { scale: 1.5 });
  W.ground(14, 30, 12, 80, TEX.water([60, 60, 80], "echowater"), { y: -0.3, wave: 1, scroll: [0.02, 0.05] });
  W.railing(8, 30, 8);
  W.collider(7.9, -10, 8.1, 70);
  W.bounds = { x0: -8, z0: -6, x1: 8, z1: 70 };
  for (let z = 0; z < 70; z += 10) W.lamp(-6.5, z, { side: 1, color: 0xf0e8ff, range: 8 });
  for (let i = 0; i < 10; i++) W.building(-16, i * 8, 12, 7.6, 10 + (i * 7) % 10, TEX.facade([140, 140, 160], 0.2, i));
  return { start: [0, 0, 0], cam: { yaw: 0, pitch: 0.36, dist: 5 } };
}

// ============================================================
// Utility tunnels → the Choirwell cavern (Eidolon scale)
// ============================================================
export function buildTunnels(W, G) {
  env(W, { fog: 0x050608, near: 4, far: 30, ambient: [0.16, 0.18, 0.2], dir: [0, 0, 0] });
  W.surface = "water";
  // on-foot utility tunnel x -2.5..2.5, z 0..80
  W.ground(0, 40, 5, 80, TEX.concrete([50, 54, 50], "tunfl"), { scale: 1.5 });
  W.ground(0, 40, 1.2, 80, TEX.water([20, 30, 30], "tunwater"), { y: 0.02, scroll: [0, 0.2] });
  W.ceiling(0, 40, 5, 80, 3.4, TEX.concrete([30, 32, 30], "tunc"));
  const wallM = TEX.concrete([46, 50, 46], "tunwall");
  W.wall(-2.5, 40, 80, 3.4, Math.PI / 2, wallM); W.wall(2.5, 40, 80, 3.4, -Math.PI / 2, wallM);
  W.wall(0, 0, 5, 3.4, 0, wallM);
  W.collider(-3.5, 0, -2.5, 80); W.collider(2.5, 0, 3.5, 80);
  W.bounds = { x0: -2.5, z0: 0, x1: 2.5, z1: 82 };
  // pipes, pulsing veins in the walls
  for (const s of [-1, 1]) W.mesh(boxGeo(0.25, 0.25, 80), mat({ map: TEX.metal(), color: 0x6a5a40 }), s * 2.2, 2.8, 40);
  const veins = [];
  for (let z = 6; z < 80; z += 5) for (const s of [-1, 1]) { const v = W.mesh(boxGeo(0.04, 2.6, 0.12), mat({ color: 0x8a50ff, unlit: true }), s * 2.46, 1.5, z); v.rotation.x = (z % 3) * 0.3; veins.push(v); }
  W.every((dt, t) => veins.forEach((v, i) => glowK(v, (G._veinK ?? 0.4) * (0.4 + Math.max(0, Math.sin(t * 2 - i * 0.3))))));
  for (let z = 8; z < 80; z += 12) W.light(0, 3, z, 0x80a0a0, 6, { flicker: 0.2 });
  // the warm opening at the end
  W.light(0, 2, 80, 0xd0a0ff, 14);
  W.glow(0, 1.6, 81.5, 5, 0xd0a0ff);
  return { start: [0, 2, 0], cam: { yaw: 0, pitch: 0.28, dist: 4.4, height: 1.5 } };
}

// captives in concentric rings (cheap: 3 boxes each)
function captiveRings(W, cx, cz, rings, r0, gap, scale = 1) {
  const bodyM = mat({ map: TEX.cloth([80, 80, 86], "capt"), emissive: 0.05 });
  const headM = mat({ color: 0xa89890 });
  const heads = [];
  for (let r = 0; r < rings; r++) {
    const R = r0 + r * gap, n = Math.floor((R * Math.PI * 2) / 1.3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r * 0.2;
      const x = cx + Math.sin(a) * R, z = cz + Math.cos(a) * R;
      const b = W.mesh(boxGeo(0.45 * scale, 0.6 * scale, 0.35 * scale), bodyM, x, 0.3 * scale, z, a + Math.PI);
      const h = W.mesh(boxGeo(0.22 * scale, 0.24 * scale, 0.22 * scale), headM, x, 0.75 * scale, z, a + Math.PI);
      heads.push(h);
    }
  }
  return heads;
}

export function buildChoirwell(W, G, o = {}) {
  env(W, { fog: 0x140e1c, near: 30, far: 140, ambient: [0.32, 0.26, 0.4], dir: [0.15, 0.1, 0.2] });
  W.surface = "street";
  W.ground(0, 0, 160, 160, TEX.cloth([40, 30, 46], "fleshground"), { scale: 6 });
  W.bounds = { x0: -46, z0: -46, x1: 46, z1: 46 };
  // grown structures around the cavern wall
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, r = 52;
    const h = 30 + (i % 5) * 8;
    const m = W.mesh(new THREE.ConeGeometry(5, h, 5), mat({ map: TEX.cloth([30, 24, 36], "growth"), color: 0x9a8ab0 }), Math.sin(a) * r, h / 2 - 2, Math.cos(a) * r);
    m.rotation.z = (Math.random() - 0.5) * 0.3;
  }
  const heads = captiveRings(W, 0, 0, 4, 10, 4.5, 2.2);
  G._captives = heads;
  const sp = makeSpire(60, 0xc0a0ff);
  W.add(sp.root);
  W.every((dt) => sp.update(dt));
  G._spire = sp;
  W.colliderBox(0, 0, 4, 4);
  W.light(0, 10, 0, 0xc0a0ff, 70);
  for (let i = 0; i < 6; i++) { const a = i * 1.05; W.light(Math.sin(a) * 30, 6, Math.cos(a) * 30, 0x8a60c0, 30); }
  // the hum: captives sway in unison
  W.every((dt, t) => heads.forEach((h, i) => (h.rotation.z = Math.sin(t * 1.4) * 0.12 * (G._choirSway ?? 1))));
  return { start: o.start || [0, -38, 0], cam: { yaw: 0, pitch: 0.4, dist: 15, height: 3.6, fov: 58 } };
}

// ============================================================
// The Fellstar Ark — outside (dawn, Eidolon scale) and inside
// ============================================================
export function buildArkOutside(W, G) {
  env(W, { fog: 0x6a4038, near: 40, far: 220, ambient: [0.6, 0.46, 0.42], dir: [1.0, 0.6, 0.4], dirVec: [0.3, -0.4, 0.9] });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(230, 10, 6), mat({ map: TEX.sky("#3a2a30", "#c05a30", "#f09a60", "skyBruise"), unlit: true, noFog: true, side: THREE.BackSide }));
  W.add(sky);
  W.ground(0, 0, 400, 400, TEX.asphalt(), { scale: 8 });
  const ark = makeArk(2.4);
  ark.root.position.set(0, -14, 120);
  W.add(ark.root);
  W.every((dt) => ark.update(dt));
  W.light(0, 20, 90, 0x9a60ff, 100);
  W.bounds = { x0: -60, z0: -60, x1: 60, z1: 75 };
  // ribs protruding from the ground like bones around the breach
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI - Math.PI / 2; const m = W.mesh(boxGeo(2.5, 30, 2.5), mat({ map: TEX.cloth([26, 24, 30], "arkbone"), color: 0x9a96aa }), Math.sin(a) * 50, 8, 70 + Math.cos(a) * 12); m.rotation.z = -Math.sin(a) * 0.6; }
  W.glow(0, 6, 76, 14, 0xc080ff);
  W.light(0, 6, 72, 0xc080ff, 40);
  for (let i = 0; i < 10; i++) W.building(-80 + i * 18, -70, 14, 12, 20 + (i * 9) % 30, TEX.facade([60, 54, 56], 0.1, i + 300));
  return { start: [0, -40, 0], cam: { yaw: 0, pitch: 0.36, dist: 15, height: 3.6, fov: 58 } };
}
export function buildArkInside(W, G) {
  env(W, { fog: 0x2a0c18, near: 12, far: 90, ambient: [0.42, 0.24, 0.3], dir: [0.2, 0.1, 0.12] });
  W.surface = "carpet";
  const flesh = TEX.cloth([90, 40, 56], "flesh");
  W.ground(0, 60, 24, 140, flesh, { scale: 6, wave: 0.6 });
  W.bounds = { x0: -11, z0: -8, x1: 11, z1: 130 };
  W.collider(-13, -10, -11, 135); W.collider(11, -10, 13, 135);
  const ribs = [];
  for (let z = 0; z < 130; z += 7) {
    for (const s of [-1, 1]) { const r = W.mesh(boxGeo(1.6, 26, 1.6), mat({ map: TEX.cloth([40, 30, 40], "arkbone"), color: 0xb0a0b0 }), s * 12, 10, z); r.rotation.z = s * 0.35; }
    const seam = W.mesh(boxGeo(22, 0.4, 0.4), mat({ color: 0xff5080, unlit: true }), 0, 22, z);
    ribs.push(seam);
  }
  W.every((dt, t) => ribs.forEach((r, i) => glowK(r, 0.4 + Math.max(0, Math.sin(t * 2.2 - i * 0.5)) * 0.9)));
  for (let z = 10; z < 130; z += 20) W.light(0, 8, z, 0xff6090, 26);
  W.glow(0, 10, 132, 30, 0xffe0f0);
  W.light(0, 10, 128, 0xffd0f0, 40);
  return { start: [0, 0, 0], cam: { yaw: 0, pitch: 0.34, dist: 14, height: 3.6, fov: 58 } };
}

// ============================================================
// The Gate chamber: the Lumen Spire, captive rings, Vael
// ============================================================
export function buildGate(W, G, o = {}) {
  env(W, { fog: 0x100818, near: 30, far: 160, ambient: [0.4, 0.32, 0.46], dir: [0.2, 0.16, 0.26] });
  W.surface = "street";
  W.ground(0, 0, 180, 180, TEX.tile("#3a3040", "#2a2030", "gatetile"), { scale: 4 });
  W.bounds = { x0: -48, z0: -48, x1: 48, z1: 48 };
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const p = W.mesh(boxGeo(3, 60, 3), mat({ map: TEX.cloth([30, 24, 36], "arkbone"), color: 0xb0a0c0 }), Math.sin(a) * 56, 30, Math.cos(a) * 56);
    p.rotation.z = Math.sin(a) * 0.08;
  }
  const heads = captiveRings(W, 0, 18, 3, 9, 4, 2.2);
  G._captives = heads;
  const sp = makeSpire(80, 0xd0b0ff);
  sp.root.position.set(0, 0, 18);
  W.add(sp.root);
  W.every((dt) => sp.update(dt));
  G._spire = sp;
  W.colliderBox(0, 18, 4, 4);
  W.light(0, 14, 18, 0xd0b0ff, 80);
  for (let i = 0; i < 8; i++) { const a = i * 0.8; W.light(Math.sin(a) * 36, 8, Math.cos(a) * 36, 0x8a60c0, 34); }
  W.every((dt, t) => heads.forEach((h) => (h.rotation.z = Math.sin(t * 1.6) * 0.12 * (G._choirSway ?? 1))));
  return { start: o.start || [0, -34, 0], cam: { yaw: 0, pitch: 0.36, dist: o.mech === false ? 6 : 15, height: o.mech === false ? 1.4 : 3.6, fov: 58 } };
}
