/* =========================================================
   WORLD END(S) — ENGINE (engine.js)
   Works with story.js that defines:  window.Story = [ ... ]
   Needs these IDs in index.html:
   - btnNext, btnBack, btnSave, btnLoad, btnMenu
   - screen, speaker, text, choices, toast, err
   ========================================================= */

(() => {
  "use strict";

  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);

  const UI = {};
  const STORAGE_KEY = "world_ends_save_v1";

  function showErr(msg) {
    if (UI.err) {
      UI.err.classList.remove("hidden");
      UI.err.textContent = "JS ERROR:\n" + msg;
    } else {
      alert(msg);
    }
    console.error(msg);
  }

  function toast(msg) {
    if (!UI.toast) return;
    UI.toast.textContent = msg;
    UI.toast.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => UI.toast.classList.add("hidden"), 1400);
  }

  // ---------- State ----------
  const State = (window.State = window.State || {});
  State.vars = State.vars || {};
  State.flags = State.flags || {};
  State._stack = State._stack || []; // for Back
  State._i = State._i || 0;          // current story index

  // Safe init vars used by endings (if you do this in story.js, it's fine too)
  const ensureVar = (k, v = 0) => { if (typeof State.vars[k] !== "number") State.vars[k] = v; };
  ensureVar("truth", 0);
  ensureVar("resolve", 0);
  ensureVar("mercy", 0);
  ensureVar("hope", 0);
  ensureVar("fear", 0);

  // ---------- assets / bg ----------
  function setBg(value) {
    // you can map names to CSS classes or inline backgrounds later
    // for now we just set a data attribute your CSS can use
    document.body.dataset.bg = value || "default";
  }

  function setMusic(value) {
    // placeholder: if you later add an <audio id="bgm"> this will control it
    const bgm = $("bgm");
    if (!bgm) return;
    if (!value) {
      bgm.pause();
      bgm.removeAttribute("src");
      return;
    }
    if (bgm.getAttribute("src") !== value) {
      bgm.setAttribute("src", value);
      bgm.loop = true;
      bgm.play().catch(() => {});
    }
  }

  // ---------- story lookup ----------
  function findLabel(labelId) {
    const story = window.Story;
    if (!Array.isArray(story)) return -1;
    for (let i = 0; i < story.length; i++) {
      const n = story[i];
      if (n && n.type === "label" && n.id === labelId) return i;
    }
    return -1;
  }

  function gotoLabel(labelId, pushStack = true) {
    const idx = findLabel(labelId);
    if (idx < 0) {
      showErr(`Label not found: "${labelId}"`);
      return;
    }
    if (pushStack) State._stack.push(State._i);
    State._i = idx;
    step(); // render from that label
  }

  // ---------- rendering ----------
  function clearChoices() {
    if (!UI.choices) return;
    UI.choices.innerHTML = "";
    UI.choices.classList.add("hidden");
  }

  function setSpeaker(name) {
    if (!UI.speaker) return;
    if (!name) {
      UI.speaker.classList.add("hidden");
      UI.speaker.textContent = "";
      return;
    }
    UI.speaker.textContent = name;
    UI.speaker.classList.remove("hidden");
  }

  function setText(text) {
    if (!UI.text) return;
    UI.text.textContent = text || "";
  }

  function renderChoice(node) {
    if (!UI.choices) return;
    UI.choices.innerHTML = "";
    UI.choices.classList.remove("hidden");

    const prompt = document.createElement("div");
    prompt.className = "choicePrompt";
    prompt.textContent = node.prompt || "Choose:";
    UI.choices.appendChild(prompt);

    const opts = Array.isArray(node.options) ? node.options : [];
    if (opts.length === 0) {
      const p = document.createElement("div");
      p.textContent = "(No options configured)";
      UI.choices.appendChild(p);
      return;
    }

    opts.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "choiceBtn";
      btn.textContent = opt.text || "…";
      btn.addEventListener("click", () => {
        try {
          if (typeof opt.effect === "function") opt.effect();
        } catch (e) {
          showErr("Choice effect error: " + (e?.message || e));
          return;
        }

        clearChoices();

        // goto can be label id or numeric index
        if (typeof opt.goto === "string") {
          gotoLabel(opt.goto, true);
          return;
        }
        if (typeof opt.goto === "number") {
          State._stack.push(State._i);
          State._i = opt.goto;
          step();
          return;
        }

        // default: just advance after choosing
        advance();
      });

      UI.choices.appendChild(btn);
    });
  }

  // Executes nodes until it hits a node that needs player action (narr/choice),
  // otherwise it continues.
  function step() {
    try {
      if (!Array.isArray(window.Story)) {
        showErr("window.Story is missing. Make sure story.js sets: Story = [ ... ]");
        return;
      }

      // hide any prior error after successful step
      if (UI.err) UI.err.classList.add("hidden");

      clearChoices();

      // Keep consuming non-interactive nodes
      while (State._i < window.Story.length) {
        const node = window.Story[State._i];
        if (!node || !node.type) {
          State._i++;
          continue;
        }

        switch (node.type) {
          case "label":
            State._i++;
            continue;

          case "bg":
            setBg(node.value);
            State._i++;
            continue;

          case "music":
            setMusic(node.value);
            State._i++;
            continue;

          case "set":
            // { type:"set", key:"x", value: 1 } or value: (State)=>...
            if (node.key) {
              const v = (typeof node.value === "function") ? node.value(State) : node.value;
              State.vars[node.key] = v;
            }
            State._i++;
            continue;

          case "flag":
            // { type:"flag", key:"metAngel", value:true }
            if (node.key) State.flags[node.key] = !!node.value;
            State._i++;
            continue;

          case "jump":
            // { type:"jump", to:"some_label" }
            if (!node.to) { showErr("jump node missing 'to'"); return; }
            gotoLabel(node.to, true);
            return;

          case "narr":
          case "say": {
            // Interactive: show text, wait for Next/tap
            const speaker = node.type === "say" ? (node.speaker || "") : "";
            setSpeaker(speaker);

            // IMPORTANT: Use backticks in story.js for multiline, but engine just renders text as-is
            setText(node.text || "");

            // stop here, wait for input
            return;
          }

          case "choice":
            // Interactive
            setSpeaker(node.speaker || "");
            if (node.text) setText(node.text);
            renderChoice(node);
            return;

          case "end":
            setSpeaker("");
            setText(node.text || "THE END");
            toast("End.");
            return;

          default:
            showErr("Unknown node type: " + node.type);
            return;
        }
      }

      // reached end of Story array
      setSpeaker("");
      setText("End of story file.");
    } catch (e) {
      showErr(e?.stack || e?.message || String(e));
    }
  }

  function advance() {
    // If choices are open, don't advance
    if (UI.choices && !UI.choices.classList.contains("hidden")) return;
    State._stack.push(State._i);
    State._i++;
    step();
  }

  function goBack() {
    if (!State._stack.length) {
      toast("No previous.");
      return;
    }
    State._i = State._stack.pop();
    step();
  }

  // ---------- save / load ----------
  function saveGame() {
    try {
      const payload = {
        i: State._i,
        stack: State._stack,
        vars: State.vars,
        flags: State.flags,
        t: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      toast("Saved.");
    } catch (e) {
      showErr("Save failed: " + (e?.message || e));
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { toast("No save found."); return; }
      const data = JSON.parse(raw);

      State._i = typeof data.i === "number" ? data.i : 0;
      State._stack = Array.isArray(data.stack) ? data.stack : [];
      State.vars = (data.vars && typeof data.vars === "object") ? data.vars : {};
      State.flags = (data.flags && typeof data.flags === "object") ? data.flags : {};

      // re-ensure core vars exist
      ensureVar("truth", 0);
      ensureVar("resolve", 0);
      ensureVar("mercy", 0);
      ensureVar("hope", 0);
      ensureVar("fear", 0);

      toast("Loaded.");
      step();
    } catch (e) {
      showErr("Load failed: " + (e?.message || e));
    }
  }

  function showMainMenu() {
    // If you add a real menu screen later, we can render it here.
    // For now, this is a simple native menu so it never breaks.
    const pick = prompt(
      "MENU\n\n1 = Continue\n2 = Save\n3 = Load\n4 = Restart\n\nType 1-4:"
    );
    if (!pick) return;
    if (pick === "1") { step(); return; }
    if (pick === "2") { saveGame(); return; }
    if (pick === "3") { loadGame(); return; }
    if (pick === "4") {
      State._i = 0;
      State._stack = [];
      toast("Restarted.");
      step();
      return;
    }
  }

  // ---------- init ----------
  function bindUI() {
    UI.btnNext = $("btnNext");
    UI.btnBack = $("btnBack");
    UI.btnSave = $("btnSave");
    UI.btnLoad = $("btnLoad");
    UI.btnMenu = $("btnMenu");

    UI.screen = $("screen");
    UI.speaker = $("speaker");
    UI.text = $("text");
    UI.choices = $("choices");
    UI.toast = $("toast");
    UI.err = $("err");

    // These MUST exist or you’ll get that “null is not an object” error
    const required = ["btnNext","btnBack","btnSave","btnLoad","btnMenu","screen","text","choices","toast","err","speaker"];
    const missing = required.filter((id) => !$(id));
    if (missing.length) {
      showErr("Missing elements in index.html: " + missing.join(", "));
      return false;
    }

    UI.btnNext.onclick = advance;
    UI.btnBack.onclick = goBack;
    UI.btnSave.onclick = saveGame;
    UI.btnLoad.onclick = loadGame;
    UI.btnMenu.onclick = showMainMenu;

    // Tap/click the story screen to advance (like a VN)
    UI.screen.addEventListener("click", (e) => {
      // don’t advance if they clicked a choice button
      if (e.target && (e.target.closest(".choiceBtn") || e.target.id === "btnMenu")) return;
      advance();
    });

    return true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!bindUI()) return;

    // If story.js hasn’t loaded or Story is empty, show a clear error
    if (!Array.isArray(window.Story) || window.Story.length === 0) {
      showErr("Story is empty. Make sure story.js is loading AFTER engine.js and has: Story = [ ... ]");
      return;
    }

    step();
  });
})();