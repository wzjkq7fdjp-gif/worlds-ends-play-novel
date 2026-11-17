// ============================================================
// Low-poly characters with a hand-keyed procedural walk cycle
// (two-bone legs, swinging arms, hip bob, torso counter-twist).
// ============================================================
import { THREE, mat, boxGeo, TEX } from "./ps1.js";
const matBase = mat;

const PRESETS = {
  rufki: { skin: "#c49474", hair: "#1c1410", shirt: [44, 48, 58], pants: [34, 36, 44], shoes: "#151515", jacket: true },
  argjila: { skin: "#d6a888", hair: "#3a2216", shirt: [168, 150, 130], pants: [40, 38, 48], shoes: "#2a1a14", longHair: true, coat: true },
  other: { skin: "#b89a86", hair: "#1c1410", shirt: [44, 48, 58], pants: [34, 36, 44], shoes: "#151515", jacket: true, face: "blank" },
  unmet: { skin: "#cfcfc8", hair: "#cfcfc8", shirt: [196, 196, 188], pants: [180, 180, 172], shoes: "#bbbbb0", face: "blank", tall: 1.18, thin: 0.8, emissive: 0.32 },
  stranger: { skin: "#b08a70", hair: "#2a2420", shirt: [90, 84, 78], pants: [50, 50, 56], shoes: "#202020", face: "blur" },
  kidR: { skin: "#c49474", hair: "#1c1410", shirt: [60, 90, 140], pants: [50, 56, 80], shoes: "#202020", scale: 0.62 },
  kidA: { skin: "#d6a888", hair: "#3a2216", shirt: [170, 70, 80], pants: [60, 50, 70], shoes: "#2a1a14", longHair: true, scale: 0.6 },
};

export class Character {
  constructor(preset = "rufki", over = {}) {
    const P = { ...(typeof preset === "string" ? PRESETS[preset] : preset), ...over };
    this.P = P;
    this.root = new THREE.Group();
    this.phase = 0;
    this.amp = 0;
    this.speed = 0;
    this.lastCos = 1;
    this.onStep = null;
    this.yaw = 0;
    this.look = 0;
    this.t = Math.random() * 10;
    const S = P.scale || 1, T = P.tall || 1, W = P.thin || 1;
    const mat = (o) => matBase({ ...o, emissive: P.emissive || 0 });
    const skin = mat({ color: P.skin });
    const hair = mat({ color: P.hair });
    const shirtM = mat({ map: TEX.cloth(P.shirt) });
    const pantsM = mat({ map: TEX.cloth(P.pants) });
    const shoeM = mat({ color: P.shoes });
    let faceM;
    if (P.face === "blank") faceM = mat({ color: P.skin });
    else if (P.face === "blur") faceM = mat({ map: TEX.blurFace() });
    else faceM = mat({ map: TEX.face(P.skin, P.hair, true) });
    const B = (w, h, d, m) => new THREE.Mesh(boxGeo(w * W, h, d * W), m);

    const body = (this.body = new THREE.Group());
    body.scale.set(S, S * T, S);
    this.root.add(body);
    const hips = (this.hips = new THREE.Group());
    hips.position.y = 0.94;
    body.add(hips);
    const pelvis = B(0.34, 0.18, 0.2, pantsM);
    pelvis.position.y = 0.02;
    hips.add(pelvis);
    // torso
    const torso = (this.torso = new THREE.Group());
    hips.add(torso);
    const chest = B(0.4, 0.54, 0.24, shirtM);
    chest.position.y = 0.33;
    torso.add(chest);
    if (P.jacket || P.coat) {
      const jk = B(0.43, P.coat ? 0.7 : 0.4, 0.26, mat({ map: TEX.cloth(P.coat ? [120, 100, 84] : [26, 28, 34]) }));
      jk.position.y = P.coat ? 0.25 : 0.42;
      torso.add(jk);
    }
    // head
    const head = (this.head = new THREE.Group());
    head.position.y = 0.68;
    torso.add(head);
    const neck = B(0.1, 0.08, 0.1, skin);
    neck.position.y = 0.0;
    head.add(neck);
    const skull = new THREE.Mesh(boxGeo(0.22, 0.26, 0.24), [skin, skin, hair, skin, faceM, hair]);
    skull.position.y = 0.17;
    head.add(skull);
    const hairTop = B(0.24, 0.07, 0.26, hair);
    hairTop.position.y = 0.31;
    head.add(hairTop);
    if (P.longHair) {
      const hb = B(0.25, 0.36, 0.08, hair);
      hb.position.set(0, 0.1, -0.13);
      head.add(hb);
    }
    // arms
    const mkArm = (side) => {
      const sh = new THREE.Group();
      sh.position.set(side * 0.27 * W, 0.56, 0);
      torso.add(sh);
      const up = B(0.11, 0.32, 0.12, P.jacket ? mat({ map: TEX.cloth([26, 28, 34]) }) : P.coat ? mat({ map: TEX.cloth([120, 100, 84]) }) : shirtM);
      up.position.y = -0.16;
      sh.add(up);
      const el = new THREE.Group();
      el.position.y = -0.32;
      sh.add(el);
      const fo = B(0.1, 0.28, 0.11, P.jacket ? mat({ map: TEX.cloth([26, 28, 34]) }) : P.coat ? mat({ map: TEX.cloth([120, 100, 84]) }) : shirtM);
      fo.position.y = -0.14;
      el.add(fo);
      const hand = B(0.08, 0.09, 0.09, skin);
      hand.position.y = -0.32;
      el.add(hand);
      return { sh, el };
    };
    this.armL = mkArm(1);
    this.armR = mkArm(-1);
    // legs
    const mkLeg = (side) => {
      const th = new THREE.Group();
      th.position.set(side * 0.1 * W, -0.02, 0);
      hips.add(th);
      const t = B(0.14, 0.45, 0.16, pantsM);
      t.position.y = -0.22;
      th.add(t);
      const kn = new THREE.Group();
      kn.position.y = -0.45;
      th.add(kn);
      const s = B(0.12, 0.43, 0.14, pantsM);
      s.position.y = -0.21;
      kn.add(s);
      const ft = B(0.12, 0.07, 0.24, shoeM);
      ft.position.set(0, -0.44, 0.04);
      kn.add(ft);
      return { th, kn };
    };
    this.legL = mkLeg(1);
    this.legR = mkLeg(-1);
    this.baseHip = 0.94;
    this.root.traverse((o) => { if (o.isMesh) o.userData.actor = this; });
  }

  setPos(x, y, z) { this.root.position.set(x, y, z); return this; }
  face(yaw) { this.yaw = yaw; this.root.rotation.y = yaw; return this; }
  faceToward(x, z) { this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z)); return this; }

  // speed in m/s along the ground; run toggles a deeper stride
  update(dt, speed = 0, run = false) {
    this.t += dt;
    this.speed = speed;
    const targetAmp = Math.min(1, speed / 2.0) * (run ? 1.0 : 0.62);
    this.amp += (targetAmp - this.amp) * Math.min(1, dt * 8);
    const a = this.amp;
    if (speed > 0.05) this.phase += dt * speed * (run ? 3.3 : 4.4);
    else {
      // settle the stride gracefully back to neutral
      const k = Math.round(this.phase / Math.PI) * Math.PI;
      this.phase += (k - this.phase) * Math.min(1, dt * 6);
    }
    const p = this.phase, s = Math.sin(p), c = Math.cos(p);
    this.legL.th.rotation.x = -s * a;
    this.legR.th.rotation.x = s * a;
    this.legL.kn.rotation.x = Math.max(0, c) * a * 1.5;
    this.legR.kn.rotation.x = Math.max(0, -c) * a * 1.5;
    const breathe = Math.sin(this.t * 2.1) * 0.012;
    this.armL.sh.rotation.x = s * a * 0.9;
    this.armR.sh.rotation.x = -s * a * 0.9;
    this.armL.sh.rotation.z = 0.06 + breathe;
    this.armR.sh.rotation.z = -0.06 - breathe;
    this.armL.el.rotation.x = -0.15 - a * 0.5 - (run ? 0.6 : 0);
    this.armR.el.rotation.x = -0.15 - a * 0.5 - (run ? 0.6 : 0);
    this.hips.position.y = this.baseHip - Math.abs(s) * a * 0.06 + breathe;
    this.hips.rotation.y = s * a * 0.08;
    this.torso.rotation.y = -s * a * 0.2;
    this.torso.rotation.x = run ? 0.18 * a : 0.03 * a;
    this.head.rotation.y = this.look - this.torso.rotation.y * 0.6;
    // footstep at each contact (sign change of cos)
    if (speed > 0.05 && Math.sign(c) !== Math.sign(this.lastCos)) this.onStep?.(run);
    this.lastCos = c;
  }
  setVisible(v) { this.root.visible = v; }
  pose(name) {
    // simple static poses for cutscenes
    if (name === "reach") { this.armR.sh.rotation.x = -1.3; this.armR.el.rotation.x = -0.1; }
    if (name === "phone") { this.armR.sh.rotation.x = -0.4; this.armR.sh.rotation.z = -0.9; this.armR.el.rotation.x = -2.2; }
  }
}

// The Unsaid: tall, unnaturally thin, cords and clock hands.
export function makeUnsaid() {
  const g = new THREE.Group();
  const dark = mat({ color: 0x15151a });
  const cord = mat({ color: 0x0a0a0a });
  const photo = mat({ map: TEX.blurFace() });
  const metal = mat({ color: 0xa89a70 });
  const body = new THREE.Mesh(boxGeo(0.22, 2.0, 0.16), dark);
  body.position.y = 1.6;
  g.add(body);
  const head = new THREE.Mesh(boxGeo(0.3, 0.42, 0.2), [dark, dark, dark, dark, photo, dark]);
  head.position.y = 2.82;
  g.add(head);
  const legs = [];
  for (const s of [-1, 1]) {
    const l = new THREE.Mesh(boxGeo(0.07, 1.4, 0.07), dark);
    l.position.set(s * 0.08, 0.7, 0);
    g.add(l);
    legs.push(l);
  }
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group();
    a.position.set(s * 0.16, 2.5, 0);
    const m = new THREE.Mesh(boxGeo(0.05, 1.9, 0.05), dark);
    m.position.y = -0.95;
    a.add(m);
    const hand = new THREE.Mesh(boxGeo(0.02, 0.5, 0.03), metal);
    hand.position.y = -2.0;
    a.add(hand);
    g.add(a);
    arms.push(a);
  }
  const cords = [];
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Mesh(boxGeo(0.02, 0.9 + Math.random() * 0.9, 0.02), cord);
    c.position.set((Math.random() - 0.5) * 0.4, 1.6 + Math.random() * 1.0, (Math.random() - 0.5) * 0.3);
    c.rotation.z = (Math.random() - 0.5) * 0.9;
    g.add(c);
    cords.push(c);
  }
  let t = 0;
  return {
    root: g,
    update(dt, speed = 0) {
      t += dt;
      arms[0].rotation.z = 0.15 + Math.sin(t * 1.3) * 0.08;
      arms[1].rotation.z = -0.15 - Math.sin(t * 1.1) * 0.08;
      arms[0].rotation.x = Math.sin(t * 0.7) * 0.2;
      arms[1].rotation.x = Math.cos(t * 0.8) * 0.2;
      head.rotation.z = Math.sin(t * 2.7) * 0.15 + (Math.random() < 0.03 ? (Math.random() - 0.5) * 0.8 : 0);
      legs[0].rotation.x = Math.sin(t * speed * 3) * 0.3;
      legs[1].rotation.x = -Math.sin(t * speed * 3) * 0.3;
      cords.forEach((c, i) => (c.rotation.x = Math.sin(t * 1.5 + i) * 0.25));
    },
  };
}

// The Keeper of Minutes: a giant of interlocking clock rings.
export function makeKeeper() {
  const g = new THREE.Group();
  const brass = mat({ color: 0xb08a40 });
  const dark = mat({ color: 0x1a1612 });
  const face = mat({ map: TEX.clockFace("4:04"), emissive: 0.3 });
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * 0.7, 0.12, 4, 14), i % 2 ? dark : brass);
    r.position.y = 6;
    g.add(r);
    rings.push(r);
  }
  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.0, 16), face);
  disc.position.set(0, 6, 0.05);
  g.add(disc);
  const discB = new THREE.Mesh(new THREE.CircleGeometry(2.0, 16), dark);
  discB.position.set(0, 6, -0.05);
  discB.rotation.y = Math.PI;
  g.add(discB);
  const body = new THREE.Mesh(boxGeo(1.6, 4.4, 1.0), dark);
  body.position.y = 2.2;
  g.add(body);
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group();
    a.position.set(s * 1.2, 4.2, 0);
    for (let k = 0; k < 3; k++) {
      const seg = new THREE.Mesh(boxGeo(0.35, 1.3, 0.35), k % 2 ? brass : dark);
      seg.position.y = -0.65 - k * 1.25;
      seg.rotation.z = s * 0.12 * k;
      a.add(seg);
    }
    g.add(a);
    arms.push(a);
  }
  const gears = [];
  for (let i = 0; i < 6; i++) {
    const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.5 + Math.random() * 0.5, 0.5, 0.2, 8), brass);
    gr.rotation.x = Math.PI / 2;
    gr.position.set((Math.random() - 0.5) * 2.2, 0.8 + Math.random() * 3.6, 0.55);
    g.add(gr);
    gears.push(gr);
  }
  let t = 0;
  return {
    root: g,
    update(dt) {
      t += dt;
      rings.forEach((r, i) => { r.rotation.x = t * (0.2 + i * 0.13) * (i % 2 ? -1 : 1); r.rotation.y = t * 0.17 * (i + 1); });
      gears.forEach((gr, i) => (gr.rotation.y = t * (i % 2 ? 1.2 : -0.9)));
      arms[0].rotation.z = 0.25 + Math.sin(t * 0.6) * 0.12;
      arms[1].rotation.z = -0.25 - Math.sin(t * 0.5) * 0.12;
      g.position.y = Math.sin(t * 0.8) * 0.15;
    },
  };
}
