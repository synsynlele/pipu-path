// Navigation changes presentation only; chapter locks and progress stay authoritative.
export function chapterHelp(items, foundationStep, questionTitle, buildTitle) {
  if (items.every((item) => item.completed))
    return "STORY COMPLETE · Explore your city, try optional service practice, or start a real-world Quest.";
  const current = items.find((item) => item.unlocked && !item.completed);
  if (!current)
    return "Continue my chapter returns to your next city challenge.";
  const prefix = `CHAPTER ${current.chapter} · ${current.title}. `;
  if (current.chapter <= 2)
    return (
      prefix +
      (foundationStep === "build"
        ? "Build and test: " + buildTitle
        : "Decide: " + questionTitle)
    );
  return (
    prefix +
    (current.chapter === 3
      ? "Choose your priorities, run the next day and inspect the result."
      : current.chapter === 4
        ? "Compare a response, apply it and see how your city copes."
        : "Follow the current challenge, test your solution and improve it before applying.")
  );
}

export function mountPlayNavigation(menu) {
  const groups = [...menu.querySelectorAll(":scope > div > details")];
  for (const group of groups) {
    group.addEventListener("toggle", () => {
      if (group.open)
        for (const other of groups) if (other !== group) other.open = false;
    });
  }
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.open) return;
    event.preventDefault();
    event.stopPropagation();
    menu.open = false;
    menu.querySelector("summary").focus();
  });
}
