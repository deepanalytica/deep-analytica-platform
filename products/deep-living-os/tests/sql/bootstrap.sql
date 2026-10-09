-- Postgres test harness simulating only the Supabase schema surface used by DL OS.
-- These tests do not replace tests on a real Supabase instance.
create role authenticated nologin;
create role anon nologin;
create schema if not exists auth;
create table auth.users(id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable
as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create schema if not exists storage;
create table storage.buckets(id text primary key,name text not null,public boolean not null,file_size_limit bigint);
create table storage.objects(bucket_id text,name text);
create or replace function storage.foldername(path text) returns text[]
language sql immutable as $$select string_to_array(regexp_replace(path,'/[^/]+$',''),'/')$$;
grant usage on schema public,auth,storage to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
