-- Deep Mining Intelligence v0.1 — ontology-first, deliberately small.
create extension if not exists pgcrypto;

create table if not exists mining_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  commodity text,
  stage text,
  gate text,
  created_at timestamptz not null default now()
);

create table if not exists mining_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mining_projects(id) on delete cascade,
  title text not null,
  kind text not null,
  uri text,
  authority text,
  observed_at timestamptz,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists mining_evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mining_projects(id) on delete cascade,
  source_id uuid not null references mining_sources(id) on delete cascade,
  title text not null,
  excerpt text,
  quality numeric(4,3) check (quality >= 0 and quality <= 1),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists mining_claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mining_projects(id) on delete cascade,
  statement text not null,
  epistemic_level text not null check (epistemic_level in ('fact','inference','hypothesis','forecast','scenario','recommendation')),
  evidence_ids uuid[] not null default '{}',
  confidence text not null check (confidence in ('low','moderate','high')),
  uncertainty jsonb not null default '[]'::jsonb,
  public_claim boolean not null default false,
  competent_signoff boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists mining_forecasts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mining_projects(id) on delete cascade,
  metric text not null,
  model text not null,
  horizon text not null,
  source_series jsonb not null,
  covariates jsonb not null default '[]'::jsonb,
  backtest_metric text not null,
  backtest_score numeric not null,
  baseline_score numeric not null,
  prediction jsonb not null,
  validated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists mining_risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mining_projects(id) on delete cascade,
  title text not null,
  category text not null,
  severity text not null,
  evidence_ids uuid[] not null default '{}',
  mitigation text,
  created_at timestamptz not null default now()
);

create table if not exists mining_decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references mining_projects(id) on delete cascade,
  title text not null,
  question text not null,
  impact text not null check (impact in ('low','medium','high')),
  status text not null default 'draft',
  options jsonb not null,
  links jsonb not null default '{}'::jsonb,
  uncertainties jsonb not null default '[]'::jsonb,
  human_decision jsonb,
  created_at timestamptz not null default now()
);

create table if not exists mining_audit_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references mining_projects(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  event text not null,
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mining_evidence_project_idx on mining_evidence(project_id);
create index if not exists mining_claims_project_idx on mining_claims(project_id);
create index if not exists mining_decisions_project_idx on mining_decisions(project_id);
create index if not exists mining_audit_project_idx on mining_audit_events(project_id);
