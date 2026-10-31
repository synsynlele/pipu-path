import {
  ADVANCED_CHAPTERS,
  advancedMission,
  advancedRules,
  newAdvanced,
  sanitizeAdvanced,
  testAdvanced,
  deployAdvanced,
  canStartAdvanced,
} from "./advanced.mjs";
export function createAdvancedDesk({
  getState,
  change,
  prepare,
  reveal,
  save,
  seed = 0,
}) {
  const $ = (id) => document.getElementById(id),
    panel = $("advanced-panel");
  let tested = false;
  const current = () =>
    sanitizeAdvanced(getState().advanced) ?? newAdvanced(getState().resilience);
  function write(value) {
    change(value);
    save();
  }
  function close() {
    panel.hidden = true;
    $("advanced-toggle").setAttribute("aria-expanded", "false");
  }
  function next() {
    const value = current();
    write({ ...value, cursor: { phase: "diagnose", plan: [] } });
    open();
  }
  function showResult(value) {
    const i = value.records.length - 1,
      chapter = ADVANCED_CHAPTERS[Math.floor(i / 2)],
      m = chapter.missions[i % 2];
    reveal({
      chapter: chapter.number,
      title: m[0],
      district: m[2],
      summary:
        "Upgrade deployed and tested. " +
        testAdvanced(
          { ...value, records: value.records.slice(0, -1) },
          value.records[i].plan,
        ).message,
      complete: value.records.length === 16,
      next,
    });
  }
  function render() {
    tested = false;
    const value = current(),
      m = advancedMission(value);
    $("advanced-title").textContent = m
      ? `Chapter ${m.chapter} · ${m.chapterTitle}`
      : "Chapter 12 complete · Your city showcase";
    $("advanced-progress").textContent =
      `Tested upgrades: ${value.records.length}/16 · Same city, stronger systems`;
    $("advanced-complete").hidden = Boolean(m);
    $("advanced-mission").hidden = !m;
    if (!m) return;
    $("advanced-brief").textContent = m.title + " — " + m.brief;
    const diagnosis = $("advanced-diagnosis"),
      work = $("advanced-work");
    const configure = value.cursor.phase === "configure";
    diagnosis.hidden = configure;
    work.hidden = !configure;
    diagnosis.replaceChildren();
    if (!configure) {
      const question = document.createElement("p");
      question.textContent = "What must change first?";
      diagnosis.append(question);
      const offset = (m.index + seed) % 3;
      for (let i = 0; i < 3; i++) {
        const answer = m.answers[(i + offset) % 3],
          button = document.createElement("button");
        button.type = "button";
        button.textContent = answer;
        button.onclick = () => {
          if (answer !== m.diagnosis) {
            $("advanced-message").textContent =
              "That does not address the stated bottleneck. Re-read the evidence and try again.";
            return;
          }
          write({
            ...value,
            cursor: {
              phase: "configure",
              plan: Array(m.kind === "allocate" ? 3 : 5).fill(0),
            },
          });
          render();
          $("advanced-message").textContent =
            "Diagnosis checked. Configure the working solution below.";
        };
        diagnosis.append(button);
      }
      return;
    }
    const rules = advancedRules(value);
    $("advanced-rules").textContent =
      m.kind === "allocate"
        ? `Supply budget: ${rules.budget} units per cycle. Minimum clinic ${rules.minimum[0]}, growers ${rules.minimum[1]}, repairs ${rules.minimum[2]}. Keep ${rules.reserve} in reserve. Your city’s starting water capacity and earlier upgrades increase this budget. Each deployed allocation installs the tested service response; routes repair the connection and its endpoints.`
        : `Connect the depot through relay A or relay B to the service. The direct link is broken. Maintain at most ${rules.links} links. ${rules.redundant ? "Both independent routes must work, so either one can fail safely." : "At least one complete working route must reach the service."}`;
    const controls = $("advanced-controls");
    controls.replaceChildren();
    const plan =
      value.cursor.plan.length === (m.kind === "allocate" ? 3 : 5)
        ? [...value.cursor.plan]
        : Array(m.kind === "allocate" ? 3 : 5).fill(0);
    const names =
      m.kind === "allocate"
        ? ["Clinic water", "Growers water", "Repair supply"]
        : [
            "Depot → relay A",
            "Relay A → service",
            "Depot → relay B",
            "Relay B → service",
            "Direct link (broken)",
          ];
    if (m.kind === "network") {
      const diagram = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      diagram.setAttribute("viewBox", "0 0 260 105");
      diagram.setAttribute("role", "img");
      diagram.setAttribute(
        "aria-label",
        "Two relay routes connect the depot on the left to the service on the right. The direct link is broken.",
      );
      const segments = [
        [28, 52, 130, 18],
        [130, 18, 232, 52],
        [28, 52, 130, 88],
        [130, 88, 232, 52],
        [28, 52, 232, 52],
      ];
      segments.forEach((v, i) => {
        const line = document.createElementNS(diagram.namespaceURI, "line");
        ["x1", "y1", "x2", "y2"].forEach((k, j) =>
          line.setAttribute(k, String(v[j])),
        );
        line.dataset.wire = String(i);
        line.setAttribute(
          "stroke",
          i === 4 ? "#be5260" : plan[i] ? "#398573" : "#acb9cb",
        );
        line.setAttribute("stroke-width", "4");
        if (i === 4) line.setAttribute("stroke-dasharray", "5 4");
        diagram.append(line);
      });
      [
        [28, 52, "Depot"],
        [130, 18, "A"],
        [130, 88, "B"],
        [232, 52, "Service"],
      ].forEach(([x, y, label]) => {
        const circle = document.createElementNS(diagram.namespaceURI, "circle");
        circle.setAttribute("cx", String(x));
        circle.setAttribute("cy", String(y));
        circle.setAttribute("r", "12");
        circle.setAttribute("fill", "#e5eefc");
        diagram.append(circle);
        const text = document.createElementNS(diagram.namespaceURI, "text");
        text.setAttribute("x", String(x));
        text.setAttribute("y", String(y + 4));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "10");
        text.setAttribute("fill", "#243c68");
        text.textContent = String(label);
        diagram.append(text);
      });
      controls.append(diagram);
    }
    names.forEach((name, i) => {
      const label = document.createElement("label"),
        input = document.createElement("input"),
        output = document.createElement("span");
      label.append(document.createTextNode(name + " "));
      input.type = m.kind === "allocate" ? "range" : "checkbox";
      input.setAttribute("aria-label", name);
      if (m.kind === "allocate") {
        input.min = "0";
        input.max = String(rules.budget);
        input.step = "1";
        input.value = String(plan[i]);
      } else input.checked = Boolean(plan[i]);
      output.textContent = m.kind === "allocate" ? String(plan[i]) : "";
      input.oninput = () => {
        plan[i] =
          m.kind === "allocate" ? Number(input.value) : Number(input.checked);
        output.textContent = m.kind === "allocate" ? String(plan[i]) : "";
        controls
          .querySelector(`[data-wire="${i}"]`)
          ?.setAttribute(
            "stroke",
            i === 4 ? "#be5260" : plan[i] ? "#398573" : "#acb9cb",
          );
        tested = false;
        $("advanced-deploy").disabled = true;
        $("advanced-message").textContent =
          "Plan changed. Test it before deploying.";
        write({ ...value, cursor: { phase: "configure", plan: [...plan] } });
      };
      label.append(input, output);
      controls.append(label);
    });
    $("advanced-test").onclick = () => {
      const result = testAdvanced(value, plan);
      tested = result.ok;
      $("advanced-message").textContent = result.message;
      $("advanced-deploy").disabled = !tested;
    };
    $("advanced-deploy").disabled = true;
    $("advanced-deploy").onclick = () => {
      if (!tested) return;
      const result = deployAdvanced(current(), plan);
      if (!result) return;
      write(result);
      close();
      showResult(result);
    };
  }
  function open() {
    if (!canStartAdvanced(getState().resilience)) return;
    prepare();
    const value = current();
    if (!getState().advanced) write(value);
    $("advanced-message").textContent = "";
    if (value.cursor.phase === "result" && value.records.length) {
      showResult(value);
      return;
    }
    render();
    panel.hidden = false;
    $("advanced-toggle").setAttribute("aria-expanded", "true");
    $("advanced-close").focus();
  }
  $("advanced-toggle").onclick = open;
  $("chapter-five-start").onclick = open;
  $("advanced-close").onclick = close;
  $("advanced-replay").onclick = () => {
    if (
      !confirm(
        "Restart Chapters 5–12 and their upgrades? Your Chapters 1–4 city and supplies stay intact.",
      )
    )
      return;
    write(newAdvanced(getState().resilience));
    open();
  };
  return { open, close, next };
}
