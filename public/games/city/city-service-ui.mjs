// The compact live city-service desk: inspect, stress-test, repair and focus.
// No new currencies, network calls or sensitive data; all numbers are fictional.
import { CITY_BUILD_MILESTONES } from "./build-milestones.mjs";
import {
  serviceImpact,
  serviceFor,
  startServiceDrill,
} from "./city-service-system.mjs";
import { skillRecommendation } from "./build-progression.mjs";

export function mountCityServiceDesk({
  read,
  write,
  beforeOpen,
  onClose,
  onFocus,
  onBuild,
}) {
  const $ = (id) => document.getElementById(id);
  let selected = CITY_BUILD_MILESTONES[0].id;
  let statusMessage = "";
  const panel = $("service-panel");
  const selector = $("service-district");
  for (const milestone of CITY_BUILD_MILESTONES) {
    const option = document.createElement("option");
    option.value = milestone.id;
    option.textContent = milestone.title;
    selector.append(option);
  }
  function render() {
    const report = serviceImpact(read());
    const current = serviceFor(read(), selected);
    const next = skillRecommendation(read());
    selector.value = selected;
    $("service-summary").textContent =
      report.served +
      " of " +
      report.demand +
      " illustrative daily service requests currently met in your city.";
    $("service-skill").textContent =
      next.tier + " · Recommended next: " + next.recommendedTitle;
    $("service-needs").textContent =
      current.served + " / " + current.demand + " service requests met";
    $("service-meter").style.width =
      (100 * current.served) / current.demand + "%";
    $("service-meter").setAttribute("aria-valuenow", String(current.served));
    $("service-meter").setAttribute("aria-valuemax", String(current.demand));
    $("service-status").textContent = current.description;
    $("service-drill").hidden = !current.built || current.fault !== null;
    $("service-build").textContent =
      current.fault !== null
        ? "Repair the broken connection →"
        : current.built
          ? "Improve this network →"
          : "Build this missing service →";
    $("service-event").textContent = statusMessage;
    // Clear the contents and build safe DOM nodes; no user-supplied HTML.
    const list = $("service-list");
    list.replaceChildren();
    for (const entry of report.entries) {
      const line = document.createElement("li");
      line.className =
        entry.fault !== null
          ? "service-outage"
          : entry.built
            ? "service-ready"
            : "";
      line.textContent =
        (entry.fault !== null ? "⚠ " : entry.built ? "✓ " : "○ ") +
        entry.title +
        ": " +
        entry.served +
        "/" +
        entry.demand;
      list.append(line);
    }
  }
  function close() {
    const wasVisible = !panel.hidden;
    panel.hidden = true;
    if (wasVisible) onClose();
  }
  $("service-close").onclick = close;
  $("service-district").onchange = (event) => {
    selected = event.target.value;
    statusMessage = "";
    onFocus(selected);
    render();
  };
  $("service-focus").onclick = () => {
    onFocus(selected);
    statusMessage = "Looking at this service in your 3D city.";
    render();
  };
  $("service-build").onclick = () => {
    const id = selected;
    close();
    onBuild(id);
  };
  $("service-drill").onclick = () => {
    const outcome = startServiceDrill(read(), selected);
    if (outcome.status === "damaged") {
      write(outcome.lab);
      statusMessage =
        "Outage drill: " +
        (outcome.after.unmet - outcome.before.unmet) +
        " more fictional service requests are now unmet. The built station turns amber. Open its worksite and tap the damaged connection to repair it.";
    } else if (outcome.status === "protected") {
      statusMessage =
        "Excellent resilience! Your network survived a broken link. The planned services continue operating.";
    } else if (outcome.status === "already-damaged") {
      statusMessage =
        "This station already has a broken connection. Repair it first.";
    } else {
      statusMessage =
        "Build and test the station before running an outage drill.";
    }
    onFocus(selected);
    render();
  };
  return {
    open(id = null) {
      if (id && CITY_BUILD_MILESTONES.some((m) => m.id === id)) selected = id;
      statusMessage = "";
      beforeOpen();
      panel.hidden = false;
      render();
      selector.focus();
    },
    close,
    render() {
      if (!panel.hidden) render();
    },
    get isOpen() {
      return !panel.hidden;
    },
  };
}
