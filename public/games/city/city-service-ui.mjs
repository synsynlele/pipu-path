// The compact live city-service desk: inspect, stress-test, repair and focus.
// No new currencies, network calls or sensitive data; all numbers are fictional.
import { CITY_BUILD_MILESTONES } from "./build-milestones.mjs";
import {
  serviceImpact,
  serviceFor,
  startServiceDrill,
} from "./city-service-system.mjs";
import { skillRecommendation } from "./build-progression.mjs";
import {
  STAGE_THREE_CHOICES,
  stageThreeCase,
  stageThreeAvailable,
  sanitizeStageThree,
} from "./stage-three-scenarios.mjs";

export function mountCityServiceDesk({
  read,
  write,
  beforeOpen,
  onClose,
  onFocus,
  onBuild,
  readStageThree = () => ({ decisions: {}, lab: null, stage: null }),
  onStageThreeStart = () => ({ status: "locked" }),
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
    // Stage 3 lives in this same compact panel; it cannot create a new
    // challenge until the entire decision + certified-build journey is done.
    const journey = readStageThree();
    const unlocked = stageThreeAvailable(journey.decisions, journey.lab);
    const studio = $("stage-three");
    studio.hidden = !unlocked;
    if (unlocked) {
      const stage = sanitizeStageThree(journey.stage, journey.lab);
      const story = stageThreeCase(stage.round);
      $("stage-three-counter").textContent =
        "Challenge " + story.number + " · Cycle " + story.cycle;
      $("stage-three-title").textContent = story.title;
      $("stage-three-problem").textContent = story.situation;
      $("stage-three-question").textContent = stage.active
        ? "Your plan is chosen. Now restore the actual network."
        : story.question;
      const choices = $("stage-three-choices");
      choices.replaceChildren();
      const repair = $("stage-three-repair");
      const notice = $("stage-three-status");
      if (stage.active) {
        const choice = STAGE_THREE_CHOICES.find(
          (item) => item.id === stage.active.choiceId,
        );
        const location = serviceFor(journey.lab, story.missionId);
        const exposure =
          Math.max(0, location.unmet) * choice.assumedPeriods;
        notice.textContent =
          choice.response + " " +
          location.unmet + " of " + location.demand +
          " fictional local requests are currently unmet. " +
          "Illustrative response exposure: " + exposure +
          " unmet request-periods. The orange connector must be repaired and tested.";
        repair.hidden = false;
        repair.textContent = "Repair and test this same challenge →";
      } else {
        notice.textContent =
          "Choose a response. Then the game will identify a real weak " +
          "connection in your built service for you to diagnose and repair.";
        repair.hidden = true;
        for (const choice of STAGE_THREE_CHOICES) {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = choice.label;
          button.setAttribute("aria-label", choice.label);
          button.onclick = () => {
            const outcome = onStageThreeStart(choice.id);
            if (outcome.status === "repair-required") {
              selected = outcome.scenario.missionId;
              statusMessage =
                "You chose a response. The " + outcome.scenario.title +
                " disruption is now visible in your city.";
              onFocus(selected);
            } else if (outcome.status === "already-resilient") {
              statusMessage =
                "Your tested network survived the planned break. " +
                "This is a verified resilient design.";
            } else if (outcome.status === "repair-existing") {
              statusMessage =
                "Finish the unfinished district repair before this challenge can begin.";
            } else {
              statusMessage =
                "Continue the main city journey before starting new challenges.";
            }
            render();
          };
          choices.append(button);
        }
      }
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
  $("stage-three-repair").onclick = () => {
    const journey = readStageThree();
    const stage = sanitizeStageThree(journey.stage, journey.lab);
    if (!stage.active) return;
    const id = stageThreeCase(stage.round).missionId;
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
