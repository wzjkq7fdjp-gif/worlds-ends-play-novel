// ============================================================
// WORLD ENDS — combat.
// Direct control of one fighter (combo / guard / parry / dodge),
// a paused command menu for squad techniques, resonance & strain,
// command pulses you can interrupt, Khethari AI, Eidolon scale.
// ============================================================
import { THREE, U, mat, TEX, boxGeo } from "./ps1.js";
import { Character, makeKhethari, CAST, FRAMES, glowK } from "./actors.js";
import { angDiff } from "./world.js";

const TECH = {
  kaien: { name: "MAESTRO LINK", cost: 30, desc: "Every squadmate strikes your target in one rhythm. Interrupts a command pulse." },
  renji: { name: "ANCHOR", cost: 20, desc: "Renji draws every enemy to him and holds the line." },
  raizen: { name: "GRAVESEAL", cost: 25, desc: "Pin the target. Pinned enemies lose their armour." },
  shion: { name: "PRISMCRAFT · SEVER", cost: 25, desc: "Sever a signal node, antenna or rooftop Gloomcaster." },
  kyo: { name: "PRISMCRAFT · SECOND ANGLE", cost: 25, desc: "Cut right after Shion to BRAID: two nodes at once." },
  requiem: { name: "CURVED BLADE", cost: 30, desc: "Slip past the guard. Triple damage on a pinned or exposed target." },
};
const EN = {
  scuttle: { name: "SCUTTLEWIGHT", hp: 40, speed: 3.6, r: 0.6, dmg: 7, reach: 1.5 },
  scout: { name: "KHETHARI", hp: 30, speed: 2.4, r: 0.5, dmg: 5, reach: 1.4 },
  caster: { name: "GLOOMCASTER", hp: 50, speed: 0, r: 0.7, dmg: 6, reach: 30 },
  elite: { name: "HORNED ELITE", hp: 220, speed: 2.2, r: 0.8, dmg: 14, reach: 2.8, pulse: true },
  seraph: { name: "GLAIVE SERAPH", hp: 300, speed: 2.6, r: 0.9, dmg: 18, reach: 3.0, pulse: true },
  colossus: { name: "CARAPAX COLOSSUS", hp: 520, speed: 1.4, r: 1.9, dmg: 26, reach: 3.4, armor: true },
  warden: { name: "CANTOR WARDEN", hp: 900, speed: 0.9, r: 1.6, dmg: 22, reach: 4.2, pulse: true, boss: true },
  vael: { name: "VAEL NOCTYR", hp: 1000, speed: 3.2, r: 0.6, dmg: 20, reach: 2.4, pulse: true, boss: true, human: true, cast: "vael" },
  spar: { name: "RAIZEN (SPARRING)", hp: 220, speed: 3.0, r: 0.5, dmg: 5, reach: 1.9, human: true, cast: "raizen" },
};
const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export class Battle {
  // opts: { mech, allies:[ids], arena:{x0,z0,x1,z1}, resonance, onLose }
  constructor(G, opts = {}) {
    this.G = G;
    this.W = G.world;
    this.o = opts;
    this.sc = opts.mech ? 2.5 : 1;
    this.enemies = [];
    this.allies = [];
    this.fx = [];
    this.shots = [];
    this.civilians = [];
    this.res = opts.resonance ?? 50;
    this.strain = 0;
    this.overload = 0;
    this.sync = 0; // enemy coordination timer
    this.desync = 0; // after an interrupt or counter-harmony
    this.combo = 0; this.comboT = 0; this.atkT = 0; this.atkHit = false;
    this.dodgeT = 0; this.dodgeCd = 0; this.iframes = 0;
    this.guardT = 0;
    this.lastTech = null; this.lastTechT = 0;
    this.saved = 0; this.lost = 0;
    this.locked = [];
    this.techLocked = new Set(opts.lockTech || []);
    this.dead = false;
    const P = G.player;
    this.P = P;
    this.hpMax = opts.mech ? 260 : 120;
    this.hp = this.hpMax;
    P.noRun = false;
    P.combat = true;
    this.buildHUD();
    for (const id of opts.allies || []) this.addAlly(id);
    this.fn = (dt, t) => this.update(dt, t);
    this.W.every(this.fn);
    G.battle = this;
  }
  get scale() { return this.sc; }

  // ---------------- roster ----------------
  addAlly(id, x, z) {
    const model = this.o.mech && FRAMES[id] ? new Character(Object.assign({}, FRAMES[id])) : new Character(id, this.o.mech ? { scale: 2.1 } : {});
    const p = this.P.pos;
    model.setPos(x ?? p.x + (this.allies.length % 2 ? 2 : -2) * this.sc, 0, z ?? p.z - (1 + this.allies.length) * this.sc);
    this.W.add(model.root);
    const a = { id, ch: model, hp: 100, max: 100, cd: 1 + Math.random(), down: 0, anchor: 0, name: CAST[id].name, pos: model.root.position, vel: 0 };
    model.onStep = () => this.G.audio.step("street");
    this.allies.push(a);
    this.renderAllies();
    return a;
  }
  ally(id) { return this.allies.find((a) => a.id === id); }
  spawn(kind, x, z, o = {}) {
    const D = EN[kind];
    let m;
    if (D.human) {
      const ch = new Character(D.cast, { weapon: D.cast === "vael" ? "curved" : "katana" });
      m = { root: ch.root, ch, nodes: [], extra: {}, update: (dt, sp, st) => {
        ch.pose = st === "guard" ? "guard" : st === "listen" && kind === "vael" ? "conduct" : null;
        if (st === "windup" && !ch.act) ch.play("slash", 0.7);
        ch.update(dt, sp, sp > 3);
      } };
    } else m = makeKhethari(kind, (o.scale || 1) * (this.o.mech && kind !== "warden" && kind !== "colossus" ? 1.6 : kind === "colossus" && this.o.mech ? 1.5 : kind === "warden" && this.o.mech ? 2.2 : 1));
    m.root.position.set(x, o.y || 0, z);
    this.W.add(m.root);
    const sc = this.o.mech ? (kind === "warden" ? 2.2 : 1.6) : 1;
    const e = {
      kind, D, m, pos: m.root.position, hp: (o.hp || D.hp) * (this.o.mech ? 1.4 : 1), max: (o.hp || D.hp) * (this.o.mech ? 1.4 : 1),
      r: D.r * sc, reach: D.reach * sc, speed: D.speed * (this.o.mech ? 2.2 : 1), dmg: D.dmg,
      state: "idle", t: 0, cd: 1 + Math.random() * 1.5, stun: 0, pin: 0, yaw: 0, roof: !!o.y, pulseT: 4 + Math.random() * 4,
      pulse: 0, alive: true, nodes: m.nodes, exposed: false, name: o.name || D.name, flank: (Math.random() - 0.5) * 1.6, sc,
      adapt: 0, ...o.extra,
    };
    if (o.passive) e.passive = true;
    this.enemies.push(e);
    return e;
  }
  wave(list) { return list.map(([k, x, z, o]) => this.spawn(k, x, z, o)); }
  civ(path, n = 6) {
    // a stream of civilians evacuating along a path [[x,z],...]
    for (let i = 0; i < n; i++) {
      const ch = new Character("civilian", { shirt: [[110, 90, 80], [60, 80, 120], [130, 120, 90], [90, 60, 90]][i % 4], hair: ["#3a2a20", "#1a1a1a", "#6a4a30"][i % 3] });
      ch.setPos(path[0][0] + (Math.random() - 0.5) * 2, 0, path[0][1] - i * 1.6);
      this.W.add(ch.root);
      this.civilians.push({ ch, pos: ch.root.position, path, seg: 1, hp: 1, safe: false, alive: true, delay: i * 1.2 });
    }
  }
  alive() { return this.enemies.filter((e) => e.alive); }
  waitFor(pred) { return this.G.guard(new Promise((res) => { const f = () => { if (this.closed) return; if (pred()) res(); else requestAnimationFrame(f); }; f(); })); }
  cleared() { return this.waitFor(() => this.alive().length === 0); }

  // ---------------- per-frame ----------------
  update(dt, t) {
    const G = this.G, I = G.input, P = this.P;
    if (this.closed) return;
    const active = G.canMove() && !this.dead;
    // timers
    this.sync = Math.max(0, this.sync - dt);
    this.desync = Math.max(0, this.desync - dt);
    this.overload = Math.max(0, this.overload - dt);
    this.iframes = Math.max(0, this.iframes - dt);
    this.dodgeCd = Math.max(0, this.dodgeCd - dt);
    this.lastTechT += dt;
    const formation = this.allies.filter((a) => !a.down && a.pos.distanceTo(P.pos) < 9 * this.sc).length;
    this.strain = Math.max(0, this.strain - dt * (formation >= 2 ? 7 : 3.5));
    this.res = Math.min(100, this.res + dt * (formation >= 2 ? 2.2 : 0.8));
    this.target = this.pickTarget();
    if (active) this.playerControl(dt, I);
    else { P.moveMul = 1; }
    for (const a of this.allies) this.allyAI(a, dt);
    for (const e of this.enemies) if (e.alive) this.enemyAI(e, dt); else this.deadAnim(e, dt);
    for (const c of this.civilians) this.civAI(c, dt);
    this.updateShots(dt);
    this.updateFX(dt);
    this.updateHUD(dt);
  }
  pickTarget() {
    const P = this.P;
    let best = null, bs = 1e9;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.pos.x - P.pos.x, dz = e.pos.z - P.pos.z, d = Math.hypot(dx, dz);
      const fa = Math.abs(angDiff(P.yaw, Math.atan2(dx, dz)));
      const s = d + fa * 4 * this.sc + (e.roof ? 6 * this.sc : 0) - (e === this.target ? 2 * this.sc : 0);
      if (s < bs) { bs = s; best = e; }
    }
    return best;
  }

  // ---------------- player ----------------
  playerControl(dt, I) {
    const P = this.P, ch = P.ch, sc = this.sc;
    P.noRun = I.down("sq"); // □ is guard in combat
    // command menu
    if (I.pressed("tri")) { this.commandMenu(); return; }
    // guard
    const guarding = I.down("sq") && this.atkT <= 0 && this.dodgeT <= 0;
    if (I.pressed("sq")) this.guardT = 0.22;
    this.guardT = Math.max(0, this.guardT - dt);
    ch.pose = guarding ? "guard" : null;
    this.guarding = guarding;
    // dodge
    if (I.pressed("o") && this.dodgeCd <= 0) {
      const sx = I.stick.x, sy = I.stick.y;
      let dir;
      if (Math.hypot(sx, sy) > 0.2) { const b = P.basis ?? 0; const fx = Math.sin(b), fz = Math.cos(b); dir = Math.atan2(fx * sy - fz * sx, fz * sy + fx * sx); }
      else dir = P.yaw + Math.PI;
      this.dodgeT = 0.26; this.dodgeDir = dir; this.dodgeCd = 0.55; this.iframes = 0.34;
      ch.play("dash"); this.G.audio.whoosh();
    }
    if (this.dodgeT > 0) {
      this.dodgeT -= dt;
      const sp = 10 * sc * dt;
      const p = { x: P.pos.x + Math.sin(this.dodgeDir) * sp, z: P.pos.z + Math.cos(this.dodgeDir) * sp };
      this.W.resolve(p, P.radius);
      P.pos.x = p.x; P.pos.z = p.z;
      this.ghost(P.pos);
    }
    // attack combo
    this.comboT -= dt;
    if (this.atkT > 0) {
      this.atkT -= dt;
      const prog = 1 - this.atkT / this.atkDur;
      if (!this.atkHit && prog > 0.4) { this.atkHit = true; this.swingHit(); }
      if (prog < 0.55) { const step = (this.combo === 3 ? 4 : 2.4) * sc * dt; P.pos.x += Math.sin(P.yaw) * step; P.pos.z += Math.cos(P.yaw) * step; }
    }
    if (I.pressed("x") && this.dodgeT <= 0 && (this.atkT <= 0 || this.atkT < this.atkDur * 0.35)) {
      this.combo = this.comboT > 0 ? (this.combo % 3) + 1 : 1;
      const kinds = [null, "slash", "slash2", "slash3"];
      this.atkDur = [0, 0.36, 0.34, 0.5][this.combo];
      this.atkT = this.atkDur;
      this.atkHit = false;
      this.comboT = this.atkDur + 0.45;
      ch.play(kinds[this.combo], this.atkDur);
      this.G.audio.whoosh();
      // soft lock: turn toward the nearest foe in front
      const tg = this.target;
      if (tg && !tg.roof && tg.pos.distanceTo(P.pos) < 6 * sc + tg.r) P.yaw = Math.atan2(tg.pos.x - P.pos.x, tg.pos.z - P.pos.z);
    }
    P.moveMul = this.atkT > 0 ? 0.15 : guarding ? 0.35 : this.dodgeT > 0 ? 0 : 1;
  }
  swingHit() {
    const P = this.P, sc = this.sc;
    const reach = (this.o.mech ? 1.4 : 1.25) * sc + 0.5;
    let hit = false;
    for (const e of this.enemies) {
      if (!e.alive || e.roof) continue;
      const dx = e.pos.x - P.pos.x, dz = e.pos.z - P.pos.z, d = Math.hypot(dx, dz);
      if (d > reach + e.r) continue;
      if (Math.abs(angDiff(P.yaw, Math.atan2(dx, dz))) > 1.3 && d > e.r + 0.4) continue;
      const big = this.combo === 3;
      let dmg = (big ? 26 : 14) * (this.o.mech ? 1.6 : 1) * (0.9 + Math.random() * 0.2);
      if (e.pulse > 0) { this.interrupt(e); dmg *= 2; }
      this.damage(e, dmg, big);
      hit = true;
    }
    if (hit) { this.res = Math.min(100, this.res + 5); this.G.audio.slash(this.combo === 3); this.hitstop(0.05); }
  }
  hitstop(s) { this.G.hitstop = Math.max(this.G.hitstop || 0, s); }

  damage(e, dmg, big = false, src) {
    if (!e.alive) return 0;
    let mult = 1;
    if (e.D.armor && e.pin <= 0) mult = 0.3;
    if (e.pin > 0) mult *= 1.5;
    if (e.kind === "warden" && e.nodes.some((n) => n.alive)) mult *= 0.45;
    if (e.guarding) mult *= 0.2;
    const d = Math.round(dmg * mult);
    e.hp -= d;
    e.hitFlash = 0.12;
    this.pop(e.pos, d, mult < 0.5 ? "#9aa0b0" : big ? "#ffd070" : "#ffffff", e);
    this.spark(e.pos.clone().add(v3(0, 1.2 * e.sc, 0)), big ? 10 : 6, big ? 0xffd080 : 0xffffff);
    if (e.D.armor && e.pin <= 0 && Math.random() < 0.3) this.say("ARMOR", e);
    if (e.state !== "windup" && e.kind !== "warden" && e.kind !== "colossus" && e.kind !== "vael") e.stun = Math.max(e.stun, big ? 0.5 : 0.18);
    if (e.hp <= 0 && !e.immortal) this.kill(e);
    if (e.hp <= 1 && e.immortal) e.hp = Math.max(1, e.max * (e.floor || 0));
    return d;
  }
  kill(e) {
    e.alive = false; e.deadT = 0;
    this.G.audio.screech(e.kind === "scuttle" ? 1.3 : 0.7);
    this.spark(e.pos.clone().add(v3(0, 1 * e.sc, 0)), 18, 0x9a70ff);
    this.res = Math.min(100, this.res + 4);
    if (e === this.target) this.target = null;
  }
  deadAnim(e, dt) {
    e.deadT += dt;
    e.m.root.rotation.z = Math.min(1.4, e.deadT * 3);
    e.m.root.position.y = Math.max(-1.5 * e.sc, (e.roof ? e.m.root.position.y : 0) - e.deadT * (e.roof ? 6 : 0.6));
    if (e.deadT > 1.6 && e.m.root.parent) e.m.root.removeFromParent();
  }
  hurtPlayer(dmg, src) {
    if (this.dead || this.iframes > 0 || !this.G.canMove()) return;
    if (this.guarding) {
      if (this.guardT > 0) { // perfect guard → parry
        this.G.audio.parry();
        this.res = Math.min(100, this.res + 14);
        if (src) { src.stun = 1.4; src.state = "idle"; this.say("PARRY", src, "#8ad0ff"); }
        this.spark(this.P.pos.clone().add(v3(0, 1.4 * this.sc, 0)), 12, 0x8ad0ff);
        this.hitstop(0.12);
        return;
      }
      dmg *= 0.2;
      this.G.audio.clang();
    } else {
      this.G.audio.hurt();
      this.P.ch.play("hit");
      this.G.rig.shake = Math.max(this.G.rig.shake, 0.08 * this.sc);
    }
    this.hp -= dmg * (this.sync > 0 ? 1.3 : 1);
    this.flashHurt = 0.3;
    if (this.hp <= 0) { this.hp = 0; this.die(); }
  }
  die() {
    this.dead = true;
    this.P.ch.pose = "down";
    this.G.audio.boom();
    this.o.onLose ? this.o.onLose() : this.G.gameOver();
  }

  // ---------------- squad commands ----------------
  async commandMenu() {
    const G = this.G;
    const roster = [{ id: "kaien" }, ...this.allies.filter((a) => !a.hidden)].filter((x) => !this.techLocked.has(x.id));
    G.paused = true;
    G.music.duck(0.5);
    const items = roster.map((r) => {
      const T = TECH[r.id];
      const a = this.ally(r.id);
      const can = this.overload <= 0 && this.res >= T.cost && !(a && a.down > 0);
      const label = `${(CAST[r.id]?.name || r.id).padEnd(8)} ${T.name}`;
      return { label, value: r.id, disabled: !can, hint: (a && a.down > 0 ? "DOWN — recovering. " : this.overload > 0 ? "OVERLOAD — strain too high. " : this.res < T.cost ? `Needs ${T.cost} resonance. ` : "") + T.desc, cost: T.cost };
    });
    items.push({ label: "CANCEL", value: null });
    const tgt = this.target;
    const v = await G.ui.menu({ title: "SQUAD COMMAND", cls: "cmd", items, foot: `<div class="cmdinfo">RESONANCE ${Math.round(this.res)} · STRAIN ${Math.round(this.strain)}${tgt ? ` · TARGET ${tgt.name}` : ""}</div>` });
    G.paused = false;
    G.music.unduck();
    if (v) this.tech(v);
  }
  tech(id) {
    const G = this.G, T = TECH[id], tg = this.target, sc = this.sc;
    if (this.res < T.cost) return;
    this.res -= T.cost;
    this.strain += T.cost * 0.9;
    if (this.strain >= 100) { this.overload = 6; this.strain = 100; G.ui.toast("MAESTRO OVERLOAD — HOLD FORMATION TO COOL DOWN", 3); }
    // the enemy learns: repeat the same technique on a boss and it counters
    const boss = this.enemies.find((e) => e.alive && e.D.boss);
    if (boss && this.lastTech === id && this.lastTechT < 14) {
      boss.adapt++;
      if (boss.adapt >= 1 && id !== "kaien") { this.say("ADAPTED — CHANGE YOUR ATTACKER", boss, "#ff6070"); G.audio.screech(0.5); this.lastTech = null; return; }
    }
    this.lastTech = id; this.lastTechT = 0;
    if (boss) { this.say("COUNTER WARNING", boss, "#ffb060"); }
    const a = this.ally(id);
    const name = T.name;
    G.ui.toast(`${CAST[id].name} · ${name}`, 1.6);
    if (id === "kaien") {
      G.audio.maestro();
      this.P.ch.play("point", 0.8);
      for (const al of this.allies) if (!al.down && tg) { this.beam(al.pos, tg.pos, 0x60c0ff); al.ch.play("slash3"); }
      if (tg) {
        if (tg.pulse > 0) this.interrupt(tg);
        const n = this.allies.filter((x) => !x.down).length + 1;
        this.damage(tg, 18 * n * (this.o.mech ? 1.5 : 1), true);
        this.desync = Math.max(this.desync, 3);
      }
      this.ring(this.P.pos, 0x60c0ff, 6 * sc);
    } else if (id === "renji") {
      G.audio.anchor();
      a.anchor = 8;
      a.ch.pose = "guard";
      this.ring(a.pos, 0x60ff90, 5 * sc);
    } else if (id === "raizen") {
      G.audio.grave();
      if (tg) { tg.pin = 5; tg.stun = Math.max(tg.stun, 4.5); this.beam(a.pos, tg.pos, 0xb060ff, 6); this.say("PINNED", tg, "#c890ff"); if (tg.roof) { this.damage(tg, 200); } }
      a.ch.play("cast");
    } else if (id === "shion" || id === "kyo") {
      G.audio.prism();
      a.ch.play("cast");
      const braid = id === "kyo" && this.lastShion && performance.now() - this.lastShion < 4500;
      if (id === "shion") this.lastShion = performance.now();
      const cut = (e) => {
        this.beam(a.pos, e.pos.clone().add(v3(0, (e.roof ? 0.5 : 2.5) * e.sc, 0)), id === "shion" ? 0x80f0ff : 0xffb050, 4);
        const node = e.nodes.find((n) => n.alive);
        if (node) { node.alive = false; node.g.visible = false; this.say("NODE SEVERED", e, "#80f0ff"); G.audio.glass(); if (!e.nodes.some((n) => n.alive)) { e.exposed = true; this.say("CORE EXPOSED", e, "#ffe080"); } e.stun = Math.max(e.stun, 1.2); }
        this.damage(e, e.kind === "caster" ? 999 : 45 * (this.o.mech ? 1.5 : 1), true);
      };
      const casters = this.enemies.filter((e) => e.alive && e.kind === "caster");
      const primary = tg && (tg.nodes.some((n) => n.alive) || tg.kind === "caster") ? tg : casters.sort((p, q) => p.pos.distanceTo(this.P.pos) - q.pos.distanceTo(this.P.pos))[0] || tg;
      if (primary) cut(primary);
      if (braid) {
        this.say("BRAID", primary || this.P, "#ffe0a0");
        const second = primary && primary.nodes.some((n) => n.alive) ? primary : this.enemies.find((e) => e.alive && e !== primary && (e.kind === "caster" || e.nodes.some((n) => n.alive)));
        if (second) cut(second);
      }
    } else if (id === "requiem") {
      G.audio.slash(true);
      if (tg && a) {
        a.pos.set(tg.pos.x - Math.sin(tg.yaw) * (tg.r + 0.8), 0, tg.pos.z - Math.cos(tg.yaw) * (tg.r + 0.8));
        a.ch.faceToward(tg.pos.x, tg.pos.z);
        a.ch.play("slash3");
        this.ghost(a.pos);
        const mul = tg.pin > 0 || tg.exposed ? 3 : 1;
        if (mul > 1) this.say("EXPOSED NODE", tg, "#ffe080");
        this.damage(tg, 50 * mul * (this.o.mech ? 1.5 : 1), true);
      }
    }
  }
  interrupt(e) {
    e.pulse = 0;
    e.state = "idle";
    e.stun = 2.4;
    this.desync = 5;
    this.sync = 0;
    this.G.audio.parry();
    this.say("INTERRUPTED", e, "#8ad0ff");
    this.ring(e.pos, 0x8ad0ff, 7 * this.sc);
    this.G.ui.toast("COMMAND BROKEN — THE SWARM LOSES ITS RHYTHM", 2.2);
    this.hitstop(0.1);
  }

  // ---------------- allies ----------------
  allyAI(a, dt) {
    const sc = this.sc, ch = a.ch;
    a.cd -= dt;
    a.anchor = Math.max(0, a.anchor - dt);
    if (a.anchor <= 0 && ch.pose === "guard") ch.pose = null;
    if (a.hidden) { ch.update(dt, 0); return; }
    if (a.down > 0) { a.down -= dt; ch.pose = "down"; if (a.down <= 0) { a.hp = a.max * 0.5; ch.pose = null; } ch.update(dt, 0); return; }
    // pick a target: nearest ground enemy, else follow the player
    let tg = null, bd = 1e9;
    for (const e of this.enemies) if (e.alive && !e.roof) { const d = e.pos.distanceTo(a.pos); if (d < bd) { bd = d; tg = e; } }
    let gx, gz, spd = 0;
    if (tg && bd < 30 * sc) {
      const dx = tg.pos.x - a.pos.x, dz = tg.pos.z - a.pos.z, d = Math.hypot(dx, dz);
      const want = tg.r + 1.1 * sc;
      if (d > want) { gx = tg.pos.x - (dx / d) * want; gz = tg.pos.z - (dz / d) * want; }
      ch.faceToward(tg.pos.x, tg.pos.z);
      if (d < want + 0.6 * sc && a.cd <= 0 && G_canMove(this)) {
        a.cd = 1.1 + Math.random() * 0.8;
        ch.play(Math.random() < 0.5 ? "slash" : "slash2");
        const dm = (a.id === "renji" ? 8 : a.id === "requiem" ? 13 : 10) * (this.o.mech ? 1.5 : 1) * (this.desync > 0 ? 1.4 : 1);
        setTimeout(() => { if (tg.alive && !this.closed) { this.damage(tg, dm, false, a); this.G.audio.slash(); } }, 160);
      }
    } else {
      const P = this.P, i = this.allies.indexOf(a);
      gx = P.pos.x + Math.cos(P.yaw + 2.2 + i * 0.9) * 2.4 * sc;
      gz = P.pos.z - Math.sin(P.yaw + 2.2 + i * 0.9) * 2.4 * sc * -1;
      if (Math.hypot(gx - a.pos.x, gz - a.pos.z) < 1.2 * sc) gx = undefined;
    }
    if (gx !== undefined && !(ch.act && ch.act.kind.startsWith("slash"))) {
      const dx = gx - a.pos.x, dz = gz - a.pos.z, d = Math.hypot(dx, dz);
      spd = Math.min(d * 2, (d > 6 * sc ? 4.6 : 2.4) * sc);
      a.pos.x += (dx / d) * spd * dt; a.pos.z += (dz / d) * spd * dt;
      if (!tg) ch.faceToward(gx, gz);
      const p = { x: a.pos.x, z: a.pos.z }; this.W.resolve(p, 0.3 * sc); a.pos.x = p.x; a.pos.z = p.z;
    }
    ch.update(dt, spd / sc, spd > 3 * sc);
  }
  hurtAlly(a, dmg) {
    if (a.down > 0) return;
    a.hp -= dmg * (a.anchor > 0 ? 0.3 : 1);
    a.ch.play("hit");
    if (a.hp <= 0) { a.hp = 0; a.down = 7; this.G.ui.toast(`${a.name} IS DOWN`, 2); }
  }

  // ---------------- enemies ----------------
  enemyAI(e, dt) {
    const sc = this.sc, P = this.P;
    e.t += dt; e.cd -= dt;
    e.hitFlash = Math.max(0, (e.hitFlash || 0) - dt);
    e.pin = Math.max(0, e.pin - dt);
    const frozen = !this.G.canMove() || e.passive;
    const coord = this.sync > 0 && this.desync <= 0 ? 1.4 : this.desync > 0 ? 0.6 : 1;
    let spd = 0, st = e.state;
    if (frozen) { e.m.update(dt, 0, e.state); return; }
    if (e.stun > 0) { e.stun -= dt; e.state = "idle"; e.m.update(dt, 0, "stun"); e.m.root.rotation.z = Math.sin(e.t * 30) * 0.03; return; }
    e.m.root.rotation.z = 0;
    // choose who to hunt: anchored Renji pulls everyone
    const anchor = this.allies.find((a) => a.anchor > 0 && !a.down);
    let tgt = anchor ? { pos: anchor.pos, ally: anchor } : { pos: P.pos };
    if (!anchor && e.kind === "scuttle" && this.civilians.length && Math.random() < 0.002) e.civ = this.civilians.find((c) => c.alive && !c.safe);
    if (e.civ && e.civ.alive && !e.civ.safe && !anchor) tgt = { pos: e.civ.pos, civ: e.civ };
    else e.civ = null;
    if (!anchor && !e.civ && e.kind !== "caster" && this.allies.length && e.huntAlly === undefined) e.huntAlly = Math.random() < 0.35 ? this.allies[Math.floor(Math.random() * this.allies.length)] : null;
    if (!anchor && !e.civ && e.huntAlly && !e.huntAlly.down) tgt = { pos: e.huntAlly.pos, ally: e.huntAlly };
    const dx = tgt.pos.x - e.pos.x, dz = tgt.pos.z - e.pos.z, d = Math.hypot(dx, dz);
    const yawTo = Math.atan2(dx, dz);
    // command pulse (elites/bosses): a visible ring you can interrupt
    if (e.D.pulse && !e.noPulse) {
      e.pulseT -= dt;
      if (e.pulseT <= 0 && e.pulse <= 0 && e.state !== "windup") {
        e.pulse = 1.35; e.pulseT = (e.D.boss ? 7 : 9) + Math.random() * 3;
        this.G.audio.pulse();
        this.ring(e.pos, 0xff5070, 9 * sc, 1.35, true);
        this.say("COMMAND PULSE", e, "#ff6070");
      }
      if (e.pulse > 0) {
        e.pulse -= dt;
        e.m.update(dt, 0, "listen");
        if (e.pulse <= 0) {
          this.sync = 7;
          this.G.ui.toast("THE CANTICLE SYNCS THE SWARM", 2);
          this.G.rig.shake = Math.max(this.G.rig.shake, 0.06 * sc);
          if (e.kind === "warden") { this.hurtPlayer(14, e); this.allies.forEach((a) => this.hurtAlly(a, 10)); this.spawnAround(e, 2); }
          if (e.kind === "vael") this.vaelTune();
        }
        return;
      }
    }
    if (e.kind === "caster") {
      e.yaw = yawTo; e.m.root.rotation.y = yawTo;
      if (e.state === "charge") {
        if (e.t > 0.9) { e.state = "idle"; e.cd = 2.6 + Math.random() * 1.5; for (let i = 0; i < 3; i++) setTimeout(() => this.fire(e, tgt), i * 140); }
      } else if (e.cd <= 0 && d < 40 * sc) { e.state = "charge"; e.t = 0; }
      e.m.update(dt, 0, e.state);
      return;
    }
    if (e.state === "windup") {
      if (e.t > (e.kind === "colossus" ? 1.0 : e.kind === "scuttle" ? 0.35 : 0.7) / coord) {
        e.state = "strike"; e.t = 0;
        if (e.kind === "colossus") { e.chargeDir = e.yaw; this.G.audio.stomp(); }
        else this.G.audio.slash(e.kind !== "scuttle");
      }
      e.m.update(dt, 0, "windup");
      this.telegraph(e);
      return;
    }
    if (e.state === "strike") {
      if (e.kind === "colossus") {
        const sp = 9 * sc * dt;
        e.pos.x += Math.sin(e.chargeDir) * sp; e.pos.z += Math.cos(e.chargeDir) * sp;
        const p = { x: e.pos.x, z: e.pos.z }; this.W.resolve(p, e.r); e.pos.x = p.x; e.pos.z = p.z;
        this.contact(e, e.r + 0.8 * sc, e.dmg);
        if (e.t > 0.8) { e.state = "idle"; e.cd = 2.5; }
        e.m.update(dt, 4, "charge");
      } else {
        if (!e.struck) { e.struck = true; this.contact(e, e.reach + 0.4 * sc, e.dmg * coord, 1.1); }
        if (e.t > 0.35) { e.state = "idle"; e.struck = false; e.cd = (e.kind === "scuttle" ? 1.3 : 1.8) / coord; }
        e.m.update(dt, 0, "strike");
      }
      return;
    }
    // approach
    const want = e.reach * 0.8 + (tgt.civ ? 0 : 0);
    if (d > want) {
      spd = e.speed * coord;
      // herd: flank at an angle instead of a straight line
      const fy = yawTo + (e.kind === "scuttle" ? e.flank * Math.min(1, d / (8 * sc)) : 0);
      e.pos.x += Math.sin(fy) * spd * dt; e.pos.z += Math.cos(fy) * spd * dt;
      const p = { x: e.pos.x, z: e.pos.z }; this.W.resolve(p, e.r * 0.8); e.pos.x = p.x; e.pos.z = p.z;
      // keep a little apart from each other
      for (const o of this.enemies) if (o !== e && o.alive && !o.roof) { const ox = e.pos.x - o.pos.x, oz = e.pos.z - o.pos.z, od = Math.hypot(ox, oz), mn = (e.r + o.r) * 0.8; if (od < mn && od > 0.001) { e.pos.x += (ox / od) * (mn - od) * 0.5; e.pos.z += (oz / od) * (mn - od) * 0.5; } }
    } else if (e.cd <= 0) {
      e.state = "windup"; e.t = 0; e.windTarget = tgt;
      if (e.kind !== "scuttle") this.G.audio.screech(0.6);
    }
    e.yaw += angDiff(e.yaw, yawTo) * Math.min(1, dt * 6);
    e.m.root.rotation.y = e.yaw;
    if (tgt.civ && d < 1.4 && e.state === "idle" && e.cd <= 0) { tgt.civ.alive = false; tgt.civ.ch.pose = "lie"; this.lost++; e.civ = null; }
    e.m.update(dt, spd, "walk");
    if (e.kind === "vael") this.vaelExtra(e, dt, d);
  }
  contact(e, range, dmg, arc = 1.4) {
    const hits = [{ pos: this.P.pos, player: true }, ...this.allies.filter((a) => !a.down).map((a) => ({ pos: a.pos, ally: a }))];
    for (const h of hits) {
      const dx = h.pos.x - e.pos.x, dz = h.pos.z - e.pos.z, d = Math.hypot(dx, dz);
      if (d > range) continue;
      if (Math.abs(angDiff(e.yaw, Math.atan2(dx, dz))) > arc && e.kind !== "colossus") continue;
      if (h.player) this.hurtPlayer(dmg, e); else this.hurtAlly(h.ally, dmg * 0.8);
      if (e.kind === "colossus") { e.state = "idle"; e.cd = 2.2; }
    }
  }
  telegraph(e) {
    // a red ground marker shows the strike before it lands
    if (!e.tele) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.2, 1, 16, 1, -0.9, 1.8), mat({ color: 0xff3040, additive: true, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      this.W.add(m);
      e.tele = m;
    }
    const m = e.tele;
    m.visible = true;
    const r = e.kind === "colossus" ? 8 * this.sc : e.reach + 0.4 * this.sc;
    m.scale.setScalar(r);
    m.position.set(e.pos.x, 0.05, e.pos.z);
    m.rotation.z = -e.yaw + Math.PI / 2;
    clearTimeout(e.teleT);
    e.teleT = setTimeout(() => (m.visible = false), 80);
  }
  spawnAround(e, n) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2; this.spawn("scuttle", e.pos.x + Math.sin(a) * 4 * this.sc, e.pos.z + Math.cos(a) * 4 * this.sc); }
  }
  fire(e, tgt) {
    if (!e.alive || this.closed) return;
    const from = e.pos.clone().add(v3(0, 0.9 * e.sc * (this.o.mech ? 1.6 : 1), 0));
    const to = tgt.pos.clone().add(v3((Math.random() - 0.5) * 1.5 * this.sc, 1.2 * this.sc, (Math.random() - 0.5) * 1.5 * this.sc));
    const dir = to.sub(from).normalize();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.35 * this.sc, 0.35 * this.sc), mat({ map: TEX.glow(), additive: true, color: 0xc080ff }));
    m.position.copy(from);
    this.W.add(m);
    this.W.billboards.push(m);
    this.shots.push({ m, dir, sp: 22 * this.sc, life: 3 });
    this.G.audio.needle();
  }
  updateShots(dt) {
    for (const s of this.shots) {
      s.life -= dt;
      s.m.position.addScaledVector(s.dir, s.sp * dt);
      const hit = [{ pos: this.P.pos, player: true }, ...this.allies.filter((a) => !a.down).map((a) => ({ pos: a.pos, ally: a }))].find((h) => Math.hypot(h.pos.x - s.m.position.x, h.pos.z - s.m.position.z) < 0.7 * this.sc && Math.abs(s.m.position.y - h.pos.y - 1 * this.sc) < 1.2 * this.sc);
      if (hit) { s.life = 0; if (hit.player) this.hurtPlayer(6, null); else this.hurtAlly(hit.ally, 5); this.spark(s.m.position.clone(), 4, 0xc080ff); }
      if (s.m.position.y < 0) s.life = 0;
      if (s.life <= 0) { s.m.removeFromParent(); this.W.billboards = this.W.billboards.filter((b) => b !== s.m); }
    }
    this.shots = this.shots.filter((s) => s.life > 0);
  }
  civAI(c, dt) {
    if (!c.alive || c.safe) { c.ch.update(dt, 0); return; }
    if (c.delay > 0) { c.delay -= dt; c.ch.update(dt, 0); return; }
    const t = c.path[c.seg];
    if (!t) { c.safe = true; c.ch.setVisible(false); this.saved++; return; }
    const dx = t[0] - c.pos.x, dz = t[1] - c.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.5) { c.seg++; return; }
    const sp = 2.6;
    c.pos.x += (dx / d) * sp * dt; c.pos.z += (dz / d) * sp * dt;
    c.ch.faceToward(t[0], t[1]);
    c.ch.update(dt, sp, true);
  }

  // ---------------- Vael ----------------
  vaelExtra(e, dt, d) {
    e.blink = (e.blink ?? 5) - dt;
    if (e.blink <= 0 && d > 5) {
      e.blink = 4 + Math.random() * 3;
      const P = this.P;
      this.ghost(e.pos);
      e.pos.set(P.pos.x - Math.sin(P.yaw) * 2.2, 0, P.pos.z - Math.cos(P.yaw) * 2.2);
      e.state = "windup"; e.t = 0.2;
      this.G.audio.whoosh();
      this.say("BEHIND YOU", e, "#ff6070");
    }
  }
  vaelTune() {
    // he tunes the squad out of phase: allies' strikes stutter
    this.G.ui.toast("VAEL TUNES YOUR AETHERHEARTS OUT OF PHASE", 2.4);
    this.allies.forEach((a) => (a.cd += 2.5));
    this.res = Math.max(0, this.res - 15);
  }

  // ---------------- effects ----------------
  spark(p, n = 6, color = 0xffffff) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.18 * this.sc, 0.18 * this.sc), mat({ map: TEX.glow(), additive: true, color }));
      m.position.copy(p);
      this.W.add(m); this.W.billboards.push(m);
      this.fx.push({ m, v: v3((Math.random() - 0.5) * 6, Math.random() * 5, (Math.random() - 0.5) * 6).multiplyScalar(this.sc), life: 0.35 + Math.random() * 0.2, g: 12 * this.sc });
    }
  }
  ghost(p) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * this.sc, 1.8 * this.sc), mat({ map: TEX.glow(), additive: true, color: 0x6080c0 }));
    m.position.copy(p).add(v3(0, 1 * this.sc, 0));
    this.W.add(m); this.W.billboards.push(m);
    this.fx.push({ m, v: v3(), life: 0.25, g: 0, fade: true });
  }
  ring(p, color, r, life = 0.6, ground = false) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 3, 24), mat({ color, additive: true }));
    m.position.set(p.x, ground ? 0.2 : 1 * this.sc, p.z);
    m.rotation.x = Math.PI / 2;
    this.W.add(m);
    this.fx.push({ m, v: v3(), life, max: life, grow: r, g: 0 });
  }
  beam(a, b, color, life = 0.5) {
    const from = a.clone().add(v3(0, 1.2 * this.sc, 0)), to = b.clone().add(v3(0, 1.0 * this.sc, 0));
    const len = from.distanceTo(to);
    const m = new THREE.Mesh(boxGeo(0.06 * this.sc, 0.06 * this.sc, len), mat({ color, additive: true }));
    m.position.copy(from).lerp(to, 0.5);
    m.lookAt(to);
    this.W.add(m);
    this.fx.push({ m, v: v3(), life: Math.min(life, 0.6), g: 0 });
  }
  updateFX(dt) {
    for (const f of this.fx) {
      f.life -= dt;
      f.v.y -= f.g * dt;
      f.m.position.addScaledVector(f.v, dt);
      if (f.grow) { const k = 1 - f.life / f.max; f.m.scale.setScalar(0.5 + k * f.grow); }
      if (f.life <= 0) { f.m.removeFromParent(); this.W.billboards = this.W.billboards.filter((b) => b !== f.m); f.m.geometry.dispose(); }
    }
    this.fx = this.fx.filter((f) => f.life > 0);
    for (const e of this.enemies) if (e.alive) {
      const k = e.hitFlash > 0 ? 2.2 : e.pin > 0 ? 1.4 : 1;
      if (k !== e._k) { e._k = k; e.m.root.traverse((o) => { if (o.isMesh && o.material.uniforms && !o.material.uniforms.uAdditive.value) o.material.uniforms.uEmissive.value = k > 1 ? (k - 1) * 0.6 : 0; }); }
    }
  }

  // ---------------- HUD ----------------
  buildHUD() {
    const h = (this.hud = document.createElement("div"));
    h.id = "bhud";
    h.className = this.o.mech ? "mech" : "";
    h.innerHTML = `
      <div class="b-target"><div class="b-tname"></div><div class="b-tbar"><i></i></div><div class="b-nodes"></div></div>
      <div class="b-sync">⟁ CANTICLE SYNC</div>
      <div class="b-me">
        <div class="b-name">${this.o.mech ? "EIDOLON-0 · KAIEN" : "KAIEN"}</div>
        <div class="b-hp"><i></i><span></span></div>
        <div class="b-meter res"><b>RES</b><i></i></div>
        <div class="b-meter str"><b>STR</b><i></i></div>
      </div>
      <div class="b-allies"></div>
      <div class="b-help">✕ ATTACK · □ GUARD · ○ DODGE · △ COMMAND</div>
      <div class="b-civ"></div>
      <div class="b-pops"></div>`;
    document.getElementById("hud").appendChild(h);
    this.el = {
      tname: h.querySelector(".b-tname"), tbar: h.querySelector(".b-tbar i"), nodes: h.querySelector(".b-nodes"), target: h.querySelector(".b-target"),
      hp: h.querySelector(".b-hp i"), hpn: h.querySelector(".b-hp span"), res: h.querySelector(".res i"), str: h.querySelector(".str i"),
      allies: h.querySelector(".b-allies"), sync: h.querySelector(".b-sync"), pops: h.querySelector(".b-pops"), civ: h.querySelector(".b-civ"), me: h.querySelector(".b-me"),
    };
    document.body.classList.add("inbattle");
    if (this.o.mech) document.body.classList.add("cockpit");
  }
  renderAllies() {
    if (!this.el) return;
    this.el.allies.innerHTML = this.allies.filter((a) => !a.hidden).map((a) => `<div class="b-ally" data-id="${a.id}"><b>${a.name}</b><div class="b-abar"><i></i></div><em></em></div>`).join("");
  }
  updateHUD(dt) {
    const E = this.el;
    E.hp.style.width = (this.hp / this.hpMax) * 100 + "%";
    E.hpn.textContent = `${Math.ceil(this.hp)} / ${this.hpMax}`;
    E.res.style.width = this.res + "%";
    E.str.style.width = this.strain + "%";
    E.me.classList.toggle("over", this.overload > 0);
    E.me.classList.toggle("hurt", (this.flashHurt = Math.max(0, (this.flashHurt || 0) - dt)) > 0);
    E.sync.classList.toggle("on", this.sync > 0 && this.desync <= 0);
    const tg = this.target;
    E.target.classList.toggle("on", !!tg);
    if (tg) {
      E.tname.textContent = tg.name + (tg.pin > 0 ? " · PINNED" : "") + (tg.exposed ? " · EXPOSED" : "") + (tg.pulse > 0 ? " · PULSE!" : "");
      E.tbar.style.width = Math.max(0, tg.hp / tg.max) * 100 + "%";
      E.nodes.innerHTML = tg.nodes.map((n) => `<i class="${n.alive ? "" : "cut"}"></i>`).join("");
      E.target.classList.toggle("pulse", tg.pulse > 0);
    }
    this.allies.forEach((a) => {
      const row = E.allies.querySelector(`[data-id="${a.id}"]`);
      if (!row) return;
      row.querySelector("i").style.width = (a.hp / a.max) * 100 + "%";
      row.querySelector("em").textContent = a.down > 0 ? "DOWN" : a.anchor > 0 ? "ANCHOR" : "";
      row.classList.toggle("down", a.down > 0);
    });
    if (this.civilians.length) E.civ.textContent = `CIVILIANS SAFE ${this.saved} / ${this.civilians.length}`;
    // floating numbers follow the world
    for (const p of this.popsList || []) {
      p.t += dt;
      const v = p.pos.clone(); v.y += 1.8 * this.sc + p.t * 1.2 * this.sc;
      v.project(this.G.camera);
      p.el.style.left = (v.x * 0.5 + 0.5) * 100 + "%";
      p.el.style.top = (-v.y * 0.5 + 0.5) * 100 + "%";
      p.el.style.opacity = Math.max(0, 1 - p.t / 0.9);
      if (p.t > 0.9) p.el.remove();
    }
    this.popsList = (this.popsList || []).filter((p) => p.t <= 0.9);
    // lock-on marker
    if (!this.marker) {
      this.marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.16 * this.sc, 0), mat({ color: 0xffd060, unlit: true }));
      this.W.add(this.marker);
    }
    this.marker.visible = !!tg;
    if (tg) { this.marker.position.set(tg.pos.x, tg.pos.y + (tg.kind === "colossus" ? 3.6 : tg.kind === "warden" || tg.kind === "seraph" || tg.kind === "elite" ? 3.8 : tg.kind === "vael" ? 2.3 : 1.6) * tg.sc + Math.sin(performance.now() / 200) * 0.08, tg.pos.z); this.marker.rotation.y += dt * 3; }
  }
  pop(pos, n, color, e) {
    const el = document.createElement("div");
    el.className = "b-pop";
    el.textContent = n;
    el.style.color = color;
    this.el.pops.appendChild(el);
    (this.popsList = this.popsList || []).push({ el, pos: pos.clone(), t: 0 });
  }
  say(text, e, color = "#ffd070") {
    const el = document.createElement("div");
    el.className = "b-pop word";
    el.textContent = text;
    el.style.color = color;
    this.el.pops.appendChild(el);
    (this.popsList = this.popsList || []).push({ el, pos: (e.pos || e).clone(), t: -0.3 });
  }
  close() {
    this.closed = true;
    this.hud.remove();
    document.body.classList.remove("inbattle", "cockpit");
    this.W.updaters = this.W.updaters.filter((f) => f !== this.fn);
    if (this.marker) this.marker.visible = false;
    this.P.combat = false;
    this.P.moveMul = 1;
    this.P.ch.pose = null;
    this.G.battle = null;
    for (const s of this.shots) s.m.removeFromParent();
  }
}
const G_canMove = (b) => b.G.canMove();
