// ============================================================
// Runtime assets cut from the art boards: character atlases,
// entity / cast sprites, props, location backdrops, portraits.
// Everything is point-sampled like PS1 VRAM pages.
// ============================================================
import { THREE, overrideTex } from "./ps1.js";

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
const SHEETS = ["rufki", "argjila", "other", "unmet", "unsaid", "keeper", "kidR", "kidA", "confidante", "friend", "dancer", "passerby", "passerbyW", "passerbyO", "passerbyK"];
// the painted sedan (box-face panels), skyline panoramas, street decals
const CAR = ["side_low", "side_up", "front_low", "front_up", "back_low", "back_up", "roof", "hood", "wheel"];
const SKY = ["night", "sunset", "storm"];
export const DECALS = ["posters", "missing", "fogmart", "emberdeli", "linden", "st404", "graffiti", "concert", "busstop", "newsbox", "ladder", "boarded", "puddle", "drain", "noparking", "floating"];
export const PROPS = ["sedan", "payphone", "flipphone", "door", "clock", "photo", "towel", "map", "cart", "chair", "rotary", "book"];
export const PORTRAITS = ["rufki", "argjila", "rufki_big", "argjila_big", "other", "unmet", "unsaid", "keeper", "kid_rufki", "kid_argjila", "confidante", "friend", "dancer"];

// painted texture pages: procedural key -> [file, uv scale (x, y)]
// a scale below 1 stretches the page over more of the world (the
// pages hold 2x2 slabs, 16 brick courses... where the old tiles held one)
const Q = [0.5, 0.5];
export const TEXMAP = {
  asphalt: ["asphalt", Q], sidewalk: ["sidewalk", Q],
  brick: ["brick", Q], almbrick: ["brick", Q], cornerbrick: ["brick", Q], bulk: ["brick", Q], towerbrick: ["brick", Q],
  "@windows": ["windows", [1, 1 / 3]], "@facade": ["facade", [2, 1]], "@facadeB": ["facade", [1, 1]],
  wallpaper: ["wallpaper_amber", [0.75, 0.75]], hallwp: ["wallpaper_amber", [0.75, 0.75]], unreadwp: ["wallpaper_amber", [0.75, 0.75]],
  wp2: ["wallpaper_amber", [0.75, 0.75]], bookwp: ["wallpaper_amber", [0.75, 0.75]], studio: ["wallpaper_amber", [0.75, 0.75]], studioM: ["wallpaper_amber", [0.75, 0.75]],
  herwall: ["wallpaper_pink", [0.75, 0.75]], pastel: ["wallpaper_pink", [0.75, 0.75]],
  hiswall: ["wallpaper_blue", [0.75, 0.75]], hwp: ["wallpaper_blue", [0.75, 0.75]],
  parquet: ["parquet", Q], parquetM: ["parquet", Q], boards: ["boards", Q], benchwood: ["boards", [1, 1]], tank: ["boards", [1, 1]],
  hfloor: ["floorboards", Q], hfl: ["floorboards", Q], bedfloor: ["floorboards", Q], galfloor: ["floorboards", Q], stair: ["floorboards", [1, 1]],
  wainscot: ["wainscot", [1, 1]],
  halltile: ["mosaic", Q], ktile: ["mosaic", Q], roofdeck: ["roofdeck", Q], bdeck: ["roofdeck", Q],
  pooltile: ["pooltile", Q], bwall: ["pooltile", Q], checker: ["checker", Q], balcony: ["balcony", Q],
  cordwall: ["cordwall", [0.5, 0.5]], cordfloor: ["greentile", Q], cordlow: ["greentile", Q], ctile: ["greentile", Q], cwall: ["greentile", Q],
  concrete: ["concrete", Q], slab: ["concrete", Q], parapet: ["concrete", Q], planter: ["concrete", Q], divider: ["concrete", Q], balc: ["concrete", Q], stoop: ["concrete", Q], towerstep: ["concrete", Q], almstep: ["concrete", Q],
  galwall: ["plaster", Q], schoolwall: ["plaster", Q],
  grass: ["grass", Q], bark: ["bark", [1, 1]], leaves: ["leaves", [1, 1]], parkleaves: ["leaves", [1, 1]], roofleaf: ["leaves", [1, 1]],
  door: ["door", [1, 1]], shutter: ["shutter", [1, 1]], redglass: ["redglass", [3, 1]], "@clockface": ["clockface", [1, 1]], dash: ["dashboard", [1, 1]],
};

export async function loadAssets(onProgress) {
  const jobs = [];
  let done = 0;
  const total = SHEETS.length + PROPS.length + BACKDROPS.length + 1 + 9 + 3 + 16;
  const tick = () => onProgress && onProgress(++done / total);
  const add = (key, url) => jobs.push(tex(url).then((t) => { A.tex[key] = t; tick(); }));
  SHEETS.forEach((s) => add("sh_" + s, BASE + "sheets/" + s + ".png"));
  PROPS.forEach((p) => add("prop_" + p, BASE + "spr/prop_" + p + ".png"));
  BACKDROPS.forEach((b) => add("bg_" + b, BASE + "bg/" + b + ".png"));
  CAR.forEach((c) => add("car_" + c, BASE + "car/" + c + ".png"));
  SKY.forEach((c) => add("sky_" + c, BASE + "sky/" + c + ".png"));
  DECALS.forEach((c) => add("decal_" + c, BASE + "decal/" + c + ".png"));
  jobs.push(fetch(BASE + "sheets/sheets.json").then((r) => r.json()).then((j) => { A.sheets = j; tick(); }));
  // texture pages: one image each, one texture per uv scale
  const pages = {};
  for (const f of new Set(Object.values(TEXMAP).map((v) => v[0]))) pages[f] = tex(BASE + "tex/" + f + ".png");
  jobs.push(...Object.entries(TEXMAP).map(async ([key, [f, k]]) => {
    const base = await pages[f];
    if (!base) return;
    const t = base.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    t.userData = { uvk: k };
    overrideTex(key, t);
  }));
  await Promise.all(jobs);
  return A;
}

// expression portraits for the two leads: rufki_sad, argjila_smile...
const MOODS = ["neutral", "sad", "scared", "smile"];
const MOODY = ["rufki", "argjila", "other", "confidante", "keeper", "unsaid"];
export const portraitURL = (who, mood) => {
  if (mood && MOODS.includes(mood) && MOODY.includes(who)) return `${BASE}por/${who}_${mood}.png`;
  return PORTRAITS.includes(who) ? `${BASE}por/${who}.png` : null;
};
export const itemURL = (n) => `${BASE}items/${n}.png`;
export const cgURL = (n) => `${BASE}cg/${n}.png`;
export const loadURL = (n) => `${BASE}load/${n}.png`;
export const iconURL = (n) => `${BASE}icons/${n}.png`;
export const propURL = (p) => `${BASE}spr/prop_${p}.png`;
export const bgURL = (b) => `${BASE}bg/${b}.png`;
