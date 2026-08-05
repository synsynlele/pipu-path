# Stage 10 known-debt disposition

| Item                                   | Classification                                          | Decision                                                                                                |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Stage 2 in-process limiter             | Fixed before launch                                     | Replaced by atomic Supabase rate limiting in migration `020`                                            |
| Development dependency advisories      | Accepted MVP debt unless a compatible safe patch exists | Do not destabilise the release for tooling-only transitive advisories; record exact final audit         |
| Isolated Stage 7/8/9 Supabase adapters | Post-launch improvement                                 | Keep isolated typed boundaries; consolidate only in a dedicated regression-tested maintenance slice     |
| Legal/privacy wording                  | Blocks broad public launch until owner/legal review     | Repository notices explain current behavior but are not legal approval                                  |
| Retention policy                       | Blocks broad public launch until approved               | Technical deletion/retention schedule must be approved and documented before open production launch     |
| Child safeguarding                     | Fixed launch boundary, further work post-launch         | Private youth use remains; public Portfolio remains adult-only until guardian-consent/moderation exists |
| CI browser installation                | Accepted MVP debt                                       | Use npm cache and serialized fixture; optimize browser caching later without weakening coverage         |
| Production-grade monitoring/support    | Blocks unsupported public scale                         | Define alert ownership, support response and incident escalation before broad promotion                 |
