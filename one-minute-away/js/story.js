// ============================================================
// Shared helpers for the chapter scripts.
// ============================================================
import { THREE, U, TEX } from "./ps1.js";
import { memory } from "./memories.js";
import { isWatched } from "./world.js";

// dialogue shorthands
export const R = (t, o) => ["rufki", t, o];
export const A = (t, o) => ["argjila", t, o];
export const N = (t, o) => ["narr", t, o];
// Argjila's own written words (from her letter), read in her voice
export const HER = (t) => ["argjila", t, { slow: true }];

// painted-room position: image px → world point at height y
export const pin = (W, px, py, y = 1) => { const [x, z] = W.backdrop.floor(px, py); return [x, y, z]; };
export const fl = (W, px, py) => W.backdrop.floor(px, py);
// the yaw that faces the painted room's camera
export const toCam = (W, x, z) => { const c = W.backdrop.cam.position; return Math.atan2(c.x - x, c.z - z); };

// a sealed page for one of Argjila's open memories
export function herPage(G, id) {
  const m = memory(id);
  return G.page({ title: m.title, date: m.date, anchor: m.anchor, text: m.text, sealed: !m.text });
}

// change a door's number plate
export function relabel(door, text) {
  const l = door.userData.label;
  if (l) l.material.uniforms.uMap.value = TEX.text(text, { w: 48, h: 12, bg: "#c8b878", fg: "#201810", size: 8, border: false });
}

// colour grading helpers (whole world, painted rooms included)
export function grade(r = 1, g = 1, b = 1, sat = 1) { U.uTint.value.setRGB(r, g, b); U.uSat.value = sat; }
export function addTint(r = 0, g = 0, b = 0) { U.uAdd.value.setRGB(r, g, b); }

// the clock running backward: glitch + reversed tick + blue digits
export async function clockBack(G, t) {
  G.audio.reverseTick();
  G.glitch(0.8);
  G.clock(t, "back");
  G.caption("The clock ticks backward");
  await G.wait(0.6);
  G.glitch(0);
}

// a simple Brooklyn map with two dots a minute apart on Ocean Parkway
export function minuteMap(label = "ONE MINUTE") {
  const c = document.createElement("canvas");
  c.width = 160; c.height = 120;
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.fillStyle = "#1a2024"; g.fillRect(0, 0, 160, 120);
  g.strokeStyle = "#2c363a";
  for (let x = 0; x < 160; x += 10) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5 - 18, 120); g.stroke(); }
  for (let y = 0; y < 120; y += 9) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(160, y + 0.5); g.stroke(); }
  // Ocean Parkway: the long malled boulevard
  g.strokeStyle = "#5fb3a4"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(92, 0); g.lineTo(70, 120); g.stroke();
  g.strokeStyle = "#2e5a50"; g.lineWidth = 1;
  g.beginPath(); g.moveTo(92, 0); g.lineTo(70, 120); g.stroke();
  // the water at the bottom
  g.fillStyle = "#23344a"; g.fillRect(0, 108, 160, 12);
  // two dots
  const dot = (x, y, col) => { g.fillStyle = "#000"; g.fillRect(x - 3, y - 3, 7, 7); g.fillStyle = col; g.fillRect(x - 2, y - 2, 5, 5); };
  dot(85, 44, "#e6b28a");
  dot(79, 66, "#7fb8ff");
  g.fillStyle = "#d5a467"; g.font = "8px monospace";
  g.fillText(label, 94, 58);
  g.fillStyle = "#8d8a80"; g.fillText("OCEAN PKWY", 4, 10);
  return c;
}

// The Unmet / watcher AI: moves only when unseen. Returns a stop() fn.
export function stalker(G, actor, { speed = 4.6, cone = 0.62, onCatch, lights } = {}) {
  const W = G.world, P = G.player;
  let blackout = 0, nextBlack = 3.5, caught = false, stopped = false;
  const fn = W.every((dt) => {
    if (stopped || !G.canMove()) return;
    nextBlack -= dt;
    if (lights && nextBlack <= 0 && blackout <= 0) { blackout = 0.6 + Math.random() * 0.3; nextBlack = 2.2 + Math.random() * 1.6; G.audio.noise(0.1, 4000, 2, 0.1); G.audio.heartbeat(); }
    const dark = blackout > 0;
    if (dark) blackout -= dt;
    if (lights) lights.forEach((l) => (l.on = !dark));
    const p = actor.root.position;
    const watched = isWatched(P, p, cone) && !dark;
    const dx = P.pos.x - p.x, dz = P.pos.z - p.z, d = Math.hypot(dx, dz);
    if (!watched && d > 0.5) {
      const s = (dark ? speed * 0.7 : speed) * dt;
      p.x += (dx / d) * s; p.z += (dz / d) * s;
      actor.faceToward?.(P.pos.x, P.pos.z);
    }
    G.audio.staticLevel(Math.max(0, 1 - d / 9));
    if (d < 0.9 && !caught) { caught = true; Promise.resolve(onCatch?.()).then(() => { caught = false; }); }
  });
  return () => { stopped = true; G.audio.staticLevel(0); if (lights) lights.forEach((l) => (l.on = true)); W.updaters = W.updaters.filter((f) => f !== fn); };
}

// wait until the player stands inside a circle (world coords)
export function reach(G, x, z, r = 1.2) {
  return G.guard(new Promise((res) => G.world.trigger({ x, z, r, enter: res })));
}
// resolves when the player walks into a circle, never just because they spawned inside it
export function zone(G, x, z, r = 1.1) {
  return G.guard(new Promise((res) => {
    const P = G.player;
    let armed = Math.hypot(P.pos.x - x, P.pos.z - z) > r + 0.2;
    const W = G.world, zz = { x, z, r };
    (W.zones ||= []).push(zz);
    const fn = W.every(() => {
      if (!G.canMove()) return;
      const d = Math.hypot(P.pos.x - x, P.pos.z - z);
      if (!armed) { if (d > r + 0.2) armed = true; return; }
      if (d < r) { W.updaters = W.updaters.filter((f) => f !== fn); W.zones = W.zones.filter((q) => q !== zz); res(); }
    });
  }));
}
export function vec(x, y, z) { return new THREE.Vector3(x, y, z); }
