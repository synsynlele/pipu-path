import {
  LAB_MISSIONS,
  labMission,
  labPorts,
  sanitizeLab,
  placeLabPiece,
  evaluateLab,
} from "./build-lab.mjs";
import { skillRecommendation } from "./build-progression.mjs";
const names = ["north", "east", "south", "west"];
function symbol(piece) {
  const ends = [
    [20, 0],
    [40, 20],
    [20, 40],
    [0, 20],
  ];
  return (
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="' +
    labPorts(piece)
      .map((p) => `M20 20L${ends[p][0]} ${ends[p][1]}`)
      .join(" ") +
    '"/><circle cx="20" cy="20" r="3"/></svg>'
  );
}
export function mountBuildLab({
  read,
  write,
  beforeOpen,
  afterClose,
  onTest = () => {},
  onReveal = () => {},
  canSelectMission = () => true,
  onLocked = () => {},
  autoReveal = () => false,
}) {
  const $ = (id) => document.getElementById(id);
  const dialog = $("build-lab");
  let brush = { kind: "straight", turn: 0 },
    result = null,
    returnFocus = null,
    pendingRepair = null,
    recoveredTest = false;
  const grid = $("lab-grid");
  const buttons = Array.from({ length: 25 }, (_, cell) => {
    const button = document.createElement("button");
    button.type = "button";
    button.onclick = () => {
      const state = sanitizeLab(read()),
        mission = labMission(state.active);
      if (state.faults[mission.id] === cell) {
        // A broken link is an explicit repair action. The network stays
        // interrupted until the player successfully runs the Test control.
        pendingRepair = mission.id;
        result = null;
        render();
        return;
      }
      pendingRepair = null;
      state.boards[mission.id] = placeLabPiece(
        mission,
        state.boards[mission.id],
        cell,
        brush.kind === "remove" ? null : brush,
      );
      state.tested = state.tested.filter((id) => id !== mission.id);
      write(state);
      result = null;
      render();
    };
    grid.append(button);
    return button;
  });
  for (const mission of LAB_MISSIONS) {
    const option = document.createElement("option");
    option.value = mission.id;
    option.textContent = mission.title;
    $("lab-mission").append(option);
  }
  function render() {
    const state = sanitizeLab(read()),
      mission = labMission(state.active),
      board = state.boards[mission.id];
    $("lab-mission").value = mission.id;
    $("lab-brief").textContent = mission.brief;
    const guidance = skillRecommendation(state);
    $("lab-recommendation").textContent =
      guidance.tier +
      " · " +
      guidance.message +
      " Suggested next: " +
      guidance.recommendedTitle;
    $("lab-see-city").hidden = !result?.success;
    if (result?.success) {
      $("lab-see-city").textContent = recoveredTest
        ? "See my restored city service →"
        : "See what I built in my city →";
    }
    $("lab-budget").textContent =
      `${evaluateLab(mission, board).cost} / ${mission.budget} pieces used`;
    const working = LAB_MISSIONS.filter(
      (item) =>
        state.tested.includes(item.id) &&
        evaluateLab(item, state.boards[item.id]).success,
    ).length;
    $("lab-progress").textContent =
      `${working}/${LAB_MISSIONS.length} working city prototypes`;
    $("lab-brush").textContent =
      brush.kind === "remove"
        ? "Remove: tap a piece to lift it."
        : `${brush.kind}: openings face ${labPorts(brush)
            .map((p) => names[p])
            .join(" and ")}.`;
    $("lab-rotate").disabled = brush.kind === "remove";
    dialog
      .querySelectorAll("[data-lab-tool]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.labTool === brush.kind),
        ),
      );
    $("lab-mission")
      .querySelectorAll("option")
      .forEach((option) => {
        option.disabled = !canSelectMission(option.value);
      });
    buttons.forEach((button, cell) => {
      const target = mission.targets.find((t) => t.cell === cell),
        source = mission.source === cell,
        blocked = mission.blocked.includes(cell);
      const fixed = source || target || blocked;
      const piece = board[cell];
      button.disabled = Boolean(fixed);
      button.className =
        "lab-cell" +
        (fixed ? " lab-fixed" : "") +
        (result?.reached.includes(cell) ? " lab-powered" : "") +
        (result?.vulnerable === cell ? " lab-fault" : "") +
        (state.faults[mission.id] === cell ? " lab-damaged" : "") +
        (pendingRepair === mission.id && state.faults[mission.id] === cell
          ? " lab-repaired"
          : "");
      button.setAttribute(
        "aria-label",
        `Row ${Math.floor(cell / 5) + 1}, column ${(cell % 5) + 1}: ` +
          (state.faults[mission.id] === cell
            ? pendingRepair === mission.id
              ? "Repaired connection. Test it to restore service."
              : "Broken connection. Tap to repair this piece."
            : source
              ? "Supply"
              : target
                ? target.name
                : blocked
                  ? "Protected tree. Build around it."
                  : piece
                    ? `${piece.kind}, ${labPorts(piece)
                        .map((p) => names[p])
                        .join(" and ")}`
                    : "Empty"),
      );
      if (fixed)
        button.textContent = source ? "Supply" : target ? target.name : "🌳";
      else
        button.innerHTML = piece
          ? symbol(piece)
          : '<span aria-hidden="true">·</span>';
    });
    $("lab-result").textContent =
      result?.message ??
      (state.faults[mission.id] !== null
        ? pendingRepair === mission.id
          ? "You repaired the damaged piece. Now press Test my network to restore service."
          : "An outage broke the orange-marked connection. Tap the damaged piece, then Test your repair."
        : "Place your pieces, then test your network. You can change any piece and try again.");
    $("lab-result").className = result
      ? result.success
        ? "lab-result lab-success"
        : "lab-result lab-revise"
      : "lab-result";
    $("lab-next").hidden =
      !result?.success ||
      !LAB_MISSIONS.slice(
        LAB_MISSIONS.findIndex((m) => m.id === mission.id) + 1,
      ).some((item) => canSelectMission(item.id));
  }
  function selectMission(id) {
    if (!canSelectMission(id)) {
      onLocked();
      render();
      return;
    }
    const state = sanitizeLab(read());
    state.active = id;
    write(state);
    result = null;
    pendingRepair = null;
    recoveredTest = false;
    $("lab-hint-copy").hidden = true;
    render();
  }
  $("lab-mission").onchange = (e) => selectMission(e.target.value);
  dialog.querySelectorAll("[data-lab-tool]").forEach((button) => {
    button.onclick = () => {
      brush.kind = button.dataset.labTool;
      render();
    };
  });
  $("lab-hint").onclick = () => {
    const show = $("lab-hint-copy").hidden;
    $("lab-hint-copy").hidden = !show;
    if (show) {
      const state = sanitizeLab(read());
      state.attempts[state.active].hints = Math.min(
        30,
        state.attempts[state.active].hints + 1,
      );
      write(state);
    }
    $("lab-hint").textContent = show
      ? "Hide the hint"
      : "Need a hint? Show a first move";
    render();
  };
  function revealCity() {
    if (!result?.success) return;
    const missionId = sanitizeLab(read()).active,
      recovered = recoveredTest;
    dialog.close();
    onReveal({ missionId, recovered });
  }
  $("lab-see-city").onclick = revealCity;
  $("lab-rotate").onclick = () => {
    brush.turn = (brush.turn + 1) % 4;
    render();
  };
  $("lab-test").onclick = () => {
    const state = sanitizeLab(read());
    const mission = labMission(state.active);
    const fault = state.faults[state.active];
    const repaired = fault !== null && pendingRepair === state.active;
    // The damaged component does not transmit supply until actually repaired.
    const trialBoard =
      fault !== null && !repaired
        ? state.boards[state.active].map((piece, index) =>
            index === fault ? null : piece,
          )
        : state.boards[state.active];
    result = evaluateLab(mission, trialBoard);
    const record = state.attempts[state.active];
    record.tests = Math.min(30, record.tests + 1);
    if (result.success) record.successes = Math.min(30, record.successes + 1);
    if (result.success) {
      state.tested = state.tested.filter((id) => id !== state.active);
      state.tested.push(state.active);
      if (repaired) state.faults[state.active] = null;
    } else if (fault === null) {
      // A broken city facility remains physically present during a
      // repair drill; only its service is interrupted.
      state.tested = state.tested.filter((id) => id !== state.active);
    }
    recoveredTest = repaired && result.success;
    pendingRepair = null;
    write(state);
    onTest({
      missionId: state.active,
      success: result.success,
      recovered: recoveredTest,
    });
    render();
    if (result?.success && autoReveal()) revealCity();
  };
  $("lab-clear").onclick = () => {
    const state = sanitizeLab(read());
    state.boards[state.active] = Array(25).fill(null);
    state.tested = state.tested.filter((id) => id !== state.active);
    state.faults[state.active] = null;
    pendingRepair = null;
    recoveredTest = false;
    write(state);
    result = null;
    render();
  };
  $("lab-next").onclick = () => {
    const current = LAB_MISSIONS.findIndex(
      (m) => m.id === sanitizeLab(read()).active,
    );
    const next = LAB_MISSIONS.slice(current + 1).find((m) =>
      canSelectMission(m.id),
    );
    if (next) selectMission(next.id);
    else onLocked();
  };
  $("lab-close").onclick = () => dialog.close();
  $("lab-back-city").onclick = () => dialog.close();
  dialog.addEventListener("close", () => {
    result = null;
    afterClose();
    (returnFocus?.isConnected &&
    returnFocus.matches("button, a, input, select, summary") &&
    returnFocus.getClientRects().length > 0 &&
    !returnFocus.closest("[hidden]")
      ? returnFocus
      : $("city-menu").querySelector("summary")
    ).focus();
  });
  return {
    /**
     * @param {string | null} [missionId]
     * @param {{ firstMission?: boolean }} [options]
     */
    open(missionId = null, { firstMission = false } = {}) {
      if (dialog.open) return;
      const requested =
        missionId && LAB_MISSIONS.some((m) => m.id === missionId)
          ? missionId
          : sanitizeLab(read()).active;
      const chosen = canSelectMission(requested)
        ? requested
        : LAB_MISSIONS.find((m) => canSelectMission(m.id))?.id;
      if (!chosen) {
        onLocked();
        return;
      }
      returnFocus = document.activeElement;
      $("lab-title").textContent = firstMission
        ? "Your first build: power the workshop"
        : "Build Lab";
      $("lab-first-brief").hidden = !firstMission;
      $("lab-hint-copy").hidden = true;
      pendingRepair = null;
      recoveredTest = false;
      beforeOpen();
      const current = sanitizeLab(read());
      if (current.active !== chosen) {
        current.active = chosen;
        write(current);
      }
      result = null;
      render();
      dialog.showModal();
      $("lab-mission").focus();
    },
  };
}
