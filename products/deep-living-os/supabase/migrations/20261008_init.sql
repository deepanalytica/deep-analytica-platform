
-- Deep Living OS | PostgreSQL Supabase | 2026-10-08
-- Run with trusted migration owner. Do not bypass RLS from the browser.
create extension if not exists pgcrypto;
create table if not exists public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name)>1), created_at timestamptz not null default now()
);
create table if not exists public.memberships (
 org_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('admin','agent')),
 created_at timestamptz not null default now(),
 primary key(org_id,user_id)
);
create or replace function public.is_member(p_org uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.memberships m where m.org_id=p_org and m.user_id=(select auth.uid()) and m.role in ('admin','agent'));
$$;
create or replace function public.is_admin(p_org uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.memberships m where m.org_id=p_org and m.user_id=(select auth.uid()) and m.role='admin');
$$;
create table if not exists public.contacts (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 name text not null,email text,phone text,kind text not null default 'cliente',
 created_at timestamptz not null default now()
);
create table if not exists public.properties (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 title text not null,address text not null default '',commune text not null,sector text,
 price numeric(16,2) not null default 0 check(price>=0),bedrooms integer not null default 0 check(bedrooms>=0),
 bathrooms integer not null default 0 check(bathrooms>=0),parking boolean not null default false,
 area numeric(10,2),operation_type text not null check(operation_type in ('venta','arriendo')),
 property_type text not null check(property_type in ('casa','departamento','oficina','local','terreno')),
 status text not null default 'disponible' check(status in ('disponible','reservada','vendida','arrendada')),
 created_at timestamptz not null default now()
);
create table if not exists public.demands (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 client_name text not null,commune text not null,budget_max numeric(16,2) not null check(budget_max>=0),
 bedrooms_min int not null default 0 check(bedrooms_min>=0),parking_required boolean not null default false,
 operation_type text not null check(operation_type in ('venta','arriendo')),
 property_type text check(property_type in ('casa','departamento','oficina','local','terreno')),
 preferred_sector text,status text not null default 'buscando',created_at timestamptz not null default now()
);
create table if not exists public.deals (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 property_id uuid references public.properties(id),title text not null,stage int not null default 1 check(stage between 1 and 8),
 price numeric(16,2) not null default 0 check(price>=0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(id,org_id)
);
create table if not exists public.deal_participants (
 deal_id uuid not null references public.deals(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 relation text not null check(relation in ('propietario','comprador')),
 primary key(deal_id,user_id)
);
create or replace function public.is_party(p_deal uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.deal_participants p where p.deal_id=p_deal and p.user_id=(select auth.uid()));
$$;
create table if not exists public.tasks (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 deal_id uuid not null references public.deals(id),title text not null,status text not null default 'pendiente' check(status in ('pendiente','hecha')),
 due_at timestamptz,blocking boolean not null default false,
 visibility text not null default 'interno' check(visibility in ('interno','cliente')),
 created_at timestamptz not null default now(),completed_at timestamptz,
 unique(id,org_id)
);
create table if not exists public.deal_events (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 deal_id uuid not null references public.deals(id),summary text not null,stage int not null check(stage between 1 and 8),
 visibility text not null default 'interno' check(visibility in ('interno','cliente')),
 actor uuid references auth.users(id),created_at timestamptz not null default now()
);
create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 deal_id uuid not null references public.deals(id),title text not null,storage_path text not null,
 visibility text not null default 'interno' check(visibility in ('interno','cliente')),
 verification text not null default 'pendiente' check(verification in ('pendiente','revisado','observado')),
 uploaded_by uuid references auth.users(id),created_at timestamptz not null default now()
);
create table if not exists public.fees (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 deal_id uuid not null references public.deals(id),rate numeric(6,3) not null check(rate between 0 and 100),
 add_vat boolean not null default true,due_milestone text not null check(due_milestone in ('promesa','escritura','otro')),
 state text not null default 'pactada' check(state in ('pactada','exigible','pagada','disputada')),
 notes text,created_at timestamptz not null default now()
);
create table if not exists public.exchange_requests (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 demand_id uuid references public.demands(id),partner_name text not null,
 details text not null default '',status text not null default 'propuesta' check(status in ('propuesta','contactado','acordado','cerrado','descartado')),
 created_at timestamptz not null default now()
);
create table if not exists public.location_studies (
 id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id),
 title text not null,address text not null,industry text not null,criteria jsonb not null default '{}'::jsonb,
 caveats text not null default 'Evaluación preliminar, no sustituye validaciones en terreno.',
 created_at timestamptz not null default now()
);
create index if not exists idx_properties_org on public.properties(org_id);
create index if not exists idx_deals_org on public.deals(org_id);
create index if not exists idx_tasks_deal on public.tasks(deal_id);
create index if not exists idx_events_deal on public.deal_events(deal_id,created_at desc);
create index if not exists idx_demands_org on public.demands(org_id);
create index if not exists idx_docs_deal on public.documents(deal_id);
create index if not exists idx_fees_deal on public.fees(deal_id);
-- All user-accessible tables require RLS.
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.contacts enable row level security;
alter table public.properties enable row level security;
alter table public.demands enable row level security;
alter table public.deals enable row level security;
alter table public.deal_participants enable row level security;
alter table public.tasks enable row level security;
alter table public.deal_events enable row level security;
alter table public.documents enable row level security;
alter table public.fees enable row level security;
alter table public.exchange_requests enable row level security;
alter table public.location_studies enable row level security;
-- No public select on any private table.
create policy org_read on public.organizations for select to authenticated using (public.is_member(id));
create policy memberships_read on public.memberships for select to authenticated using (public.is_member(org_id) or user_id=(select auth.uid()));
create policy memberships_admin_insert on public.memberships for insert to authenticated with check(public.is_admin(org_id));
create policy memberships_admin_update on public.memberships for update to authenticated using(public.is_admin(org_id)) with check(public.is_admin(org_id));
create policy contacts_read on public.contacts for select to authenticated using(public.is_member(org_id));
create policy contacts_write on public.contacts for insert to authenticated with check(public.is_member(org_id));
create policy contacts_update on public.contacts for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy properties_read on public.properties for select to authenticated using(public.is_member(org_id));
create policy properties_write on public.properties for insert to authenticated with check(public.is_member(org_id));
create policy properties_update on public.properties for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy demands_read on public.demands for select to authenticated using(public.is_member(org_id));
create policy demands_write on public.demands for insert to authenticated with check(public.is_member(org_id));
create policy demands_update on public.demands for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy deals_read on public.deals for select to authenticated using(public.is_member(org_id) or public.is_party(id));
create policy deals_write on public.deals for insert to authenticated with check(public.is_member(org_id));
-- stage must be updated through advance_deal; column privileges below.
create policy deals_update on public.deals for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy party_read on public.deal_participants for select to authenticated using(public.is_party(deal_id) or exists(select 1 from public.deals d where d.id=deal_id and public.is_member(d.org_id)));
create policy party_write on public.deal_participants for insert to authenticated with check(exists(select 1 from public.deals d where d.id=deal_id and public.is_member(d.org_id)));
create policy tasks_read on public.tasks for select to authenticated using(public.is_member(org_id) or (visibility='cliente' and public.is_party(deal_id)));
create policy tasks_write on public.tasks for insert to authenticated with check(public.is_member(org_id));
create policy tasks_update on public.tasks for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy events_read on public.deal_events for select to authenticated using(public.is_member(org_id) or (visibility='cliente' and public.is_party(deal_id)));
create policy docs_read on public.documents for select to authenticated using(public.is_member(org_id) or (visibility='cliente' and public.is_party(deal_id)));
create policy docs_write on public.documents for insert to authenticated with check(public.is_member(org_id));
create policy docs_update on public.documents for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy fees_read on public.fees for select to authenticated using(public.is_member(org_id));
create policy fees_write on public.fees for insert to authenticated with check(public.is_member(org_id));
create policy fees_update on public.fees for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy exchange_read on public.exchange_requests for select to authenticated using(public.is_member(org_id));
create policy exchange_write on public.exchange_requests for insert to authenticated with check(public.is_member(org_id));
create policy exchange_update on public.exchange_requests for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
create policy studies_read on public.location_studies for select to authenticated using(public.is_member(org_id));
create policy studies_write on public.location_studies for insert to authenticated with check(public.is_member(org_id));
create policy studies_update on public.location_studies for update to authenticated using(public.is_member(org_id)) with check(public.is_member(org_id));
-- Restrict mutation of stage, immutable event records, organization linkage and membership role.
revoke all on public.organizations,public.memberships,public.contacts,public.properties,public.demands,public.deals,public.deal_participants,public.tasks,public.deal_events,public.documents,public.fees,public.exchange_requests,public.location_studies from anon;
grant select on public.organizations,public.memberships,public.contacts,public.properties,public.demands,public.deals,public.deal_participants,public.tasks,public.deal_events,public.documents,public.fees,public.exchange_requests,public.location_studies to authenticated;
grant insert on public.contacts,public.properties,public.demands,public.deals,public.deal_participants,public.tasks,public.documents,public.fees,public.exchange_requests,public.location_studies to authenticated;
grant update(name,email,phone,kind) on public.contacts to authenticated;
grant update(title,address,commune,sector,price,bedrooms,bathrooms,parking,area,operation_type,property_type,status) on public.properties to authenticated;
grant update(client_name,commune,budget_max,bedrooms_min,parking_required,operation_type,property_type,preferred_sector,status) on public.demands to authenticated;
grant update(title,property_id,price) on public.deals to authenticated;
grant update(title,status,due_at,blocking,visibility,completed_at) on public.tasks to authenticated;
grant update(title,visibility,verification) on public.documents to authenticated;
grant update(rate,add_vat,due_milestone,state,notes) on public.fees to authenticated;
grant update(partner_name,details,status) on public.exchange_requests to authenticated;
grant update(title,address,industry,criteria,caveats) on public.location_studies to authenticated;
grant insert,update(role) on public.memberships to authenticated;
-- Validate tasks belong to the same organization as deals, also under RPC.
create or replace function public.advance_deal(p_deal uuid,p_next_stage integer,p_summary text,p_visibility text default 'cliente')
returns uuid language plpgsql security definer set search_path='' as $$
declare v_org uuid;v_current integer;v_id uuid;
begin
 if (select auth.uid()) is null then raise exception 'Autenticación requerida'; end if;
 if length(btrim(coalesce(p_summary,'')))<8 then raise exception 'Se requiere una explicación del avance';end if;
 if p_visibility not in ('interno','cliente') then raise exception 'Visibilidad inválida';end if;
 select d.org_id,d.stage into v_org,v_current from public.deals d where d.id=p_deal for update;
 if v_org is null or not public.is_member(v_org) then raise exception 'Sin autorización';end if;
 if v_current>=8 or p_next_stage<>v_current+1 then raise exception 'Transición inválida';end if;
 if exists(select 1 from public.tasks t where t.deal_id=p_deal and t.status<>'hecha' and t.blocking) then
   raise exception 'Hay tareas bloqueantes pendientes';
 end if;
 update public.deals set stage=p_next_stage,updated_at=now() where id=p_deal;
 insert into public.deal_events(org_id,deal_id,stage,summary,visibility,actor)
 values(v_org,p_deal,p_next_stage,btrim(p_summary),p_visibility,(select auth.uid())) returning id into v_id;
 return v_id;
end;$$;
revoke all on function public.advance_deal(uuid,integer,text,text) from public,anon;
grant execute on function public.advance_deal(uuid,integer,text,text) to authenticated;
-- Private documents; never use public URLs for identity or title records.
insert into storage.buckets(id,name,public,file_size_limit) values('deal-documents','deal-documents',false,10485760)
on conflict(id) do nothing;
create policy dl_docs_upload on storage.objects for insert to authenticated
 with check(bucket_id='deal-documents' and exists(
 select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.org_id::text=(storage.foldername(name))[1]));
create policy dl_docs_read on storage.objects for select to authenticated
 using(bucket_id='deal-documents' and exists(
 select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.org_id::text=(storage.foldername(name))[1]));
-- Participant portal shows published document metadata only. File release must be separately authorized.
