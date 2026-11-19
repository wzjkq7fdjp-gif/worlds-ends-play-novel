// ============================================================
// WORLD ENDS — small timing games woven into the story:
//  breath(): in / hold / out cadence (hold ✕, release on OUT)
//  rhythm(): press ✕ as the ring closes on the beat
//  qte():    one decisive press inside a closing window
// ============================================================
const el = (cls, html = "") => { const e = document.createElement("div"); e.className = cls; e.innerHTML = html; return e; };

export function breath(G, { cycles = 3, title = "BREATHE", sub = "Hold ✕ to breathe in. Keep holding. Release to breathe out.", inT = 2.6, holdT = 1.6, outT = 2.8 } = {}) {
  return G.guard(new Promise((res) => {
    const box = el("mg breath", `<div class="mgt">${title}</div><div class="mgs">${sub}</div><div class="bring"><i></i><b></b></div><div class="bphase"></div><div class="bscore"></div>`);
    const ring = box.querySelector(".bring i"), core = box.querySelector(".bring b"), ph = box.querySelector(".bphase"), sc = box.querySelector(".bscore");
    let t = 0, cyc = 0, good = 0, total = 0, okCycles = 0;
    const L = inT + holdT + outT;
    const m = {
      el: box,
      update(dt, I) {
        t += dt;
        const ct = t - cyc * L;
        const phase = ct < inT ? "IN" : ct < inT + holdT ? "HOLD" : "OUT";
        const k = phase === "IN" ? ct / inT : phase === "HOLD" ? 1 : 1 - (ct - inT - holdT) / outT;
        ring.style.transform = `scale(${0.35 + k * 0.65})`;
        ph.textContent = phase === "IN" ? "IN · through the nose" : phase === "HOLD" ? "HOLD" : "OUT · slowly";
        const held = I.down("x");
        const right = (phase === "OUT" && !held) || (phase !== "OUT" && held);
        total += dt;
        if (right) good += dt;
        core.style.transform = `scale(${held ? 0.8 : 0.4})`;
        box.classList.toggle("ok", right);
        if (Math.floor(t * 3) !== Math.floor((t - dt) * 3) && phase === "IN" && ct < 0.1) G.audio.breath(true);
        if (ct >= L) {
          if (good / total > 0.65) { okCycles++; G.audio.chime(); } else G.audio.cancel();
          cyc++; good = 0; total = 0;
          sc.textContent = "◆".repeat(okCycles) + "◇".repeat(Math.max(0, cycles - okCycles));
          if (cyc >= cycles) { G.ui.pop(m); res(okCycles); }
          else if (phase === "OUT") G.audio.breath(false);
        }
      },
    };
    sc.textContent = "◇".repeat(cycles);
    G.ui.push(m);
  }));
}

export function rhythm(G, { beats = 8, bpm = 76, title = "CADENCE", sub = "Press ✕ as the ring meets the circle." } = {}) {
  return G.guard(new Promise((res) => {
    const box = el("mg rhythm", `<div class="mgt">${title}</div><div class="mgs">${sub}</div><div class="rtrack"><div class="rtarget"></div></div><div class="rfeed"></div><div class="bscore"></div>`);
    const track = box.querySelector(".rtrack"), feed = box.querySelector(".rfeed"), sc = box.querySelector(".bscore");
    const spb = 60 / bpm;
    const notes = [];
    for (let i = 0; i < beats; i++) {
      const n = el("rnote");
      track.appendChild(n);
      notes.push({ t: 1.6 + i * spb, el: n, done: false });
    }
    let t = 0, hits = 0;
    const m = {
      el: box,
      update(dt, I) {
        t += dt;
        for (const n of notes) {
          const d = n.t - t;
          n.el.style.transform = `translate(-50%,-50%) scale(${Math.max(0, 1 + d * 1.6)})`;
          n.el.style.opacity = n.done ? 0 : d > 1.5 ? 0 : 1;
          if (!n.done && d < -0.22) { n.done = true; feed.textContent = "MISS"; feed.className = "rfeed miss"; G.audio.cancel(); }
        }
        if (I.pressed("x")) {
          const n = notes.find((x) => !x.done && Math.abs(x.t - t) < 0.22);
          if (n) { n.done = true; hits++; const p = Math.abs(n.t - t) < 0.09; feed.textContent = p ? "PERFECT" : "GOOD"; feed.className = "rfeed " + (p ? "perf" : "good"); G.audio.tone(p ? 1320 : 990, 0.08, "triangle", 0.06); }
          else { feed.textContent = "EARLY"; feed.className = "rfeed miss"; }
        }
        sc.textContent = `${hits} / ${beats}`;
        if (t > notes[notes.length - 1].t + 0.6) { G.ui.pop(m); res(hits); }
      },
    };
    G.ui.push(m);
  }));
}

export function qte(G, { text = "STRIKE", key = "x", window = 1.2, slow = true } = {}) {
  return G.guard(new Promise((res) => {
    const glyph = { x: "✕", sq: "□", o: "○", tri: "△" }[key];
    const box = el("mg qte", `<div class="qring"><i></i><b>${glyph}</b></div><div class="qtxt">${text}</div>`);
    const ring = box.querySelector(".qring i");
    let t = 0;
    const m = {
      el: box,
      update(dt, I) {
        t += dt;
        const k = Math.min(1, t / window);
        ring.style.transform = `scale(${1.8 - k * 1.3})`;
        if (I.pressed(key)) { G.audio.parry(); G.ui.pop(m); res(true); return; }
        if (t > window + 0.25) { t = 0; G.audio.cancel(); }
      },
    };
    G.ui.push(m);
  }));
}
