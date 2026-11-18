// ============================================================
// Runtime assets cut from the art boards: character atlases,
// entity / cast sprites, props, location backdrops, portraits.
// Everything is point-sampled like PS1 VRAM pages.
// ============================================================
import { THREE } from "./ps1.js";

const BASE = "assets/";
export const A = { tex: {}, img: {}, sheets: null };

const loader = new THREE.TextureLoader();
function tex(url) {
  return new Promise((res) => {
    loader.load(url, (t) => {
      t.magFilter = THREE.NearestFilter;
      t.minFilter = THREE.NearestFilter;
      t.generateMipmaps = false;
      t.colorSpace = THREE.NoColorSpace;
      res(t);
    }, undefined, () => res(null));
  });
}

export const BACKDROPS = ["ocean", "hallway", "bathhouse", "dance", "waterfront", "tower", "almost", "car", "park", "unread", "cords", "bedroom"];
// sprite sheets (turnarounds, walk cycles, poses) cut from the green-screen boards
const SHEETS = ["rufki", "argjila", "other", "unmet", "unsaid", "keeper", "kidR", "kidA", "confidante", "friend", "dancer"];
export const PROPS = ["sedan", "payphone", "flipphone", "door", "clock", "photo", "towel", "map", "cart", "chair", "rotary", "book"];
export const PORTRAITS = ["rufki", "argjila", "rufki_big", "argjila_big", "other", "unmet", "unsaid", "keeper", "kid_rufki", "kid_argjila", "confidante", "friend", "dancer"];

export async function loadAssets(onProgress) {
  const jobs = [];
  let done = 0;
  const total = SHEETS.length + PROPS.length + BACKDROPS.length + 1;
  const tick = () => onProgress && onProgress(++done / total);
  const add = (key, url) => jobs.push(tex(url).then((t) => { A.tex[key] = t; tick(); }));
  SHEETS.forEach((s) => add("sh_" + s, BASE + "sheets/" + s + ".png"));
  PROPS.forEach((p) => add("prop_" + p, BASE + "spr/prop_" + p + ".png"));
  BACKDROPS.forEach((b) => add("bg_" + b, BASE + "bg/" + b + ".png"));
  jobs.push(fetch(BASE + "sheets/sheets.json").then((r) => r.json()).then((j) => { A.sheets = j; tick(); }));
  await Promise.all(jobs);
  return A;
}

export const portraitURL = (who) => (PORTRAITS.includes(who) ? `${BASE}por/${who}.png` : null);
export const propURL = (p) => `${BASE}spr/prop_${p}.png`;
export const bgURL = (b) => `${BASE}bg/${b}.png`;
