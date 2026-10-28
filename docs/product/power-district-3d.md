> Current direction: [one connected city](unbuilt-city-connected-world.md) supersedes the separate-mission presentation below.

# Power District 3D workshop preview

User authority: 28 October 2026 asks for one-click automatic travel, collision
repair, app-preview integration and continued game development.

One tap chooses a ground destination. The avatar follows a computed route without
holding direction controls. A station label chooses an approach point and opens
its authored interaction only on arrival. Stop or a new destination cancels the
old route. Manual controls share swept collision/slide rules. Visible solid mesh
bounds are expanded by the avatar radius; installations rebuild navigation.
Blocked destinations use a nearby clear point. Unreachable areas give feedback.
The world is mostly flat; no claim of physics, stairs or multiplayer avoidance.

The pure navigation module is independent of Three.js. This lets future authored
worlds reuse pathfinding, collision tests and destination handling rather than
requiring the founder to tune individual routes. Content owns station approaches;
engineering owns clearance and pathfinding; QA owns reachable routes and device
proof. Navigation checks and model checks run through package validation.

Build's authenticated layout and page protect app entry. The bundle is served
same-origin under public/games/power-district; it contains only fictional content,
no user identity, credentials or Quest context. Public access to static practice
assets grants no learner-data access. Embedded mode neither reads nor writes
browser saves, avoiding cross-account reflection exposure. The parent retains
server-resolved real Quest links. No postMessage, completion RPC, XP award,
capability claim, evidence write, database migration or auth setting is added.
The standalone prototype retains its existing device-local practice save.

The Hub and game navigation expose 3D Workshop. Focus view expands the same frame
without restarting the game and has a Close control and Escape recovery. On
leaving/reloading, in-session practice resets. A completed simulation is not a
validated real-world learning outcome. Existing seven-world simulations remain.

Verification: navigation tests cover detours, radius clearance, swept collision,
corner guards, unreachable destinations and installed obstacles. App tests cover
authenticated entry, locked Quest fallback, exact continuation and focus recovery.
Browser, full validation, preview commit and physical-phone results belong in the
implementation ledger and must not be inferred from source completion.

## Replacement authority — 28 October 2026

The owner clarified that The Unbuilt City is the game part of PipuPath and this
3D work replaces its earlier challenges. The canonical `/build/play` now renders
Power District with the same owned Quest validation; the mission path presents
this replacement campaign. `/build/power-district` remains a compatibility alias,
not a separate game. Retired world bookmarks recover to the new mission path;
Neighbourhood recovers to the canonical city entry. Existing local saves are left
untouched and are never counted as completion of a new mission.

Only the first new mission is playable. Harvest Exchange and Learning Commons are
honestly marked planned and have no play buttons. No other blueprint mission is
represented as implemented. The application keeps the name The Unbuilt City.
The app may load same-origin frames across client-side navigation. Only the
static game document permits same-origin ancestors; other application pages
remain unframeable, and external frames remain blocked except the existing
preview toolbar.
