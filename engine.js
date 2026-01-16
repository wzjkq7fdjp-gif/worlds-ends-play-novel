// engine.js — minimal VN engine (iPhone safe)

(() => {
  const $ = (id) => document.getElementById(id);

  const UI = {
    btnSave: $("btnSave"),
    btnLoad: $("btnLoad"),
    btnMenu: $("btnMenu"),
    btnBack: $("btnBack"),
    btnNext: $("btnNext"),

    mainMenu: $("mainMenu"),
    storyView: $("storyView"),

    btnStart: $("btnStart"),
    btnContinue: $("btnContinue"),
    btnOptions: $("btnOptions"),
    btnCredits: $("btnCredits"),

    speaker: $("speaker"),
    text: $("text"),
    choices: $("choices"),
    toast: $("toast"),
    err: $("err"),
    screen: $("screen"),
  };

  window.State = window.State || { vars: {}, idx: 0, label: "start", stack: [] };

  function showErr(msg) {
    UI.err.classList.remove("hidden");
    UI.err.textContent = msg;
    console.error(msg);
  }

  function hideErr() {
    UI.err.classList.add("hidden");
    UI.err.textContent = "";
  }

  function toast(msg) {
    UI.toast.classList.remove("hidden");
    UI.toast.textContent = msg;
    setTimeout(() => UI.toast.classList.add("hidden"), 1200);
  }

  function showMainMenu() {
    UI.mainMenu.classList.remove("hidden");
    UI.storyView.classList.add("hidden");
  }

  function showStory() {
    UI.mainMenu.classList.add("hidden");
    UI.storyView.classList.remove("hidden");
  }

  function findLabelIndex(id) {
    const s = window.Story || [];
    for (let i = 0; i < s.length; i++) {
      const n = s[i];
      if (n && n.type === "label" && n.id === id) return i;
    }
    return -1;
  }

  function clearChoices() {
    UI.choices.innerHTML = "";
    UI.choices.classList.add("hidden");
  }

  function setSpeaker(name) {
    if (!name) UI.speaker.classList.add("hidden");
    else UI.speaker.classList.remove("hidden");
    UI.speaker.textContent = name || "";
  }

  function setText(txt) {
    UI.text.textContent = txt || "";
  }

  function runEffect(fn) {
    if (typeof fn === "function") fn();
  }

  function step() {
    hideErr();
    clearChoices();

    const story = window.Story;
    if (!Array.isArray(story) || story.length === 0) {
      showErr("Story not found. Make sure story.js sets window.Story = [...]");
      return;
    }

    // initialize idx from label if needed
    if (State.idx == null || State.idx < 0 || State.idx >= story.length) {
      const li = findLabelIndex(State.label || "start");
      State.idx = li >= 0 ? li : 0;
    }

    // move forward until we hit something displayable/interactive
    while (State.idx < story.length) {
      const node = story[State.idx++];

      if (!node) continue;

      if (node.type === "label") continue;

      if (node.type === "goto") {
        const li = findLabelIndex(node.id);
        if (li < 0) return showErr(`Missing label: ${node.id}`);
        State.label = node.id;
        State.idx = li;
        continue;
      }

      if (node.type === "bg" || node.type === "music") {
        // optional hooks you can add later
        continue;
      }

      if (node.type === "set") {
        State.vars[node.key] = node.value;
        continue;
      }

      if (node.type === "add") {
        State.vars[node.key] = (State.vars[node.key] ?? 0) + (node.value ?? 0);
        continue;
      }

      if (node.type === "if") {
        const ok = !!node.cond?.(State);
        const target = ok ? node.then : node.else;
        const li = findLabelIndex(target);
        if (li < 0) return showErr(`Missing label: ${target}`);
        State.label = target;
        State.idx = li;
        continue;
      }

      if (node.type === "narr") {
        showStory();
        setSpeaker("");
        setText(node.text || "");
        return;
      }

      if (node.type === "say") {
        showStory();
        setSpeaker(node.who || "");
        setText(node.text || "");
        return;
      }

      if (node.type === "choice") {
        showStory();
        setSpeaker("");
        setText(node.prompt || "");
        UI.choices.classList.remove("hidden");

        (node.options || []).forEach((opt) => {
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = opt.text || "Choice";
          b.onclick = () => {
            try {
              runEffect(opt.effect);
              const li = findLabelIndex(opt.goto);
              if (li < 0) return showErr(`Missing label: ${opt.goto}`);
              State.label = opt.goto;
              State.idx = li;
              step();
            } catch (e) {
              showErr(String(e));
            }
          };
          UI.choices.appendChild(b);
        });
        return;
      }

      // unknown node type => ignore
    }

    // end
    showStory();
    setSpeaker("");
    setText("End of content.");
  }

  function startNew() {
    State.idx = 0;
    State.label = "start";
    State.stack = [];
    step();
  }

  function saveGame() {
    localStorage.setItem("WE_SAVE", JSON.stringify(State));
    toast("Saved");
  }

  function loadGame() {
    const raw = localStorage.getItem("WE_SAVE");
    if (!raw) return toast("No save");
    try {
      const s = JSON.parse(raw);
      window.State = Object.assign(State, s);
      toast("Loaded");
      step();
    } catch (e) {
      showErr("Save file corrupted.");
    }
  }

  function continueGame() {
    const raw = localStorage.getItem("WE_SAVE");
    if (!raw) return toast("No save");
    loadGame();
  }

  // BUTTON WIRING (this is usually what breaks in buggy builds)
  UI.btnStart.onclick = startNew;
  UI.btnContinue.onclick = continueGame;
  UI.btnOptions.onclick = () => toast("Options (coming soon)");
  UI.btnCredits.onclick = () => toast("Credits (coming soon)");

  UI.btnMenu.onclick = () => showMainMenu();
  UI.btnSave.onclick = saveGame;
  UI.btnLoad.onclick = loadGame;

  UI.btnNext.onclick = () => step();
  UI.btnBack.onclick = () => toast("Back (coming soon)");

  // tap story panel to advance (but NOT menu)
  UI.storyView.addEventListener("click", (e) => {
    // If they tapped a choice button, ignore here
    if (e.target && e.target.tagName === "BUTTON") return;
    step();
  });

  // default view
  showMainMenu();

  // Debug: prove taps work
  console.log("engine.js loaded OK");
})();