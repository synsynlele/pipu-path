import { PublicShell } from "@/components/shells/public-shell";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

const pathway = [
  [
    "Discover",
    "Notice patterns in your interests, experiences and natural responses.",
  ],
  [
    "Understand Your Potential",
    "Receive a private, evidence-linked Human Potential Profile.",
  ],
  [
    "Choose a Mission",
    "Select one useful direction that fits your current season.",
  ],
  [
    "Follow a Journey",
    "Move through a realistic sequence of developmental milestones.",
  ],
  [
    "Complete Quests",
    "Take practical action in the real world—not simulated tasks.",
  ],
  ["Reflect", "Learn from what happened and improve your next move."],
  [
    "Build Real Proof",
    "Turn completed work into a Project and selective Portfolio proof.",
  ],
] as const;

const coreValue = [
  [
    "Private Human Potential Profile",
    "A reviewable picture built from your own Discovery evidence—not a label imposed on you.",
  ],
  [
    "Practical Mission",
    "One clear direction that connects what you carry to people you can genuinely help.",
  ],
  [
    "Structured Journey",
    "A realistic path with milestones, cautions and achievable outcomes.",
  ],
  [
    "Real-world Quests",
    "Action, evidence and Nortnspoil reflection that prove growth honestly.",
  ],
  [
    "Builder Projects",
    "A useful result developed through three evidence-backed milestones.",
  ],
  [
    "Selective Portfolio",
    "You decide exactly what becomes public, and you can withdraw it.",
  ],
] as const;

const audiences = [
  "Young people discovering direction",
  "Students preparing for life beyond school",
  "Builders ready to turn potential into value",
  "Adults seeking a practical development path",
] as const;

const trust = [
  [
    "Private by default",
    "Your answers, reflections and evidence are protected.",
  ],
  ["You control publication", "Nothing becomes public automatically."],
  [
    "AI supports reflection",
    "It helps organise evidence but never defines your identity.",
  ],
  [
    "Action creates progress",
    "PipuPath rewards completed work—not empty motivation.",
  ],
] as const;

export default function HomePage() {
  return (
    <PublicShell>
      <main id="main-content">
        <section className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-12">
          <div>
            <div className="border-primary/15 bg-primary-soft/55 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase">
              <span className="bg-gold size-2 rounded-full" />
              The University for Human Potential
            </div>
            <h1 className="text-navy mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.055em] text-balance sm:text-7xl lg:text-[5.35rem]">
              Your potential deserves a path into the real world.
            </h1>
            <p className="text-muted mt-7 max-w-2xl text-lg leading-8 sm:text-xl">
              Discover who you are, develop what you carry and deploy it through
              real-world action. PipuPath turns self-understanding into a
              Mission, a Journey, practical Quests and credible proof.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/signup" className="min-w-44">
                Start Your Journey
              </ButtonLink>
              <ButtonLink
                href="/login"
                variant="secondary"
                className="min-w-32"
              >
                Sign In
              </ButtonLink>
            </div>
            <div className="text-muted mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <Check /> Private by default
              </span>
              <span className="inline-flex items-center gap-2">
                <Check /> Built around real action
              </span>
              <span className="inline-flex items-center gap-2">
                <Check /> Designed for youths and adults
              </span>
            </div>
          </div>

          <PathVisual />
        </section>

        <section id="how-it-works" className="border-border bg-soft border-y">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
            <SectionHeading
              eyebrow="How PipuPath Works"
              title="One connected path from self-discovery to useful proof."
              description="Each stage grows from verified work in the stage before it. You always know what you have completed and what comes next."
            />
            <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {pathway.map(([title, description], index) => (
                <li
                  key={title}
                  className={
                    index === pathway.length - 1 ? "lg:col-span-2" : ""
                  }
                >
                  <Surface className="h-full p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="bg-primary-soft text-primary grid size-10 place-items-center rounded-2xl font-mono text-sm font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {index < pathway.length - 1 ? (
                        <span className="text-primary-light hidden text-xl lg:block">
                          →
                        </span>
                      ) : (
                        <span className="text-gold text-lg">◆</span>
                      )}
                    </div>
                    <h3 className="text-navy mt-5 text-xl font-semibold">
                      {title}
                    </h3>
                    <p className="text-muted mt-3 text-sm leading-6">
                      {description}
                    </p>
                  </Surface>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="What you receive"
            title="A complete developmental operating system—not another motivation app."
            description="PipuPath joins reflection, structure and evidence so your growth can become useful beyond the platform."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coreValue.map(([title, description], index) => (
              <Surface
                key={title}
                className="group p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="border-gold/35 bg-gold/10 text-gold grid size-10 place-items-center rounded-2xl border font-mono text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-navy text-lg font-semibold">{title}</h3>
                </div>
                <p className="text-muted mt-4 leading-7">{description}</p>
              </Surface>
            ))}
          </div>
        </section>

        <section className="bg-navy text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div>
              <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
                Who it is for
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                For people who know potential must become contribution.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                You do not need to have everything figured out. You need the
                courage to examine your evidence, choose a direction and take
                the next honest step.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {audiences.map((audience) => (
                <div
                  key={audience}
                  className="rounded-3xl border border-white/10 bg-white/6 p-6"
                >
                  <span className="bg-primary-light mb-5 block size-2.5 rounded-full" />
                  <p className="text-lg leading-7 font-semibold">{audience}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="Built for trust"
            title="You remain the author of your identity and your public story."
            description="PipuPath protects private developmental work while making every visible progress claim traceable to real action."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(([title, description]) => (
              <div
                key={title}
                className="border-primary/10 bg-primary-soft/35 rounded-3xl border p-6"
              >
                <Check large />
                <h3 className="text-navy mt-5 text-lg font-semibold">
                  {title}
                </h3>
                <p className="text-muted mt-3 text-sm leading-6">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
          <div className="from-primary to-primary-light shadow-primary/20 relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br px-6 py-14 text-center text-white shadow-2xl sm:px-12 sm:py-20">
            <div className="absolute -top-32 -left-24 size-80 rounded-full border border-white/15" />
            <div className="absolute -right-20 -bottom-36 size-96 rounded-full bg-white/10 blur-2xl" />
            <div className="relative mx-auto max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.16em] text-blue-100 uppercase">
                Your next step can be practical
              </p>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
                Do not wait to discover your whole future. Begin the next honest
                step.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-50">
                Start privately. Build through action. Present only the proof
                you choose.
              </p>
              <ButtonLink
                href="/signup"
                variant="premium"
                className="mt-8 min-w-48"
              >
                Start Your Journey
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-navy mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="text-muted mt-5 text-lg leading-8">{description}</p>
    </div>
  );
}

function Check({ large = false }: { large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-primary-soft text-primary inline-grid place-items-center rounded-full font-bold ${large ? "size-10 text-base" : "size-5 text-xs"}`}
    >
      ✓
    </span>
  );
}

function PathVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="bg-primary/10 absolute top-10 right-5 size-52 rounded-full blur-3xl" />
      <div className="bg-gold/15 absolute bottom-5 left-0 size-44 rounded-full blur-3xl" />
      <Surface className="relative overflow-hidden p-5 sm:p-7">
        <div className="border-border flex items-center justify-between border-b pb-5">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Your Builder Path
            </p>
            <p className="text-navy mt-2 text-lg font-semibold">
              Potential becomes useful step by step.
            </p>
          </div>
          <span className="border-gold/35 bg-gold/10 text-gold rounded-full border px-3 py-1.5 text-xs font-semibold">
            Private
          </span>
        </div>
        <div className="mt-6 space-y-3">
          {[
            ["Discover", "Understand your patterns", "complete"],
            ["Mission", "Choose a useful direction", "active"],
            ["Journey", "Follow clear milestones", "next"],
            ["Quests", "Act, prove and reflect", "future"],
            ["Project", "Build something useful", "future"],
          ].map(([title, copy, status], index) => (
            <div
              key={title}
              className={`flex items-center gap-4 rounded-2xl border p-4 ${status === "active" ? "border-primary/30 bg-primary-soft/60" : "border-border bg-soft/55"}`}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-2xl font-mono text-sm font-bold ${status === "complete" ? "bg-success/10 text-success" : status === "active" ? "bg-primary text-white" : "text-muted bg-white"}`}
              >
                {status === "complete" ? "✓" : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-navy font-semibold">{title}</p>
                <p className="text-muted mt-0.5 text-sm">{copy}</p>
              </div>
              {status === "active" ? (
                <span className="text-primary text-xs font-semibold uppercase">
                  Now
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
