// Test the actual visual controls for every distinct Chapters 5–12
// activity. No private challenge-state writes or fake deployments.
import assert from "node:assert/strict";

export const ADVANCED_SOLUTIONS = [
  [1, 0, 1, 0, 0],
  [1, 2, 3, 0],
  [1, 4],
  [0, 1, 2, 3],
  [0, 1, 2],
  [5, 3, 3],
  [1, 1, 1, 0, 0, 0],
  [4, 5],
  [0, 1, 2, 0, 1],
  [2, 3, 2, 1],
  [1, 1, 1, 0, 0, 0],
  [1, 0, 2],
  [0, 1, 2],
  [0, 1, 2],
  [5, 4, 5],
  [1, 1, 1, 0, 1, 0, 0, 0],
];

export function readAdvancedPlan(document, mission) {
  const cards = [
    ...document.querySelectorAll("#advanced-controls .challenge-card"),
  ];
  if (["evidence", "access", "portfolio", "capstone"].includes(mission.kind))
    return [
      ...document.querySelectorAll(
        "#advanced-controls > button.challenge-choice",
      ),
    ].map((button) => Number(button.getAttribute("aria-pressed") === "true"));
  if (mission.kind === "sequence")
    return cards.map((card) =>
      mission.labels.indexOf(
        card.querySelector("strong").textContent.replace(/^\d+\.\s*/, ""),
      ),
    );
  if (["site", "zoning"].includes(mission.kind)) {
    const plots = [
      ...document.querySelectorAll(
        "#advanced-controls .challenge-town-map button",
      ),
    ];
    return mission.roles.map((role) =>
      plots.findIndex(
        (button) =>
          button.getAttribute("aria-pressed") === "true" &&
          button.textContent.includes(" · " + role),
      ),
    );
  }
  if (["schedule", "sorting", "crews"].includes(mission.kind))
    return cards.map((card) => Number(card.querySelector("select").value));
  if (["scenario", "negotiation", "risk"].includes(mission.kind))
    return cards.map((card) =>
      [...card.querySelectorAll(".challenge-options button")].findIndex(
        (button) => button.getAttribute("aria-pressed") === "true",
      ),
    );
  if (["inventory", "energy", "forecast"].includes(mission.kind))
    return cards.map((card) =>
      Number(card.querySelector('input[type="range"]').value),
    );
  throw new Error("Missing DOM read contract for " + mission.kind);
}

export function applyAdvancedPlan(w, game, mission, plan) {
  const document = w.document;
  const rows = () => [
    ...document.querySelectorAll("#advanced-controls .challenge-card"),
  ];
  if (["evidence", "access", "portfolio", "capstone"].includes(mission.kind)) {
    for (let i = 0; i < plan.length; i++)
      if (plan[i] === 1)
        [
          ...document.querySelectorAll(
            "#advanced-controls > button.challenge-choice",
          ),
        ][i].click();
  } else if (mission.kind === "sequence") {
    for (let index = 0; index < plan.length; index++) {
      let order = [...game.state.advanced.cursor.plan];
      while (order[index] !== plan[index]) {
        const position = order.indexOf(plan[index]);
        rows()[position].querySelector(".challenge-inline button").click();
        order = [...game.state.advanced.cursor.plan];
      }
    }
  } else if (["site", "zoning"].includes(mission.kind)) {
    for (let i = 0; i < plan.length; i++)
      document
        .querySelectorAll("#advanced-controls .challenge-town-map button")
        [plan[i]].click();
  } else if (["schedule", "sorting", "crews"].includes(mission.kind)) {
    for (let i = 0; i < plan.length; i++) {
      const input = rows()[i].querySelector("select");
      input.value = String(plan[i]);
      input.dispatchEvent(new w.Event("change", { bubbles: true }));
    }
  } else if (["scenario", "negotiation", "risk"].includes(mission.kind)) {
    for (let i = 0; i < plan.length; i++)
      rows()[i].querySelectorAll(".challenge-options button")[plan[i]].click();
  } else if (["inventory", "energy", "forecast"].includes(mission.kind)) {
    for (let i = 0; i < plan.length; i++) {
      const input = rows()[i].querySelector('input[type="range"]');
      input.value = String(plan[i]);
      input.dispatchEvent(new w.Event("input", { bubbles: true }));
    }
  }
  assert.deepEqual(
    game.state.advanced.cursor.plan,
    plan,
    "The UI must persist the exact plan entered by the player",
  );
  assert.deepEqual(
    readAdvancedPlan(document, mission),
    plan,
    "Visible controls must match the saved plan",
  );
}
