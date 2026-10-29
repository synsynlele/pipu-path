# One clear real-world building journey

29 October 2026. Owner reports repetitive non-AI results and too many legacy
combinations, and authorises fixing AI plus simplifying onboarding through real
Quests, useful deployment and optional collaboration.

## Verified causes

Production logs show a profile generation falling back with
HPI_OUTPUT_INVALID and a Quest using MINOR_EXTERNAL_AI_DISABLED. Both OpenAI and
Gemini configuration names exist on Vercel; values were not decrypted. Main
personal generation currently uses OpenAI. Unused Gemini adapters do not prove
provider failure and are not activated by this change. The connected Supabase
account does not grant access to the live backend; no settings are inferred.

Keyword validators rejected explicit safety cautions (e.g. Avoid dangerous
activities) and non-diagnostic caveats as though they were unsafe instructions.
The profile response schema did not bound text or enforce actual evidence IDs,
although the domain validator rejected oversized text and foreign references.
Internal identity/guardian completion still redirected to /continue after that
legacy installed-app entry had become the public welcome, interrupting the
real-world journey.

## Implementation

Retain current personal-data, consent, age and ownership boundaries. Recognise
narrow explicit cautions per prohibited occurrence; a caution never exempts a
later unsafe instruction or another field. Keep positive harmful advice and
false identity claims rejected. Bound profile generation to saved field limits
and exact supplied evidence IDs. Log only validation paths/codes, never answers
or generated narratives. Youth guided profiles are labelled truthfully and no
longer offer an AI retry that cannot run for that account type.

Internal onboarding completion and signed-in login recovery lead to protected
Real Quests; legacy installed /continue still opens the public welcome. Real
Quests puts the authoritative next action first. Inspiration and explanations
are optional disclosures. Completed builds have a clear review/deployment entry;
guidance and collaboration appear as optional help for a Project. You retains
work, Projects and account controls, with support tools behind one disclosure.
Discovery removes duplicate explanatory cards. Visible direction/plan copy is
plain English; underlying domain entities and required real evidence remain.

The existing required Discovery answers remain: this slice does not pretend to
replace backend requirements with a three-question onboarding. Deep routes and
saved work remain available. No schema migration, learner-data rewrite, new AI
recipient, external processing for minors, earned-progress shortcut or new
payment/dependency is introduced. Current city-consequence production release
5a30b11 is preserved; earlier local city alternatives are archived separately.

Acceptance: domain regressions for explicit cautions and still-rejected unsafe
instructions, bounded profile schema/provenance, guarded routing, real next
Quest/reflection/Project, optional tools, full validation and deployed review.
Live AI output quality and a signed-in end-to-end generation must be verified
separately from mock provider tests.
