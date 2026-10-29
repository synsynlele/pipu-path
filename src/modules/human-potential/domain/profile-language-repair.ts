import { humanPotentialProfileOutputSchema } from "./profile-contract";

type Profile = ReturnType<typeof humanPotentialProfileOutputSchema.parse>;
type Field = "title" | "summary" | "explanation";
export type ProfileLanguageRepair = {
  profile: Profile;
  fields: {
    id: string;
    path: string;
    index: number | null;
    key: Field;
    value: string;
    maxLength: number;
  }[];
};
/** Only existing display prose may be patched. Evidence, identity and scores are immutable. */
export function prepareProfileLanguageRepair(
  output: unknown,
  issues: string[],
): ProfileLanguageRepair | null {
  const parsed = humanPotentialProfileOutputSchema.safeParse(output);
  if (!parsed.success || !issues.length || issues.length > 8) return null;
  const fields: ProfileLanguageRepair["fields"] = [];
  for (const issue of issues) {
    const [path, rule] = issue.split(":");
    if (!["fixed_identity", "shaming", "prohibited_claim"].includes(rule))
      return null;
    if (path === "summary") {
      fields.push({
        id: "summary",
        path,
        index: null,
        key: "summary",
        value: parsed.data.summary,
        maxLength: 1200,
      });
      continue;
    }
    const match = /^insights\.(\d+)\.(title|summary|explanation)$/.exec(path);
    if (!match) return null;
    const index = Number(match[1]);
    const key = match[2] as Field;
    const insight = parsed.data.insights[index];
    if (!insight) return null;
    fields.push({
      id: `insight_${index}_${key}`,
      path,
      index,
      key,
      value: insight[key],
      maxLength: key === "title" ? 120 : key === "summary" ? 320 : 1200,
    });
  }
  return {
    profile: parsed.data,
    fields: fields.filter(
      (field, index) =>
        fields.findIndex((other) => other.id === field.id) === index,
    ),
  };
}
export function applyProfileLanguageRepair(
  repair: ProfileLanguageRepair,
  patch: unknown,
): Profile | null {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return null;
  const values = patch as Record<string, unknown>;
  if (
    Object.keys(values).length !== repair.fields.length ||
    Object.keys(values).some(
      (key) => !repair.fields.some((field) => field.id === key),
    )
  )
    return null;
  if (
    repair.fields.some(
      (field) =>
        typeof values[field.id] !== "string" ||
        !(values[field.id] as string).trim() ||
        (values[field.id] as string).length > field.maxLength,
    )
  )
    return null;
  const result = structuredClone(repair.profile);
  for (const field of repair.fields) {
    if (field.index === null) result.summary = values[field.id] as string;
    else result.insights[field.index][field.key] = values[field.id] as string;
  }
  return result;
}
