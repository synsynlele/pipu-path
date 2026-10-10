# Privacy and retention decision for release

Status: proposal for owner review, 10 October 2026. Not approved, activated or
published as user-facing policy. This document does not certify legal compliance.

## Recommended operating decision

Keep PipuPath's youth-and-adult purpose. Preserve adult-only Connect and public
Portfolio restrictions for minors. Do not declare the child launch ready until
age-appropriate authorisation, AI processing and safeguarding controls are
implemented and verified. A school relationship is not automatic guardian consent.
Do not silently change the audience to adults to bypass the youth launch gate.

| Item                            | Proposed rule                                                                                                | Current evidence / work still needed                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Active private development data | Keep while the account is active and needed for its journey; delete on a verified request                    | Executor API proof passed; no blanket expiry is implemented                                                       |
| Request response                | Acknowledge within 7 calendar days; target completion within 30 calendar days of receiving the request       | Operational targets, not legal deadlines; ownership/holds must be resolved and delays explained                   |
| Completion receipt              | Keep only request ID, timestamps, outcome and operator attribution for 90 days after completion, then remove | Target identity already clears; receipt cleanup scheduling is not implemented                                     |
| Verification documents          | Prefer verified account access; do not routinely collect government-ID images or private learning narratives | External ownership cases need a documented minimal verification procedure                                         |
| Safeguarding or legal hold      | Restrict access; retain only necessary records with a specific reason, accountable reviewer and review date  | Executor refuses relevant cases; hold register, legal review and transfer/redaction workflow remain to be defined |
| Provider and backup records     | Disclose the verified provider-specific duration; no universal erasure deadline                              | Actual backup plan/PITR, exports, Vercel log drains and OpenAI endpoint settings must be inventoried              |
| Cached/downloaded files         | Verify origin removal; disclose cache propagation and inability to recall copies already downloaded          | Origin test passed; signed-link/cache regression remains pending                                                  |
| Inactive accounts               | No automatic inactivity deletion in this release                                                             | Avoid destroying a learner's history under an unannounced rule; review future minimisation separately             |

The 7/30/90-day values are proposed management choices. They must be reviewed
against applicable obligations, capacity and implemented cleanup before becoming
public promises. A hold is not permission to retain everything indefinitely.
If a shorter applicable deadline exists, it takes precedence.

## Ownership and everyday execution

An authorised privacy operator owns the queue, monitored contact, acknowledgement,
minimal verification, dependency review, execution and truthful completion reply.
A second authorised owner/operator is the backup. One verified operator currently
exists; a backup account must be nominated and verified before role assignment.
No role is granted by this proposal. The founder approves this operating policy,
not each routine request. A safeguarding reviewer handles child-safety holds;
an accountable legal/privacy reviewer decides legal exceptions. Names and secure
case-system access remain to be assigned.

Each case records received date, requester verification result, scope, reviewer,
next review date, exception reason if any, execution outcome and response date.
Do not paste sensitive narratives into the deletion receipt or engineering logs.
Review overdue requests weekly. Repeated failures go to engineering with redacted
job IDs and failure phase; a backup may resume after lease expiry/review handover.
Never manually mark an incomplete deletion fulfilled.

## Youth and guardian handling

1. A signed-in young user may ask for deletion. Route the request for appropriate
   privacy/safeguarding review; do not automatically refuse it solely because
   a parent has not contacted PipuPath.
2. A guardian making an external request must establish account linkage and
   lawful authority using the least intrusive verification appropriate to the
   case. A claimed relationship, teacher title or shared surname is insufficient.
3. Authority to request deletion does not grant access to the child's private
   reflections. Avoid sending private developmental content as ownership proof.
4. Where contact with a claimed guardian could expose a young person to harm,
   pause disclosure and obtain safeguarding review. Do not automatically notify
   that person or delete safeguarding evidence.
5. Conflicting requests, disputed authority, account compromise and safeguarding
   reports require a documented case-specific decision and access restriction.
   Do not create permanent unreviewed holds or pretend a held case is fulfilled.
6. Verify lawful child onboarding/AI authorisation separately from deletion.
   A checkbox completed by a child is not proof that a guardian was verified.
   Child social controls must match the declared Play audience.

These are proposed procedures requiring qualified local review, not a conclusion
that any existing consent flow is legally sufficient.

## Provider inventory before public notice

Record the actual Supabase backup/PITR window and every exported backup location,
its operator, access restrictions and expiry. Database backups do not establish
file-blob erasure. Restores must not silently reactivate previously deleted users;
a restricted deletion reconciliation procedure is required before restoring service.

Record Vercel plan/log retention and any external log drains, analytics storage,
error reporting or email-provider records. Check OpenAI endpoints and application
state retention, stored responses and the organisation's actual controls. Default
OpenAI abuse-monitoring retention can be up to 30 days, with exceptions; do not
claim Zero Data Retention or a universal 30-day guarantee without verification.

## Activation checklist

- Approve or amend this schedule and assign privacy, backup and exception owners.
- Verify provider durations and external verification/safeguarding procedures.
- Implement and test receipt expiry, escalation and any required hold handling.
- Complete child authorisation/safeguarding review for the intended launch audience.
- Publish an accurate notice, including retention exceptions and monitored contact.
- Test web request/operator actions, public-link withdrawal and cache behavior.
- Enable request/fulfilment flags only after the applicable gates pass.

API proof is already passed. Production flags remain disabled. Approval of this
proposal alone is not evidence that its unimplemented controls now exist.

## Primary references

- Google Play User Data: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play Families: https://support.google.com/googleplay/android-developer/answer/9893335
- Supabase backups: https://supabase.com/docs/guides/platform/backups
- Supabase CDN: https://supabase.com/docs/guides/storage/cdn/smart-cdn
- OpenAI data controls: https://developers.openai.com/api/docs/guides/your-data
