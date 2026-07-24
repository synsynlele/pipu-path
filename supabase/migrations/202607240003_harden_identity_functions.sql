-- Remove Supabase default function execution grants before adding the exact
-- Stage 2 call surface. Trigger functions require no API-role EXECUTE grant.
revoke all on function public.set_updated_at()
from public, anon, authenticated, service_role;
revoke all on function public.handle_new_auth_user()
from public, anon, authenticated, service_role;
revoke all on function public.provision_identity(uuid)
from public, anon, authenticated, service_role;
revoke all on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) from public, anon, authenticated, service_role;
revoke all on function public.withdraw_consent(text, text)
from public, anon, authenticated, service_role;

grant execute on function public.provision_identity(uuid)
to authenticated, service_role;
grant execute on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) to authenticated;
grant execute on function public.withdraw_consent(text, text)
to authenticated;
