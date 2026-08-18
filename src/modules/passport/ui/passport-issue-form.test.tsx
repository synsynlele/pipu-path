import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BuilderPassportWorkspace } from "../infrastructure/passport-dal";
import { PassportIssueForm } from "./passport-issue-form";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("../application/passport-actions", () => ({
  issuePassportAction: vi.fn(async () => ({ error: null })),
}));

const claimId = "11111111-1111-4111-8111-111111111111";
const evidenceId = "22222222-2222-4222-8222-222222222222";
const verificationId = "33333333-3333-4333-8333-333333333333";
const portfolioId = "44444444-4444-4444-8444-444444444444";

const workspace: BuilderPassportWorkspace = {
  adultEligible: true,
  profile: { displayName: "Ada Builder" },
  activeProfileVersionId: "55555555-5555-4555-8555-555555555555",
  eligibleCapabilities: [
    {
      claimId,
      capabilityKey: "systems-thinking",
      capabilityLabel: "Systems thinking",
      capabilityLevel: "demonstrated",
    },
  ],
  eligibleEvidence: [
    {
      evidenceId,
      claimId,
      capabilityKey: "systems-thinking",
      sourceType: "project",
      sourceTitle: "Community map",
      evidenceSummary: "Mapped a local problem and tested a practical response.",
      verification: "pipupath_action",
      occurredAt: "2026-08-01T10:00:00.000Z",
    },
  ],
  eligibleInstitutionVerifications: [
    {
      verificationId,
      claimId,
      capabilityKey: "systems-thinking",
      capabilityLabel: "Systems thinking",
      institutionName: "KAEC Nigerian Schools",
      confirmedAt: "2026-08-10T10:00:00.000Z",
    },
  ],
  eligiblePortfolioProofs: [
    {
      portfolioId,
      slug: "community-map",
      publicTitle: "Community Map",
      publicSummary: "A public proof of the completed community mapping project.",
      proofHref: "/proof/community-map",
      publishedAt: "2026-08-12T10:00:00.000Z",
    },
  ],
  passports: [
    {
      id: "66666666-6666-4666-8666-666666666666",
      version: 1,
      status: "issued",
      displayName: "Ada Builder",
      publicSummary: null,
      selectedPathName: null,
      issuedAt: "2026-08-15T10:00:00.000Z",
      supersededAt: null,
      revokedAt: null,
    },
  ],
  shares: [],
};

afterEach(cleanup);

describe("PassportIssueForm", () => {
  it("requires exact capability proof and explicit consent before issuance", () => {
    render(<PassportIssueForm workspace={workspace} />);

    expect(screen.getByText("You already have Passport v1.")).toBeInTheDocument();
    const submit = screen.getByRole("button", {
      name: "Issue new Passport version",
    });
    const claim = screen.getByRole("checkbox", { name: /Systems thinking demonstrated/i });
    const evidence = screen.getByRole("checkbox", { name: /Community map/i });
    const institution = screen.getByRole("checkbox", {
      name: /Confirmed by KAEC Nigerian Schools/i,
    });
    const portfolio = screen.getByRole("checkbox", { name: /Community Map/i });
    const consent = screen.getByRole("checkbox", {
      name: /I reviewed this exact Passport/i,
    });

    expect(evidence).toBeDisabled();
    expect(institution).toBeDisabled();
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox", { name: /Public-safe Builder summary/i }), {
      target: { value: "I build practical systems with communities." },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Selected pathway label/i }), {
      target: { value: "Systems builder" },
    });
    fireEvent.click(claim);

    expect(evidence).toBeEnabled();
    expect(institution).toBeEnabled();

    fireEvent.click(evidence);
    fireEvent.click(institution);
    fireEvent.click(portfolio);
    fireEvent.click(consent);

    expect(submit).toBeEnabled();
    expect(screen.getByText("Systems builder")).toBeInTheDocument();
    expect(
      screen.getByText("I build practical systems with communities."),
    ).toBeInTheDocument();
    expect(screen.getByText("Evidence shared")).toBeInTheDocument();
    expect(screen.getByText("Institution confirmations shared")).toBeInTheDocument();
    expect(screen.getByText("Portfolio proofs shared")).toBeInTheDocument();
  });

  it("removes dependent evidence and institution confirmation when its capability is deselected", () => {
    render(<PassportIssueForm workspace={workspace} />);

    const claim = screen.getByRole("checkbox", { name: /Systems thinking demonstrated/i });
    const evidence = screen.getByRole("checkbox", { name: /Community map/i });
    const institution = screen.getByRole("checkbox", {
      name: /Confirmed by KAEC Nigerian Schools/i,
    });

    fireEvent.click(claim);
    fireEvent.click(evidence);
    fireEvent.click(institution);
    expect(screen.getByText("Evidence shared")).toBeInTheDocument();
    expect(screen.getByText("Institution confirmations shared")).toBeInTheDocument();

    fireEvent.click(claim);

    expect(evidence).not.toBeChecked();
    expect(evidence).toBeDisabled();
    expect(institution).not.toBeChecked();
    expect(institution).toBeDisabled();
    expect(screen.queryByText("Evidence shared")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Institution confirmations shared"),
    ).not.toBeInTheDocument();
  });

  it("keeps issuance disabled for an ineligible Builder", () => {
    render(
      <PassportIssueForm workspace={{ ...workspace, adultEligible: false }} />,
    );

    expect(
      screen.getByRole("heading", {
        name: "External Passport sharing is not available.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Issue new Passport version" }),
    ).toBeDisabled();
  });
});
