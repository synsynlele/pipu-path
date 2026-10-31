import {
  ADVANCED_CHAPTERS,
  advancedMission,
  newAdvanced,
  sanitizeAdvanced,
  testAdvanced,
  deployAdvanced,
  canStartAdvanced,
} from "./advanced.mjs";
import { newPlan, validPlanShape } from "./advanced-challenges.mjs";
// Accessible mobile controls for distinct challenge families. Each plan is
// persisted through the existing city save; the test button is never bypassed.
export function createAdvancedDesk({
  getState,
  change,
  prepare,
  reveal,
  save,
}) {
  const $ = (id) => document.getElementById(id),
    panel = $("advanced-panel");
  let tested = false;
  const current = () =>
    sanitizeAdvanced(getState().advanced) ?? newAdvanced(getState().resilience);
  function write(v) {
    change(v);
    save();
  }
  function close() {
    document.body.classList.remove("advanced-configuring");
    panel.hidden = true;
    $("advanced-toggle").setAttribute("aria-expanded", "false");
  }
  function next() {
    const v = current();
    write({ ...v, cursor: { phase: "diagnose", plan: [] } });
    open();
  }
  function report(v) {
    const i = v.records.length - 1,
      m = ADVANCED_CHAPTERS[Math.floor(i / 2)]?.missions[i % 2];
    if (!m) return;
    const record = v.records[i];
    const before = { ...v, records: v.records.slice(0, -1) };
    reveal({
      chapter: Math.floor(i / 2) + 5,
      title: m.title,
      district: m.district,
      summary: record.legacyPlan
        ? "This stage was completed in the earlier game design. Your progress is preserved."
        : "Challenge complete. " + testAdvanced(before, record.plan).message,
      complete: v.records.length === 16,
      next,
    });
  }
  function element(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = String(text);
    return e;
  }
  function controlButton(label, handler, cls = "advanced-tile") {
    const b = element("button", cls, label);
    b.type = "button";
    b.onclick = handler;
    return b;
  }
  function render() {
    tested = false;
    $("advanced-review").hidden = true;
    const v = current(),
      m = advancedMission(v);
    $("advanced-title").textContent = m
      ? "Chapter " + m.chapter + " · " + m.chapterTitle
      : "Chapter 12 complete · Your city showcase";
    $("advanced-progress").textContent =
      "City challenges " +
      v.records.length +
      "/16 · Your earlier city and credits stay intact";
    $("advanced-complete").hidden = !!m;
    $("advanced-mission").hidden = !m;
    if (!m) {
      document.body.classList.remove("advanced-configuring");
      return;
    }
    $("advanced-brief").textContent = m.title + " — " + m.brief;
    const configure = v.cursor.phase === "configure",
      diagnosis = $("advanced-diagnosis"),
      work = $("advanced-work");
    document.body.classList.toggle("advanced-configuring", configure);
    diagnosis.hidden = configure;
    work.hidden = !configure;
    diagnosis.replaceChildren();
    $("advanced-message").textContent = "";
    if (!configure) {
      diagnosis.append(element("p", "advanced-guide", m.guide));
      const tag = element(
        "p",
        "advanced-type",
        "New challenge · " + m.kind.replaceAll("-", " "),
      );
      diagnosis.append(
        tag,
        controlButton(
          "Start " + m.title + " →",
          () => {
            write({ ...v, cursor: { phase: "configure", plan: newPlan(m) } });
            render();
          },
          "primary",
        ),
      );
      return;
    }
    $("advanced-rules").textContent = m.guide;
    const root = $("advanced-controls");
    root.replaceChildren();
    root.classList.add("advanced-varied");
    const b = m.board,
      k = m.kind;
    let plan = validPlanShape(m, v.cursor.plan)
      ? [...v.cursor.plan]
      : newPlan(m);
    const progress = element("p", "advanced-live-impact", "");
    progress.setAttribute("aria-live", "polite");
    root.append(progress);
    const body = element("div", "advanced-task");
    body.dataset.challenge = k;
    root.append(body);
    function update(next, rerender = false) {
      if (!validPlanShape(m, next)) return;
      plan = [...next];
      tested = false;
      $("advanced-deploy").disabled = true;
      $("advanced-message").textContent =
        "Your plan has changed. Test the result before deploying.";
      write({ ...current(), cursor: { phase: "configure", plan: [...plan] } });
      if (rerender) render();
      else {
        const budget = b.budget ?? null;
        const used = ["equity", "negotiate", "portfolio"].includes(k)
          ? plan.reduce((n, x) => n + x, 0)
          : ["access", "backup", "investigate"].includes(k)
            ? plan.reduce((n, x, i) => n + (x ? b.cost[i] : 0), 0)
            : null;
        progress.textContent =
          budget !== null
            ? "Used " +
              used +
              " / " +
              budget +
              " tokens" +
              (b.reserve ? " · reserve " + b.reserve : "")
            : ["triage", "chain", "path"].includes(k)
              ? "Steps selected: " + plan.length
              : ["cascade", "showcase"].includes(k)
                ? "Decisions made: " +
                  plan.filter((x) => x >= 0).length +
                  "/" +
                  plan.length
                : "Choose a working solution, then test.";
      }
    }
    function rerun(next) {
      update(next, true);
    }
    const card = (name, i) => {
      const c = element("span", "advanced-item-text", "");
      const emoji = element("span", "advanced-item-icon", b.icons?.[i] ?? "◈");
      emoji.setAttribute("aria-hidden", "true");
      c.append(emoji, element("span", "", name));
      return c;
    };
    if (k === "triage" || k === "chain") {
      const lane = element("div", "advanced-order-lane");
      lane.append(element("strong", "", "Your working order"));
      const list = element("ol", "advanced-order");
      for (const index of plan) {
        const li = element("li", "", b.cards[index]);
        list.append(li);
      }
      if (!plan.length)
        list.append(element("li", "", "Choose your first step below"));
      lane.append(list);
      lane.append(
        controlButton(
          "↶ Undo last",
          () => rerun(plan.slice(0, -1)),
          "secondary",
        ),
      );
      body.append(lane);
      const choices = element("div", "advanced-choice-grid");
      b.cards.forEach((name, i) => {
        const tile = controlButton("", () => rerun([...plan, i]));
        tile.append(card(name, i));
        tile.disabled = plan.includes(i);
        if (tile.disabled) tile.textContent = "✓ " + name;
        choices.append(tile);
      });
      body.append(choices);
    } else if (k === "path") {
      body.append(
        element(
          "p",
          "advanced-hint",
          "Workshop at top left → Clinic at bottom right. Tap neighbouring squares.",
        ),
      );
      const grid = element("div", "advanced-street-grid");
      for (let i = 0; i < 16; i++) {
        const label =
          i === b.start
            ? "START 🛠️"
            : i === b.end
              ? "CLINIC 🏥"
              : b.blocked.includes(i)
                ? "⛔"
                : "Street";
        const tile = controlButton(
          label,
          () => {
            if (b.blocked.includes(i) || plan.includes(i)) return;
            const last = plan.at(-1);
            if (
              plan.length &&
              Math.abs(Math.floor(i / 4) - Math.floor(last / 4)) +
                Math.abs((i % 4) - (last % 4)) !==
                1
            ) {
              $("advanced-message").textContent =
                "Choose an adjacent street. Roads cannot jump across blocks.";
              return;
            }
            if (!plan.length && i !== b.start) return;
            rerun([...plan, i]);
          },
          "advanced-street",
        );
        tile.classList.toggle("blocked", b.blocked.includes(i));
        tile.classList.toggle("selected", plan.includes(i));
        tile.disabled = b.blocked.includes(i);
        grid.append(tile);
      }
      body.append(
        grid,
        controlButton(
          "↶ Undo a street",
          () => rerun(plan.slice(0, -1)),
          "secondary",
        ),
      );
    } else if (
      ["site", "investigate", "access", "audit", "backup"].includes(k)
    ) {
      const grid = element(
        "div",
        k === "site" ? "advanced-site-grid" : "advanced-choice-grid",
      );
      b.cards.forEach((name, i) => {
        const on = plan[i] === 1;
        const tile = controlButton("", () => {
          const changed = [...plan];
          changed[i] = on ? 0 : 1;
          rerun(changed);
        });
        tile.setAttribute("aria-pressed", String(on));
        tile.classList.toggle("selected", on);
        tile.append(card(name, i));
        if (b.cost) tile.append(element("small", "", b.cost[i] + " tokens"));
        grid.append(tile);
      });
      body.append(grid);
    } else if (k === "sort") {
      b.cards.forEach((name, i) => {
        const row = element("label", "advanced-input-row", "");
        row.append(card(name, i));
        const select = element("select");
        select.setAttribute("aria-label", "How to handle " + name);
        b.categories.forEach((value, j) => {
          const opt = element("option", "", value);
          opt.value = String(j);
          select.append(opt);
        });
        select.value = String(plan[i]);
        select.onchange = () => {
          const n = [...plan];
          n[i] = Number(select.value);
          update(n);
        };
        row.append(select);
        body.append(row);
      });
    } else if (k === "schedule" || k === "dispatch") {
      b.cards.forEach((name, i) => {
        const row = element("label", "advanced-input-row", "");
        row.append(card(name, i));
        const select = element("select");
        select.setAttribute("aria-label", "Assignment for " + name);
        b.options.forEach((label, j) => {
          const option = element("option", "", label);
          option.value = String(j);
          select.append(option);
        });
        select.value = String(plan[i]);
        select.onchange = () => {
          const n = [...plan];
          n[i] = Number(select.value);
          update(n);
        };
        row.append(select);
        body.append(row);
      });
    } else if (["equity", "negotiate", "portfolio"].includes(k)) {
      b.cards.forEach((name, i) => {
        const row = element("label", "advanced-allocation-row", "");
        const top = element("span", "advanced-allocation-head", "");
        top.append(card(name, i));
        const display = element("output", "", String(plan[i]));
        top.append(display);
        row.append(top);
        const range = element("input");
        range.type = "range";
        range.min = "0";
        range.max = String(b.budget);
        range.step = "1";
        range.value = String(plan[i]);
        range.setAttribute("aria-label", name + " allocation");
        range.oninput = () => {
          const n = [...plan];
          n[i] = Number(range.value);
          display.textContent = range.value;
          update(n);
        };
        row.append(
          range,
          element("small", "", "Minimum target " + b.minimum[i]),
        );
        body.append(row);
      });
    } else if (k === "cascade" || k === "showcase") {
      b.prompts.forEach((name, i) => {
        const group = element("fieldset", "advanced-scenario-step");
        const legend = element("legend", "", i + 1 + ". " + name);
        group.append(legend);
        b.choices[i].forEach((choice, j) => {
          const selected = plan[i] === j,
            tile = controlButton(choice, () => {
              const n = [...plan];
              n[i] = j;
              rerun(n);
            });
          tile.setAttribute("aria-pressed", String(selected));
          tile.classList.toggle("selected", selected);
          group.append(tile);
        });
        body.append(group);
      });
    }
    const reset = controlButton(
      "Reset this plan",
      () => rerun(newPlan(m)),
      "secondary",
    );
    body.append(reset);
    update(plan);
    $("advanced-deploy").disabled = true;
    $("advanced-test").onclick = () => {
      const state = current();
      const outcome = testAdvanced(state, plan);
      tested = outcome.ok;
      $("advanced-message").textContent = outcome.message;
      progress.textContent = outcome.score + " / 100 simulated challenge score";
      progress.dataset.result = outcome.ok ? "pass" : "review";
      $("advanced-deploy").disabled = !tested;
    };
    $("advanced-deploy").onclick = () => {
      if (!tested) return;
      const completed = deployAdvanced(current(), plan);
      if (!completed) return;
      write(completed);
      close();
      report(completed);
    };
  }
  function openChapter(chapter) {
    if (!canStartAdvanced(getState().resilience)) return;
    const v = current(),
      start = (chapter - 5) * 2;
    if (chapter < 5 || chapter > 12 || v.records.length < start) return;
    if (v.records.length < start + 2) return open();
    prepare();
    render();
    document.body.classList.remove("advanced-configuring");
    $("advanced-mission").hidden = true;
    $("advanced-complete").hidden = true;
    const review = $("advanced-review");
    review.replaceChildren();
    review.hidden = false;
    $("advanced-title").textContent =
      "Chapter " +
      chapter +
      " · " +
      ADVANCED_CHAPTERS[chapter - 5].title +
      " · Completed";
    for (let index = start; index < start + 2; index++) {
      const m = ADVANCED_CHAPTERS[chapter - 5].missions[index - start],
        record = v.records[index];
      review.append(
        element("h3", "", m.title),
        element(
          "p",
          "",
          record.legacyPlan
            ? "Completed in the earlier challenge design. Your result remains saved."
            : testAdvanced(
                { ...v, records: v.records.slice(0, index) },
                record.plan,
              ).message,
        ),
      );
    }
    review.append(
      element("p", "", "Your current challenge and purchases are unchanged."),
      controlButton("Return to current challenge →", open, "primary"),
    );
    panel.hidden = false;
    $("advanced-close").focus();
  }
  function open() {
    if (!canStartAdvanced(getState().resilience)) return;
    prepare();
    const v = current();
    if (!getState().advanced) write(v);
    if (v.cursor.phase === "result" && v.records.length) {
      report(v);
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
  $("advanced-back-city").onclick = close;
  $("advanced-replay").onclick = () => {
    if (
      !confirm(
        "Restart Chapters 5–12? Your earlier city and Builder Shop purchases remain.",
      )
    )
      return;
    write(newAdvanced(getState().resilience));
    open();
  };
  return { open, close, next, openChapter };
}
