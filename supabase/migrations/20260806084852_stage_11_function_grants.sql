-- Stage 11 explicit function execution boundaries.
revoke all on function public.save_stage11_builder_connect_profile(text[],text[],text,text,text,text,public.builder_connect_visibility) from public,anon;
revoke all on function public.send_stage11_connection_request(uuid) from public,anon;
revoke all on function public.respond_stage11_connection_request(uuid,boolean) from public,anon;
revoke all on function public.close_stage11_connection(uuid,text) from public,anon;
revoke all on function public.block_stage11_builder(uuid) from public,anon;
revoke all on function public.unblock_stage11_builder(uuid) from public,anon;
revoke all on function public.report_stage11_builder(uuid,text,text) from public,anon;
revoke all on function public.share_stage11_contact(uuid,boolean,boolean) from public,anon;
revoke all on function public.get_stage11_connect_state() from public,anon;
revoke all on function public.get_stage11_builder_detail(text) from public,anon;

grant execute on function public.save_stage11_builder_connect_profile(text[],text[],text,text,text,text,public.builder_connect_visibility) to authenticated;
grant execute on function public.send_stage11_connection_request(uuid) to authenticated;
grant execute on function public.respond_stage11_connection_request(uuid,boolean) to authenticated;
grant execute on function public.close_stage11_connection(uuid,text) to authenticated;
grant execute on function public.block_stage11_builder(uuid) to authenticated;
grant execute on function public.unblock_stage11_builder(uuid) to authenticated;
grant execute on function public.report_stage11_builder(uuid,text,text) to authenticated;
grant execute on function public.share_stage11_contact(uuid,boolean,boolean) to authenticated;
grant execute on function public.get_stage11_connect_state() to authenticated;
grant execute on function public.get_stage11_builder_detail(text) to authenticated;

revoke all on function public.create_stage6_journey_request(uuid,public.journey_generation_kind,uuid,text,text) from public,anon;
grant execute on function public.create_stage6_journey_request(uuid,public.journey_generation_kind,uuid,text,text) to authenticated;
revoke all on function public.persist_stage6_journey(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.persist_stage6_journey(uuid,jsonb) to service_role;
