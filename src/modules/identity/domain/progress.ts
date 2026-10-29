export type DiscoveryProgressStatus =
  "in_progress" | "review" | "completed" | null;

export type MissionProgressStatus =
  "draft" | "active" | "paused" | "completed" | "replaced" | null;

export type JourneyProgressStatus = MissionProgressStatus;
export type PortfolioProgressStatus =
  "draft" | "published" | "withdrawn" | null;

export type AuthenticatedProgressSnapshot = {
  authenticated: boolean;
  identityComplete: boolean;
  discoveryStatus: DiscoveryProgressStatus;
  hasHumanPotentialProfile: boolean;
  missionStatus: MissionProgressStatus;
  journeyStatus: JourneyProgressStatus;
  activeProjectId: string | null;
  completedProjectId: string | null;
  portfolioStatus: PortfolioProgressStatus;
};

export type ProgressDestination = {
  stage:
    | "sign-in"
    | "identity"
    | "discovery"
    | "discovery-review"
    | "potential-profile"
    | "mission"
    | "journey"
    | "quests"
    | "project"
    | "portfolio"
    | "complete";
  path: string;
  label: string;
  description: string;
};

export function progressDestination(
  snapshot: AuthenticatedProgressSnapshot,
): ProgressDestination {
  if (!snapshot.authenticated) {
    return {
      stage: "sign-in",
      path: "/login",
      label: "Sign in",
      description: "Enter your private PipuPath journey.",
    };
  }

  if (!snapshot.identityComplete) {
    return {
      stage: "identity",
      path: "/onboarding/identity",
      label: "Set up my account",
      description: "Choose a name, your age group and your privacy choices.",
    };
  }

  if (!snapshot.discoveryStatus || snapshot.discoveryStatus === "in_progress") {
    return {
      stage: "discovery",
      path: "/onboarding/discovery",
      label: snapshot.discoveryStatus
        ? "Continue my introduction"
        : "Find my starting point",
      description:
        "Answer one short question at a time. Your answers save as you go.",
    };
  }

  if (snapshot.discoveryStatus === "review") {
    return {
      stage: "discovery-review",
      path: "/onboarding/discovery/review",
      label: "Check my answers",
      description: "Check your answers before completing Discovery.",
    };
  }

  if (!snapshot.hasHumanPotentialProfile) {
    return {
      stage: "potential-profile",
      path: "/onboarding/discovery/profile",
      label: "Create my starting profile",
      description:
        "Use your answers to find a practical starting direction. You can review it.",
    };
  }

  if (
    !snapshot.missionStatus ||
    snapshot.missionStatus === "draft" ||
    snapshot.missionStatus === "paused" ||
    snapshot.missionStatus === "replaced"
  ) {
    return {
      stage: "mission",
      path: "/mission",
      label:
        snapshot.missionStatus === "draft"
          ? "Choose this direction"
          : "Choose my direction",
      description: "Choose one practical direction for your current season.",
    };
  }

  if (
    !snapshot.journeyStatus ||
    snapshot.journeyStatus === "draft" ||
    snapshot.journeyStatus === "paused" ||
    snapshot.journeyStatus === "replaced"
  ) {
    return {
      stage: "journey",
      path: "/journey",
      label:
        snapshot.journeyStatus === "draft"
          ? "Use this plan"
          : "Make my action plan",
      description:
        "Break your direction into small results you can try in real life.",
    };
  }

  if (snapshot.activeProjectId) {
    return {
      stage: "project",
      path: `/projects/${snapshot.activeProjectId}`,
      label: "Continue your Builder Project",
      description: "Keep building, test what works and record real results.",
    };
  }

  if (snapshot.completedProjectId && snapshot.journeyStatus === "completed") {
    return {
      stage: "journey",
      path: "/journey",
      label: "Plan my next build",
      description:
        "Use completed Project evidence to open the next growth cycle. Public Portfolio proof remains optional.",
    };
  }

  if (snapshot.completedProjectId) {
    return {
      stage: "complete",
      path: "/app",
      label: "Open your Home",
      description: "Your Builder evidence is available from one clear home.",
    };
  }

  if (snapshot.journeyStatus === "active") {
    return {
      stage: "quests",
      path: "/quests",
      label: "Continue your next Quest",
      description:
        "Take real-world action, submit proof and reflect on what changed.",
    };
  }

  return {
    stage: "project",
    path: "/projects",
    label: "Build your first Project",
    description:
      "Convert completed Quest proof into something useful for real people.",
  };
}
