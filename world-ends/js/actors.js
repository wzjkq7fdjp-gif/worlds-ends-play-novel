// ============================================================
// WORLD ENDS — cast, Eidolons, Khethari, the Ark, portraits.
// Low-poly anime silhouettes on a two-bone rig with a procedural
// walk cycle plus combat poses (slash, guard, hit, kneel, conduct).
// ============================================================
import { THREE, mat as matBase, boxGeo, TEX, canvasTex } from "./ps1.js";
// scale a material's tint relative to the colour it was built with
export function glowK(m, k) {
  const u = m.material.uniforms.uColor.value;
  if (!m.userData.base) m.userData.base = u.clone();
  u.copy(m.userData.base).multiplyScalar(k);
}

const cloth = (rgb) => TEX.cloth(rgb);
export const CAST = {
  kaien: { name: "KAIEN", skin: "#d2a07e", hair: "#15121a", hairStyle: "spiky", shirt: [30, 34, 48], pants: [26, 28, 36], shoes: "#111", jacket: [32, 40, 66], asym: [150, 30, 36], sheath: true, weapon: "katana", eye: "#3a2a20", core: 0x60c0ff },
  aria: { name: "ARIA", skin: "#e0b090", hair: "#5a3020", hairStyle: "long", shirt: [150, 160, 176], pants: [60, 66, 80], shoes: "#222", jacket: [116, 126, 146], headset: true, eye: "#4a3020" },
  renji: { name: "RENJI", skin: "#c08a6a", hair: "#202020", hairStyle: "short", shirt: [60, 64, 70], pants: [44, 46, 52], shoes: "#111", armor: [96, 100, 108], broad: 1.18, weapon: "katana", core: 0x60ff90 },
  raizen: { name: "RAIZEN", skin: "#d0a080", hair: "#8a2a18", hairStyle: "spiky", shirt: [90, 30, 30], pants: [36, 30, 30], shoes: "#111", bracers: 0xb060ff, weapon: "katana", core: 0xb060ff },
  shion: { name: "SHION", skin: "#dab49a", hair: "#a8b8d0", hairStyle: "bob", shirt: [200, 204, 214], pants: [50, 54, 70], shoes: "#222", coat: [210, 214, 222], glasses: true, core: 0x80f0ff },
  kyo: { name: "KYO", skin: "#dab49a", hair: "#a8b8d0", hairStyle: "spiky", shirt: [40, 42, 50], pants: [50, 54, 70], shoes: "#222", jacket: [190, 110, 40], core: 0xffb050 },
  daigo: { name: "DAIGO", skin: "#b88a6a", hair: "#8a8a8a", hairStyle: "slick", shirt: [70, 78, 56], pants: [56, 62, 46], shoes: "#111", coat: [74, 82, 58], tall: 1.04 },
  miyu: { name: "MIYU", skin: "#e4b898", hair: "#2a1a14", hairStyle: "bob", shirt: [200, 190, 170], pants: [80, 70, 90], shoes: "#3a2a20", scarf: 0xb02028, scale: 0.6 },
  requiem: { name: "REQUIEM", skin: "#d8b098", hair: "#101016", hairStyle: "long", shirt: [16, 16, 20], pants: [16, 16, 20], shoes: "#0a0a0a", belt: 0xd0d4dc, weapon: "curved", thin: 0.92 },
  vael: { name: "VAEL", skin: "#e8d4cc", hair: "#f2f2f6", hairStyle: "long", shirt: [12, 12, 16], pants: [12, 12, 16], shoes: "#050505", coat: [14, 14, 20], weapon: "curved", eye: "#3aa8ff", tall: 1.07, thin: 0.95, emissive: 0.08 },
  mother: { name: "MIYU'S MOTHER", skin: "#d8b098", hair: "#2a1a14", hairStyle: "long", shirt: [120, 110, 100], pants: [70, 64, 60], shoes: "#222" },
  scientist: { name: "RESEARCHER", skin: "#d0a888", hair: "#3a3030", hairStyle: "short", shirt: [220, 220, 220], pants: [60, 60, 70], shoes: "#222", coat: [226, 226, 230] },
  soldier: { name: "SOLDIER", skin: "#c09070", hair: "#1a1a1a", hairStyle: "short", shirt: [70, 78, 56], pants: [60, 66, 50], shoes: "#111", armor: [70, 78, 60] },
  civilian: { name: "CIVILIAN", skin: "#c8a080", hair: "#3a2a20", hairStyle: "short", shirt: [110, 90, 80], pants: [50, 50, 60], shoes: "#222" },
  captive: { name: "CAPTIVE", skin: "#a89890", hair: "#2a2420", hairStyle: "short", shirt: [80, 80, 86], pants: [50, 50, 56], shoes: "#222", emissive: 0.05 },
};
// Eidolon frames: same rig, armoured proportions.
export const FRAMES = {
  kaien: { mech: true, plate: [70, 82, 118], trim: [150, 36, 44], core: 0x60c0ff, weapon: "katana" },
  renji: { mech: true, plate: [96, 100, 104], trim: [60, 160, 90], core: 0x60ff90, weapon: "katana", broad: 1.25 },
  raizen: { mech: true, plate: [110, 40, 40], trim: [150, 90, 220], core: 0xb060ff, weapon: "katana" },
  shion: { mech: true, plate: [190, 196, 206], trim: [80, 200, 230], core: 0x80f0ff, weapon: "katana" },
  kyo: { mech: true, plate: [60, 60, 70], trim: [220, 140, 50], core: 0xffb050, weapon: "katana" },
};

export class Character {
  constructor(id = "kaien", over = {}) {
    const P = { ...(typeof id === "string" ? CAST[id] || FRAMES[id] : id), ...over };
    this.P = P;
    this.id = typeof id === "string" ? id : "custom";
    this.root = new THREE.Group();
    this.phase = 0; this.amp = 0; this.lastCos = 1; this.t = Math.random() * 9;
    this.yaw = 0; this.look = 0;
    this.act = null; // { kind, t, dur }
    this.pose = null; // persistent pose: "guard" | "kneel" | "down" | "conduct" | "sit"
    const M = P.mech;
    const S = (P.scale || 1) * (M ? 2.5 : 1), T = P.tall || 1, W = (P.thin || 1) * (P.broad || 1);
    const em = P.emissive || 0;
    const mat = (o) => matBase({ ...o, emissive: (o.emissive || 0) + em });
    const B = (w, h, d, m) => new THREE.Mesh(boxGeo(w, h, d, 0.5, 0.5), m);
    let skin, hair, shirtM, pantsM, shoeM, faceM, jackM, sleeveM;
    if (M) {
      const plate = mat({ map: TEX.metal(), color: new THREE.Color(...P.plate.map((v) => v / 110)) });
      const trim = mat({ color: new THREE.Color(...P.trim.map((v) => v / 255)) });
      skin = plate; hair = trim; shirtM = plate; pantsM = mat({ map: TEX.metal(), color: new THREE.Color(...P.plate.map((v) => v / 150)) });
      shoeM = mat({ color: 0x1a1c22 }); jackM = plate; sleeveM = trim;
      faceM = mat({ map: TEX.text("", { w: 8, h: 8, bg: "#101418", fg: "#101418" }) });
      this.trim = trim;
    } else {
      skin = mat({ color: P.skin });
      hair = mat({ color: P.hair });
      shirtM = mat({ map: cloth(P.shirt) });
      pantsM = mat({ map: cloth(P.pants) });
      shoeM = mat({ color: P.shoes });
      faceM = mat({ map: animeFace(P) });
      jackM = P.jacket ? mat({ map: cloth(P.jacket) }) : P.coat ? mat({ map: cloth(P.coat) }) : shirtM;
      sleeveM = jackM;
    }
    this.mats = { skin, hair, shirtM, jackM };
    const body = (this.body = new THREE.Group());
    body.scale.set(S, S * T, S);
    this.root.add(body);
    const hips = (this.hips = new THREE.Group());
    hips.position.y = 0.94;
    body.add(hips);
    const pelvis = B(0.34 * W, 0.18, 0.2, pantsM); pelvis.position.y = 0.02; hips.add(pelvis);
    if (P.belt) { const b = B(0.36 * W, 0.05, 0.22, mat({ color: P.belt, emissive: 0.3 })); b.position.y = 0.1; hips.add(b); }
    const torso = (this.torso = new THREE.Group());
    hips.add(torso);
    const chest = B((M ? 0.5 : 0.4) * W, M ? 0.6 : 0.54, M ? 0.34 : 0.24, M ? jackM : shirtM);
    chest.position.y = 0.33; torso.add(chest);
    if (M) {
      // armoured chest, glowing Aetherheart core and shoulder plates
      const core = new THREE.Mesh(boxGeo(0.16, 0.16, 0.06), mat({ color: P.core, unlit: true }));
      core.position.set(0, 0.42, 0.18); torso.add(core); this.core = core;
      const collar = B(0.36 * W, 0.12, 0.3, sleeveM); collar.position.y = 0.62; torso.add(collar);
      for (const s of [-1, 1]) { const pa = B(0.26, 0.2, 0.36, jackM); pa.position.set(s * 0.33 * W, 0.6, 0); torso.add(pa); const st = B(0.27, 0.05, 0.37, sleeveM); st.position.set(s * 0.33 * W, 0.71, 0); torso.add(st); }
      const back = B(0.36, 0.42, 0.14, pantsM); back.position.set(0, 0.36, -0.22); torso.add(back);
    } else if (P.jacket || P.coat) {
      const jk = B(0.43 * W, P.coat ? 0.78 : 0.42, 0.26, jackM); jk.position.y = P.coat ? 0.22 : 0.42; torso.add(jk);
      if (P.coat) { const tail = B(0.42 * W, 0.4, 0.04, jackM); tail.position.set(0, -0.3, -0.12); torso.add(tail); this.coatTail = tail; }
    }
    if (P.armor && !M) {
      const am = mat({ map: TEX.metal(), color: new THREE.Color(...P.armor.map((v) => v / 110)) });
      const pl = B(0.46 * W, 0.34, 0.3, am); pl.position.y = 0.44; torso.add(pl);
      for (const s of [-1, 1]) { const pa = B(0.2, 0.12, 0.26, am); pa.position.set(s * 0.28 * W, 0.6, 0); torso.add(pa); }
    }
    if (P.scarf) {
      const sm = mat({ color: P.scarf });
      const sc = B(0.3, 0.1, 0.28, sm); sc.position.y = 0.62; torso.add(sc);
      const tl = B(0.1, 0.3, 0.04, sm); tl.position.set(0.08, 0.46, 0.15); torso.add(tl); this.scarfTail = tl;
    }
    if (P.sheath) {
      const sh = B(0.05, 1.0, 0.06, mat({ color: 0x1a1210 })); sh.position.set(0.05, 0.3, -0.16); sh.rotation.z = 0.7; torso.add(sh); this.sheath = sh;
    }
    // head
    const head = (this.head = new THREE.Group());
    head.position.y = M ? 0.7 : 0.66; torso.add(head);
    if (M) {
      const h = B(0.24, 0.24, 0.26, jackM); h.position.y = 0.12; head.add(h);
      const visor = new THREE.Mesh(boxGeo(0.2, 0.05, 0.04), mat({ color: P.core, unlit: true })); visor.position.set(0, 0.14, 0.13); head.add(visor);
      const crest = B(0.04, 0.12, 0.2, sleeveM); crest.position.set(0, 0.3, 0); head.add(crest);
      for (const s of [-1, 1]) { const ant = B(0.03, 0.18, 0.03, sleeveM); ant.position.set(s * 0.13, 0.28, -0.02); ant.rotation.z = -s * 0.5; head.add(ant); }
    } else {
      const neck = B(0.1, 0.08, 0.1, skin); head.add(neck);
      const skull = new THREE.Mesh(boxGeo(0.22, 0.25, 0.23, 0.5, 0.5), [skin, skin, hair, skin, faceM, hair]);
      skull.position.y = 0.17; head.add(skull);
      buildHair(head, P, hair, B);
      if (P.headset) {
        const hm = mat({ color: 0x222226 });
        const band = B(0.26, 0.04, 0.05, hm); band.position.y = 0.33; head.add(band);
        const cup = B(0.05, 0.1, 0.1, hm); cup.position.set(0.13, 0.17, 0); head.add(cup);
        const mic = B(0.02, 0.02, 0.14, hm); mic.position.set(0.12, 0.1, 0.1); head.add(mic);
      }
      if (P.glasses) { const g = B(0.2, 0.03, 0.02, mat({ color: 0x9ad0ff, emissive: 0.4 })); g.position.set(0, 0.2, 0.12); head.add(g); }
    }
    // arms
    const mkArm = (side) => {
      const sh = new THREE.Group(); sh.position.set(side * (M ? 0.34 : 0.27) * W, 0.56, 0); torso.add(sh);
      const upM = P.asym && side < 0 ? mat({ map: cloth(P.asym) }) : M ? jackM : sleeveM;
      const up = B(M ? 0.16 : 0.11, 0.32, M ? 0.17 : 0.12, upM); up.position.y = -0.16; sh.add(up);
      const el = new THREE.Group(); el.position.y = -0.32; sh.add(el);
      const fo = B(M ? 0.17 : 0.1, 0.28, M ? 0.17 : 0.11, P.asym && side < 0 ? upM : sleeveM); fo.position.y = -0.14; el.add(fo);
      if (P.bracers) { const br = B(0.13, 0.12, 0.13, mat({ color: P.bracers, emissive: 0.6 })); br.position.y = -0.2; el.add(br); }
      const hand = B(M ? 0.12 : 0.08, 0.09, M ? 0.12 : 0.09, M ? shoeM : skin); hand.position.y = -0.32; el.add(hand);
      return { sh, el, hand };
    };
    this.armL = mkArm(1);
    this.armR = mkArm(-1);
    if (P.weapon) this.setWeapon(P.weapon, mat);
    const mkLeg = (side) => {
      const th = new THREE.Group(); th.position.set(side * (M ? 0.13 : 0.1) * W, -0.02, 0); hips.add(th);
      const t = B(M ? 0.2 : 0.14, 0.45, M ? 0.22 : 0.16, pantsM); t.position.y = -0.22; th.add(t);
      const kn = new THREE.Group(); kn.position.y = -0.45; th.add(kn);
      const s = B(M ? 0.2 : 0.12, 0.43, M ? 0.22 : 0.14, M ? jackM : pantsM); s.position.y = -0.21; kn.add(s);
      if (M) { const kp = B(0.22, 0.12, 0.08, sleeveM); kp.position.set(0, 0, 0.12); kn.add(kp); }
      const ft = B(M ? 0.2 : 0.12, M ? 0.1 : 0.07, M ? 0.32 : 0.24, shoeM); ft.position.set(0, -0.44, 0.04); kn.add(ft);
      return { th, kn };
    };
    this.legL = mkLeg(1);
    this.legR = mkLeg(-1);
    this.baseHip = 0.94;
    this.height = 1.9 * S * T;
  }
  setWeapon(kind, mat = matBase) {
    if (this.weapon) this.weapon.removeFromParent();
    if (!kind) { this.weapon = null; return; }
    const g = new THREE.Group();
    const steel = mat({ color: kind === "curved" ? 0xd8dce8 : 0xc8ccd8, emissive: 0.25 });
    const hilt = new THREE.Mesh(boxGeo(0.04, 0.18, 0.04), mat({ color: 0x201410 })); hilt.position.y = 0.02; g.add(hilt);
    const guard = new THREE.Mesh(boxGeo(0.1, 0.02, 0.08), mat({ color: 0x806020 })); guard.position.y = -0.08; g.add(guard);
    const segs = kind === "curved" ? 4 : 3;
    for (let i = 0; i < segs; i++) {
      const b = new THREE.Mesh(boxGeo(0.025, 0.28, 0.05), steel);
      b.position.set(0, -0.2 - i * 0.26, kind === "curved" ? i * i * 0.025 : i * 0.012);
      b.rotation.x = kind === "curved" ? -i * 0.12 : -0.03;
      g.add(b);
    }
    g.position.y = -0.34;
    g.rotation.x = -1.35;
    this.armR.el.add(g);
    this.weapon = g;
  }
  setPos(x, y, z) { this.root.position.set(x, y, z); return this; }
  face(yaw) { this.yaw = yaw; this.root.rotation.y = yaw; return this; }
  faceToward(x, z) { return this.face(Math.atan2(x - this.root.position.x, z - this.root.position.z)); }
  setVisible(v) { this.root.visible = v; }
  // one-shot actions
  play(kind, dur) {
    const D = { slash: 0.38, slash2: 0.36, slash3: 0.55, heavy: 0.7, hit: 0.35, cast: 0.8, dash: 0.3, point: 1.2, nod: 0.6 };
    this.act = { kind, t: 0, dur: dur || D[kind] || 0.5 };
  }
  update(dt, speed = 0, run = false) {
    this.t += dt;
    const targetAmp = this.pose ? 0 : Math.min(1, speed / (this.P.mech ? 5 : 2.0)) * (run ? 1.0 : 0.62);
    this.amp += (targetAmp - this.amp) * Math.min(1, dt * 8);
    const a = this.amp;
    const mechK = this.P.mech ? 0.4 : 1;
    if (speed > 0.05) this.phase += dt * speed * (run ? 3.3 : 4.4) * mechK;
    else { const k = Math.round(this.phase / Math.PI) * Math.PI; this.phase += (k - this.phase) * Math.min(1, dt * 6); }
    const p = this.phase, s = Math.sin(p), c = Math.cos(p);
    const L = this.legL, R = this.legR, AL = this.armL, AR = this.armR;
    L.th.rotation.set(-s * a, 0, 0); R.th.rotation.set(s * a, 0, 0);
    L.kn.rotation.x = Math.max(0, c) * a * 1.5; R.kn.rotation.x = Math.max(0, -c) * a * 1.5;
    const br = Math.sin(this.t * 2.1) * 0.012;
    AL.sh.rotation.set(s * a * 0.9, 0, 0.06 + br); AR.sh.rotation.set(-s * a * 0.9, 0, -0.06 - br);
    AL.el.rotation.set(-0.15 - a * 0.5 - (run ? 0.6 : 0), 0, 0); AR.el.rotation.set(-0.15 - a * 0.5 - (run ? 0.6 : 0), 0, 0);
    this.hips.position.y = this.baseHip - Math.abs(s) * a * 0.06 + br;
    this.hips.position.z = 0;
    this.hips.rotation.set(0, s * a * 0.08, 0);
    this.torso.rotation.set(run ? 0.18 * a : 0.03 * a, -s * a * 0.2, 0);
    this.head.rotation.set(0, this.look - this.torso.rotation.y * 0.6, 0);
    if (this.scarfTail) this.scarfTail.rotation.x = 0.3 + Math.sin(this.t * 3) * 0.15 + a * 0.5;
    if (this.coatTail) this.coatTail.rotation.x = 0.1 + a * 0.4;
    if (this.core) glowK(this.core, 0.75 + Math.sin(this.t * 4) * 0.25);
    // persistent poses
    if (this.pose === "guard") {
      AR.sh.rotation.set(-1.25, 0.5, -0.5); AR.el.rotation.set(-0.6, 0, 0);
      AL.sh.rotation.set(-1.1, -0.3, 0.4); AL.el.rotation.set(-0.9, 0, 0);
      this.torso.rotation.y = -0.25;
    } else if (this.pose === "kneel" || this.pose === "down") {
      this.hips.position.y = this.baseHip - 0.48;
      L.th.rotation.x = -1.5; L.kn.rotation.x = 1.5; R.th.rotation.x = 0.2; R.kn.rotation.x = 2.2;
      this.torso.rotation.x = this.pose === "down" ? 0.7 : 0.25;
      this.head.rotation.x = this.pose === "down" ? 0.4 : 0.15;
      AL.sh.rotation.x = -0.3; AR.sh.rotation.x = this.pose === "down" ? 0.2 : -0.4;
    } else if (this.pose === "lie") {
      this.hips.position.y = 0.12; this.hips.rotation.x = -1.45;
      L.th.rotation.x = 0; R.th.rotation.x = 0.1; L.kn.rotation.x = 0; R.kn.rotation.x = 0.2;
      AL.sh.rotation.set(0.2, 0, 0.3); AR.sh.rotation.set(0.1, 0, -0.4);
    } else if (this.pose === "sit") {
      this.hips.position.y = 0.5; L.th.rotation.x = R.th.rotation.x = -1.5; L.kn.rotation.x = R.kn.rotation.x = 1.5;
    } else if (this.pose === "conduct") {
      AR.sh.rotation.set(-1.75, 0, -0.1); AR.el.rotation.set(-0.15, 0, 0);
    } else if (this.pose === "arms") {
      AL.sh.rotation.set(-0.5, 0, 1.2); AR.sh.rotation.set(-0.5, 0, -1.2);
    } else if (this.pose === "hold") {
      AL.sh.rotation.set(-1.0, 0, -0.3); AR.sh.rotation.set(-1.0, 0, 0.3); AL.el.rotation.x = -1.2; AR.el.rotation.x = -1.2;
    }
    // one-shot actions layered on top
    const A = this.act;
    if (A) {
      A.t += dt;
      const k = Math.min(1, A.t / A.dur);
      const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
      if (A.kind === "slash" || A.kind === "slash3" || A.kind === "heavy") {
        // overhead: wind up, cut down, recover
        const up = ease(k / 0.3), down = ease((k - 0.3) / 0.25), rec = ease((k - 0.6) / 0.4);
        const x = -2.6 * up + 3.2 * down * (1 - rec * 0.6) - 0.6 * rec;
        AR.sh.rotation.set(x, 0, -0.2); AR.el.rotation.x = -0.3 * up;
        if (A.kind !== "slash") { AL.sh.rotation.set(x * 0.9, 0, 0.2); }
        this.torso.rotation.x = -0.15 * up + 0.35 * down * (1 - rec);
        this.hips.position.z = 0.2 * down * (1 - rec);
      } else if (A.kind === "slash2") {
        // horizontal sweep
        const up = ease(k / 0.25), sw = ease((k - 0.25) / 0.3), rec = ease((k - 0.6) / 0.4);
        AR.sh.rotation.set(-1.45 * (1 - rec), 0, -1.3 * up * (1 - sw) + 1.1 * sw * (1 - rec));
        AR.el.rotation.x = -0.2;
        this.torso.rotation.y = 0.6 * up * (1 - sw) - 0.7 * sw * (1 - rec);
        this.hips.position.z = 0.15 * sw * (1 - rec);
      } else if (A.kind === "hit") {
        const h = Math.sin(k * Math.PI);
        this.torso.rotation.x = -0.4 * h; this.hips.position.z = -0.15 * h; this.head.rotation.x = -0.3 * h;
      } else if (A.kind === "cast" || A.kind === "point") {
        const r = Math.sin(Math.min(1, k * 2) * Math.PI / 2) * (A.kind === "cast" ? 1 - ease((k - 0.7) / 0.3) : 1);
        AR.sh.rotation.set(-1.6 * r, 0, -0.1); AL.sh.rotation.set(A.kind === "cast" ? -1.4 * r : 0, 0, 0.1);
      } else if (A.kind === "dash") {
        this.torso.rotation.x = 0.5 * Math.sin(k * Math.PI);
      } else if (A.kind === "nod") {
        this.head.rotation.x = Math.sin(k * Math.PI * 2) * 0.2;
      }
      if (A.t >= A.dur) this.act = null;
    }
    if (speed > 0.05 && Math.sign(c) !== Math.sign(this.lastCos)) this.onStep?.(run);
    this.lastCos = c;
  }
}

function buildHair(head, P, hair, B) {
  const st = P.hairStyle || "short";
  const top = B(0.25, 0.08, 0.26, hair); top.position.y = 0.32; head.add(top);
  const back = B(0.25, 0.18, 0.06, hair); back.position.set(0, 0.24, -0.12); head.add(back);
  if (st === "spiky") {
    for (let i = 0; i < 7; i++) {
      const sp = B(0.07, 0.16, 0.07, hair);
      const a = (i / 7) * Math.PI * 2;
      sp.position.set(Math.sin(a) * 0.09, 0.37, Math.cos(a) * 0.09 - 0.02);
      sp.rotation.set(Math.cos(a) * 0.7, 0, -Math.sin(a) * 0.7);
      head.add(sp);
    }
    const fringe = B(0.24, 0.06, 0.04, hair); fringe.position.set(0, 0.27, 0.12); fringe.rotation.x = 0.4; head.add(fringe);
  } else if (st === "long") {
    const l = B(0.26, 0.5, 0.08, hair); l.position.set(0, 0.06, -0.13); head.add(l);
    for (const s of [-1, 1]) { const sd = B(0.04, 0.32, 0.18, hair); sd.position.set(s * 0.125, 0.15, -0.02); head.add(sd); }
    const fringe = B(0.24, 0.05, 0.04, hair); fringe.position.set(0, 0.28, 0.12); head.add(fringe);
  } else if (st === "bob") {
    for (const s of [-1, 1]) { const sd = B(0.05, 0.22, 0.22, hair); sd.position.set(s * 0.125, 0.19, 0); head.add(sd); }
    const fringe = B(0.24, 0.07, 0.04, hair); fringe.position.set(0, 0.27, 0.12); head.add(fringe);
  } else if (st === "slick") {
    const sl = B(0.25, 0.05, 0.3, hair); sl.position.set(0, 0.33, -0.02); head.add(sl);
  } else {
    const fringe = B(0.24, 0.04, 0.04, hair); fringe.position.set(0, 0.29, 0.12); head.add(fringe);
  }
}

// 16x16 anime face: big eyes with highlights
function animeFace(P) {
  return canvasTex(16, 16, (g) => {
    g.fillStyle = P.skin; g.fillRect(0, 0, 16, 16);
    g.fillStyle = P.hair; g.fillRect(0, 0, 16, 3);
    if (P.face === "blank") return;
    g.fillStyle = "#14101a"; g.fillRect(3, 6, 3, 1); g.fillRect(10, 6, 3, 1);
    g.fillStyle = P.eye || "#2a1a14"; g.fillRect(3, 7, 3, 3); g.fillRect(10, 7, 3, 3);
    g.fillStyle = "#ffffff"; g.fillRect(4, 7, 1, 1); g.fillRect(11, 7, 1, 1);
    g.fillStyle = "rgba(120,60,50,0.6)"; g.fillRect(7, 11, 2, 1);
    g.fillStyle = "rgba(90,40,40,0.7)"; g.fillRect(6, 13, 4, 1);
  }, `animeface${P.skin}${P.hair}${P.eye}`);
}

// ============================================================
// Khethari — insectile, deliberate, listening.
// ============================================================
const chitin = () => matBase({ map: TEX.cloth([30, 28, 38], "chitin"), color: 0x8a86a0 });
const glowM = (c = 0x9a70ff) => matBase({ color: c, unlit: true });

export function makeKhethari(kind, scale = 1) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const C = chitin(), Gl = glowM(kind === "seraph" || kind === "warden" ? 0xff5070 : 0x9a70ff);
  const B = (w, h, d, m = C) => new THREE.Mesh(boxGeo(w, h, d, 0.5, 0.5), m);
  const legs = [], extra = {};
  const nodes = [];
  if (kind === "scuttle" || kind === "scout") {
    const thorax = B(0.5, 0.32, 0.9); thorax.position.y = 0.55; body.add(thorax);
    const headM = B(0.32, 0.26, 0.34); headM.position.set(0, 0.62, 0.56); body.add(headM);
    for (const s of [-1, 1]) { const mand = B(0.05, 0.05, 0.3); mand.position.set(s * 0.1, 0.52, 0.8); mand.rotation.y = -s * 0.4; body.add(mand); extra["m" + s] = mand; }
    const eye = B(0.26, 0.05, 0.04, Gl); eye.position.set(0, 0.68, 0.73); body.add(eye);
    const tail = B(0.36, 0.26, 0.6); tail.position.set(0, 0.6, -0.65); tail.rotation.x = 0.3; body.add(tail);
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * 0.25, 0.55, 0.3 - i * 0.3); body.add(hip);
      const up = B(0.5, 0.05, 0.05); up.position.x = s * 0.25; up.rotation.z = s * 0.5; hip.add(up);
      const lo = B(0.05, 0.6, 0.05); lo.position.set(s * 0.48, -0.2, 0); hip.add(lo);
      legs.push({ hip, s, i });
    }
    if (kind === "scout") {
      for (const s of [-1, 1]) { const an = B(0.03, 0.7, 0.03); an.position.set(s * 0.1, 1.0, 0.6); an.rotation.set(0.4, 0, -s * 0.3); body.add(an); }
      body.scale.set(0.8, 1.6, 0.8);
    }
  } else if (kind === "caster") {
    const sac = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), C); sac.position.y = 0.8; sac.scale.set(1, 1.2, 1); body.add(sac);
    const muzzle = B(0.18, 0.18, 0.6, C); muzzle.position.set(0, 0.9, 0.55); body.add(muzzle);
    const glow = B(0.2, 0.2, 0.05, Gl); glow.position.set(0, 0.9, 0.86); body.add(glow); extra.glow = glow;
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const l = B(0.06, 0.9, 0.06); l.position.set(Math.sin(a) * 0.4, 0.3, Math.cos(a) * 0.4); l.rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); body.add(l); }
  } else if (kind === "seraph" || kind === "elite" || kind === "warden") {
    // tall, rigid, bladed; crowned with resonance antennae
    const big = kind === "warden" ? 1.5 : 1;
    const torso = B(0.5, 1.1, 0.34); torso.position.y = 1.9; body.add(torso);
    const ab = B(0.34, 0.6, 0.3); ab.position.y = 1.15; body.add(ab);
    const head = B(0.3, 0.4, 0.36); head.position.set(0, 2.65, 0.05); body.add(head); extra.head = head;
    const eye = B(0.26, 0.06, 0.04, Gl); eye.position.set(0, 2.68, 0.24); body.add(eye);
    const throat = B(0.18, 0.18, 0.05, Gl); throat.position.set(0, 2.3, 0.18); body.add(throat); extra.throat = throat;
    const nAnt = kind === "warden" ? 4 : kind === "elite" ? 3 : 2;
    for (let i = 0; i < nAnt; i++) {
      const s = i - (nAnt - 1) / 2;
      const an = new THREE.Group(); an.position.set(s * 0.14, 2.85, 0); an.rotation.z = -s * 0.35; body.add(an);
      const st = B(0.04, 0.6, 0.04); st.position.y = 0.3; an.add(st);
      const tip = B(0.1, 0.1, 0.1, Gl); tip.position.y = 0.62; an.add(tip);
      nodes.push({ g: an, tip, alive: true });
    }
    for (const s of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(s * 0.34, 2.3, 0); body.add(arm);
      const up = B(0.1, 0.7, 0.1); up.position.y = -0.35; arm.add(up);
      const blade = B(0.04, 1.4, 0.16, matBase({ color: 0xa8a0c0, emissive: 0.2 })); blade.position.y = -1.3; blade.rotation.x = 0.2; arm.add(blade);
      extra["arm" + s] = arm;
    }
    if (kind !== "elite") for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.3), matBase({ color: 0x6a5a90, opacity: 0.55, side: THREE.DoubleSide })); w.position.set(s * 0.45, 2.2, -0.3); w.rotation.set(0.2, s * 0.6, s * 0.3); body.add(w); extra["w" + s] = w; }
    for (const s of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(s * 0.16, 1.0, 0); body.add(hip); const l1 = B(0.1, 0.6, 0.1); l1.position.y = -0.3; hip.add(l1); const l2 = B(0.08, 0.5, 0.08); l2.position.set(0, -0.75, -0.12); l2.rotation.x = -0.4; hip.add(l2); legs.push({ hip, s, i: 0, biped: true }); }
    body.scale.setScalar(big);
    if (kind === "warden") { const crown = B(1.0, 0.1, 0.5); crown.position.y = 2.95; body.add(crown); }
  } else if (kind === "colossus") {
    const shell = B(1.8, 1.2, 2.6); shell.position.y = 1.5; body.add(shell);
    const plates = B(2.0, 0.3, 2.2, matBase({ map: TEX.metal(), color: 0x6a6070 })); plates.position.y = 2.2; body.add(plates);
    const head = B(1.0, 0.8, 0.8); head.position.set(0, 1.4, 1.6); body.add(head); extra.head = head;
    for (const s of [-1, 0, 1]) { const h = B(0.16, 0.9, 0.16); h.position.set(s * 0.35, 2.0, 1.8); h.rotation.x = 0.6; body.add(h); }
    const eye = B(0.7, 0.08, 0.04, Gl); eye.position.set(0, 1.5, 2.01); body.add(eye);
    for (const sz of [-1, 1]) for (const s of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(s * 0.9, 1.1, sz * 0.9); body.add(hip); const l = B(0.4, 1.2, 0.4); l.position.y = -0.55; hip.add(l); legs.push({ hip, s, i: sz, heavy: true }); }
  }
  g.scale.setScalar(scale);
  let t = Math.random() * 5;
  return {
    root: g, body, nodes, extra, kind,
    update(dt, speed = 0, state = "") {
      t += dt;
      const r = speed > 0.05 ? 1 : 0.15;
      legs.forEach((L) => {
        const ph = t * (L.heavy ? 5 : L.biped ? 7 : 16) + L.i * 2 + (L.s > 0 ? Math.PI : 0);
        if (L.biped) L.hip.rotation.x = Math.sin(ph) * 0.5 * r;
        else { L.hip.rotation.y = Math.sin(ph) * 0.5 * r; L.hip.rotation.z = Math.max(0, Math.cos(ph)) * 0.3 * r * L.s; }
      });
      if (extra.m1) { extra.m1.rotation.y = -0.4 - Math.abs(Math.sin(t * 9)) * 0.4; extra["m-1"].rotation.y = 0.4 + Math.abs(Math.sin(t * 9)) * 0.4; }
      if (kind === "seraph" || kind === "elite" || kind === "warden") {
        const wind = state === "windup" ? 1 : 0;
        extra["arm1"].rotation.x = state === "windup" ? -2.4 : state === "strike" ? 0.8 : Math.sin(t * 1.5) * 0.15 - 0.2;
        extra["arm-1"].rotation.x = state === "windup" ? -2.2 : state === "strike" ? 0.9 : Math.cos(t * 1.4) * 0.15 - 0.2;
        if (extra.w1) { extra.w1.rotation.y = 0.6 + Math.sin(t * 20) * 0.2 * (speed > 0.1 ? 1 : 0.2); extra["w-1"].rotation.y = -0.6 - Math.sin(t * 20) * 0.2 * (speed > 0.1 ? 1 : 0.2); }
        extra.head.rotation.z = Math.sin(t * 0.7) * 0.15 + (state === "listen" ? 0.4 : 0);
        body.position.y = wind * -0.1;
      }
      if (kind === "caster" && extra.glow) glowK(extra.glow, state === "charge" ? 1.5 + Math.sin(t * 30) : 0.6);
      if (kind === "colossus") { body.rotation.x = state === "charge" ? -0.15 : 0; body.position.y = Math.abs(Math.sin(t * 5)) * 0.05 * r; }
      if (kind === "scuttle" || kind === "scout") body.position.y = Math.abs(Math.sin(t * 16)) * 0.04 * r;
    },
  };
}

// ============================================================
// The Fellstar Ark — a ribcage around a sleeping lung.
// ============================================================
export function makeArk(scale = 1) {
  const g = new THREE.Group();
  const bone = matBase({ map: TEX.cloth([26, 24, 30], "arkbone"), color: 0x9a96aa });
  const glow = matBase({ color: 0x8a60ff, unlit: true });
  const ribs = [];
  for (let i = 0; i < 9; i++) {
    const z = (i - 4) * 4.2;
    const R = 16 - Math.abs(i - 4) * 1.6;
    for (const s of [-1, 1]) {
      const rib = new THREE.Group();
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 0.62;
        const seg = new THREE.Mesh(boxGeo(1.1, R * 0.26, 1.1), bone);
        seg.position.set(s * Math.sin(a) * R * 0.75, Math.cos(a) * R * 0.95 - R * 0.35, 0);
        seg.rotation.z = -s * a;
        rib.add(seg);
      }
      const seam = new THREE.Mesh(boxGeo(0.25, R * 0.9, 0.25), matBase({ color: 0x8a60ff, unlit: true }));
      seam.position.set(s * R * 0.35, R * 0.25, 0.6); seam.rotation.z = -s * 0.5; rib.add(seam);
      rib.position.z = z;
      g.add(rib);
      ribs.push(seam);
    }
  }
  const lung = new THREE.Mesh(new THREE.IcosahedronGeometry(9, 1), matBase({ map: TEX.cloth([40, 30, 50], "lung"), color: 0x7a6a90 }));
  lung.scale.set(1, 0.7, 2.0);
  lung.position.y = 1;
  g.add(lung);
  g.scale.setScalar(scale);
  let t = 0;
  return {
    root: g, lung,
    update(dt) {
      t += dt;
      const b = 1 + Math.sin(t * 0.9) * 0.04;
      lung.scale.set(b, 0.7 * b, 2.0 * b);
      ribs.forEach((r, i) => glowK(r, 0.5 + Math.max(0, Math.sin(t * 2 - i * 0.4)) * 0.8));
    },
  };
}

// The Lumen Spire / Choirwell light
export function makeSpire(h = 30, color = 0xc0b0ff) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.6, h, 6, 4, true), matBase({ color, additive: true, side: THREE.DoubleSide }));
  core.position.y = h / 2; g.add(core);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, h, 5), matBase({ color: 0xffffff, unlit: true }));
  inner.position.y = h / 2; g.add(inner);
  const lat = [];
  for (let i = 0; i < 6; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2 + (i % 3), 0.08, 3, 10), matBase({ color: 0x9a80ff, unlit: true }));
    ring.position.y = 3 + i * (h / 7); ring.rotation.x = Math.PI / 2; g.add(ring); lat.push(ring);
  }
  let t = 0;
  return { root: g, core, update(dt) { t += dt; lat.forEach((r, i) => { r.rotation.z = t * (0.3 + i * 0.1); r.position.y += Math.sin(t + i) * 0.003; }); glowK(core, 0.6 + Math.sin(t * 3) * 0.2); } };
}

// ============================================================
// Pixel portraits for dialogue windows (64x64)
// ============================================================
const PORTRAIT_BG = { KAIEN: "#1a2a4a", ARIA: "#3a2a3e", RENJI: "#1e3a2a", RAIZEN: "#3a1a1e", SHION: "#1e3640", KYO: "#3e2a14", DAIGO: "#2a2e20", MIYU: "#3a1a20", REQUIEM: "#141418", VAEL: "#0e1a2e" };
const PORT_ID = { KAIEN: "kaien", ARIA: "aria", RENJI: "renji", RAIZEN: "raizen", SHION: "shion", KYO: "kyo", DAIGO: "daigo", MIYU: "miyu", REQUIEM: "requiem", VAEL: "vael" };
const portraitCache = {};
export function portrait(who) {
  const key = (who || "").toUpperCase().split(/[ (]/)[0];
  const id = PORT_ID[key];
  if (!id) return null;
  if (portraitCache[id]) return portraitCache[id];
  const P = CAST[id];
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, PORTRAIT_BG[key]); gr.addColorStop(1, "#05050a");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const rgb = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;
  const kid = id === "miyu";
  const cx = 32, fy = kid ? 26 : 22, fw = kid ? 22 : 20, fh = kid ? 22 : 24;
  // shoulders / outfit
  g.fillStyle = rgb(P.jacket || P.coat || P.shirt);
  g.fillRect(cx - 24, 50, 48, 14);
  g.fillRect(cx - 18, 46, 36, 6);
  if (P.asym) { g.fillStyle = rgb(P.asym); g.fillRect(cx - 24, 52, 10, 12); }
  if (P.armor) { g.fillStyle = rgb(P.armor); g.fillRect(cx - 26, 48, 14, 8); g.fillRect(cx + 12, 48, 14, 8); }
  if (P.belt) { g.fillStyle = "#c8ccd4"; g.fillRect(cx - 18, 58, 36, 2); }
  // neck + face
  g.fillStyle = P.skin; g.fillRect(cx - 4, fy + fh - 4, 8, 8);
  g.fillRect(cx - fw / 2, fy, fw, fh - 4);
  g.fillRect(cx - fw / 2 + 2, fy + fh - 4, fw - 4, 3);
  g.fillRect(cx - fw / 2 + 5, fy + fh - 1, fw - 10, 2);
  if (P.scarf) { g.fillStyle = "#b02028"; g.fillRect(cx - 14, fy + fh, 28, 6); g.fillRect(cx + 4, fy + fh + 4, 6, 10); }
  // eyes
  const ey = fy + Math.round(fh * 0.42);
  g.fillStyle = "#0e0a12"; g.fillRect(cx - 8, ey - 1, 6, 1); g.fillRect(cx + 2, ey - 1, 6, 1);
  g.fillStyle = P.eye || "#2a1a14"; g.fillRect(cx - 7, ey, 4, 4); g.fillRect(cx + 3, ey, 4, 4);
  g.fillStyle = "#fff"; g.fillRect(cx - 6, ey, 1, 1); g.fillRect(cx + 4, ey, 1, 1);
  g.fillStyle = "rgba(110,50,50,0.7)"; g.fillRect(cx - 2, fy + fh - 7, 4, 1);
  if (P.glasses) { g.strokeStyle = "#9ad0ff"; g.lineWidth = 1; g.strokeRect(cx - 9, ey - 2, 7, 6); g.strokeRect(cx + 2, ey - 2, 7, 6); }
  // hair
  g.fillStyle = P.hair;
  const st = P.hairStyle;
  g.fillRect(cx - fw / 2 - 2, fy - 6, fw + 4, 8);
  if (st === "spiky") { for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(cx - 14 + i * 5, fy - 4); g.lineTo(cx - 12 + i * 5 + (i % 2 ? 3 : -3), fy - 13 - (i % 3) * 2); g.lineTo(cx - 9 + i * 5, fy - 4); g.fill(); } g.fillRect(cx - fw / 2, fy + 1, 5, 6); g.fillRect(cx + 3, fy + 1, 6, 4); }
  else if (st === "long") { g.fillRect(cx - fw / 2 - 4, fy - 4, 6, fh + 18); g.fillRect(cx + fw / 2 - 2, fy - 4, 6, fh + 18); g.fillRect(cx - fw / 2, fy + 1, fw, 3); }
  else if (st === "bob") { g.fillRect(cx - fw / 2 - 3, fy - 3, 5, fh - 2); g.fillRect(cx + fw / 2 - 2, fy - 3, 5, fh - 2); g.fillRect(cx - fw / 2, fy + 1, fw, 4); }
  else if (st === "slick") { g.fillRect(cx - fw / 2 - 1, fy - 3, fw + 2, 4); }
  else { g.fillRect(cx - fw / 2, fy + 1, fw, 2); }
  if (P.headset) { g.fillStyle = "#26262c"; g.fillRect(cx - fw / 2 - 5, fy + 6, 4, 8); g.fillRect(cx - fw / 2 - 3, fy + 13, 8, 2); }
  if (P.sheath) { g.fillStyle = "#2a1a12"; g.save(); g.translate(cx + 18, 48); g.rotate(-0.8); g.fillRect(0, -2, 22, 3); g.restore(); }
  // scanline sheen
  g.fillStyle = "rgba(0,0,0,0.18)"; for (let y = 0; y < 64; y += 2) g.fillRect(0, y, 64, 1);
  portraitCache[id] = c.toDataURL();
  return portraitCache[id];
}
