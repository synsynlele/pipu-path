import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/202609030001_stage_29_builder_network.sql",
  ),
  "utf8",
);
const collaborationMigration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/202609030002_stage_29_school_collaboration.sql",
  ),
  "utf8",
);
const hardeningMigration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/202609030003_stage_29_network_hardening.sql",
  ),
  "utf8",
);
const worldPage = readFileSync(
  join(process.cwd(), "src/app/connect/world/page.tsx"),
  "utf8",
);
const messagesPage = readFileSync(
  join(process.cwd(), "src/app/connect/messages/page.tsx"),
  "utf8",
);
const normalizedMessagesPage = messagesPage.replace(/\s+/g, " ");
const schoolPage = readFileSync(
  join(process.cwd(), "src/app/institution/network/page.tsx"),
  "utf8",
);
const navigation = readFileSync(
  join(process.cwd(), "src/components/navigation/app-navigation.tsx"),
  "utf8",
);

describe("Stage 29 Builder Network structure", () => {
  it("keeps every social table behind RLS and controlled RPCs", () => {
    for (const table of [
      "builder_network_school_settings",
      "builder_network_participation",
      "builder_network_posts",
      "builder_network_comments",
      "builder_network_reactions",
      "builder_network_conversations",
      "builder_network_messages",
      "builder_network_message_reads",
      "builder_network_reports",
    ]) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
    }
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).not.toMatch(
      /grant\s+(select|insert|update|delete)[^;]*builder_network_[^;]*authenticated/i,
    );
  });

  it("separates adult and school scopes and excludes under-13 networking", () => {
    expect(migration).toContain("scope in ('adult', 'school')");
    expect(migration).toContain("profile.age_band in ('13_15', '16_17')");
    expect(migration).not.toContain("profile.age_band in ('under_13'");
    expect(migration).toContain(
      "if first_scope <> 'school' or second_scope <> 'school' then return false",
    );
    expect(schoolPage).toContain("Under-13 accounts remain excluded");
  });

  it("requires mutual school permission for cross-school visibility", () => {
    expect(migration).toContain("first_settings.cross_school_enabled");
    expect(migration).toContain("second_settings.cross_school_enabled");
    expect(schoolPage).toContain("Both schools must enable this setting");
  });

  it("requires an accepted relationship before private messaging", () => {
    expect(migration).toContain("connection.status = 'accepted'");
    expect(migration).toContain("stage29_pair_message_allowed");
    expect(normalizedMessagesPage).toContain(
      "accepted, currently authorised Builder connections",
    );
  });

  it("uses a bounded developmental feed rather than popularity mechanics", () => {
    expect(migration).toContain(
      "limit greatest(1, least(coalesce(limit_input, 24), 40))",
    );
    expect(worldPage).toContain("Finite feed · purposeful interaction");
    expect(worldPage).toContain("No popularity game");
    expect(worldPage).not.toContain("followers");
    expect(worldPage).not.toContain("infinite");
  });

  it("makes Builder World the primary Connect destination without deleting legacy Connect", () => {
    expect(navigation).toContain('{ label: "Connect", href: "/connect/world"');
    expect(worldPage).toContain('href="/connect"');
    expect(worldPage).toContain("Connect home");
  });

  it("lets school owners self-manage the network boundary", () => {
    expect(migration).toContain("INSTITUTION_OWNER_REQUIRED");
    expect(migration).toContain("builder_network_settings_updated");
    expect(schoolPage).toContain("Save network policy");
    expect(schoolPage).toContain("only an Institution Workspace owner");
  });

  it("allows evidence collaboration for protected school pairs without weakening Stage 11 contact sharing", () => {
    expect(collaborationMigration).toContain(
      "stage29_collaboration_pair_allowed",
    );
    expect(collaborationMigration).toContain("stage29_pair_visible");
    expect(collaborationMigration).not.toContain("share_stage11_contact");
  });

  it("enforces deterministic server-side anti-spam limits", () => {
    expect(hardeningMigration).toContain("stage29_assert_write_rate_limit");
    expect(hardeningMigration).toContain("BUILDER_NETWORK_RATE_LIMITED");
    expect(hardeningMigration).toContain("action_input = 'post'");
    expect(hardeningMigration).toContain("action_input = 'comment'");
    expect(hardeningMigration).toContain("action_input = 'message'");
    expect(hardeningMigration).toContain(
      "created_at >= now() - interval '10 minutes'",
    );
  });

  it("validates report references against the reported Builder and visible context", () => {
    expect(hardeningMigration).toContain(
      "num_nonnulls(post_id_input, comment_id_input, message_id_input) > 1",
    );
    expect(hardeningMigration).toContain(
      "post.author_id = target_user_id_input",
    );
    expect(hardeningMigration).toContain(
      "comment.author_id = target_user_id_input",
    );
    expect(hardeningMigration).toContain(
      "message.sender_id = target_user_id_input",
    );
    expect(hardeningMigration).toContain(
      "BUILDER_NETWORK_REPORT_CONTEXT_INVALID",
    );
  });

  it("returns the full visible comment total while keeping only a small preview", () => {
    expect(hardeningMigration).toContain("stage29_visible_comment_count");
    expect(hardeningMigration).toContain("'{commentCount}'");
    expect(migration).toContain("limit 3");
  });

  it("surfaces native report and block controls inside Builder World", () => {
    expect(worldPage).toContain("reportBuilderNetworkAction");
    expect(worldPage).toContain("Submit report");
    expect(worldPage).toContain('name="action" value="block"');
    expect(worldPage).toContain("Block");
  });
});
