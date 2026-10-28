import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("public/games/city/index.html", "utf8");
const game = readFileSync("public/games/city/game.mjs", "utf8");
const css = readFileSync("public/games/shared/city-theme.css", "utf8");

for (const id of ["guide-toggle", "build-toggle", "test-status", "city-map"]) {
  assert(html.includes('id="' + id + '"'), "missing city control: " + id);
}
assert(game.includes("function updateGuideVisibility()"));
assert(game.includes("guideExpanded = false;"));
assert(game.includes("dockExpanded = false;"));
assert(game.includes('$("mission").hidden = !visible;'));
assert(game.includes('$("test-status").hidden = !simulating;'));
assert(game.includes("dockExpanded || simulating"));
assert(css.includes("body.city-testing #mission"));
assert(css.includes("body.city-testing #build-dock"));
assert(css.includes("body.city-testing #scene-labels"));
assert(css.includes("body.city-testing #city-tools"));
assert(game.includes("masonryCache"));
assert(game.includes("function building("));
assert(game.includes("function streetLight("));
assert(game.includes("function parkSeat("));
assert(game.includes("player.arms.forEach("));
assert(game.includes("createNavigator(obstacles, {"));
assert(game.includes("minX: -57.5"));
assert(html.includes('id="districts-toggle"'));
assert(html.includes('id="district-directory"'));
assert(html.includes('id="cases-toggle"'));
assert(html.includes('id="casebook"'));
assert(html.includes('id="save-practice"'));
assert(game.includes("function openCasebook()"));
assert(game.includes("function showCaseOutcome("));
assert(game.includes("const caseScenes = createCaseSceneEffects("));
assert(game.includes("function runCaseWorldAction("));
assert(game.includes("case-replay"));
assert(game.includes("function proceedAfterCase("));
assert(game.includes("function pauseJourney("));
assert(game.includes("function refreshJourneyControls()"));
assert(
  game.includes("recoverJourney({ ...journey, decisions: state.decisions })"),
);
assert(game.includes("const success = goTo(point, () => showCase(id)"));
assert(game.includes("if (!planned.points.length)"));
assert(game.includes('pauseJourney("The route is blocked.'));
assert(html.includes('id="journey-bar"'));
assert(html.includes('id="journey-toggle"'));
assert(html.includes('id="journey-back"'));
assert(html.includes('id="decision-count"'));
assert(game.includes('function beginDecisionReview(id, autoResume = false)'));
assert(game.includes('function showDecisionReviewOutcome(id, choiceId)'));
assert(game.includes('function finishDecisionReview({ resume = true } = {})'));
assert(game.includes('if (reviewCaseId !== caseId)'));
assert(game.includes('if (reviewCaseId === caseId) showDecisionReviewOutcome(caseId, choiceId)'));
assert(game.includes('const previous = previousKeptCase(state.decisions, journey.caseId)'));
assert(game.includes('beginDecisionReview(previous.id)'));
assert(game.includes('button.onclick = () => startCase(scenario.id)'));
assert(game.includes('button.onclick = () => startCase(button.dataset.localCase)'));
assert(game.includes('if (journey.status === "running") pauseJourney("Your place is saved.'));
assert(game.includes('$("city-tools").hidden = !entered || simulating;'));
assert(css.includes('body.city-journey #city-tools button'));
assert(css.includes('body.city-journey-paused #city-tools button'));
assert(css.includes('body.city-journey #city-tools[hidden]'));
assert(!css.includes('body.city-journey #city-tools,\nbody.city-journey #mission,'));

assert(css.includes("body.city-journey #city-tools"));
assert(css.includes("body.city-journey #travel"));
assert(
  game.includes(
    "state.decisions = saveDecision(state.decisions, caseId, choiceId)",
  ),
);
assert(game.includes("choicesForCase(id, answerOrderSeed)"));
assert(game.includes("const nextUnsolved = firstUnanswered(state.decisions)"));
assert(game.includes("resumeJourney();"));
assert(game.includes("function goToJourneyCase(id)"));
assert(game.includes("autoAdvanceTimer = setTimeout("));
assert(game.includes("goToJourneyCase(next.id)"));
assert(
  !game.includes('id="case-keep"'),
  "players must not need a separate keep click",
);
assert(css.includes(".auto-next-track"));
assert(html.includes('id="city-status-toggle"'));
assert(html.includes('id="city-status"'));
assert(game.includes("function renderCityStatus()"));
assert(game.includes("const city = deriveBuilderCity(state.decisions)"));
assert(css.includes(".city-status-district"));
assert(game.includes("decisionSparks.visible"));
assert(game.includes("previewDecision = null"));
assert(game.includes("caseScenes.setTone("));
assert(game.includes("button.onclick = () => runCaseWorldAction("));
assert(game.includes("caseScenes.animate(now, reduceMotion.matches)"));
assert(
  !game.includes("function drawRoute("),
  "navigation path lines must not render",
);
assert(!game.includes("routeLine"), "navigation trail must stay hidden");
assert(
  !game.includes("scene.add(routeLine)"),
  "route meshes must remain disabled",
);
assert(html.includes('id="world-feedback"'));
assert(css.includes("body.city-impact-view #detail"));
assert(css.includes("#world-feedback"));
assert(game.includes("function persistPractice()"));
assert(game.includes("saveEnabled = false"));
assert(css.includes("#casebook-list"));
assert(css.includes(".case-choice"));
assert(game.includes("createOuterDistricts("));
assert(game.includes("showFutureDistrict("));
assert(css.includes("#district-list"));
console.log(
  "PASS: living city scene, on-demand guide and construction, focused simulation and expanded navigation contracts.",
);
