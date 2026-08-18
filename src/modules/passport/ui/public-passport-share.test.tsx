import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublicPassportShare } from "./public-passport-share";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const shareId = "44444444-4444-4444-8444-444444444444";
const secret = `ppsp_${"A".repeat(43)}`;

const passport = {
  schemaVersion: "builder-passport.v1" as const,
  passportId: "33333333-3333-4333-8333-333333333333",
  version: 2,
  issuedAt: "2026-08-18T10:00:00.000Z",
  builder: {
    displayName: "Ada Builder",
    publicSummary: "Builder working on useful community systems.",
    selectedPathName: "Community systems",
  },
  capabilities: [
    {
      capabilityKey: "systems-thinking",
      capabilityLabel: "Systems thinking",
      capabilityLevel: "repeatedly_demonstrated",
    },
  ],
  evidence: [
    {
      capabilityKey: "systems-thinking",
      sourceType: "project",
      sourceTitle: "Community map",
      evidenceSummary:
        "Mapped a community problem and tested a practical response.",
      verification: "pipupath_action",
      occurredAt: "2026-08-01T10:00:00.000Z",
    },
  ],
  institutionVerifications: [
    {
      capabilityKey: "systems-thinking",
      capabilityLabel: "Systems thinking",
      institutionName: "KAEC Nigerian Schools",
      confirmedAt: "2026-08-10T10:00:00.000Z",
      current: false,
    },
  ],
  portfolioProofs: [
    {
      slug: "community-map",
      publicTitle: "Community Map",
      publicSummary: "A public proof of a completed community systems project.",
      proofHref: null,
      current: false,
    },
  ],
  integrity: {
    state: "changed" as const,
    checkedAt: "2026-08-18T11:00:00.000Z",
    notices: ["An institution confirmation has changed since issuance."],
  },
  share: { expiresAt: "2026-08-25T10:00:00.000Z" },
};

describe("PublicPassportShare", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState(null, "", `/passport/share/${shareId}`);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("fails closed when the fragment bearer is missing", async () => {
    render(<PublicPassportShare shareId={shareId} />);

    expect(screen.getByText("Verifying this Passport…")).toBeInTheDocument();
    await screen.findByRole("heading", {
      name: "This Passport share is not available.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("moves the fragment secret into Authorization and clears it from browser history", async () => {
    window.history.replaceState(
      null,
      "",
      `/passport/share/${shareId}?source=test#${secret}`,
    );
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(passport), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    render(<PublicPassportShare shareId={shareId} />);

    await screen.findByRole("heading", { name: "Ada Builder" });
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/passport/v1/shares/${shareId}`,
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      }),
    );
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?source=test");
  });

  it("renders only the allow-listed snapshot and changed-integrity notices", async () => {
    window.history.replaceState(
      null,
      "",
      `/passport/share/${shareId}#${secret}`,
    );
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(passport), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    render(<PublicPassportShare shareId={shareId} />);

    await screen.findByRole("heading", { name: "Ada Builder" });
    expect(screen.getByText("Community systems")).toBeInTheDocument();
    expect(screen.getByText("Systems thinking")).toBeInTheDocument();
    expect(screen.getByText("Community map")).toBeInTheDocument();
    expect(screen.getByText(/confirmation changed/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "An institution confirmation has changed since issuance.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This public proof is no longer currently published."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/contact_email/i)).not.toBeInTheDocument();
  });

  it("shows current Portfolio proof links only while source integrity is current", async () => {
    const currentPassport = {
      ...passport,
      integrity: {
        ...passport.integrity,
        state: "current" as const,
        notices: [],
      },
      institutionVerifications: passport.institutionVerifications.map(
        (item) => ({
          ...item,
          current: true,
        }),
      ),
      portfolioProofs: passport.portfolioProofs.map((proof) => ({
        ...proof,
        current: true,
        proofHref: "/proof/community-map",
      })),
    };
    window.history.replaceState(
      null,
      "",
      `/passport/share/${shareId}#${secret}`,
    );
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(currentPassport), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    render(<PublicPassportShare shareId={shareId} />);

    const link = await screen.findByRole("link", {
      name: "View current public proof",
    });
    expect(link).toHaveAttribute("href", "/proof/community-map");
    expect(screen.getByText(/currently confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/Integrity: Current/i)).toBeInTheDocument();
  });

  it("uses the same unavailable response for invalid bearer and network failure", async () => {
    window.history.replaceState(
      null,
      "",
      `/passport/share/${shareId}#${secret}`,
    );
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    const first = render(<PublicPassportShare shareId={shareId} />);
    await screen.findByRole("heading", {
      name: "This Passport share is not available.",
    });
    first.unmount();

    window.history.replaceState(
      null,
      "",
      `/passport/share/${shareId}#${secret}`,
    );
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<PublicPassportShare shareId={shareId} />);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: "This Passport share is not available.",
        }),
      ).toBeInTheDocument(),
    );
  });
});
