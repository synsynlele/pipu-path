# Discovery privacy and sensitivity

Discovery responses are private developmental evidence. Anonymous access is
denied. Authenticated users can read only their own sessions and responses;
all direct mutations are denied and controlled functions derive `auth.uid()`.

Sensitivity is copied from the eligible question definition by the database.
Clients cannot select or downgrade it. Audit and verification output may record
session identifiers, stable question keys, section, operation and error code,
but never response text or option content tied to a real person.

Published question definitions are visible only to eligible authenticated
users. Draft and retired definitions are hidden. Raw Discovery tables are not a
public Builder interface and service-role credentials stay outside browser
bundles.

Retention/deletion, reopening and research analytics remain deferred pending a
complete policy and safeguarding review. Optional analytics consent does not
gate the core Discovery experience.
