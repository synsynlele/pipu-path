import "server-only";
import { createHash } from "node:crypto";
import { REAL_BUILD_CONTENT_VERSION, type BuildChoice } from "../domain/build";
import { discoverySchema } from "../domain/discovery";
export function buildGoalKey(choice: BuildChoice) {
  const goal = choice.focus
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const discovery = choice.discovery
    ? discoverySchema.parse(choice.discovery)
    : undefined;
  // Stable key order; never mix goals with different constraints or retain raw prose in keys.
  const context = discovery
    ? ":" +
      JSON.stringify([
        discovery.kind,
        discovery.setting,
        discovery.obstacle,
        discovery.resources,
      ])
    : "";
  return createHash("sha256")
    .update(REAL_BUILD_CONTENT_VERSION + ":" + goal + context)
    .digest("hex");
}
