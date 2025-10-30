-- Create core catalog tables based on product_catalog.md
-- Idempotent: uses IF NOT EXISTS and UPSERT-like inserts guarded by ON CONFLICT

begin;

-- Agents catalog
create table if not exists public.catalog_agents (
  agent_id text primary key,
  name text not null,
  description text,
  category text,
  version text,
  status text,
  icon text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Modules (Crews)
create table if not exists public.catalog_modules (
  module_id text primary key,
  name text not null,
  description text,
  category text,
  owner text,
  version text,
  status text,
  icon text,
  estimated_setup_mins integer,
  roles_served text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Required/Optional agent relationships
create table if not exists public.module_required_agents (
  module_id text references public.catalog_modules(module_id) on delete cascade,
  agent_id text references public.catalog_agents(agent_id) on delete cascade,
  primary key (module_id, agent_id)
);

create table if not exists public.module_optional_agents (
  module_id text references public.catalog_modules(module_id) on delete cascade,
  agent_id text references public.catalog_agents(agent_id) on delete cascade,
  primary key (module_id, agent_id)
);

-- Bundles and membership
-- Bundles is exposed as a view in this project; seed into the base table catalog_bundles

-- Use existing bundle_modules (created by reset migration) for relationships

-- Compatibility view for agents per module (required + optional)
create or replace view public.module_agents as
select m.module_id as module_name,
       a.agent_id  as agent_name,
       0::numeric  as price
from public.module_required_agents mr
join public.catalog_modules m on m.module_id = mr.module_id
join public.catalog_agents a on a.agent_id = mr.agent_id
union
select m.module_id as module_name,
       a.agent_id  as agent_name,
       0::numeric  as price
from public.module_optional_agents mo
join public.catalog_modules m on m.module_id = mo.module_id
join public.catalog_agents a on a.agent_id = mo.agent_id;

-- Seed agents
insert into public.catalog_agents (agent_id, name, description, category, version, status, icon, tags, created_at, updated_at)
values
  ('agt_planner_v1','Planner Agent','Parses strategic plans into measurable objectives.','Task Management','1.0.0','active','plan','["planning","wbs","objectives"]'::jsonb, now(), now()),
  ('agt_decomposer_v1','Decomposer Agent','Breaks objectives into EPIC → Story → Task (WBS).','Task Management','1.0.0','active','split','["wbs","decomposition"]'::jsonb, now(), now()),
  ('agt_estimator_v1','Estimator Agent','Estimates effort, duration, and dates using historical velocity.','Task Management','1.0.0','active','gauge','["estimation","scheduling"]'::jsonb, now(), now()),
  ('agt_assigner_v1','Assigner Agent','Assigns tasks to team members based on skills and capacity.','Task Management','1.0.0','active','users','["assignment","capacity"]'::jsonb, now(), now()),
  ('agt_scheduler_v1','Scheduler Agent','Sequences tasks and computes the critical path.','Task Management','1.0.0','active','timeline','["scheduling","cpm"]'::jsonb, now(), now()),
  ('agt_email_ingest_v1','Email Ingest Agent','Fetches inbound emails and normalizes content.','Monitoring','1.0.0','active','inbox','["email","ingest"]'::jsonb, now(), now()),
  ('agt_status_extractor_v1','Status Extractor Agent','Extracts structured task updates from email content.','Monitoring','1.0.0','active','extract','["nlp","status"]'::jsonb, now(), now()),
  ('agt_monitor_v1','Monitor Agent','Monitors SLAs, overdue tasks, and triggers follow-ups.','Monitoring','1.0.0','active','monitor','["sla","alerts"]'::jsonb, now(), now()),
  ('agt_roadblock_v1','Roadblock Agent','Detects blockers and proposes mitigations.','Monitoring','1.0.0','active','traffic-cone','["risk","mitigation"]'::jsonb, now(), now()),
  ('agt_escalation_v1','Escalation Agent','Handles SLA breaches and escalates issues.','Monitoring','1.0.0','active','alert','["escalation","sla"]'::jsonb, now(), now()),
  ('agt_reporter_v1','Reporter Agent','Generates periodic reports and digests.','Reporting','1.0.0','active','bar-chart','["reporting","analytics"]'::jsonb, now(), now()),
  ('agt_governance_v1','Governance Agent','Enforces guardrails: PII redaction, citations, policy.','Reporting','1.0.0','active','shield-check','["governance","safety"]'::jsonb, now(), now())
on conflict (agent_id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  version = excluded.version,
  status = excluded.status,
  icon = excluded.icon,
  tags = excluded.tags,
  updated_at = now();

-- Seed modules
insert into public.catalog_modules (module_id, name, description, category, owner, version, status, icon, estimated_setup_mins, roles_served, created_at, updated_at)
values
  ('mod_planning_crew','Planning Crew','Planner → Decomposer → Estimator → Assigner → Scheduler to transform plans into executable, scheduled work.','Task Management','module:agentic-task','1.0.0','active','flow',10, '["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('mod_monitoring_crew','Monitoring Crew','Email ingest and status extraction feed SLA monitoring, with roadblock detection and escalation.','Monitoring','module:agentic-task','1.0.0','active','activity',15, '["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('mod_reporting_crew','Reporting Crew','Automated reporting and governance checks for compliance and visibility.','Reporting','module:agentic-task','1.0.0','active','clipboard-list',5, '["Admin","ProjectLead"]'::jsonb, now(), now())
on conflict (module_id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  owner = excluded.owner,
  version = excluded.version,
  status = excluded.status,
  icon = excluded.icon,
  estimated_setup_mins = excluded.estimated_setup_mins,
  roles_served = excluded.roles_served,
  updated_at = now();

-- Seed module required agents (from requiredAgentIds)
insert into public.module_required_agents (module_id, agent_id)
values
  -- Planning Crew (minimal required)
  ('mod_planning_crew','agt_planner_v1'),
  -- Monitoring Crew (minimal required)
  ('mod_monitoring_crew','agt_email_ingest_v1'),
  ('mod_monitoring_crew','agt_monitor_v1'),
  -- Reporting Crew (minimal required)
  ('mod_reporting_crew','agt_reporter_v1')
on conflict (module_id, agent_id) do nothing;

-- Normalize: keep only minimal required set to avoid optional overlaps
delete from public.module_required_agents
where (module_id, agent_id) not in (
  ('mod_planning_crew','agt_planner_v1'),
  ('mod_monitoring_crew','agt_email_ingest_v1'),
  ('mod_monitoring_crew','agt_monitor_v1'),
  ('mod_reporting_crew','agt_reporter_v1')
);

-- Seed module optional agents (remaining agents selectable)
insert into public.module_optional_agents (module_id, agent_id)
values
  -- Planning Crew optional
  ('mod_planning_crew','agt_decomposer_v1'),
  ('mod_planning_crew','agt_estimator_v1'),
  ('mod_planning_crew','agt_assigner_v1'),
  ('mod_planning_crew','agt_scheduler_v1'),
  -- Monitoring Crew optional
  ('mod_monitoring_crew','agt_status_extractor_v1'),
  ('mod_monitoring_crew','agt_roadblock_v1'),
  ('mod_monitoring_crew','agt_escalation_v1'),
  -- Reporting Crew optional
  ('mod_reporting_crew','agt_governance_v1')
on conflict (module_id, agent_id) do nothing;

-- Seed bundles
insert into public.catalog_bundles (bundle_id, name, description, tier, visibility, status, icon, expected_outcomes, percent_users_using, pricing, version, created_at, updated_at)
values
  ('bndl_foundation_plus','Foundation+','Everything needed to get started—planning, monitoring, and reporting crews.','Starter','public','active','sparkle-pack',
    '["Lower admin workload","Faster execution","Clear visibility"]'::jsonb, 54.3, '{"currency":"USD","model":"freemium","monthly":0,"notes":"Core functions free; agents billed separately."}'::jsonb, '1.1.0', now(), now()),
  ('bndl_operations_guarded','Operations Guarded','Monitoring and reporting with governance for teams needing strong safeguards.','Growth','public','active','shield-stars',
    '["Fewer SLA breaches","Automated reports","Policy compliance"]'::jsonb, 41.2, '{"currency":"USD","model":"subscription","monthly":99,"notes":"Includes monitoring alerts and weekly digests."}'::jsonb, '1.0.0', now(), now()),
  ('bndl_execution_suite','Execution Suite','Full pipeline from plan to execution with real-time monitoring and reporting.','Pro','public','active','rocket',
    '["Predictable delivery","Optimized schedules","Live health metrics"]'::jsonb, 33.7, '{"currency":"USD","model":"subscription","monthly":199,"notes":"Adds advanced scheduling and alert rules."}'::jsonb, '1.0.0', now(), now())
on conflict (bundle_id) do update set
  name = excluded.name,
  description = excluded.description,
  tier = excluded.tier,
  visibility = excluded.visibility,
  status = excluded.status,
  icon = excluded.icon,
  expected_outcomes = excluded.expected_outcomes,
  percent_users_using = excluded.percent_users_using,
  pricing = excluded.pricing,
  version = excluded.version,
  updated_at = now();

-- Seed bundle membership
insert into public.bundle_modules (bundle_id, module_id) values
  ('bndl_foundation_plus','mod_planning_crew'),
  ('bndl_foundation_plus','mod_monitoring_crew'),
  ('bndl_foundation_plus','mod_reporting_crew'),
  ('bndl_operations_guarded','mod_monitoring_crew'),
  ('bndl_operations_guarded','mod_reporting_crew'),
  ('bndl_execution_suite','mod_planning_crew'),
  ('bndl_execution_suite','mod_monitoring_crew'),
  ('bndl_execution_suite','mod_reporting_crew')
on conflict (bundle_id, module_id) do nothing;

commit;


-- Ensure no duplication between required and optional agent mappings
-- Cleanup any overlaps created by prior seeds
delete from public.module_optional_agents mo
where exists (
  select 1 from public.module_required_agents mr
  where mr.module_id = mo.module_id and mr.agent_id = mo.agent_id
);

-- Triggers to enforce mutual exclusivity going forward
create or replace function public.enforce_agent_exclusivity_required()
returns trigger
language plpgsql as $$
begin
  if exists (
    select 1 from public.module_optional_agents mo
    where mo.module_id = new.module_id and mo.agent_id = new.agent_id
  ) then
    raise exception 'Agent % for module % is already marked OPTIONAL', new.agent_id, new.module_id;
  end if;
  return new;
end$$;

create or replace function public.enforce_agent_exclusivity_optional()
returns trigger
language plpgsql as $$
begin
  if exists (
    select 1 from public.module_required_agents mr
    where mr.module_id = new.module_id and mr.agent_id = new.agent_id
  ) then
    raise exception 'Agent % for module % is already marked REQUIRED', new.agent_id, new.module_id;
  end if;
  return new;
end$$;

drop trigger if exists trg_required_exclusive on public.module_required_agents;
create trigger trg_required_exclusive
before insert on public.module_required_agents
for each row execute function public.enforce_agent_exclusivity_required();

drop trigger if exists trg_optional_exclusive on public.module_optional_agents;
create trigger trg_optional_exclusive
before insert on public.module_optional_agents
for each row execute function public.enforce_agent_exclusivity_optional();

