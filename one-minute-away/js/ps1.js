// ============================================================
// ONE MINUTE AWAY — PS1 rendering core
// Low-res framebuffer, vertex snapping (jitter), affine texture
// warping, Gouraud vertex lighting, per-vertex fog, 15-bit colour
// with ordered dithering. Everything is drawn by one shader.
// ============================================================
import * as THREE from "../vendor/three.module.min.js";
export { THREE };

THREE.ColorManagement.enabled = false;

// Shared uniforms: every material references these objects, so
// changing a value here changes the whole world at once.
export const U = {
  uRes: { value: new THREE.Vector2(320, 240) },
  uSnap: { value: 1 },
  // how much PS1 affine texture warp to keep (0 = perspective-correct) and how coarse the vertex grid is
  uAffine: { value: 0.22 },
  uSnapRes: { value: new THREE.Vector2(480, 360) },
  uDither: { value: 1 },
  uTime: { value: 0 },
  uAmbient: { value: new THREE.Color(0.25, 0.25, 0.3) },
  uDirDir: { value: new THREE.Vector3(-0.3, -1, -0.2).normalize() },
  uDirCol: { value: new THREE.Color(0.2, 0.2, 0.25) },
  uPLPos: { value: [0, 1, 2, 3, 4, 5].map(() => new THREE.Vector3(0, -999, 0)) },
  uPLCol: { value: [0, 1, 2, 3, 4, 5].map(() => new THREE.Color(0, 0, 0)) },
  uPLRange: { value: [1, 1, 1, 1, 1, 1] },
  uFogColor: { value: new THREE.Color(0.1, 0.1, 0.12) },
  uFogNear: { value: 6 },
  uFogFar: { value: 32 },
  uSat: { value: 1 },
  uTint: { value: new THREE.Color(1, 1, 1) },
  uAdd: { value: new THREE.Color(0, 0, 0) },
};

const VERT = /* glsl */ `
uniform vec2 uRes;
uniform float uSnap;
uniform vec2 uSnapRes;
uniform float uTime;
uniform vec3 uAmbient;
uniform vec3 uDirDir;
uniform vec3 uDirCol;
uniform vec3 uPLPos[6];
uniform vec3 uPLCol[6];
uniform float uPLRange[6];
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uColor;
uniform float uUnlit;
uniform float uNoFog;
uniform vec2 uScroll;
uniform float uWave;
uniform float uEmissive;
uniform vec2 uUVk;
varying vec3 vUvw;
varying vec2 vUvP;
varying vec3 vLight;
varying float vFog;
#ifdef USE_COLOR
#endif
void main(){
  vec3 pos = position;
  vec4 wp = modelMatrix * vec4(pos, 1.0);
  if (uWave > 0.0) {
    wp.y += sin(wp.x * 0.9 + uTime * 1.3) * 0.05 * uWave + cos(wp.z * 1.1 + uTime * 0.9) * 0.05 * uWave;
  }
  vec3 n = normalize(mat3(modelMatrix) * normal);
  vec3 L = uAmbient;
  L += uDirCol * max(dot(n, -uDirDir), 0.0);
  for (int i = 0; i < 6; i++) {
    vec3 d = uPLPos[i] - wp.xyz;
    float dist = length(d);
    float att = clamp(1.0 - dist / uPLRange[i], 0.0, 1.0);
    att *= att;
    float lam = max(dot(n, d / max(dist, 0.001)), 0.0) * 0.75 + 0.25;
    L += uPLCol[i] * att * lam;
  }
  L = mix(L, vec3(1.0), uUnlit);
  L += vec3(uEmissive);
  vec3 vc = vec3(1.0);
  #ifdef USE_COLOR
    vc = color;
  #endif
  vLight = min(L, vec3(1.6)) * uColor * vc;
  vec4 vp = viewMatrix * wp;
  vec4 cp = projectionMatrix * vp;
  if (uSnap > 0.5 && cp.w > 0.0) {
    vec2 g = uSnapRes * 0.5;
    cp.xy = floor(cp.xy / cp.w * g + 0.5) / g * cp.w;
  }
  gl_Position = cp;
  vec2 uvv = uv * uUVk + uScroll * uTime;
  vUvw = vec3(uvv * cp.w, cp.w);
  vUvP = uvv;
  float depth = -vp.z;
  vFog = uNoFog > 0.5 ? 0.0 : clamp((depth - uFogNear) / max(uFogFar - uFogNear, 0.001), 0.0, 1.0);
}`;

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uHasMap;
uniform vec3 uFogColor;
uniform float uDither;
uniform float uOpacity;
uniform float uSat;
uniform vec3 uTint;
uniform vec3 uAdd;
uniform float uAdditive;
uniform float uAffine;
varying vec3 vUvw;
varying vec2 vUvP;
varying vec3 vLight;
varying float vFog;
float bayer(vec2 p){
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  mat4 m = mat4(0.0, 12.0, 3.0, 15.0,  8.0, 4.0, 11.0, 7.0,  2.0, 14.0, 1.0, 13.0,  10.0, 6.0, 9.0, 5.0);
  return m[x][y] / 16.0;
}
void main(){
  vec2 uv = mix(vUvP, vUvw.xy / vUvw.z, uAffine);
  vec4 tex = uHasMap > 0.5 ? texture2D(uMap, uv) : vec4(1.0);
  if (tex.a < 0.5) discard;
  vec3 c = tex.rgb * vLight;
  float g = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(g), c, uSat);
  if (uAdditive > 0.5) {
    c *= (1.0 - vFog);
  } else {
    c = mix(c, uFogColor, vFog);
  }
  c = c * uTint + uAdd;
  float d = (bayer(gl_FragCoord.xy) - 0.5) / 31.0 * 1.6 * uDither;
  c = floor(clamp(c + d, 0.0, 1.0) * 31.0 + 0.5) / 31.0;
  gl_FragColor = vec4(c, uOpacity);
}`;

const WHITE = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
WHITE.needsUpdate = true;

// mat({ map, color, unlit, noFog, additive, opacity, side, scroll, wave, vertexColors, emissive })
export function mat(o = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    vertexColors: !!o.vertexColors,
    uniforms: {
      ...U,
      uMap: { value: o.map || WHITE },
      uHasMap: { value: o.map ? 1 : 0 },
      uColor: { value: new THREE.Color(o.color ?? 0xffffff) },
      uUnlit: { value: o.unlit ? 1 : 0 },
      uNoFog: { value: o.noFog ? 1 : 0 },
      uOpacity: { value: o.opacity ?? 1 },
      uAdditive: { value: o.additive ? 1 : 0 },
      uScroll: { value: new THREE.Vector2(...(o.scroll || [0, 0])) },
      uWave: { value: o.wave || 0 },
      uEmissive: { value: o.emissive || 0 },
      uUVk: { value: new THREE.Vector2(...(o.map?.userData?.uvk || [1, 1])) },
    },
    side: o.side ?? THREE.FrontSide,
    transparent: !!(o.additive || (o.opacity != null && o.opacity < 1)),
    depthWrite: !(o.additive || (o.opacity != null && o.opacity < 1)),
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  return m;
}

// ---------------------------------------------------------------
// Procedural low-res textures
// ---------------------------------------------------------------
const texCache = new Map();
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
// painted texture pages (assets/tex) replace procedural ones by key
const OVR = new Map();
export function overrideTex(key, t) { OVR.set(key, t); }
export function canvasTex(w, h, draw, key) {
  if (key && OVR.has(key)) return OVR.get(key);
  if (key && texCache.has(key)) return texCache.get(key);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.userData.canvas = c;
  if (key) texCache.set(key, t);
  return t;
}
function noise(g, w, h, base, amt, seed = 1, size = 1) {
  const r = rng(seed);
  for (let y = 0; y < h; y += size)
    for (let x = 0; x < w; x += size) {
      const v = (r() - 0.5) * amt;
      g.fillStyle = `rgb(${clamp255(base[0] + v)},${clamp255(base[1] + v)},${clamp255(base[2] + v)})`;
      g.fillRect(x, y, size, size);
    }
}
const clamp255 = (v) => Math.max(0, Math.min(255, v | 0));

export const TEX = {
  // a painted page by name, or a procedural stand-in
  page: (key, fb = TEX.metal) => OVR.get(key) || fb(),
  asphalt: () =>
    canvasTex(64, 64, (g, w, h) => {
      noise(g, w, h, [70, 70, 74], 30, 3);
      const r = rng(9);
      g.fillStyle = "rgba(20,20,22,0.6)";
      for (let i = 0; i < 6; i++) g.fillRect((r() * w) | 0, (r() * h) | 0, 3 + ((r() * 6) | 0), 1);
    }, "asphalt"),
  road: () =>
    canvasTex(64, 64, (g, w, h) => {
      noise(g, w, h, [62, 62, 66], 26, 4);
      g.fillStyle = "#b8a76a";
      g.fillRect(30, 0, 2, 26);
      g.fillRect(30, 40, 2, 22);
    }, "road"),
  sidewalk: () =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, [118, 116, 110], 22, 5);
      g.fillStyle = "#5c5a56";
      g.fillRect(0, 0, w, 1);
      g.fillRect(0, 0, 1, h);
    }, "sidewalk"),
  brick: (tint = [120, 62, 50], key = "brick") =>
    canvasTex(64, 64, (g, w, h) => {
      noise(g, w, h, tint, 26, 7);
      g.fillStyle = "rgba(40,30,28,0.9)";
      for (let y = 0; y < h; y += 8) {
        g.fillRect(0, y, w, 1);
        for (let x = (y / 8) % 2 ? 0 : 8; x < w; x += 16) g.fillRect(x, y, 1, 8);
      }
    }, key),
  facade: (tint = [92, 80, 72], lit = 0.25, seed = 11, key) =>
    OVR.get(lit >= 0.5 ? "@windows" : seed % 3 ? "@facade" : "@facadeB") || canvasTex(64, 64, (g, w, h) => {
      noise(g, w, h, tint, 22, seed);
      const r = rng(seed * 3);
      for (let wx = 0; wx < 2; wx++) {
        const x = 8 + wx * 32, y = 14;
        g.fillStyle = "#2a2622";
        g.fillRect(x - 1, y - 1, 18, 26);
        const on = r() < lit;
        g.fillStyle = on ? (r() < 0.5 ? "#e8c27a" : "#d9a85a") : "#16181e";
        g.fillRect(x, y, 16, 24);
        g.fillStyle = on ? "#a8824a" : "#0e1014";
        g.fillRect(x + 7, y, 2, 24);
        g.fillRect(x, y + 11, 16, 2);
        g.fillStyle = "rgba(0,0,0,0.35)";
        g.fillRect(x - 2, y + 24, 20, 3);
      }
      g.fillStyle = "rgba(0,0,0,0.3)";
      g.fillRect(0, 62, w, 2);
    }, key || `facade${tint}${lit}${seed}`),
  concrete: (tint = [96, 96, 98], key = "concrete") =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, tint, 18, 13, 2);
    }, key),
  tile: (a = "#d8e4ea", b = "#9fb8c8", key = "tile") =>
    canvasTex(32, 32, (g, w, h) => {
      g.fillStyle = a;
      g.fillRect(0, 0, w, h);
      const r = rng(17);
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          g.fillStyle = r() < 0.18 ? b : a;
          g.fillRect(x * 8 + 1, y * 8 + 1, 7, 7);
        }
      g.fillStyle = "rgba(60,80,90,0.5)";
      for (let i = 0; i < 4; i++) {
        g.fillRect(i * 8, 0, 1, h);
        g.fillRect(0, i * 8, w, 1);
      }
    }, key),
  wood: (tint = [104, 70, 44], key = "wood") =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, tint, 14, 19);
      g.fillStyle = "rgba(30,18,10,0.55)";
      for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
      const r = rng(21);
      for (let i = 0; i < 10; i++) g.fillRect((r() * w) | 0, (r() * h) | 0, 4, 1);
    }, key),
  carpet: (tint = [80, 34, 40], key = "carpet") =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, tint, 16, 23);
      g.fillStyle = "rgba(255,220,160,0.12)";
      for (let i = 0; i < 32; i += 8) g.fillRect(i, 0, 1, h);
    }, key),
  wallpaper: (tint = [98, 92, 70], key = "wallpaper") =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, tint, 10, 29);
      g.fillStyle = "rgba(40,30,20,0.35)";
      for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 2, h);
      g.fillStyle = "rgba(255,240,200,0.12)";
      for (let y = 0; y < h; y += 8) for (let x = 4; x < w; x += 8) g.fillRect(x, y + 3, 2, 2);
    }, key),
  grass: () =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, [44, 62, 34], 24, 31);
    }, "grass"),
  water: (tint = [30, 80, 120], key = "water") =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, tint, 16, 37, 2);
      g.fillStyle = "rgba(200,240,255,0.25)";
      const r = rng(41);
      for (let i = 0; i < 14; i++) g.fillRect((r() * w) | 0, (r() * h) | 0, 4 + ((r() * 4) | 0), 1);
    }, key),
  metal: () =>
    canvasTex(16, 16, (g, w, h) => {
      noise(g, w, h, [110, 112, 118], 18, 43);
    }, "metal"),
  bark: () =>
    canvasTex(16, 32, (g, w, h) => {
      noise(g, w, h, [58, 44, 34], 26, 47);
      g.fillStyle = "rgba(20,14,10,0.5)";
      for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h);
    }, "bark"),
  leaves: (tint = [36, 58, 32], key = "leaves") =>
    canvasTex(32, 32, (g, w, h) => {
      noise(g, w, h, tint, 40, 53, 2);
    }, key),
  door: (tint = "#4a2e22", key = "door") =>
    canvasTex(32, 64, (g, w, h) => {
      g.fillStyle = tint;
      g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(4, 6, 24, 22);
      g.fillRect(4, 34, 24, 24);
      g.fillStyle = "rgba(255,255,255,0.08)";
      g.fillRect(5, 7, 22, 1);
      g.fillRect(5, 35, 22, 1);
      g.fillStyle = "#c8a85a";
      g.fillRect(24, 32, 3, 3);
      g.fillStyle = "rgba(0,0,0,0.6)";
      g.fillRect(0, 0, 1, h);
      g.fillRect(w - 1, 0, 1, h);
    }, key),
  sky: (top, mid, bot, key) =>
    canvasTex(8, 64, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, top);
      gr.addColorStop(0.55, mid);
      gr.addColorStop(1, bot);
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    }, key),
  glow: () =>
    canvasTex(32, 32, (g, w, h) => {
      const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.3, "rgba(255,255,255,0.75)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      // threshold alpha so the shader's alpha test keeps a soft-ish disk
      const d = g.getImageData(0, 0, w, h);
      for (let i = 0; i < d.data.length; i += 4) {
        const a = d.data[i + 3] / 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = 255 * a;
        d.data[i + 3] = 255;
      }
      g.putImageData(d, 0, 0);
    }, "glow"),
  face: (skin = "#c89a78", hair = "#2a1a12", eyes = true, key) =>
    canvasTex(16, 16, (g, w, h) => {
      g.fillStyle = skin;
      g.fillRect(0, 0, w, h);
      g.fillStyle = hair;
      g.fillRect(0, 0, w, 4);
      if (eyes) {
        g.fillStyle = "#1a1210";
        g.fillRect(4, 7, 2, 2);
        g.fillRect(10, 7, 2, 2);
        g.fillStyle = "rgba(80,30,30,0.6)";
        g.fillRect(6, 12, 4, 1);
      }
    }, key || `face${skin}${hair}${eyes}`),
  blurFace: () =>
    canvasTex(16, 16, (g, w, h) => {
      noise(g, w, h, [180, 150, 130], 70, 59, 2);
    }, "blurface"),
  cloth: (rgb, key) =>
    canvasTex(16, 16, (g, w, h) => {
      noise(g, w, h, rgb, 14, 61);
    }, key || `cloth${rgb}`),
  text: (str, o = {}) => {
    const w = o.w || 64, h = o.h || 16;
    return canvasTex(w, h, (g) => {
      g.fillStyle = o.bg || "#1e3a2a";
      g.fillRect(0, 0, w, h);
      if (o.border !== false) {
        g.fillStyle = o.fg || "#e8e8d8";
        g.fillRect(0, 0, w, 1);
        g.fillRect(0, h - 1, w, 1);
      }
      g.fillStyle = o.fg || "#e8e8d8";
      g.textAlign = "center";
      g.textBaseline = "middle";
      let lines = String(str).split("\n");
      let size = o.size || 9;
      const fit = () => { g.font = `bold ${size}px monospace`; return Math.max(...lines.map((l) => g.measureText(l).width)) <= w - 4 && lines.length * size <= h; };
      // wrap long single lines onto two rows when there is vertical room, then shrink to fit
      if (!fit() && lines.length === 1 && h >= size * 2) {
        const words = lines[0].split(" ");
        let best = 1, bd = 1e9;
        for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(" ").length, b = words.slice(i).join(" ").length; if (Math.abs(a - b) < bd) { bd = Math.abs(a - b); best = i; } }
        lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      }
      while (!fit() && size > 5) size--;
      lines.forEach((ln, i) => g.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size + 1));
    }, o.key || `text:${str}:${w}x${h}:${o.bg}:${o.fg}`);
  },
  clockFace: (label = "4:04") =>
    (label === "4:04" && OVR.get("@clockface")) || canvasTex(64, 64, (g) => {
      g.fillStyle = "#0b0b0d";
      g.fillRect(0, 0, 64, 64);
      g.fillStyle = "#d8d0b8";
      g.beginPath();
      g.arc(32, 32, 30, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#1a1a1a";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        g.fillRect(32 + Math.sin(a) * 25 - 1, 32 - Math.cos(a) * 25 - 1, 3, 3);
      }
      // 4:04
      g.strokeStyle = "#151515";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(32, 32);
      const ha = ((4 + 4 / 60) / 12) * Math.PI * 2;
      g.lineTo(32 + Math.sin(ha) * 14, 32 - Math.cos(ha) * 14);
      g.stroke();
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(32, 32);
      const ma = (4 / 60) * Math.PI * 2;
      g.lineTo(32 + Math.sin(ma) * 22, 32 - Math.cos(ma) * 22);
      g.stroke();
      g.fillStyle = "#7a1010";
      g.font = "bold 8px monospace";
      g.textAlign = "center";
      g.fillText(label, 32, 48);
    }, "clock" + label),
};

// ---------------------------------------------------------------
// Geometry helpers — world-scaled UVs so textures tile correctly
// ---------------------------------------------------------------
export function boxGeo(w, h, d, su = 1, sv = su) {
  // big faces are cut into ~1.5 m pieces: with affine texturing a single
  // huge quad makes brick and windows bend and swim as the camera moves
  const seg = (v) => Math.max(1, Math.min(12, Math.round(v / 1.5)));
  const geo = new THREE.BoxGeometry(w, h, d, seg(w), seg(h), seg(d));
  const uv = geo.attributes.uv, idx = geo.index;
  // face order: +x, -x, +y, -y, +z, -z (one group each)
  const spans = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  geo.groups.forEach((g, f) => {
    const [a, b] = spans[f];
    const seen = new Set();
    for (let k = g.start; k < g.start + g.count; k++) {
      const v = idx.getX(k);
      if (seen.has(v)) continue;
      seen.add(v);
      uv.setXY(v, (uv.getX(v) * a) / su, (uv.getY(v) * b) / sv);
    }
  });
  return geo;
}
export function planeGeo(w, d, scale = 2, seg = 0) {
  const sx = seg || Math.max(1, Math.round(w / 2));
  const sz = seg || Math.max(1, Math.round(d / 2));
  const geo = new THREE.PlaneGeometry(w, d, Math.min(sx, 40), Math.min(sz, 40));
  geo.rotateX(-Math.PI / 2);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / scale, (uv.getY(i) * d) / scale);
  return geo;
}
export function wallGeo(w, h, su = 2, sv = su) {
  const geo = new THREE.PlaneGeometry(w, h, Math.max(1, Math.min(20, Math.round(w / 2))), Math.max(1, Math.round(h / 2)));
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / su, (uv.getY(i) * h) / sv);
  return geo;
}
