// ============================================================
// Actors — pre-rendered sprite characters, the way late-PS1
// games mixed painted rooms with sprite people.
//  · Character — Rufki, Argjila and anyone else with a sprite
//    sheet: 5-direction turnaround (mirrored for the other side),
//    front / side / back walk cycles driven by the stride, and
//    drawn cutscene poses. Same API the scripts always used.
//  · SpriteActor — entities and memory cast (same sheets),
//    updated with the camera, optional looping animation.
//  · Blocky — untextured stand-ins for blurred bystanders.
// ============================================================
import { THREE, mat, boxGeo, TEX } from "./ps1.js";
import { A } from "./assets.js";

const lerp = (a, b, t) => a + (b - a) * t;
const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

// which sheet a preset draws from, and how tall the person is (m)
const PRESET = {
  rufki: ["rufki", 1.81], argjila: ["argjila", 1.65],
  other: ["other", 1.81], doubleR: ["other", 1.81], doubleA: ["argjila", 1.65], fakeA: ["argjila", 1.65],
  unmet: ["unmet", 2.05], unsaid: ["unsaid", 2.5], keeper: ["keeper", 3.0],
  kidR: ["kidR", 1.25], kidA: ["kidA", 1.2], confidante: ["confidante", 1.62], friend: ["friend", 1.7], dancer: ["dancer", 1.74],
};
// drawn poses (sheet order): phone, sit, crouch, ear-to-door, arms open, hug, slow dance, knock
const POSE = {
  phone: 0, phoneL: 0, hold: 0,
  sit: 1, sitDrive: 1, sitMap: 1, sitPhone: 1,
  crouch: 2, kneel: 2, slump: 2,
  listen: 3, chain: 3, sleeve: 3,
  reach: 4, reachBoth: 4, tpose: 4, point: 4, arms: 4,
  embrace: 5, cry: 5,
  dance: 6,
  knock: 7, raised: 7,
};

function median(a) { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] || 1; }
const matCache = {};
function sheetMat(sheet, o = {}) {
  const k = sheet + JSON.stringify(o);
  if (!matCache[k]) matCache[k] = mat({ map: A.tex["sh_" + sheet], side: THREE.DoubleSide, ...o });
  return matCache[k];
}

export class Character {
  constructor(preset = "rufki", over = {}) {
    const [sheet, hM] = PRESET[preset] || PRESET.rufki;
    this.preset = preset;
    this.sheet = sheet;
    this.D = A.sheets[sheet];
    this.root = new THREE.Group();
    this.pivot = new THREE.Group();
    this.root.add(this.pivot);
    this.yaw = 0;
    this.phase = 0;
    this.amp = 0;
    this.speed = 0;
    this.t = Math.random() * 10;
    this.poseName = null;
    this.early = 0;
    this.look = 0;
    this.lookUp = 0;
    this.onStep = null;
    this.anim = null; // { group, fps } for looping animations
    this.frameOverride = null; // [group, index]
    const F = this.D.frames;
    const ref = F.turn ? median(F.turn.map((f) => f.h)) : median((F.anim || F.pose).map((f) => f.h));
    this.height = hM * (over.scale || 1);
    this.k = this.height / ref; // metres per texel
    const opts = {};
    if (over.emissive) opts.emissive = over.emissive;
    if (preset === "doubleA" || preset === "doubleR") { opts.color = 0xc8c4d4; opts.emissive = 0.05; }
    if (over.color != null) opts.color = over.color;
    const g = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.Mesh(g, sheetMat(sheet, opts));
    this.mesh.frustumCulled = false;
    this.pivot.add(this.mesh);
    this.uv = g.attributes.uv;
    this.cur = null;
    // orient + pick the frame against whichever camera draws us
    this.mesh.onBeforeRender = (r, s, cam) => this.orient(cam);
    if (over.shadow !== false) {
      const sh = new THREE.Mesh(new THREE.CircleGeometry(0.3 * (this.height / 1.75), 10), mat({ color: 0x000000, opacity: 0.4, unlit: true, noFog: true }));
      sh.rotation.x = -Math.PI / 2;
      sh.position.y = 0.015;
      sh.renderOrder = 1;
      this.shadow = sh;
      this.root.add(sh);
    }
    this.headMesh = this.mesh;
    this.material = this.mesh.material;
    this.setFrame(F.turn ? F.turn[0] : (F.anim || F.pose)[0], false);
  }

  setPos(x, y, z) { this.root.position.set(x, y, z); return this; }
  face(yaw) { this.yaw = yaw; return this; }
  faceToward(x, z) { return this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z)); }
  setVisible(v) { this.root.visible = v; }
  pose(name) { this.poseName = name || null; return this; }

  setFrame(f, mirror) {
    const key = f.x + "," + f.y + (mirror ? "m" : "");
    if (this.cur === key) return;
    this.cur = key;
    const [W, H] = this.D.size;
    const u0 = (f.x + 0.5) / W, u1 = (f.x + f.w - 0.5) / W;
    const v1 = 1 - (f.y + 0.5) / H, v0 = 1 - (f.y + f.h - 0.5) / H;
    // PlaneGeometry uv order: (0,1) (1,1) (0,0) (1,0)
    this.uv.setXY(0, u0, v1); this.uv.setXY(1, u1, v1); this.uv.setXY(2, u0, v0); this.uv.setXY(3, u1, v0);
    this.uv.needsUpdate = true;
    const k = this.k, w = f.w * k, h = f.h * k, off = (f.w / 2 - f.ax) * k;
    this.mesh.scale.set(mirror ? -w : w, h, 1);
    this.mesh.position.set(mirror ? -off : off, h / 2, 0);
  }

  orient(cam) {
    const p = this.root.getWorldPosition(_v);
    const toCam = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
    this.pivot.rotation.y = toCam - (this.root.parent ? this.root.parent.rotation.y : 0);
    const rel = wrap(toCam - this.yaw);
    const sector = Math.min(4, Math.round(Math.abs(rel) / (Math.PI / 4)));
    const mirror = rel < 0;
    const F = this.D.frames;
    if (this.frameOverride) { const [g, i] = this.frameOverride; const L = F[g]; if (L) return this.setFrame(L[i % L.length], mirror); }
    if (this.poseName && F.pose && POSE[this.poseName] != null) return this.setFrame(F.pose[POSE[this.poseName]], mirror);
    if (this.anim && F[this.anim.group]) { const L = F[this.anim.group]; return this.setFrame(L[Math.floor(this.t * this.anim.fps) % L.length], this.anim.mirror ?? mirror); }
    const step = Math.floor((this.phase + this.early) / (Math.PI / 2)) & 3;
    const moving = this.amp > 0.12;
    if (moving) {
      const grp = sector <= 1 ? "walkF" : sector === 2 ? "walkS" : "walkB";
      let L = F[grp];
      if (!L && F.walkS && sector >= 1 && sector <= 3) L = F.walkS;
      if (L) { this.pivot.position.y = 0; return this.setFrame(L[step], grp === "walkS" || L === F.walkS ? mirror : false); }
      // no walk cycle from this angle: step the turnaround with a bob
      this.pivot.position.y = Math.abs(Math.sin(this.phase)) * 0.035;
    } else this.pivot.position.y = 0;
    const T = F.turn || F.anim || F.pose;
    this.setFrame(T[Math.min(sector, T.length - 1)], mirror);
  }

  update(dt, speed = 0, run = false) {
    this.t += dt;
    this.speed = speed;
    const target = Math.min(1, speed / 2.0) * (run ? 1 : 0.62);
    this.amp += (target - this.amp) * Math.min(1, dt * 10);
    const before = Math.floor(this.phase / Math.PI);
    if (speed > 0.05) this.phase += dt * speed * (run ? 2.6 : 3.3);
    else this.phase = Math.round(this.phase / Math.PI) * Math.PI;
    if (speed > 0.05 && Math.floor(this.phase / Math.PI) !== before) this.onStep?.(run);
  }
}
const _v = new THREE.Vector3();

// ------------------------------------------------------------
// Entities / memory cast: same sheets, ticked with the camera
// ------------------------------------------------------------
const KIND = { other: "other", unmet: "unmet", unsaid: "unsaid", keeper: "keeper", kidR: "kidR", kidA: "kidA", confidante: "confidante", friend: "friend", dancer: "dancer" };
export class SpriteActor extends Character {
  constructor(kind, o = {}) {
    super(KIND[kind] || kind, { scale: o.scale, emissive: o.emissive, color: o.color, shadow: o.shadow });
    this.kind = kind;
    this.flicker = o.flicker || 0;
    this.last = null;
    this.yaw = o.yaw || 0;
    const F = this.D.frames;
    // idle animations
    if (kind === "dancer") this.anim = { group: "anim", fps: 5 };
    if (kind === "unsaid") this.anim = { group: "anim", fps: 3 };
    if (kind === "confidante" && o.sitting) this.anim = { group: "anim", fps: 0.8 };
    if (o.anim) this.anim = o.anim;
  }
  setOpacityFlicker(v) { this.flicker = v; }
  update(dt, cam) {
    // infer walking from movement so scripted moves animate
    const p = this.root.position;
    let spd = 0;
    if (this.last) { spd = Math.hypot(p.x - this.last.x, p.z - this.last.z) / Math.max(dt, 1e-4); if (spd > 0.2) this.yaw = Math.atan2(p.x - this.last.x, p.z - this.last.z); }
    this.last = p.clone();
    super.update(dt, spd > 0.2 ? Math.min(spd, 4) : 0);
    if (this.flicker) this.root.visible = Math.random() > this.flicker;
  }
}

// ------------------------------------------------------------
// Blocky bystander (simplified features / blurred faces)
// ------------------------------------------------------------
const BLOCK = {
  stranger: { skin: "#b08a70", hair: "#2a2420", shirt: [90, 84, 78], pants: [50, 50, 56], shoes: "#202020" },
  strangerB: { skin: "#a07a62", hair: "#1a1410", shirt: [60, 70, 92], pants: [40, 40, 46], shoes: "#202020" },
};
export class Blocky {
  constructor(preset = "stranger") {
    const P = BLOCK[preset] || BLOCK.stranger;
    this.root = new THREE.Group();
    this.yaw = 0;
    const skin = mat({ color: P.skin }), hair = mat({ color: P.hair }), shirt = mat({ map: TEX.cloth(P.shirt) }), pants = mat({ map: TEX.cloth(P.pants) });
    const face = mat({ map: TEX.blurFace() });
    const B = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(boxGeo(w, h, d), m); o.position.set(x, y, z); this.root.add(o); return o; };
    B(0.36, 0.6, 0.24, shirt, 0, 1.3, 0);
    B(0.34, 1.0, 0.22, pants, 0, 0.5, 0);
    const head = new THREE.Mesh(boxGeo(0.22, 0.26, 0.24), [skin, skin, hair, skin, face, hair]);
    head.position.y = 1.78;
    this.root.add(head);
  }
  setPos(x, y, z) { this.root.position.set(x, y, z); return this; }
  face(y) { this.yaw = y; this.root.rotation.y = y; return this; }
  faceToward(x, z) { return this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z)); }
  setVisible(v) { this.root.visible = v; }
  pose() { return this; }
  update() {}
}

// ------------------------------------------------------------
// Keeper of Minutes: the sprite with rotating brass rings behind
// ------------------------------------------------------------
export function makeKeeper(scale = 2.4) {
  const g = new THREE.Group();
  const spr = new SpriteActor("keeper", { scale, emissive: 0.12, shadow: false });
  spr.anim = { group: "anim", fps: 0.7 };
  g.add(spr.root);
  const brass = mat({ color: 0xb08a40, emissive: 0.1 });
  const dark = mat({ color: 0x1a1612 });
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry((2.2 + i * 0.8) * scale * 0.5, 0.08 * scale, 4, 16), i % 2 ? dark : brass);
    r.position.set(0, spr.height * 0.72, -0.6);
    g.add(r);
    rings.push(r);
  }
  return {
    root: g,
    sprite: spr,
    update(dt, cam) {
      spr.update(dt, cam);
      rings.forEach((r, i) => { r.rotation.x += dt * (0.2 + i * 0.13) * (i % 2 ? -1 : 1); r.rotation.y += dt * 0.17 * (i + 1); });
    },
  };
}
