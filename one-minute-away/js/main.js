// ============================================================
// ONE MINUTE AWAY — The Road Between Us
// Boot, asset loading, game loop, POV switching, the one shared
// save, menus, loading screens and chapter flow.
// ============================================================
import { THREE, U } from "./ps1.js";
import { Audio } from "./audio.js";
import { Music } from "./music.js";
import { Voice } from "./voice.js";
import { Input } from "./input.js";
import { UI } from "./ui.js";
import { World, Player, CameraRig, angDiff } from "./world.js";
import { loadAssets, bgURL } from "./assets.js";
import { CHAPTERS, ENDINGS, buildTitle, decideEnding } from "./chapters.js";
import { MEMORIES } from "./memories.js";

const SAVE_KEY = "oma_save_v3";
const META_KEY = "oma_meta_v3";
const OPT_KEY = "oma_opts_v3";
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const camera = new THREE.PerspectiveCamera(55, 4 / 3, 0.05, 160);

const G = {
  THREE, U, renderer, camera,
  input: new Input(),
  audio: new Audio(),
  rig: new CameraRig(camera),
  world: null,
  player: null,
  ui: null,
  lock: 0,
  paused: false,
  mode: "boot",
  time: 0,
  timers: [],
  signals: {},
  state: null,
  meta: store.get(META_KEY, { unlocked: 0, endings: [], cleared: false }),
  opts: { tank: false, crt: true, jitter: true, dither: true, volume: 8, music: 7, voice: true, voiceVol: 10, captions: true, autoText: false, ...store.get(OPT_KEY, {}) },
  memories: MEMORIES,
  CHAPTERS,
};
G.music = new Music(G.audio);
G.voice = new Voice(G);
window.OMA = G;
G.debug = {};

// ------------------------------------------------------------
// Layout: 4:3 box, --u = one logical pixel
// ------------------------------------------------------------
function layout() {
  renderer.setSize(320, 240, false);
  U.uRes.value.set(320, 240);
  const vw = window.innerWidth, vh = window.innerHeight;
  const touch = document.body.classList.contains("touch");
  const portrait = vh > vw;
  const availH = touch && portrait ? vh * 0.62 : vh;
  const w = Math.min(vw, (availH * 320) / 240);
  const h = (w * 240) / 320;
  const box = document.getElementById("screen");
  box.style.width = w + "px";
  box.style.height = h + "px";
  box.style.top = (touch && portrait ? Math.max(0, (availH - h) / 2) + 8 : (vh - h) / 2) + "px";
  box.style.left = (vw - w) / 2 + "px";
  document.documentElement.style.setProperty("--u", w / 320 + "px");
  document.body.classList.toggle("portrait", portrait);
}
window.addEventListener("resize", layout);
if ("ontouchstart" in window || navigator.maxTouchPoints > 0) document.body.classList.add("touch");
G.input.bindTouch(document.getElementById("touch"));
G.ui = new UI(G);

function applyOpts() {
  U.uSnap.value = G.opts.jitter ? 1 : 0;
  U.uDither.value = G.opts.dither ? 1 : 0;
  document.body.classList.toggle("crt", G.opts.crt);
  G.audio.setVolume(G.opts.volume / 10);
  G.music.setVolume((G.opts.music / 10) * 0.75);
  store.set(OPT_KEY, G.opts);
  layout();
}

// ------------------------------------------------------------
// Script helpers (await-able, game-time aware, abortable)
// ------------------------------------------------------------
let runToken = 0;
const guard = (p) => { const tok = runToken; return p.then((v) => (tok !== runToken ? new Promise(() => {}) : v)); };
G.guard = guard;
G.canMove = () => G.lock === 0 && !G.ui.busy && !G.paused && G.mode === "play";
G.wait = (sec) => guard(new Promise((res) => G.timers.push({ t: sec, res })));
G.signal = (name) => { const s = G.signals[name]; G.signals[name] = true; if (Array.isArray(s)) s.forEach((r) => r()); };
G.until = (name) => guard(new Promise((res) => {
  const s = G.signals[name];
  if (s === true) return res();
  (G.signals[name] = Array.isArray(s) ? s : []).push(res);
}));
G.say = (lines, o) => guard(G.ui.say(lines, o));
G.choose = (p, opts, o) => guard(G.ui.choose(p, opts, o));
G.fade = (to, dur, color) => guard(G.ui.fade(to, dur, color));
G.card = (o) => guard(G.ui.titleCard(o));
G.lines = (l, o) => guard(G.ui.lines(l, o));
G.item = (o) => guard(G.ui.item(o));
G.phone = (o) => guard(G.ui.phone(o));
G.page = (o) => guard(G.ui.page(o));
G.handoff = (n, s) => guard(G.ui.handoff(n, s));
G.caption = (t, d) => G.ui.caption(t, d);
G.clock = (t, cls) => { if (G.state) G.state.clock = t; G.ui.clock(t, cls); };
G.objective = (t) => { if (G.state) G.state.objective = t; G.ui.objective(t); if (t) G.audio.chime(); };
G.cutscene = async (fn) => { G.lock++; G.ui.letterbox(true); try { return await fn(); } finally { G.lock--; if (!G.lock) G.ui.letterbox(false); } };
G.flag = (k, v = true) => { G.state.flags[k] = v; };
G.us = (n = 1) => { G.state.us = (G.state.us || 0) + n; };
G.give = (it) => { if (!G.state.items.find((x) => x.name === it.name)) G.state.items.push(it); G.ui.toast("MEMORY ITEM: " + it.name.toUpperCase()); };
G.repair = (k) => { G.state.repaired[k] = true; G.audio.repair(); G.caption("A clear click. The clock moves forward.", 3); };
G.interactOnce = (o) => guard(new Promise((res) => {
  const it = G.world.interact({ ...o, use: async () => { it.remove(); if (o.use) await o.use(); res(); } });
}));
// pick one of several interactables; resolves with its key
G.interactAny = (list) => guard(new Promise((res) => {
  const its = list.map((o) => G.world.interact({ ...o, use: async () => { its.forEach((i) => i.remove()); if (o.use) await o.use(); res(o.key); } }));
}));
G.walkTo = (ch, x, z, speed = 1.4, o = {}) => guard(new Promise((res) => {
  ch._walking = true;
  const p0 = ch.root.position;
  let left = Math.hypot(x - p0.x, z - p0.z) / speed + 3;
  const fn = (dt) => {
    const p = ch.root.position;
    left -= dt;
    if (left <= 0) { p.x = x; p.z = z; }
    const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.06) {
      ch.update(dt, 0);
      if (!fn.done) { fn.done = true; ch._walking = false; G.world.updaters = G.world.updaters.filter((f) => f !== fn); res(); }
      return;
    }
    const s = Math.min(d, speed * dt);
    p.x += (dx / d) * s;
    p.z += (dz / d) * s;
    p.y = G.world.groundAt(p.x, p.z);
    const want = Math.atan2(dx, dz);
    ch.face(ch.yaw + angDiff(ch.yaw, want) * Math.min(1, dt * 8));
    ch.update(dt, speed, speed > 2.6);
  };
  G.world.every(fn);
}));
G.idle = (ch) => G.world.every((dt) => { if (!ch._walking) ch.update(dt, 0); });
G.tween = (dur, fn) => guard(new Promise((res) => {
  let t = 0;
  const u = (dt) => { t += dt; const k = Math.min(1, t / dur); fn(k); if (k >= 1) { G.world.updaters = G.world.updaters.filter((f) => f !== u); res(); } };
  G.world.every(u);
}));
G.shot = (pos, look, fov) => G.rig.shot(pos, look, true, fov);
G.release = () => G.rig.release(true);
// cinematic close-up on a character (or a world point); zoom(1) returns to the room camera
G.zoom = (k, target, side = 0) => {
  if (!k || k <= 1 || !target) { G.rig.release(); return; }
  const t = target.root ? target.root.position.clone().add(new THREE.Vector3(0, (target.height || 1.7) * 0.8, 0)) : new THREE.Vector3(...target);
  const dir = camera.position.clone().sub(t).setY(0).normalize();
  if (side) dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), side);
  const d = 4.4 / k;
  G.rig.shot([t.x + dir.x * d, t.y + 0.2, t.z + dir.z * d], [t.x, t.y - 0.15, t.z], true, 46);
};
const glEl = document.getElementById("gl");
G.glitch = (v) => glEl.classList.toggle("glitch", v > 0);
G.steam = (v) => (glEl.style.filter = v > 0 ? `blur(${v}px)` : "");
G.spot = (name) => G.world.spots?.[name];
G.spotPos = (name, y = 1) => { const s = G.spot(name); return [s[0], y, s[1]]; };
// switch the controlled character
G.pov = (name, preset) => {
  const p = preset || name.toLowerCase();
  G.player.setAvatar(p);
  if (G.state.pov !== name) G.ui.objective(null);
  G.state.pov = name;
  G.ui.pov(name);
  if (G.world && G.player.ch.root.parent !== G.world.scene) G.world.scene.add(G.player.ch.root);
};
G.npc = (Cls, preset, x, z, yaw = 0) => {
  const c = new Cls(preset);
  c.setPos(x, G.world.groundAt(x, z), z).face(yaw);
  G.world.add(c.root);
  if (c.kind) G.world.actors.push(c);
  else if (c.update) G.idle(c);
  return c;
};
G.flicker = (ch, to = 0, dur = 1.2) => guard(new Promise((res) => {
  let t = 0;
  const fn = (dt) => { t += dt; const k = Math.min(1, t / dur); ch.root.visible = to > 0 ? Math.random() < k : Math.random() > k; if (k >= 1) { ch.root.visible = to > 0; G.world.updaters = G.world.updaters.filter((f) => f !== fn); res(); } };
  G.world.every(fn);
}));
G.flash = async (color = "#f4f0e8", hold = 0.2) => { await G.fade(1, 0.15, color); await G.wait(hold); await G.fade(0, 0.6); };

// Build a scene. builder(W, G, o) may return { start:[x,z,yaw], cam, camZones, backdrop: cfg }
G.load = async (builder, o = {}) => {
  if (G.world) G.world.dispose();
  G.timers = G.timers.filter((t) => t.keep);
  G.signals = {};
  const W = new World(G);
  G.world = W;
  if (!G.player) G.player = new Player(G);
  G.player.faceTarget = null;
  G.player.frozen = false;
  G.player.noRun = false;
  G.player.ghost = false;
  G.player.ch.setVisible(true);
  G.player.ch.pose(null);
  G.rig.release(true);
  G.rig.cfg = { yaw: 0, pitch: 0.32, dist: 6, height: 1.4, fov: 55, lead: 0.6 };
  camera.clearViewOffset();
  camera.aspect = 4 / 3;
  camera.updateProjectionMatrix();
  U.uTint.value.setRGB(1, 1, 1);
  U.uAdd.value.setRGB(0, 0, 0);
  U.uSat.value = 1;
  G.glitch(0); G.steam(0);
  const cfg = (await builder(W, G, o)) || {};
  W.scene.add(G.player.ch.root);
  if (cfg.start) G.placeAt(...cfg.start);
  if (cfg.cam) G.rig.set(cfg.cam, true);
  G.rig.snapNext = true;
  G.rig.yaw = G.rig.cfg.yaw;
  W.camZones = cfg.camZones || [];
  G.audio.staticLevel(0);
  G.audio.setMuffle(false);
  G.input.flush();
  return W;
};
// place the player at world coords or at a named spot of the current map
G.placeAt = (x, z, yaw = 0) => {
  if (typeof x === "string") { const s = G.spot(x); G.player.place(s[0], s[1], z ?? s[2] ?? 0); } else G.player.place(x, z, yaw);
};

G.checkpoint = (quiet) => {
  const s = G.state;
  const ok = store.set(SAVE_KEY, { ch: s.ch, flags: s.flags, items: s.items, repaired: s.repaired, us: s.us });
  G.meta.unlocked = Math.max(G.meta.unlocked, s.ch);
  store.set(META_KEY, G.meta);
  if (ok && !quiet) G.ui.toast("MEMORY CARD: SAVED");
};
G.saveMeta = () => store.set(META_KEY, G.meta);

// ------------------------------------------------------------
// Loading screen (the painted room, a clock, a line of advice)
// ------------------------------------------------------------
const loadEl = document.getElementById("loading");
G.loading = async (ch) => {
  loadEl.querySelector(".lbg").style.backgroundImage = ch.bg ? `url(${bgURL(ch.bg)})` : "none";
  loadEl.querySelector(".lnm").textContent = (ch.date || "").toUpperCase();
  loadEl.querySelector(".ltip").textContent = ch.tip || "";
  loadEl.querySelector(".lcl").textContent = ch.clock || "4:04";
  const bar = loadEl.querySelector(".lbar i");
  bar.style.width = "0";
  loadEl.classList.add("on");
  G.ui.setFade(0);
  for (let i = 1; i <= 10; i++) { await G.wait(0.13 + Math.random() * 0.1); bar.style.width = i * 10 + "%"; }
  await G.wait(0.3);
  G.ui.setFade(1);
  loadEl.classList.remove("on");
};

// ------------------------------------------------------------
// Main loop
// ------------------------------------------------------------
let last = performance.now();
const fwd = new THREE.Vector3();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const I = G.input;
  I.poll();
  if (!G.paused) {
    G.time += dt;
    U.uTime.value = G.time;
    for (const t of [...G.timers]) {
      t.t -= dt;
      if (t.t <= 0) { G.timers.splice(G.timers.indexOf(t), 1); t.res(); }
    }
  }
  G.ui.update(dt, I);
  document.body.classList.toggle("dlgup", G.ui.stack.some((m) => m.el.classList.contains("dlg")));
  const W = G.world;
  if (W && G.player) {
    if (G.mode === "play" && !G.paused) {
      if (!G.ui.busy && G.lock === 0) {
        if (I.pressed("start")) pauseMenu();
        else if (I.pressed("tri")) { G.paused = true; G.ui.routeMap(G.state, G.state.place).then(() => (G.paused = false)); }
      }
      if (!G.paused) {
        G.player.update(dt, I, G.rig.facingYaw ?? G.rig.yaw, G.opts);
        const it = G.canMove() ? W.nearestInteract(G.player.pos, G.player.yaw) : null;
        G.ui.prompt(it ? (it.verb ? it.verb + ": " : "") + it.label : null);
        if (it && I.pressed("x")) G.cutscene(() => it.use());
      } else G.ui.prompt(null);
    }
    if (!G.paused) {
      G.rig.update(dt, G.player, W.camZones);
      camera.getWorldDirection(fwd);
      G.rig.facingYaw = Math.atan2(fwd.x, fwd.z);
      W.update(dt, G.time, camera);
      W.updateLights(G.player.pos, G.time);
    }
    renderer.setClearColor(U.uFogColor.value, 1);
    renderer.render(W.scene, camera);
  } else {
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
  }
}

// ------------------------------------------------------------
// Menus
// ------------------------------------------------------------
async function optionsMenu() {
  const o = G.opts;
  const tog = (k) => () => { o[k] = !o[k]; applyOpts(); };
  const lvl = (k) => (d) => { o[k] = Math.max(0, Math.min(10, o[k] + (d > 0 ? 1 : -1))); applyOpts(); };
  const bar = (v) => "▮".repeat(v) + "▯".repeat(10 - v);
  await G.ui.menu({
    title: "OPTIONS",
    cls: "opts",
    items: [
      { label: "VOICE ACTING", get: () => (o.voice ? "ON" : "OFF"), set: tog("voice"), hint: "Every line of dialogue is spoken." },
      { label: "VOICE VOLUME", get: () => bar(o.voiceVol), set: lvl("voiceVol") },
      { label: "MUSIC", get: () => bar(o.music), set: lvl("music") },
      { label: "MASTER VOLUME", get: () => bar(o.volume), set: lvl("volume") },
      { label: "SOUND CAPTIONS", get: () => (o.captions ? "ON" : "OFF"), set: tog("captions"), hint: "Knocks, clicks and other audio cues are written on screen." },
      { label: "AUTO TEXT", get: () => (o.autoText ? "ON" : "OFF"), set: tog("autoText"), hint: "Dialogue moves on by itself when the voice finishes." },
      { label: "CONTROLS", get: () => (o.tank ? "TANK" : "MODERN"), set: tog("tank"), hint: o.tank ? "Tank: up walks forward, left/right turn." : "Modern: push the stick where you want to go." },
      { label: "VERTEX JITTER", get: () => (o.jitter ? "ON" : "OFF"), set: tog("jitter") },
      { label: "DITHERING", get: () => (o.dither ? "ON" : "OFF"), set: tog("dither") },
      { label: "CRT FILTER", get: () => (o.crt ? "ON" : "OFF"), set: tog("crt") },
      { label: "BACK", value: "back" },
    ],
  });
}

async function pauseMenu() {
  G.paused = true;
  G.audio.blip();
  while (true) {
    const v = await G.ui.menu({
      title: "PAUSED",
      cls: "pause",
      foot: `${G.state.chapterName || ""} · ${G.state.objective || ""}`,
      items: [
        { label: "RESUME", value: "resume" },
        { label: "MEMORY ITEMS", value: "items" },
        { label: "MEMORY ROUTE", value: "route" },
        { label: "OPTIONS", value: "options" },
        { label: "RESTART CHAPTER", value: "restart" },
        { label: "QUIT TO TITLE", value: "title" },
      ],
    });
    if (v === "items") { await G.ui.inventory(G.state); continue; }
    if (v === "route") { await G.ui.routeMap(G.state, G.state.place); continue; }
    if (v === "options") { await optionsMenu(); continue; }
    if (v === "restart") { G.paused = false; restartChapter(); return; }
    if (v === "title") { G.paused = false; toTitle(); return; }
    break;
  }
  G.paused = false;
}

// ------------------------------------------------------------
// Flow: title → chapters → ending
// ------------------------------------------------------------
function freshState(ch = 0) {
  return { ch, flags: {}, items: [], repaired: {}, us: 0, objective: "", clock: "4:04", pov: "Rufki" };
}
class Abort extends Error {}
G.Abort = Abort;
G.alive = (tok) => { if (tok !== runToken) throw new Abort(); };

async function runGame(state) {
  const tok = ++runToken;
  G.token = tok;
  G.state = state;
  G.mode = "play";
  G.lock = 0;
  G.paused = false;
  G.ui.objective(null);
  try {
    for (let i = state.ch; i < CHAPTERS.length; i++) {
      G.alive(tok);
      const C = CHAPTERS[i];
      if (C.optional && !state.flags["go_" + C.id]) continue;
      state.ch = i;
      state.chapterName = C.name;
      if (i > 0) G.checkpoint(true);
      G.voice.stopAll();
      G.ui.objective(null);
      G.ui.pov(null);
      G.ui.clock(null);
      await G.loading(C);
      G.alive(tok);
      if (C.card !== false) await G.card({ kicker: C.kicker || "", title: C.name, sub: C.date || "", pov: C.pov || "" });
      const res = await C.run(G);
      G.alive(tok);
      if (res && res.ending) return finish(res.ending, tok);
      if (res && res.jump != null) { i = res.jump - 1; continue; }
    }
    return finish(decideEnding(G), tok);
  } catch (e) {
    if (!(e instanceof Abort)) { console.error(e); G.ui.toast("ERROR: " + e.message, 8); }
  }
}
G.debug.runGame = (...a) => runGame(...a);
G.debug.freshState = (...a) => freshState(...a);
G.debug.finish = (id) => { runToken++; while (G.ui.stack.length) G.ui.pop(G.ui.stack[0]); document.getElementById("logo").classList.remove("on"); finish(id, runToken); };
async function finish(endingId, tok) {
  G.alive(tok);
  G.ui.objective(null);
  G.ui.prompt(null);
  G.ui.pov(null);
  G.mode = "cutscene";
  if (!G.meta.endings.includes(endingId)) G.meta.endings.push(endingId);
  if (endingId === "always") G.meta.cleared = true;
  G.saveMeta();
  await ENDINGS[endingId](G);
  G.alive(tok);
  await G.fade(1, 1);
  toTitle();
}
function restartChapter() {
  const s = store.get(SAVE_KEY, null);
  runGame(s ? { ...freshState(s.ch), ...s } : freshState(G.state.ch));
}

async function toTitle() {
  runToken++;
  G.mode = "title";
  G.lock = 0;
  G.paused = false;
  G.voice.stopAll();
  while (G.ui.stack.length) G.ui.pop(G.ui.stack[0]);
  G.ui.objective(null);
  G.ui.prompt(null);
  G.ui.clock(null);
  G.ui.pov(null);
  G.ui.letterbox(false);
  await G.load(buildTitle);
  G.audio.ambience({ wind: 0.5, drone: 0.3, note: 49, traffic: 0.2, bright: 240 });
  G.music.play("title", 2);
  G.ui.setFade(1, "#000");
  G.ui.fade(0, 2.5);
  titleMenu();
}

async function titleMenu() {
  const logo = document.getElementById("logo");
  logo.classList.add("on");
  const tok = runToken;
  const save = store.get(SAVE_KEY, null);
  while (true) {
    const items = [
      { label: "NEW GAME", value: "new", hint: G.meta.cleared ? "New Game+: the House of Almost remembers." : "October 24, 2026. 4:04 AM." },
      { label: "CONTINUE", value: "cont", disabled: !save, hint: save ? `Memory card: ${CHAPTERS[save.ch]?.name || ""}` : "No save on the memory card." },
      { label: "CHAPTERS", value: "chap", hint: "Replay any memory you have reached." },
      { label: "HER PAGES", value: "pages", hint: "Argjila's memories, in her words." },
      { label: "EXTRAS", value: "extras", hint: "Endings found." },
      { label: "OPTIONS", value: "opts" },
    ];
    const v = await G.ui.menu({ items, cls: "title", back: false, start: save ? 1 : 0 });
    if (tok !== runToken) return;
    if (v === "opts") { await optionsMenu(); continue; }
    if (v === "extras") { await extras(); continue; }
    if (v === "pages") { await herPages(); continue; }
    let st = null;
    if (v === "new") { st = freshState(0); if (G.meta.cleared) st.flags.ngplus = true; }
    if (v === "cont") st = { ...freshState(save.ch), ...save };
    if (v === "chap") {
      const max = Math.max(G.meta.unlocked, 0);
      const c = await G.ui.menu({
        title: "CHAPTERS",
        cls: "chap",
        items: CHAPTERS.map((ch, i) => ({ label: ch.name, value: i, disabled: i > max, hint: i > max ? "Not yet remembered." : `${ch.date || ""} · ${ch.pov || ""}` })),
      });
      if (c == null) continue;
      st = skipState(c);
    }
    if (!st) continue;
    logo.classList.remove("on");
    G.audio.confirm();
    G.music.play(null, 1.5);
    await G.fade(1, 1.2);
    runGame(st);
    return;
  }
}
// a fair baseline when you jump into the middle of the story
function skipState(c) {
  const st = freshState(c);
  const idx = (id) => CHAPTERS.findIndex((x) => x.id === id);
  if (c > idx("dance")) st.repaired.dance = true;
  if (c > idx("return")) st.repaired.return = true;
  if (c > idx("park")) st.repaired.park = true;
  if (c > idx("bathhouse")) st.flags.receiver = true;
  st.us = Math.min(6, Math.floor(c / 2));
  if (CHAPTERS[c]?.optional) st.flags["go_" + CHAPTERS[c].id] = true;
  return st;
}

async function extras() {
  const E = [
    ["always", "ALWAYS"], ["waited", "THE ONE WHO WAITED"], ["forever", "4:04 FOREVER"],
    ["otherme", "THE OTHER ME"], ["before", "BEFORE WE KNEW"],
  ];
  await G.ui.menu({
    title: "ENDINGS",
    cls: "chap",
    items: [...E.map(([id, n], i) => ({ label: `${i + 1} · ${G.meta.endings.includes(id) ? n : "??????"}`, value: id, disabled: true })), { label: "BACK", value: "back" }],
    start: E.length,
  });
}

async function herPages() {
  while (true) {
    const v = await G.ui.menu({
      title: "HER PAGES",
      cls: "chap",
      items: MEMORIES.map((m, i) => ({ label: m.title, value: i, right: m.text ? "" : "unwritten", hint: m.date })),
    });
    if (v == null) return;
    const m = MEMORIES[v];
    await G.ui.page({ title: m.title, date: m.date, anchor: m.anchor, text: m.text, sealed: !m.text });
  }
}

// ------------------------------------------------------------
// Boot
// ------------------------------------------------------------
async function boot() {
  layout();
  applyOpts();
  requestAnimationFrame(frame);
  const bootEl = document.getElementById("boot");
  const bar = bootEl.querySelector(".bbar i");
  let ready = false;
  const start = () => {
    if (G.mode !== "boot" || !ready) return;
    G.mode = "starting";
    G.audio.init();
    G.audio.setVolume(G.opts.volume / 10);
    G.music.setVolume((G.opts.music / 10) * 0.75);
    G.input.anyPressedCb = null;
    bootEl.classList.add("go");
    G.audio.tone(98, 2.5, "sine", 0.12);
    G.audio.tone(147, 2.5, "sine", 0.07, 0.15);
    G.audio.tone(196, 2.5, "triangle", 0.05, 0.3);
    const m = location.hash.match(/chapter-(\d+)/);
    setTimeout(() => {
      bootEl.remove();
      if (m && CHAPTERS[+m[1]]) { G.ui.setFade(1); runGame(skipState(+m[1])); } else toTitle();
    }, 1400);
  };
  bootEl.addEventListener("click", start);
  bootEl.addEventListener("touchend", (e) => { e.preventDefault(); start(); });
  G.input.anyPressedCb = start;
  const padWait = () => {
    if (G.mode !== "boot") return;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.buttons.some((b) => b.pressed)) return start();
    requestAnimationFrame(padWait);
  };
  await Promise.all([loadAssets((k) => (bar.style.width = Math.round(k * 100) + "%")), G.voice.init()]);
  G.player = new Player(G);
  ready = true;
  bootEl.classList.add("ready");
  padWait();
}
boot();
