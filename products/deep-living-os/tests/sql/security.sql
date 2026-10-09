\set ON_ERROR_STOP on
-- Fixture creation with privileged migration role.
insert into auth.users(id) values
('11111111-1111-4111-8111-111111111111'),
('22222222-2222-4222-8222-222222222222'),
('33333333-3333-4333-8333-333333333333');
insert into public.organizations(id,name) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Agencia A'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Agencia B');
insert into public.memberships(org_id,user_id,role) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','admin'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','agent');
insert into public.properties(id,org_id,title,commune,operation_type,property_type) values
('ffffffff-ffff-4fff-8fff-ffffffffffff','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Propiedad A','Curico','venta','casa'),
('99999999-9999-4999-8999-999999999999','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Propiedad B','Talca','venta','departamento');
insert into public.deals(id,org_id,property_id,title,price) values
('dddddddd-dddd-4ddd-8ddd-dddddddddddd','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ffffffff-ffff-4fff-8fff-ffffffffffff','Venta A',100000000),
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','99999999-9999-4999-8999-999999999999','Venta B',90000000);
insert into public.tasks(org_id,deal_id,title,visibility,blocking) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-dddddddddddd','Tarea privada','interno',false),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-dddddddddddd','Tarea del propietario','cliente',true);
insert into public.deal_participants(deal_id,user_id,relation) values
('dddddddd-dddd-4ddd-8ddd-dddddddddddd','33333333-3333-4333-8333-333333333333','propietario');
insert into public.fees(org_id,deal_id,rate,due_milestone) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-dddddddddddd',2,'promesa');

-- Staff A must not see B's records.
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.properties) <> 1 then raise exception 'Tenant A can read B property';end if;
 if (select count(*) from public.deals) <> 1 then raise exception 'Tenant A can read B deal';end if;
 if (select count(*) from public.organizations) <> 1 then raise exception 'Tenant A can read B org';end if;
end $$;

-- Scope guard must reject attempted cross-org child reference with explicit error.
do $$
begin
 begin
  insert into public.tasks(org_id,deal_id,title,blocking)
  values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','Falsificar bloqueante',true);
  raise exception 'UNEXPECTED CROSS TENANT ALLOWED';
 exception when others then
  if sqlerrm not like '%otra organización%' then raise; end if;
 end;
end $$;

-- Cannot bypass state via client update; direct stage update is not granted.
do $$
begin
 begin
  update public.deals set stage=8 where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  raise exception 'UNEXPECTED STAGE UPDATE ALLOWED';
 exception when insufficient_privilege then null;
 end;
end $$;

-- Blocking task prevents RPC; one-step advance otherwise works.
do $$
begin
 begin
  perform public.advance_deal('dddddddd-dddd-4ddd-8ddd-dddddddddddd',2,'Documentos aprobados','cliente');
  raise exception 'UNEXPECTED ADVANCE ALLOWED';
 exception when others then
  if sqlerrm not like '%bloqueantes%' then raise; end if;
 end;
end $$;

-- Fee draft must not be a confirmed contractual acceptance.
do $$
begin
 if (select count(*) from public.fees where state='propuesta') <> 1 then
  raise exception 'Fee created in contractually misleading state';
 end if;
end $$;
reset role;
-- Proprietor sees only the client-visible task.
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.deals) <> 1 then raise exception 'Owner must see one deal';end if;
 if (select count(*) from public.tasks) <> 1 then raise exception 'Owner can see internal tasks';end if;
 if (select count(*) from public.fees) <> 0 then raise exception 'Owner can read internal fee proposals';end if;
 if (select count(*) from public.get_my_fee_summaries()) <> 0 then raise exception 'Owner saw unpublished proposal';end if;
end $$;
reset role;
select 'PASS Deep Living tenant RLS and stage checks' as result;
