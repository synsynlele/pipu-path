/** Recognise explicit cautions without mistaking them for instructions.
 * Each prohibited occurrence is checked separately: a caution never exempts
 * the rest of a sentence, another field, or a later unsafe instruction.
 */
export function containsUnqualifiedClaim(text: string, pattern: RegExp) {
  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : pattern.flags + "g";
  for (const match of text.matchAll(new RegExp(pattern.source, flags))) {
    const prefix = text.slice(Math.max(0, match.index - 90), match.index);
    // "Do not X or Y" keeps both prohibitions. Only remove recognised earlier
    // matches, never arbitrary clauses or punctuation.
    const coordinated = prefix.replace(new RegExp(pattern.source, flags), "");
    if (/\b(?:do not|don't|never|not)\s+avoid\s+(?:any\s+)?$/i.test(prefix))
      return true;
    const caution =
      /\b(?:do not|don't|never|avoid|without|cannot|can't|not|no need to)\s+(?:(?:a|an|any|the|your|ever|attempt|attempting|perform|performing|use|using|handle|handling|do|doing|engage in|engaging in|try|trying|take part in|or|nor)\s+){0,3}$/i;
    if (!caution.test(prefix) && !caution.test(coordinated)) return true;
  }
  return false;
}
