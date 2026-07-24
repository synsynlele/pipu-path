-- Supabase-managed databases may apply default public-schema privileges to API
-- roles. Remove them before granting the minimum Stage 2 contract.
revoke all on public.profiles, public.user_preferences, public.user_consents,
  public.onboarding_checkpoints, public.identity_audit_events
from public, anon, authenticated;

grant select on public.profiles, public.user_preferences, public.user_consents,
  public.onboarding_checkpoints to authenticated;

grant update (
  display_name, preferred_name, username, avatar_path, general_location,
  country_code, primary_language, life_stage, education_level, last_active_at
) on public.profiles to authenticated;

grant update (
  interface, accessibility, communication, magicpen, notifications
) on public.user_preferences to authenticated;
