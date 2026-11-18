// ============================================================
// Places. Painted rooms (pre-rendered backdrops with solved
// cameras and floor polygons) and the 3D streets / interiors
// that connect them.
// ============================================================
import { THREE, U, mat, TEX, boxGeo, planeGeo } from "./ps1.js";
import { pic, tvScreen } from "./art.js";
import { SpriteActor } from "./actors.js";
import { A as ART } from "./assets.js";

export const C = (r, g, b) => new THREE.Color(r, g, b);
export const env = (W, o) => W.env({ ...o, ambient: o.ambient && C(...o.ambient), dir: o.dir && C(...o.dir) });
export const NIGHT = { fog: 0x23272f, near: 3, far: 30, ambient: [0.3, 0.31, 0.37], dir: [0.16, 0.17, 0.24] };

const texCanvas = new Map();
export function canvasTex(kind) {
  if (texCanvas.has(kind)) return texCanvas.get(kind);
  const t = new THREE.CanvasTexture(pic(kind));
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  texCanvas.set(kind, t);
  return t;
}

// ------------------------------------------------------------
// Prologue — the parked sedan on Ocean Parkway (3D)
// ------------------------------------------------------------
export function buildParkway(W, G, o = {}) {
  env(W, { ...NIGHT, fog: 0x3a3448, near: 4, far: 34, ambient: [0.34, 0.32, 0.42] });
  W.boulevard(-24, 60, { lit: 0.18 });
  const car = W.car(10, 0, 0, [70, 66, 74], { lights: true });
  G._car = car;
  W.car(-10, 12, Math.PI, [90, 40, 36]);
  W.car(10, 16, 0, [40, 60, 50]);
  W.hydrant(12.6, 6);
  // the apartment window across the street that breathes
  const win = W.glow(-15.2, 6.2, 4, 2.2, 0xffb060);
  G._breathWin = win;
  W.light(-14, 6, 4, 0xffb060, 8);
  // dome light inside the car
  G._dome = W.light(10, 1.5, 0.2, 0xfff0c0, 2.6);
  G._dome.on = false;
  return { start: [8.6, -1.2, 0], cam: { yaw: 0, pitch: 0.34, dist: 6.2, height: 1.3 } };
}

// ------------------------------------------------------------
// The street that remembers — dates for street names, a door
// number that changes, the payphone and the false fork.
// ------------------------------------------------------------
export function buildStreet(W, G) {
  env(W, { ...NIGHT, fog: 0x2a2632, near: 2, far: 26 });
  W.ground(0, 35, 8, 90, TEX.road(), { scale: 5 });
  for (const s of [-1, 1]) {
    W.ground(s * 5.5, 35, 3, 90, TEX.sidewalk(), { scale: 1.5 });
    W.mesh(boxGeo(0.2, 0.12, 90, 1), mat({ map: TEX.concrete() }), s * 4, 0.06, 35);
    W.blockRow(s * 7, -5, 58, s, { lit: 0.15, minH: 8 });
  }
  W.bounds = { x0: -7, z0: -4, x1: 7, z1: 76 };
  for (let z = 4; z < 60; z += 12) { W.lamp(-6.4, z, { side: 1, flicker: z === 40 ? 0.45 : 0 }); W.lamp(6.4, z + 6, { side: -1 }); }
  W.car(-3, 16, Math.PI, [50, 52, 60]);
  W.car(3, 33, 0, [80, 70, 50]);
  W.trash(-6.4, 22); W.hydrant(6.2, 12);
  W.streetSign(6.2, 26, "OCT 24 2025", "APR 4 2026");
  W.streetSign(-6.2, 46, "4:04 ST", "OCT 24 2026");
  G._numDoor = W.door(-6.98, 28, Math.PI / 2, { label: "APT 1" });
  // the intersection at the end of the block
  W.ground(0, 66, 30, 10, TEX.road(), { scale: 6 });
  W.payphone(5.6, 60, -Math.PI / 2);
  G._payphone = [5.2, 60];
  // warm residential entrance (west) and the dark stairwell (east)
  W.building(-12, 70, 8, 9, 12, TEX.facade([120, 90, 70], 0.6, 77));
  W.door(-7.9, 68, Math.PI / 2, { tint: "#6a3a22", label: "HOME" });
  W.light(-7.2, 2.6, 68, 0xffc070, 7);
  W.glow(-7.6, 2.4, 68, 1.8, 0xffb060);
  const dark = mat({ color: 0x050506 });
  W.mesh(boxGeo(2.2, 0.02, 3.2), dark, 9, 0.01, 68);
  const rail = mat({ map: TEX.metal(), color: 0x2e4a32 });
  W.mesh(boxGeo(0.08, 1.0, 3.2), rail, 7.9, 0.5, 68);
  W.mesh(boxGeo(0.08, 1.0, 3.2), rail, 10.1, 0.5, 68);
  W.sign(9, 1.35, 66.3, "DOWN", 0, { w: 0.9, h: 0.22, bg: "#1a3a1a", tw: 32, th: 8, size: 7 });
  W.light(9, 0.4, 68, 0x6080a0, 3.5);
  W.bounds = { x0: -8, z0: -4, x1: 11, z1: 72 };
  // a third door: the authentic one, half-hidden mid-block
  G._trueDoor = W.door(6.98, 50, -Math.PI / 2, { label: "APT 1", tint: "#3a2418" });
  passersby(W, G, [[5.8, 62, 6, 0.3], [-5.6, 10, 60, 0.6]]);
  streetDecals(W, 1, 7, [0, 56]);
  streetDecals(W, -1, 7, [0, 56], 3);
  W.light(6.2, 2.5, 50, 0xffcf90, 4);
  return { start: [0, 2, 0], cam: { yaw: 0, pitch: 0.36, dist: 6, height: 1.3 } };
}

// the apartment with the television and the impossible hallway
export function buildApartment(W, G) {
  env(W, { fog: 0x0a0a0c, near: 3, far: 22, ambient: [0.22, 0.19, 0.17], dir: [0.05, 0.05, 0.05] });
  W.surface = "carpet";
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
  W.light(-2.2, 1, 4.2, 0x8090b0, 3.5);
  W.ground(0, 24, 2.4, 36, TEX.carpet([60, 30, 34], "hallcarpet"), { scale: 1.5 });
  W.ceiling(0, 24, 2.4, 36, 2.6, TEX.concrete([60, 56, 50], "ceil2"));
  W.wall(-1.2, 24, 36, 2.6, Math.PI / 2, TEX.wallpaper([86, 80, 62], "wp2"));
  W.wall(1.2, 24, 36, 2.6, -Math.PI / 2, TEX.wallpaper([86, 80, 62], "wp2"));
  W.wall(0, 42, 2.4, 2.6, Math.PI, TEX.wallpaper([86, 80, 62], "wp2"));
  W.collider(-3, 6, -1.2, 42); W.collider(1.2, 6, 3, 42);
  ["1", "1", "1", "1", "2025", "1", "1", "4:04"].forEach((n, i) => {
    const z = 10 + i * 4, side = i % 2 ? 1 : -1;
    W.door(side * 1.17, z, side > 0 ? -Math.PI / 2 : Math.PI / 2, { label: "APT " + n, solid: false });
    if (i % 2 === 0) W.light(0, 2.3, z, 0xffd8a0, 5, { flicker: i === 4 ? 0.4 : 0 });
  });
  W.door(0, 41.9, Math.PI, { label: "APT 1", tint: "#5a2a1a" });
  return { start: [0.8, 1, -Math.PI * 0.75], cam: { yaw: Math.PI * 0.92, pitch: 0.42, dist: 4, height: 1.3 }, camZones: [{ x0: -3, z0: 6, x1: 3, z1: 42, cam: { yaw: 0, pitch: 0.3, dist: 3.6, height: 1.4 } }] };
}

// ------------------------------------------------------------
// The house, October 24, 2025 — inside (Argjila) / outside (Rufki)
// ------------------------------------------------------------
export function buildHouseIn(W, G) {
  env(W, { fog: 0x14100c, near: 5, far: 22, ambient: [0.36, 0.3, 0.26], dir: [0.12, 0.1, 0.08] });
  W.surface = "wood";
  // front room x -4..4, z 0..8; kitchen x -4..4, z 8..14 (open)
  W.room(-4, 0, 4, 14, 2.9, { floor: TEX.wood([96, 66, 44], "hfl"), wall: TEX.wallpaper([150, 140, 120], "pastel"), ceil: TEX.concrete([70, 66, 60], "hc") });
  W.ground(0, 11, 8, 6, TEX.tile("#d8d0b8", "#a8a090", "ktile"), { scale: 1, y: 0.006 });
  W.surfaceRect(-4, 8, 4, 14, "tile");
  // counters + table
  W.box(-3.5, 0, 11.2, 0.9, 0.95, 5, mat({ map: TEX.wood([170, 150, 120], "counter") }));
  W.table(1.2, 10.8, { w: 1.2, d: 0.9, tint: [120, 90, 60] });
  // the kitchen clock (ticks only when she moves)
  G._kclock = W.wallClock(0, 2.1, 13.95, Math.PI, 0.55);
  // stairs to the upstairs nobody should be on
  W.stairs(3.2, 3, 1.4, 8, 0.3, 0.45, 1, mat({ map: TEX.wood([80, 56, 40], "stair") }));
  W.collider(2.5, 2.6, 4, 7);
  // couch, window, mirror
  W.box(-3.1, 0, 3.4, 1.4, 0.8, 2.2, mat({ map: TEX.cloth([110, 90, 80], "couchA") }));
  W.sign(-3.98, 1.6, 6.2, "", Math.PI / 2, { w: 1.4, h: 1.1, bg: "#1a2236", tw: 8, th: 8, size: 6, unlit: true });
  W.frame(3.97, 1.5, 1.2, -Math.PI / 2, canvasTex("ordinary"), 0.6, 0.8, { glow: 0.05 });
  // the front door with chain + peephole (south wall, z = 0)
  G._frontDoor = W.door(0, 0.05, 0, { tint: "#5a3420", label: "" });
  W.light(0, 2.5, 4, 0xffd8a0, 8);
  W.light(0, 2.5, 11, 0xfff0d0, 7);
  return { start: [0.5, 9.5, Math.PI], cam: { yaw: Math.PI, pitch: 0.45, dist: 5, height: 1.2 } };
}
export function buildHouseOut(W, G) {
  env(W, { fog: 0xa8a49a, near: 8, far: 40, ambient: [0.55, 0.53, 0.5], dir: [0.5, 0.46, 0.4], dirVec: [-0.4, -1, 0.3], sat: 0.55 });
  W.surface = "street";
  W.ground(0, 20, 8, 70, TEX.road(), { scale: 5 });
  W.ground(-5.5, 20, 3, 70, TEX.sidewalk(), { scale: 1.5 });
  W.ground(-7.5, 20, 1.1, 70, TEX.concrete([110, 104, 96], "stoop"), { scale: 1.5 });
  W.ground(-14, 20, 13, 80, TEX.concrete([110, 104, 96], "stoop"), { scale: 1.5, y: -0.02 });
  W.building(-12, -8, 8, 7.6, 9, TEX.facade([110, 80, 66], 0.25, 44));
  W.bounds = { x0: -7, z0: -6, x1: -4.2, z1: 46 };
  // a row of identical brownstones with the same number
  const houses = [];
  for (let i = 0; i < 6; i++) {
    const z = i * 8;
    W.building(-12, z, 8, 7.6, 9, TEX.facade([128, 88, 70], 0.25, 40 + (i % 2)));
    W.stairs(-7.2, z, 1.6, 4, 0.22, 0.4, -1, mat({ map: TEX.concrete([110, 104, 96], "stoop") }));
    const d = W.door(-7.98, z, Math.PI / 2, { label: "11", tint: "#4a2c1c" });
    houses.push({ z, d });
    // kitchen window beside each door
    // the one kitchen window with a light on (where she is)
    if (i === 3) {
      W.mesh(boxGeo(0.06, 1.16, 1.56), M({ color: 0x2a1c14 }), -7.99, 2.0, z + 2.4);
      W.mesh(new THREE.PlaneGeometry(1.4, 1.0), M({ color: 0xf0c888, unlit: true }), -7.94, 2.0, z + 2.4, Math.PI / 2);
      W.mesh(boxGeo(0.04, 1.0, 0.06), M({ color: 0x2a1c14 }), -7.92, 2.0, z + 2.4);
      W.light(-7.0, 2.2, z + 2.4, 0xffc880, 5);
    }
  }
  W.lamp(-4.4, 12, { side: -1 }); W.lamp(-4.4, 30, { side: -1 });
  G._houses = houses;
  passersby(W, G, [[-4.7, 46, -4, 0.35]]);
  for (let i = 0; i < 6; i++) decal(W, ["missing", "posters", "noparking", "missing", "concert", "drain"][i], -7.97, i === 5 ? 0.3 : 1.5, i * 8 + 4.6, Math.PI / 2, i === 5 ? 0.6 : 0.8);
  return { start: [-5.5, -4, 0], cam: { yaw: -0.5, pitch: 0.3, dist: 5.5, height: 1.3 } };
}

// the room full of photographs (and the Unmet)
export function buildGallery(W, G) {
  env(W, { fog: 0x0a090c, near: 3, far: 20, ambient: [0.22, 0.2, 0.22], dir: [0.04, 0.04, 0.05] });
  W.surface = "wood";
  W.room(-2, 0, 2, 42, 3, { floor: TEX.wood([70, 50, 36], "galfloor"), wall: TEX.concrete([70, 66, 62], "galwall"), ceil: TEX.concrete([30, 30, 30], "galceil") });
  const lights = [];
  for (let z = 4; z < 42; z += 6) lights.push(W.light(0, 2.7, z, 0xe8d8c0, 6));
  W.frame(-1.95, 1.6, 2.2, Math.PI / 2, canvasTex("meeting"), 0.9, 0.68, { glow: 0.4 });
  W.frame(1.95, 1.6, 12, -Math.PI / 2, canvasTex("pass"), 0.9, 0.68);
  W.frame(-1.95, 1.6, 20, Math.PI / 2, canvasTex("never"), 0.9, 0.68);
  W.frame(1.95, 1.6, 28, -Math.PI / 2, canvasTex("alone"), 0.9, 0.68);
  for (let z = 6; z < 40; z += 3.2) W.frame((z * 7) % 2 > 1 ? -1.95 : 1.95, 1.2 + ((z * 3) % 1) * 0.8, z + 1.3, (z * 7) % 2 > 1 ? Math.PI / 2 : -Math.PI / 2, canvasTex(["pass", "never", "alone", "meeting"][Math.floor(z) % 4]), 0.4, 0.3, { glow: 0.05 });
  W.sign(0, 2.4, 41.9, "WHAT IF SHE NEVER CAME?", Math.PI, { w: 2.6, h: 0.3, bg: "#100808", fg: "#e0b0a0", tw: 128, th: 14, size: 8, unlit: true });
  G._galLights = lights;
  return { start: [0, 3.5, 0], cam: { yaw: 0, pitch: 0.28, dist: 4.2, height: 1.45 } };
}

// ------------------------------------------------------------
// The House of Almost — rooms of near misses off a long hall
// ------------------------------------------------------------
export const ALMOST = [
  { id: "sidewalks", name: "OPPOSITE SIDEWALKS", year: "2013", z0: 6, z1: 14 },
  { id: "corner", name: "THE MISSED CORNER", year: "2019", z0: 18, z1: 26 },
  { id: "school", name: "THE SCHOOL CORRIDOR", year: "2009", z0: 30, z1: 38 },
];
export function buildAlmostHall(W, G) {
  env(W, { fog: 0x0e0d10, near: 4, far: 26, ambient: [0.22, 0.2, 0.22], dir: [0.06, 0.06, 0.08] });
  W.surface = "wood";
  const wp = TEX.wallpaper([90, 70, 70], "hwp");
  W.ground(0, 23, 4, 46, TEX.wood([80, 56, 40], "hfloor"), { scale: 1.5 });
  W.ceiling(0, 23, 4, 46, 3.2, TEX.concrete([50, 46, 44], "hceil"));
  W.wall(-2, 23, 46, 3.2, Math.PI / 2, wp);
  W.wall(0, 0, 4, 3.2, 0, wp);
  W.wall(0, 46, 4, 3.2, Math.PI, wp);
  W.collider(-3, 0, -2, 46);
  let zc = 0;
  for (const r of ALMOST) {
    const g0 = (r.z0 + r.z1) / 2 - 0.8, g1 = (r.z0 + r.z1) / 2 + 0.8;
    W.wall(2, (zc + g0) / 2, g0 - zc, 3.2, -Math.PI / 2, wp);
    zc = g1;
  }
  W.wall(2, (zc + 46) / 2, 46 - zc, 3.2, -Math.PI / 2, wp);
  ["1996", "2001", "2009", "2013", "2019", "2025"].forEach((y, i) => {
    const z = 4 + i * 7.4;
    W.sign(-1.97, 1.7, z, y, Math.PI / 2, { w: 1.2, h: 1.0, bg: ["#1a2a4a", "#4a3a2a", "#6a7a8a", "#8a8070", "#3a3a4a", "#d0a070"][i], fg: "#ffffff", tw: 32, th: 28, size: 8, unlit: true });
    W.light(-1.5, 1.8, z, 0x8090b0, 4);
  });
  for (let z = 3; z < 46; z += 8) W.light(0, 3, z, 0xffd0a0, 6, { flicker: z === 27 ? 0.3 : 0 });
  W.bounds = { x0: -2, z0: 0, x1: 14, z1: 46 };
  for (const r of ALMOST) {
    const cz = (r.z0 + r.z1) / 2;
    const school = r.id === "school";
    const wt = school ? TEX.concrete([120, 130, 110], "schoolwall") : TEX.brick();
    W.ground(8, cz, 12, r.z1 - r.z0, school ? TEX.tile("#a8a8a0", "#8a8a80", "schooltile") : TEX.sidewalk(), { scale: 1.5 });
    W.ceiling(8, cz, 12, r.z1 - r.z0, 3.2, TEX.concrete([40, 40, 44], "rceil"));
    W.wall(8, r.z0, 12, 3.2, 0, wt);
    W.wall(8, r.z1, 12, 3.2, Math.PI, wt);
    W.wall(14, cz, r.z1 - r.z0, 3.2, -Math.PI / 2, school ? wt : TEX.facade([110, 90, 80], 0.3, 5));
    W.sign(2.03, 2.75, cz, `${r.name} · ${r.year}`, -Math.PI / 2, { w: 2.4, h: 0.3, bg: "#101010", fg: "#e8d8b0", tw: 128, th: 16, size: 8, unlit: true });
    W.light(8, 2.8, cz, school ? 0xe0f0ff : 0xffe0b0, 9);
    W.wall(2.01, (r.z0 + cz - 0.8) / 2, cz - 0.8 - r.z0, 3.2, Math.PI / 2, wt, { solid: false });
    W.wall(2.01, (cz + 0.8 + r.z1) / 2, r.z1 - cz - 0.8, 3.2, Math.PI / 2, wt, { solid: false });
    if (r.id === "sidewalks") W.ground(8, cz, 12, 3, TEX.road(), { scale: 4, y: 0.01 });
    else if (r.id === "corner") { W.box(11.5, 0, cz - 2.2, 5, 3.2, 3.2, mat({ map: TEX.brick([100, 70, 60], "cornerbrick") })); W.streetSign(8.6, cz - 0.4, "AVE J", "E 4 ST"); }
    else { for (let z = r.z0 + 0.6; z < r.z1 - 0.6; z += 0.7) W.box(13.6, 0, z, 0.5, 1.9, 0.6, mat({ map: TEX.metal(), color: 0x5a7a9a }), { solid: false }); W.collider(13.3, r.z0, 14, r.z1); }
  }
  W.door(0, 45.9, Math.PI, { sign: "THE FAR DOOR", tint: "#3a2a20" });
  W.sign(0, 2.1, 45.85, "DO NOT MAKE THEM MEET", Math.PI, { w: 1.6, h: 0.25, bg: "#e8e0c8", fg: "#801010", tw: 96, th: 12, size: 8 });
  return { start: [0, 1.5, 0], cam: { yaw: 0, pitch: 0.42, dist: 4.4, height: 1.3 }, camZones: ALMOST.map((r) => ({ x0: 2.3, z0: r.z0, x1: 14, z1: r.z1, cam: { yaw: -Math.PI / 2, pitch: 0.55, dist: 5.2, height: 1 } })) };
}

// an empty changing room (where the reflection leads)
export function buildChanging(W, G) {
  env(W, { fog: 0x0c1418, near: 3, far: 14, ambient: [0.24, 0.3, 0.34], dir: [0.05, 0.06, 0.07] });
  W.surface = "water";
  W.room(-2.5, 0, 2.5, 7, 2.6, { floor: TEX.tile("#7a9aa0", "#5a7a80", "ctile"), wall: TEX.tile("#c8d0c8", "#9aa8a0", "cwall") });
  for (let z = 1; z < 7; z += 1.1) W.box(2.2, 0, z, 0.5, 1.9, 0.9, mat({ map: TEX.metal(), color: 0x6a7a80 }), { solid: false });
  W.collider(1.9, 0, 2.5, 7);
  W.light(0, 2.4, 3.5, 0x9fc0d0, 6, { flicker: 0.3 });
  return { start: [0, 0.8, 0], cam: { yaw: 0, pitch: 0.4, dist: 3.4, height: 1.3 } };
}

// endings
export function buildSunrise(W, G) {
  env(W, { fog: 0xe8b890, near: 14, far: 70, ambient: [0.6, 0.52, 0.48], dir: [0.9, 0.7, 0.5], dirVec: [0.4, -0.5, 1] });
  W.add(new THREE.Mesh(new THREE.SphereGeometry(95, 12, 8), mat({ map: TEX.sky("#6a8ac0", "#f0b890", "#ffe0b0", "sunrise"), unlit: true, noFog: true, side: THREE.BackSide })));
  W.boulevard(-20, 90, { lit: 0.05 });
  G._car = W.car(10, 0, 0, [70, 66, 74]);
  const cars = [];
  for (let i = 0; i < 5; i++) { const c = W.car(i % 2 ? 2.5 : -2.5, i * 18 - 10, i % 2 ? 0 : Math.PI, [[150, 40, 40], [60, 80, 120], [200, 190, 160]][i % 3], { solid: false, lights: true }); cars.push([c, i % 2 ? 1 : -1]); }
  W.every((dt) => cars.forEach(([c, d]) => { c.position.z += d * dt * 9; if (c.position.z > 90) c.position.z = -20; if (c.position.z < -20) c.position.z = 90; }));
  return { start: [13.5, -1.4, 0] };
}
export function buildDayStreet(W, G) {
  env(W, { fog: 0xb8bcc0, near: 12, far: 60, ambient: [0.55, 0.55, 0.58], dir: [0.6, 0.58, 0.52] });
  W.boulevard(-20, 90, { lit: 0.05 });
  return { start: [13.5, 0, 0] };
}
export function buildBook(W, G) {
  env(W, { fog: 0x1a120c, near: 4, far: 16, ambient: [0.36, 0.3, 0.24], dir: [0.2, 0.15, 0.1] });
  W.room(-3, -3, 3, 3, 2.6, { floor: TEX.carpet([90, 50, 40], "bookcarpet"), wall: TEX.wallpaper([110, 90, 70], "bookwp") });
  W.table(0, 0, { w: 1.2, d: 0.8, tint: [80, 56, 40] });
  W.mesh(boxGeo(0.4, 0.06, 0.3), mat({ map: canvasTex("book") }), 0, 0.82, 0);
  W.light(0, 2.2, 0, 0xffc890, 6);
  return { start: [0, -2.5, 0] };
}
export function buildCrossing(W, G) {
  env(W, { fog: 0x8a8a90, near: 10, far: 55, ambient: [0.5, 0.5, 0.54], dir: [0.5, 0.48, 0.44], sat: 0.85 });
  W.boulevard(-30, 35, { lit: 0.1 });
  W.boulevard(45, 100, { lit: 0.1 });
  W.ground(0, 40, 60, 10, TEX.road(), { scale: 6 });
  skyline(W, "storm", { r: 110, y: -4, h: 48, rep: 3, color: 0xc8c4d0 });
  streetDecals(W, 1, 15, [-28, 34]);
  streetDecals(W, -1, 15, [-28, 34], 5);
  return { start: [0, 0, 0] };
}

// ============================================================
// 3D MAPS — every location modeled, first-game style.
// Each builder registers named spots: W.spots[name] = [x, z, yaw]
// ============================================================
export const spot = (W, name, x, z, yaw = 0) => ((W.spots ||= {})[name] = [x, z, yaw]);
// a painted skyline panorama on an open ring around the map
export function skyline(W, name, o = {}) {
  const t = ART.tex["sky_" + name];
  if (!t) return null;
  const r = o.r ?? 70, h = o.h ?? r * 0.42, y = o.y ?? -2;
  const t2 = t.clone(); t2.wrapS = THREE.RepeatWrapping; t2.needsUpdate = true; t2.userData = { uvk: [-(o.rep ?? 3), 1] };
  const geo = new THREE.CylinderGeometry(r, r, h, 48, 1, true);
  const m = new THREE.Mesh(geo, mat({ map: t2, unlit: true, noFog: true, side: THREE.BackSide, color: o.color ?? 0xffffff }));
  m.position.set(o.x ?? 0, y + h / 2, o.z ?? 0);
  m.rotation.y = o.rot ?? 0;
  m.renderOrder = -1;
  W.add(m);
  return m;
}
// a row of posters, flyers and shop signs along a facade line (side +1: wall at +x facing -x)
const WALL = [["missing", 1.5, 0.8], ["posters", 1.6, 1.1], ["fogmart", 3.4, 1.6], ["graffiti", 1.2, 1.6], ["concert", 1.6, 1.0], ["emberdeli", 3.4, 1.6], ["noparking", 1.7, 0.7], ["boarded", 2.0, 1.3], ["linden", 3.3, 1.4], ["floating", 1.6, 1.0], ["missing", 1.5, 0.8], ["newsbox", 0.65, 1.3]];
export function streetDecals(W, side, x, [z0, z1], off = 0) {
  const ry = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  let i = off;
  for (let z = z0; z < z1; z += 5.5 + (i % 3)) {
    const [n, y, s] = WALL[i % WALL.length];
    decal(W, n, x - side * 0.03, y, z, ry, s, s);
    i++;
  }
}
// a painted poster / sign / flyer flat on a wall
export function decal(W, name, x, y, z, ry, w = 1, h = w) {
  const t = ART.tex["decal_" + name];
  if (!t) return null;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: t }));
  m.position.set(x, y, z);
  m.rotation.y = ry;
  W.add(m);
  return m;
}
// faceless passers-by: they walk out of the fog along a line, stop and
// turn to watch you when you come near, and are gone when you reach them
export function passersby(W, G, lines) {
  const KINDS = [["passerby", 1.05], ["passerbyW", 0.95], ["passerbyO", 0.65], ["passerbyK", 1.25]];
  for (const [n, [x, z0, z1, ph = 0, along = "z"]] of lines.entries()) {
    const [kind, speed] = KINDS[(n + Math.round(Math.abs(x * 7 + z0))) % KINDS.length];
    const a = new SpriteActor(kind, { color: 0xb8b4bc });
    const len = Math.abs(z1 - z0), dir = Math.sign(z1 - z0) || 1;
    let u = len * ph, gone = 0;
    const put = () => { const z = z0 + dir * u; along === "z" ? a.setPos(x, 0, z) : a.setPos(z, 0, x); a.last = null; };
    put();
    W.addActor(a);
    let first = true;
    W.every((dt) => {
      const P = G.player;
      if (!P || !P.pos) return;
      const p = a.root.position;
      if (gone > 0) {
        gone -= dt;
        if (gone <= 0) { u = 0; put(); if (Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 9) gone = 2; else a.setVisible(true); }
        return;
      }
      const d = Math.hypot(P.pos.x - p.x, P.pos.z - p.z);
      // never appear right beside you: they come out of the fog
      if (first) { first = false; if (d < 9) { a.setVisible(false); gone = 3 + Math.random() * 3; return; } }
      if (d < 1.4) { a.setVisible(false); gone = 7 + Math.random() * 5; G.audio?.noise?.(0.12, 2600, 1.5, 0.05); return; }
      if (d < 3.4) { a.faceToward(P.pos.x, P.pos.z); a.last = null; return; }
      u += speed * dt;
      if (u > len) { a.setVisible(false); gone = 2 + Math.random() * 4; return; }
      const z = z0 + dir * u;
      along === "z" ? (p.z = z) : (p.x = z);
    });
  }
}
const M = (o) => mat(o);
function lampPost(W, x, z, o = {}) { return W.lamp(x, z, { side: o.side ?? 1, color: o.color ?? 0xffc890, range: o.range ?? 9, flicker: o.flicker || 0, h: o.h }); }
function pendant(W, x, y, z, color = 0xffd8a0, range = 7, flicker = 0) {
  W.mesh(boxGeo(0.02, 0.6, 0.02), M({ color: 0x111111 }), x, y + 0.3, z);
  W.mesh(new THREE.CylinderGeometry(0.08, 0.32, 0.2, 8), M({ color, unlit: true }), x, y, z);
  W.glow(x, y - 0.05, z, 0.9, color);
  return W.light(x, y - 0.3, z, color, range, { flicker });
}
function cord(W, x0, y0, z0, x1, y1, z1, sag = 0.6, segs = 7, m) {
  // a hanging telephone cord made of short boxes along a sagging curve
  const mm = m || M({ color: 0x0c0c0e });
  let px = x0, py = y0, pz = z0;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    const y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * sag;
    const dx = x - px, dy = y - py, dz = z - pz, L = Math.hypot(dx, dy, dz);
    const seg = new THREE.Mesh(boxGeo(0.035, 0.035, L), mm);
    seg.position.set((x + px) / 2, (y + py) / 2, (z + pz) / 2);
    seg.lookAt(x, y, z);
    W.add(seg);
    px = x; py = y; pz = z;
  }
}

// ---- Ocean Parkway: the sidewalk by the car (title, chapter 1, the dusk scene)
export function buildSidewalk(W, G, o = {}) {
  const dusk = o.dusk;
  env(W, dusk ? { fog: 0x6a4e50, near: 8, far: 44, ambient: [0.5, 0.4, 0.4], dir: [0.4, 0.26, 0.2], sat: 0.7 }
    : { fog: 0x3a3448, near: 4, far: 32, ambient: [0.32, 0.3, 0.4], dir: [0.12, 0.12, 0.18] });
  W.boulevard(-20, 70, { lit: dusk ? 0.1 : 0.22, flicker: !dusk });
  const car = W.car(10, 0, 0, [70, 66, 74], { lights: !dusk });
  G._car = car;
  W.car(10, 18, 0, [40, 60, 50]);
  W.car(-10, 10, Math.PI, [90, 40, 36]);
  W.hydrant(12.6, 6);
  W.trash(12.8, 24);
  // iron fence along the planted mall, like the painting
  for (let z = -18; z < 68; z += 2) W.mesh(boxGeo(0.05, 0.9, 2), M({ color: 0x141416 }), 7.9, 0.45, z + 1);
  // stoops on the building side
  for (let z = 4; z < 60; z += 9) W.stairs(15.6, z, 1.6, 4, 0.2, 0.35, -1, M({ map: TEX.concrete([120, 110, 100], "stoop") }));
  // the window that breathes
  G._breathWin = W.glow(16.8, 6.2, 8, 2.2, 0xffb060);
  W.light(15.2, 5.6, 8, 0xffb060, 8);
  // the streetlamp with the photograph under it
  lampPost(W, 12.4, 14, { side: 1, range: 10 });
  passersby(W, G, [[14.4, 64, 4, 0.55], [12.7, 66, 8, 0.15]]);
  streetDecals(W, 1, 15, [-4, 60]);
  spot(W, "car", 10.4, -0.15, 0);
  spot(W, "start", 13.4, -3, 0);
  spot(W, "photo", 13.2, 14.2);
  spot(W, "exit", 13.5, 40);
  spot(W, "other", 13.5, 22, Math.PI);
  W.bounds = { x0: 12.1, z0: -6, x1: 14.9, z1: 66 };
  return { start: [13.4, -3, 0], cam: { yaw: 0.32, pitch: 0.28, dist: 6.4, height: 1.3 } };
}
export function buildTitle(W, G) {
  const r = buildSidewalk(W, G);
  G.player.ch.setVisible(false);
  const t0 = G.time;
  W.every(() => { const k = (G.time - t0) * 0.05; G.rig.shot([17 - Math.sin(k) * 4, 2.2 + Math.sin(k * 0.7) * 0.3, -8 + k * 0.6 % 20], [10, 1.2, 6 + (k * 0.6) % 20], false, 50); });
  return r;
}

// ---- the hallway lined with front doors (Argjila's side of the call)
export function buildHallway(W, G, o = {}) {
  const warm = o.warm;
  env(W, { fog: 0x1a120a, near: 5, far: 22, ambient: warm ? [0.5, 0.4, 0.3] : [0.34, 0.27, 0.2], dir: [0.06, 0.05, 0.04] });
  W.surface = "tile";
  const L = 20;
  W.ground(0, L / 2, 2.8, L, TEX.tile("#b8a890", "#6a5a48", "halltile"), { scale: 1 });
  W.ground(0, L / 2, 1.1, L, TEX.carpet([60, 40, 34], "runner"), { scale: 1, y: 0.006 });
  W.ceiling(0, L / 2, 2.8, L, 2.7, TEX.concrete([90, 74, 56], "hallceil"));
  const wp = TEX.wallpaper([140, 112, 80], "hallwp"), wains = TEX.wood([40, 58, 46], "wainscot");
  for (const s of [-1, 1]) {
    W.wall(s * 1.4, L / 2, L, 2.7, s > 0 ? -Math.PI / 2 : Math.PI / 2, wp);
    W.mesh(boxGeo(0.04, 1.0, L), M({ map: wains }), s * 1.37, 0.5, L / 2);
  }
  W.wall(0, 0, 2.8, 2.7, 0, wp);
  W.wall(0, L, 2.8, 2.7, Math.PI, wp);
  W.bounds = { x0: -1.3, z0: 0.2, x1: 1.3, z1: L - 0.2 };
  // doors along both walls, every one with a peephole
  const doors = [];
  for (let i = 0; i < 6; i++) {
    const z = 3 + i * 2.8, s = i % 2 ? 1 : -1;
    doors.push(W.door(s * 1.37, z, s > 0 ? -Math.PI / 2 : Math.PI / 2, { label: String(1 + i), solid: false }));
  }
  W.door(0, L - 0.05, Math.PI, { tint: "#3a2418" });
  // her own door, with the brass chain
  W.door(-1.37, 1.2, Math.PI / 2, { tint: "#5a3018", solid: false });
  const brass = M({ color: 0xd0a040, emissive: 0.2 });
  W.mesh(boxGeo(0.04, 0.06, 0.12), brass, -1.3, 1.45, 0.9);
  W.mesh(boxGeo(0.04, 0.06, 0.12), brass, -1.3, 1.45, 1.5);
  G._chain = W.mesh(boxGeo(0.02, 0.03, 0.55), brass, -1.29, 1.38, 1.2);
  for (let z = 2; z < L; z += 4) pendant(W, 0, 2.45, z, 0xffcf8a, 7, z === 14 ? 0.3 : 0);
  spot(W, "start", 0.3, 0.9, 0);
  spot(W, "chain", -0.8, 1.2, -Math.PI / 2);
  spot(W, "doorA", -0.8, 3, -Math.PI / 2);
  spot(W, "doorB", 0.8, 5.8, Math.PI / 2);
  spot(W, "doorC", -0.8, 14.2, -Math.PI / 2);
  spot(W, "kitchen", 0.8, 8.6, Math.PI / 2);
  spot(W, "end", 0, 19, 0);
  return { start: [0.3, 0.9, 0], cam: { yaw: 0, pitch: 0.26, dist: 3.4, height: 1.45, fov: 60 } };
}

// ---- the House of Almost: a balcony over impossible Brooklyn
export function buildBalcony(W, G) {
  env(W, { fog: 0x4a4462, near: 6, far: 46, ambient: [0.42, 0.4, 0.52], dir: [0.12, 0.12, 0.16] });
  W.surface = "tile";
  W.ground(0, 0, 8, 4, TEX.tile("#8a7a6a", "#5a4a40", "balcony"), { scale: 1 });
  W.mesh(boxGeo(8.2, 0.4, 4.2), M({ map: TEX.concrete([70, 64, 60], "balc") }), 0, -0.21, 0);
  W.wall(0, -2, 8, 4, 0, TEX.brick([90, 70, 60], "almbrick"));
  W.door(-2.4, -1.95, 0, { tint: "#3a2418", glow: 0.1 });
  lampPost(W, -1.2, -1.8, { side: 1, h: 2.6, range: 6 });
  // railing
  for (let x = -4; x <= 4; x += 0.5) W.mesh(boxGeo(0.04, 1, 0.04), M({ color: 0x18161a }), x, 0.5, 2);
  W.mesh(boxGeo(8, 0.06, 0.06), M({ color: 0x18161a }), 0, 1.0, 2);
  W.collider(-4.2, 1.95, 4.2, 2.2);
  W.bounds = { x0: -3.8, z0: -1.7, x1: 3.8, z1: 1.9 };
  // floating apartments, each window a different year
  const years = ["1996", "2001", "2009", "2013", "2019", "2025"];
  for (let i = 0; i < 14; i++) {
    const x = -24 + ((i * 37) % 48), y = -6 + ((i * 13) % 22), z = 10 + ((i * 23) % 30);
    W.mesh(boxGeo(3 + (i % 3), 3 + (i % 2) * 2, 3), M({ map: TEX.facade([90, 74, 66], 0.5, 60 + i) }), x, y, z).rotation.y = (i % 5) * 0.3;
    if (i < 6) W.sign(x, y + 0.6, z - 1.55, years[i], 0, { w: 1, h: 0.8, bg: "#d0a060", fg: "#3a2010", tw: 24, th: 20, size: 7, unlit: true });
  }
  // stairs to nowhere
  for (let i = 0; i < 12; i++) W.mesh(boxGeo(1.6, 0.25, 0.6), M({ map: TEX.concrete([80, 76, 70], "almstep") }), 8 + i * 0.5, -3 + i * 0.25, 14 + i * 0.6);
  spot(W, "start", 1.5, 0.6, Math.PI);
  spot(W, "door", -2.4, -1.4, Math.PI);
  return { start: [1.5, 0.6, Math.PI], cam: { yaw: 0.3, height: 1.2 }, camZones: [{ x0: -5, z0: -3, x1: 5, z1: 3, cam: { fixed: [-3.5, 2.5, -1.5], height: 0.9 } }] };
}

// ---- a bedroom (hers, then his in the world without her)
export function buildBedroom(W, G, o = {}) {
  const tone = o.tone || "night";
  const amb = { night: [0.34, 0.3, 0.42], warm: [0.56, 0.46, 0.4], dawn: [0.46, 0.4, 0.46] }[tone];
  env(W, { fog: 0x1e1a24, near: 4, far: 16, ambient: amb, dir: [0.2, 0.18, 0.22], dirVec: [1, -0.6, 0.2] });
  W.surface = "wood";
  W.room(-3, -3, 3, 4, 2.7, { floor: TEX.wood([110, 84, 60], "bedfloor"), wall: TEX.wallpaper(o.his ? [96, 96, 104] : [140, 112, 120], o.his ? "hiswall" : "herwall") });
  W.bed(1.8, 1.8, 0, { sheet: o.his ? [70, 80, 110] : [150, 120, 140] });
  // desk + chair + phone
  W.table(-2.1, 3.1, { w: 1.4, d: 0.7, tint: [90, 66, 46] });
  W.chair(-2.1, 2.4, 0);
  W.mesh(boxGeo(0.08, 0.02, 0.16), M({ color: 0x101820 }), -1.8, 0.8, 3.1);
  // dresser with frames
  W.box(-2.6, 0, -0.5, 0.7, 1.0, 1.6, M({ map: TEX.wood([80, 56, 40], "dresser") }));
  const frameTex = o.blank ? null : canvasTex(o.his ? "alone" : "couple");
  W.frame(-2.6, 1.3, -0.9, Math.PI / 2, frameTex || canvasTex("tv"), 0.35, 0.28, { glow: 0.05 });
  W.frame(-2.6, 1.3, -0.1, Math.PI / 2, frameTex || canvasTex("tv"), 0.35, 0.28, { glow: 0.05 });
  // window with blinds, lamp
  W.sign(2.97, 1.6, -0.6, "", -Math.PI / 2, { w: 1.6, h: 1.1, bg: tone === "dawn" ? "#e8a080" : tone === "warm" ? "#f0d0a0" : "#20283a", tw: 8, th: 8, unlit: true });
  for (let i = 0; i < 6; i++) W.mesh(boxGeo(0.02, 0.05, 1.6), M({ color: 0x2a2420 }), 2.94, 1.15 + i * 0.18, -0.6);
  W.light(2.4, 1.6, -0.6, tone === "dawn" ? 0xff9a80 : tone === "warm" ? 0xffd8a0 : 0x6070a0, 6);
  W.box(2.6, 0, 3.4, 0.5, 0.6, 0.5, M({ map: TEX.wood([80, 56, 40], "night") }));
  W.glow(2.6, 0.95, 3.4, 0.6, 0xffc890);
  W.light(2.6, 1.1, 3.4, 0xffc890, 5);
  // a shelf for the things she kept
  W.box(0.2, 0, 3.75, 2.2, 1.2, 0.4, M({ map: TEX.wood([96, 70, 50], "shelf") }));
  W.door(0, -2.95, 0, { tint: "#5a4a3a" });
  spot(W, "start", 0, -1.6, 0);
  spot(W, "phone", -1.8, 2.3, 0);
  spot(W, "dresser", -1.9, -0.5, -Math.PI / 2);
  spot(W, "window", 2.2, -0.6, Math.PI / 2);
  spot(W, "bedside", 0.6, 1.2, Math.PI / 2);
  spot(W, "shelf", 0.2, 3.1, 0);
  spot(W, "desk", -2.1, 2.3, 0);
  spot(W, "nightstand", 2.1, 3.0, 0);
  spot(W, "chair", -0.8, 0.6, Math.PI / 2);
  return { start: [0, -1.6, 0], cam: { yaw: 0, height: 1.2 }, camZones: [{ x0: -3, z0: -3, x1: 3, z1: 4, cam: { fixed: [2.5, 2.4, -2.6], height: 1.0 } }] };
}

// ---- Williamsburg Bathhouse — the rooftop pool at night, the city all around
function nightCity(W, o = {}) {
  // a ring of buildings below and around a rooftop, windows lit
  const R0 = o.r0 || 24, n = o.n || 40, baseY = o.y ?? -26;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (i % 3) * 0.05;
    const r = R0 + ((i * 37) % 40);
    const h = 8 + ((i * 53) % 24) + (i % 7 === 0 ? 26 : 0);
    const w = 6 + (i % 4) * 2;
    const b = W.mesh(boxGeo(w, h, w, 2, 4), M({ map: TEX.facade([60 + (i % 3) * 14, 52, 60], 0.55, 200 + i), emissive: 0.05 }), Math.sin(a) * r, baseY + h / 2, Math.cos(a) * r);
    b.rotation.y = a;
    if (i % 5 === 0) W.mesh(boxGeo(0.2, 0.2, 0.2), M({ color: 0xff2020, unlit: true }), Math.sin(a) * r, baseY + h + 0.4, Math.cos(a) * r);
  }
}
function starSky(W, top, mid, bot, key) {
  W.add(new THREE.Mesh(new THREE.SphereGeometry(120, 12, 8), M({ map: TEX.sky(top, mid, bot, key), unlit: true, noFog: true, side: THREE.BackSide })));
  const sm = M({ color: 0xe8e8ff, unlit: true, noFog: true });
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2, e = 0.25 + Math.random() * 1.1, r = 110;
    W.mesh(boxGeo(0.35, 0.35, 0.35), sm, Math.cos(e) * Math.sin(a) * r, Math.sin(e) * r, Math.cos(e) * Math.cos(a) * r);
  }
}
export function buildBathhouse(W, G) {
  env(W, { fog: 0x10162a, near: 18, far: 110, ambient: [0.3, 0.32, 0.42], dir: [0.12, 0.14, 0.22], dirVec: [0.3, -1, 0.4] });
  W.surface = "tile";
  starSky(W, "#05060f", "#141a34", "#3a2a3a", "rooftopsky");
  const deck = TEX.tile("#8a8478", "#6a645a", "roofdeck"), pool = TEX.tile("#3a8a9a", "#2a6a78", "pooltile");
  // the building under the roof (so the edges read solid) + the deck
  W.mesh(boxGeo(22, 28, 26, 4, 6), M({ map: TEX.facade([70, 60, 56], 0.5, 77) }), 0, -15.9, 0);
  // the slab between the deck and the building, open where the pool is
  const slab = M({ map: TEX.concrete([60, 56, 52], "slab") });
  for (const [x, z, w, d] of [[0, -9, 22, 6], [0, 9, 22, 6], [-7.75, 0, 6.5, 12], [7.75, 0, 6.5, 12]]) W.mesh(boxGeo(w, 1.8, d), slab, x, -0.95, z);
  W.ground(0, -9, 20, 6, deck, { scale: 1 });
  W.ground(0, 9, 20, 6, deck, { scale: 1 });
  W.ground(-7.5, 0, 5, 12, deck, { scale: 1 });
  W.ground(7.5, 0, 5, 12, deck, { scale: 1 });
  // parapet
  const par = M({ map: TEX.concrete([86, 80, 74], "parapet") });
  for (const [x, z, w, d] of [[0, -12, 20.4, 0.4], [0, 12, 20.4, 0.4], [-10, 0, 0.4, 24], [10, 0, 0.4, 24]]) W.mesh(boxGeo(w, 1.0, d), par, x, 0.5, z);
  W.collider(-10.2, -12.2, 10.2, -11.8); W.collider(-10.2, 11.8, 10.2, 12.2); W.collider(-10.2, -12.2, -9.8, 12.2); W.collider(9.8, -12.2, 10.2, 12.2);
  // the pool, lit from below
  W.floor(-5, -6, 5, 6, -1.8);
  W.mesh(planeGeo(10, 12, 1), M({ map: pool, emissive: 0.4 }), 0, -1.8, 0);
  for (const [x, z, w, ry] of [[0, 6, 10, Math.PI], [5, 0, 12, -Math.PI / 2], [-5, 0, 12, Math.PI / 2], [0, -6, 10, 0]]) W.mesh(new THREE.PlaneGeometry(w, 1.8, 4, 1), M({ map: pool, emissive: 0.4 }), x, -0.9, z, ry);
  for (const x of [-2.5, 0, 2.5]) W.mesh(boxGeo(0.25, 0.01, 11), M({ color: 0x103040 }), x, -1.78, 0);
  const lip = M({ color: 0xd8d2c4 });
  W.mesh(boxGeo(10.4, 0.1, 0.25), lip, 0, 0, 6.1); W.mesh(boxGeo(10.4, 0.1, 0.25), lip, 0, 0, -6.1);
  W.mesh(boxGeo(0.25, 0.1, 12.2), lip, 5.1, 0, 0); W.mesh(boxGeo(0.25, 0.1, 12.2), lip, -5.1, 0, 0);
  W.collider(-5.2, 5.95, 5.2, 6.15); W.collider(4.95, -6.2, 5.15, 6.2); W.collider(-5.15, -6.2, -4.95, 6.2); W.collider(-5.2, -6.15, 5.2, -5.95);
  for (const x of [-3.8, -3.2]) W.mesh(boxGeo(0.06, 1.8, 0.06), M({ color: 0xc8c8c0 }), x, 0.2, -5.9);
  for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { W.light(x, -1.4, z, 0x30c0d0, 7); W.glow(x, -1.7, z, 1.2, 0x40d0e0); }
  const water = W.ground(0, 0, 10, 12, TEX.water([70, 190, 210], "roofwater"), { y: -0.25, wave: 1, scroll: [0.02, 0.01], opacity: 0.5 });
  water.material.uniforms.uEmissive.value = 0.55;
  water.renderOrder = 2;
  G._water = water;
  // steam rising off the warm water
  const steam = [];
  for (let i = 0; i < 10; i++) { const s = W.glow((Math.random() - 0.5) * 8, 0.3, (Math.random() - 0.5) * 10, 2.4, 0x6a7a8a); steam.push(s); }
  W.every((dt, t) => steam.forEach((s, i) => { s.position.y = 0.2 + ((t * 0.25 + i * 0.37) % 2.2); s.material.uniforms.uOpacity && (s.material.uniforms.uColor.value.setScalar(0.35 * (1 - (s.position.y - 0.2) / 2.2))); }));
  // stair bulkhead with the changing-room doors and a neon sign
  W.box(0, 0, -10.6, 8, 3.2, 2.4, M({ map: TEX.brick([90, 64, 54], "bulk") }));
  for (const x of [-2.4, 0, 2.4]) W.door(x, -9.38, 0, { tint: "#3a2a20", solid: false });
  W.sign(0, 2.75, -9.37, "WILLIAMSBURG BATHHOUSE", 0, { w: 4.6, h: 0.45, bg: "#08202a", fg: "#7ff0ff", tw: 128, th: 14, size: 9, unlit: true });
  W.light(0, 2.6, -8.8, 0x60e0ff, 8);
  // water tank, vents, lounge chairs, planters
  for (const [lx, lz] of [[-3.4, -11.1], [-2.2, -11.1], [-3.4, -10.1], [-2.2, -10.1]]) W.mesh(boxGeo(0.12, 1.2, 0.12), M({ color: 0x3a3028 }), lx, 3.8, lz);
  W.mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.9, 10), M({ map: TEX.wood([90, 66, 44], "tank") }), -2.8, 5.35, -10.6);
  W.mesh(new THREE.ConeGeometry(1.15, 0.7, 10), M({ color: 0x2a2420 }), -2.8, 6.65, -10.6);
  W.box(-8, 0, -9.6, 1.4, 1.0, 1.4, M({ map: TEX.metal(), color: 0x6a6a70 }));
  const cushion = M({ map: TEX.cloth([200, 196, 184], "lounger") });
  for (const [x, z, ry] of [[-8, -3, Math.PI / 2], [-8, 3, Math.PI / 2], [8, -3, -Math.PI / 2], [6.5, 9.4, Math.PI]]) { const l = W.mesh(boxGeo(0.7, 0.3, 1.8), cushion, x, 0.25, z, ry); W.colliderBox(x, z, 0.8, 1.9, ry); }
  for (const [x, z] of [[-9.2, -7], [-9.2, 7], [9.2, 7]]) { W.box(x, 0, z, 0.8, 0.7, 0.8, M({ map: TEX.concrete([70, 66, 60], "planter") })); W.mesh(new THREE.IcosahedronGeometry(0.6, 0), M({ map: TEX.leaves([40, 60, 40], "roofleaf") }), x, 1.1, z); }
  // string lights over the water
  const bulb = M({ color: 0xffd890, unlit: true });
  for (const z of [-4, 0, 4]) {
    for (const x of [-9.6, 9.6]) W.mesh(boxGeo(0.08, 3.2, 0.08), M({ color: 0x1a1a1a }), x, 1.6, z);
    cord(W, -9.6, 3.1, z, 9.6, 3.1, z, 0.7, 12, M({ color: 0x1a1a1a }));
    for (let k = 1; k < 12; k++) { const t = k / 12; const x = -9.6 + 19.2 * t, y = 3.1 - Math.sin(t * Math.PI) * 0.7 - 0.08; W.mesh(boxGeo(0.1, 0.12, 0.1), bulb, x, y, z); }
    W.light(0, 2.4, z, 0xffd890, 9);
  }
  // the city, the bridge, the river glint
  nightCity(W, { r0: 34, n: 52, y: -30 });
  skyline(W, "night", { r: 105, y: -34, h: 50, rep: 3 });
  const steel = M({ color: 0x1a1a24, noFog: true });
  W.mesh(boxGeo(120, 1.2, 2), steel, 20, -6, 70).rotation.y = -0.3;
  for (const x of [-10, 40]) W.mesh(boxGeo(2, 34, 2), steel, x, 6, 70 + (x - 20) * 0.31);
  for (let k = 0; k < 24; k++) W.mesh(boxGeo(0.3, 0.3, 0.3), M({ color: 0xffd080, unlit: true, noFog: true }), -38 + k * 5, -5, 70 + (-38 + k * 5 - 20) * 0.31);
  const door = W.door(0, 11.4, Math.PI, { tint: "#101014", sign: "THE THINGS WE NEVER SAID", solid: false, glow: 0.15 });
  door.visible = false;
  G._bathDoor = door;
  W.water = { y: -0.25 };
  W.bounds = { x0: -9.7, z0: -9.2, x1: 9.7, z1: 11.7 };
  spot(W, "start", 0, -8.2, 0);
  spot(W, "her", 2, 8.4, Math.PI);
  spot(W, "reflection", 2, 4.5, Math.PI);
  spot(W, "reflectionEnd", -3.5, -4, Math.PI);
  spot(W, "edgeNear", 0, -6.6, 0);
  spot(W, "argStart", 3.5, 8.6, Math.PI);
  spot(W, "rufkiFar", -2, -8, 0);
  spot(W, "towel", -7.2, 9.6);
  spot(W, "exit", 9.0, 10.4);
  spot(W, "tileHer", 1.4, 6.7, Math.PI);
  spot(W, "tileHim", 0.6, 6.7, Math.PI);
  spot(W, "door", 0, 10.8);
  for (let i = 0; i < 4; i++) spot(W, "photo" + i, -3 + i * 2, 6.55);
  spot(W, "bottom", 0, -6.55);
  return {
    start: [0, -8.2, 0], cam: { yaw: 0, pitch: 0.5, dist: 5, height: 1.0 },
    camZones: [
      { x0: -10, z0: -12, x1: 10, z1: 0, cam: { fixed: [9.2, 5.2, -1.5], height: 0.6 } },
      { x0: -10, z0: 0, x1: 10, z1: 12, cam: { fixed: [-9.2, 5.2, 1.5], height: 0.6 } },
    ],
  };
}

// ---- the dance studio: parquet, barre, a mirror wall
export function buildDance(W, G, o = {}) {
  env(W, { fog: 0x1c120a, near: 7, far: 26, ambient: [0.44, 0.34, 0.26], dir: [0.1, 0.08, 0.06] });
  W.surface = "wood";
  W.room(-6, -5, 6, 7, 3.6, { floor: TEX.wood([120, 70, 40], "parquet"), wall: TEX.wallpaper([110, 84, 60], "studio"), ceil: TEX.concrete([60, 50, 44], "sceil") });
  // tall windows + barre on the left wall
  for (let z = -3; z <= 5; z += 2.6) W.sign(-5.97, 2, z, "", Math.PI / 2, { w: 1.4, h: 2.6, bg: "#3a3c6a", tw: 8, th: 8, unlit: true });
  W.mesh(boxGeo(0.06, 0.06, 11), M({ map: TEX.wood([150, 110, 70], "barre") }), -5.6, 1.05, 1);
  for (let z = -4; z <= 6; z += 2.5) W.mesh(boxGeo(0.04, 1.05, 0.04), M({ color: 0x222222 }), -5.75, 0.52, z);
  // the mirror wall (far side): the room continues dimly behind the glass
  W.mesh(new THREE.PlaneGeometry(11, 3.2), M({ color: 0x8a8090, opacity: 0.32 }), 0, 1.6, 6.95, Math.PI);
  W.room(-6, 7, 6, 15, 3.6, { floor: TEX.wood([90, 52, 30], "parquetM"), wall: TEX.wallpaper([70, 54, 40], "studioM"), skip: ["s"], bounds: false });
  W.collider(-6, 6.95, 6, 7.05);
  for (const [x, z] of [[-2, -1], [2, 3]]) pendant(W, x, 3.1, z, 0xffcf90, 9);
  pendant(W, 0, 3.1, 11, 0xd0a070, 6);
  W.bounds = { x0: -5.6, z0: -4.6, x1: 5.6, z1: 6.8 };
  spot(W, "start", 0, -3, 0);
  spot(W, "center", 0, 1.5, 0);
  spot(W, "edge", 4, 5, Math.PI);
  spot(W, "double", 2.4, 3.4, Math.PI);
  spot(W, "mirror", 3, 10, Math.PI);
  return { start: [0, -3, 0], cam: { yaw: 0.25, pitch: 0.34, dist: 5.6, height: 1.2, fov: 55 } };
}

// ---- inside the sedan (the radio scene and the drive back)
export function buildCar(W, G, o = {}) {
  const drive = o.drive;
  env(W, { fog: 0x4a4656, near: 4, far: 34, ambient: [0.5, 0.5, 0.56], dir: [0.2, 0.2, 0.24] });
  W.surface = "street";
  const road = W.ground(0, 40, 7, 120, TEX.road(), { scale: 6, scroll: drive ? [0, -0.9] : [0, 0] });
  W.ground(-8, 40, 9, 120, TEX.grass(), { scale: 3, scroll: drive ? [0, -0.6] : [0, 0] });
  W.ground(8, 40, 9, 120, TEX.grass(), { scale: 3, scroll: drive ? [0, -0.6] : [0, 0] });
  // bare trees that pass by
  const bark = M({ map: TEX.bark() });
  const trees = [];
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group();
    const h = 5 + (i % 3);
    const t = new THREE.Mesh(boxGeo(0.3, h, 0.3), bark); t.position.y = h / 2; g.add(t);
    for (let b = 0; b < 3; b++) { const br = new THREE.Mesh(boxGeo(0.1, 2, 0.1), bark); br.position.set(0, h - 1 - b * 0.8, 0); br.rotation.z = (b % 2 ? 0.7 : -0.7); g.add(br); }
    g.position.set((i % 2 ? 1 : -1) * (5 + (i % 4)), 0, i * 8);
    W.add(g); trees.push(g);
  }
  // the one leaning tree that is always ahead (and in the mirror)
  const lone = new THREE.Group();
  const lt = new THREE.Mesh(boxGeo(0.5, 8, 0.5), bark); lt.position.y = 4; lt.rotation.z = -0.35; lone.add(lt);
  for (let b = 0; b < 4; b++) { const br = new THREE.Mesh(boxGeo(0.14, 3, 0.14), bark); br.position.set(-1 - b * 0.4, 6.5 - b * 0.5, 0); br.rotation.z = -1.1 + b * 0.3; lone.add(br); }
  lone.position.set(2.6, 0, 34);
  W.add(lone);
  G._loneTree = lone;
  if (drive) W.every((dt) => trees.forEach((g) => { g.position.z -= dt * 14; if (g.position.z < -6) g.position.z += 112; }));
  // the cabin around the driver's eye at (−0.4, 1.15, 0)
  const dark = M({ color: 0x141418 }), dash = M({ map: TEX.cloth([30, 30, 34], "dash") });
  W.mesh(boxGeo(1.8, 0.35, 0.6), dash, 0, 0.78, 0.75);
  W.mesh(new THREE.TorusGeometry(0.19, 0.03, 4, 12), dark, -0.4, 0.92, 0.5).rotation.x = 0.4;
  for (const x of [-0.95, 0.95]) W.mesh(boxGeo(0.08, 0.9, 0.08), dark, x, 1.35, 0.95).rotation.z = x > 0 ? -0.35 : 0.35;
  W.mesh(boxGeo(1.9, 0.08, 1.4), dark, 0, 1.78, 0.2);
  W.mesh(boxGeo(0.3, 0.1, 0.02), M({ color: 0x404850, emissive: 0.1 }), 0, 1.62, 0.85);
  for (const x of [-1.0, 1.0]) W.mesh(boxGeo(0.06, 0.6, 1.4), dark, x, 1.35, 0.1);
  W.mesh(boxGeo(1.9, 0.6, 0.1), dark, 0, 0.6, -0.9);
  // dashboard gauges + radio
  W.glow(-0.4, 0.92, 0.48, 0.25, 0xffa040);
  G._radio = W.mesh(boxGeo(0.12, 0.03, 0.01), M({ color: 0x408a74, unlit: true }), 0.12, 0.88, 0.62);
  // the paper map on the passenger window
  G._map = W.mesh(new THREE.PlaneGeometry(0.5, 0.36), M({ map: TEX.cloth([200, 190, 160], "papermap") }), 0.96, 1.25, 0.5, -Math.PI / 2);
  // city lights on the horizon, revealed when the map lines up
  const lights = [];
  for (let i = 0; i < 26; i++) { const g = W.glow(-14 + i * 1.1, 1.2 + (i % 3) * 0.4, 60, 0.8, 0xffd080); g.visible = false; lights.push(g); }
  G._cityLights = lights;
  spot(W, "eye", -0.4, 0, 0);
  return { start: [-0.4, 0, 0] };
}

// ---- the park near Target: sidewalk, fence, bench, the shop glass
export function buildPark(W, G) {
  env(W, { fog: 0x2a2434, near: 8, far: 34, ambient: [0.38, 0.34, 0.44], dir: [0.12, 0.1, 0.14] });
  W.surface = "street";
  W.ground(0, 9, 8, 32, TEX.sidewalk(), { scale: 1.5 });
  W.ground(8, 9, 8, 32, TEX.road(), { scale: 5 });
  W.ground(-8, 9, 8, 32, TEX.grass(), { scale: 3 });
  W.mesh(boxGeo(0.2, 0.12, 32, 1), M({ map: TEX.concrete() }), 4, 0.06, 9);
  // iron fence on the park side, trees behind it
  for (let z = -6; z < 24; z += 1.5) W.mesh(boxGeo(0.05, 1.1, 1.5), M({ color: 0x141416 }), -3.6, 0.55, z + 0.75);
  W.collider(-3.7, -7, -3.5, 25);
  for (let z = -4; z < 24; z += 6) W.tree(-6, z, 1.1, TEX.leaves([40, 50, 36], "parkleaves"));
  W.bench(-2.8, 6, Math.PI / 2);
  lampPost(W, -3.1, 2, { side: 1, range: 9 });
  lampPost(W, -3.1, 16, { side: 1, range: 9 });
  // across the street: a storefront with red glass (fictional lettering)
  W.building(15, 10, 6, 14, 8, TEX.facade([110, 80, 70], 0.3, 21));
  W.mesh(new THREE.PlaneGeometry(10, 2.6), M({ map: TEX.page("redglass"), color: 0xffffff, opacity: 0.85, emissive: 0.35 }), 11.95, 1.5, 10, -Math.PI / 2);
  W.sign(11.94, 3.3, 10, "MARKET", -Math.PI / 2, { w: 3.4, h: 0.7, bg: "#b01810", fg: "#fff0e0", tw: 64, th: 14, size: 10, unlit: true });
  W.light(11, 1.6, 10, 0xff3020, 9);
  // the cart and the crack it keeps rolling over
  const cart = new THREE.Group();
  const wire = M({ color: 0x9a9aa0 });
  const basket = new THREE.Mesh(boxGeo(0.55, 0.45, 0.8), M({ color: 0x9a9aa0, opacity: 0.6 })); basket.position.y = 0.75; cart.add(basket);
  for (const sx of [-0.22, 0.22]) for (const sz of [-0.32, 0.32]) { const w = new THREE.Mesh(boxGeo(0.05, 0.5, 0.05), wire); w.position.set(sx, 0.28, sz); cart.add(w); }
  cart.position.set(2.8, 0, 4);
  W.add(cart);
  G._cart = cart;
  W.mesh(boxGeo(1.6, 0.012, 0.05), M({ color: 0x0a0a0a }), 2.8, 0.006, 6);
  W.ground(12.6, 9, 1.4, 32, TEX.sidewalk(), { scale: 1.5 });
  passersby(W, G, [[12.4, -6, 24, 0.4]]);
  decal(W, "missing", -3.54, 1.15, 3.6, Math.PI / 2, 0.5);
  decal(W, "missing", -3.54, 1.15, 13.2, Math.PI / 2, 0.5);
  decal(W, "st404", 3.9, 2.6, -2.5, -Math.PI / 2, 0.8);
  W.bounds = { x0: -3.4, z0: -5, x1: 4.2, z1: 22 };
  spot(W, "start", 2.5, -3.5, 0);
  spot(W, "her", -1.6, 6.4, Math.PI / 2);
  spot(W, "glass", 11.6, 10, -Math.PI / 2);
  spot(W, "cart", 2.8, 4);
  spot(W, "away", 2.5, 18);
  return { start: [2.5, -3.5, 0], cam: { yaw: -0.25, pitch: 0.3, dist: 5.6, height: 1.35 } };
}

// ---- the Brooklyn waterfront: promenade, railing, skyline, payphone, kiosk
export function buildWaterfront(W, G, o = {}) {
  const sunset = o.sunset;
  env(W, sunset ? { fog: 0xd09068, near: 18, far: 80, ambient: [0.5, 0.4, 0.36], dir: [0.8, 0.5, 0.3], dirVec: [0.2, -0.35, 1] }
    : { fog: 0x2a3050, near: 14, far: 70, ambient: [0.36, 0.38, 0.56], dir: [0.18, 0.2, 0.32], dirVec: [0.2, -0.5, 1] });
  W.add(new THREE.Mesh(new THREE.SphereGeometry(90, 12, 8), M({ map: sunset ? TEX.sky("#3a3a6a", "#e08a5a", "#f8c890", "sunset") : TEX.sky("#141a3a", "#3a4a7a", "#7a7aa0", "bluehour"), unlit: true, noFog: true, side: THREE.BackSide })));
  if (sunset) { const sun = W.glow(0, 9, 85, 18, 0xffb070); sun.material.uniforms.uNoFog.value = 1; }
  W.surface = "wood";
  W.ground(0, 4, 50, 14, TEX.wood([90, 80, 74], "boards"), { scale: 1.2 });
  W.ground(0, -8, 50, 10, TEX.road(), { scale: 6 });
  W.ground(0, -15, 50, 4, TEX.sidewalk(), { scale: 1.5 });
  const water = W.ground(0, 50, 160, 80, TEX.water(sunset ? [60, 70, 100] : [20, 30, 60], "riverwater"), { y: -0.8, wave: 1, scroll: [0, 0.04] });
  water.material.uniforms.uEmissive.value = 0.15;
  W.railing(-25, 11, 25);
  skyline(W, sunset ? "sunset" : "night", { r: 84, y: -1.2, h: 30, rep: 3 });
  W.bounds = { x0: -24, z0: -2.6, x1: 24, z1: 10.8 };
  // skyline + a bridge across the river
  for (let i = 0; i < 26; i++) {
    const h = 6 + ((i * 37) % 23), w = 3 + (i % 4);
    W.mesh(boxGeo(w, h, 3, 3, 3), M({ map: TEX.facade([46, 40, 56], 0.5, 90 + i), color: 0x9a8a9a, noFog: true }), -60 + i * 4.8, h / 2 - 0.8, 70 + (i % 3) * 4);
  }
  const steel = M({ color: 0x2a2a34, noFog: true });
  W.mesh(boxGeo(80, 0.6, 1.2), steel, -30, 7, 40);
  for (const x of [-46, -14]) { W.mesh(boxGeo(1.2, 22, 1.2), steel, x, 10, 40); for (let k = 0; k < 6; k++) W.mesh(boxGeo(0.1, 0.1, 1), M({ color: 0xffd080, unlit: true, noFog: true }), x - 15 + k * 6, 7.5, 40); }
  for (let x = -22; x <= 22; x += 11) W.lamp(x, 10.2, { side: -1, color: 0xffd8a0, range: 6 });
  W.bench(-6, 9.4, Math.PI); W.bench(14, 9.4, Math.PI);
  // the amber payphone beside the shuttered kiosk
  const pp = W.payphone(4.6, 8.6, Math.PI);
  W.box(4.6, 1.2, 8.75, 0.7, 1.1, 0.5, M({ color: 0xc89030, emissive: 0.25 }), { solid: false });
  W.light(4.6, 2.2, 8.2, 0xffc050, 6);
  W.glow(4.6, 2.0, 8.4, 1.2, 0xffc050);
  W.box(7.4, 0, 8.2, 3, 2.8, 2.4, M({ map: TEX.metal(), color: 0x8a8070 }));
  W.mesh(new THREE.PlaneGeometry(2.6, 2.2), M({ map: TEX.page("shutter", TEX.metal), color: 0xb0aaa0 }), 7.4, 1.2, 6.98, Math.PI);
  W.mesh(boxGeo(3.4, 0.2, 2.8), M({ map: TEX.cloth([170, 60, 50], "awning") }), 7.4, 2.9, 7.9);
  // places from ordinary days across the road
  W.car(-14, -8, Math.PI / 2, [70, 66, 74]);
  W.building(16, -19, 10, 4, 5, TEX.facade([140, 110, 80], 0.8, 3));
  W.sign(16, 3.6, -16.9, "DELI · GROCERY", 0, { w: 4, h: 0.6, bg: "#1a4a2a", fg: "#f0f0d0", tw: 96, th: 14, size: 9, unlit: true });
  W.building(-4, -19, 10, 4, 5, TEX.facade([120, 80, 70], 0.7, 5));
  W.building(-22, -19, 10, 4, 7, TEX.facade([100, 90, 80], 0.3, 6));
  passersby(W, G, [[-14.6, 24, -24, 0.2, "x"], [-15.4, -24, 24, 0.7, "x"]]);
  spot(W, "start", -16, 6, Math.PI / 2);
  spot(W, "him", -15.2, 7.2, Math.PI / 2);
  spot(W, "far", 16, 9, Math.PI / 2);
  spot(W, "bench", -6, 8.9, Math.PI);
  spot(W, "phone", 4.6, 7.9, 0);
  spot(W, "pastPhone", 1, 7.6, Math.PI / 2);
  spot(W, "kiosk", 8.8, 7.2);
  return { start: [-16, 6, Math.PI / 2], cam: { yaw: 0.85, pitch: 0.24, dist: 6.4, height: 1.3, fov: 54 } };
}

// ---- the Unread Room: two chairs, two names, one phone
export function buildUnread(W, G) {
  env(W, { fog: 0x14100a, near: 5, far: 16, ambient: [0.44, 0.38, 0.28], dir: [0.06, 0.05, 0.04] });
  W.surface = "tile";
  W.room(-2.4, -2.4, 2.4, 2.4, 2.7, { floor: TEX.tile("#5a5a50", "#2a2a26", "checker"), wall: TEX.wallpaper([110, 100, 76], "unreadwp") });
  W.table(0, 0.6, { w: 0.7, d: 0.6, tint: [80, 56, 40] });
  W.box(0, 0.79, 0.6, 0.28, 0.12, 0.22, M({ color: 0x141414 }), { solid: false });
  W.mesh(boxGeo(0.26, 0.05, 0.06), M({ color: 0x0a0a0a }), 0, 0.9, 0.6);
  for (const [x, ry] of [[-1.3, Math.PI / 2], [1.3, -Math.PI / 2]]) {
    W.chair(x, 0, ry);
    W.sign(x + (x < 0 ? -0.22 : 0.22), 1.02, 0, "ARGJILA", ry + Math.PI, { w: 0.42, h: 0.1, bg: "#e8e4d8", fg: "#1a1a1a", tw: 48, th: 10, size: 7 });
  }
  pendant(W, 0, 2.3, 0, 0xffd8a0, 6);
  W.door(0, -2.35, 0, { tint: "#3a2a1a" });
  spot(W, "start", 0, -1.8, 0);
  spot(W, "chairA", -1.3, 0, Math.PI / 2);
  spot(W, "chairF", 1.3, 0, -Math.PI / 2);
  spot(W, "phone", 0, 0.1, 0);
  return { start: [0, -1.8, 0], cam: { yaw: 0, height: 1 }, camZones: [{ x0: -3, z0: -3, x1: 3, z1: 3, cam: { fixed: [-2.1, 2.4, 2.1], height: 0.7 } }] };
}

// ---- the corridor of telephone cords (green, fluorescent)
export function buildCords(W, G) {
  env(W, { fog: 0x0a160c, near: 6, far: 26, ambient: [0.24, 0.4, 0.28], dir: [0.05, 0.08, 0.06] });
  W.surface = "tile";
  const L = 32;
  W.ground(0, L / 2, 3, L, TEX.tile("#5a7a5a", "#3a5a40", "cordfloor"), { scale: 1 });
  W.ceiling(0, L / 2, 3, L, 2.8, TEX.concrete([50, 70, 54], "cordceil"));
  for (const s of [-1, 1]) {
    W.wall(s * 1.5, L / 2, L, 2.8, s > 0 ? -Math.PI / 2 : Math.PI / 2, TEX.tile("#7a9a7a", "#5a7a5a", "cordwall"));
    W.mesh(boxGeo(0.03, 1.1, L), M({ map: TEX.tile("#2a4a30", "#1a3a24", "cordlow") }), s * 1.48, 0.55, L / 2);
  }
  W.wall(0, 0, 3, 2.8, 0, TEX.tile("#7a9a7a", "#5a7a5a", "cordwall"));
  W.wall(0, L, 3, 2.8, Math.PI, TEX.tile("#7a9a7a", "#5a7a5a", "cordwall"));
  W.bounds = { x0: -1.35, z0: 0.3, x1: 1.35, z1: L - 0.3 };
  for (let i = 0; i < 9; i++) { const s = i % 2 ? 1 : -1; W.door(s * 1.47, 3 + i * 3.3, s > 0 ? -Math.PI / 2 : Math.PI / 2, { tint: "#2a2018", solid: false }); }
  // fluorescent tubes
  for (let z = 3; z < L; z += 5) {
    W.mesh(boxGeo(0.3, 0.06, 1.2), M({ color: 0xc8ffd8, unlit: true }), 0, 2.74, z);
    W.light(0, 2.4, z, 0xb0ffc8, 7, { flicker: z === 18 ? 0.35 : 0.04 });
  }
  // cords everywhere: sagging from the ceiling, wall to wall, coiled on the floor
  for (let z = 1; z < L; z += 1.3) {
    cord(W, -1.45, 2.6, z, 1.45, 2.5, z + 0.6, 0.5 + (z % 3) * 0.25, 8);
    if (z % 2.6 < 1.3) cord(W, -1.45, 2.2, z, -1.45, 0.05, z + 1.2, 0.2, 5);
    if (z % 3.9 < 1.3) cord(W, 1.45, 2.4, z + 0.4, 0.6, 0.02, z + 1.6, 0.1, 5);
  }
  // wall boxes (junctions)
  for (const z of [6, 13, 20]) for (const s of [-1, 1]) W.box(s * 1.38, 1.2, z, 0.16, 0.5, 0.4, M({ color: 0x2a2a26 }), { solid: false });
  spot(W, "start", 0, 1.2, 0);
  spot(W, "j1", 0, 6, 0); spot(W, "j2", 0, 13, 0); spot(W, "j3", 0, 20, 0);
  spot(W, "far", 0, 29, Math.PI);
  spot(W, "side", -0.9, 9, 0);
  return { start: [0, 1.2, 0], cam: { yaw: 0, pitch: 0.24, dist: 3.4, height: 1.45, fov: 62 } };
}

// ---- the Clock Tower: floating platform before a giant clock face
export function buildTower(W, G) {
  env(W, { fog: 0x3a3450, near: 10, far: 60, ambient: [0.42, 0.38, 0.48], dir: [0.2, 0.18, 0.22] });
  W.surface = "street";
  const tiles = [TEX.asphalt(), TEX.carpet(), TEX.tile(), TEX.wood(), TEX.sidewalk()];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) W.ground(-6 + i * 4 + 2, -6 + j * 4 + 2, 4, 4, tiles[(i + j * 2) % tiles.length], { scale: 1.5 });
  W.mesh(boxGeo(16.2, 3, 16.2), M({ map: TEX.brick([70, 56, 50], "towerbrick") }), 0, -1.52, 0);
  for (let x = -8; x <= 8; x += 0.6) for (const z of [-8, 8]) W.mesh(boxGeo(0.04, 1, 0.04), M({ color: 0x18161a }), x, 0.5, z);
  W.bounds = { x0: -7.6, z0: -7.6, x1: 7.6, z1: 7.6 };
  skyline(W, "storm", { r: 80, y: -26, h: 64, rep: 3 });
  // the great clock
  const face = W.mesh(new THREE.CircleGeometry(9, 24), M({ map: TEX.clockFace("4:04"), emissive: 0.25 }), 0, 9, 26, Math.PI);
  W.mesh(new THREE.TorusGeometry(9.2, 0.5, 4, 24), M({ color: 0x8a6a30 }), 0, 9, 26);
  G._clockFace = face;
  // the paired doors: a car door and a front door, standing alone
  const carDoor = W.mesh(boxGeo(1.1, 1.1, 0.08), M({ map: TEX.cloth([70, 66, 74], "car70,66,74") }), -3, 0.75, 5);
  W.door(3, 5, 0, { tint: "#5a3018", solid: false });
  G._towerDoors = carDoor;
  // fragments of the city floating in the fog
  W.mesh(boxGeo(5, 0.3, 3), M({ map: TEX.road() }), -14, 6, 10).rotation.z = 0.3;
  W.mesh(boxGeo(3, 4, 3), M({ map: TEX.facade([90, 70, 60], 0.5, 41) }), 13, 8, 6).rotation.y = 0.6;
  W.mesh(boxGeo(3, 0.1, 2), M({ map: TEX.carpet() }), -9, 11, -4).rotation.x = 0.5;
  for (let i = 0; i < 10; i++) W.mesh(boxGeo(1.4, 0.2, 0.5), M({ map: TEX.concrete([80, 76, 70], "towerstep") }), 9 + i * 0.4, -2 + i * 0.6, -8 + i * 1.1);
  W.box(-7, 0, -1, 1.6, 2.4, 1.4, M({ map: TEX.metal(), color: 0x6a6460 }));
  W.sign(-6.18, 1.8, -1, "ELEVATOR", Math.PI / 2, { w: 1.2, h: 0.25, bg: "#1a1410", fg: "#e8c890", tw: 48, th: 10, size: 7, unlit: true });
  for (const [x, z] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) lampPost(W, x, z, { side: 1, h: 3.2, range: 8 });
  W.light(0, 8, 18, 0xffc080, 26);
  spot(W, "start", 0, -5, 0);
  spot(W, "elevator", -5.9, -1, -Math.PI / 2);
  spot(W, "her", 1.4, 3.4, Math.PI);
  spot(W, "keeper", 0, 18, Math.PI);
  spot(W, "carDoor", -3, 4.2, 0);
  spot(W, "frontDoor", 3, 4.2, 0);
  return { start: [0, -5, 0], cam: { yaw: 0, pitch: 0.22, dist: 6.2, height: 1.5, fov: 58 } };
}

// ---- the collapse: a corridor through the places they learned
export const ESCAPE_SEGS = [
  { z0: 0, z1: 24, name: "THE FIRST MEETING", floor: () => TEX.sidewalk(), wall: () => TEX.facade([140, 110, 90], 0.3, 31) },
  { z0: 24, z1: 48, name: "THE BATHHOUSE", floor: () => TEX.tile("#d8ccb0", "#b0a488", "bdeck"), wall: () => TEX.tile("#d8ccb0", "#a89c84", "bwall") },
  { z0: 48, z1: 72, name: "THE HOUSE OF ALMOST", floor: () => TEX.wood([80, 56, 40], "hfloor"), wall: () => TEX.wallpaper([90, 70, 70], "hwp") },
  { z0: 72, z1: 96, name: "THE WATERFRONT", floor: () => TEX.wood([90, 80, 74], "boards"), wall: () => TEX.facade([46, 40, 56], 0.4, 90) },
  { z0: 96, z1: 120, name: "THE CORDS", floor: () => TEX.tile("#5a7a5a", "#3a5a40", "cordfloor"), wall: () => TEX.tile("#7a9a7a", "#5a7a5a", "cordwall") },
  { z0: 120, z1: 156, name: "OCEAN PARKWAY", floor: () => TEX.road(), wall: () => TEX.facade([92, 80, 72], 0.25, 11) },
];
export const ESCAPE_FORKS = [
  { z: 36, goodLeft: true }, { z: 60, goodLeft: false }, { z: 84, goodLeft: true }, { z: 108, goodLeft: false },
];
export function buildEscape(W, G) {
  env(W, { fog: 0x0c0a0e, near: 6, far: 30, ambient: [0.3, 0.28, 0.3], dir: [0.12, 0.1, 0.1] });
  for (const s of ESCAPE_SEGS) {
    const cz = (s.z0 + s.z1) / 2, d = s.z1 - s.z0;
    W.ground(0, cz, 10, d, s.floor(), { scale: 2 });
    W.wall(-5, cz, d, 4, Math.PI / 2, s.wall(), { su: 4, sv: 4 });
    W.wall(5, cz, d, 4, -Math.PI / 2, s.wall(), { su: 4, sv: 4 });
    W.sign(-4.95, 3, s.z0 + 3, s.name, Math.PI / 2, { w: 3, h: 0.4, bg: "#101010", fg: "#e8d8b0", tw: 128, th: 16, size: 8, unlit: true });
    for (let z = s.z0 + 4; z < s.z1; z += 8) W.light(0, 3.5, z, 0xffd8b0, 9, { flicker: 0.12 });
  }
  W.collider(-6, 0, -5, 156); W.collider(5, 0, 6, 156);
  W.wall(0, 0, 10, 4, 0, TEX.concrete());
  W.bounds = { x0: -5, z0: 0, x1: 5, z1: 156 };
  // forks: a divider and two gates — warm light for the true one, cold for the false
  G._forks = ESCAPE_FORKS.map((f) => {
    W.box(0, 0, f.z - 1, 0.6, 4, 7, M({ map: TEX.concrete([60, 56, 60], "divider") }));
    const goodX = f.goodLeft ? 2.6 : -2.6, badX = -goodX;
    W.light(goodX, 2.2, f.z - 3, 0xffb060, 7);
    W.glow(goodX, 2.4, f.z - 4.4, 1.6, 0xffb060);
    W.light(badX, 2.2, f.z - 3, 0x5090ff, 7);
    W.glow(badX, 2.4, f.z - 4.4, 1.6, 0x5090ff);
    return { ...f, goodX, badX };
  });
  for (let x = -4; x <= 4; x += 1.2) W.mesh(boxGeo(0.6, 0.01, 2.2), M({ color: 0xc8c4b8 }), x, 0.02, 150);
  W.lamp(-4.4, 148, { side: 1, color: 0xfff0d0, range: 12 });
  W.lamp(4.4, 152, { side: -1, color: 0xfff0d0, range: 12 });
  const dark = W.mesh(boxGeo(10.4, 8, 0.6), M({ color: 0x000000, noFog: true }), 0, 4, -3);
  G._dark = dark;
  return { start: [0, 3, 0], cam: { yaw: 0, pitch: 0.36, dist: 6.2, height: 1.2 } };
}
