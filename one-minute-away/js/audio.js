// ============================================================
// Synthesised audio — no files. Wind, drones, footsteps,
// telephone, static, clock ticks, menu blips, music box.
// ============================================================
export class Audio {
  constructor() {
    this.ctx = null;
    this.vol = 0.8;
    this.loops = {};
  }
  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = (this.ctx = new AC());
    this.master = c.createGain();
    this.master.gain.value = this.vol;
    // global low-pass used for "underwater" and dream muffling
    this.muffle = c.createBiquadFilter();
    this.muffle.type = "lowpass";
    this.muffle.frequency.value = 20000;
    this.muffle.connect(this.master);
    this.master.connect(c.destination);
    // reverb send
    this.verb = c.createConvolver();
    this.verb.buffer = this.impulse(2.6, 2.2);
    this.verbGain = c.createGain();
    this.verbGain.gain.value = 0.25;
    this.verb.connect(this.verbGain).connect(this.muffle);
    this.bus = c.createGain();
    this.bus.connect(this.muffle);
    this.bus.connect(this.verb);
    this.noiseBuf = this.makeNoise(2);
    // ambience bed
    this.amb = {};
    this.buildAmbience();
  }
  setVolume(v) {
    this.vol = v;
    if (this.master) this.master.gain.value = v;
  }
  impulse(sec, decay) {
    const c = this.ctx, len = (c.sampleRate * sec) | 0;
    const b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }
  makeNoise(sec) {
    const c = this.ctx, len = (c.sampleRate * sec) | 0;
    const b = c.createBuffer(1, len, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  buildAmbience() {
    const c = this.ctx;
    // wind: looping noise through a wandering band-pass
    const n = c.createBufferSource();
    n.buffer = this.noiseBuf;
    n.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 400;
    bp.Q.value = 0.7;
    const wg = c.createGain();
    wg.gain.value = 0;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = c.createGain();
    lfoG.gain.value = 220;
    lfo.connect(lfoG).connect(bp.frequency);
    n.connect(bp).connect(wg).connect(this.bus);
    n.start();
    lfo.start();
    // drone: two detuned saws through a low-pass
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 260;
    const dg = c.createGain();
    dg.gain.value = 0;
    const o1 = c.createOscillator(), o2 = c.createOscillator(), o3 = c.createOscillator();
    o1.type = o2.type = "sawtooth";
    o3.type = "sine";
    o1.frequency.value = 55;
    o2.frequency.value = 55.4;
    o3.frequency.value = 27.5;
    [o1, o2, o3].forEach((o) => { o.connect(lp); o.start(); });
    lp.connect(dg).connect(this.bus);
    // static bed (monsters)
    const sn = c.createBufferSource();
    sn.buffer = this.noiseBuf;
    sn.loop = true;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    const sg = c.createGain();
    sg.gain.value = 0;
    sn.connect(hp).connect(sg).connect(this.muffle);
    sn.start();
    // distant traffic hum
    const tn = c.createBufferSource();
    tn.buffer = this.noiseBuf;
    tn.loop = true;
    const tl = c.createBiquadFilter();
    tl.type = "lowpass";
    tl.frequency.value = 140;
    const tg = c.createGain();
    tg.gain.value = 0;
    tn.connect(tl).connect(tg).connect(this.bus);
    tn.start();
    // water lapping
    const wn = c.createBufferSource();
    wn.buffer = this.noiseBuf;
    wn.loop = true;
    const wl = c.createBiquadFilter();
    wl.type = "lowpass";
    wl.frequency.value = 600;
    const wlg = c.createGain();
    wlg.gain.value = 0;
    const wlfo = c.createOscillator();
    wlfo.frequency.value = 0.3;
    const wlfoG = c.createGain();
    wlfoG.gain.value = 0;
    wlfo.connect(wlfoG).connect(wlg.gain);
    wlfo.start();
    wn.connect(wl).connect(wlg).connect(this.bus);
    wn.start();
    this.amb = { wind: wg, drone: dg, droneLP: lp, oscs: [o1, o2, o3], stat: sg, traffic: tg, water: wlg, waterLfo: wlfoG };
  }
  // ambience({ wind, drone, note, bright, traffic, water, verb })
  ambience(o = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, a = this.amb, ramp = o.ramp ?? 2;
    const set = (p, v) => { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(v, t + ramp); };
    set(a.wind.gain, (o.wind ?? 0.3) * 0.35);
    set(a.drone.gain, (o.drone ?? 0.3) * 0.12);
    set(a.traffic.gain, (o.traffic ?? 0) * 0.5);
    set(a.water.gain, (o.water ?? 0) * 0.25);
    set(a.waterLfo.gain, (o.water ?? 0) * 0.15);
    set(a.droneLP.frequency, o.bright ?? 260);
    set(this.verbGain.gain, o.verb ?? 0.25);
    const note = o.note ?? 55;
    a.oscs[0].frequency.setTargetAtTime(note, t, 1);
    a.oscs[1].frequency.setTargetAtTime(note * 1.007, t, 1);
    a.oscs[2].frequency.setTargetAtTime(note / 2, t, 1);
  }
  staticLevel(v) {
    if (!this.ctx) return;
    this.amb.stat.gain.setTargetAtTime(Math.min(0.4, v * 0.4), this.ctx.currentTime, 0.1);
  }
  setMuffle(on) {
    if (!this.ctx) return;
    this.muffle.frequency.setTargetAtTime(on ? 500 : 20000, this.ctx.currentTime, 0.15);
  }
  // ----- one-shots -----
  env(node, t, a, peak, d) {
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  tone(freq, dur = 0.1, type = "square", vol = 0.08, when = 0, dest) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    this.env(g, t, 0.005, vol, dur);
    o.connect(g).connect(dest || this.bus);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }
  noise(dur = 0.1, freq = 1000, q = 1, vol = 0.2, type = "bandpass", when = 0, dest) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + when;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    this.env(g, t, 0.003, vol, dur);
    s.connect(f).connect(g).connect(dest || this.bus);
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
  }
  blip() { this.tone(880, 0.05, "square", 0.04); }
  move() { this.tone(660, 0.04, "square", 0.035); }
  confirm() { this.tone(988, 0.06, "square", 0.05); this.tone(1318, 0.09, "square", 0.04, 0.06); }
  cancel() { this.tone(440, 0.08, "square", 0.05); this.tone(330, 0.1, "square", 0.04, 0.07); }
  type(who) { const f = { rufki: 1150, argjila: 1650, keeper: 520, unsaid: 900, other: 1080 }[who] || 1400; this.tone(f + Math.random() * 120, 0.015, "square", 0.011); }
  step(surface = "street", run = false) {
    const v = run ? 0.22 : 0.15;
    const map = { street: [900, 1.2], wood: [500, 2], tile: [2200, 3], water: [700, 0.6], carpet: [300, 0.8], metal: [1600, 4] };
    const [f, q] = map[surface] || map.street;
    this.noise(0.06, f * (0.9 + Math.random() * 0.2), q, v);
    if (surface === "water") this.noise(0.18, 500, 0.5, 0.12, "lowpass", 0.02);
    if (surface === "wood") this.tone(110, 0.05, "sine", 0.06);
  }
  ring(vol = 0.06) {
    if (!this.ctx) return;
    // US ring: 440 + 480 Hz, 2s on
    for (let i = 0; i < 2; i++) {
      this.tone(440, 0.9, "sine", vol, i * 1.0);
      this.tone(480, 0.9, "sine", vol, i * 1.0);
    }
  }
  bell(vol = 0.08) {
    // old phone bell trill
    for (let i = 0; i < 16; i++) this.tone(i % 2 ? 1180 : 1240, 0.05, "triangle", vol, i * 0.06);
  }
  tick(vol = 0.12) { this.noise(0.03, 3000, 6, vol, "bandpass"); this.tone(2400, 0.02, "square", vol * 0.2); }
  tock(vol = 0.12) { this.noise(0.04, 1800, 6, vol, "bandpass"); }
  item() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.18, "triangle", 0.05, i * 0.07)); }
  door() { this.noise(0.5, 200, 1, 0.25, "lowpass"); this.tone(70, 0.4, "sine", 0.1); }
  thud() { this.noise(0.3, 120, 1, 0.5, "lowpass"); this.tone(45, 0.5, "sine", 0.3); }
  splash() { this.noise(0.6, 900, 0.5, 0.25, "lowpass"); }
  hit() { this.noise(0.5, 3000, 0.4, 0.4, "highpass"); this.tone(60, 0.6, "sawtooth", 0.15); }
  heartbeat() { this.tone(55, 0.12, "sine", 0.25); this.tone(50, 0.14, "sine", 0.2, 0.2); }
  engineDie() {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = "sawtooth";
    f.type = "lowpass";
    f.frequency.value = 300;
    o.frequency.setValueAtTime(48, t);
    o.frequency.exponentialRampToValueAtTime(18, t + 1.6);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(f).connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 1.9);
  }
  sting(low = false) {
    // dissonant horror stab
    const base = low ? 73.4 : 146.8;
    [1, 1.059, 1.414, 2.12].forEach((m) => this.tone(base * m, 1.6, "sawtooth", 0.035));
    this.noise(1.2, 2500, 0.5, 0.15, "highpass");
  }
  chime() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 1.4, "sine", 0.05, i * 0.12)); }
  // ---------------- One Minute Away cues ----------------
  pan(p) {
    if (!this.ctx || !this.ctx.createStereoPanner) return this.bus;
    const s = this.ctx.createStereoPanner();
    s.pan.value = p;
    s.connect(this.bus);
    return s;
  }
  chainClick(when = 0) {
    this.noise(0.025, 4200, 8, 0.32, "bandpass", when);
    this.tone(3100, 0.03, "square", 0.04, when);
    this.noise(0.18, 2600, 4, 0.08, "bandpass", when + 0.02);
  }
  knock(when = 0, vol = 0.5) {
    for (let i = 0; i < 3; i++) {
      this.noise(0.07, 260, 1.4, vol, "lowpass", when + i * 0.21);
      this.tone(92, 0.09, "sine", vol * 0.5, when + i * 0.21);
    }
  }
  cartCrack(pan = 0.3) {
    const d = this.pan(pan);
    this.noise(0.05, 1800, 3, 0.35, "bandpass", 0, d);
    this.noise(0.06, 900, 2, 0.3, "bandpass", 0.07, d);
    this.noise(0.9, 700, 0.6, 0.05, "bandpass", 0.12, d);
  }
  drip(pan = 0) { const d = this.pan(pan); this.tone(1800 + Math.random() * 600, 0.06, "sine", 0.08, 0, d); this.tone(900, 0.1, "sine", 0.03, 0.03, d); }
  slap() { this.noise(0.12, 700, 0.8, 0.35, "lowpass"); this.noise(0.3, 2400, 0.6, 0.08, "highpass", 0.05); }
  flip() { this.noise(0.03, 3000, 2, 0.2, "bandpass"); this.tone(1600, 0.03, "square", 0.03, 0.04); }
  textBeep() { this.tone(1320, 0.06, "square", 0.035); this.tone(1760, 0.08, "square", 0.03, 0.08); }
  page() { this.noise(0.25, 3200, 0.7, 0.07, "highpass"); }
  handoff() { this.tone(330, 0.5, "sine", 0.06); this.tone(495, 0.6, "sine", 0.05, 0.12); this.noise(0.4, 6000, 0.5, 0.03, "highpass"); }
  dome() { this.tone(60, 0.04, "square", 0.05); this.noise(0.02, 5000, 3, 0.08, "bandpass"); }
  carDoor(open = true) { this.noise(0.12, open ? 500 : 300, 1, 0.35, "lowpass"); this.tone(open ? 140 : 90, 0.12, "sine", 0.2); if (!open) this.thud(); }
  creak(dur = 1.4) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = "sawtooth"; f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 6;
    o.frequency.setValueAtTime(70, t);
    for (let i = 1; i < 10; i++) o.frequency.setValueAtTime(60 + Math.random() * 40, t + (i * dur) / 10);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(this.bus); o.start(t); o.stop(t + dur + 0.1);
  }
  horn(when = 0) { this.tone(392, 0.7, "sawtooth", 0.04, when); this.tone(466, 0.7, "sawtooth", 0.035, when); }
  dial() { for (let i = 0; i < 6; i++) this.noise(0.015, 2000, 5, 0.12, "bandpass", i * 0.05); }
  receiver(down = true) { this.noise(0.08, down ? 300 : 800, 1, 0.3, "lowpass"); this.tone(down ? 120 : 200, 0.06, "sine", 0.15); }
  dialTone(dur = 1.2) { this.tone(350, dur, "sine", 0.03); this.tone(440, dur, "sine", 0.03); }
  busy() { for (let i = 0; i < 3; i++) { this.tone(480, 0.25, "sine", 0.03, i * 0.5); this.tone(620, 0.25, "sine", 0.03, i * 0.5); } }
  staticBurst(dur = 0.6, vol = 0.12) { this.noise(dur, 3000, 0.3, vol, "bandpass"); }
  reverseTick() { this.noise(0.12, 2600, 5, 0.0001, "bandpass"); this.tone(1800, 0.12, "triangle", 0.04); this.tone(900, 0.2, "triangle", 0.03, 0.08); }
  whoosh() { this.noise(0.8, 600, 0.4, 0.15, "lowpass"); }
  rumble(dur = 2) { this.tone(32, dur, "sawtooth", 0.12); this.noise(dur, 90, 0.7, 0.25, "lowpass"); }
  glass() { for (let i = 0; i < 6; i++) this.tone(2400 + Math.random() * 2000, 0.4, "sine", 0.03, i * 0.03); this.noise(0.4, 6000, 0.6, 0.12, "highpass"); }
  upstairs(pan = 0, vol = 0.1) { const d = this.pan(pan); this.noise(0.09, 160, 1, vol, "lowpass", 0, d); this.tone(60, 0.08, "sine", vol * 0.6, 0, d); }
  breath(vol = 0.05) { this.noise(1.1, 900, 0.5, vol, "bandpass"); }
  clockStrike() { this.tone(196, 3, "sine", 0.1); this.tone(392, 2, "sine", 0.05); this.tone(587, 1.4, "sine", 0.03); }
  repair() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 1.6, "sine", 0.05, i * 0.1)); this.chainClick(0.7); }
  // tiny music-box melody for quiet moments / title
  musicBox(notes, tempo = 0.42, vol = 0.045) {
    if (!this.ctx) return 0;
    notes.forEach((n, i) => {
      if (n == null) return;
      const f = 440 * Math.pow(2, (n - 69) / 12);
      this.tone(f, 1.2, "triangle", vol, i * tempo);
      this.tone(f * 2, 0.5, "sine", vol * 0.3, i * tempo);
    });
    return notes.length * tempo;
  }
}
export const THEME = [64, 67, 71, 72, 71, 67, 64, null, 62, 64, 67, 69, 67, null, 60, 64, 67, 72, 74, 72, 71, null];
