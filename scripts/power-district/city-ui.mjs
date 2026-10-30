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
assert(game.includes("createFrameBudget"));
assert(game.includes("frameBudget.takeFrame(now, document.hidden)"));
assert(game.includes("function animateWorld(now)"));
assert(game.includes('addEventListener("webglcontextlost"'));
assert(game.includes('addEventListener("webglcontextrestored"'));
assert(game.includes("caseScenes.setFocus(focus, overview)"));
assert(game.includes("livingScene.setFocus(focus, overview)"));
assert(html.includes('id="graphics-recovery"'));
assert(html.includes('id="city-hud"'));
assert(html.includes('id="chapter-badge"'));
assert(html.includes('id="fund-dialog"'));
assert(html.indexOf('id="city-tools"') < html.indexOf('id="journey-bar"'));
assert(html.indexOf('id="city-menu"') > html.indexOf('id="chapter-badge"'));
assert(game.includes('"city-hud").hidden = !entered || simulating'));
assert(game.includes('"fund-dialog").showModal()'));
assert(css.includes("body.city-journey #journey-bar"));
assert(css.includes("#city-hud .top-actions .icon"));
assert(html.includes('id="graphics-recover"'));
assert(css.includes("#graphics-recovery"));
assert(game.includes("frameBudget.noteRenderTime"));
assert(game.includes("boxGeometries"));
assert(game.includes("cylinderGeometries"));
assert(game.includes("minX: -57.5"));
assert(html.includes('id="districts-toggle"'));
assert(html.includes('id="district-directory"'));
assert(html.includes('id="cases-toggle"'));
assert(html.includes('id="casebook"'));
assert(html.includes('id="save-practice"'));
assert(game.includes("function openCasebook()"));
assert(game.includes("function showCaseOutcome("));
assert(game.includes("const caseScenes = createCaseSceneEffects("));
assert(game.includes("const livingScene = createLivingCityScene("));
assert(
  game.includes("resilienceCityActivity(state.economy, state.resilience)"),
);
assert(game.includes("livingScene.animate("));
assert(game.includes("...futureNeighbours].map"));
assert(game.includes("lowPower:"));
assert(game.includes("innerWidth <= 650"));
assert(
  game.includes("resilienceCityActivity(state.economy, state.resilience)"),
);
assert(game.includes("living.deliveries.length"));

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
assert(html.includes('id="view-city-toggle"'));
assert(html.includes('id="city-view"'));
assert(html.includes('id="opportunities-toggle"'));
assert(html.includes('id="opportunities-panel"'));
assert(html.includes('id="lab-progress"'));
assert(html.includes('id="pilot-mission"'));
assert(html.includes('id="build-victory"'));
assert(html.includes('id="service-toggle"'));
assert(html.includes('id="service-panel"'));
assert(html.includes('id="service-build"'));
assert(html.includes('id="service-drill"'));
assert(html.includes('id="lab-recommendation"'));
assert(html.includes('id="victory-continue"'));
assert(html.includes('id="victory-build"'));
assert(html.includes('id="resume-city"'));
assert(html.includes('id="lab-see-city"'));
assert(game.includes("integratedStep(state.decisions, state.lab)"));
assert(html.includes('id="playtest-summary"'));
assert(game.includes("playtest.note("));
assert(!game.includes('id="case-worksite"'));
assert(game.includes("mountCityServiceDesk"));
assert(game.includes("serviceFor"));
assert(game.includes("buildLab.open(step.missionId)"));
assert(html.includes('id="opportunities-policies"'));
assert(html.includes('id="opportunities-run"'));
assert(html.includes('id="opportunities-requests"'));
assert(html.includes('id="request-inspection"'));
assert(html.includes('id="request-inspection-back"'));
assert(game.includes("function visitCityRequest(id)"));
assert(game.includes("visit.onclick = () => visitCityRequest(request.id)"));
assert(game.includes("if (!goTo(destination, arrival, request.title))"));
assert(game.includes("focusBuiltCityDistrict(request.district)"));
assert(css.includes(".request-visit"));
assert(css.includes("#request-inspection"));
assert(html.includes('id="opportunities-business"'));
assert(html.includes('id="opportunities-actions"'));
assert(html.includes('id="opportunities-view-business"'));
assert(html.includes('id="resilience-mission"'));
assert(html.includes('id="resilience-preview"'));
assert(html.includes('id="resilience-commit"'));
assert(html.includes('id="resilience-verdict"'));
assert(game.includes("function renderResiliencePanel()"));
assert(game.includes("previewResiliencePlan(state.resilience, priority.id)"));
assert(game.includes('$("resilience-commit").onclick'));
assert(game.includes("resilienceDraftPriority = priority.id"));
assert(game.includes("const next = chooseResilience(state.resilience, plan)"));
assert(game.includes("state.resilience = next;"));
assert(css.includes("#resilience-choices .resilience-selected"));
assert(css.includes("#resilience-preview"));
assert(css.includes("#resilience-commit[hidden]"));
assert(game.includes("if (resilienceDraftRound !== report.round)"));
assert(game.includes("clearResilienceDraft();"));

assert(
  game.includes("chooseOwnedEnterprise(state.economy, event.target.value)"),
);
assert(game.includes("chooseEnterpriseAction(state.economy, action.id)"));
assert(game.includes("focusBuiltCityDistrict(business.district)"));
assert(css.includes(".opportunity-business"));
assert(html.includes('id="opportunities-reset"'));
assert(game.includes("function renderOpportunityPanel()"));
assert(game.includes("function openOpportunityPanel()"));
assert(game.includes("function closeOpportunityPanel()"));
assert(game.includes("runOpportunityDay(state.decisions, state.economy)"));
assert(game.includes("selectOpportunityPolicy(state.economy, policy.id)"));
assert(game.includes("foundationForOpportunities(state.decisions)"));
assert(game.includes("Start Chapter 3 — Opportunities"));
assert(
  game.includes("resilienceCityActivity(state.economy, state.resilience)"),
);
assert(css.includes("#opportunities-panel"));
assert(css.includes(".opportunity-policy"));
assert(html.includes('id="city-view-return"'));
assert(html.includes('id="city-view-problems"'));
assert(game.includes("createConsequenceScene({ T, scene, box, cyl })"));
assert(
  game.includes("consequenceScene.sync(state.decisions, previewDecision)"),
);
assert(game.includes("consequenceScene.setFocus(focus, overview)"));
assert(game.includes("function reviseCityProblem(caseId)"));
assert(game.includes("closeBuiltCityView({ resume: false })"));
assert(css.includes("#city-view-problems .city-view-repair"));
assert(html.includes('id="city-view-overview"'));
assert(html.includes('id="city-view-district"'));
assert(html.includes('id="city-view-zoom-in"'));
assert(html.includes('id="city-view-zoom-out"'));
assert(game.includes("function openBuiltCityView()"));
assert(game.includes("function closeBuiltCityView({ resume = true } = {})"));
assert(game.includes('const wasRunning = journey.status === "running"'));
assert(game.includes("if (wasRunning)"));
assert(game.includes("if (resume && snapshot.wasRunning) resumeJourney()"));
assert(game.includes('detailVisible: !$("detail").hidden'));
assert(game.includes("if (builtCityView?.focus)"));
assert(game.includes("!builtCityView &&"));
assert(game.includes("camera.fov = snapshot.fov"));
assert(game.includes("scene.fog.far = snapshot.fogFar"));

assert(css.includes("body.city-viewing #detail"));
assert(css.includes("body.city-viewing #city-tools"));
assert(css.includes("#city-view-return"));
assert(css.includes("#city-view-district"));

assert(html.includes('id="journey-toggle"'));
assert(html.includes('id="journey-back"'));
// Chapter, City menu, pause/resume and sound now share one compact HUD row.
const hudStart = html.indexOf('id="city-hud"');
const controlsStart = html.indexOf('class="city-hud-navigation"', hudStart);
const menuPos = html.indexOf('id="city-tools"', controlsStart);
const journeyPos = html.indexOf('id="journey-bar"', menuPos);
const soundPos = html.indexOf('class="top-actions"', journeyPos);
const hudEnd = html.indexOf('id="weather"', hudStart);
assert(
  hudStart >= 0 &&
    controlsStart > hudStart &&
    menuPos > controlsStart &&
    journeyPos > menuPos &&
    soundPos > journeyPos &&
    hudEnd > soundPos,
  "Chapter, City menu, journey and sound must share the same HUD row",
);
assert(
  html.indexOf('id="journey-back"') < html.indexOf('id="cases-toggle"'),
  "Last decision must be available inside the City menu",
);
assert(
  !html.slice(soundPos, hudEnd).includes('id="journey-bar"'),
  "Do not create a second full-width journey panel",
);
assert(css.includes("body.city-journey #city-hud #journey-bar"));
assert(css.includes("#city-hud #journey-status"));
assert(css.includes("#city-hud .top-actions"));
assert(game.includes('"journey-back").hidden = !visible || !previous'));
assert(game.includes('running ? "Pause" : "Resume"'));
assert(html.includes('id="decision-count"'));
assert(game.includes("function beginDecisionReview(id, autoResume = false)"));
assert(game.includes("function showDecisionReviewOutcome(id, choiceId)"));
assert(game.includes("function finishDecisionReview({ resume = true } = {})"));
assert(game.includes("if (reviewCaseId !== caseId)"));
assert(
  game.includes(
    "if (reviewCaseId === caseId) showDecisionReviewOutcome(caseId, choiceId)",
  ),
);
assert(
  game.includes(
    "const previous = previousKeptCase(state.decisions, journey.caseId)",
  ),
);
assert(game.includes("beginDecisionReview(previous.id)"));
assert(game.includes("button.onclick = () => startCase(scenario.id)"));
assert(
  game.includes("button.onclick = () => startCase(button.dataset.localCase)"),
);
assert(
  game.includes(
    'if (journey.status === "running") pauseJourney("Your place is saved.',
  ),
);
assert(game.includes('$("city-tools").hidden = !entered || simulating;'));
assert(css.includes("body.city-journey #city-tools button"));
assert(css.includes("body.city-journey-paused #city-tools button"));
assert(css.includes("body.city-journey #city-tools[hidden]"));
assert(
  !css.includes("body.city-journey #city-tools,\nbody.city-journey #mission,"),
);

assert(css.includes("body.city-journey #city-tools"));
assert(css.includes("body.city-journey #travel"));
assert(
  game.includes(
    "state.decisions = saveDecision(state.decisions, caseId, choiceId)",
  ),
);
assert(game.includes("choicesForCase(id, answerOrderSeed)"));
assert(game.includes("const nextStep = integratedStep(state.decisions, state.lab)"));
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
assert(game.includes('function showDetail(html, mode = "other")'));
assert(game.includes("panel.dataset.mode = mode"));
assert(game.includes("panel.scrollTop = 0"));
assert(game.includes("shortSituation"));
assert(game.includes('<details class="case-story">'));
assert(game.includes("More about this problem"));
assert(game.includes('"choice",'));
assert(game.includes('"outcome",'));
assert(css.includes('#detail[data-mode="choice"]'));
assert(css.includes('#detail[data-mode="outcome"]'));
assert(css.includes("max-height: min(46dvh, 355px)"));
assert(css.includes("min-height: 44px"));
assert(css.includes("overscroll-behavior: contain"));

assert(game.includes("createOuterDistricts("));
assert(game.includes("if (district && OUTER_DISTRICTS.some("));
assert(game.includes("function showChapterTransition()"));
assert(game.includes("isChapterTransition(id)"));
assert(game.includes("nextPlayableAfter(id, state.decisions)"));
assert(game.includes("chapterPressure(scenario"));
assert(html.includes("36 builder problems"));
assert(game.includes("journeyTravelTimer"));
assert(css.includes("#district-list"));
console.log(
  "PASS: living city scene, on-demand guide and construction, focused simulation and expanded navigation contracts.",
);
