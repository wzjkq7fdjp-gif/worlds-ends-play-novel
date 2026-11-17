// ============================================================
// WORLD ENDS — THE LAST CANTICLE
// Boot, title, loading screens, saves, options, chapter flow,
// cutscene + battle helpers and the main loop.
// ============================================================
import { THREE, U } from "./ps1.js";
import { Audio } from "./audio.js";
import { Music } from "./music.js";
import { Input } from "./input.js";
import { UI } from "./ui.js";
import { World, Player, CameraRig } from "./world.js";
import { Character } from "./actors.js";
import { Battle } from "./combat.js";
import { CHAPTERS, ARCHIVE, buildTitle } from "./chapters.js";

const SAVE_KEY = "we_save_v1", META_KEY = "we_meta_v1", OPT_KEY = "we_opts_v1";
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const camera = new THREE.PerspectiveCamera(55, 4 / 3, 0.1, 400);

const audio = new Audio();
const G = {
  THREE, U, renderer, camera, audio,
  music: new Music(audio),
  input: new Input(),
  rig: new CameraRig(camera),
  world: null, player: null, ui: null, battle: null,
  lock: 0, paused: false, mode: "boot", time: 0, timers: [], signals: {}, hitstop: 0,
  state: null,
  meta: store.get(META_KEY, { unlocked: 0, seen: [], cleared: false }),
  opts: { tank: false, crt: true, jitter: true, dither: true, wide: false, volume: 8, music: 7, ...store.get(OPT_KEY, {}) },
};
window.WE = G;
G.debug = {};

function layout() {
  const LW = G.opts.wide ? 400 : 320, LH = 240;
  if (canvas.width !== LW || canvas.height !== LH) {
    renderer.setSize(LW, LH, false);
    camera.aspect = LW / LH;
    camera.updateProjectionMatrix();
    U.uRes.value.set(LW, LH);
  }
  const vw = window.innerWidth, vh = window.innerHeight;
  const touch = document.body.classList.contains("touch");
  const portrait = vh > vw;
  const availH = touch && portrait ? vh * 0.6 : vh;
  const w = Math.min(vw, (availH * LW) / LH), h = (w * LH) / LW;
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
  G.music.setVolume(G.opts.music / 10);
  store.set(OPT_KEY, G.opts);
  layout();
}

// ------------------------------------------------------------
// Script helpers
// ------------------------------------------------------------
let runToken = 0;
const guard = (p) => { const tok = runToken; return p.then((v) => (tok !== runToken ? new Promise(() => {}) : v)); };
G.guard = guard;
G.canMove = () => G.lock === 0 && !G.ui.busy && !G.paused && G.mode === "play";
G.wait = (sec) => guard(new Promise((res) => G.timers.push({ t: sec, res })));
G.signal = (n) => { const s = G.signals[n]; G.signals[n] = true; if (Array.isArray(s)) s.forEach((r) => r()); };
G.until = (n) => guard(new Promise((res) => { const s = G.signals[n]; if (s === true) return res(); (G.signals[n] = Array.isArray(s) ? s : []).push(res); }));
G.say = (lines, o) => guard(G.ui.say(lines, o));
G.choose = (p, opts, o) => guard(G.ui.choose(p, opts, o));
G.fade = (to, dur, color) => guard(G.ui.fade(to, dur, color));
G.lines = (l, o) => guard(G.ui.lines(l, o));
G.item = (o) => guard(G.ui.item(o));
G.objective = (t) => { if (G.state) G.state.objective = t; G.ui.objective(t); if (t) G.audio.chime(); };
G.cutscene = async (fn) => { G.lock++; try { return await fn(); } finally { G.lock--; } };
// a full cinematic: letterbox, HUD hidden, player locked
G.cine = async (fn) => {
  G.lock++;
  G.ui.letterbox(true);
  G.ui.prompt(null);
  try { return await fn(); } finally { G.lock--; G.ui.letterbox(false); G.rig.release(); }
};
G.flag = (k, v = true) => { G.state.flags[k] = v; };
G.interactOnce = (o) => guard(new Promise((res) => {
  const it = G.world.interact({ ...o, use: async () => { it.remove(); if (o.use) await o.use(); res(); } });
}));
G.walkTo = (ch, x, z, speed = 1.4) => guard(new Promise((res) => {
  ch._walking = true;
  const p0 = ch.root.position;
  let left = Math.hypot(x - p0.x, z - p0.z) / speed + 3;
  const fn = (dt) => {
    const p = ch.root.position;
    left -= dt;
    if (left <= 0) { p.x = x; p.z = z; }
    const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.08) {
      ch.update(dt, 0);
      if (!fn.done) { fn.done = true; ch._walking = false; G.world.updaters = G.world.updaters.filter((f) => f !== fn); res(); }
      return;
    }
    const s = Math.min(d, speed * dt);
    p.x += (dx / d) * s; p.z += (dz / d) * s;
    p.y = G.world.groundAt(p.x, p.z);
    let df = Math.atan2(dx, dz) - ch.yaw;
    while (df > Math.PI) df -= Math.PI * 2;
    while (df < -Math.PI) df += Math.PI * 2;
    ch.face(ch.yaw + df * Math.min(1, dt * 8));
    ch.update(dt, speed / (ch.P.mech ? 2.5 : 1), speed > 2.6 * (ch.P.mech ? 2.5 : 1));
  };
  G.world.every(fn);
}));
G.idle = (ch) => G.world.every((dt) => { if (!ch._walking) ch.update(dt, 0); });
G.actor = (id, x, z, yaw = 0, over) => {
  const c = new Character(id, over);
  c.setPos(x, G.world.groundAt(x, z), z).face(yaw);
  G.world.add(c.root);
  G.idle(c);
  return c;
};
// camera: a fixed shot, or a move between two shots over `dur` seconds
G.shot = (pos, look, fov) => G.rig.shot(pos, look, true, fov);
G.pan = (a, b, dur, fov) => {
  G.rig.shot(a[0], a[1], true, fov);
  const o = G.rig.override;
  const p0 = new THREE.Vector3(...a[0]), l0 = new THREE.Vector3(...a[1]), p1 = new THREE.Vector3(...b[0]), l1 = new THREE.Vector3(...b[1]);
  let t = 0;
  const fn = (dt) => {
    t += dt;
    const k = Math.min(1, t / dur), e = k * k * (3 - 2 * k);
    if (G.rig.override !== o) { G.world.updaters = G.world.updaters.filter((f) => f !== fn); return; }
    o.pos.copy(p0).lerp(p1, e); o.look.copy(l0).lerp(l1, e);
    if (k >= 1) G.world.updaters = G.world.updaters.filter((f) => f !== fn);
  };
  G.world.every(fn);
};
G.tween = (dur, fn) => guard(new Promise((res) => {
  let t = 0;
  const u = (dt) => { t += dt; const k = Math.min(1, t / dur); fn(k); if (k >= 1) { G.world.updaters = G.world.updaters.filter((f) => f !== u); res(); } };
  G.world.every(u);
}));
G.flash = async (color = "#ffffff", hold = 0.08) => { G.ui.setFade(1, color); await G.wait(hold); G.fade(0, 0.5); };

// Avatar: kaien on foot, kaien's Eidolon, or another character for short scenes
G.setAvatar = (id = "kaien", mech = false) => {
  const P = G.player;
  const old = P.ch.root;
  const pos = P.pos.clone();
  const ch = mech ? new Character({ mech: true, plate: [70, 82, 118], trim: [150, 36, 44], core: 0x60c0ff, weapon: "katana" }) : new Character(id);
  P.ch = ch;
  P.pos = ch.root.position;
  P.pos.copy(pos);
  ch.face(P.yaw);
  ch.onStep = (run) => G.audio.step(G.world?.surfaceAt(P.pos.x, P.pos.z) || "street", run);
  if (mech) { ch.onStep = () => G.audio.stomp(); }
  P.walk = mech ? 4.6 : id === "miyu" ? 1.3 : 1.75;
  P.runSpd = mech ? 9 : id === "miyu" ? 2.6 : 3.9;
  P.radius = mech ? 0.9 : 0.32;
  P.mech = mech;
  if (old.parent) { old.parent.add(ch.root); old.removeFromParent(); }
};

G.load = async (builder, o = {}) => {
  if (G.battle) G.battle.close();
  if (G.world) G.world.dispose();
  G.timers = G.timers.filter((t) => t.keep);
  G.signals = {};
  const W = new World(G);
  G.world = W;
  if (!G.player) G.player = new Player(G);
  G.setAvatar(o.avatar || "kaien", !!o.mech);
  Object.assign(G.player, { faceTarget: null, frozen: false, noRun: false, moveMul: 1 });
  G.player.ch.setVisible(true);
  G.rig.release(true);
  G.rig.cfg = { yaw: 0, pitch: 0.32, dist: o.mech ? 13 : 6, height: o.mech ? 3.4 : 1.4, fov: 55, lead: 0.6 };
  const cfg = (await builder(W, G, o)) || {};
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
  if (G.pendingLoad) { const L = G.pendingLoad; G.pendingLoad = null; await L.done(); }
  return W;
};
// start a fight; resolves when `until` (default: all enemies down) is true
G.fight = (opts) => new Battle(G, { onLose: () => G.gameOver(), ...opts });

G.checkpoint = () => {
  const ok = store.set(SAVE_KEY, { ch: G.state.ch, flags: G.state.flags, stats: G.state.stats });
  G.meta.unlocked = Math.max(G.meta.unlocked, G.state.ch);
  store.set(META_KEY, G.meta);
  if (ok) G.ui.toast("MEMORY CARD: SAVED");
};
G.saveMeta = () => store.set(META_KEY, G.meta);
G.seen = (id) => { if (!G.meta.seen.includes(id)) { G.meta.seen.push(id); G.saveMeta(); } };

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
  if (G.hitstop > 0) { G.hitstop -= dt; dt *= 0.08; }
  if (!G.paused) {
    G.time += dt;
    U.uTime.value = G.time;
    for (const t of [...G.timers]) { t.t -= dt; if (t.t <= 0) { G.timers.splice(G.timers.indexOf(t), 1); t.res(); } }
  }
  G.ui.update(dt, I);
  const W = G.world;
  if (W && G.player) {
    if (G.mode === "play" && !G.paused) {
      if (!G.ui.busy && G.lock === 0) {
        if (I.pressed("start")) pauseMenu();
        else if (I.pressed("tri") && !G.battle) { G.paused = true; G.ui.journal(G.state).then(() => (G.paused = false)); }
      }
      if (!G.paused) {
        G.player.update(dt, I, G.rig.facingYaw ?? G.rig.yaw, G.opts);
        const it = G.canMove() && !G.battle ? W.nearestInteract(G.player.pos, G.player.yaw) : null;
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
  } else { renderer.setClearColor(0, 1); renderer.clear(); }
}

// ------------------------------------------------------------
// Menus
// ------------------------------------------------------------
async function optionsMenu() {
  const o = G.opts;
  const tog = (k) => () => { o[k] = !o[k]; applyOpts(); };
  const bar = (n) => "▮".repeat(n) + "▯".repeat(10 - n);
  await G.ui.menu({
    title: "CONFIG", cls: "opts",
    items: [
      { label: "CONTROLS", get: () => (o.tank ? "TANK (CLASSIC)" : "MODERN (CAMERA)"), set: tog("tank"), hint: "Modern: push the stick where you want to go." },
      { label: "MUSIC", get: () => bar(o.music), set: (d) => { o.music = Math.max(0, Math.min(10, o.music + (d > 0 ? 1 : -1))); applyOpts(); } },
      { label: "SOUND", get: () => bar(o.volume), set: (d) => { o.volume = Math.max(0, Math.min(10, o.volume + (d > 0 ? 1 : -1))); applyOpts(); } },
      { label: "VERTEX JITTER", get: () => (o.jitter ? "ON" : "OFF"), set: tog("jitter"), hint: "PS1 wobble." },
      { label: "DITHERING", get: () => (o.dither ? "ON" : "OFF"), set: tog("dither") },
      { label: "CRT FILTER", get: () => (o.crt ? "ON" : "OFF"), set: tog("crt") },
      { label: "SCREEN", get: () => (o.wide ? "16:10 HACK" : "4:3 ORIGINAL"), set: tog("wide") },
      { label: "BACK", value: "back" },
    ],
  });
}
async function pauseMenu() {
  G.paused = true;
  G.audio.blip();
  G.music.duck(0.4);
  while (true) {
    const v = await G.ui.menu({
      title: "PAUSE", cls: "pause",
      foot: `<div class="pinfo">${G.state.chapterName || ""}<br><span>${G.state.objective || ""}</span></div>`,
      items: [
        { label: "RESUME", value: "resume" },
        { label: "SAVE", value: "save", hint: "Saves at the start of this chapter." },
        { label: "RETRY CHAPTER", value: "restart" },
        { label: "CONFIG", value: "options" },
        { label: "QUIT TO TITLE", value: "title" },
      ],
    });
    if (v === "options") { await optionsMenu(); continue; }
    if (v === "save") { G.checkpoint(); continue; }
    G.music.unduck();
    if (v === "restart") { G.paused = false; restartChapter(); return; }
    if (v === "title") { G.paused = false; toTitle(); return; }
    break;
  }
  G.paused = false;
}
G.gameOver = async () => {
  const tok = runToken;
  G.lock++;
  G.music.play(null, 2);
  await G.wait(1.2);
  if (tok !== runToken) return;
  await G.ui.fade(1, 1.2, "#200000");
  G.lock = 0;
  const v = await G.ui.menu({ title: "THE CANTICLE TAKES YOU", cls: "over", back: false, items: [{ label: "RETRY", value: "retry" }, { label: "QUIT TO TITLE", value: "title" }] });
  if (v === "retry") restartChapter(); else toTitle();
};

// ------------------------------------------------------------
// Flow
// ------------------------------------------------------------
class Abort extends Error {}
function freshState(ch = 0) { return { ch, flags: {}, stats: { saved: 0 }, objective: "" }; }
async function runGame(state) {
  const tok = ++runToken;
  G.state = state;
  G.mode = "play";
  G.lock = 0;
  G.paused = false;
  G.ui.objective(null);
  try {
    for (let i = state.ch; i < CHAPTERS.length; i++) {
      if (tok !== runToken) return;
      const C = CHAPTERS[i];
      state.ch = i;
      state.chapterName = `${C.num} · ${C.title}`;
      if (i > 0) G.checkpoint();
      G.ui.objective(null);
      G.pendingLoad = G.ui.loading({ tip: C.tip, art: C.art || "", label: `${C.num} · ${C.title}` });
      G.music.play(null, 1);
      await C.run(G);
      if (G.pendingLoad) { await G.pendingLoad.done(); G.pendingLoad = null; }
      if (tok !== runToken) return;
      G.seen(C.id);
    }
    G.meta.cleared = true;
    G.saveMeta();
    store.set(SAVE_KEY, null);
    toTitle();
  } catch (e) {
    console.error(e);
    G.ui.toast("ERROR: " + e.message, 8);
  }
}
function restartChapter() {
  const s = store.get(SAVE_KEY, null);
  const ch = G.state ? G.state.ch : s ? s.ch : 0;
  const st = freshState(ch);
  if (s && s.ch === ch) { st.flags = s.flags || {}; st.stats = s.stats || st.stats; }
  while (G.ui.stack.length) G.ui.pop(G.ui.stack[0]);
  G.ui.setFade(1, "#000");
  runGame(st);
}
G.debug.run = (n) => { const st = freshState(n); while (G.ui.stack.length) G.ui.pop(G.ui.stack[0]); document.getElementById("logo").classList.remove("on"); runGame(st); };

async function toTitle() {
  runToken++;
  G.mode = "title";
  G.lock = 0; G.paused = false;
  while (G.ui.stack.length) G.ui.pop(G.ui.stack[0]);
  G.ui.objective(null); G.ui.prompt(null); G.ui.letterbox(false);
  await G.load(buildTitle);
  G.player.ch.setVisible(false);
  G.audio.ambience({ wind: 0.5, drone: 0.25, note: 41, traffic: 0, bright: 200 });
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
      { label: "NEW GAME", value: "new", hint: "Eighteen years after First Fall." },
      { label: "CONTINUE", value: "cont", disabled: !save, hint: save ? `Memory card: ${CHAPTERS[save.ch]?.num} · ${CHAPTERS[save.ch]?.title}` : "No data on the memory card." },
      { label: "CHAPTERS", value: "chap", hint: "Replay any chapter you have reached." },
      { label: "ARCHIVE", value: "arch", hint: "The squad, the Khethari and Covenant records." },
      { label: "CONFIG", value: "opts" },
    ];
    const v = await G.ui.menu({ items, cls: "title", back: false, start: save ? 1 : 0 });
    if (tok !== runToken) return;
    if (v === "opts") { await optionsMenu(); continue; }
    if (v === "arch") { logo.classList.remove("on"); await archive(); logo.classList.add("on"); continue; }
    let st = null;
    if (v === "new") st = freshState(0);
    if (v === "cont") st = { ...freshState(save.ch), flags: save.flags || {}, stats: save.stats || { saved: 0 } };
    if (v === "chap") {
      const max = G.meta.unlocked;
      const acts = CHAPTERS.map((c, i) => ({ label: `${c.num.padEnd(10)} ${c.title}`, value: i, disabled: i > max, hint: i > max ? "Not yet reached." : c.act }));
      logo.classList.remove("on");
      const c = await G.ui.menu({ title: "CHAPTERS", cls: "chap", items: acts, start: Math.min(max, CHAPTERS.length - 1) });
      logo.classList.add("on");
      if (c == null) continue;
      st = freshState(c);
    }
    if (!st) continue;
    logo.classList.remove("on");
    G.audio.confirm();
    G.music.play(null, 1.5);
    await G.ui.fade(1, 1.2);
    runGame(st);
    return;
  }
}
async function archive() {
  const items = ARCHIVE.map((a) => ({ label: a.name, value: a, hint: "" }));
  items.push({ label: "BACK", value: null });
  while (true) {
    const a = await G.ui.menu({ title: "ARCHIVE", cls: "chap arch", items });
    if (!a) return;
    await G.ui.item({ title: a.name, canvas: a.pic ? a.pic() : null, text: a.text });
  }
}

// ------------------------------------------------------------
// Boot
// ------------------------------------------------------------
function boot() {
  layout();
  applyOpts();
  requestAnimationFrame(frame);
  const bootEl = document.getElementById("boot");
  const start = () => {
    if (G.mode !== "boot") return;
    G.mode = "starting";
    G.audio.init();
    G.audio.setVolume(G.opts.volume / 10);
    G.music.ensure();
    G.music.setVolume(G.opts.music / 10);
    G.input.anyPressedCb = null;
    bootEl.classList.add("go");
    G.audio.chapterHit();
    const m = location.hash.match(/chapter-?(\d+)/);
    setTimeout(() => {
      bootEl.remove();
      if (m && CHAPTERS[+m[1]]) { G.ui.setFade(1); runGame(freshState(+m[1])); }
      else toTitle();
    }, 1600);
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
  padWait();
}
boot();
