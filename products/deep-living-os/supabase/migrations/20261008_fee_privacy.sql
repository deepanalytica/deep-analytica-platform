-- Harden fee privacy: RLS protects internal notes and payment records.
-- External property owners receive only a safe summary through an authenticated RPC.
drop policy if exists fees_read on public.fees;
create policy fees_read on public.fees for select to authenticated using(public.is_member(org_id));

create or replace function public.get_my_fee_summaries()
returns table(id uuid,deal_id uuid,rate numeric,add_vat boolean,due_milestone text,state text)
language sql stable security definer set search_path='' as $$
 select f.id,f.deal_id,f.rate,f.add_vat,f.due_milestone,f.state
 from public.fees f
 join public.deal_participants p on p.deal_id=f.deal_id
 where p.user_id=(select auth.uid()) and p.relation='propietario';
$$;
revoke all on function public.get_my_fee_summaries() from public,anon;
grant execute on function public.get_my_fee_summaries() to authenticated;
