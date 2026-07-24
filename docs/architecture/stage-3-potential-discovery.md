# Stage 3 — Potential signal discovery

## Purpose

Stage 3 helps a person notice early potential signals without claiming to
define their identity. Discovery begins with user-authored evidence, not an AI
profile.

## Delivered Stage 3 slices

Discovery Evidence Capture provides:

- one published, versioned Builder Signals assessment;
- one resumable in-progress attempt per user and assessment;
- private user-owned responses saved independently;
- optimistic concurrency to prevent silent overwrites;
- submission only after every required response exists;
- privacy-safe audit events that never contain response narratives;
- no scoring, synthesis, path recommendation or Human Potential Profile claim.

The implementation is divided into the approved slices:

1. versioned schema and evidence-first ADR;
2. a published seven-section question set with server-side age variants;
3. controlled start, resume, save, review and completion services;
4. mobile-first focused-question routes with explicit server-confirmed saves;
5. grouped review, editable answers and an idempotent completion boundary;
6. staging migration, RLS, API, type, accessibility and repository validation.

The interface deliberately uses an explicit **Save and continue** interaction
instead of claiming background autosave. A response is described as saved only
after the server action succeeds. Durable server state supports refresh,
sign-out/sign-in and another-device resume.

## State and integrity

`not_started → in_progress → review → completed` is enforced by controlled
database functions. Client code cannot write session status, ownership,
progress, processing status or response sensitivity. Progress is derived from
eligible questions and persisted responses. Every write carries the expected
session version; stale writes fail with `DISCOVERY_SAVE_CONFLICT`.

Only one active session exists per user and question-set version. A completed
session is immutable and repeated start or complete operations are idempotent.

## Question-set and age eligibility

`foundation_discovery` version 1 contains seven sections: current reality,
drawn interests, natural contribution, shaping experience, values, buildable
experiments and readiness. It supports reflection, single-select,
multi-select and scale responses.

Age eligibility is evaluated in database functions and RLS policies using the
verified Stage 2 profile age band. Minors receive the youth-safe support
variant; adults receive the resources variant. The sensitive shaping prompt is
optional and its response inherits the question sensitivity on the server.

## Evidence contract

Assessment prompts invite concrete memories, recurring requests, energising
work and a next experiment. Responses are first-party reflection evidence.
Later synthesis must cite the exact assessment version and response keys used.

## Privacy and retention

Responses are private developmental data. Anonymous users have no access.
Authenticated users can read only their own attempts and responses. Direct
mutation is denied; controlled functions derive ownership from `auth.uid()`.
Deletion and retention controls are deferred until their complete lifecycle can
be implemented without weakening auditability.

No separate completion snapshot is required in Stage 3. The completed,
versioned session is immutable; its normalized typed projection is the
integrity-preserving Stage 4 handoff without duplicating sensitive answers.
Audit metadata contains stable keys and versions, never answer content.

## Stage 4 handoff

`Stage4DiscoveryHandoff` exposes only a completed session identifier, question
set key/version, completion timestamp, processing status and normalized
responses with category, stable question key, response type and sensitivity.
It is a typed projection rather than a raw database record.

## Stage boundary

Stage 3 ends when an eligible user can start, save, leave, resume, review, edit
and submit a complete assessment under verified authorization. Submission
proves evidence capture only. It does not prove a potential signal, recommend a
Journey or mutate the Human Potential Profile.
