/* =========================================================
   WORLDS END(S) — Engine v1 (Mobile-first)
   - Supports: label, bg, music, narr, choice, jump, end
   - Buttons: Back / Next + tap story area to advance
   - Save/Load via localStorage
   ========================================================= */

const State = {
  i: 0,
  history: [],
  vars: { truth: 0, resolve: 0, mercy: 0, hope: 0, fear: 0, flags: {} },
  bg: "",
  music: "",
};

let Story = []; // story.js sets this

const UI = {};

function $(id) { return document.getElementById(id); }

function bindUI() {
  UI.text = $("text");
  UI.choices = $("choices");
  UI.toast = $("toast");
  UI.err = $("err");

  UI.btnBack = $("btnBack");
  UI.btnNext = $("btnNext");
  UI.btnSave = $("btnSave");
  UI.btnLoad = $("btnLoad");
  UI.btnMenu = $("btnMenu");

  // Required buttons check (prevents silent iOS fail)
  const required = ["text","choices","btnBack","btnNext","btnSave","btnLoad","btnMenu"];
  for (const k of required) {
    if (!UI[k]) {
      showError(`Missing UI element: #${k}. Check index.html ids.`);
      return false;
    }
  }

  UI.btnBack.onclick = () => back();
  UI.btnNext.onclick = () => next();
  UI.btnSave.onclick = () => saveGame();
  UI.btnLoad.onclick = () => loadGame();
  UI.btnMenu.onclick = () => showToast("Menu: (coming soon)");

  // Tap story area to advance (iOS friendly)
  UI.text.addEventListener("click", () => next());

  return true;
}

function showToast(msg) {
  if (!UI.toast) return;
  UI.toast.classList.remove("hidden");
  UI.toast.textContent = msg;
  setTimeout(() => UI.toast.classList.add("hidden"), 1600);
}

function showError(msg) {
  if (UI.err) {
    UI.err.classList.remove("hidden");
    UI.err.textContent = `JS ERROR:\n${msg}`;
  } else {
    alert(msg);
  }
  console.error(msg);
}

function clearError() {
  if (UI.err) UI.err.classList.add("hidden");
}

function setBackground(name) {
  State.bg = name || "";
  document.documentElement.setAttribute("data-bg", State.bg);
}

function setMusic(name) {
  // Placeholder: you can wire audio later
  State.music = name || "";
}

function renderNode(node) {
  clearError();

  // Clear choices unless the node is a choice
  if (node.type !== "choice") UI.choices.classList.add("hidden");

  if (node.type === "bg") {
    setBackground(node.value);
    return next(true);
  }

  if (node.type === "music") {
    setMusic(node.value);
    return next(true);
  }

  if (node.type === "label") {
    // Labels are markers; skip display
    return next(true);
  }

  if (node.type === "jump") {
    go(node.goto);
    return;
  }

  if (node.type === "narr") {
    UI.text.textContent = node.text || "";
    return;
  }

  if (node.type === "choice") {
    UI.text.textContent = node.prompt || "";
    UI.choices.innerHTML = "";
    UI.choices.classList.remove("hidden");

    (node.options || []).forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "choiceBtn";
      btn.textContent = opt.text || "…";
      btn.onclick = () => {
        try { if (typeof opt.effect === "function") opt.effect(); }
        catch (e) { showError(e.message); return; }
        go(opt.goto);
      };
      UI.choices.appendChild(btn);
    });

    return;
  }

  if (node.type === "end") {
    UI.text.textContent = `${node.title || "The End"}\n\n${node.body || ""}`.trim();
    UI.choices.classList.add("hidden");
    return;
  }

  showError(`Unknown node type: ${node.type}`);
}

function findLabelIndex(labelId) {
  const idx = Story.findIndex(n => n.type === "label" && n.id === labelId);
  return idx;
}

function go(labelId) {
  const idx = findLabelIndex(labelId);
  if (idx === -1) {
    showError(`Label not found: ${labelId}`);
    return;
  }
  State.history.push(State.i);
  State.i = idx + 1; // move to the node after label
  step();
}

function step() {
  if (!Array.isArray(Story) || Story.length === 0) {
    showError("Story is empty. Check story.js is loading and sets Story.");
    return;
  }
  if (State.i < 0) State.i = 0;
  if (State.i >= Story.length) State.i = Story.length - 1;

  const node = Story[State.i];
  renderNode(node);
}

function next(skipHistory = false) {
  // If current node is choice, do not advance automatically
  const node = Story[State.i];
  if (node && node.type === "choice") return;

  if (!skipHistory) State.history.push(State.i);
  State.i += 1;

  // Skip over labels/bg/music automatically
  while (State.i < Story.length) {
    const t = Story[State.i]?.type;
    if (t === "label" || t === "bg" || t === "music") {
      // renderNode will call next(true) for bg/music/label
      break;
    }
    break;
  }

  if (State.i >= Story.length) State.i = Story.length - 1;
  step();
}

function back() {
  if (State.history.length === 0) return;
  State.i = State.history.pop();
  step();
}

function saveGame() {
  const data = {
    i: State.i,
    history: State.history,
    vars: State.vars,
    bg: State.bg,
    music: State.music,
    t: Date.now()
  };
  localStorage.setItem("worlds_ends_save", JSON.stringify(data));
  showToast("Saved.");
}

function loadGame() {
  const raw = localStorage.getItem("worlds_ends_save");
  if (!raw) return showToast("No save found.");
  try {
    const data = JSON.parse(raw);
    State.i = data.i ?? 0;
    State.history = Array.isArray(data.history) ? data.history : [];
    State.vars = data.vars || State.vars;
    setBackground(data.bg || "");
    setMusic(data.music || "");
    step();
    showToast("Loaded.");
  } catch (e) {
    showError("Save corrupted.");
  }
}

window.addEventListener("error", (e) => {
  showError(e.message || "Unknown error");
});

window.addEventListener("load", () => {
  try {
    if (!bindUI()) return;
    // start at label "ch1_start" if present, else at 0
    const startIdx = findLabelIndex("ch1_start");
    if (startIdx !== -1) State.i = startIdx + 1;
    step();
  } catch (e) {
    showError(e.message);
  }
});
