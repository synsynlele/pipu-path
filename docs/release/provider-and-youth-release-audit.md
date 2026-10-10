# Provider and youth release audit — 10 October 2026

Status: read-only audit complete; provider settings and guardian implementation
are not certified. No live setting, permission, user record or release flag changed.

## Verified evidence

- Supabase get_project: kvjcswnmhwegpakbtvlh (named pipupath-staging) is
  ACTIVE_HEALTHY, eu-west-1, PostgreSQL 17. The name does not establish isolation;
  treat this connected backend as shared/live.
- Vercel get_project: pipu-path belongs to team_BVKFc6kjlaazTmHWc1vXv6RK.
- Project-scoped list_drains returned an empty list. This establishes no drains
  reported by that API for this project, not absence of every external export.
- Supabase live function definitions match the inspected identity migration:
  the learner supplies AI consent; minor identity completion writes
  guardian_required=declined. The interpretation request checks learner AI
  consent and the safeguarding flag, without verifying guardian authority.
- All six OpenAI providers use the shared server-only Responses adapter:
  Human Potential, Mission, Journey, Quest, Builder Guide and Economic Pathways.
  The adapter sends store:false. That is not proof of approved Zero Data Retention.
- Owner happy-path Quest completion and persisted next Quest passed separately.
  Child recruitment, public release and Play submission have not occurred here.

## Concrete missing settings evidence

| System   | Account custodian checks                                                                                                                  | Evidence to retain without secrets                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase | Select the exact project, open Database > Backups; inspect daily backup and PITR status/window; inventory manual exports outside Supabase | Active plan, backup type, actual oldest/latest available restore times, retention window, export locations/owners/expiry; no downloaded backup needed |
| Vercel   | Select the exact team; inspect billing plan and Observability Plus, then project Logs/Drains                                              | Plan/add-on state, resulting runtime-log retention; confirm other analytics/error-reporting/export destinations                                       |
| OpenAI   | Settings > Organization > Data controls; identify the project used by the deployed key and its override                                   | Organisation/project retention control, approval state, data-sharing settings, model/endpoint eligibility; no API key or full billing record          |
| Android  | Open the reviewed candidate in device Chrome for UI regression; the existing TWA APK opens production until promotion                     | Device model, Android and Chrome versions; login return, proof/reflection Back, idle/resume, readability; later installed internal-track trust proof  |

Available connector responses do not expose the actual Supabase backup/PITR
window, Vercel plan/add-on or OpenAI organisation controls. Do not infer them from
project health, documentation defaults or store:false. Do not change plans or
purchase add-ons merely to complete this record.

## Child AI processing requirement

OpenAI's current under-18 guidance says personal data of children under 13 or
the applicable age of digital consent should not be processed without first
implementing Zero Data Retention. Approved controls are configured at organisation
and project level; store:false alone does not satisfy this verification.
The applicable local consent threshold and authority verification procedure need
qualified privacy review. Do not infer them from the app's age-band labels.

Before relevant youth recruitment/release, require BOTH a verified lawful
child-authorisation procedure and verified provider controls. Guardian approval
alone does not close the provider gate; provider controls do not establish
parental authority. No adult-only product restriction is introduced by this audit.

## Guardian implementation acceptance contract

This is a specification, not implemented functionality or legal approval.

1. Give the learner a short status page explaining what needs an adult review,
   without exposing their private reflections or inventing an approval time.
2. Store a durable account-linked request with pending, verified, rejected,
   disputed and withdrawn states. Record versioned scopes separately for AI,
   development data and any optional sharing; no blanket public permission.
3. An authenticated guardian's claim is only a claim. A qualified reviewer must
   use an approved minimal authority/account-linkage procedure. Shared surname,
   teacher title, possession of a link or the child's checkbox is insufficient.
4. Reuse existing authorised operator roles; no new automatic role grant.
   Record reviewer, method category, decision, timestamps, policy version and
   review/expiry date where applicable. Avoid routine government-ID uploads and
   private narratives in receipts, logs or proof of account ownership.
5. Enforce current authorisation at every server/provider boundary, not only
   onboarding or a hidden button. Cover existing requests, retries, background
   generation, all six providers, withdrawal and changed/disputed authority.
   Do not conflate being a minor with having a safeguarding incident.
6. A guardian decision never grants access to private reflections, Connect or
   public Portfolio. Preserve existing age restrictions and child agency.
7. Handle disputed authority or potential harmful disclosure through restricted
   safeguarding review; no automatic email to the claimed guardian. Request
   creation does not authorise sending an invitation or private data externally.
8. Verify cross-user RLS, unauthorised reviewer rejection, expired/replayed links,
   revoked consent blocking provider calls, pending requests causing zero external
   AI transmissions and an adult-regression pass. Use disposable accounts only.

## Repeatable ownership

Infrastructure custodian records provider evidence. Product/privacy reviewer
settles applicable thresholds and minimal authority checks. Engineering implements
and tests the contract. A QA operator repeats the journey for each candidate and
records failures by stage; the founder handles unresolved policy exceptions.
The same controls apply to larger cohorts without individual founder sign-off.

## Primary references checked today

- https://supabase.com/docs/guides/platform/backups
- https://vercel.com/docs/logs/runtime
- https://developers.openai.com/api/docs/guides/your-data
- https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance

## Owner screenshot — Supabase scheduled backups

On 10 October the owner supplied image(5).png showing pipupath-staging,
main/PRODUCTION, FREE plan and the Database Backups > Scheduled backups tab.
The page states the Free plan does not include project backups; no restore
points are shown. This verifies no scheduled backup availability in that view.
The Point in time tab was not inspected, and external manual exports remain
unknown. Do not infer the project has no external copies or that an upgrade was
purchased. A paid-plan or managed encrypted export decision is still needed for
operational recovery; no retention window can be promised from this screenshot.
