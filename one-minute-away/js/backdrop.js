// ============================================================
// Pre-rendered rooms, the PS1 survival-horror way.
// A painted 320×320 location panel is the background; a fixed
// camera is solved from its vanishing point so the invisible floor
// lines up with the painting; 3D characters walk on that floor and
// slip behind foreground objects through depth "occluders" that
// re-draw the painting in front of them.
//
// cfg = {
//   img: "hallway",            // assets/bg/<img>.png
//   vp: [u, v],                // vanishing point of the main floor axis (320px frame)
//   fov: 58, h: 1.6,           // vertical fov of the full square frame, camera height (m)
//   walk: [[x,y],...] | [[[x,y]...], ...],   // floor polygon(s) in image px
//   block: [[[x,y]...], ...],  // holes in the floor (pool, bench...)
//   occ: [{ poly:[[x,y]...], foot:[x,y] }], // foreground cut-outs and where they stand
//   pan: "auto" | number,      // vertical framing within the 320 frame (0..80)
// }
// ============================================================
import { THREE, U } from "./ps1.js";
import { A } from "./assets.js";

const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FS_BG = `
uniform sampler2D uMap; uniform float uPan; uniform float uZoom; uniform vec2 uFocus; uniform float uBlur;
uniform vec3 uTint; uniform vec3 uAdd; uniform float uSat; uniform float uGlitch; uniform float uTime; uniform float uDarken;
varying vec2 vUv;
float h(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  // window of the 320x320 frame: x 0..320, y pan..pan+240 (image y down)
  vec2 px = vec2(vUv.x * 320.0, uPan + (1.0 - vUv.y) * 240.0);
  if (uGlitch > 0.0) {
    float row = floor(px.y / 3.0);
    float j = step(1.0 - uGlitch * 0.35, h(row + floor(uTime * 24.0)));
    px.x += (h(row * 7.1 + floor(uTime * 30.0)) - 0.5) * 40.0 * j * uGlitch;
  }
  px = (px - uFocus) / uZoom + uFocus;
  vec2 uv = vec2(px.x / 320.0, 1.0 - px.y / 320.0);
  vec3 c = texture2D(uMap, uv).rgb;
  if (uBlur > 0.0) {
    float b = uBlur / 320.0;
    c = (c * 2.0 + texture2D(uMap, uv + vec2(b, 0.0)).rgb + texture2D(uMap, uv - vec2(b, 0.0)).rgb
         + texture2D(uMap, uv + vec2(0.0, b)).rgb + texture2D(uMap, uv - vec2(0.0, b)).rgb) / 6.0;
  }
  float g = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(g), c, uSat);
  c = c * uTint * (1.0 - uDarken) + uAdd;
  gl_FragColor = vec4(c, 1.0);
}`;
// occluders sample the painting in screen space so they match it exactly
const VS_OCC = `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FS_OCC = `
uniform sampler2D uMap; uniform float uPan; uniform vec3 uTint; uniform vec3 uAdd; uniform float uSat; uniform float uDarken;
void main(){
  vec2 px = vec2(gl_FragCoord.x, uPan + (240.0 - gl_FragCoord.y));
  vec3 c = texture2D(uMap, vec2(px.x / 320.0, 1.0 - px.y / 320.0)).rgb;
  float g = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(g), c, uSat);
  gl_FragColor = vec4(c * uTint * (1.0 - uDarken) + uAdd, 1.0);
}`;

const asPolys = (p) => (!p ? [] : Array.isArray(p[0][0]) ? p : [p]);

export function pointInPoly(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
function closestOnPoly(x, z, poly) {
  let best = null, bd = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j], [bx, bz] = poly[i];
    const dx = bx - ax, dz = bz - az;
    const L = dx * dx + dz * dz || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
    const px = ax + dx * t, pz = az + dz * t;
    const d = (px - x) ** 2 + (pz - z) ** 2;
    if (d < bd) { bd = d; best = [px, pz]; }
  }
  return best;
}

export class Backdrop {
  constructor(W, G, cfg) {
    this.W = W;
    this.G = G;
    this.cfg = cfg;
    this.panY = typeof cfg.pan === "number" ? cfg.pan : 40;
    this.zoom = 1;
    this.focus = new THREE.Vector2(160, 160);
    this.blur = 0;
    this.glitch = 0;
    this.darken = 0;
    // ---- solve the camera from the vanishing point
    const fov = cfg.fov || 58, t = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
    const [u, v] = cfg.vp;
    const dx = (u / 160 - 1) * t, dy = (1 - v / 160) * t;
    const phi = -Math.atan(dy);
    const xp = dx, zp = dy * Math.sin(phi) - Math.cos(phi);
    const psi = Math.PI + Math.atan2(xp, -zp);
    const cam = (this.cam = new THREE.PerspectiveCamera(fov, 1, 0.05, 200));
    cam.position.set(cfg.x || 0, cfg.h || 1.6, cfg.z || 0);
    cam.rotation.order = "YXZ";
    cam.rotation.set(phi + (cfg.pitch || 0), psi + (cfg.yaw || 0), cfg.roll || 0);
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    this.fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    // ---- floor polygons
    this.walk = asPolys(cfg.walk).map((p) => p.map(([x, y]) => this.floor(x, y)));
    this.block = asPolys(cfg.block).map((p) => p.map(([x, y]) => this.floor(x, y)));
    // ---- background quad
    const tex = A.tex["bg_" + cfg.img];
    this.uni = {
      uMap: { value: tex }, uPan: { value: this.panY }, uZoom: { value: 1 }, uFocus: { value: this.focus }, uBlur: { value: 0 },
      uTint: U.uTint, uAdd: U.uAdd, uSat: U.uSat, uGlitch: { value: 0 }, uTime: U.uTime, uDarken: { value: 0 },
    };
    this.bgScene = new THREE.Scene();
    this.bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS_BG, uniforms: this.uni, depthTest: false, depthWrite: false }));
    this.bgScene.add(q);
    this.bgMat = q.material;
    // ---- occluders
    this.occMat = new THREE.ShaderMaterial({ vertexShader: VS_OCC, fragmentShader: FS_OCC, uniforms: { uMap: this.uni.uMap, uPan: this.uni.uPan, uTint: U.uTint, uAdd: U.uAdd, uSat: U.uSat, uDarken: this.uni.uDarken } });
    this.occluders = [];
    for (const o of cfg.occ || []) this.addOccluder(o.poly, o.foot, o.depth);
  }

  // image px (320 frame) → ray from the camera
  ray(x, y) {
    const p = new THREE.Vector3(x / 160 - 1, 1 - y / 160, 0.5).unproject(this.cam);
    return p.sub(this.cam.position).normalize();
  }
  // image px → point on the floor (y = 0) as [x, z]
  floor(x, y, fy = 0) {
    const d = this.ray(x, y);
    const c = this.cam.position;
    const k = d.y < -1e-4 ? (fy - c.y) / d.y : 80;
    return [c.x + d.x * k, c.z + d.z * k];
  }
  floorV(x, y) { const [a, b] = this.floor(x, y); return new THREE.Vector3(a, 0, b); }
  // world → image px in the full 320 frame
  project(v) {
    const p = v.clone().project(this.cam);
    return [(p.x + 1) * 160, (1 - p.y) * 160];
  }

  addOccluder(poly, foot, depthOverride) {
    const F = this.floorV(...foot);
    const depth = depthOverride ?? F.clone().sub(this.cam.position).dot(this.fwd);
    const pts = poly.map(([x, y]) => {
      const d = this.ray(x, y);
      return this.cam.position.clone().add(d.multiplyScalar(depth / d.dot(this.fwd)));
    });
    const tris = THREE.ShapeUtils.triangulateShape(poly.map(([x, y]) => new THREE.Vector2(x, -y)), []);
    const g = new THREE.BufferGeometry();
    const arr = [];
    for (const tr of tris) for (const i of tr) arr.push(pts[i].x, pts[i].y, pts[i].z);
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    const m = new THREE.Mesh(g, this.occMat);
    m.material.side = THREE.DoubleSide;
    m.frustumCulled = false;
    this.W.add(m);
    this.occluders.push(m);
    return m;
  }

  // keep a position on the painted floor
  constrain(pos, rad) {
    if (this.walk.length && !this.walk.some((p) => pointInPoly(pos.x, pos.z, p))) {
      let best = null, bd = Infinity;
      for (const p of this.walk) {
        const c = closestOnPoly(pos.x, pos.z, p);
        const d = (c[0] - pos.x) ** 2 + (c[1] - pos.z) ** 2;
        if (d < bd) { bd = d; best = c; }
      }
      if (best) {
        // nudge slightly inside
        const cx = this.walk[0].reduce((a, q) => a + q[0], 0) / this.walk[0].length, cz = this.walk[0].reduce((a, q) => a + q[1], 0) / this.walk[0].length;
        const k = 0.02 / Math.max(0.001, Math.hypot(cx - best[0], cz - best[1]));
        pos.x = best[0] + (cx - best[0]) * k;
        pos.z = best[1] + (cz - best[1]) * k;
      }
    }
    for (const p of this.block) {
      if (pointInPoly(pos.x, pos.z, p)) {
        const c = closestOnPoly(pos.x, pos.z, p);
        const ox = c[0] - pos.x, oz = c[1] - pos.z, L = Math.hypot(ox, oz) || 1;
        pos.x = c[0] + (ox / L) * 0.02;
        pos.z = c[1] + (oz / L) * 0.02;
      }
    }
  }

  // apply the camera every frame (the rig is locked in backdrop rooms)
  apply(camera, dt, focus) {
    const G = this.G;
    const ov = G.rig.override;
    camera.position.copy(this.cam.position);
    camera.quaternion.copy(this.cam.quaternion);
    camera.fov = this.cam.fov;
    camera.aspect = 1;
    if (this.cfg.pan === "auto" && focus && !this.panLock) {
      const [, y] = this.project(focus.clone().add(new THREE.Vector3(0, 1.1, 0)));
      const want = Math.max(0, Math.min(80, y - 118));
      this.panY += (want - this.panY) * Math.min(1, dt * 2.5);
    }
    // close-ups: zoom the painting around a point and soften it
    if (ov && ov.bdZoom) {
      this.zoom += (ov.bdZoom - this.zoom) * Math.min(1, dt * 3);
      this.focus.set(ov.bdFocus[0], ov.bdFocus[1]);
    } else this.zoom += (1 - this.zoom) * Math.min(1, dt * 3);
    camera.setViewOffset(320, 320, 0, Math.round(this.panY), 320, 240);
    if (this.zoom > 1.001) {
      // zoom the 3D camera to match: narrow the fov about the focus point
      const fx = this.focus.x, fy = this.focus.y, z = this.zoom;
      camera.setViewOffset(320 * z, 320 * z, fx * z - fx, (fy + 0) * z - fy + Math.round(this.panY), 320, 240);
    }
    camera.updateProjectionMatrix();
    this.uni.uPan.value = Math.round(this.panY);
    this.uni.uZoom.value = this.zoom;
    this.uni.uBlur.value = this.blur;
    this.uni.uGlitch.value = this.glitch;
    this.uni.uDarken.value = this.darken;
  }

  render(renderer) {
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(this.bgScene, this.bgCam);
    renderer.clearDepth();
  }

  dispose(camera) {
    camera.clearViewOffset();
    camera.aspect = 4 / 3;
    camera.updateProjectionMatrix();
    this.bgMat.dispose();
    this.occMat.dispose();
  }

  // debug: floor grid + 1.8 m poles so the solve can be checked by eye
  debugGrid(THREEmat) {
    const grp = new THREE.Group();
    const lm = new THREE.LineBasicMaterial({ color: 0x00ff88 });
    const pts = [];
    for (let i = -6; i <= 6; i++) { pts.push(new THREE.Vector3(i, 0.01, 0), new THREE.Vector3(i, 0.01, 30)); }
    for (let k = 0; k <= 30; k++) { pts.push(new THREE.Vector3(-6, 0.01, k), new THREE.Vector3(6, 0.01, k)); }
    grp.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lm));
    for (const p of this.walk) {
      const loop = p.map(([x, z]) => new THREE.Vector3(x, 0.02, z));
      grp.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(loop), new THREE.LineBasicMaterial({ color: 0xff3355 })));
    }
    this.W.add(grp);
    return grp;
  }
}
