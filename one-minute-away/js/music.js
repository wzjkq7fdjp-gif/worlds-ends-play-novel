// ============================================================
// ONE MINUTE AWAY — soundtrack sequencer.
// Every track is composed here as chords + melody + drum grids and
// played by WebAudio instruments (piano, strings, choir, bass,
// lead, bells, drums). No audio files.
// ============================================================

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function midi(n) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(n);
  if (!m) return null;
  return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
}
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// "Am", "Fmaj7", "Gsus4", "C#dim", "E7" → semitone offsets from C
function chord(name) {
  const m = /^([A-G])(#|b)?(.*)$/.exec(name);
  const root = NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  const q = m[3];
  let iv = [0, 4, 7];
  if (q === "m") iv = [0, 3, 7];
  else if (q === "m7") iv = [0, 3, 7, 10];
  else if (q === "maj7") iv = [0, 4, 7, 11];
  else if (q === "7") iv = [0, 4, 7, 10];
  else if (q === "sus4") iv = [0, 5, 7];
  else if (q === "dim") iv = [0, 3, 6];
  else if (q === "add9") iv = [0, 4, 7, 14];
  else if (q === "madd9") iv = [0, 3, 7, 14];
  return { root, iv };
}

// melody "A4:4 C5:2 -:2 ..." (durations in 16th steps) → [[step, midi, len]]
function mel(str) {
  const out = [];
  let t = 0;
  for (const tok of str.trim().split(/\s+/)) {
    if (tok === "|") continue;
    const [n, d] = tok.split(":");
    const len = +d || 4;
    if (n !== "-") out.push([t, midi(n), len]);
    t += len;
  }
  return out;
}

// ------------------------------------------------------------
// The score
// ------------------------------------------------------------
export const SONGS = {
  // ONE MINUTE AWAY — title. Music box over a slow string bed.
  title: {
    bpm: 66, chords: ["Em", "C", "G", "D", "Em", "C", "Am", "B"],
    layers: [
      { inst: "strings", type: "pad", oct: 2, vol: 0.32 },
      { inst: "choir", type: "pad", oct: 3, vol: 0.22 },
      { inst: "bell", type: "mel", vol: 0.5, mel: "E5:4 G5:4 B5:4 C6:4 B5:4 G5:4 E5:8 D5:4 E5:4 G5:4 A5:4 G5:8 -:8 C5:4 E5:4 G5:4 C6:4 D6:4 C6:4 B5:8 A5:4 G5:4 F#5:4 E5:4 D#5:16" },
      { inst: "piano", type: "arp", oct: 3, pat: [0, -1, 1, -1, 2, -1, 1, -1], rate: 2, vol: 0.28 },
    ],
  },
  // 4:04 — Ocean Parkway in fog. Barely music.
  fog: {
    bpm: 50, chords: ["Em", "Em", "C", "C", "Am", "Am", "B", "B"],
    layers: [
      { inst: "strings", type: "pad", oct: 1, vol: 0.4, only: "root" },
      { inst: "choir", type: "pad", oct: 3, vol: 0.18 },
      { inst: "bell", type: "mel", vol: 0.22, mel: "B5:16 -:16 -:16 G5:8 F#5:8 -:16 -:16 E5:16 -:16 -:16 D#5:16 -:16" },
    ],
  },
  // A memory that is true: warm, steady.
  memory: {
    bpm: 72, chords: ["Cmaj7", "Am7", "Fmaj7", "G", "Cmaj7", "Em", "Fmaj7", "Gsus4"],
    layers: [
      { inst: "strings", type: "pad", oct: 3, vol: 0.25 },
      { inst: "piano", type: "arp", oct: 3, pat: [0, 2, 1, 3, 2, 1, 3, 2], rate: 2, vol: 0.36 },
      { inst: "piano", type: "mel", vol: 0.42, mel: "E5:6 D5:2 C5:8 G4:4 A4:4 C5:8 A4:6 G4:2 F4:8 G4:8 -:8 E5:6 D5:2 C5:8 G5:4 E5:4 B4:8 A4:4 C5:4 F5:6 E5:2 D5:16" },
    ],
  },
  // Argjila — the house before he arrives. Quiet, open, nothing decided yet.
  waiting: {
    bpm: 64, chords: ["Fmaj7", "C", "Dm7", "Bb", "Fmaj7", "Am7", "Bb", "C"],
    layers: [
      { inst: "strings", type: "pad", oct: 3, vol: 0.2 },
      { inst: "bell", type: "arp", oct: 4, pat: [0, -1, 2, -1, 1, -1, 3, -1], rate: 2, vol: 0.3 },
      { inst: "piano", type: "mel", vol: 0.35, mel: "A4:8 C5:8 -:8 G4:8 F4:8 A4:8 -:16 D5:8 C5:8 A4:8 -:8 G4:16 -:16" },
    ],
  },
  // A memory that is false: the same chords, one step wrong.
  loop: {
    bpm: 58, chords: ["Cmaj7", "Am7", "Fmaj7", "G", "C#dim", "Am7", "Fmaj7", "G#dim"],
    layers: [
      { inst: "choir", type: "pad", oct: 3, vol: 0.3 },
      { inst: "piano", type: "arp", oct: 3, pat: [3, 2, 1, 0, -1, 0, 1, 2], rate: 2, vol: 0.3 },
      { inst: "bell", type: "mel", vol: 0.25, mel: "D5:2 C5:6 E5:8 G4:4 A4:4 C5:8 A4:6 G#4:2 F4:8 G4:8 -:8" },
    ],
  },
  // The Unmet / the Unsaid — pursuit.
  chase: {
    bpm: 138, chords: ["Em", "F", "Em", "F", "Am", "Bb", "B", "B"],
    layers: [
      { inst: "drums", vol: 0.75, k: "x..x..x...x..x..", s: "....x.......x...", h: "x.x.x.x.x.x.x.xx" },
      { inst: "bass", type: "bass", oct: 1, pat: "xx.xx.xx.xx.xx.x", vol: 0.55 },
      { inst: "strings", type: "stab", oct: 3, pat: "x..x..x.........", vol: 0.4 },
      { inst: "choir", type: "pad", oct: 4, vol: 0.25 },
      { inst: "pluck", type: "arp", oct: 5, pat: [2, 1, 0, 1], rate: 1, vol: 0.12 },
    ],
  },
  // The nightmare between memories.
  dread: {
    bpm: 46, chords: ["Am", "Bb", "Am", "G#dim", "Am", "F", "Bb", "E"],
    layers: [
      { inst: "choir", type: "pad", oct: 3, vol: 0.35 },
      { inst: "strings", type: "pad", oct: 1, vol: 0.38, only: "root" },
      { inst: "bell", type: "mel", vol: 0.24, mel: "E6:8 -:8 -:16 D#6:4 E6:4 -:8 -:16 C6:8 B5:8 -:16 F5:8 -:8 G#5:16" },
    ],
  },
  // The dance (original — the real song at the May dance stays unnamed).
  dance: {
    bpm: 84, chords: ["Dmaj7", "Bm7", "Em7", "A", "Dmaj7", "F#m", "Gmaj7", "A"],
    layers: [
      { inst: "drums", vol: 0.35, k: "x.......x.......", s: "....x.......x...", h: "..x...x...x...x." },
      { inst: "bass", type: "bass", oct: 2, pat: "x.....x.x.......", vol: 0.35 },
      { inst: "strings", type: "pad", oct: 3, vol: 0.24 },
      { inst: "piano", type: "arp", oct: 3, pat: [0, 1, 2, 3, 2, 1], rate: 2, vol: 0.32 },
      { inst: "bell", type: "mel", vol: 0.3, mel: "F#5:6 E5:2 D5:8 A4:8 B4:4 D5:4 E5:12 C#5:4 D5:8 B4:8 A4:8 F#4:8 G4:4 B4:4 D5:4 F#5:4 E5:16" },
    ],
  },
  // The car radio: placeholder cue (not the licensed song) for Argjila's private listening scene.
  radio: {
    bpm: 96, chords: ["Bmaj7", "Bmaj7", "G#m7", "G#m7", "Emaj7", "Emaj7", "F#", "F#"],
    layers: [
      { inst: "strings", type: "pad", oct: 3, vol: 0.3 },
      { inst: "pluck", type: "arp", oct: 4, pat: [0, 2, 1, 3, 2, 1, 0, 2], rate: 2, vol: 0.2 },
      { inst: "drums", vol: 0.28, k: "x.......x.......", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
      { inst: "bass", type: "bass", oct: 2, pat: "x.......x.....x.", vol: 0.3 },
    ],
  },
  // The Clock Tower / the Keeper.
  tower: {
    bpm: 60, chords: ["Dm", "Dm", "Bb", "A", "Dm", "Gm", "A", "A"],
    layers: [
      { inst: "drums", vol: 0.4, k: "x.......x.......", h: "x...x...x...x..." },
      { inst: "choir", type: "pad", oct: 3, vol: 0.4 },
      { inst: "strings", type: "pad", oct: 1, vol: 0.4, only: "root" },
      { inst: "bell", type: "arp", oct: 5, pat: [0, -1, -1, -1, 2, -1, -1, -1], rate: 2, vol: 0.3 },
    ],
  },
  // The last crossing.
  crossing: {
    bpm: 120, chords: ["D", "A", "Bm", "G", "D", "A", "G", "A"],
    layers: [
      { inst: "drums", vol: 0.6, k: "x...x...x...x.x.", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
      { inst: "bass", type: "bass", oct: 2, pat: "x.x.x.x.x.x.x.x.", vol: 0.45 },
      { inst: "choir", type: "pad", oct: 3, vol: 0.35 },
      { inst: "strings", type: "arp", oct: 4, pat: [0, 1, 2, 3], rate: 1, vol: 0.15 },
      { inst: "bell", type: "mel", vol: 0.4, mel: "F#5:4 A5:4 D6:6 C#6:2 E6:4 C#6:4 A5:8 B5:4 D6:4 F#6:6 E6:2 D6:8 B5:4 G5:4 A5:4 D6:4 F#6:4 E6:2 D6:2 C#6:4 E6:4 A6:8" },
    ],
  },
  // Always — sunrise.
  always: {
    bpm: 62, chords: ["G", "D", "Em", "C", "G", "Bm", "C", "D"],
    layers: [
      { inst: "strings", type: "pad", oct: 3, vol: 0.28 },
      { inst: "piano", type: "arp", oct: 3, pat: [0, 1, 2, 1, 3, 1, 2, 1], rate: 2, vol: 0.34 },
      { inst: "bell", type: "mel", vol: 0.42, mel: "B4:4 D5:4 G5:8 F#5:4 A5:4 D5:8 E5:4 G5:4 B5:6 A5:2 G5:8 E5:8 D5:4 G5:4 B5:4 D6:4 D6:4 B5:4 F#5:8 G5:4 E5:4 C5:8 D5:4 F#5:4 A5:8" },
    ],
  },
  // Sorrow / bittersweet endings.
  sorrow: {
    bpm: 58, chords: ["Am", "Em", "F", "C", "Dm", "Am", "E", "Am"],
    layers: [
      { inst: "strings", type: "pad", oct: 2, vol: 0.3 },
      { inst: "piano", type: "mel", vol: 0.5, mel: "A4:4 C5:4 E5:6 D5:2 B4:8 G4:8 A4:4 C5:4 F5:6 E5:2 E5:8 G4:8 F5:4 E5:2 D5:2 D5:4 A4:4 C5:8 E5:8 D5:4 C5:2 B4:2 G#4:8 A4:16" },
    ],
  },
};

// ------------------------------------------------------------
// Instruments + scheduler
// ------------------------------------------------------------
export class Music {
  constructor(audio) {
    this.A = audio;
    this.cur = null;
    this.vol = 0.7;
  }
  get ctx() { return this.A.ctx; }
  ensure() {
    if (this.out || !this.ctx) return !!this.out;
    const c = this.ctx;
    this.out = c.createGain();
    this.out.gain.value = this.vol;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    this.out.connect(comp).connect(this.A.master);
    this.verb = c.createConvolver();
    this.verb.buffer = this.A.impulse(3.2, 2.4);
    this.verbIn = c.createGain();
    this.verbIn.gain.value = 0.35;
    this.verbIn.connect(this.verb).connect(this.out);
    setInterval(() => this.tick(), 30);
    return true;
  }
  setVolume(v) { this.vol = v; if (this.out) this.out.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1); }
  // play(name) crossfades; play(null) fades out
  play(name, fade = 1.5) {
    if (!this.ensure()) { this.pending = name; return; }
    if (this.cur && this.cur.name === name) return;
    const c = this.ctx, t = c.currentTime;
    if (this.cur) {
      const g = this.cur.gain;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0.0001, t + fade);
      const old = this.cur;
      old.dead = true;
      setTimeout(() => old.gain.disconnect(), fade * 1000 + 3000);
    }
    this.cur = null;
    if (!name || !SONGS[name]) return;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(1, t + Math.min(fade, 1.2));
    gain.connect(this.out);
    gain.connect(this.verbIn);
    const s = SONGS[name];
    this.cur = { name, song: s, gain, step: 0, next: t + 0.08, spb: 60 / s.bpm / 4, mels: s.layers.map((l) => (l.mel ? mel(l.mel) : null)) };
  }
  duck(v = 0.35, dur = 0.3) { if (this.out) this.out.gain.setTargetAtTime(this.vol * v, this.ctx.currentTime, dur); }
  unduck() { if (this.out) this.out.gain.setTargetAtTime(this.vol, this.ctx.currentTime, 0.4); }
  tick() {
    const c = this.ctx, P = this.cur;
    if (!c || !P || P.dead) return;
    while (P.next < c.currentTime + 0.15) {
      this.step(P, P.step, P.next);
      P.step++;
      P.next += P.spb;
    }
  }
  step(P, n, t) {
    const s = P.song, bars = s.chords.length, total = bars * 16;
    const st = n % total, bar = Math.floor(st / 16), sb = st % 16;
    const ch = chord(s.chords[bar]);
    const spb = P.spb;
    s.layers.forEach((L, li) => {
      const vol = (L.vol ?? 0.5);
      const notes = (oct) => (L.only === "root" ? [ch.root] : ch.iv.map((i) => ch.root + i)).map((x) => 12 * (oct + 1) + x);
      if (L.inst === "drums") {
        for (const k of ["k", "s", "h", "c"]) if (L[k] && L[k][sb] === "x" && (k !== "c" || bar % 4 === 0)) this.drum(k, t, vol, P.gain);
        return;
      }
      if (L.type === "pad" && sb === 0) notes(L.oct).forEach((m) => this.note(L.inst, m, t, spb * 16, vol / 2, P.gain));
      if (L.type === "stab" && L.pat[sb] === "x") notes(L.oct).forEach((m) => this.note(L.inst, m, t, spb * 2, vol / 2, P.gain));
      if (L.type === "bass" && L.pat[sb] === "x") this.note(L.inst, 12 * (L.oct + 1) + ch.root + (sb % 8 === 6 ? 12 : 0), t, spb * 1.6, vol, P.gain);
      if (L.type === "arp" && sb % L.rate === 0) {
        const i = L.pat[(sb / L.rate) % L.pat.length];
        if (i >= 0) {
          const ns = ch.iv.map((x) => ch.root + x);
          const m = 12 * (L.oct + 1) + ns[i % ns.length] + 12 * Math.floor(i / ns.length);
          this.note(L.inst, m, t, spb * L.rate * 1.5, vol, P.gain);
        }
      }
      if (L.type === "mel") {
        const M = P.mels[li];
        const len = M.reduce((a, x) => Math.max(a, x[0] + x[2]), 0) || total;
        const pos = n % Math.max(len, total);
        for (const [s0, m, l] of M) if (s0 === pos) this.note(L.inst, m, t, spb * l, vol, P.gain);
      }
    });
  }
  // ---------------- instruments ----------------
  env(g, t, a, peak, d, sus = 0) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    if (sus) { g.gain.setValueAtTime(peak, t + a + sus); }
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + sus + d);
  }
  osc(type, f, t, end, dest, detune = 0) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.detune.value = detune;
    o.connect(dest);
    o.start(t);
    o.stop(end);
    return o;
  }
  note(inst, m, t, dur, vol, dest) {
    const c = this.ctx, f = hz(m);
    const g = c.createGain();
    g.connect(dest);
    if (inst === "piano") {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; lp.connect(g);
      this.osc("triangle", f, t, t + 2.4, lp);
      this.osc("sine", f * 2, t, t + 1.2, lp);
      this.env(g, t, 0.005, 0.22 * vol, 1.8);
    } else if (inst === "bell") {
      this.osc("sine", f, t, t + 3, g);
      const g2 = c.createGain(); g2.connect(dest);
      this.osc("sine", f * 2.76, t, t + 1, g2);
      this.env(g, t, 0.003, 0.18 * vol, 2.6);
      this.env(g2, t, 0.003, 0.06 * vol, 0.6);
    } else if (inst === "strings") {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400; lp.connect(g);
      for (const d of [-7, 0, 7]) this.osc("sawtooth", f, t, t + dur + 1.2, lp, d);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.06 * vol, t + Math.min(0.5, dur * 0.4));
      g.gain.setValueAtTime(0.06 * vol, t + dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.0);
    } else if (inst === "choir") {
      // two formant filters over detuned saws with vibrato: an "aah"
      const mix = c.createGain(); mix.gain.value = 1;
      const lfo = c.createOscillator(); lfo.frequency.value = 5.2;
      const lg = c.createGain(); lg.gain.value = 6; lfo.connect(lg);
      lfo.start(t); lfo.stop(t + dur + 1.5);
      for (const d of [-9, 0, 8]) { const o = this.osc("sawtooth", f, t, t + dur + 1.5, mix, d); lg.connect(o.detune); }
      for (const [ff, q, gv] of [[750, 7, 1], [1150, 9, 0.7], [2600, 12, 0.25]]) {
        const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = ff; bp.Q.value = q;
        const fg = c.createGain(); fg.gain.value = gv;
        mix.connect(bp).connect(fg).connect(g);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.22 * vol, t + Math.min(0.6, dur * 0.4));
      g.gain.setValueAtTime(0.22 * vol, t + dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
    } else if (inst === "bass") {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 4; lp.connect(g);
      this.osc("sawtooth", f, t, t + dur + 0.2, lp);
      this.osc("square", f / 2, t, t + dur + 0.2, lp);
      this.env(g, t, 0.005, 0.2 * vol, Math.max(0.1, dur));
    } else if (inst === "lead") {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400; lp.connect(g);
      const o1 = this.osc("square", f, t, t + dur + 0.3, lp);
      const o2 = this.osc("sawtooth", f, t, t + dur + 0.3, lp, 8);
      const lfo = c.createOscillator(); lfo.frequency.value = 5.5; const lg = c.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(14, t + 0.4);
      lfo.connect(lg); lg.connect(o1.detune); lg.connect(o2.detune); lfo.start(t); lfo.stop(t + dur + 0.3);
      this.env(g, t, 0.01, 0.09 * vol, 0.15, Math.max(0, dur - 0.1));
    } else if (inst === "pluck") {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(400, t + 0.2); lp.connect(g);
      this.osc("square", f, t, t + 0.3, lp);
      this.env(g, t, 0.002, 0.12 * vol, 0.22);
    }
  }
  drum(k, t, vol, dest) {
    const c = this.ctx, A = this.A;
    const g = c.createGain(); g.connect(dest);
    if (k === "k") {
      const o = c.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      o.connect(g); o.start(t); o.stop(t + 0.35);
      this.env(g, t, 0.002, 0.7 * vol, 0.3);
    } else {
      const s = c.createBufferSource(); s.buffer = A.noiseBuf;
      const f = c.createBiquadFilter();
      f.type = k === "s" ? "bandpass" : "highpass";
      f.frequency.value = k === "s" ? 1800 : k === "c" ? 5000 : 8000;
      s.connect(f).connect(g); s.start(t, Math.random()); s.stop(t + (k === "c" ? 1.6 : 0.3));
      this.env(g, t, 0.001, (k === "s" ? 0.4 : k === "c" ? 0.18 : 0.1) * vol, k === "s" ? 0.16 : k === "c" ? 1.4 : 0.04);
      if (k === "s") { const g2 = c.createGain(); g2.connect(dest); const o = c.createOscillator(); o.frequency.value = 190; o.connect(g2); o.start(t); o.stop(t + 0.1); this.env(g2, t, 0.001, 0.2 * vol, 0.08); }
    }
  }
}
