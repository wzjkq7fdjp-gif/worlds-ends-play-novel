// ============================================================
// PS1-style UI: dialogue windows, choices, title cards, menus,
// objective banner, interaction prompt, item viewer.
// Every modal is driven by the same input (pad/keys/touch).
// ============================================================
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
import { portrait } from "./actors.js";
const VOICE = { KAIEN: 1, ARIA: 1.5, RENJI: 0.75, RAIZEN: 1.1, SHION: 1.2, KYO: 1.25, DAIGO: 0.7, MIYU: 1.9, REQUIEM: 1.35, VAEL: 0.9 };
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

export class UI {
  constructor(G) {
    this.G = G;
    this.root = document.getElementById("ui");
    this.fadeEl = document.getElementById("fade");
    this.clockEl = document.getElementById("clock");
    this.objEl = document.getElementById("objective");
    this.promptEl = document.getElementById("prompt");
    this.whisperEl = document.getElementById("whisper");
    this.toastEl = document.getElementById("toast");
    this.stack = [];
    this.fadeV = 0;
  }
  get busy() { return this.stack.length > 0; }
  syncModal() {
    const full = this.stack.some((m) => /\b(menu|item|card)\b/.test(m.el.className));
    document.body.classList.toggle("modal", full);
  }
  push(m) {
    this.stack.push(m);
    setTimeout(() => this.syncModal(), 0);
    this.root.appendChild(m.el);
    this.G.input.flush();
    return m;
  }
  pop(m) {
    this.stack = this.stack.filter((x) => x !== m);
    m.el.remove();
    this.syncModal();
    this.G.input.flush();
  }
  update(dt, input) {
    const top = this.stack[this.stack.length - 1];
    if (top) top.update(dt, input);
    if (this._fade) {
      const f = this._fade;
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      this.fadeV = f.from + (f.to - f.from) * k;
      this.fadeEl.style.opacity = this.fadeV;
      if (k >= 1) { this._fade = null; f.res(); }
    }
    if (this._whisperT > 0) {
      this._whisperT -= dt;
      if (this._whisperT <= 0) this.whisperEl.classList.remove("on");
    }
    if (this._toastT > 0) {
      this._toastT -= dt;
      if (this._toastT <= 0) this.toastEl.classList.remove("on");
    }
  }


  // ---------- cinematic extras ----------
  letterbox(on) { document.body.classList.toggle("lbox", !!on); }
  sysText(text, dur = 2.2) {
    const e = el("div", "systxt", esc(text));
    document.getElementById("hud").appendChild(e);
    setTimeout(() => e.remove(), dur * 1000);
    this.G.audio.alarm();
  }
  chapterCard({ act = "", num = "", title = "", sub = "", hold = 4.2 }) {
    return new Promise((res) => {
      const c = el("div", "card chap");
      c.innerHTML = `<div class="cact">${esc(act)}</div><div class="cnum">${esc(num)}</div><div class="cline"></div><div class="ctitle">${esc(title)}</div><div class="csub">${esc(sub)}</div>`;
      let t = 0;
      const G = this.G;
      G.audio.chapterHit?.();
      const m = {
        el: c,
        update(dt, input) {
          t += dt;
          if (t > 0.8 && (input.pressed("x") || input.pressed("start"))) t = Math.max(t, hold);
          if (t >= hold && !c.classList.contains("out")) { c.classList.add("out"); setTimeout(() => { G.ui.pop(m); res(); }, 700); }
        },
      };
      this.push(m);
      requestAnimationFrame(() => c.classList.add("in"));
    });
  }
  loading({ tip = "", art = "", label = "", min = 1.6 }) {
    // returns { done(): Promise } — the screen stays until done() and at least `min` seconds
    const c = el("div", "loading");
    c.innerHTML = `<div class="lart">${art || document.getElementById("sigilTpl")?.innerHTML || ""}</div><div class="lgem"><i></i><i></i><i></i></div><div class="ltxt">NOW LOADING<span>...</span></div><div class="llabel">${esc(label)}</div><div class="lbar"><i></i></div><div class="ltip"><b>TIP</b>${esc(tip)}</div><div class="lcard">MEMORY CARD SLOT 1 · DO NOT REMOVE</div>`;
    document.getElementById("screen").appendChild(c);
    const t0 = performance.now();
    const bar = c.querySelector(".lbar i");
    let p = 0;
    const iv = setInterval(() => { p = Math.min(0.92, p + Math.random() * 0.12); bar.style.width = p * 100 + "%"; }, 120);
    return {
      done: () => new Promise((res) => {
        const wait = Math.max(0, min * 1000 - (performance.now() - t0));
        setTimeout(() => { clearInterval(iv); bar.style.width = "100%"; c.classList.add("out"); setTimeout(() => { c.remove(); res(); }, 450); }, wait);
      }),
    };
  }
  // ---------- simple overlays ----------
  fade(to, dur = 0.8, color) {
    if (color) this.fadeEl.style.background = color;
    return new Promise((res) => (this._fade = { from: this.fadeV, to, dur: Math.max(0.01, dur), t: 0, res }));
  }
  setFade(v, color) {
    this.fadeV = v;
    this.fadeEl.style.opacity = v;
    if (color) this.fadeEl.style.background = color;
    this._fade = null;
  }
  clock(t) {
    if (t == null) { this.clockEl.classList.remove("on"); return; }
    this.clockEl.innerHTML = `<span class="ampm">AM</span>${esc(t)}`;
    this.clockEl.classList.add("on");
    this.clockEl.classList.remove("blip");
    void this.clockEl.offsetWidth;
    this.clockEl.classList.add("blip");
  }
  objective(text) {
    if (!text) { this.objEl.classList.remove("on"); return; }
    this.objEl.innerHTML = `<span class="tag">OBJECTIVE</span>${esc(text)}`;
    this.objEl.classList.remove("on");
    void this.objEl.offsetWidth;
    this.objEl.classList.add("on");
    clearTimeout(this._objT);
    this._objT = setTimeout(() => this.objEl.classList.add("dim"), 5000);
    this.objEl.classList.remove("dim");
  }
  prompt(text) {
    if (text === this._lastPrompt) return;
    this._lastPrompt = text;
    if (!text) { this.promptEl.classList.remove("on"); return; }
    this.promptEl.innerHTML = `<b class="btnx">✕</b> ${esc(text)}`;
    this.promptEl.classList.add("on");
  }
  whisper(text, dur = 3.5) {
    this.whisperEl.textContent = text;
    this.whisperEl.classList.add("on");
    this._whisperT = dur;
  }
  toast(text, dur = 2.4) {
    this.toastEl.textContent = text;
    this.toastEl.classList.add("on");
    this._toastT = dur;
  }

  // ---------- dialogue ----------
  // lines: "text" | ["WHO", "text"] | { who, text, phone }
  say(lines, o = {}) {
    if (!Array.isArray(lines)) lines = [lines];
    lines = lines.map((l) => (typeof l === "string" ? { text: l } : Array.isArray(l) ? { who: l[0], text: l[1] } : l));
    return new Promise((res) => {
      const box = el("div", "dlg" + (o.top ? " top" : ""));
      const who = el("div", "who");
      const txt = el("div", "txt");
      const more = el("div", "more", "▼");
      const face = el("img", "face");
      box.append(face, who, txt, more);
      let i = -1, shown = 0, full = "", cur, tAcc = 0;
      const G = this.G;
      const next = () => {
        i++;
        if (i >= lines.length) { this.pop(m); res(); return; }
        cur = lines[i];
        full = cur.text;
        shown = 0;
        box.classList.toggle("phone", !!cur.phone);
        box.classList.toggle("radio", !!cur.radio);
        box.classList.toggle("sys", !!cur.sys);
        box.classList.toggle("mimic", !!cur.mimic);
        box.classList.toggle("narr", !cur.who && !cur.phone && !cur.sys);
        who.textContent = cur.phone ? "✉ " + (cur.who || "TEXT MESSAGE") : cur.radio ? "◉ " + cur.who : cur.who || "";
        who.style.display = cur.who || cur.phone ? "" : "none";
        const src = !cur.sys && !cur.mimic && cur.who ? portrait(cur.who) : null;
        face.style.display = src ? "" : "none";
        if (src) face.src = src;
        box.classList.toggle("hasface", !!src);
        this.voice = VOICE[(cur.who || "").toUpperCase().split(/[ (]/)[0]] || 1;
        txt.textContent = "";
        more.style.visibility = "hidden";
        cur.onShow?.();
      };
      const advance = () => {
        if (shown < full.length) { shown = full.length; txt.textContent = full; more.style.visibility = "visible"; return; }
        G.audio.blip();
        next();
      };
      box.addEventListener("click", (e) => { e.stopPropagation(); advance(); });
      const m = {
        el: box,
        update(dt, input) {
          if (shown < full.length) {
            tAcc += dt * (cur.slow ? 26 : 48);
            const n = Math.min(full.length, Math.floor(tAcc));
            if (n > shown) {
              shown = n;
              txt.textContent = full.slice(0, shown);
              if (shown % 2 === 0 && full[shown - 1] !== " ") G.audio.type(this.voice);
            }
            if (shown >= full.length) more.style.visibility = "visible";
          } else tAcc = 0;
          if (input.pressed("x") || input.pressed("o")) advance();
        },
      };
      this.push(m);
      next();
    });
  }

  // ---------- choice ----------
  choose(prompt, options, o = {}) {
    options = options.map((x) => (typeof x === "string" ? { text: x } : x));
    return new Promise((res) => {
      const box = el("div", "dlg choice" + (o.top ? " top" : ""));
      if (prompt) box.append(el("div", "txt q", esc(prompt)));
      const list = el("div", "opts");
      box.append(list);
      let sel = options.findIndex((x) => !x.disabled);
      const items = options.map((op, i) => {
        const it = el("div", "opt" + (op.disabled ? " dis" : ""), `<span class="hand">▶</span>${esc(op.text)}`);
        it.addEventListener("click", (e) => {
          e.stopPropagation();
          if (op.disabled) return;
          sel = i;
          render();
          pick();
        });
        list.append(it);
        return it;
      });
      const render = () => items.forEach((it, i) => it.classList.toggle("sel", i === sel));
      const G = this.G;
      const pick = () => { G.audio.confirm(); this.pop(m); res(sel); };
      const m = {
        el: box,
        update(dt, input) {
          const d = input.nav(dt);
          if (d) {
            let n = sel;
            do { n = (n + d + options.length) % options.length; } while (options[n].disabled && n !== sel);
            if (n !== sel) { sel = n; G.audio.move(); render(); }
          }
          if (input.pressed("x")) pick();
          if (o.cancel != null && input.pressed("o")) { G.audio.cancel(); this_pop(); }
        },
      };
      const this_pop = () => { this.pop(m); res(o.cancel); };
      render();
      this.push(m);
    });
  }

  // ---------- chapter title card ----------
  titleCard({ kicker = "", title = "", sub = "", hold = 3.2 }) {
    return new Promise((res) => {
      const c = el("div", "card");
      c.innerHTML = `<div class="k">${esc(kicker)}</div><div class="t">${esc(title)}</div><div class="s">${esc(sub)}</div>`;
      let t = 0;
      const G = this.G;
      const m = {
        el: c,
        update(dt, input) {
          t += dt;
          if (t > 0.6 && (input.pressed("x") || input.pressed("start"))) t = Math.max(t, hold);
          if (t >= hold && !c.classList.contains("out")) { c.classList.add("out"); setTimeout(() => { G.ui.pop(m); res(); }, 600); }
        },
      };
      this.push(m);
      requestAnimationFrame(() => c.classList.add("in"));
    });
  }

  // ---------- big centred text over black (endings, credits) ----------
  lines(list, o = {}) {
    return new Promise((res) => {
      const c = el("div", "card lines" + (o.cls ? " " + o.cls : ""));
      c.innerHTML = list.map((l) => `<p>${esc(l)}</p>`).join("");
      let t = 0;
      const hold = o.hold || 2.4 + list.length * 1.2;
      const G = this.G;
      const m = {
        el: c,
        update(dt, input) {
          t += dt;
          if (t > 0.8 && input.pressed("x")) t = Math.max(t, hold);
          if (t >= hold && !c.classList.contains("out")) { c.classList.add("out"); setTimeout(() => { G.ui.pop(m); res(); }, 700); }
        },
      };
      this.push(m);
      requestAnimationFrame(() => c.classList.add("in"));
    });
  }

  // ---------- item / photograph viewer ----------
  item({ title, canvas, text, sub }) {
    return new Promise((res) => {
      const c = el("div", "item");
      const h = el("div", "ititle", esc(title));
      c.append(h);
      if (canvas) {
        const f = el("div", "pic");
        canvas.className = "picc";
        f.append(canvas);
        c.append(f);
      }
      if (text) c.append(el("div", "itxt", esc(text)));
      c.append(el("div", "ihint", sub || "✕ CONTINUE"));
      this.G.audio.item();
      let t = 0;
      const G = this.G;
      const close = () => { G.audio.blip(); G.ui.pop(m); res(); };
      c.addEventListener("click", (e) => { e.stopPropagation(); if (t > 0.4) close(); });
      const m = { el: c, update(dt, input) { t += dt; if (t > 0.4 && (input.pressed("x") || input.pressed("o"))) close(); } };
      this.push(m);
    });
  }

  // ---------- generic menu ----------
  // items: [{ label, value, disabled, hint, get, set (for toggles) }]
  menu({ title, items, cls = "", foot, back = true, start = 0 }) {
    return new Promise((res) => {
      const c = el("div", "menu " + cls);
      if (title) c.append(el("div", "mtitle", esc(title)));
      const list = el("div", "mlist");
      c.append(list);
      const hint = el("div", "mhint");
      c.append(hint);
      if (foot) c.append(el("div", "mfoot", foot));
      let sel = Math.max(0, start);
      while (items[sel]?.disabled && sel < items.length - 1) sel++;
      const G = this.G;
      const rows = items.map((it, i) => {
        const r = el("div", "mrow" + (it.disabled ? " dis" : ""));
        r.addEventListener("click", (e) => {
          e.stopPropagation();
          if (it.disabled) return;
          sel = i;
          render();
          if (it.set) { it.set(1); G.audio.move(); render(); } else pick();
        });
        list.append(r);
        return r;
      });
      const render = () => {
        rows.forEach((r, i) => {
          const it = items[i];
          r.innerHTML = `<span class="hand">▶</span><span class="lbl">${esc(it.label)}</span>` + (it.get ? `<span class="val">◀ ${esc(it.get())} ▶</span>` : "");
          r.classList.toggle("sel", i === sel);
        });
        hint.textContent = items[sel]?.hint || "";
      };
      const pick = () => { G.audio.confirm(); G.ui.pop(m); res(items[sel].value); };
      const m = {
        el: c,
        update(dt, input) {
          const d = input.nav(dt);
          if (d) {
            let n = sel;
            do { n = (n + d + items.length) % items.length; } while (items[n].disabled && n !== sel);
            if (n !== sel) { sel = n; G.audio.move(); render(); }
          }
          const h = input.navH(dt);
          if (h && items[sel].set) { items[sel].set(h); G.audio.move(); render(); }
          if (input.pressed("x")) {
            if (items[sel].set) { items[sel].set(1); G.audio.move(); render(); }
            else pick();
          }
          if (back && (input.pressed("o") || input.pressed("start") && cls.includes("pause"))) { G.audio.cancel(); G.ui.pop(m); res(null); }
        },
        refresh: () => render(),
      };
      render();
      this.push(m);
    });
  }

  // ---------- status screen (△ outside battle) ----------
  journal(state) {
    const html = `
      <div class="jcol">
        <div class="jh">CHAPTER</div><div class="jobj">${esc(state.chapterName || "")}</div>
        <div class="jh">OBJECTIVE</div><div class="jobj">${esc(state.objective || "—")}</div>
        <div class="jh">COVENANT</div>
        <div class="jf"><b>EIDOLON COVENANT</b>KAIEN · RENJI · RAIZEN · SHION${state.ch >= 13 ? " · KYO" : ""}${state.ch >= 18 ? " · REQUIEM" : ""}</div>
      </div>
      <div class="jcol">
        <div class="jh">FIELD</div>
        <div class="jf small">STICK / WASD — WALK<br>□ / SHIFT — RUN (GUARD IN BATTLE)<br>✕ / SPACE — TALK · ATTACK<br>○ / Q — DODGE<br>△ / TAB — SQUAD COMMAND<br>START / ESC — PAUSE</div>
      </div>`;
    return new Promise((res) => {
      const c = el("div", "menu journal");
      c.append(el("div", "mtitle", "STATUS"));
      c.append(el("div", "jbody", html), el("div", "mhint", "△ / ○ CLOSE"));
      const G = this.G;
      const close = () => { G.audio.cancel(); G.ui.pop(m); res(); };
      c.addEventListener("click", (e) => { e.stopPropagation(); close(); });
      const m = { el: c, update(dt, input) { if (input.pressed("tri") || input.pressed("o") || input.pressed("x") || input.pressed("start")) close(); } };
      G.audio.blip();
      this.push(m);
    });
  }
}
