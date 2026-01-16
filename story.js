// WORLD END(S) — story.js (SMOKE TEST)
// If this shows text in the app, your engine + index are fine.

const Story = [
  { type: "label", id: "start" },
  { type: "bg", value: "gradient" },
  { type: "music", value: "" },

  { type: "narr", text: `WORLD END(S)

If you can read this, story.js is loading correctly.` },

  { type: "choice",
    prompt: "Pick one:",
    options: [
      {
        text: "Option A (Truth +1)",
        effect: () => { State.vars.truth = (State.vars.truth || 0) + 1; },
        goto: "after_choice"
      },
      {
        text: "Option B (Hope +1)",
        effect: () => { State.vars.hope = (State.vars.hope || 0) + 1; },
        goto: "after_choice"
      }
    ]
  },

  { type: "label", id: "after_choice" },
  { type: "narr", text: `Nice — choices work too.

Truth: ${State.vars.truth || 0}
Hope: ${State.vars.hope || 0}` },
];