import type {
  BuilderGuideContext,
  BuilderGuideDestination,
  BuilderGuideIntent,
  BuilderGuideOutput,
} from "../domain/builder-guide-contract";

function destinationFor(context: BuilderGuideContext): BuilderGuideDestination {
  if (context.current.quest) return "current_quest";
  if (context.current.project) return "current_project";
  if (context.current.journey) return "journey";
  if (context.availableDestinations.includes("build")) return "build";
  return "profile";
}

function destinationLabel(destination: BuilderGuideDestination) {
  switch (destination) {
    case "current_quest":
      return "Continue your current Quest";
    case "current_project":
      return "Move your current Project forward";
    case "journey":
      return "Continue your Journey";
    case "connect":
      return "Use Connect deliberately";
    case "build":
      return "Create the next proof";
    default:
      return "Review your evidence";
  }
}

function nextInstruction(
  context: BuilderGuideContext,
  destination: BuilderGuideDestination,
) {
  if (destination === "current_quest" && context.current.quest) {
    return `Continue “${context.current.quest.title}” and finish the required action, evidence and reflection before starting something new.`;
  }
  if (destination === "current_project" && context.current.project) {
    return `Continue “${context.current.project.title}” and complete the next unfinished project milestone with observable proof.`;
  }
  if (destination === "journey" && context.current.journey) {
    return `Open “${context.current.journey.title}” and move the current milestone forward with one concrete action you can complete.`;
  }
  if (destination === "build") {
    return "Choose one useful problem that fits your current direction and create a small project that can produce observable evidence.";
  }
  return "Review the evidence in your Living Builder Profile and choose one capability that needs another real-world test.";
}

function evidenceToCreate(destination: BuilderGuideDestination) {
  if (destination === "current_quest") {
    return "Complete the Quest evidence and Nortnspoil reflection required by PipuPath.";
  }
  if (destination === "current_project") {
    return "Complete the next Project milestone and preserve the proof of what changed.";
  }
  if (destination === "journey") {
    return "Finish one Journey action that results in a recorded Quest or Project proof.";
  }
  if (destination === "build") {
    return "Produce a small completed Project with observable evidence and a reflection on what you learned.";
  }
  return "Create another completed action that can support or challenge one current capability claim.";
}

function sortedCapabilities(context: BuilderGuideContext) {
  return [...context.livingProfile.capabilities].sort((a, b) => {
    if (a.totalStrength !== b.totalStrength) return b.totalStrength - a.totalStrength;
    return b.evidenceCount - a.evidenceCount;
  });
}

export function buildEvidenceBasedBuilderGuide(
  context: BuilderGuideContext,
  intent: BuilderGuideIntent,
): BuilderGuideOutput {
  const destination = destinationFor(context);
  const strongest = sortedCapabilities(context)[0] ?? null;
  const developing = [...context.livingProfile.capabilities]
    .sort((a, b) => {
      if (a.totalStrength !== b.totalStrength) return a.totalStrength - b.totalStrength;
      return a.evidenceCount - b.evidenceCount;
    })[0] ?? null;
  const selectedPath = context.selectedPath;

  const evidenceObservations = strongest
    ? [
        {
          claimId: strongest.id,
          observation: `${strongest.label} is currently ${strongest.level.replaceAll("_", " ")} with ${strongest.evidenceCount} supporting evidence record${strongest.evidenceCount === 1 ? "" : "s"}.`,
        },
      ]
    : [];

  if (intent === "improvement") {
    return {
      schemaVersion: "builder-guide-v1",
      intent,
      title: strongest
        ? `Your clearest evidence is growing around ${strongest.label}`
        : "Your next improvement will become clearer through completed action",
      summary: strongest
        ? `Your Living Builder Profile currently has the strongest completed evidence around ${strongest.label}. Treat that as a working signal, not a permanent label, and keep testing it in different situations.`
        : "PipuPath does not yet have enough completed action evidence to make a strong improvement observation. The most useful move is to complete a small piece of work that creates proof.",
      evidenceObservations,
      focus: {
        label: strongest ? `Test ${strongest.label} again` : "Create the first strong signal",
        rationale: strongest
          ? "Repeated evidence across different actions is more useful than a single strong result when deciding what is genuinely developing."
          : "A completed action gives PipuPath something concrete to learn from instead of relying only on intention.",
      },
      nextAction: {
        title: destinationLabel(destination),
        instruction: nextInstruction(context, destination),
        evidenceToCreate: evidenceToCreate(destination),
        destination,
      },
      challenge:
        "Do not confuse one successful result with a permanent identity. Look for repeatable evidence across different contexts.",
      uncertainty:
        "This guidance is based only on evidence already recorded in PipuPath and cannot see skills or progress you have not yet demonstrated here.",
    };
  }

  if (intent === "missing_evidence") {
    const target = developing ?? strongest;
    return {
      schemaVersion: "builder-guide-v1",
      intent,
      title: target
        ? `${target.label} needs another useful test`
        : "Your profile needs more completed evidence",
      summary: target
        ? `${target.label} currently has ${target.evidenceCount} supporting evidence record${target.evidenceCount === 1 ? "" : "s"}. The next useful question is whether you can demonstrate it again through a completed action rather than merely describe it.`
        : "Your Living Builder Profile has too little completed evidence to identify a specific gap confidently. Start by finishing one meaningful Quest or Project and preserving the proof.",
      evidenceObservations: target
        ? [
            {
              claimId: target.id,
              observation: `${target.label} is supported by ${target.evidenceCount} current evidence record${target.evidenceCount === 1 ? "" : "s"}, so another completed test would make the signal more informative.`,
            },
          ]
        : [],
      focus: {
        label: target ? `Strengthen evidence for ${target.label}` : "Build observable evidence",
        rationale:
          "PipuPath should strengthen capability claims from completed proof, not from confidence, aspiration or repeated self-description.",
      },
      nextAction: {
        title: destinationLabel(destination),
        instruction: nextInstruction(context, destination),
        evidenceToCreate: evidenceToCreate(destination),
        destination,
      },
      challenge:
        "Choose an action that could genuinely confirm or challenge the capability instead of designing a task that can only make you look successful.",
      uncertainty:
        "Missing evidence in PipuPath does not mean the capability is absent; it means the platform does not yet have enough completed proof to support a stronger claim.",
    };
  }

  if (intent === "weekly_focus") {
    return {
      schemaVersion: "builder-guide-v1",
      intent,
      title: "Make this week produce one meaningful proof",
      summary: selectedPath
        ? `Your selected direction is ${selectedPath.name}. Keep this week narrow: move the current work forward and create evidence that helps test whether that direction fits in practice.`
        : "Keep this week narrow: move the current work forward and create one completed piece of evidence before adding another goal.",
      evidenceObservations,
      focus: {
        label: context.current.quest
          ? context.current.quest.title
          : context.current.project
            ? context.current.project.title
            : selectedPath?.name ?? "One completed development action",
        rationale:
          "Finishing one proof-bearing action gives you more useful information than spreading effort across several unfinished intentions.",
      },
      nextAction: {
        title: destinationLabel(destination),
        instruction: nextInstruction(context, destination),
        evidenceToCreate: evidenceToCreate(destination),
        destination,
      },
      challenge:
        "Before adding a new goal this week, ask whether the current action has produced evidence you can point to.",
      uncertainty:
        "This weekly focus uses the current state recorded in PipuPath and may not include commitments or constraints that exist outside the platform.",
    };
  }

  return {
    schemaVersion: "builder-guide-v1",
    intent,
    title: context.current.quest
      ? `Your next move is to finish ${context.current.quest.title}`
      : context.current.project
        ? `Move ${context.current.project.title} to the next proof point`
        : "Turn your current direction into the next piece of evidence",
    summary: selectedPath
      ? `You have selected ${selectedPath.name}. The best next move is the nearest proof-bearing action already in your PipuPath journey, not a new abstract plan.`
      : "The best next move is the nearest proof-bearing action already in your PipuPath journey, not another abstract plan.",
    evidenceObservations,
    focus: {
      label: destinationLabel(destination),
      rationale:
        "PipuPath learns more about your development when you complete a real action and preserve evidence than when you add another intention.",
    },
    nextAction: {
      title: destinationLabel(destination),
      instruction: nextInstruction(context, destination),
      evidenceToCreate: evidenceToCreate(destination),
      destination,
    },
    challenge:
      "Finish the smallest meaningful proof before expanding the scope or switching to a new direction.",
    uncertainty:
      "This recommendation is based on your current PipuPath evidence and workflow state; it does not know constraints or opportunities you have not recorded here.",
  };
}
