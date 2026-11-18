// ============================================================
// UI — 320×240 logical layout from the interface boards:
// lower dialogue panel (portrait left, name + two lines right),
// POV tag top-left (teal), clock top-right (amber), captions for
// every audio cue, choice / inventory / route map in the same
// border, flip-phone messages, sealed memory pages.
// ============================================================
import { portraitURL, propURL } from "./assets.js";

const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
export const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

// speaker key → name shown, portrait, line style
export const CAST = {
  rufki: { name: "RUFKI", por: "rufki" },
  argjila: { name: "ARGJILA", por: "argjila" },
  rufkiBig: { name: "RUFKI", por: "rufki_big" },
  argjilaBig: { name: "ARGJILA", por: "argjila_big" },
  other: { name: "RUFKI?", por: "other", cls: "mimic" },
  double: { name: "???", por: "other", cls: "mimic" },
  unmet: { name: "THE UNMET", por: "unmet", cls: "mimic" },
  unsaid: { name: "THE UNSAID", por: "unsaid", cls: "mimic" },
  keeper: { name: "KEEPER OF MINUTES", por: "keeper", cls: "keeper" },
  visitor: { name: "THE VISITOR", por: "other", cls: "mimic" },
  fakeA: { name: "ARGJILA?", por: "argjila", cls: "mimic" },
  kidR: { name: "BOY", por: "kid_rufki" },
  kidA: { name: "GIRL", por: "kid_argjila" },
  kids: { name: "CHILDREN", por: "kid_argjila" },
  confidante: { name: "BEST FRIEND", por: "confidante" },
  friend: { name: "FORMER FRIEND", por: "friend", cls: "mimic" },
  radio: { name: "RADIO", cls: "radio" },
  line: { name: "OPEN LINE", por: "rufki", cls: "radio" },
  sys: { name: "", cls: "sys" },
  narr: { name: "", cls: "narr" },
  child: { name: "CHILD", por: "kid_rufki" },
};

// which face Rufki / Argjila wear for a line: neutral, sad, scared or smile
const SCARED = /\b(run|stop|help|behind you|what is that|who's there|don't look|get away|it's here|can't breathe|wake up)\b/i;
const SAD = /\b(sorry|miss(ed)? you|alone|cry|crying|tears|lost|hurts?|gone|goodbye|too late|i was wrong|empty)\b/i;
const SMILE = /\b(love you|i love|laugh|happy|thank you|beautiful|cute|haha|official|surprise|we did it|perfect)\b/i;
export function moodOf(text = "", base) {
  if (SCARED.test(text)) return "scared";
  if (SAD.test(text)) return "sad";
  if (SMILE.test(text)) return "smile";
  return base || "neutral";
}

export class UI {
  constructor(G) {
    this.G = G;
    this.root = document.getElementById("ui");
    this.fadeEl = document.getElementById("fade");
    this.clockEl = document.getElementById("clock");
    this.povEl = document.getElementById("pov");
    this.objEl = document.getElementById("objective");
    this.promptEl = document.getElementById("prompt");
    this.capEl = document.getElementById("caption");
    this.toastEl = document.getElementById("toast");
    this.boxEl = document.getElementById("letterbox");
    this.stack = [];
    this.fadeV = 0;
    this._capQ = [];
  }
  get busy() { return this.stack.length > 0; }
  syncModal() {
    const full = this.stack.some((m) => /\b(menu|item|card|phone|page)\b/.test(m.el.className));
    document.body.classList.toggle("modal", full);
    document.body.classList.toggle("submenu", this.stack.some((m) => /\b(menu|item|page|card)\b/.test(m.el.className) && !m.el.classList.contains("title")));
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
    m.onPop?.();
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
    if (this._capT > 0) {
      this._capT -= dt;
      if (this._capT <= 0) this.capEl.classList.remove("on");
    }
    if (this._toastT > 0) {
      this._toastT -= dt;
      if (this._toastT <= 0) this.toastEl.classList.remove("on");
    }
  }

  // ---------- overlays ----------
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
  clock(t, cls = "") {
    if (t == null) { this.clockEl.classList.remove("on"); return; }
    this.clockEl.textContent = t;
    this.clockEl.className = "on " + cls;
    void this.clockEl.offsetWidth;
    this.clockEl.classList.add("blip");
  }
  pov(name) {
    if (!name) { this.povEl.classList.remove("on"); return; }
    this.povEl.textContent = name.toUpperCase() + " POV";
    this.povEl.className = "on " + name.toLowerCase();
  }
  objective(text) {
    if (!text) { this.objEl.classList.remove("on"); return; }
    this.objEl.innerHTML = `<span class="tag">OBJECTIVE</span>${esc(text)}`;
    this.objEl.classList.remove("on", "dim");
    void this.objEl.offsetWidth;
    this.objEl.classList.add("on");
    clearTimeout(this._objT);
    this._objT = setTimeout(() => this.objEl.classList.add("dim"), 5000);
  }
  prompt(text) {
    if (text === this._lastPrompt) return;
    this._lastPrompt = text;
    if (!text) { this.promptEl.classList.remove("on"); return; }
    this.promptEl.innerHTML = `<b class="btnx">✕</b> ${esc(text)}`;
    this.promptEl.classList.add("on");
  }
  // sound captions: every audio-driven cue gets one
  caption(text, dur = 2.6) {
    if (!this.G.opts.captions) return;
    this.capEl.textContent = `[${text}]`;
    this.capEl.classList.remove("on");
    void this.capEl.offsetWidth;
    this.capEl.classList.add("on");
    this._capT = dur;
  }
  toast(text, dur = 2.4) {
    this.toastEl.textContent = text;
    this.toastEl.classList.add("on");
    this._toastT = dur;
  }
  letterbox(on) { this.boxEl.classList.toggle("on", !!on); }
  peep(on) { document.getElementById("peep").classList.toggle("on", !!on); }

  // ---------- dialogue ----------
  // expression for the two leads: a line's own { e } tag, else read from the words
  // lines: "narration" | [who, text] | { who, text, slow, onShow, fx }
  say(lines, o = {}) {
    if (!Array.isArray(lines) || typeof lines[0] === "string" && lines.length === 2 && CAST[lines[0]] !== undefined && !Array.isArray(lines[1])) lines = [lines];
    lines = lines.map((l) => (typeof l === "string" ? { who: "narr", text: l } : Array.isArray(l) ? { who: l[0] || "narr", text: l[1], ...(l[2] || {}) } : l));
    const G = this.G;
    G.voice?.prefetch(lines);
    return new Promise((res) => {
      const box = el("div", "dlg");
      const por = el("img", "por");
      const who = el("div", "who");
      const txt = el("div", "txt");
      const more = el("div", "more", "▼");
      box.append(por, who, txt, more);
      let i = -1, shown = 0, full = "", cur, tAcc = 0, rate = 40, vo = null, waitVo = 0, autoT = 0;
      const next = async () => {
        vo?.stop();
        vo = null;
        i++;
        if (i >= lines.length) { this.pop(m); res(); return; }
        cur = lines[i];
        const C = CAST[cur.who] || { name: String(cur.who).toUpperCase() };
        full = cur.text;
        shown = 0;
        tAcc = 0;
        autoT = 0;
        box.className = "dlg " + (C.cls || "") + (C.por ? "" : " nopor") + (o.top ? " top" : "");
        const url = C.por && portraitURL(C.por, cur.e || moodOf(cur.text, G.state?.mood));
        if (url) { por.src = url; por.style.display = ""; } else por.style.display = "none";
        who.textContent = C.name || "";
        txt.textContent = "";
        more.style.visibility = "hidden";
        cur.onShow?.();
        rate = cur.slow ? 22 : 40;
        // voice: wait briefly for it to decode, then pace the text to it
        waitVo = 0;
        if (G.voice && G.opts.voice) {
          const tok = {};
          this._voTok = tok;
          const v = await G.voice.play(cur.who, cur.text, cur.fx);
          if (this._voTok !== tok || cur !== lines[i]) { v?.stop(); return; }
          vo = v;
          if (v && v.dur > 0.3) rate = Math.max(14, Math.min(70, full.length / (v.dur * 0.82)));
        }
      };
      const advance = () => {
        if (shown < full.length) { shown = full.length; txt.textContent = full; more.style.visibility = "visible"; return; }
        G.audio.blip();
        next();
      };
      box.addEventListener("click", (e) => { e.stopPropagation(); advance(); });
      const m = {
        el: box,
        onPop: () => { vo?.stop(); this._voTok = null; },
        update(dt, input) {
          if (shown < full.length) {
            tAcc += dt * rate;
            const n = Math.min(full.length, Math.floor(tAcc));
            if (n > shown) {
              shown = n;
              txt.textContent = full.slice(0, shown);
              if (!vo && shown % 2 === 0 && full[shown - 1] !== " ") G.audio.type(cur.who);
            }
            if (shown >= full.length) more.style.visibility = "visible";
          } else if (G.opts.autoText && (!vo || vo.ended())) {
            autoT += dt;
            if (autoT > 0.9 + full.length * 0.012) advance();
          }
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
      const box = el("div", "frame choice" + (o.cls ? " " + o.cls : ""));
      if (o.title) box.append(el("div", "ftitle", esc(o.title)));
      if (prompt) box.append(el("div", "q", esc(prompt)));
      const list = el("div", "opts");
      box.append(list);
      box.append(el("div", "fhint", `<span>✕ Confirm</span>${o.cancel != null ? "<span>○ Back</span>" : ""}`));
      let sel = Math.max(0, options.findIndex((x) => !x.disabled));
      const items = options.map((op, i) => {
        const it = el("div", "opt" + (op.disabled ? " dis" : ""), esc(op.text));
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
      let t = 0;
      const pick = () => { if (t < 0.25) return; G.audio.confirm(); this.pop(m); res(sel); };
      const m = {
        el: box,
        update(dt, input) {
          t += dt;
          const d = input.nav(dt);
          if (d) {
            let n = sel;
            do { n = (n + d + options.length) % options.length; } while (options[n].disabled && n !== sel);
            if (n !== sel) { sel = n; G.audio.move(); render(); }
          }
          if (input.pressed("x")) pick();
          if (o.cancel != null && input.pressed("o")) { G.audio.cancel(); G.ui.pop(m); res(o.cancel); }
        },
      };
      render();
      this.push(m);
    });
  }

  // ---------- chapter card ----------
  titleCard({ kicker = "", title = "", sub = "", pov = "", hold = 3.6 }) {
    return new Promise((res) => {
      const c = el("div", "card");
      c.innerHTML = `<div class="k">${esc(kicker)}</div><div class="t">${esc(title)}</div><div class="rule"></div><div class="s">${esc(sub)}</div>${pov ? `<div class="p">${esc(pov)}</div>` : ""}`;
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

  // POV handoff sweep
  handoff(name, sub = "") {
    return new Promise((res) => {
      const c = el("div", "card handoff " + name.toLowerCase());
      c.innerHTML = `<div class="hk">CONTROL PASSES TO</div><div class="hn">${esc(name.toUpperCase())}</div><div class="hs">${esc(sub)}</div>`;
      let t = 0;
      const G = this.G;
      G.audio.handoff?.();
      const m = {
        el: c,
        update(dt, input) {
          t += dt;
          if (t > 0.5 && input.pressed("x")) t = Math.max(t, 1.9);
          if (t >= 1.9 && !c.classList.contains("out")) { c.classList.add("out"); setTimeout(() => { G.ui.pop(m); res(); }, 450); }
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
      const hold = o.hold || 2.4 + list.length * 1.3;
      const G = this.G;
      if (o.voice && G.voice && G.opts.voice) G.voice.play(o.voice, list.join(" "));
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
  // { title, prop | img | canvas, text, sub }
  item({ title, prop, img, canvas, text, sub, round }) {
    return new Promise((res) => {
      const c = el("div", "item frame" + (round ? " round" : ""));
      c.append(el("div", "ftitle", esc(title)));
      if (canvas || prop || img) {
        const f = el("div", "pic");
        if (canvas) { canvas.className = "picc"; f.append(canvas); }
        else { const im = el("img", "picc"); im.src = prop ? propURL(prop) : img; f.append(im); }
        c.append(f);
      }
      if (text) c.append(el("div", "itxt", esc(text)));
      c.append(el("div", "fhint", `<span>${esc(sub || "✕ Continue")}</span>`));
      this.G.audio.item();
      let t = 0;
      const G = this.G;
      const close = () => { G.audio.blip(); G.ui.pop(m); res(); };
      c.addEventListener("click", (e) => { e.stopPropagation(); if (t > 0.4) close(); });
      const m = { el: c, update(dt, input) { t += dt; if (t > 0.4 && (input.pressed("x") || input.pressed("o"))) close(); } };
      this.push(m);
    });
  }

  // ---------- cutscene still: a painted frame with a slow camera drift ----------
  still({ src, text, hold = 7, rev = false }) {
    return new Promise((res) => {
      const c = el("div", "cg" + (rev ? " r" : ""));
      c.style.setProperty("--kb", hold + 3 + "s");
      const im = el("img");
      im.src = src;
      c.append(im);
      if (text) c.append(el("div", "cgtxt", esc(text)));
      let t = 0, done = false;
      const G = this.G;
      const close = () => {
        if (done) return;
        done = true;
        c.classList.add("out");
        setTimeout(() => { G.ui.pop(m); res(); }, 850);
      };
      c.addEventListener("click", (e) => { e.stopPropagation(); if (t > 0.8) close(); });
      const m = { el: c, update(dt, input) { t += dt; if (t > hold) close(); else if (t > 0.8 && (input.pressed("x") || input.pressed("o"))) close(); } };
      this.push(m);
    });
  }

  // ---------- flip phone ----------
  // messages: [{ from: "me"|"them", text, time }]; replies: optional choices shown under the thread
  phone({ contact = "", date = "", messages = [], replies = null, closeLabel = "Close the phone" }) {
    return new Promise((res) => {
      const c = el("div", "phone");
      const scr = el("div", "pscreen");
      const head = el("div", "phead", `<span>${esc(contact)}</span><span>${esc(date)}</span>`);
      const body = el("div", "pbody");
      scr.append(head, body);
      const opts = el("div", "popts");
      c.append(el("img", "pshell"), scr, opts);
      c.querySelector(".pshell").src = propURL("flipphone");
      const G = this.G;
      let shown = 0, t = 0, sel = 0, done = false;
      const addMsg = (mm) => {
        const b = el("div", "pmsg " + (mm.from === "me" ? "me" : "them"), `${esc(mm.text)}${mm.time ? `<i>${esc(mm.time)}</i>` : ""}`);
        body.append(b);
        body.scrollTop = body.scrollHeight;
        G.audio.textBeep?.();
      };
      const opt = replies ? [...replies, closeLabel] : [closeLabel];
      const render = () => {
        opts.innerHTML = "";
        if (shown < messages.length) return;
        opt.forEach((o, i) => {
          const r = el("div", "opt" + (i === sel ? " sel" : ""), esc(o));
          r.addEventListener("click", (e) => { e.stopPropagation(); sel = i; pick(); });
          opts.append(r);
        });
      };
      const pick = () => { if (done) return; done = true; G.audio.confirm(); G.ui.pop(m); res(sel < (replies?.length || 0) ? sel : -1); };
      const m = {
        el: c,
        update(dt, input) {
          t += dt;
          if (shown < messages.length && (t > 0.9 || input.pressed("x"))) { addMsg(messages[shown++]); t = 0; render(); return; }
          if (shown < messages.length) return;
          const d = input.nav(dt);
          if (d) { sel = (sel + d + opt.length) % opt.length; G.audio.move(); render(); }
          if (input.pressed("x") && t > 0.3) pick();
        },
      };
      this.push(m);
      G.audio.flip?.();
      render();
    });
  }

  // ---------- sealed memory page (Argjila's open memories) ----------
  page({ title, date = "", anchor = "", text = "", sealed = false }) {
    return new Promise((res) => {
      const c = el("div", "page frame" + (sealed ? " sealed" : ""));
      c.append(el("div", "ftitle", esc(title)), el("div", "pdate", esc(date)));
      if (anchor) c.append(el("div", "panchor", esc(anchor)));
      c.append(el("div", "ptext", sealed ? "This memory is Argjila's to write.<br><span>The page stays blank until she tells it herself.</span>" : esc(text).replace(/\n/g, "<br>")));
      c.append(el("div", "fhint", "<span>✕ Close</span>"));
      const G = this.G;
      G.audio.page?.();
      let t = 0;
      const close = () => { G.audio.blip(); G.ui.pop(m); res(); };
      c.addEventListener("click", (e) => { e.stopPropagation(); if (t > 0.5) close(); });
      const m = { el: c, update(dt, input) { t += dt; if (t > 0.5 && (input.pressed("x") || input.pressed("o"))) close(); } };
      this.push(m);
    });
  }

  // ---------- generic menu ----------
  menu({ title, items, cls = "", foot, back = true, start = 0 }) {
    return new Promise((res) => {
      const c = el("div", "menu frame " + cls);
      if (title) c.append(el("div", "ftitle", esc(title)));
      const list = el("div", "mlist");
      c.append(list);
      const hint = el("div", "mhint");
      c.append(hint);
      if (foot) c.append(el("div", "mfoot", foot));
      c.append(el("div", "fhint", `<span>✕ Confirm</span>${back ? "<span>○ Back</span>" : ""}`));
      let sel = Math.max(0, start);
      while (items[sel]?.disabled && sel < items.length - 1) sel++;
      const G = this.G;
      const rows = items.map((it, i) => {
        const r = el("div", "mrow" + (it.disabled ? " dis" : "") + (it.cls ? " " + it.cls : ""));
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
          r.innerHTML = `<span class="lbl">${esc(it.label)}</span>` + (it.get ? `<span class="val">◀ ${esc(it.get())} ▶</span>` : it.right ? `<span class="val">${esc(it.right)}</span>` : "");
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
            else if (!items[sel].disabled) pick();
          }
          if (back && (input.pressed("o") || (input.pressed("start") && cls.includes("pause")))) { G.audio.cancel(); G.ui.pop(m); res(null); }
        },
      };
      render();
      this.push(m);
    });
  }

  // ---------- memory items (inventory) ----------
  async inventory(state) {
    const inv = state.items || [];
    if (!inv.length) return this.menu({ title: "MEMORY ITEMS", items: [{ label: "Nothing yet.", disabled: true }], cls: "inv" });
    while (true) {
      const v = await this.menu({ title: "MEMORY ITEMS", cls: "inv", items: inv.map((it, i) => ({ label: it.name, value: i, hint: it.hint || "" })) });
      if (v == null) return;
      const it = inv[v];
      await this.item({ title: it.name, prop: it.prop, img: it.img, text: it.text });
    }
  }

  // ---------- memory route (pause map) ----------
  routeMap(state, here) {
    const R = state.repaired || {};
    const row = (k, n) => ({ label: `[${R[k] ? "+" : " "}] ${n}`, right: R[k] ? "Repaired" : "Unfinished", disabled: true, cls: R[k] ? "ok" : "" });
    return this.menu({
      title: "MEMORY ROUTE",
      cls: "route",
      items: [
        { label: `You are at ${here || "—"}`, disabled: true, cls: "here" },
        row("dance", "Dance"),
        row("return", "NYC return"),
        row("park", "Park"),
        { label: `The Memory of Us`, right: "♥".repeat(Math.min(8, state.us || 0)) + "·".repeat(Math.max(0, 8 - (state.us || 0))), disabled: true },
      ],
    });
  }
}
