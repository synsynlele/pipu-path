-- Stage 18 runtime repair: PostgreSQL resolves the CASE branches in the review
-- mutation as text unless they are explicitly cast to the enum type.

create or replace function public.review_stage18_opportunity(
  opportunity_id_input uuid,
  approved_input boolean,
  review_notes_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  perform private.stage18_require_supply_editor(actor);

  update public.opportunities
  set review_status = case
        when approved_input then 'approved'::public.opportunity_review_status
        else 'rejected'::public.opportunity_review_status
      end,
      publication_status = 'draft',
      review_notes = nullif(btrim(review_notes_input), ''),
      reviewed_by = actor,
      reviewed_at = now(),
      published_by = null,
      published_at = null
  where id = opportunity_id_input;

  if not found then
    raise exception 'OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id,
    metadata
  ) values (
    actor, 'opportunity_reviewed', 'success', 'opportunity',
    opportunity_id_input::text, jsonb_build_object('approved', approved_input)
  );
end;
$$;

revoke all on function public.review_stage18_opportunity(uuid,boolean,text)
  from public, anon;
grant execute on function public.review_stage18_opportunity(uuid,boolean,text)
  to authenticated;
