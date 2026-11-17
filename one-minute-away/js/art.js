// ============================================================
// Hand-"painted" pixel photographs and the animated TV screen.
// Every image is drawn at 96x72 and shown pixelated.
// ============================================================
import { canvasTex } from "./ps1.js";

function rnd(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function person(g, x, y, h, o = {}) {
  // x,y = feet; h = height in px
  const w = Math.max(3, Math.round(h * 0.28));
  const hd = Math.max(2, Math.round(h * 0.18));
  g.fillStyle = o.legs || "#2a2a34";
  g.fillRect(x - Math.floor(w / 2), y - Math.round(h * 0.45), Math.ceil(w / 2) - 0.5, Math.round(h * 0.45));
  g.fillRect(x + 0.5, y - Math.round(h * 0.45), Math.ceil(w / 2) - 0.5, Math.round(h * 0.45));
  g.fillStyle = o.body || "#3a3e4a";
  g.fillRect(x - Math.floor(w / 2) - 1, y - Math.round(h * 0.82), w + 2, Math.round(h * 0.4));
  g.fillStyle = o.skin || "#c89a78";
  g.fillRect(x - Math.floor(hd / 2), y - h, hd, hd);
  g.fillStyle = o.hair || "#22160f";
  g.fillRect(x - Math.floor(hd / 2), y - h, hd, Math.max(1, Math.round(hd * 0.35)));
  if (o.long) g.fillRect(x - Math.floor(hd / 2) - 1, y - h, hd + 2, Math.round(hd * 1.5));
  if (o.scratch) {
    g.fillStyle = "#e8e4d8";
    for (let i = 0; i < 7; i++) g.fillRect(x - hd + (i % 3), y - h - 1 + i, hd + 2, 1);
  }
  if (o.blank) { g.fillStyle = o.skin || "#c89a78"; g.fillRect(x - Math.floor(hd / 2), y - h, hd, hd); }
}
function sky(g, a, b, h = 72) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; g.fillRect(0, 0, 96, h);
}
function street(g, y, col = "#4a4a4e", walk = "#7a766c") {
  g.fillStyle = walk; g.fillRect(0, y, 96, 72 - y);
  g.fillStyle = col; g.fillRect(0, y + 8, 96, 72 - y - 8);
}
function buildings(g, y, seed = 3, tone = ["#4a3a34", "#5a4a40", "#3e3a3a"]) {
  const r = rnd(seed);
  let x = 0;
  while (x < 96) {
    const w = 14 + ((r() * 12) | 0), h = 20 + ((r() * 24) | 0);
    g.fillStyle = tone[(r() * tone.length) | 0];
    g.fillRect(x, y - h, w, h);
    g.fillStyle = "rgba(240,200,120,0.6)";
    for (let wy = y - h + 4; wy < y - 4; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (r() < 0.3) g.fillRect(wx, wy, 2, 3);
    x += w + 1;
  }
}
function age(g, seed = 1, k = 1) {
  const r = rnd(seed), d = g.getImageData(0, 0, 96, 72);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (r() - 0.5) * 26 * k;
    // warm sepia shift + grain
    d.data[i] = Math.min(255, d.data[i] * 0.95 + 14 + n);
    d.data[i + 1] = Math.min(255, d.data[i + 1] * 0.92 + 8 + n);
    d.data[i + 2] = Math.min(255, d.data[i + 2] * 0.85 + n);
    const px = (i / 4) % 96, py = (i / 4 / 96) | 0;
    const v = Math.hypot(px - 48, py - 36) / 60;
    const m = 1 - Math.max(0, v - 0.55) * 1.2;
    d.data[i] *= m; d.data[i + 1] *= m; d.data[i + 2] *= m;
  }
  g.putImageData(d, 0, 0);
}

const R = { body: "#2c2f3a", legs: "#23252e", skin: "#c49474", hair: "#1c1410" };
const A = { body: "#9a8270", legs: "#2c2a34", skin: "#d6a888", hair: "#3a2216", long: true };
const KR = { body: "#3c5a8c", legs: "#323850", skin: "#c49474", hair: "#1c1410" };
const KA = { body: "#aa4650", legs: "#3c3246", skin: "#d6a888", hair: "#3a2216", long: true };

export function pic(kind) {
  const c = document.createElement("canvas");
  c.width = 96; c.height = 72;
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  let seed = 7;
  switch (kind) {
    case "childhood":
      sky(g, "#8aa0b0", "#c8c0a8"); buildings(g, 46, 5); street(g, 46);
      person(g, 30, 64, 22, KR); person(g, 66, 64, 21, { ...KA, scratch: true });
      seed = 11; break;
    case "meeting":
      sky(g, "#a8b8c4", "#e0d0b0"); buildings(g, 44, 8); street(g, 44, "#55555a", "#8a8676");
      g.fillStyle = "#5a3e2a"; g.fillRect(34, 52, 30, 3); g.fillRect(36, 55, 2, 6); g.fillRect(60, 55, 2, 6);
      person(g, 40, 62, 26, R); person(g, 56, 62, 24, A);
      seed = 12; break;
    case "pass":
      sky(g, "#8a929a", "#b4aea0"); buildings(g, 42, 9); street(g, 42);
      person(g, 22, 62, 24, R); person(g, 76, 66, 24, A);
      g.fillStyle = "#e8e4d8"; g.font = "7px monospace"; g.fillText("WE PASS WITHOUT SPEAKING", 2, 8);
      seed = 13; break;
    case "never":
      sky(g, "#7a7e86", "#a09a90"); buildings(g, 44, 10); street(g, 44);
      g.fillStyle = "#5a3e2a"; g.fillRect(34, 52, 30, 3); g.fillRect(36, 55, 2, 6); g.fillRect(60, 55, 2, 6);
      person(g, 42, 62, 26, R);
      g.fillStyle = "#e8e4d8"; g.font = "7px monospace"; g.fillText("SHE NEVER ARRIVES", 14, 8);
      seed = 14; break;
    case "alone":
      sky(g, "#5a5e66", "#7a7670"); street(g, 40, "#3a3a3e", "#5a5852");
      person(g, 48, 64, 30, R);
      g.fillStyle = "#e8e4d8"; g.font = "7px monospace"; g.fillText("WHAT IF SHE NEVER CAME?", 4, 70);
      seed = 15; break;
    case "authentic":
      sky(g, "#b0c4d4", "#f0d8b0"); buildings(g, 44, 8); street(g, 44, "#55555a", "#8a8676");
      g.fillStyle = "#5a3e2a"; g.fillRect(34, 52, 30, 3); g.fillRect(36, 55, 2, 6); g.fillRect(60, 55, 2, 6);
      person(g, 44, 62, 26, R); person(g, 52, 62, 24, A);
      g.fillStyle = "#ffe8b0"; g.fillRect(46, 40, 4, 3);
      seed = 16; break;
    case "couple":
      sky(g, "#1a2a50", "#4a6aa0"); g.fillStyle = "#2a5a8a"; g.fillRect(0, 48, 96, 24);
      g.fillStyle = "#8ad0f0"; for (let i = 0; i < 12; i++) g.fillRect((i * 17) % 96, 50 + (i * 7) % 20, 6, 1);
      person(g, 44, 50, 28, R); person(g, 51, 50, 26, A);
      seed = 17; break;
    case "iloveyou":
      sky(g, "#1e1a2a", "#4a3050"); g.fillStyle = "#3a2a2a"; g.fillRect(0, 50, 96, 22);
      g.fillStyle = "#ffcf80"; g.fillRect(70, 18, 6, 8);
      person(g, 42, 64, 30, R); person(g, 52, 64, 28, A);
      g.fillStyle = "#e8b4a4"; g.font = "7px monospace"; g.fillText('"I LOVE YOU."', 26, 10);
      seed = 18; break;
    case "families":
      g.fillStyle = "#5a4030"; g.fillRect(0, 0, 96, 72); g.fillStyle = "#e8d8b0"; g.fillRect(10, 40, 76, 6);
      for (let i = 0; i < 7; i++) person(g, 14 + i * 11, 66, 22 + (i % 3) * 3, i === 3 ? R : i === 4 ? A : { body: ["#6a5a4a", "#4a5a6a", "#7a4a4a"][i % 3], legs: "#2a2a2a" });
      g.fillStyle = "#ffe0a0"; g.fillRect(44, 4, 8, 6);
      seed = 19; break;
    case "ordinary":
      sky(g, "#c08050", "#f0c080"); g.fillStyle = "#3a3a40"; g.fillRect(0, 44, 96, 28);
      g.fillStyle = "#6a6e80"; g.fillRect(20, 40, 40, 14); g.fillStyle = "#2a3040"; g.fillRect(28, 34, 22, 8);
      g.fillStyle = "#111"; g.fillRect(24, 52, 7, 5); g.fillRect(50, 52, 7, 5);
      person(g, 70, 64, 24, A); person(g, 78, 64, 26, R);
      seed = 20; break;
    case "ring":
      g.fillStyle = "#1a3a5a"; g.fillRect(0, 0, 96, 72);
      g.strokeStyle = "#e8c860"; g.lineWidth = 3; g.beginPath(); g.arc(30, 40, 10, 0, Math.PI * 2); g.stroke();
      g.fillStyle = "#c8f0ff"; g.fillRect(28, 28, 4, 3);
      g.fillStyle = "#d8d0c0"; g.fillRect(50, 20, 40, 34);
      g.fillStyle = "#8a6a4a"; g.fillRect(56, 34, 26, 16); g.fillStyle = "#6a2a20"; g.beginPath(); g.moveTo(53, 34); g.lineTo(69, 24); g.lineTo(85, 34); g.fill();
      g.fillStyle = "#ffe0a0"; g.fillRect(66, 40, 5, 10);
      person(g, 58, 53, 12, R); person(g, 63, 53, 11, A); person(g, 73, 53, 6, { body: "#a0a0a0", blank: true, skin: "#b0a090" }); person(g, 78, 53, 5, { body: "#a0a0a0", blank: true, skin: "#b0a090" });
      seed = 21; break;
    case "one":
      sky(g, "#a0a8b0", "#d0c8b8"); buildings(g, 46, 12); street(g, 46);
      person(g, 48, 64, 28, R);
      g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(56, 36, 10, 28);
      seed = 22; break;
    case "tv":
      sky(g, "#3a3a44", "#55555a"); street(g, 40, "#2a2a2e", "#44443e");
      person(g, 20, 52, 14, KR); person(g, 76, 70, 14, KA);
      seed = 23; break;
    case "book":
      g.fillStyle = "#3a2a1e"; g.fillRect(0, 0, 96, 72);
      g.fillStyle = "#6a2a24"; g.fillRect(18, 10, 60, 52); g.fillStyle = "#8a3a30"; g.fillRect(20, 12, 56, 48);
      g.fillStyle = "#e8d8a8"; g.font = "bold 7px monospace"; g.fillText("ONE MINUTE", 29, 26); g.fillText("AWAY", 40, 36);
      g.fillStyle = "#d8c890"; g.beginPath(); g.arc(48, 48, 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#3a2a1e"; g.fillRect(47, 43, 1, 5); g.fillRect(48, 48, 3, 1);
      seed = 24; break;
    case "message":
      g.fillStyle = "#06120e"; g.fillRect(0, 0, 96, 72);
      g.fillStyle = "#7fd8a8"; g.font = "7px monospace"; g.fillText("UNANSWERED (37)", 4, 10);
      for (let i = 0; i < 6; i++) { g.fillStyle = "#1a3a2e"; g.fillRect(4, 16 + i * 9, 70 - (i * 9) % 30, 6); }
      seed = 25; break;
  }
  if (kind !== "message") age(g, seed);
  return c;
}

// animated television: two children on opposite sidewalks walking
// toward the same corner; the footage freezes just before they meet.
export function tvScreen() {
  const tex = canvasTex(48, 36, () => {}, null);
  const c = tex.userData.canvas, g = c.getContext("2d");
  let t = 0;
  const draw = (mode) => {
    if (mode === "static") {
      const d = g.createImageData(48, 36);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      g.putImageData(d, 0, 0);
    } else if (mode === "off") {
      g.fillStyle = "#0b0d10"; g.fillRect(0, 0, 48, 36);
    } else {
      g.fillStyle = "#3a3c44"; g.fillRect(0, 0, 48, 36);
      g.fillStyle = "#55534c"; g.fillRect(0, 14, 48, 3); g.fillRect(0, 27, 48, 3);
      g.fillStyle = "#2a2a2e"; g.fillRect(0, 17, 48, 10);
      const k = Math.min(1, t / 6);
      const x1 = 4 + k * 18, x2 = 44 - k * 18;
      const bob = (Math.sin(t * 9) > 0 ? 1 : 0);
      g.fillStyle = "#3c5a8c"; g.fillRect(x1 | 0, 9 - bob, 3, 4); g.fillStyle = "#c49474"; g.fillRect(x1 | 0, 7 - bob, 3, 2);
      g.fillStyle = "#aa4650"; g.fillRect(x2 | 0, 23 - bob, 3, 4); g.fillStyle = "#d6a888"; g.fillRect(x2 | 0, 21 - bob, 3, 2);
      // scanline roll
      g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, (t * 20) % 36, 48, 2);
    }
    tex.needsUpdate = true;
  };
  let mode = "static";
  return {
    tex,
    set(m) { mode = m; if (m === "play") t = 0; },
    update(dt) { if (mode === "play") t += dt; if (mode !== "frozen") draw(mode === "frozen" ? "play" : mode); },
  };
}
