// ============================================================
// ONE MINUTE AWAY — The Road Between Us
// Boot, title screen, game loop, saves, options, chapter flow.
// ============================================================
import { THREE, U } from "./ps1.js";
import { Audio, THEME } from "./audio.js";
import { Input } from "./input.js";
import { UI } from "./ui.js";
import { World, Player, CameraRig } from "./world.js";
import { CHAPTERS, ENDINGS, buildAttract, decideEnding } from "./chapters.js";

const SAVE_KEY = "oma_save_v2";
const META_KEY = "oma_meta_v2";
const OPT_KEY = "oma_opts_v2";
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const camera = new THREE.PerspectiveCamera(55, 4 / 3, 0.1, 120);

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
  opts: { tank: false, crt: true, jitter: true, dither: true, wide: false, volume: 8, ...store.get(OPT_KEY, {}) },
};
window.OMA = G; // handy for debugging from the console
G.debug = {};

// ------------------------------------------------------------
// Layout: 4:3 (or wide) box, integer-ish pixel scaling, --u unit
// ------------------------------------------------------------
function layout() {
  const wide = G.opts.wide;
  const LW = wide ? 400 : 320, LH = 240;
  if (canvas.width !== LW || canvas.height !== LH) {
    renderer.setSize(LW, LH, false);
    camera.aspect = LW / LH;
    camera.updateProjectionMatrix();
    U.uRes.value.set(LW, LH);
  }
  const vw = window.innerWidth, vh = window.innerHeight;
  const touch = document.body.classList.contains("touch");
  const portrait = vh > vw;
  const availH = touch && portrait ? vh * 0.62 : vh;
  let w = Math.min(vw, (availH * LW) / LH);
  let h = (w * LH) / LW;
  const box = document.getElementById("screen");
  box.style.width = w + "px";
  box.style.height = h + "px";
  box.style.top = (touch && portrait ? Math.max(0, (availH - h) / 2) + 8 : (vh - h) / 2) + "px";
  box.style.left = (vw - w) / 2 + "px";
  document.documentElement.style.setProperty("--u", w / LW + "px");
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
  store.set(OPT_KEY, G.opts);
  layout();
}

// ------------------------------------------------------------
// Script helpers (await-able, game-time aware)
// ------------------------------------------------------------
// a promise that silently never settles if the run was aborted meanwhile
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
G.clock = (t) => { G.state && (G.state.clock = t); G.ui.clock(t); };
G.objective = (t) => { if (G.state) G.state.objective = t; G.ui.objective(t); if (t) G.audio.chime(); };
G.cutscene = async (fn) => { G.lock++; try { return await fn(); } finally { G.lock--; } };
G.mem = (k, v = 1) => { G.state.memory[k] = (G.state.memory[k] || 0) + v; };
G.flag = (k, v = true) => { G.state.flags[k] = v; };
// add an interactable and resolve when it is used
G.interactOnce = (o) => guard(new Promise((res) => {
  const it = G.world.interact({
    ...o,
    use: async () => {
      it.remove();
      if (o.use) await o.use();
      res();
    },
  });
}));
G.walkTo = (ch, x, z, speed = 1.4, o = {}) => guard(new Promise((res) => {
  ch._walking = true;
  const fn = (dt) => {
    const p = ch.root.position;
    const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.08) {
      ch.update(dt, 0);
      if (!fn.done) { fn.done = true; ch._walking = false; G.world.updaters = G.world.updaters.filter((f) => f !== fn); res(); }
      return;
    }
    const s = Math.min(d, speed * dt);
    p.x += (dx / d) * s;
    p.z += (dz / d) * s;
    p.y = G.world.groundAt(p.x, p.z);
    const want = Math.atan2(dx, dz);
    let df = want - ch.yaw;
    while (df > Math.PI) df -= Math.PI * 2;
    while (df < -Math.PI) df += Math.PI * 2;
    ch.face(ch.yaw + df * Math.min(1, dt * 8));
    ch.update(dt, speed, speed > 2.6);
    if (o.steps) ch.onStep = () => G.audio.step(G.world.surfaceAt(p.x, p.z));
  };
  G.world.every(fn);
}));
G.idle = (ch) => G.world.every((dt) => { if (!ch._walking) ch.update(dt, 0); });

// Build a new world (scene). builder(W, G) may return { start:[x,z,yaw], cam:{...}, camZones:[...] }
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
  G.player.ch.setVisible(true);
  G.rig.release(true);
  G.rig.cfg = { yaw: 0, pitch: 0.32, dist: 6, height: 1.4, fov: 55, lead: 0.6 };
  const cfg = (await builder(W, G)) || {};
  W.scene.add(G.player.ch.root);
  if (cfg.start) G.player.place(cfg.start[0], cfg.start[1], cfg.start[2] || 0);
  if (cfg.cam) G.rig.set(cfg.cam, true);
  G.rig.snapNext = true;
  G.rig.yaw = G.rig.cfg.yaw;
  W.camZones = cfg.camZones || [];
  G.audio.staticLevel(0);
  G.audio.setMuffle(false);
  U.uTint.value.setRGB(1, 1, 1);
  U.uAdd.value.setRGB(0, 0, 0);
  G.input.flush();
  return W;
};

G.checkpoint = () => {
  const ok = store.set(SAVE_KEY, { ch: G.state.ch, memory: G.state.memory, flags: G.state.flags });
  G.meta.unlocked = Math.max(G.meta.unlocked, G.state.ch);
  store.set(META_KEY, G.meta);
  if (ok) G.ui.toast("MEMORY CARD: SAVED");
};
G.saveMeta = () => store.set(META_KEY, G.meta);

// ------------------------------------------------------------
// Main loop
// ------------------------------------------------------------
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000);
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
  const W = G.world;
  if (W && G.player) {
    if (G.mode === "play" && !G.paused) {
      // pause / journal / interact
      if (!G.ui.busy && G.lock === 0) {
        if (I.pressed("start")) pauseMenu();
        else if (I.pressed("tri")) { G.paused = true; G.ui.journal(G.state).then(() => (G.paused = false)); }
      }
      if (!G.paused) {
        G.player.update(dt, I, G.rig.facingYaw ?? G.rig.yaw, G.opts);
        const it = G.canMove() ? W.nearestInteract(G.player.pos, G.player.yaw) : null;
        G.ui.prompt(it ? (it.verb ? it.verb + ": " : "") + it.label : null);
        if (it && I.pressed("x")) G.cutscene(() => it.use());
      } else G.ui.prompt(null);
    }
    if (!G.paused) {
      W.update(dt, G.time, camera);
      G.rig.update(dt, G.player, W.camZones);
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
  await G.ui.menu({
    title: "OPTIONS",
    cls: "opts",
    items: [
      { label: "CONTROLS", get: () => (o.tank ? "TANK (CLASSIC)" : "MODERN (CAMERA)"), set: tog("tank"), hint: o.tank ? "" : "Modern: push the stick where you want to go. Tank: up walks forward, left/right turn." },
      { label: "VERTEX JITTER", get: () => (o.jitter ? "ON" : "OFF"), set: tog("jitter"), hint: "PS1 wobble: vertices snap to the low-res pixel grid." },
      { label: "DITHERING", get: () => (o.dither ? "ON" : "OFF"), set: tog("dither"), hint: "15-bit colour with ordered dithering." },
      { label: "CRT FILTER", get: () => (o.crt ? "ON" : "OFF"), set: tog("crt"), hint: "Scanlines, glow and a curved-glass vignette." },
      { label: "SCREEN", get: () => (o.wide ? "16:10 HACK" : "4:3 ORIGINAL"), set: tog("wide"), hint: "Widescreen hack like the emulators do." },
      { label: "VOLUME", get: () => "▮".repeat(o.volume) + "▯".repeat(10 - o.volume), set: (d) => { o.volume = Math.max(0, Math.min(10, o.volume + (d > 0 ? 1 : -1))); applyOpts(); }, hint: "Left / right to adjust." },
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
      foot: `<div class="pinfo">${G.state.chapterName || ""}<br><span>${G.state.objective || ""}</span></div>`,
      items: [
        { label: "RESUME", value: "resume" },
        { label: "JOURNAL", value: "journal" },
        { label: "SAVE CHECKPOINT", value: "save", hint: "Saves at the start of this chapter." },
        { label: "RESTART CHAPTER", value: "restart" },
        { label: "OPTIONS", value: "options" },
        { label: "QUIT TO TITLE", value: "title" },
      ],
    });
    if (v === "journal") { await G.ui.journal(G.state); continue; }
    if (v === "options") { await optionsMenu(); continue; }
    if (v === "save") { G.checkpoint(); continue; }
    if (v === "restart") { G.paused = false; restartChapter(); return; }
    if (v === "title") { G.paused = false; toTitle(); return; }
    break;
  }
  G.paused = false;
}

// ------------------------------------------------------------
// Flow: title → chapters → ending
// ------------------------------------------------------------
let runToken = 0;
function freshState(ch = 0) {
  return { ch, memory: { fragments: 0, photos: 0, us: 0 }, flags: {}, objective: "", clock: "4:04" };
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
      state.ch = i;
      state.chapterName = CHAPTERS[i].name;
      if (i > 0) G.checkpoint();
      const res = await CHAPTERS[i].run(G);
      G.alive(tok);
      if (res && res.ending) return finish(res.ending, tok);
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
  try { const s = store.get(SAVE_KEY, null); runGame(s ? { ...freshState(s.ch), memory: s.memory, flags: s.flags } : freshState(G.state.ch)); } catch { runGame(freshState(0)); }
}

async function toTitle() {
  runToken++;
  G.mode = "title";
  G.lock = 0;
  G.paused = false;
  while (G.ui.stack.length) G.ui.pop(G.ui.stack[0]);
  G.ui.objective(null);
  G.ui.prompt(null);
  G.ui.clock(null);
  await G.load(buildAttract);
  G.player.ch.setVisible(false);
  G.audio.ambience({ wind: 0.5, drone: 0.4, note: 49, traffic: 0.25, bright: 220 });
  G.ui.setFade(1, "#000");
  G.ui.fade(0, 2.5);
  titleMenu();
}

async function titleMenu() {
  const logo = document.getElementById("logo");
  logo.classList.add("on");
  const tok = runToken;
  // music box theme loops softly on the title
  const loopTheme = async () => {
    while (G.mode === "title" && tok === runToken) {
      const d = G.audio.musicBox(THEME, 0.45, 0.03);
      await G.wait(d + 3);
    }
  };
  loopTheme();
  const save = store.get(SAVE_KEY, null);
  while (true) {
    const items = [
      { label: "NEW GAME", value: "new", hint: "October 24, 2026. 4:04 AM." },
      { label: "CONTINUE", value: "cont", disabled: !save, hint: save ? `Memory card: ${CHAPTERS[save.ch]?.name || ""}` : "No save on the memory card." },
      { label: "CHAPTER SELECT", value: "chap", hint: "Replay any chapter you have reached." },
      { label: "OPTIONS", value: "opts" },
      { label: "EXTRAS", value: "extras", hint: "Endings found and the story so far." },
    ];
    const v = await G.ui.menu({ items, cls: "title", back: false, start: save ? 1 : 0 });
    if (tok !== runToken) return;
    if (v === "opts") { await optionsMenu(); continue; }
    if (v === "extras") { await extras(); continue; }
    let st = null;
    if (v === "new") { st = freshState(0); if (G.meta.cleared) st.flags.ngplus = true; }
    if (v === "cont") st = { ...freshState(save.ch), memory: save.memory, flags: save.flags };
    if (v === "chap") {
      const max = Math.max(G.meta.unlocked, 0);
      const c = await G.ui.menu({
        title: "CHAPTER SELECT",
        cls: "chap",
        items: CHAPTERS.map((ch, i) => ({ label: ch.name, value: i, disabled: i > max, hint: i > max ? "Not yet remembered." : ch.sub })),
      });
      if (c == null) continue;
      st = freshState(c);
      // give a fair memory baseline when skipping ahead
      if (c >= 3) st.memory.fragments = 3;
      if (c >= 5) st.memory.photos = 4, st.flags.ring = true;
      if (c >= 7) st.memory.us = 3;
    }
    if (!st) continue;
    logo.classList.remove("on");
    G.audio.confirm();
    await G.fade(1, 1.2);
    runGame(st);
    return;
  }
}

async function extras() {
  const E = [
    ["always", "1 · ALWAYS"], ["waited", "2 · THE ONE WHO WAITED"], ["forever", "3 · 4:04 FOREVER"],
    ["otherme", "4 · THE OTHER ME"], ["before", "5 · BEFORE WE KNEW"],
  ];
  await G.ui.menu({
    title: "ENDINGS",
    cls: "chap",
    items: [...E.map(([id, n]) => ({ label: G.meta.endings.includes(id) ? n : "? · ??????", value: id, disabled: true, hint: "" })), { label: "BACK", value: "back" }],
    start: E.length,
  });
}

// ------------------------------------------------------------
// Boot
// ------------------------------------------------------------
async function boot() {
  layout();
  applyOpts();
  requestAnimationFrame(frame);
  const bootEl = document.getElementById("boot");
  const start = () => {
    if (G.mode !== "boot") return;
    G.mode = "starting";
    G.audio.init();
    G.audio.setVolume(G.opts.volume / 10);
    G.input.anyPressedCb = null;
    bootEl.classList.add("go");
    G.audio.tone(98, 2.5, "sine", 0.12);
    G.audio.tone(147, 2.5, "sine", 0.07, 0.15);
    G.audio.tone(196, 2.5, "triangle", 0.05, 0.3);
    // deep link: index.html#chapter=3 jumps straight into a chapter
    const m = location.hash.match(/chapter=(\d+)/);
    setTimeout(() => {
      bootEl.remove();
      if (m && CHAPTERS[+m[1]]) {
        const st = freshState(+m[1]);
        st.memory = { fragments: 3, photos: 4, us: 3 };
        st.flags.ring = true;
        G.ui.setFade(1);
        runGame(st);
      } else toTitle();
    }, 1400);
  };
  bootEl.addEventListener("click", start);
  bootEl.addEventListener("touchend", (e) => { e.preventDefault(); start(); });
  G.input.anyPressedCb = start;
  // gamepad start
  const padWait = () => {
    if (G.mode !== "boot") return;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.buttons.some((b) => b.pressed)) return start();
    requestAnimationFrame(padWait);
  };
  padWait();
}
boot();
