import { CITY_DISTRICTS } from "./districts.mjs";
import {
  STRATEGIES,
  facilityContract,
  testFacility,
  applyFacility,
  sanitizeOperations,
} from "./facility-operations.mjs";

export function mountFacilityDesk({
  read,
  write,
  prepare,
  reveal,
  saveStatus,
  onSettings,
  onCue,
  onNote,
  onDistrict = () => {},
}) {
  const $ = (id) => document.getElementById(id),
    dialog = $("facility-desk");
  let active = "workshop",
    plan = { strategy: "balanced", units: [0, 0, 0] },
    tested = false,
    round = 0,
    returnFocus = null;
  function settings() {
    const value = sanitizeOperations(read().operations).settings;
    for (const key of ["difficulty", "text", "contrast", "quality"])
      $("facility-" + key).value = value[key];
    onSettings(value);
  }
  function render() {
    const c = facilityContract(read(), active);
    round = c.round;
    tested = false;
    $("facility-title").textContent = c.name + " · Service workshop";
    $("facility-story").textContent =
      `${c.speaker}: “${c.reaction} ${c.story} ${c.brief} Can your team cover ${c.demand} requests and keep the service ready for tomorrow?”`;
    $("facility-conditions").textContent =
      `Round ${c.round + 1} · ${c.eventName} · ${c.budget} work units · Capacity ${c.capacity} · Maintenance minimum ${c.minimumMaintenance}. Each crew unit handles 2 requests; each energy unit supports 3. The lower total limits output.`;
    $("facility-progress").textContent =
      `Completed service rounds: ${c.completed} · Best outcome: ${c.best === null ? "not tested" : c.best + "/100"}`;
    $("facility-dependencies").replaceChildren();
    for (const d of c.dependencies) {
      const li = document.createElement("li");
      li.textContent = `${d.name}: ${d.built ? d.service + "/100 foundation service" : "not established yet"}`;
      $("facility-dependencies").append(li);
    }
    $("facility-hint").hidden = c.difficulty !== "guided";
    $("facility-hint").textContent =
      "Staff can handle two requests per unit; energy supports three. The lower capacity is the bottleneck. Set maintenance before spending the remaining budget. Try different strategies and compare the preview.";
    const strategies = $("facility-strategies");
    strategies.replaceChildren();
    for (const s of STRATEGIES) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = s.name + " · " + s.detail;
      button.setAttribute("aria-pressed", String(plan.strategy === s.id));
      button.onclick = () => {
        plan.strategy = s.id;
        invalidate();
        for (const b of strategies.children)
          b.setAttribute("aria-pressed", String(b === button));
      };
      strategies.append(button);
    }
    $("facility-units").replaceChildren();
    ["Service crew", "Energy support", "Maintenance"].forEach((name, i) => {
      const label = document.createElement("label"),
        input = document.createElement("input"),
        output = document.createElement("output");
      input.type = "range";
      input.min = "0";
      input.max = "12";
      input.step = "1";
      input.value = String(plan.units[i]);
      input.setAttribute("aria-label", name);
      output.textContent = String(plan.units[i]);
      label.append(document.createTextNode(name + " "), output, input);
      input.oninput = () => {
        plan.units[i] = Number(input.value);
        output.textContent = input.value;
        invalidate();
      };
      $("facility-units").append(label);
    });
    $("facility-test").disabled = !c.unlocked;
    $("facility-apply").disabled = true;
    $("facility-result").textContent = c.unlocked
      ? "Test a plan to see its consequences before applying it."
      : "Establish this district through your city journey first. You can still inspect its dependencies.";
    $("facility-save-status").textContent = saveStatus();
    updateBudget();
  }
  function restorePlan() {
    const value = sanitizeOperations(read().operations),
      draft = value.drafts[active];
    plan = draft
      ? { strategy: draft.strategy, units: [...draft.units] }
      : { strategy: "balanced", units: [0, 0, 0] };
  }
  function updateBudget() {
    const c = facilityContract(read(), active);
    const used = plan.units.reduce((n, v) => n + v, 0);
    $("facility-budget").textContent =
      `Used ${used}/${c.budget} · Unassigned reserve ${c.budget - used}`;
  }
  function invalidate() {
    const value = sanitizeOperations(read().operations);
    value.drafts[active] = {
      round,
      strategy: plan.strategy,
      units: [...plan.units],
    };
    write(value);
    tested = false;
    $("facility-apply").disabled = true;
    $("facility-result").textContent =
      "Plan changed. Test again before applying.";
    updateBudget();
  }
  function open(id = "workshop") {
    if (!CITY_DISTRICTS.some((d) => d.id === id)) return;
    prepare();
    active = id;
    onDistrict(active);
    returnFocus = document.activeElement;
    const districts = $("facility-district");
    districts.replaceChildren();
    for (const d of CITY_DISTRICTS) {
      const o = document.createElement("option");
      o.value = d.id;
      o.textContent = d.emoji + " " + d.name;
      districts.append(o);
    }
    districts.value = id;
    settings();
    restorePlan();
    render();
    if (!dialog.open) dialog.showModal();
    $("facility-district").focus();
  }
  $("facility-district").onchange = (e) => {
    active = e.target.value;
    onDistrict(active);
    restorePlan();
    render();
  };
  for (const key of ["difficulty", "text", "contrast", "quality"])
    $("facility-" + key).onchange = (e) => {
      const value = sanitizeOperations(read().operations);
      value.settings[key] = e.target.value;
      write(value);
      settings();
      render();
    };
  $("facility-test").onclick = () => {
    const result = testFacility(read(), active, plan);
    tested = result.ok;
    $("facility-result").textContent =
      (result.ok ? "Preview: " : "Try another approach: ") + result.message;
    $("facility-apply").disabled = !result.ok;
    onCue(result.ok ? "decision" : "revise");
    onNote("service_test");
  };
  $("facility-apply").onclick = () => {
    if (!tested) return;
    const value = applyFacility(read(), active, plan, round);
    if (!value) {
      invalidate();
      $("facility-result").textContent =
        "The city changed. Test the current plan again.";
      return;
    }
    tested = false;
    $("facility-apply").disabled = true;
    write(value.operations);
    onNote("service_apply");
    dialog.close();
    reveal(active, value.result);
    onCue("repaired");
  };
  $("facility-close").onclick = () => dialog.close();
  $("facility-campaign").onclick = () => {
    dialog.close();
    document.getElementById("menu-resume").click();
  };
  dialog.addEventListener("close", () => {
    const target =
      returnFocus?.isConnected &&
      returnFocus.matches("button,a,input,select,summary") &&
      returnFocus.getClientRects().length &&
      !returnFocus.closest("[hidden]")
        ? returnFocus
        : document.querySelector("#city-menu summary");
    target?.focus({ preventScroll: true });
  });
  return { open, close: () => dialog.close(), settings };
}
