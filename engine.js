(() => {
  const $ = (id) => document.getElementById(id);

  const UI = {
    screen: $("screen"),
    speaker: $("speaker"),
    text: $("text"),
    choices: $("choices"),
    toast: $("toast"),
    err: $("err"),

    btnBack: $("btnBack"),
    btnNext: $("btnNext"),
    btnSave: $("btnSave"),
    btnLoad: $("btnLoad"),
    btnMenu: $("btnMenu"),

    mainMenu: $("mainMenu"),
    btnStart: $("btnStart"),
    btnContinue: $("btnContinue"),
    btnOptions: $("btnOptions"),
    btnCredits: $("btnCredits"),
  };

  window.State = window.State || {};
  State.vars = State.vars || {};
  State.index = State.index || 0;

  function showErr(msg) {
    if (!UI.err) return;
    UI.err.classList.remove("hidden");
    UI.err.textContent = `JS ERROR:\n${msg}`;
  }
  function clearErr() {
    if (!UI.err) return;
    UI.err.classList.add("hidden");
    UI.err.textContent = "";
  }
  function toast(msg) {
    if (!UI.toast) return;
    UI.toast.classList.remove("hidden");
    UI.toast.textContent = msg;
    setTimeout(() => {
      UI.toast.classList.add("hidden");
      UI.toast.textContent = "";
    }, 900);
  }

  // Diagnostics: tell you what is missing
  function diag() {
    const missing = [];
    [
      "screen","speaker","text","choices","toast","err",
      "btnNext","btnBack","btnSave","btnLoad","btnMenu"
    ].forEach((k) => { if (!UI[k]) missing.push(k); });
    if (missing.length) toast("Missing IDs: " + missing.join(", "));
  }

  // Build label map
  let labels = null;
  function buildLabels() {
    labels = {};
    const story = window.Story || [];
    for (let i = 0; i < story.length; i++) {
      if (story[i]?.type === "label") labels[story[i].id] = i;
    }
  }
  function gotoLabel(id) {
    if (!labels) buildLabels();
    const idx = labels[id];
    if (typeof idx !== "number") throw new Error("Label not found: " + id);
    State.index = idx;
  }

  function setSpeaker(who) {
    if (!UI.speaker) return;
    if (!who) {
      UI.speaker.classList.add("hidden");
      UI.speaker.textContent = "";
    } else {
      UI.speaker.classList.remove("hidden");
      UI.speaker.textContent = who;
    }
  }
  function setText(t) {
    if (!UI.text) return;
    UI.text.textContent = t || "";
  }

  function clearChoices() {
    if (!UI.choices) return;
    UI.choices.innerHTML = "";
    UI.choices.classList.add("hidden");
  }
  function choicesVisible() {
    return UI.choices && !UI.choices.classList.contains("hidden") && UI.choices.children.length > 0;
  }

  function renderChoice(node) {
    clearChoices();
    UI.choices.classList.remove("hidden");

    const prompt = document.createElement("div");
    prompt.className = "choicePrompt";
    prompt.textContent = node.prompt || "Choose:";
    UI.choices.appendChild(prompt);

    (node.options || []).forEach((opt) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choiceBtn";
      b.textContent = opt.text || "…";

      const onPick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
          toast("Picked: " + (opt.text || ""));
          if (typeof opt.effect === "function") opt.effect();
          if (opt.goto) gotoLabel(opt.goto);
          clearChoices();
          next();
        } catch (err) {
          showErr(err?.message || String(err));
        }
      };

      b.addEventListener("touchstart", onPick, { passive: false });
      b.addEventListener("click", onPick);

      UI.choices.appendChild(b);
    });
  }

  function next() {
    clearErr();

    const story = window.Story || [];
    if (!story.length) return showErr("window.Story is empty — story.js not loaded.");

    if (choicesVisible()) return; // DO NOT advance while choice screen is up

    while (State.index < story.length) {
      const n = story[State.index++];
      if (!n) continue;

      try {
        if (n.type === "label") continue;

        if (n.type === "goto") { gotoLabel(n.id); continue; }

        if (n.type === "narr") { setSpeaker(""); setText((n.text || "").trim()); return; }
        if (n.type === "say") { setSpeaker(n.who || ""); setText((n.text || "").trim()); return; }

        if (n.type === "choice") { renderChoice(n); return; }

        if (n.type === "set") { State.vars[n.key] = n.value; continue; }
        if (n.type === "add") { State.vars[n.key] = (State.vars[n.key] ?? 0) + (n.value ?? 0); continue; }

        if (n.type === "if") {
          const ok = !!(n.cond && n.cond(State));
          gotoLabel(ok ? n.then : n.else);
          continue;
        }

        // bg/music are safe no-ops
        if (n.type === "bg" || n.type === "music") continue;

      } catch (err) {
        showErr(err?.message || String(err));
        return;
      }
    }

    setSpeaker("");
    setText("— END —");
  }

  function bind(btn, fn) {
    if (!btn) return;
    const h = (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
    btn.addEventListener("touchstart", h, { passive: false });
    btn.addEventListener("click", h);
  }

  const SAVE_KEY = "world_ends_save_v1";
  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ index: State.index, vars: State.vars }));
      toast("Saved.");
    } catch (e) { showErr("Save failed: " + (e?.message || e)); }
  }
  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return toast("No save.");
      const p = JSON.parse(raw);
      State.index = p.index ?? 0;
      State.vars = p.vars ?? {};
      clearChoices();
      next();
      toast("Loaded.");
    } catch (e) { showErr("Load failed: " + (e?.message || e)); }
  }

  // HARD STOP advance handler:
  // - ignores buttons
  // - ignores taps inside #choices or #mainMenu
  function advanceHandler(e) {
    const t = e.target;
    if (!t) return;

    // If tap is in menu or choices, NEVER advance
    if (UI.choices && t.closest && t.closest("#choices")) return;
    if (UI.mainMenu && t.closest && t.closest("#mainMenu")) return;

    // If tap is a button (or inside a button), NEVER advance
    if (t.tagName === "BUTTON") return;
    if (t.closest && t.closest("button")) return;

    if (choicesVisible()) return;
    next();
  }

  function init() {
    try {
      diag();
      if (!window.Story) throw new Error("story.js did not load window.Story");
      buildLabels();

      bind(UI.btnNext, next);
      bind(UI.btnBack, () => toast("Back later"));
      bind(UI.btnSave, saveGame);
      bind(UI.btnLoad, loadGame);
      bind(UI.btnMenu, () => { if (UI.mainMenu) UI.mainMenu.classList.remove("hidden"); });

      bind(UI.btnStart, () => { if (UI.mainMenu) UI.mainMenu.classList.add("hidden"); gotoLabel("start"); next(); });
      bind(UI.btnContinue, () => { if (UI.mainMenu) UI.mainMenu.classList.add("hidden"); loadGame(); });

      // Tap to advance on screen
      const target = UI.screen || document;
      target.addEventListener("touchstart", advanceHandler, { passive: false });
      target.addEventListener("click", advanceHandler);

      // Start
      if (UI.mainMenu) {
        UI.mainMenu.classList.remove("hidden");
      } else {
        gotoLabel("start");
        next();
      }
    } catch (e) {
      showErr(e?.message || String(e));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();