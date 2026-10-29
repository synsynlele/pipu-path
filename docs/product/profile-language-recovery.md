# Targeted profile-language recovery

## 29 October 2026 — Targeted profile-language recovery

Owner's fresh profile update on production 94a98d1 failed. The new diagnostics
identify prose:fixed_identity_or_shaming, followed by OPENAI_TIMEOUT during the
full-profile correction. Request 88a56792-74f5-4f5d-9246-62171183111c: first result
rejected at 19:26:04 UTC, correction timed out at 19:26:17 UTC. No saved learner
work changed. The exact rejected wording was deliberately not logged.

Inspection and regression tests confirm that ordinary process wording such as
work broken into smaller steps was rejected by the broad broken keyword. Exempt
only the literal process construction; retain rejection of direct shaming and
fixed-identity claims. Validate each field independently, recording only field
paths and rule IDs. This also avoids a caution in one field exempting another.

For a structurally valid profile with rejected wording, request a short patch of
only those existing display fields from the same provider. Keep evidence IDs,
references, confidence and all other fields immutable. Reject extra, missing or
oversized patch fields; validate the complete patched profile before persistence.
Structural failures retain the bounded full retry. Both paths share the existing
45-second budget, with no additional attempt or provider. Report actual timeout
as timeout rather than mislabelling it as a content-check failure. Ask for concise
initial prose to reduce latency and reading burden.

No migration, new dependency, consent/age change or proof/progress write. The
blue-and-white screens and sign-in repairs from PR116 remain. A real signed-in
provider result is still required for live acceptance; mocked transport tests
prove recovery boundaries, not provider availability or live output quality.
