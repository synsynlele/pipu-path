// Optional, self-contained practice within the existing 3D city.
// Never writes campaign state, credits, XP, account data or real-world proof.
const AGE_BANDS = ["under_13", "13_15", "16_17", "18_24", "25_plus"];
const CATALOG_VERSION = "candidate-2026-11";

export function allowedFinancialScenario(scenario, ageBand) {
  const current = AGE_BANDS.indexOf(ageBand);
  const minimum = AGE_BANDS.indexOf(scenario?.minimumAgeBand);
  return current >= 0 && minimum >= 0 && current >= minimum;
}

export function evaluateFinancialCityChoice(scenario, choiceId) {
  if (!scenario || typeof choiceId !== "string") return null;
  const choice = scenario.choices?.find((item) => item.id === choiceId);
  if (
    !choice ||
    !Number.isSafeInteger(scenario.availableNaira) ||
    !Number.isSafeInteger(choice.cost) ||
    choice.cost < 0
  )
    return null;
  const remaining = scenario.availableNaira - choice.cost;
  return {
    remaining,
    shortfall: Math.max(0, -remaining),
    consequence: choice.consequence,
    tradeOff: choice.tradeOff,
  };
}

export function mountFinancialCityPractice({
  root,
  onBeforeOpen = () => {},
  onClose = () => {},
  onRealQuest = () => {},
}) {
  const byId = (id) => root.querySelector("#" + id);
  const money = (value) => "₦" + new Intl.NumberFormat("en-NG").format(value);
  let ageBand = "under_13"; // Public game and unknown profiles get the youngest-safe set.
  let scenarios = [];
  let selectedCode = "";
  let choiceId = null;
  let loading = null;

  function eligible() {
    return scenarios.filter((item) => allowedFinancialScenario(item, ageBand));
  }

  function renderResult() {
    const current = eligible().find((item) => item.code === selectedCode);
    const result = evaluateFinancialCityChoice(current, choiceId);
    const output = byId("finance-result");
    output.replaceChildren();
    output.hidden = !result;
    if (!result) return;
    const heading = document.createElement("strong");
    heading.textContent =
      result.shortfall > 0
        ? "Shortfall: " + money(result.shortfall)
        : "Remaining: " + money(result.remaining);
    const consequence = document.createElement("p");
    consequence.textContent = result.consequence;
    const tradeOff = document.createElement("p");
    tradeOff.textContent = result.tradeOff;
    const disclaimer = document.createElement("small");
    disclaimer.textContent =
      "Fictional decision only. No city credits or verified real-world progress were earned.";
    output.append(heading, consequence, tradeOff, disclaimer);
  }

  function render() {
    const available = eligible();
    byId("finance-retry").hidden = true;
    if (!available.some((item) => item.code === selectedCode)) {
      selectedCode = available[0]?.code ?? "";
    }
    const selector = byId("finance-stage");
    selector.replaceChildren();
    for (const scenario of available) {
      const option = document.createElement("option");
      option.value = scenario.code;
      option.textContent = scenario.title;
      selector.append(option);
    }
    selector.value = selectedCode;
    const current = available.find((item) => item.code === selectedCode);
    byId("finance-content").hidden = !current;
    if (!current) {
      byId("finance-message").textContent =
        "Financial practice is not available for this age group.";
      return;
    }
    byId("finance-message").textContent =
      "Optional city practice · " +
      available.length +
      " age-appropriate topics · no payments";
    byId("finance-district").textContent =
      current.district.replaceAll("-", " ") + " district";
    byId("finance-story").textContent = current.scenario;
    byId("finance-budget").textContent =
      "Fictional resources: " + money(current.availableNaira);
    const options = byId("finance-choices");
    options.replaceChildren();
    for (const choice of current.choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "finance-option";
      button.textContent = choice.label;
      button.setAttribute("aria-pressed", String(choice.id === choiceId));
      button.addEventListener("click", () => {
        choiceId = choice.id;
        for (const other of options.querySelectorAll("button")) {
          other.setAttribute("aria-pressed", String(other === button));
        }
        renderResult();
      });
      options.append(button);
    }
    renderResult();
  }

  async function loadCatalog() {
    if (scenarios.length) return;
    if (!loading) {
      loading = fetch(new URL("./finance-scenarios.json", import.meta.url), {
        cache: "force-cache",
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("FINANCE_CATALOG_OFFLINE");
          const data = await response.json();
          if (
            data?.version !== CATALOG_VERSION ||
            !Array.isArray(data.scenarios) ||
            data.scenarios.length !== 9 ||
            data.scenarios.some(
              (scenario) =>
                typeof scenario.code !== "string" ||
                typeof scenario.scenario !== "string" ||
                !Array.isArray(scenario.choices) ||
                scenario.choices.length < 2,
            )
          )
            throw new Error("FINANCE_CATALOG_INVALID");
          scenarios = data.scenarios;
        })
        .finally(() => {
          loading = null;
        });
    }
    return loading;
  }

  async function open() {
    onBeforeOpen();
    if (!root.open) root.showModal();
    byId("finance-content").hidden = true;
    byId("finance-retry").hidden = true;
    byId("finance-message").textContent = "Opening financial decisions…";
    try {
      await loadCatalog();
      if (root.open) render();
    } catch {
      if (root.open) {
        byId("finance-message").textContent =
          "This optional practice could not load. Your city and saved progress are safe. Check your connection and try again.";
        byId("finance-content").hidden = true;
        byId("finance-retry").hidden = false;
      }
    }
  }

  byId("finance-close").addEventListener("click", () => root.close());
  byId("finance-stage").addEventListener("change", (event) => {
    const value = event.target.value;
    if (!eligible().some((item) => item.code === value)) return;
    selectedCode = value;
    choiceId = null;
    render();
  });
  byId("finance-retry").addEventListener("click", open);
  byId("finance-real-quest").addEventListener("click", () => {
    if (eligible().some((item) => item.code === selectedCode))
      onRealQuest(selectedCode);
  });
  root.addEventListener("close", onClose);
  return {
    open,
    setAgeBand(value) {
      ageBand = AGE_BANDS.includes(value) ? value : "under_13";
      choiceId = null;
      if (root.open && scenarios.length) render();
    },
    close: () => {
      if (root.open) root.close();
    },
  };
}
