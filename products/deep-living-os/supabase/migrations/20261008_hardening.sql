-- Deep Living OS security hardening, run AFTER 20261008_init.sql.
-- Every child row must belong to the same org as its parent. Without this, a member
-- could insert blocking tasks into a guessed deal belonging to another organization.
create or replace function public.validate_dl_scope() returns trigger
language plpgsql security definer set search_path = '' as $$
declare parent_org uuid;
begin
  if tg_op = 'UPDATE' then
    if new.org_id is distinct from old.org_id then
      raise exception 'No se puede cambiar la organización';
    end if;
    if tg_table_name in ('tasks','documents','fees','deal_events') and new.deal_id is distinct from old.deal_id then
      raise exception 'No se puede transferir una referencia de expediente';
    end if;
  end if;

  if tg_table_name = 'deals' then
    if new.property_id is not null then
      select p.org_id into parent_org from public.properties p where p.id = new.property_id;
      if parent_org is distinct from new.org_id then raise exception 'La propiedad pertenece a otra organización'; end if;
    end if;
  elsif tg_table_name in ('tasks','documents','fees','deal_events') then
    select d.org_id into parent_org from public.deals d where d.id = new.deal_id;
    if parent_org is distinct from new.org_id then raise exception 'Expediente de otra organización'; end if;
  elsif tg_table_name = 'exchange_requests' then
    if new.demand_id is not null then
      select d.org_id into parent_org from public.demands d where d.id = new.demand_id;
      if parent_org is distinct from new.org_id then raise exception 'Demanda de otra organización'; end if;
    end if;
  end if;
  return new;
end;$$;
drop trigger if exists dl_deals_scope on public.deals;
create trigger dl_deals_scope before insert or update on public.deals for each row execute function public.validate_dl_scope();
drop trigger if exists dl_tasks_scope on public.tasks;
create trigger dl_tasks_scope before insert or update on public.tasks for each row execute function public.validate_dl_scope();
drop trigger if exists dl_documents_scope on public.documents;
create trigger dl_documents_scope before insert or update on public.documents for each row execute function public.validate_dl_scope();
drop trigger if exists dl_fees_scope on public.fees;
create trigger dl_fees_scope before insert or update on public.fees for each row execute function public.validate_dl_scope();
drop trigger if exists dl_events_scope on public.deal_events;
create trigger dl_events_scope before insert or update on public.deal_events for each row execute function public.validate_dl_scope();
drop trigger if exists dl_exchanges_scope on public.exchange_requests;
create trigger dl_exchanges_scope before insert or update on public.exchange_requests for each row execute function public.validate_dl_scope();

-- Do not let authenticated clients INSERT a deal already at stage 8.
-- Stage only changes through advance_deal RPC after blockers are checked.
revoke insert on public.deals from authenticated;
grant insert(org_id,property_id,title,price) on public.deals to authenticated;

-- Creating external participants is sensitive: admin-only (not every agent).
drop policy if exists party_write on public.deal_participants;
create policy party_write on public.deal_participants for insert to authenticated
  with check(exists (
    select 1 from public.deals d where d.id=deal_id and public.is_admin(d.org_id)
  ));

-- The party obligated as property owner may see fee records related to their own deal.
-- Other external participants may not see them. This RLS alone does NOT prove
-- that the fee is accepted or contractually enforceable.
create or replace function public.is_deal_owner(p_deal uuid) returns boolean
language sql security definer stable set search_path='' as $$
 select exists(select 1 from public.deal_participants p
   where p.deal_id=p_deal and p.user_id=(select auth.uid()) and p.relation='propietario');
$$;
drop policy if exists fees_read on public.fees;
create policy fees_read on public.fees for select to authenticated
 using(public.is_member(org_id) or public.is_deal_owner(deal_id));

-- A user must not update a completed task back to pending to rewrite operational history.
-- Such reversals should become separately audited events in a future workflow.
-- For now, existing completion is immutable unless a supervisor repairs via migration.
create or replace function public.guard_task_completion() returns trigger language plpgsql
set search_path = '' as $$
begin
 if old.status='hecha' and new.status<>'hecha' then
   raise exception 'Una tarea terminada no puede reabrirse sin proceso auditado';
 end if;
 return new;
end;$$;
drop trigger if exists dl_task_completion on public.tasks;
create trigger dl_task_completion before update on public.tasks for each row execute function public.guard_task_completion();

-- Defense in depth: public users have no write grants; authenticated users cannot
-- delete audit events, other people's organizations, or documents through this schema.
revoke delete on public.deal_events,public.documents,public.deals,public.tasks from authenticated;
