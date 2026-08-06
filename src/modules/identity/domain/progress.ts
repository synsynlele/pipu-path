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
      label: "Complete identity setup",
      description:
        "Set the minimum identity and consent information PipuPath needs.",
    };
  }

  if (!snapshot.discoveryStatus || snapshot.discoveryStatus === "in_progress") {
    return {
      stage: "discovery",
      path: "/onboarding/discovery",
      label: snapshot.discoveryStatus
        ? "Continue Discovery"
        : "Begin Discovery",
      description:
        "Complete the 15 questions that create your private evidence base.",
    };
  }

  if (snapshot.discoveryStatus === "review") {
    return {
      stage: "discovery-review",
      path: "/onboarding/discovery/review",
      label: "Review Discovery",
      description: "Check your answers before completing Discovery.",
    };
  }

  if (!snapshot.hasHumanPotentialProfile) {
    return {
      stage: "potential-profile",
      path: "/onboarding/discovery/profile",
      label: "Generate your Potential Profile",
      description:
        "Turn completed Discovery evidence into a private, reviewable profile.",
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
          ? "Activate your Mission"
          : "Choose your Mission",
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
          ? "Activate your Journey"
          : "Build your Journey",
      description: "Turn your Mission into a realistic sequence of milestones.",
    };
  }

  if (snapshot.activeProjectId) {
    return {
      stage: "project",
      path: `/projects/${snapshot.activeProjectId}`,
      label: "Continue your Builder Project",
      description:
        "Advance the active Project through its next evidence-backed milestone.",
    };
  }

  if (snapshot.completedProjectId && snapshot.journeyStatus === "completed") {
    return {
      stage: "journey",
      path: "/journey",
      label: "Build your next Journey",
      description:
        "Use completed Project evidence to open the next growth cycle. Public Portfolio proof remains optional.",
    };
  }

  if (snapshot.completedProjectId) {
    return {
      stage: "complete",
      path: "/app",
      label: "Open your Home",
      description:
        "Your Builder evidence is available from one clear home.",
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
