// ============================================================
// Actors
//  · Character — low-poly box rig textured straight from the
//    model sheets (front / profile / back), hand-keyed procedural
//    walk, cutscene poses, blob shadow.
//  · SpriteActor — 1-bit-alpha billboards for the entities and
//    memory cast (front + profile, swapped by viewing angle).
//  · Blocky — the old untextured rig for blurred bystanders.
// ============================================================
import { THREE, mat, boxGeo, TEX } from "./ps1.js";
import { A } from "./assets.js";

const ATLAS = { rufki: "rufki", argjila: "argjila", other: "rufki_blank", doubleR: "rufki_blank", doubleA: "argjila_blank", fakeA: "argjila" };
const RIG = { rufki: "rufki", other: "rufki", doubleR: "rufki", argjila: "argjila", doubleA: "argjila", fakeA: "argjila" };
const matCache = {};
function atlasMat(key, o = {}) {
  const k = key + JSON.stringify(o);
  if (!matCache[k]) matCache[k] = mat({ map: A.tex["chr_" + key], ...o });
  return matCache[k];
}

// assign atlas sub-rects to the 6 faces of a BoxGeometry
// faces: [px, nx, py, ny, pz, nz] → [key, flip]
function texBox(w, h, d, uv, size, faces) {
  const g = new THREE.BoxGeometry(w, h, d);
  const at = g.attributes.uv;
  const iu = 0.5 / size[0], iv = 0.5 / size[1];
  for (let f = 0; f < 6; f++) {
    const [key, flip] = faces[f];
    const r = uv[key];
    if (!r) continue;
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      let u = at.getX(i), v = at.getY(i);
      if (flip) u = 1 - u;
      at.setXY(i, r[0] + iu + u * (r[2] - 2 * iu), r[1] + iv + v * (r[3] - 2 * iv));
    }
  }
  return g;
}

const lerp = (a, b, t) => a + (b - a) * t;

export class Character {
  constructor(preset = "rufki", over = {}) {
    this.preset = preset;
    this.root = new THREE.Group();
    this.phase = 0;
    this.amp = 0;
    this.speed = 0;
    this.lastCos = 1;
    this.onStep = null;
    this.yaw = 0;
    this.look = 0;
    this.lookUp = 0;
    this.t = Math.random() * 10;
    this.poseName = null;
    this.poseK = 0;
    this.early = 0; // doubles: animation phase runs ahead
    const rigName = RIG[preset] || "rufki";
    const R = A.rigs[rigName];
    const P = R.parts, J = R.joints, uv = R.uv, size = R.size;
    const m = atlasMat(ATLAS[preset] || "rufki", over.mat || {});
    this.material = m;
    const S = over.scale || 1;
    const body = (this.body = new THREE.Group());
    body.scale.setScalar(S);
    this.root.add(body);
    const B = (w, h, d, faces) => new THREE.Mesh(texBox(w, h, d, uv, size, faces), m);
    const std = (k, top = "head.t") => [[k + ".s", false], [k + ".s", true], [top, false], [top, false], [k + ".f", false], [k + ".b", false]];

    const hipY = (J.hipL[1] + J.hipR[1]) / 2;
    this.baseHip = hipY;
    const hips = (this.hips = new THREE.Group());
    hips.position.y = hipY;
    body.add(hips);
    const pel = B(P.pelvis.w, P.pelvis.h, P.pelvis.d, std("pelvis", "pelvis.s"));
    pel.position.y = P.pelvis.y + P.pelvis.h / 2 - hipY;
    hips.add(pel);
    const torso = (this.torso = new THREE.Group());
    hips.add(torso);
    const tor = B(P.torso.w, P.torso.h, P.torso.d, std("torso", "torso.s"));
    tor.position.y = P.torso.y + P.torso.h / 2 - hipY;
    torso.add(tor);
    const nk = B(P.neck.w, P.neck.h, P.neck.d, std("neck", "neck.s"));
    nk.position.y = P.head.y - P.neck.h * 0.25 - hipY;
    torso.add(nk);
    const head = (this.head = new THREE.Group());
    head.position.y = P.head.y - hipY;
    torso.add(head);
    const hd = B(P.head.w, P.head.h, P.head.d, std("head"));
    hd.position.y = P.head.h / 2;
    head.add(hd);
    this.headMesh = hd;
    if (P.hair) {
      const hr = B(P.hair.w, P.hair.h, P.hair.d, std("hair"));
      hr.position.set(0, P.head.h - P.hair.h / 2, P.head.d / 2 - 0.014 - P.hair.d / 2);
      head.add(hr);
    }
    const mkArm = (side) => {
      const sj = J["sh" + side];
      const sh = new THREE.Group();
      sh.position.set(sj[0], sj[1] - hipY, 0);
      torso.add(sh);
      // limbs: front/back tiles are per side, the profile tiles are shared
      const lim = (k) => [[k + ".s", false], [k + ".s", true], [k + ".s", false], [k + ".s", false], [k + side + ".f", false], [k + side + ".b", false]];
      const up = B(P.up.w, P.up.h, P.up.d, lim("up"));
      up.position.y = -P.up.h / 2;
      sh.add(up);
      const el = new THREE.Group();
      el.position.y = -P.up.h;
      sh.add(el);
      const fo = B(P.fo.w, P.fo.h, P.fo.d, lim("fo"));
      fo.position.y = -P.fo.h / 2;
      el.add(fo);
      const wr = new THREE.Group();
      wr.position.y = -P.fo.h;
      el.add(wr);
      const hand = B(P.hd.w, P.hd.h, P.hd.d, lim("hd"));
      hand.position.y = -P.hd.h / 2;
      wr.add(hand);
      return { sh, el, wr };
    };
    this.armL = mkArm("L");
    this.armR = mkArm("R");
    const mkLeg = (side) => {
      const hj = J["hip" + side];
      const th = new THREE.Group();
      th.position.set(hj[0], hj[1] - hipY, 0);
      hips.add(th);
      const lim = (k) => [[k + ".s", false], [k + ".s", true], [k + ".s", false], [k + ".s", false], [k + side + ".f", false], [k + side + ".b", false]];
      const t = B(P.th.w, P.th.h, P.th.d, lim("th"));
      t.position.y = -P.th.h / 2;
      th.add(t);
      const kn = new THREE.Group();
      kn.position.y = -P.th.h;
      th.add(kn);
      const s = B(P.sh.w, P.sh.h, P.sh.d, lim("sh"));
      s.position.y = -P.sh.h / 2;
      kn.add(s);
      const an = new THREE.Group();
      an.position.y = -P.sh.h;
      kn.add(an);
      const ankleY = hipY - P.th.h - P.sh.h;
      const ft = B(P.ft.w, P.ft.h, P.ft.d, [["ft.s", false], ["ft.s", true], ["shoe.t", false], ["shoe.t", false], ["ft" + side + ".f", false], ["ft" + side + ".b", false]]);
      ft.position.set(0, -ankleY + P.ft.h / 2 - 0.005, P.ft.d * 0.16);
      an.add(ft);
      return { th, kn, an };
    };
    this.legL = mkLeg("L");
    this.legR = mkLeg("R");
    this.height = R.height * S;
    // blob shadow
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.34, 10), mat({ color: 0x000000, opacity: 0.42, unlit: true, noFog: true }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.015;
    sh.renderOrder = 1;
    this.shadow = sh;
    this.root.add(sh);
    this.root.traverse((o) => { if (o.isMesh) o.userData.actor = this; });
  }

  setPos(x, y, z) { this.root.position.set(x, y, z); return this; }
  face(yaw) { this.yaw = yaw; this.root.rotation.y = yaw; return this; }
  faceToward(x, z) { this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z)); return this; }
  setVisible(v) { this.root.visible = v; }
  pose(name) { this.poseName = name || null; if (!name) this.poseK = Math.min(this.poseK, 1); return this; }

  update(dt, speed = 0, run = false) {
    this.t += dt;
    this.speed = speed;
    const targetAmp = Math.min(1, speed / 2.0) * (run ? 1.0 : 0.62);
    this.amp += (targetAmp - this.amp) * Math.min(1, dt * 8);
    const a = this.amp;
    if (speed > 0.05) this.phase += dt * speed * (run ? 3.3 : 4.4);
    else {
      const k = Math.round(this.phase / Math.PI) * Math.PI;
      this.phase += (k - this.phase) * Math.min(1, dt * 6);
    }
    const p = this.phase + this.early, s = Math.sin(p), c = Math.cos(p);
    this.legL.th.rotation.set(-s * a, 0, 0);
    this.legR.th.rotation.set(s * a, 0, 0);
    this.legL.kn.rotation.x = Math.max(0, c) * a * 1.5;
    this.legR.kn.rotation.x = Math.max(0, -c) * a * 1.5;
    this.legL.an.rotation.x = 0;
    this.legR.an.rotation.x = 0;
    const breathe = Math.sin(this.t * 2.1) * 0.012;
    this.armL.sh.rotation.set(s * a * 0.8, 0, 0.07 + breathe);
    this.armR.sh.rotation.set(-s * a * 0.8, 0, -0.07 - breathe);
    this.armL.el.rotation.set(-0.12 - a * 0.45 - (run ? 0.6 : 0), 0, 0);
    this.armR.el.rotation.set(-0.12 - a * 0.45 - (run ? 0.6 : 0), 0, 0);
    this.armL.wr.rotation.set(0, 0, 0);
    this.armR.wr.rotation.set(0, 0, 0);
    this.hips.position.y = this.baseHip - Math.abs(s) * a * 0.05 + breathe;
    this.hips.position.z = 0;
    this.hips.rotation.set(0, s * a * 0.08, 0);
    this.torso.rotation.set(run ? 0.18 * a : 0.03 * a, -s * a * 0.18, 0);
    this.head.rotation.set(this.lookUp, this.look - this.torso.rotation.y * 0.6, 0);
    // poses blend over the walk
    const want = this.poseName ? 1 : 0;
    this.poseK += (want - this.poseK) * Math.min(1, dt * 6);
    if (this.poseName) this._pn = this.poseName;
    if (this.poseK > 0.01 && this._pn) this.applyPose(this._pn, this.poseK);
    if (speed > 0.05 && Math.sign(c) !== Math.sign(this.lastCos)) this.onStep?.(run);
    this.lastCos = c;
  }

  // target rotations per pose; k blends from the current walk pose
  applyPose(name, k) {
    const L = this.armL, R = this.armR, t = this.t;
    const set = (o, x, y, z) => { o.rotation.x = lerp(o.rotation.x, x, k); o.rotation.y = lerp(o.rotation.y, y, k); o.rotation.z = lerp(o.rotation.z, z, k); };
    const sit = (h = 0.46) => {
      this.hips.position.y = lerp(this.hips.position.y, h, k);
      this.hips.position.z = lerp(this.hips.position.z, -0.12, k);
      set(this.legL.th, -1.45, 0, 0.04); set(this.legR.th, -1.45, 0, -0.04);
      set(this.legL.kn, 1.45, 0, 0); set(this.legR.kn, 1.45, 0, 0);
    };
    switch (name) {
      case "phone": set(R.sh, -0.35, 0, -0.95); set(R.el, -2.3, 0, 0); this.head.rotation.z = lerp(this.head.rotation.z, -0.12, k); break;
      case "phoneL": set(L.sh, -0.35, 0, 0.95); set(L.el, -2.3, 0, 0); break;
      case "reach": set(R.sh, -1.3, 0, 0); set(R.el, -0.1, 0, 0); break;
      case "reachBoth": set(R.sh, -1.25, 0, 0.12); set(L.sh, -1.25, 0, -0.12); set(R.el, -0.15, 0, 0); set(L.el, -0.15, 0, 0); break;
      case "knock": set(R.sh, -1.5, 0, 0.1); set(R.el, -1.0 - Math.max(0, Math.sin(t * 9)) * 0.5, 0, 0); break;
      case "listen": set(this.torso, 0.15, 0, 0.28); set(R.sh, -1.4, 0, 0.2); set(R.el, -0.6, 0, 0); this.head.rotation.z = lerp(this.head.rotation.z, 0.35, k); break;
      case "chain": set(R.sh, -1.45, 0, 0.25); set(R.el, -0.45, 0, 0); set(L.sh, -0.9, 0, -0.15); set(L.el, -1.0, 0, 0); break;
      case "hold": set(R.sh, -0.7, 0, 0.2); set(L.sh, -0.7, 0, -0.2); set(R.el, -1.2, 0, 0); set(L.el, -1.2, 0, 0); this.head.rotation.x = lerp(this.head.rotation.x, 0.35, k); break;
      case "embrace": set(R.sh, -1.15, 0, 0.75); set(L.sh, -1.15, 0, -0.75); set(R.el, -1.25, 0, 0); set(L.el, -1.25, 0, 0); set(this.torso, 0.1, 0, 0); break;
      case "cry": set(R.sh, -1.2, 0, 0.6); set(L.sh, -1.2, 0, -0.6); set(R.el, -1.6, 0, 0); set(L.el, -1.6, 0, 0); set(this.torso, 0.35, 0, 0); this.head.rotation.x = lerp(this.head.rotation.x, 0.45, k); break;
      case "dance": set(R.sh, -0.95, 0, 0.35); set(R.el, -0.9, 0, 0); set(L.sh, -0.75, 0, -0.2); set(L.el, -1.25, 0, 0); set(this.torso, 0.04, Math.sin(t * 1.4) * 0.12, 0); break;
      case "sit": sit(); set(R.sh, -0.5, 0, -0.1); set(L.sh, -0.5, 0, 0.1); set(R.el, -0.6, 0, 0); set(L.el, -0.6, 0, 0); break;
      case "sitDrive": sit(0.42); set(R.sh, -1.1, 0, 0.15); set(L.sh, -1.1, 0, -0.15); set(R.el, -0.5, 0, 0); set(L.el, -0.5, 0, 0); break;
      case "sitMap": sit(0.42); set(R.sh, -0.9, 0, 0.3); set(L.sh, -0.9, 0, -0.3); set(R.el, -1.1, 0, 0); set(L.el, -1.1, 0, 0); this.head.rotation.x = lerp(this.head.rotation.x, 0.3, k); break;
      case "sitPhone": sit(0.42); set(R.sh, -0.35, 0, -0.95); set(R.el, -2.3, 0, 0); set(L.sh, -0.5, 0, 0.1); set(L.el, -0.6, 0, 0); break;
      case "kneel":
        this.hips.position.y = lerp(this.hips.position.y, this.baseHip * 0.55, k);
        set(this.legL.th, -1.5, 0, 0); set(this.legL.kn, 1.55, 0, 0); set(this.legR.th, -0.1, 0, 0); set(this.legR.kn, 1.6, 0, 0);
        set(R.sh, -0.9, 0, 0); set(R.el, -0.4, 0, 0); set(this.torso, 0.25, 0, 0); break;
      case "crouch":
        this.hips.position.y = lerp(this.hips.position.y, this.baseHip * 0.6, k);
        set(this.legL.th, -1.2, 0, 0.1); set(this.legR.th, -1.2, 0, -0.1); set(this.legL.kn, 1.9, 0, 0); set(this.legR.kn, 1.9, 0, 0);
        set(this.torso, 0.5, 0, 0); set(R.sh, -1.0, 0, 0); set(L.sh, -1.0, 0, 0); break;
      case "recoil": set(this.torso, -0.25, 0, 0); set(R.sh, -1.6, 0, 0.5); set(L.sh, -1.6, 0, -0.5); set(R.el, -1.8, 0, 0); set(L.el, -1.8, 0, 0); break;
      case "slump": set(this.torso, 0.45, 0, 0); this.head.rotation.x = lerp(this.head.rotation.x, 0.6, k); break;
      case "point": set(R.sh, -1.5, 0.3, 0); set(R.el, 0, 0, 0); break;
      case "arms": set(R.sh, -0.4, 0, 0.9); set(L.sh, -0.4, 0, -0.9); set(R.el, -1.9, 0, 0); set(L.el, -1.9, 0, 0); break;
      case "sleeve": set(L.sh, -1.3, 0, -0.3); set(L.el, -1.2, 0, 0); set(R.sh, -0.8, 0, 0.6); set(R.el, -1.2, 0, 0); break;
      case "raised": set(L.sh, -2.6, 0, -0.2); set(L.el, -0.2, 0, 0); break;
      case "tpose": set(R.sh, 0, 0, -1.4); set(L.sh, 0, 0, 1.4); set(R.el, 0, 0, 0); set(L.el, 0, 0, 0); break;
    }
  }
}

// ------------------------------------------------------------
// Billboard sprites cut from the creature / cast boards
// ------------------------------------------------------------
const SPR = {
  other: { f: "other_f", s: "other_s", h: 1.8 },
  unmet: { f: "unmet_f", s: "unmet_s", h: 2.15 },
  unsaid: { f: "unsaid_f", s: "unsaid_s", h: 2.9 },
  keeper: { f: "keeper_f", s: "keeper_s", h: 3.6 },
  kidR: { f: "kid_rufki", h: 1.25 },
  kidA: { f: "kid_argjila", h: 1.2 },
  confidante: { f: "confidante", h: 1.68 },
  friend: { f: "friend", h: 1.7 },
  dancer: { f: "dancer", h: 1.72 },
};
export class SpriteActor {
  constructor(kind, o = {}) {
    const D = SPR[kind];
    this.kind = kind;
    this.root = new THREE.Group();
    this.yaw = o.yaw || 0;
    this.t = Math.random() * 10;
    this.sway = o.sway ?? 0.02;
    this.flicker = o.flicker || 0;
    const H = (o.height || D.h) * (o.scale || 1);
    const mk = (key) => {
      const meta = A.sprites[key];
      const w = (H * meta.w) / meta.h;
      const g = new THREE.PlaneGeometry(w, H);
      g.translate(0, H / 2, 0);
      const m = mat({ map: A.tex["spr_" + key], emissive: o.emissive || 0, side: THREE.DoubleSide, color: o.color ?? 0xffffff });
      const mesh = new THREE.Mesh(g, m);
      return mesh;
    };
    this.front = mk(D.f);
    this.side = D.s ? mk(D.s) : null;
    this.pivot = new THREE.Group();
    this.root.add(this.pivot);
    this.pivot.add(this.front);
    if (this.side) { this.pivot.add(this.side); this.side.visible = false; }
    this.height = H;
    if (o.shadow !== false) {
      const sh = new THREE.Mesh(new THREE.CircleGeometry(0.3 * (H / 1.8), 10), mat({ color: 0x000000, opacity: 0.4, unlit: true, noFog: true }));
      sh.rotation.x = -Math.PI / 2;
      sh.position.y = 0.015;
      this.root.add(sh);
    }
  }
  setPos(x, y, z) { this.root.position.set(x, y, z); return this; }
  face(yaw) { this.yaw = yaw; return this; }
  faceToward(x, z) { return this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z)); }
  setVisible(v) { this.root.visible = v; }
  setOpacityFlicker(v) { this.flicker = v; }
  update(dt, cam) {
    this.t += dt;
    const p = this.root.position;
    const toCam = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
    this.pivot.rotation.y = toCam;
    this.pivot.rotation.z = Math.sin(this.t * 1.3) * this.sway;
    if (this.side) {
      let d = toCam - this.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      const sideOn = Math.abs(Math.sin(d)) > 0.72;
      this.front.visible = !sideOn;
      this.side.visible = sideOn;
      // profiles face screen-right on the board: mirror when walking screen-left
      this.side.scale.x = Math.sin(d) > 0 ? -1 : 1;
    }
    if (this.flicker) this.root.visible = Math.random() > this.flicker;
  }
}

// ------------------------------------------------------------
// Blocky bystander (simplified features / blurred faces)
// ------------------------------------------------------------
const BLOCK = {
  stranger: { skin: "#b08a70", hair: "#2a2420", shirt: [90, 84, 78], pants: [50, 50, 56], shoes: "#202020" },
  strangerB: { skin: "#a07a62", hair: "#1a1410", shirt: [60, 70, 92], pants: [40, 40, 46], shoes: "#202020" },
  strangerC: { skin: "#d0a888", hair: "#5a3a26", shirt: [120, 60, 52], pants: [44, 44, 52], shoes: "#202020" },
  childA: { skin: "#d6a888", hair: "#3a2216", shirt: [168, 140, 110], pants: [80, 60, 50], shoes: "#2a1a14", scale: 0.66 },
  childB: { skin: "#c49474", hair: "#1c1410", shirt: [60, 70, 92], pants: [40, 44, 60], shoes: "#202020", scale: 0.68 },
};
export class Blocky {
  constructor(preset = "stranger") {
    const P = BLOCK[preset] || BLOCK.stranger;
    this.root = new THREE.Group();
    this.t = Math.random() * 9;
    this.phase = 0;
    this.yaw = 0;
    const S = P.scale || 1;
    const body = new THREE.Group();
    body.scale.setScalar(S);
    this.root.add(body);
    const skin = mat({ color: P.skin }), hair = mat({ color: P.hair }), shirt = mat({ map: TEX.cloth(P.shirt) }), pants = mat({ map: TEX.cloth(P.pants) }), shoe = mat({ color: P.shoes });
    const face = mat({ map: TEX.blurFace() });
    const B = (w, h, d, m, x, y, z, parent = body) => { const o = new THREE.Mesh(boxGeo(w, h, d), m); o.position.set(x, y, z); parent.add(o); return o; };
    B(0.36, 0.6, 0.24, shirt, 0, 1.3, 0);
    B(0.34, 0.2, 0.22, pants, 0, 0.95, 0);
    const head = new THREE.Mesh(boxGeo(0.22, 0.26, 0.24), [skin, skin, hair, skin, face, hair]);
    head.position.y = 1.78;
    body.add(head);
    B(0.24, 0.07, 0.26, hair, 0, 1.93, 0);
    this.legs = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * 0.1, 0.9, 0); body.add(g); B(0.13, 0.86, 0.15, pants, 0, -0.43, 0, g); B(0.12, 0.07, 0.24, shoe, 0, -0.87, 0.04, g); return g; });
    this.arms = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * 0.24, 1.56, 0); body.add(g); B(0.1, 0.6, 0.11, shirt, 0, -0.3, 0, g); B(0.08, 0.09, 0.09, skin, 0, -0.64, 0, g); return g; });
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.3 * S, 10), mat({ color: 0x000000, opacity: 0.4, unlit: true, noFog: true }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.015;
    this.root.add(sh);
  }
  setPos(x, y, z) { this.root.position.set(x, y, z); return this; }
  face(y) { this.yaw = y; this.root.rotation.y = y; return this; }
  faceToward(x, z) { return this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z)); }
  setVisible(v) { this.root.visible = v; }
  pose() { return this; }
  update(dt, speed = 0) {
    this.t += dt;
    if (speed > 0.05) this.phase += dt * speed * 4.4;
    const s = Math.sin(this.phase) * Math.min(1, speed / 2) * 0.6;
    this.legs[0].rotation.x = -s; this.legs[1].rotation.x = s;
    this.arms[0].rotation.x = s; this.arms[1].rotation.x = -s;
  }
}

// ------------------------------------------------------------
// Keeper of Minutes: the sprite with rotating brass rings behind
// ------------------------------------------------------------
export function makeKeeper(scale = 2.4) {
  const g = new THREE.Group();
  const spr = new SpriteActor("keeper", { scale, emissive: 0.12, sway: 0.03, shadow: false });
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
