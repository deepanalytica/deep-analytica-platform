-- Deep Living OS | Commercial terms must not be silently declared agreed.
-- Apply after onboarding.sql, pending legal review and RLS integration tests.
alter table public.fees drop constraint if exists fees_state_check;
update public.fees set state='propuesta' where state='pactada';
alter table public.fees add constraint fees_state_check
  check (state in ('propuesta','comunicada','confirmada','exigible','pagada','disputada'));
alter table public.fees alter column state set default 'propuesta';
-- Client cannot see agent's unilateral draft as a binding fee.
create or replace function public.get_my_fee_summaries()
returns table(id uuid,deal_id uuid,rate numeric,add_vat boolean,due_milestone text,state text)
language sql stable security definer set search_path='' as $$
 select f.id,f.deal_id,f.rate,f.add_vat,f.due_milestone,f.state
 from public.fees f
 join public.deal_participants p on p.deal_id=f.deal_id
 where p.user_id=(select auth.uid()) and p.relation='propietario'
   and f.state in ('comunicada','confirmada','exigible','pagada','disputada');
$$;
revoke all on function public.get_my_fee_summaries() from public,anon;
grant execute on function public.get_my_fee_summaries() to authenticated;
revoke update(rate,add_vat,due_milestone,state,notes) on public.fees from authenticated;
grant update(rate,add_vat,due_milestone,notes) on public.fees to authenticated;
-- Publish/acknowledge/signature events will be separate audited workflows;
-- no user should assume that a stored figure proves contractual acceptance.
