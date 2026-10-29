"use client";
import { usePathname } from "next/navigation";
const steps = [
  "Choose a goal",
  "Get a Quest",
  "Take action",
  "Add proof",
  "Put it to use",
];
export function RealWorldSteps() {
  const path = usePathname();
  if (
    !/^\/(?:real-quests|onboarding|mission|journey|quests|projects|portfolio)(?:\/|$)/.test(
      path,
    )
  )
    return null;
  const current =
    path.startsWith("/projects") || path.startsWith("/portfolio")
      ? 4
      : /^\/quests\/[^/]+\/proof/.test(path)
        ? 3
        : /^\/quests\/[^/]+/.test(path)
          ? 2
          : path === "/quests"
            ? 1
            : 0;
  return (
    <nav
      aria-label="From idea to real-world use"
      className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"
    >
      <ol className="grid grid-cols-5 gap-1 rounded-2xl border border-[#e3e5ef] bg-white p-2 sm:gap-3 sm:p-3">
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={current === index ? "step" : undefined}
            className={`min-w-0 rounded-xl px-1 py-2 text-center text-[0.62rem] leading-4 font-semibold sm:text-xs ${current === index ? "bg-[#edeaff] text-[#4934c8]" : "text-[#687089]"}`}
          >
            <span
              className="mx-auto mb-1 grid size-6 place-items-center rounded-full border border-current/20"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </nav>
  );
}
