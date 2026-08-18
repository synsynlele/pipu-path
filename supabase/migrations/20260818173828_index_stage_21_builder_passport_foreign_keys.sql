create index builder_passport_evidence_passport_claim_idx
  on public.builder_passport_evidence(passport_id, claim_id);

create index builder_passport_institution_passport_claim_idx
  on public.builder_passport_institution_verifications(passport_id, claim_id);
