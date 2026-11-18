// ============================================================
// Voice acting. Every spoken line was synthesised offline
// (Kokoro-82M neural TTS) and processed per speaker (radio band,
// the Keeper's slowed giant, the Unsaid's borrowed chorus...).
// Files live in assets/vo/<hash>.mp3 keyed by speaker group + text.
// ============================================================

// speakers that share one recorded voice / effect chain
export const GROUP = { rufkiBig: "rufki", argjilaBig: "argjila", double: "other", kids: "kidA", child: "kidR" };
export const groupOf = (who) => GROUP[who] || who || "narr";
export function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
export const voKey = (who, text) => fnv(groupOf(who) + "|" + text);
const SILENT = new Set(["narr", "sys"]);

export class Voice {
  constructor(G) {
    this.G = G;
    this.have = null;
    this.cache = new Map();
    this.cur = null;
  }
  // index.json: { key: [offset, length] } into one packed file of mp3 clips
  async init() {
    try { this.index = await (await fetch("assets/vo/index.json")).json(); } catch { this.index = {}; }
    this.have = new Set(Object.keys(this.index));
    // the pack streams in the background; lines play once it has arrived
    this.packP = this.have.size ? fetch("assets/vo/voices.mp3").then((r) => r.arrayBuffer()).then((b) => (this.pack = b)).catch(() => null) : Promise.resolve(null);
  }
  // narration is read, not spoken: only characters have voices
  has(who, text) { return !SILENT.has(groupOf(who)) && !!this.have && this.have.has(voKey(who, text)); }
  load(who, text) {
    const k = voKey(who, text);
    if (!this.has(who, text)) return Promise.resolve(null);
    if (!this.cache.has(k)) {
      const ctx = this.G.audio.ctx;
      const p = this.packP.then(() => {
        if (!this.pack || !ctx) return null;
        const [o, n] = this.index[k];
        const clip = this.pack.slice(o, o + n);
        return new Promise((res) => ctx.decodeAudioData(clip, res, () => res(null)));
      }).catch(() => null);
      this.cache.set(k, p);
      if (this.cache.size > 80) this.cache.delete(this.cache.keys().next().value);
    }
    return this.cache.get(k);
  }
  prefetch(lines) {
    if (!this.G.audio.ctx || !this.G.opts.voice) return;
    for (const l of lines.slice(0, 6)) if (l && l.text) this.load(l.who, l.text);
  }
  stopAll() { this.cur?.stop(); this.cur = null; }
  // resolves with { dur, stop(), ended() } or null when the line has no recording
  async play(who, text, fx = {}) {
    const A = this.G.audio;
    if (!A.ctx || !this.has(who, text)) return null;
    const buf = await Promise.race([this.load(who, text), new Promise((r) => setTimeout(() => r(null), 2500))]);
    if (!buf) return null;
    this.stopAll();
    const c = A.ctx;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = (fx.vol ?? 1) * (this.G.opts.voiceVol ?? 10) / 10 * 1.15;
    src.connect(g);
    // pan (the back-seat humming sits hard right, the open line sits centre)
    let out = g;
    if (fx.pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = fx.pan; g.connect(p); out = p; }
    out.connect(fx.dry ? A.muffle : A.bus);
    if (fx.rate) src.playbackRate.value = fx.rate;
    let ended = false;
    src.onended = () => { ended = true; this.G.music?.unduck(); };
    src.start();
    this.G.music?.duck(0.35);
    const h = {
      dur: buf.duration / (fx.rate || 1),
      stop: () => { if (!ended) { try { src.stop(); } catch {} ended = true; this.G.music?.unduck(); } },
      ended: () => ended,
    };
    this.cur = h;
    return h;
  }
}
