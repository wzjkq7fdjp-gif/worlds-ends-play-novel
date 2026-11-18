// ============================================================
// World: scene, colliders, floors, lights, interactables,
// triggers, prop builders, player controller and camera rig.
// ============================================================
import { THREE, U, mat, TEX, boxGeo, planeGeo, wallGeo } from "./ps1.js";
import { Character } from "./actors.js";

const tmpV = new THREE.Vector3();
const lerp = (a, b, t) => a + (b - a) * t;
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
export { lerp, angDiff };

export class World {
  constructor(G) {
    this.G = G;
    this.scene = new THREE.Scene();
    this.colliders = [];
    this.floors = [];
    this.lights = [];
    this.interacts = [];
    this.triggers = [];
    this.billboards = [];
    this.updaters = [];
    this.sparkles = [];
    this.surface = "street";
    this.surfaces = [];
    this.bounds = null;
    this.camZones = [];
    this.water = null; // {y, x0,z0,x1,z1}
    this.actors = [];
    this.backdrop = null;
  }
  dispose() {
    if (this.backdrop) this.backdrop.dispose(this.G.camera);
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      ms.forEach((m) => m.dispose());
    });
  }
  add(o) { this.scene.add(o); return o; }
  every(fn) { this.updaters.push(fn); return fn; }

  // ---------------- environment ----------------
  env(o = {}) {
    if (o.fog) U.uFogColor.value.set(o.fog);
    if (o.near != null) U.uFogNear.value = o.near;
    if (o.far != null) U.uFogFar.value = o.far;
    if (o.ambient) U.uAmbient.value.set(o.ambient);
    if (o.dir) U.uDirCol.value.set(o.dir);
    if (o.dirVec) U.uDirDir.value.set(...o.dirVec).normalize();
    U.uSat.value = o.sat ?? 1;
    this.fogColor = U.uFogColor.value.clone();
    this.envCfg = o;
  }

  // ---------------- physics ----------------
  collider(x0, z0, x1, z1, tag) {
    const c = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), on: true, tag };
    this.colliders.push(c);
    return c;
  }
  colliderBox(x, z, w, d, rot = 0, tag) {
    // rotated boxes are approximated by their AABB (we only rotate by 90° steps)
    const r = Math.abs(Math.sin(rot)) > 0.7;
    const hw = (r ? d : w) / 2, hd = (r ? w : d) / 2;
    return this.collider(x - hw, z - hd, x + hw, z + hd, tag);
  }
  floor(x0, z0, x1, z1, y, ramp) {
    const f = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), y, ramp };
    this.floors.push(f);
    return f;
  }
  groundAt(x, z) {
    let y = 0;
    for (const f of this.floors) {
      if (x < f.x0 || x > f.x1 || z < f.z0 || z > f.z1) continue;
      if (f.ramp) {
        const { axis, a0, a1, y0, y1 } = f.ramp;
        const v = axis === "x" ? x : z;
        const t = Math.max(0, Math.min(1, (v - a0) / (a1 - a0)));
        y = lerp(y0, y1, t);
      } else y = f.y;
    }
    return y;
  }
  surfaceAt(x, z) {
    let s = this.surface;
    for (const r of this.surfaces) if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) s = r.s;
    return s;
  }
  surfaceRect(x0, z0, x1, z1, s) { this.surfaces.push({ x0, z0, x1, z1, s }); }
  resolve(pos, rad) {
    for (let it = 0; it < 3; it++) {
      for (const c of this.colliders) {
        if (!c.on) continue;
        const cx = Math.max(c.x0, Math.min(pos.x, c.x1));
        const cz = Math.max(c.z0, Math.min(pos.z, c.z1));
        const dx = pos.x - cx, dz = pos.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 < rad * rad) {
          if (d2 > 1e-8) {
            const d = Math.sqrt(d2), push = rad - d;
            pos.x += (dx / d) * push;
            pos.z += (dz / d) * push;
          } else {
            // centre inside the box: push out along the shallowest axis
            const l = pos.x - c.x0, r = c.x1 - pos.x, b = pos.z - c.z0, t = c.z1 - pos.z;
            const m = Math.min(l, r, b, t);
            if (m === l) pos.x = c.x0 - rad; else if (m === r) pos.x = c.x1 + rad; else if (m === b) pos.z = c.z0 - rad; else pos.z = c.z1 + rad;
          }
        }
      }
    }
    if (this.backdrop) this.backdrop.constrain(pos, rad);
    if (this.bounds) {
      const B = this.bounds;
      pos.x = Math.max(B.x0 + rad, Math.min(B.x1 - rad, pos.x));
      pos.z = Math.max(B.z0 + rad, Math.min(B.z1 - rad, pos.z));
    }
  }

  // ---------------- lights ----------------
  light(x, y, z, color = 0xffd9a0, range = 9, o = {}) {
    const L = { pos: new THREE.Vector3(x, y, z), color: new THREE.Color(color), base: new THREE.Color(color), range, flicker: o.flicker || 0, on: true };
    this.lights.push(L);
    return L;
  }
  updateLights(focus, t) {
    const list = this.lights.filter((l) => l.on).map((l) => [l, l.pos.distanceToSquared(focus)]).sort((a, b) => a[1] - b[1]).slice(0, 6);
    for (let i = 0; i < 6; i++) {
      const e = list[i];
      if (!e) { U.uPLPos.value[i].set(0, -999, 0); U.uPLCol.value[i].setRGB(0, 0, 0); U.uPLRange.value[i] = 1; continue; }
      const L = e[0];
      let k = 1;
      if (L.flicker) {
        const n = Math.sin(t * 23.1 + L.pos.x) * Math.sin(t * 7.7 + L.pos.z);
        k = n > 1 - L.flicker * 1.4 ? 0.1 : 1;
      }
      U.uPLPos.value[i].copy(L.pos);
      U.uPLCol.value[i].copy(L.color).multiplyScalar(k);
      U.uPLRange.value[i] = L.range;
      if (L.glow) L.glow.visible = k > 0.5;
    }
  }

  // ---------------- interaction ----------------
  // interact({ pos:[x,y,z], r, label, verb, use: async fn, once, sparkle, facing })
  interact(o) {
    const it = { r: 1.4, verb: "EXAMINE", enabled: true, ...o };
    it.p = new THREE.Vector3(...(o.pos.length === 2 ? [o.pos[0], 1, o.pos[1]] : o.pos));
    if (o.sparkle) it.spark = this.sparkle(it.p.x, it.p.y, it.p.z);
    it.remove = () => {
      this.interacts = this.interacts.filter((x) => x !== it);
      if (it.spark) { this.scene.remove(it.spark); this.sparkles = this.sparkles.filter((s) => s !== it.spark); }
    };
    this.interacts.push(it);
    return it;
  }
  nearestInteract(pos, yaw) {
    let best = null, bs = 1e9;
    for (const it of this.interacts) {
      if (!it.enabled) continue;
      const dx = it.p.x - pos.x, dz = it.p.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d > it.r) continue;
      // must be roughly facing it (forgiving cone, ignored when very close)
      const fa = Math.abs(angDiff(yaw, Math.atan2(dx, dz)));
      if (d > 0.7 && fa > 1.25) continue;
      const score = d + fa * 0.6;
      if (score < bs) { bs = score; best = it; }
    }
    return best;
  }
  // trigger({ x0,z0,x1,z1 } | { x,z,r }, enter: fn, once=true)
  trigger(o) {
    const t = { once: true, inside: false, ...o, on: true };
    t.remove = () => (this.triggers = this.triggers.filter((x) => x !== t));
    this.triggers.push(t);
    return t;
  }
  checkTriggers(pos) {
    for (const t of [...this.triggers]) {
      if (!t.on) continue;
      const inside = t.r != null ? Math.hypot(pos.x - t.x, pos.z - t.z) < t.r : pos.x >= t.x0 && pos.x <= t.x1 && pos.z >= t.z0 && pos.z <= t.z1;
      if (inside && !t.inside) {
        t.inside = true;
        if (t.once) t.remove();
        t.enter?.();
      } else if (!inside && t.inside) {
        t.inside = false;
        t.exit?.();
      }
    }
  }
  sparkle(x, y, z) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), mat({ map: TEX.glow(), additive: true, color: 0xfff2c0 }));
    s.position.set(x, y, z);
    s.userData.base = y;
    this.scene.add(s);
    this.billboards.push(s);
    this.sparkles.push(s);
    return s;
  }

  // ---------------- billboard / glow ----------------
  glow(x, y, z, size = 1, color = 0xffd080) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat({ map: TEX.glow(), additive: true, color }));
    s.position.set(x, y, z);
    this.scene.add(s);
    this.billboards.push(s);
    return s;
  }
  update(dt, t, cam) {
    for (const b of this.billboards) b.quaternion.copy(cam.quaternion);
    for (const s of this.sparkles) {
      s.position.y = s.userData.base + Math.sin(t * 3 + s.position.x) * 0.06;
      const k = 0.6 + Math.sin(t * 6 + s.position.z * 3) * 0.4;
      s.scale.setScalar(k);
    }
    for (const a of this.actors) a.update(dt, cam);
    for (const u of this.updaters) u(dt, t);
  }
  // register a sprite actor (needs the camera every frame)
  addActor(a) { this.actors.push(a); this.scene.add(a.root); return a; }

  // ================================================================
  // Prop builders (all low-poly, all registered with physics)
  // ================================================================
  mesh(geo, m, x = 0, y = 0, z = 0, ry = 0) {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.rotation.y = ry;
    this.scene.add(o);
    return o;
  }
  box(x, y, z, w, h, d, m, o = {}) {
    const mesh = this.mesh(boxGeo(w, h, d, o.su || 2, o.sv || o.su || 2), m, x, y + h / 2, z, o.ry || 0);
    if (o.solid !== false) this.colliderBox(x, z, w, d, o.ry || 0);
    return mesh;
  }
  ground(x, z, w, d, map, o = {}) {
    const g = this.mesh(planeGeo(w, d, o.scale || 2), mat({ map, color: o.color ?? 0xffffff, wave: o.wave, scroll: o.scroll, opacity: o.opacity }), x, o.y || 0, z);
    return g;
  }
  ceiling(x, z, w, d, y, map, o = {}) {
    const geo = planeGeo(w, d, o.scale || 2);
    geo.rotateX(Math.PI);
    return this.mesh(geo, mat({ map, color: o.color ?? 0xffffff }), x, y, z);
  }
  wall(x, z, w, h, ry, map, o = {}) {
    // a visible single-sided wall facing its local +z; physics thickness 0.3
    const m = this.mesh(wallGeo(w, h, o.su || 2, o.sv || o.su || 2), mat({ map, color: o.color ?? 0xffffff, side: o.double ? THREE.DoubleSide : THREE.FrontSide }), x, (o.y || 0) + h / 2, z, ry);
    if (o.solid !== false) {
      const r = Math.abs(Math.sin(ry)) > 0.7;
      const t = 0.3;
      // shift collider behind the visible face
      const nx = Math.sin(ry), nz = Math.cos(ry);
      const cx = x - nx * t * 0.5, cz = z - nz * t * 0.5;
      if (r) this.collider(cx - t / 2, cz - w / 2, cx + t / 2, cz + w / 2);
      else this.collider(cx - w / 2, cz - t / 2, cx + w / 2, cz + t / 2);
    }
    return m;
  }
  // rectangular room: floor, ceiling, 4 walls facing inward
  room(x0, z0, x1, z1, h, o = {}) {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (o.floor !== false) this.ground(cx, cz, w, d, o.floor || TEX.wood(), { scale: o.fs || 1.5 });
    if (o.ceil !== false) this.ceiling(cx, cz, w, d, h, o.ceil || TEX.concrete([70, 66, 60], "ceil"), { scale: 2 });
    const wm = o.wall || TEX.wallpaper();
    const skip = o.skip || [];
    if (!skip.includes("n")) this.wall(cx, z1, w, h, Math.PI, wm, { su: o.ws || 2 });
    if (!skip.includes("s")) this.wall(cx, z0, w, h, 0, wm, { su: o.ws || 2 });
    if (!skip.includes("e")) this.wall(x1, cz, d, h, -Math.PI / 2, wm, { su: o.ws || 2 });
    if (!skip.includes("w")) this.wall(x0, cz, d, h, Math.PI / 2, wm, { su: o.ws || 2 });
    this.bounds = o.bounds === false ? this.bounds : { x0, z0, x1, z1 };
  }
  lamp(x, z, o = {}) {
    const h = o.h || 4.6;
    const pole = mat({ map: TEX.metal(), color: 0x6a6e76 });
    this.mesh(boxGeo(0.14, h, 0.14), pole, x, h / 2, z);
    const arm = o.side || 1;
    this.mesh(boxGeo(0.9, 0.1, 0.1), pole, x + arm * 0.45, h - 0.05, z);
    const head = this.mesh(boxGeo(0.4, 0.14, 0.26), mat({ color: o.color ?? 0xffe0a0, unlit: true }), x + arm * 0.85, h - 0.12, z);
    this.colliderBox(x, z, 0.3, 0.3);
    const L = this.light(x + arm * 0.85, h - 0.6, z, o.color ?? 0xffcc88, o.range || 10, { flicker: o.flicker });
    L.glow = this.glow(x + arm * 0.85, h - 0.25, z, 1.4, o.color ?? 0xffcc88);
    L.head = head;
    return L;
  }
  tree(x, z, s = 1, leaves) {
    const bark = mat({ map: TEX.bark() });
    this.mesh(boxGeo(0.28 * s, 3.4 * s, 0.28 * s, 0.5, 1), bark, x, 1.7 * s, z);
    const lm = mat({ map: leaves || TEX.leaves() });
    const c1 = this.mesh(new THREE.IcosahedronGeometry(1.5 * s, 0), lm, x, 4.4 * s, z, Math.random() * 3);
    const c2 = this.mesh(new THREE.IcosahedronGeometry(1.1 * s, 0), lm, x + 0.5 * s, 5.3 * s, z - 0.3 * s, Math.random() * 3);
    this.colliderBox(x, z, 0.5, 0.5);
    return [c1, c2];
  }
  car(x, z, ry = 0, color = [70, 74, 88], o = {}) {
    const g = new THREE.Group();
    const body = mat({ map: TEX.cloth(color, "car" + color) });
    const glass = mat({ color: o.lit ? 0x6a5a40 : 0x1a2028 });
    const tire = mat({ color: 0x111111 });
    const b1 = new THREE.Mesh(boxGeo(1.8, 0.7, 4.4), body); b1.position.y = 0.6; g.add(b1);
    const b2 = new THREE.Mesh(boxGeo(1.6, 0.55, 2.2), glass); b2.position.set(0, 1.22, -0.2); g.add(b2);
    const roof = new THREE.Mesh(boxGeo(1.5, 0.08, 2.0), body); roof.position.set(0, 1.52, -0.2); g.add(roof);
    for (const sx of [-0.85, 0.85]) for (const sz of [-1.4, 1.4]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 8), tire);
      w.rotation.z = Math.PI / 2; w.position.set(sx, 0.33, sz); g.add(w);
    }
    const hl = mat({ color: o.lights ? 0xfff4d0 : 0x888870, unlit: !!o.lights });
    for (const sx of [-0.6, 0.6]) { const h = new THREE.Mesh(boxGeo(0.3, 0.14, 0.05), hl); h.position.set(sx, 0.75, 2.21); g.add(h); }
    const tl = mat({ color: 0x801010, unlit: !!o.lights });
    for (const sx of [-0.65, 0.65]) { const h = new THREE.Mesh(boxGeo(0.3, 0.14, 0.05), tl); h.position.set(sx, 0.75, -2.21); g.add(h); }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    this.scene.add(g);
    if (o.solid !== false) this.colliderBox(x, z, 1.9, 4.5, ry);
    return g;
  }
  bench(x, z, ry = 0) {
    const w = mat({ map: TEX.wood([90, 60, 40], "benchwood") });
    const m = mat({ color: 0x2a2a2a });
    const g = new THREE.Group();
    const seat = new THREE.Mesh(boxGeo(1.8, 0.08, 0.5), w); seat.position.y = 0.45; g.add(seat);
    const back = new THREE.Mesh(boxGeo(1.8, 0.45, 0.06), w); back.position.set(0, 0.8, -0.24); g.add(back);
    for (const sx of [-0.8, 0.8]) { const l = new THREE.Mesh(boxGeo(0.06, 0.45, 0.45), m); l.position.set(sx, 0.22, 0); g.add(l); }
    g.position.set(x, 0, z); g.rotation.y = ry; this.scene.add(g);
    this.colliderBox(x, z, 1.8, 0.6, ry);
    return g;
  }
  payphone(x, z, ry = 0) {
    const g = new THREE.Group();
    const m = mat({ map: TEX.metal(), color: 0x8a9098 });
    const post = new THREE.Mesh(boxGeo(0.12, 1.2, 0.12), m); post.position.y = 0.6; g.add(post);
    const box = new THREE.Mesh(boxGeo(0.5, 0.7, 0.3), m); box.position.y = 1.45; g.add(box);
    const front = new THREE.Mesh(boxGeo(0.38, 0.5, 0.02), mat({ color: 0x1a1a1e })); front.position.set(0, 1.45, 0.16); g.add(front);
    const sign = new THREE.Mesh(boxGeo(0.56, 0.18, 0.32), mat({ map: TEX.text("PHONE", { w: 32, h: 8, bg: "#1a3a8a", size: 7 }), unlit: true })); sign.position.y = 1.95; g.add(sign);
    const rec = new THREE.Mesh(boxGeo(0.08, 0.3, 0.08), mat({ color: 0x111111 })); rec.position.set(-0.2, 1.5, 0.19); g.add(rec);
    g.position.set(x, 0, z); g.rotation.y = ry; this.scene.add(g);
    this.colliderBox(x, z, 0.5, 0.4, ry);
    return g;
  }
  table(x, z, o = {}) {
    const w = mat({ map: TEX.wood(o.tint || [110, 74, 48], "table" + (o.tint || "")) });
    const cloth = o.cloth ? mat({ color: o.cloth }) : w;
    this.mesh(boxGeo(o.w || 1.0, 0.06, o.d || 1.0), cloth, x, 0.76, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) this.mesh(boxGeo(0.06, 0.74, 0.06), w, x + sx * ((o.w || 1) / 2 - 0.08), 0.37, z + sz * ((o.d || 1) / 2 - 0.08));
    if (o.chairs) for (const s of [-1, 1]) this.chair(x, z + s * ((o.d || 1) / 2 + 0.35), s > 0 ? Math.PI : 0, w);
    this.colliderBox(x, z, (o.w || 1) + 0.1, (o.d || 1) + 0.1);
    if (o.candle) {
      this.mesh(boxGeo(0.05, 0.16, 0.05), mat({ color: 0xeeeedd }), x, 0.87, z);
      this.light(x, 1.1, z, 0xffa040, 4, { flicker: 0.1 });
      this.glow(x, 0.98, z, 0.3, 0xffb060);
    }
  }
  chair(x, z, ry, w) {
    const g = new THREE.Group();
    const s = new THREE.Mesh(boxGeo(0.44, 0.05, 0.44), w); s.position.y = 0.45; g.add(s);
    const b = new THREE.Mesh(boxGeo(0.44, 0.5, 0.05), w); b.position.set(0, 0.72, -0.2); g.add(b);
    for (const sx of [-0.19, 0.19]) for (const sz of [-0.19, 0.19]) { const l = new THREE.Mesh(boxGeo(0.04, 0.45, 0.04), w); l.position.set(sx, 0.22, sz); g.add(l); }
    g.position.set(x, 0, z); g.rotation.y = ry; this.scene.add(g);
  }
  bed(x, z, ry = 0, o = {}) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(boxGeo(1.6, 0.4, 2.1), mat({ map: TEX.wood([70, 50, 36], "bedwood") })); frame.position.y = 0.2; g.add(frame);
    const sheet = new THREE.Mesh(boxGeo(1.55, 0.18, 1.6), mat({ map: TEX.cloth(o.sheet || [150, 150, 160], "sheet" + o.sheet) })); sheet.position.set(0, 0.48, 0.22); g.add(sheet);
    const pil = new THREE.Mesh(boxGeo(1.3, 0.14, 0.4), mat({ color: 0xd8d8d0 })); pil.position.set(0, 0.5, -0.78); g.add(pil);
    const head = new THREE.Mesh(boxGeo(1.6, 1.0, 0.08), mat({ map: TEX.wood([70, 50, 36], "bedwood") })); head.position.set(0, 0.5, -1.04); g.add(head);
    g.position.set(x, 0, z); g.rotation.y = ry; this.scene.add(g);
    this.colliderBox(x, z, 1.6, 2.1, ry);
    return g;
  }
  tv(x, z, ry = 0, screenTex) {
    const g = new THREE.Group();
    const stand = new THREE.Mesh(boxGeo(0.9, 0.55, 0.5), mat({ map: TEX.wood([60, 40, 28], "tvstand") })); stand.position.y = 0.27; g.add(stand);
    const body = new THREE.Mesh(boxGeo(0.7, 0.56, 0.55), mat({ color: 0x2a2a2c })); body.position.y = 0.84; g.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.42), mat({ map: screenTex, unlit: true })); scr.position.set(0, 0.85, 0.28); g.add(scr);
    g.position.set(x, 0, z); g.rotation.y = ry; this.scene.add(g);
    this.colliderBox(x, z, 0.9, 0.6, ry);
    return { g, scr };
  }
  door(x, z, ry = 0, o = {}) {
    const g = new THREE.Group();
    const fr = mat({ color: o.frame ?? 0x2a2420 });
    const d = new THREE.Mesh(boxGeo(1.0, 2.1, 0.08, 1, 2.1), mat({ map: o.map || TEX.door(o.tint), emissive: o.glow || 0 }));
    d.position.y = 1.05; g.add(d);
    const t = new THREE.Mesh(boxGeo(1.2, 0.1, 0.14), fr); t.position.y = 2.15; g.add(t);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(boxGeo(0.1, 2.2, 0.14), fr); p.position.set(s * 0.55, 1.1, 0); g.add(p); }
    if (o.label) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.12), mat({ map: TEX.text(o.label, { w: 48, h: 12, bg: "#c8b878", fg: "#201810", size: 8, border: false }) }));
      l.position.set(0, 1.75, 0.05); g.add(l);
      g.userData.label = l;
    }
    if (o.sign) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), mat({ map: TEX.text(o.sign, { w: 128, h: 16, bg: "#101010", fg: o.signColor || "#e8e0c8", size: 9 }), unlit: true }));
      l.position.set(0, 2.5, 0.05); g.add(l);
    }
    g.position.set(x, 0, z); g.rotation.y = ry; this.scene.add(g);
    if (o.solid !== false) this.colliderBox(x, z, 1.2, 0.3, ry);
    return g;
  }
  sign(x, y, z, text, ry = 0, o = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w || 1.4, o.h || 0.35), mat({ map: TEX.text(text, { w: o.tw || 64, h: o.th || 16, bg: o.bg || "#1e5a32", fg: o.fg || "#f0f0e0", size: o.size || 9 }), unlit: o.unlit ?? false, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.y = ry; this.scene.add(m);
    return m;
  }
  streetSign(x, z, a, b) {
    const pole = mat({ map: TEX.metal(), color: 0x50565c });
    this.mesh(boxGeo(0.08, 3, 0.08), pole, x, 1.5, z);
    this.sign(x, 3.0, z, a, 0, { w: 1.3, h: 0.28 });
    this.sign(x, 2.7, z, b, Math.PI / 2, { w: 1.3, h: 0.28 });
    this.colliderBox(x, z, 0.2, 0.2);
  }
  frame(x, y, z, ry, tex, w = 0.7, h = 0.55, o = {}) {
    const g = new THREE.Group();
    const f = new THREE.Mesh(boxGeo(w + 0.1, h + 0.1, 0.05), mat({ color: o.frame ?? 0x3a2a1a })); g.add(f);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: tex, emissive: o.glow || 0.15 })); p.position.z = 0.03; g.add(p);
    g.position.set(x, y, z); g.rotation.y = ry; this.scene.add(g);
    g.userData.pic = p;
    return g;
  }
  wallClock(x, y, z, ry, size = 0.6) {
    const c = new THREE.Mesh(new THREE.CircleGeometry(size, 12), mat({ map: TEX.clockFace("4:04"), emissive: 0.2 }));
    c.position.set(x, y, z); c.rotation.y = ry; this.scene.add(c);
    return c;
  }
  hydrant(x, z) {
    const m = mat({ color: 0x8a2018 });
    this.mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.6, 6), m, x, 0.3, z);
    this.mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.18, 6), m, x, 0.68, z);
    this.colliderBox(x, z, 0.35, 0.35);
  }
  trash(x, z) {
    this.mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.9, 7), mat({ map: TEX.metal(), color: 0x4a5a4a }), x, 0.45, z);
    this.colliderBox(x, z, 0.6, 0.6);
  }
  railing(x0, z, x1) {
    const m = mat({ map: TEX.metal(), color: 0x4a4e56 });
    const w = Math.abs(x1 - x0), cx = (x0 + x1) / 2;
    this.mesh(boxGeo(w, 0.06, 0.06), m, cx, 1.05, z);
    this.mesh(boxGeo(w, 0.04, 0.04), m, cx, 0.55, z);
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x += 2) this.mesh(boxGeo(0.06, 1.08, 0.06), m, x, 0.54, z);
    this.collider(Math.min(x0, x1), z - 0.1, Math.max(x0, x1), z + 0.1);
  }
  stairs(x, z, w, steps, rise, run, dir = 1, m) {
    // stairs ascending along +z (dir=1) or -z (dir=-1)
    const mm = m || mat({ map: TEX.concrete() });
    for (let i = 0; i < steps; i++) {
      this.mesh(boxGeo(w, rise * (i + 1), run, 1), mm, x, rise * (i + 1) / 2, z + dir * (i + 0.5) * run);
    }
    const z0 = z, z1 = z + dir * steps * run;
    this.floor(x - w / 2, Math.min(z0, z1), x + w / 2, Math.max(z0, z1), 0, { axis: "z", a0: z0, a1: z1, y0: 0, y1: steps * rise });
  }
  building(x, z, w, d, h, tex, o = {}) {
    const m = mat({ map: tex, color: o.color ?? 0xffffff });
    const b = this.mesh(boxGeo(w, h, d, o.su || 4, o.sv || 3.2), m, x, h / 2, z);
    // flat roof cap & cornice
    this.mesh(boxGeo(w + 0.3, 0.3, d + 0.3), mat({ color: 0x2a2826 }), x, h + 0.15, z);
    this.colliderBox(x, z, w, d);
    return b;
  }
  // block of brownstones/apartments along a line
  blockRow(x, z0, z1, side, o = {}) {
    let z = z0;
    let i = 0;
    const tints = o.tints || [[96, 74, 62], [110, 92, 78], [80, 70, 66], [120, 84, 64], [92, 88, 84]];
    while (z < z1) {
      const d = Math.min(z1 - z, 7 + ((i * 5) % 5));
      const h = (o.minH || 9) + ((i * 7) % 4) * 3;
      const tint = tints[i % tints.length];
      const tex = TEX.facade(tint, o.lit ?? 0.22, 11 + i * 7);
      this.building(x + side * 4, z + d / 2, 8, d - 0.2, h, tex);
      i++;
      z += d;
    }
  }

  // Ocean Parkway style boulevard running along z.
  // main road |x|<5, malls (trees+benches) 5<|x|<8, service roads 8<|x|<12, sidewalk 12<|x|<15, buildings beyond
  boulevard(z0, z1, o = {}) {
    const len = z1 - z0, cz = (z0 + z1) / 2;
    this.ground(0, cz, 10, len, TEX.road(), { scale: 6 });
    for (const s of [-1, 1]) {
      this.ground(s * 6.5, cz, 3, len, TEX.sidewalk(), { scale: 1.5 });
      this.ground(s * 10, cz, 4, len, TEX.asphalt(), { scale: 4 });
      this.ground(s * 13.5, cz, 3, len, TEX.sidewalk(), { scale: 1.5 });
      // curbs
      this.mesh(boxGeo(0.2, 0.12, len, 1), mat({ map: TEX.concrete() }), s * 5, 0.06, cz);
      if (o.buildings !== false) this.blockRow(s * 15, z0, z1, s, { lit: o.lit });
      for (let z = z0 + 4; z < z1 - 2; z += 9) {
        if (o.trees !== false) this.tree(s * 6.5, z + (s > 0 ? 0 : 4.5), 1, o.leaves);
      }
      for (let z = z0 + 8; z < z1 - 2; z += 16) if (o.benches !== false) this.bench(s * 7.4, z, s > 0 ? -Math.PI / 2 : Math.PI / 2);
      for (let z = z0 + 2 + (s > 0 ? 0 : 8); z < z1; z += 16) this.lamp(s * 12.2, z, { side: -s, flicker: o.flicker && Math.random() < 0.3 ? 0.3 : 0, color: o.lampColor });
    }
    this.bounds = this.bounds || { x0: -15, z0, x1: 15, z1 };
  }
}

// ================================================================
// Player — camera-relative analog movement with acceleration,
// smooth turning, collision sliding, stairs, optional tank mode.
// ================================================================
export class Player {
  constructor(G) {
    this.G = G;
    this.ch = new Character("rufki");
    this.pos = this.ch.root.position;
    this.vel = new THREE.Vector2();
    this.yaw = 0;
    this.radius = 0.32;
    this.walk = 1.75;
    this.runSpd = 3.9;
    this.basis = 0;
    this.faceTarget = null; // when set, the player strafes while facing this point
    this.frozen = false;
    this.ch.onStep = (run) => {
      const w = G.world;
      if (!w) return;
      G.audio.step(w.surfaceAt(this.pos.x, this.pos.z), run);
      w.onPlayerStep?.(run);
    };
  }
  // swap the controlled character (Rufki / Argjila / doubles)
  setAvatar(preset) {
    if (this.ch && this.ch.preset === preset) return this.ch;
    const old = this.ch;
    const ch = new Character(preset);
    ch.onStep = old.onStep;
    ch.root.position.copy(old.root.position);
    ch.face(this.yaw);
    if (old.root.parent) { old.root.parent.add(ch.root); old.root.parent.remove(old.root); }
    this.ch = ch;
    this.pos = ch.root.position;
    return ch;
  }
  place(x, z, yaw = 0) {
    this.pos.set(x, this.G.world.groundAt(x, z), z);
    this.yaw = yaw;
    this.ch.face(yaw);
    this.vel.set(0, 0);
  }
  update(dt, input, camYaw, opts) {
    const G = this.G, W = G.world;
    let sx = input.stick.x, sy = input.stick.y;
    const mag = Math.min(1, Math.hypot(sx, sy));
    const active = !this.frozen && G.canMove();
    let run = active && (input.down("sq") || (input.lastDevice === "touch" && mag > 0.96)) && mag > 0.2;
    if (this.noRun) run = false;
    const maxSpd = run ? this.runSpd : this.walk;
    let target = new THREE.Vector2();
    if (active && mag > 0.12) {
      if (opts.tank) {
        // classic tank controls
        this.yaw -= sx * 2.7 * dt;
        const fwd = sy > 0.2 ? 1 : sy < -0.2 ? -0.55 : 0;
        target.set(Math.sin(this.yaw), Math.cos(this.yaw)).multiplyScalar(fwd * maxSpd * Math.min(1, Math.abs(sy) * 1.2));
      } else {
        // camera-relative; basis holds steady while the stick is held so
        // camera cuts don't flip your direction mid-walk
        if (!this.holding) this.basis = camYaw;
        else this.basis += angDiff(this.basis, camYaw) * Math.min(1, dt * 0.8);
        this.holding = true;
        const fx = Math.sin(this.basis), fz = Math.cos(this.basis);
        const rx = -fz, rz = fx; // right vector (screen-right)
        const dx = fx * sy + rx * sx, dz = fz * sy + rz * sx;
        let sp = maxSpd * (mag < 0.5 ? 0.5 + mag * 0.5 : mag); // gentle analog ramp
        // backing away from something you're facing is slower than walking
        if (this.faceTarget && !run && (dx * Math.sin(this.yaw) + dz * Math.cos(this.yaw)) < -0.3 * Math.hypot(dx, dz)) sp *= 0.78;
        target.set(dx, dz).normalize().multiplyScalar(sp);
      }
    } else this.holding = false;
    // acceleration / friction
    const accel = target.lengthSq() > this.vel.lengthSq() ? 11 : 14;
    const dv = target.clone().sub(this.vel);
    const step = accel * dt;
    if (dv.length() <= step) this.vel.copy(target);
    else this.vel.add(dv.normalize().multiplyScalar(step));
    // facing
    if (this.faceTarget && !run) {
      const want = Math.atan2(this.faceTarget.x - this.pos.x, this.faceTarget.z - this.pos.z);
      this.yaw += angDiff(this.yaw, want) * Math.min(1, dt * 8);
    } else if (!opts.tank && this.vel.lengthSq() > 0.04 && target.lengthSq() > 0.01) {
      const want = Math.atan2(target.x, target.y);
      const d = angDiff(this.yaw, want);
      this.yaw += Math.sign(d) * Math.min(Math.abs(d), dt * (run ? 9 : 11));
      // don't charge forward while pivoting hard — kills the "skating" look
      const align = Math.max(0.25, Math.cos(Math.min(Math.abs(d), Math.PI / 2)));
      this.vel.multiplyScalar(lerp(1, align, Math.min(1, dt * 10)));
    }
    // integrate + collide
    const nx = this.pos.x + this.vel.x * dt, nz = this.pos.z + this.vel.y * dt;
    const p = { x: nx, z: nz };
    if (!this.ghost) W.resolve(p, this.radius);
    const realVx = (p.x - this.pos.x) / Math.max(dt, 1e-4), realVz = (p.z - this.pos.z) / Math.max(dt, 1e-4);
    this.pos.x = p.x;
    this.pos.z = p.z;
    // ground follow (stairs, pool steps)
    const gy = this.ghost ? this.pos.y : W.groundAt(this.pos.x, this.pos.z);
    this.pos.y += (gy - this.pos.y) * Math.min(1, dt * 14);
    this.ch.face(this.yaw);
    const spd = Math.hypot(realVx, realVz);
    this.speed = spd;
    this.ch.update(dt, spd, run && spd > 2.5);
    // stepping backwards while facing a threat: reverse the cycle
    if (this.faceTarget) {
      const fwd = Math.sin(this.yaw) * realVx + Math.cos(this.yaw) * realVz;
      if (fwd < -0.1) this.ch.phase -= dt * spd * 8.8;
    }
    W.checkTriggers(this.pos);
  }
}

// ================================================================
// Camera rig — fixed-yaw cinematic follow with zones & overrides
// ================================================================
export class CameraRig {
  constructor(cam) {
    this.cam = cam;
    this.cfg = { yaw: 0, pitch: 0.32, dist: 6, height: 1.4, fov: 55, lead: 0.6 };
    this.target = new THREE.Vector3();
    this.look = new THREE.Vector3();
    this.pos = new THREE.Vector3();
    this.override = null;
    this.shake = 0;
    this.t = 0;
    this.yaw = 0;
    this.lead = new THREE.Vector3();
  }
  set(cfg, snap = false) {
    this.cfg = { ...this.cfg, ...cfg };
    if (snap) this.snapNext = true;
  }
  shot(pos, look, snap = true, fov) {
    this.override = { pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look), fov };
    if (snap) this.snapNext = true;
  }
  release(snap = false) { this.override = null; if (snap) this.snapNext = true; }
  update(dt, player, zones) {
    this.t += dt;
    let cfg = this.cfg;
    if (zones) for (const z of zones) if (player.pos.x >= z.x0 && player.pos.x <= z.x1 && player.pos.z >= z.z0 && player.pos.z <= z.z1) { cfg = { ...cfg, ...z.cam }; break; }
    const k = this.snapNext ? 1 : Math.min(1, dt * 3.2);
    let wantPos, wantLook, fov = cfg.fov;
    if (this.override) {
      wantPos = this.override.pos;
      wantLook = this.override.look;
      fov = this.override.fov || fov;
    } else {
      // gentle look-ahead in the direction of travel
      const lv = tmpV.set(player.vel.x, 0, player.vel.y).multiplyScalar(cfg.lead ?? 0.6);
      this.lead.lerp(lv, Math.min(1, dt * 2));
      if (cfg.fixed) {
        wantPos = new THREE.Vector3(...cfg.fixed);
        wantLook = player.pos.clone().add(new THREE.Vector3(0, cfg.height, 0));
      } else {
        this.yaw += angDiff(this.yaw, cfg.yaw) * (this.snapNext ? 1 : Math.min(1, dt * 2.2));
        const focus = player.pos.clone().add(this.lead).add(new THREE.Vector3(0, cfg.height, 0));
        const back = new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(cfg.pitch), Math.sin(cfg.pitch), -Math.cos(this.yaw) * Math.cos(cfg.pitch));
        wantPos = focus.clone().add(back.multiplyScalar(cfg.dist));
        wantLook = focus;
      }
    }
    if (this.snapNext) { this.pos.copy(wantPos); this.look.copy(wantLook); }
    else {
      this.pos.lerp(wantPos, k);
      this.look.lerp(wantLook, Math.min(1, dt * 5));
    }
    this.snapNext = false;
    const c = this.cam;
    c.position.copy(this.pos);
    // handheld drift + shake
    c.position.x += Math.sin(this.t * 0.7) * 0.03 + (Math.random() - 0.5) * this.shake;
    c.position.y += Math.sin(this.t * 0.9) * 0.025 + (Math.random() - 0.5) * this.shake;
    c.lookAt(this.look);
    if (c.fov !== fov) { c.fov += (fov - c.fov) * Math.min(1, dt * 3); c.updateProjectionMatrix(); }
    this.shake = Math.max(0, this.shake - dt * 0.6);
    const f = new THREE.Vector3();
    c.getWorldDirection(f);
    this.facingYaw = Math.atan2(f.x, f.z);
  }
}

// ================================================================
// Watcher-AI: The Unmet only moves while nobody is looking at it.
// ================================================================
export function isWatched(player, target, cone = 0.62) {
  const dx = target.x - player.pos.x, dz = target.z - player.pos.z;
  return Math.abs(angDiff(player.yaw, Math.atan2(dx, dz))) < cone;
}
