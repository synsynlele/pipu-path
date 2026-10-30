import {
  LAB_MISSIONS,
  labMission,
  labPorts,
  sanitizeLab,
  placeLabPiece,
  evaluateLab,
} from "./build-lab.mjs";
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
}) {
  const $ = (id) => document.getElementById(id);
  const dialog = $("build-lab");
  let brush = { kind: "straight", turn: 0 },
    result = null,
    returnFocus = null;
  const grid = $("lab-grid");
  const buttons = Array.from({ length: 25 }, (_, cell) => {
    const button = document.createElement("button");
    button.type = "button";
    button.onclick = () => {
      const state = sanitizeLab(read()),
        mission = labMission(state.active);
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
    $("lab-see-city").hidden = !result?.success;
    if (result?.success) {
      $("lab-see-city").textContent = "See what I built in my city →";
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
        (result?.vulnerable === cell ? " lab-fault" : "");
      button.setAttribute(
        "aria-label",
        `Row ${Math.floor(cell / 5) + 1}, column ${(cell % 5) + 1}: ` +
          (source
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
      "Place your pieces, then test your network. You can change any piece and try again.";
    $("lab-result").className = result
      ? result.success
        ? "lab-result lab-success"
        : "lab-result lab-revise"
      : "lab-result";
    $("lab-next").hidden =
      !result?.success || mission.id === LAB_MISSIONS.at(-1).id;
  }
  function selectMission(id) {
    const state = sanitizeLab(read());
    state.active = id;
    write(state);
    result = null;
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
    $("lab-hint-copy").hidden = !$("lab-hint-copy").hidden;
    $("lab-hint").textContent = $("lab-hint-copy").hidden
      ? "Need a hint? Show a first move"
      : "Hide the hint";
  };
  $("lab-see-city").onclick = () => {
    if (result?.success) {
      const missionId = sanitizeLab(read()).active;
      dialog.close();
      onReveal({ missionId });
    }
  };
  $("lab-rotate").onclick = () => {
    brush.turn = (brush.turn + 1) % 4;
    render();
  };
  $("lab-test").onclick = () => {
    const state = sanitizeLab(read());
    result = evaluateLab(labMission(state.active), state.boards[state.active]);
    state.tested = state.tested.filter((id) => id !== state.active);
    if (result.success) state.tested.push(state.active);
    write(state);
    onTest({ missionId: state.active, success: result.success });
    render();
  };
  $("lab-clear").onclick = () => {
    const state = sanitizeLab(read());
    state.boards[state.active] = Array(25).fill(null);
    state.tested = state.tested.filter((id) => id !== state.active);
    write(state);
    result = null;
    render();
  };
  $("lab-next").onclick = () => {
    const current = LAB_MISSIONS.findIndex(
      (m) => m.id === sanitizeLab(read()).active,
    );
    selectMission(
      LAB_MISSIONS[Math.min(current + 1, LAB_MISSIONS.length - 1)].id,
    );
  };
  $("lab-close").onclick = () => dialog.close();
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
      returnFocus = document.activeElement;
      $("lab-title").textContent = firstMission
        ? "Your first build: power the workshop"
        : "Build Lab";
      $("lab-first-brief").hidden = !firstMission;
      $("lab-hint-copy").hidden = true;
      beforeOpen();
      if (missionId && LAB_MISSIONS.some((item) => item.id === missionId)) {
        const current = sanitizeLab(read());
        current.active = missionId;
        write(current);
      }
      result = null;
      render();
      dialog.showModal();
      $("lab-mission").focus();
    },
  };
}
