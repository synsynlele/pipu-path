"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  builds,
  episode,
  evaluateFestival,
  limits,
  roles,
  type BuildId,
  type Role,
} from "../domain/festival";

const voices = [
  {
    name: "Ada",
    initial: "A",
    line: "I want to come. But my chair needs a clear, level path to every activity.",
  },
  {
    name: "Timi",
    initial: "T",
    line: "Give us something to do together. A square full of stalls alone won't bring me back.",
  },
  {
    name: "Mama Jo",
    initial: "J",
    line: "A wonderful event is useless if nobody knows where it is. Help people find us.",
  },
];
const roleClues: Record<Role, string> = {
  maker:
    "Supplies, setup hours and helpers are three different limits. A cheap plan can still need too many people.",
  designer:
    "An invitation gets people to the square. Clear paths get them into the activities. Those are different jobs.",
  organiser:
    "A plan can please one neighbour and leave another out. Listen for the need beneath each request.",
};

export function CityEpisode() {
  const [stage, setStage] = useState(0);
  const [role, setRole] = useState<Role>("maker");
  const [heard, setHeard] = useState<number[]>([]);
  const [plan, setPlan] = useState<BuildId[]>([]);
  const [result, setResult] = useState<ReturnType<
    typeof evaluateFestival
  > | null>(null);
  const [firstPlan, setFirstPlan] = useState<BuildId[]>([]);
  const [reflection, setReflection] = useState("");
  const [experiment, setExperiment] = useState(
    "Sketch a better layout for a familiar space.",
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const weather = stage >= 5 ? "rain" : "clear";
  const totals = evaluateFestival(plan, weather);
  const budget = limits[weather];
  const isTrial = stage === 3 || stage === 5;

  function move(next: number) {
    setStage(next);
    setResult(null);
    if (next === 5) setPlan([]);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function toggle(id: BuildId) {
    setPlan((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setResult(null);
  }
  function download() {
    const report = {
      episode: episode.id,
      kind: "Practice plan — not verified real-world evidence",
      chosenRole: role,
      firstPlan,
      rainPlan: plan,
      simulation: evaluateFestival(plan, "rain"),
      reflection,
      proposedExperiment: experiment,
      steps: [
        "Choose a familiar, safe space.",
        "Ask someone you know what makes it difficult to use.",
        "Sketch a small improvement using paper or materials you have.",
        "Show it to that person and ask what still needs changing.",
        "Record what you tried, their feedback and your next change.",
      ],
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pipupath-my-city-experiment.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main
      id="main-content"
      className="w-full bg-[#f7f8fc] pb-10 text-[#25284a]"
    >
      <section className="bg-[#201b59] px-4 pt-5 pb-12 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/build"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-100"
            >
              ← Back to Build
            </Link>
            <span className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold">
              The Unbuilt City · Episode 01
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
            {episode.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
            Three neighbours. One chance to bring this place to life. What will
            you make possible?
          </p>
          <ol aria-label="Episode progress" className="mt-6 flex gap-2">
            {episode.stages.map((label, index) => (
              <li
                key={label}
                aria-current={index === stage ? "step" : undefined}
                className={`h-1.5 flex-1 rounded-full ${index <= stage ? "bg-[#c9a54d]" : "bg-white/20"}`}
              >
                <span className="sr-only">
                  {index + 1}. {label}
                  {index < stage ? " — visited" : ""}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-indigo-100">
            Part {stage + 1} of 7 · {episode.stages[stage]}
          </p>
        </div>
      </section>
      <div className="relative mx-auto -mt-5 max-w-5xl space-y-4 px-4 sm:px-6">
        <section className="pp-app-card overflow-hidden p-5 sm:p-7">
          <p className="text-xs font-bold tracking-widest text-[#6848dc] uppercase">
            {isTrial
              ? weather === "rain"
                ? "Your independent attempt"
                : "Your first attempt"
              : "The neighbourhood"}
          </p>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-2 text-2xl font-bold tracking-tight outline-none"
          >
            {
              [
                "Someone left you the keys.",
                "Who is this place for?",
                "Choose how you want to contribute.",
                "Make tonight worth coming to.",
                "A busy square is only half the story.",
                "Rain changes everything.",
                "What could you change where you live?",
              ][stage]
            }
          </h2>

          {stage === 0 && (
            <>
              <CitySquare plan={[]} rainy={false} />
              <p className="mt-4 max-w-2xl text-base leading-7">
                An empty square is about to become a car park. Your neighbours
                have one evening to show it could be something more. You have
                the keys, a small supply budget and a few willing helpers.
              </p>
              <p className="mt-3 text-sm leading-6 text-[#626a80]">
                This is a fictional planning game. You can retry freely. It does
                not award XP or assess your abilities. Your attempt stays in
                this open page; refreshing starts again.
              </p>
              <Button onClick={() => move(1)} className="mt-5 rounded-full">
                Meet the neighbours →
              </Button>
            </>
          )}

          {stage === 1 && (
            <>
              <p className="mt-3 text-sm leading-6">
                Before choosing what to build, hear what each neighbour needs.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {voices.map((voice, index) => (
                  <button
                    key={voice.name}
                    type="button"
                    aria-expanded={heard.includes(index)}
                    onClick={() =>
                      setHeard((current) =>
                        current.includes(index) ? current : [...current, index],
                      )
                    }
                    className="min-h-36 rounded-2xl border border-[#ddd9ee] bg-[#faf9ff] p-4 text-left focus-visible:outline-2 focus-visible:outline-[#5436df]"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 place-items-center rounded-full bg-[#ece9ff] font-bold text-[#5436df]"
                    >
                      {voice.initial}
                    </span>
                    <span className="mt-3 block font-bold">{voice.name}</span>
                    <span className="mt-2 block text-sm leading-6 text-[#626a80]">
                      {heard.includes(index)
                        ? voice.line
                        : "Tap to hear their story →"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-5 font-semibold">
                How do you bring people together without leaving someone out?
              </p>
              <Button
                disabled={heard.length < 3}
                onClick={() => move(2)}
                className="mt-5 rounded-full"
              >
                I&apos;ve heard everyone →
              </Button>
            </>
          )}

          {stage === 2 && (
            <>
              <p className="mt-3 text-sm leading-6">
                Try a role for this episode. You can explore another on a
                replay. This is a choice, not a personality label.
              </p>
              <fieldset className="mt-5 grid gap-3 sm:grid-cols-3">
                <legend className="sr-only">Choose your role</legend>
                {roles.map((item) => (
                  <label
                    key={item.id}
                    className={`cursor-pointer rounded-2xl border p-4 ${role === item.id ? "border-[#6848dc] bg-[#f3f0ff]" : "border-[#ddd9ee]"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={item.id}
                      checked={role === item.id}
                      onChange={() => setRole(item.id)}
                      className="mr-2 accent-[#5436df]"
                    />
                    <strong>{item.title}</strong>
                    <span className="mt-2 block text-sm leading-6 text-[#626a80]">
                      {item.detail}
                    </span>
                  </label>
                ))}
              </fieldset>
              <p className="mt-5 rounded-2xl bg-[#f3f0ff] p-4 text-sm leading-6">
                <strong>One small clue: </strong>
                {roleClues[role]}
              </p>
              <Button onClick={() => move(3)} className="mt-5 rounded-full">
                Open the square →
              </Button>
            </>
          )}

          {isTrial && (
            <>
              <p className="mt-3 text-sm leading-6">
                {stage === 3
                  ? "If someone is with you, make this first plan together. Playing alone? Say one reason for and one reason against each choice."
                  : "Try this plan yourself. Supplies drop to 11 tokens and every activity now needs rain cover. Find a new combination."}
              </p>
              <div className="mt-4 rounded-2xl bg-[#f3f0ff] p-4 text-sm leading-6">
                <strong>Your goal:</strong> attract at least 24 fictional
                visitors, offer activities with 4 enjoyment points, provide
                clear paths and invitations
                {weather === "rain" ? ", and keep activities dry" : ""}. Stay
                within all three limits. Numbers are game rules, not predictions
                about real events.
              </div>
              <CitySquare plan={plan} rainy={weather === "rain"} />
              <div
                className="mt-4 grid grid-cols-3 gap-2"
                aria-label="Resources used"
              >
                {(
                  [
                    ["Supplies", totals.cost, budget.cost],
                    ["Setup hours", totals.time, budget.time],
                    ["Helpers", totals.crew, budget.crew],
                  ] as const
                ).map(([label, used, max]) => (
                  <div
                    key={label}
                    className={`rounded-2xl border p-3 ${used > max ? "border-red-500 bg-red-50" : "border-[#ddd9ee] bg-[#faf9ff]"}`}
                  >
                    <span className="block text-xs text-[#626a80]">
                      {label}
                    </span>
                    <strong className="mt-1 block text-xl">
                      {used} / {max}
                    </strong>
                    {used > max && (
                      <span className="text-xs text-red-700">
                        Over the limit
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
                <legend className="mb-3 text-sm font-semibold">
                  Tap to add or remove a build.
                </legend>
                {builds.map((build) => (
                  <button
                    key={build.id}
                    type="button"
                    aria-pressed={plan.includes(build.id)}
                    onClick={() => toggle(build.id)}
                    className={`min-h-32 rounded-2xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-[#5436df] ${plan.includes(build.id) ? "border-[#6848dc] bg-[#f3f0ff]" : "border-[#ddd9ee] bg-white"}`}
                  >
                    <span className="flex items-center justify-between gap-2 font-bold">
                      {build.title}
                      <span aria-hidden="true">
                        {plan.includes(build.id) ? "✓" : "+"}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[#626a80]">
                      {build.detail}
                    </span>
                    <span className="mt-3 block text-xs leading-5">
                      {build.cost} supplies · {build.time} hours · {build.crew}{" "}
                      helpers
                      <br />
                      {build.visitors} visitors · {build.joy} enjoyment
                    </span>
                  </button>
                ))}
              </fieldset>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  disabled={!plan.length}
                  onClick={() => setResult(evaluateFestival(plan, weather))}
                  className="rounded-full"
                >
                  Open the gates →
                </Button>
                <Button
                  variant="secondary"
                  disabled={!plan.length}
                  onClick={() => {
                    setPlan([]);
                    setResult(null);
                  }}
                  className="rounded-full"
                >
                  Clear plan
                </Button>
              </div>
              {result && (
                <section
                  aria-live="polite"
                  className={`mt-5 rounded-2xl border p-5 ${result.success ? "border-[#78c8b9] bg-[#effaf6]" : "border-[#e3ce96] bg-[#fffaf0]"}`}
                >
                  <h3 className="text-lg font-bold">
                    {result.success
                      ? "The square comes alive."
                      : "Something needs another look."}
                  </h3>
                  <p className="mt-2 text-sm">
                    Your plan: {result.visitors} potential visitors ·{" "}
                    {result.joy} enjoyment points.
                  </p>
                  {result.problems.length > 0 && (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                      {result.problems.map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-sm leading-6">
                    {result.success
                      ? "You balanced the resources and made room for different needs. Other combinations can work too."
                      : "Change a build and test again. Every attempt tells you something."}
                  </p>
                  {stage === 3 ? (
                    <Button
                      onClick={() => {
                        setFirstPlan([...plan]);
                        move(4);
                      }}
                      className="mt-4 rounded-full"
                    >
                      See what this teaches →
                    </Button>
                  ) : (
                    <Button
                      onClick={() => move(6)}
                      className="mt-4 rounded-full"
                    >
                      Reflect on this attempt →
                    </Button>
                  )}
                </section>
              )}
            </>
          )}

          {stage === 4 && (
            <>
              <p className="mt-4 text-base leading-7">
                This is a lesson in designing for people under constraints. The
                most exciting activity cannot fix a path someone cannot use. An
                accessible event still needs something enjoyable—and people need
                to know it exists.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6">
                <li>
                  <strong>Listen:</strong> turn each person&apos;s story into a
                  requirement.
                </li>
                <li>
                  <strong>Balance:</strong> check supplies, hours and helpers
                  separately.
                </li>
                <li>
                  <strong>Test:</strong> change one choice and compare the
                  outcome.
                </li>
              </ul>
              <p className="mt-4 rounded-2xl bg-[#f3f0ff] p-4 text-sm leading-6">
                For clear weather, live music + Make & share + clear paths +
                invitations uses 9 supplies, 7 hours and 6 helpers. It meets the
                needs—but a different night may need a different answer.
              </p>
              <Button onClick={() => move(5)} className="mt-5 rounded-full">
                Try a different night →
              </Button>
            </>
          )}

          {stage === 6 && (
            <>
              <p className="mt-3 text-sm leading-6">
                A game attempt suggests something to explore. It does not prove
                a talent or complete a real-world Quest.
              </p>
              <label
                htmlFor="city-reflection"
                className="mt-5 block text-sm font-semibold"
              >
                What did you change, and whose need did it help?
              </label>
              <textarea
                id="city-reflection"
                maxLength={1200}
                rows={3}
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#bdb7df] bg-white p-4 text-[#25284a]"
                placeholder="A short observation is enough. Leave out names or private details."
              />
              <fieldset className="mt-5 space-y-3">
                <legend className="mb-3 font-bold">
                  Choose an optional real-world experiment
                </legend>
                {[
                  "Sketch a better layout for a familiar space.",
                  "Make a clearer invitation for a small activity.",
                  "Plan a no-cost activity with someone you know.",
                ].map((choice) => (
                  <label
                    key={choice}
                    className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#ddd9ee] p-3 text-sm"
                  >
                    <input
                      type="radio"
                      name="experiment"
                      checked={experiment === choice}
                      onChange={() => setExperiment(choice)}
                      className="accent-[#5436df]"
                    />
                    {choice}
                  </label>
                ))}
              </fieldset>
              <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6">
                <li>Pick a familiar, safe space.</li>
                <li>Ask someone you know what could work better.</li>
                <li>
                  Make a small sketch or prototype with materials you have.
                </li>
                <li>Show it to them and ask what still needs changing.</li>
                <li>Record the attempt, feedback and your next change.</li>
              </ol>
              <p className="mt-4 text-sm leading-6 text-[#626a80]">
                No spending, public event or contact with strangers is required.
                Younger players: involve a trusted adult before changing a
                shared space. Keep other people&apos;s faces and details out of
                your notes.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={download} className="rounded-full">
                  Download my experiment
                </Button>
                <Link
                  href="/quests"
                  className="inline-flex min-h-11 items-center rounded-full border border-[#bdb7df] px-5 text-sm font-semibold text-[#5436df]"
                >
                  Open my real-world Quests →
                </Link>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#626a80]">
                Download saves a file to your device. This page does not upload
                your reflection or create a Quest. Use your existing
                Quest&apos;s evidence flow only when the experiment genuinely
                fits that Quest.
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setPlan([]);
                  setFirstPlan([]);
                  setHeard([]);
                  setReflection("");
                  move(0);
                }}
                className="mt-4"
              >
                Replay with another role
              </Button>
            </>
          )}
        </section>
        <p className="px-2 text-xs leading-5 text-[#626a80]">
          Practice episode · No leaderboard, talent score or XP · You can leave
          at any time.
        </p>
      </div>
    </main>
  );
}

function CitySquare({ plan, rainy }: { plan: BuildId[]; rainy: boolean }) {
  const spots = [
    { id: "music", x: 110, y: 85, icon: "♪" },
    { id: "food", x: 310, y: 85, icon: "☕" },
    { id: "art", x: 510, y: 85, icon: "✦" },
    { id: "access", x: 110, y: 230, icon: "↔" },
    { id: "shelter", x: 310, y: 230, icon: "⌂" },
    { id: "signs", x: 510, y: 230, icon: "↗" },
  ];
  return (
    <figure className="mt-5 overflow-hidden rounded-2xl border border-[#ddd9ee] bg-[#ece9f6]">
      <svg
        viewBox="0 0 640 350"
        role="img"
        aria-label={`The square, ${rainy ? "under rain" : "in clear weather"}, with ${plan.length} selected builds`}
        className="block w-full"
      >
        <rect width="640" height="350" fill={rainy ? "#d9e2ed" : "#eeebf6"} />
        <path
          d="M0 160h640M210 0v350M425 0v350"
          stroke="#fff"
          strokeWidth="24"
        />
        <path
          d="M0 160h640M210 0v350M425 0v350"
          stroke="#c9c2db"
          strokeWidth="1"
          strokeDasharray="5 8"
        />
        {spots.map((spot) => {
          const active = plan.includes(spot.id as BuildId);
          return (
            <g key={spot.id} transform={`translate(${spot.x},${spot.y})`}>
              <rect
                x="-72"
                y="-44"
                width="144"
                height="100"
                rx="16"
                fill={active ? "#5436df" : "#fff"}
                stroke={active ? "#5436df" : "#d4cde4"}
                strokeWidth="2"
              />
              <text
                y="0"
                textAnchor="middle"
                fill={active ? "white" : "#aaa2bc"}
                fontSize="32"
              >
                {spot.icon}
              </text>
              <text
                y="33"
                textAnchor="middle"
                fill={active ? "white" : "#6a627a"}
                fontSize="12"
                fontFamily="system-ui"
              >
                {builds.find((item) => item.id === spot.id)?.title}
              </text>
              {active && <circle cx="58" cy="-30" r="7" fill="#c9a54d" />}
            </g>
          );
        })}
        <text
          x="320"
          y="330"
          textAnchor="middle"
          fill="#51496a"
          fontSize="13"
          fontFamily="system-ui"
        >
          {rainy
            ? "NIGHT TWO · RAIN EXPECTED"
            : "NIGHT ONE · YOUR SQUARE, YOUR CHOICES"}
        </text>
      </svg>
      <figcaption className="bg-white px-4 py-3 text-xs leading-5 text-[#626a80]">
        {plan.length
          ? "Your selected builds appear in purple. Adjust your choices below."
          : "The empty square is waiting for your choices."}
      </figcaption>
    </figure>
  );
}
