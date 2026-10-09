-- Deep Living OS v0.2 | self-service workspace and task responsibility
-- Execute AFTER the previous three migrations, with trusted migration privileges.
create or replace function public.provision_organization(p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_org uuid; v_name text;
begin
  v_user := (select auth.uid());
  if v_user is null then raise exception 'Inicia sesión para crear tu espacio'; end if;
  v_name := btrim(coalesce(p_name,''));
  if length(v_name) < 3 or length(v_name) > 90 then
    raise exception 'El nombre debe tener entre 3 y 90 caracteres';
  end if;
  -- Prevent accidental duplicate organization creation via concurrent requests.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_user::text));
  if exists(select 1 from public.memberships where user_id=v_user) then
    raise exception 'Ya tienes una organización. Solicita acceso al administrador';
  end if;
  if exists(select 1 from public.deal_participants where user_id=v_user) then
    raise exception 'Ya tienes una operación asignada. No puedes crear una corredora desde esa cuenta';
  end if;
  insert into public.organizations(name) values(v_name) returning id into v_org;
  insert into public.memberships(org_id,user_id,role) values(v_org,v_user,'admin');
  return v_org;
end;$$;
revoke all on function public.provision_organization(text) from public,anon;
grant execute on function public.provision_organization(text) to authenticated;

alter table public.tasks add column if not exists responsible_label text;
alter table public.tasks add constraint dl_task_responsible_label_length check (responsible_label is null or length(responsible_label) <= 120);
grant update(responsible_label) on public.tasks to authenticated;

-- This is an internal accountability label, not a legally significant assignment
-- unless accompanied by acceptance/contract. Client portal may see labels only for
-- tasks deliberately published with visibility='cliente'.
