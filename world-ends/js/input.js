// ============================================================
// Unified input: keyboard, gamepad, touch (virtual stick + pad)
// Buttons: x (confirm/interact), o (back), sq (run), tri (journal),
//          start (pause), r1 (look/hold facing)
// ============================================================
const KEYMAP = {
  KeyW: "up", ArrowUp: "up", KeyS: "down", ArrowDown: "down",
  KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right",
  Space: "x", Enter: "x", KeyE: "x", KeyZ: "x",
  Escape: "start", KeyP: "start",
  Backspace: "o", KeyQ: "o", KeyX: "o",
  ShiftLeft: "sq", ShiftRight: "sq",
  Tab: "tri", KeyJ: "tri",
  KeyF: "r1",
};
const BTNS = ["up", "down", "left", "right", "x", "o", "sq", "tri", "start", "r1"];

export class Input {
  constructor() {
    this.held = {};
    this.prev = {};
    this.now = {};
    this.stick = { x: 0, y: 0 };
    this.touch = { x: 0, y: 0, active: false, id: null };
    this.touchBtns = {};
    this.latch = {}; // taps shorter than a frame still register
    this.lastDevice = "keyboard";
    this.anyPressedCb = null;
    window.addEventListener("keydown", (e) => {
      const b = KEYMAP[e.code];
      if (b) {
        if (!e.repeat) this.latch[b] = true;
        this.held["k_" + b] = true;
        if (["Tab", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace"].includes(e.code)) e.preventDefault();
        this.lastDevice = "keyboard";
        this.anyPressedCb?.();
      }
    });
    window.addEventListener("keyup", (e) => {
      const b = KEYMAP[e.code];
      if (b) this.held["k_" + b] = false;
    });
    window.addEventListener("blur", () => { this.held = {}; this.touchBtns = {}; });
  }

  bindTouch(root) {
    const zone = root.querySelector("#stickZone");
    const base = root.querySelector("#stickBase");
    const knob = root.querySelector("#stickKnob");
    const R = () => base.offsetWidth * 0.5 || 50;
    const start = (t) => {
      const zr = zone.getBoundingClientRect();
      this.touch.id = t.identifier;
      this.touch.active = true;
      this.touch.ox = t.clientX;
      this.touch.oy = t.clientY;
      base.style.left = t.clientX - zr.left + "px";
      base.style.top = t.clientY - zr.top + "px";
      base.classList.add("on");
      move(t);
    };
    const move = (t) => {
      let dx = t.clientX - this.touch.ox, dy = t.clientY - this.touch.oy;
      const r = R(), m = Math.hypot(dx, dy);
      if (m > r) { dx *= r / m; dy *= r / m; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.touch.x = dx / r;
      this.touch.y = -dy / r;
    };
    const end = () => {
      this.touch.active = false;
      this.touch.id = null;
      this.touch.x = this.touch.y = 0;
      knob.style.transform = "";
      base.classList.remove("on");
    };
    zone.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.lastDevice = "touch";
      this.anyPressedCb?.();
      if (this.touch.id == null) start(e.changedTouches[0]);
    }, { passive: false });
    zone.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) if (t.identifier === this.touch.id) move(t);
    }, { passive: false });
    const endH = (e) => {
      for (const t of e.changedTouches) if (t.identifier === this.touch.id) end();
    };
    zone.addEventListener("touchend", endH);
    zone.addEventListener("touchcancel", endH);

    root.querySelectorAll("[data-btn]").forEach((el) => {
      const b = el.dataset.btn;
      const on = (e) => {
        e.preventDefault();
        this.lastDevice = "touch";
        this.touchBtns[b] = true;
        this.latch[b] = true;
        el.classList.add("down");
        this.anyPressedCb?.();
      };
      const off = (e) => {
        e.preventDefault();
        this.touchBtns[b] = false;
        el.classList.remove("down");
      };
      el.addEventListener("touchstart", on, { passive: false });
      el.addEventListener("touchend", off, { passive: false });
      el.addEventListener("touchcancel", off, { passive: false });
      el.addEventListener("mousedown", on);
      el.addEventListener("mouseup", off);
      el.addEventListener("mouseleave", off);
    });
  }

  // call once per frame
  poll() {
    this.prev = this.now;
    const n = {};
    for (const b of BTNS) n[b] = !!(this.held["k_" + b] || this.touchBtns[b] || this.latch[b]);
    this.latch = {};
    let sx = 0, sy = 0;
    if (n.left) sx -= 1;
    if (n.right) sx += 1;
    if (n.up) sy += 1;
    if (n.down) sy -= 1;
    if (sx && sy) { sx *= 0.7071; sy *= 0.7071; }
    // gamepad
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p) continue;
      const B = (i) => !!(p.buttons[i] && p.buttons[i].pressed);
      let ax = p.axes[0] || 0, ay = -(p.axes[1] || 0);
      const m = Math.hypot(ax, ay);
      if (m < 0.18) { ax = 0; ay = 0; } else { const k = Math.min(1, (m - 0.18) / 0.77) / m; ax *= k; ay *= k; }
      const dU = B(12), dD = B(13), dL = B(14), dR = B(15);
      if (dU) ay = 1; if (dD) ay = -1; if (dL) ax = -1; if (dR) ax = 1;
      if (Math.abs(ax) > Math.abs(sx)) sx = ax;
      if (Math.abs(ay) > Math.abs(sy)) sy = ay;
      const map = { x: B(0), o: B(1), sq: B(2), tri: B(3), start: B(9), r1: B(5) || B(7) || B(4) || B(6) };
      for (const k in map) if (map[k]) { n[k] = true; this.lastDevice = "pad"; }
      if (ay > 0.5 || dU) n.up = true;
      if (ay < -0.5 || dD) n.down = true;
      if (ax < -0.5 || dL) n.left = true;
      if (ax > 0.5 || dR) n.right = true;
      if (m > 0.3 || Object.values(map).some(Boolean)) this.lastDevice = "pad";
    }
    if (this.touch.active) {
      sx = this.touch.x;
      sy = this.touch.y;
      // the stick also drives menu navigation
      if (sy > 0.6) n.up = true;
      if (sy < -0.6) n.down = true;
      if (sx < -0.6) n.left = true;
      if (sx > 0.6) n.right = true;
    }
    this.stick.x = sx;
    this.stick.y = sy;
    this.now = n;
  }
  pressed(b) { return this.now[b] && !this.prev[b]; }
  down(b) { return !!this.now[b]; }
  // menu navigation with auto-repeat
  nav(dt) {
    let dir = 0;
    if (this.now.up) dir = -1;
    else if (this.now.down) dir = 1;
    if (dir !== this._navDir) { this._navDir = dir; this._navT = 0.35; return dir; }
    if (dir) { this._navT -= dt; if (this._navT <= 0) { this._navT = 0.12; return dir; } }
    return 0;
  }
  navH(dt) {
    let dir = 0;
    if (this.now.left) dir = -1;
    else if (this.now.right) dir = 1;
    if (dir !== this._navHDir) { this._navHDir = dir; this._navHT = 0.35; return dir; }
    if (dir) { this._navHT -= dt; if (this._navHT <= 0) { this._navHT = 0.15; return dir; } }
    return 0;
  }
  // swallow currently-held buttons so they don't leak into the next context
  flush() { this.prev = { ...this.now }; for (const b of BTNS) this.prev[b] = true; this.latch = {}; }
}
