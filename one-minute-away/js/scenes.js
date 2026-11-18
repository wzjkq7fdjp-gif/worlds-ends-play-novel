// ============================================================
// Places. Painted rooms (pre-rendered backdrops with solved
// cameras and floor polygons) and the 3D streets / interiors
// that connect them.
// ============================================================
import { THREE, U, mat, TEX, boxGeo } from "./ps1.js";
import { Backdrop } from "./backdrop.js";
import { pic, tvScreen } from "./art.js";

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
// Painted rooms. vp = vanishing point (eye level) in the 320px
// frame, h = camera height; walk / block are floor polygons in px.
// lights: [x, y (floor px), height, colour, range]
// ------------------------------------------------------------
export const PAINTED = {
  ocean: {
    vp: [215, 168], h: 1.6, fov: 60, pan: "auto",
    walk: [[118, 320], [320, 320], [320, 262], [258, 214], [228, 186], [214, 171], [204, 171], [168, 200], [124, 246]],
    env: { fog: 0x4a4258, near: 9, far: 34, ambient: [0.5, 0.46, 0.58], dir: [0.18, 0.16, 0.24] },
    lights: [[150, 214, 4, 0xffc890, 9], [262, 230, 3, 0xffd8a0, 6]], surface: "street",
  },
  hallway: {
    vp: [250, 150], h: 1.3, fov: 60, pan: "auto",
    walk: [[168, 320], [320, 320], [320, 268], [270, 186], [240, 186], [202, 250]],
    env: { fog: 0x2a1c10, near: 8, far: 40, ambient: [0.5, 0.38, 0.28], dir: [0.1, 0.08, 0.06] },
    lights: [[252, 240, 2.4, 0xffcf8a, 7], [252, 196, 2.4, 0xffcf8a, 7], [255, 178, 2.4, 0xffcf8a, 7]], surface: "tile",
  },
  bathhouse: {
    vp: [160, 118], h: 1.43, fov: 60, pan: "auto",
    walk: [[0, 320], [210, 320], [45, 213], [78, 171], [320, 166], [320, 151], [85, 154], [55, 161], [0, 176]],
    env: { fog: 0x203038, near: 10, far: 40, ambient: [0.48, 0.52, 0.56], dir: [0.12, 0.14, 0.16] },
    lights: [[150, 168, 3, 0xffe2b0, 9], [40, 260, 3, 0xffd8a0, 6]], surface: "tile",
  },
  dance: {
    vp: [260, 140], h: 1.5, fov: 60, pan: "auto",
    walk: [[0, 320], [320, 320], [320, 211], [128, 211], [60, 201], [0, 207]],
    env: { fog: 0x24180e, near: 9, far: 40, ambient: [0.5, 0.4, 0.3], dir: [0.12, 0.1, 0.08] },
    lights: [[160, 240, 2.6, 0xffcf90, 8], [220, 214, 2.6, 0xffcf90, 6]], surface: "wood",
  },
  waterfront: {
    vp: [160, 152], h: 1.55, fov: 60, pan: "auto",
    walk: [[0, 320], [222, 320], [205, 262], [178, 204], [100, 212], [0, 228]],
    env: { fog: 0x1c2240, near: 10, far: 40, ambient: [0.34, 0.37, 0.58], dir: [0.12, 0.13, 0.2] },
    lights: [[200, 272, 2.2, 0xffd060, 6], [60, 260, 3, 0x8090d0, 6]], surface: "wood",
  },
  park: {
    vp: [160, 158], h: 1.5, fov: 60, pan: "auto",
    walk: [[0, 320], [320, 320], [320, 222], [238, 200], [185, 185], [150, 182], [120, 198], [60, 230], [0, 236]],
    block: [[[8, 244], [128, 216], [142, 250], [64, 288], [8, 282]], [[232, 262], [300, 250], [306, 286], [240, 294]]],
    env: { fog: 0x2a2434, near: 9, far: 38, ambient: [0.4, 0.36, 0.46], dir: [0.12, 0.1, 0.14] },
    lights: [[118, 222, 3.6, 0xffc070, 8], [300, 214, 1.6, 0xff3020, 6]], surface: "street",
  },
  unread: {
    vp: [160, 150], h: 1.0, fov: 60, pan: "auto",
    walk: [[25, 268], [295, 268], [320, 320], [0, 320]],
    block: [[[25, 272], [112, 272], [116, 302], [30, 306]], [[205, 272], [290, 272], [296, 300], [210, 303]], [[130, 264], [196, 264], [196, 290], [130, 290]]],
    env: { fog: 0x1a140c, near: 6, far: 20, ambient: [0.5, 0.44, 0.34], dir: [0.1, 0.08, 0.06] },
    lights: [[160, 285, 1.8, 0xffd8a0, 5]], surface: "tile",
  },
  cords: {
    vp: [165, 150], h: 1.4, fov: 60, pan: "auto",
    walk: [[85, 320], [250, 320], [196, 178], [152, 178]],
    env: { fog: 0x0c1a10, near: 8, far: 40, ambient: [0.26, 0.44, 0.32], dir: [0.06, 0.1, 0.07] },
    lights: [[165, 205, 2.4, 0xb0ffc8, 7], [165, 280, 2.4, 0x80d0a0, 6]], surface: "tile",
  },
  bedroom: {
    vp: [160, 145], h: 1.2, fov: 60, pan: "auto",
    walk: [[0, 248], [100, 226], [160, 232], [125, 320], [0, 320]],
    env: { fog: 0x281e30, near: 6, far: 20, ambient: [0.45, 0.38, 0.5], dir: [0.12, 0.1, 0.12] },
    lights: [[110, 236, 1.2, 0xffc890, 4], [230, 210, 1.5, 0xff9a80, 5]], surface: "wood",
  },
  almost: {
    vp: [160, 150], h: 1.25, fov: 60, pan: "auto",
    walk: [[0, 199], [55, 193], [140, 207], [138, 226], [0, 236]],
    env: { fog: 0x3a3450, near: 6, far: 30, ambient: [0.45, 0.42, 0.56], dir: [0.1, 0.1, 0.14] },
    lights: [[45, 205, 2.2, 0xffc890, 5]], surface: "tile",
  },
  tower: {
    vp: [160, 120], h: 1.4, fov: 60, pan: "auto",
    walk: [[190, 228], [270, 218], [298, 238], [212, 250]],
    env: { fog: 0x3a3448, near: 8, far: 40, ambient: [0.5, 0.48, 0.56], dir: [0.12, 0.12, 0.14] },
    lights: [[240, 232, 2.2, 0xffd090, 5]], surface: "street",
  },
  car: {
    vp: [150, 165], h: 1.2, fov: 60, pan: 40, walk: null,
    env: { fog: 0x1a1a22, near: 6, far: 30, ambient: [0.4, 0.4, 0.45], dir: [0.1, 0.1, 0.12] },
    lights: [], surface: "street",
  },
};

// Build a painted room. Returns the backdrop (also stored on W).
export function paint(W, G, name, o = {}) {
  const P = PAINTED[name];
  const bd = new Backdrop(W, G, { img: name, ...P, ...o });
  W.backdrop = bd;
  env(W, { ...P.env, ...(o.env || {}) });
  W.surface = P.surface;
  for (const [x, y, h, col, r] of P.lights) {
    const [a, b] = bd.floor(x, y);
    W.light(a, h, b, col, r);
  }
  return bd;
}
// px helpers for scripts working in a painted room
export const at = (W, x, y) => W.backdrop.floor(x, y);

// ------------------------------------------------------------
// Title — Ocean Parkway in fog, the sedan, the window.
// ------------------------------------------------------------
export function buildTitle(W, G) {
  const bd = paint(W, G, "ocean", { pan: 30 });
  G.player.ch.setVisible(false);
  return {};
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
    W.sign(-7.95, 2.0, z + 2.4, "", Math.PI / 2, { w: 1.4, h: 1.0, bg: i === 3 ? "#e8c890" : "#2a2a30", tw: 8, th: 8, size: 6, unlit: true });
    W.tree(-4.4, z + 4, 0.8);
  }
  W.lamp(-4.4, 12, { side: -1 }); W.lamp(-4.4, 30, { side: -1 });
  G._houses = houses;
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
  return { start: [0, 0, 0] };
}
