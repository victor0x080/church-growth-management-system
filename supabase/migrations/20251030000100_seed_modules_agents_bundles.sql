-- Seed new agents, modules, and bundles per provided catalog
-- Uses unified catalog_* tables and relation tables created in 20251029000100_reset_catalog_and_create_unified.sql

begin;

-- Agents (minimal fields; JSONB arrays where applicable)
insert into catalog_agents (agent_id, name, description, category, version, status, icon, tags, roles_served, created_at, updated_at)
values
  -- Community Growth & Strengthening
  ('agt_personality_matcher_v1','Personality Matcher','OpenAI-based profiling to match members.','Engagement','1.0.0','active','users','["matching","profiles"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_life_event_matcher_v1','Life Event Matcher','Extracts context and scores life events.','Engagement','1.0.0','active','calendar','["context","events"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_social_graph_analyzer_v1','Social Graph Analyzer','Manages relationships and network graph.','Engagement','1.0.0','active','share-2','["graph","relationships"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_relationship_strength_v1','Relationship Strength Calculator','Computes engagement-based relationship strength.','Engagement','1.0.0','active','activity','["engagement","metrics"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_small_group_manager_v1','Small Group Manager','Forms and manages small groups.','Engagement','1.0.0','active','users-round','["groups","matching"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_engagement_scoring_v1','Engagement Scoring Agent','Multidimensional engagement scoring.','Engagement','1.0.0','active','gauge','["scoring","engagement"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_profile_embedding_v1','Profile Embedding Service','Embeddings for similarity search (pgvector).','Engagement','1.0.0','active','sparkles','["embeddings","pgvector"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),

  -- Proactive Pastoral Care
  ('agt_disconnection_alert_v1','Disconnection Alert System','Detects disengagement risk.','Care','1.0.0','active','alert-triangle','["risk","alert"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_alert_routing_v1','Alert Routing & Assignment','Routes alerts to owners.','Care','1.0.0','active','send','["routing","assignment"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_care_comms_v1','Care Communication Manager','Coordinates outreach communications.','Care','1.0.0','active','messages-square','["comms","care"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_daily_checkin_v1','Daily Check-in Scheduler','Schedules periodic check-ins.','Care','1.0.0','active','clock','["scheduler","check-in"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_alert_resolution_v1','Alert Resolution Tracker','Tracks alert resolution workflow.','Care','1.0.0','active','check-circle-2','["workflow","resolution"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),

  -- Micro-Volunteering
  ('agt_micro_task_manager_v1','Micro-task Manager','Creates and manages micro-tasks.','Volunteering','1.0.0','active','list-checks','["tasks","micro"]'::jsonb,'["Admin","VolunteerLead"]'::jsonb, now(), now()),
  ('agt_volunteer_matcher_v1','Volunteer Matcher','7D skill & availability matching.','Volunteering','1.0.0','active','users','["matching","skills"]'::jsonb,'["Admin","VolunteerLead"]'::jsonb, now(), now()),
  ('agt_task_lifecycle_v1','Task Lifecycle Agent','End-to-end task lifecycle.','Volunteering','1.0.0','active','repeat','["lifecycle","tasks"]'::jsonb,'["Admin","VolunteerLead"]'::jsonb, now(), now()),
  ('agt_gamification_v1','Gamification & Reputation','Reputation and incentives.','Volunteering','1.0.0','active','star','["gamification","reputation"]'::jsonb,'["Admin","VolunteerLead"]'::jsonb, now(), now()),
  ('agt_task_dispatcher_v1','Real-time Task Dispatcher','Dispatches offers in real time.','Volunteering','1.0.0','active','bolt','["realtime","dispatch"]'::jsonb,'["Admin","VolunteerLead"]'::jsonb, now(), now()),

  -- Communication & Engagement
  ('agt_connection_ai_v1','Connection AI Agents','Introductions, follow-ups, coordinators.','Communication','1.0.0','active','handshake','["connections","followup"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_volunteer_followups_v1','Volunteer Agents','Reminders and follow-ups.','Communication','1.0.0','active','bell','["reminders","volunteers"]'::jsonb,'["Admin","VolunteerLead"]'::jsonb, now(), now()),
  ('agt_content_rag_v1','Content Agents','AI content augmentation & RAG.','Communication','1.0.0','active','file-text','["content","rag"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_email_sync_v1','Email Agents','Syncing, classification, bulk sending.','Communication','1.0.0','active','inbox','["email","sync"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_comm_generation_v1','Communication Agents','Email generation & notifications.','Communication','1.0.0','active','message-square','["generation","notify"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_pastoral_coach_v1','Pastoral Care Agents','Risk scoring & coaching.','Communication','1.0.0','active','heart','["care","coaching"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_admin_analytics_v1','Administrative Agents','Analytics and leaderboards.','Communication','1.0.0','active','bar-chart','["analytics","admin"]'::jsonb,'["Admin"]'::jsonb, now(), now()),

  -- RAG System
  ('agt_content_ingest_v1','Content Ingestion Pipeline','Ingests and normalizes content.','Reporting','1.0.0','active','upload','["ingest","content"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_embed_generator_v1','Chunk & Embedding Generator','Semantic chunking & vectors.','Reporting','1.0.0','active','vector','["embedding","pgvector"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_rag_query_v1','RAG Query Processor','Retrieval augmented generation.','Reporting','1.0.0','active','search','["rag","query"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_weekly_digest_v1','Weekly Digest Generator','Generates weekly digests.','Reporting','1.0.0','active','calendar','["digest","reports"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),

  -- Email Management
  ('agt_email_classify_v1','Email Sync & Classification','Processes inbound email.','Monitoring','1.0.0','active','mail','["email","classification"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_sentiment_priority_v1','Sentiment & Priority Scoring','Scores messages.','Monitoring','1.0.0','active','gauge','["sentiment","priority"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_routing_assignment_v1','Routing & Assignment','Routes messages.','Monitoring','1.0.0','active','route','["routing","assignment"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_response_tracking_v1','Response Tracking','Tracks responses and SLAs.','Monitoring','1.0.0','active','timer','["tracking","sla"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_inbox_dashboard_v1','Staff Inbox Dashboard','Unified inbox view.','Monitoring','1.0.0','active','layout','["dashboard","inbox"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),

  -- NMEO
  ('agt_newcomer_concierge_v1','Newcomer Concierge','Welcome messages and scheduling.','Engagement','1.0.0','active','smile','["welcome","concierge"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_group_matchmaker_v1','Group Matchmaker','Matches people to groups.','Engagement','1.0.0','active','users','["groups","matchmaking"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_serve_coordinator_v1','Serve Coordinator','Onboards volunteers to serving.','Engagement','1.0.0','active','hand','["serve","onboarding"]'::jsonb,'["Minister","Admin","VolunteerLead"]'::jsonb, now(), now()),
  ('agt_pastoral_triage_v1','Pastoral Triage Sentinel','Detects needs.','Engagement','1.0.0','active','alert-octagon','["triage","needs"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_followup_scheduler_v1','Follow-Up Scheduler','Automates follow-up schedule.','Engagement','1.0.0','active','calendar','["followup","schedule"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),
  ('agt_pathway_navigator_v1','Pathway Navigator','Dynamic journey routing.','Engagement','1.0.0','active','map','["journey","routing"]'::jsonb,'["Minister","Admin"]'::jsonb, now(), now()),

  -- Social Media Manager (placeholder)
  ('agt_smm_stream_v1','Service Streaming','Streams services.','Engagement','1.0.0','active','broadcast','["streaming","video"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_smm_content_gen_v1','Content Generation','Generates social content.','Engagement','1.0.0','active','pen-tool','["content","social"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_smm_distribution_v1','Content Distribution','Distributes content.','Engagement','1.0.0','active','send','["distribution","social"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now()),
  ('agt_smm_community_v1','Community Engagement','Manages conversations.','Engagement','1.0.0','active','message-circle','["community","engagement"]'::jsonb,'["Admin","ProjectLead"]'::jsonb, now(), now())
on conflict (agent_id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  version = excluded.version,
  status = excluded.status,
  icon = excluded.icon,
  tags = excluded.tags,
  roles_served = excluded.roles_served,
  updated_at = now();

-- Modules
insert into catalog_modules (module_id, name, description, expected_outcomes, category, owner, version, status, estimated_setup_mins, roles_served, icon, tags, created_at, updated_at)
values
  ('mod_community_growth','Community Growth and Strengthening','Member matching, connection analysis, and engagement tracking.','["Increased returning visitors","Consistent follow-up","Better engagement visibility"]'::jsonb,'Engagement','product:embark','2.0.0','active',15,'["Minister","Admin","VolunteerLead"]'::jsonb,'users','["growth","retention"]'::jsonb, now(), now()),
  ('mod_pastoral_care','Proactive Pastoral Care','Disengagement risk detection and care coordination.','["Early risk detection","Coordinated outreach","Faster resolution"]'::jsonb,'Care','product:embark','1.0.0','active',15,'["Minister","Admin"]'::jsonb,'heart','["care","risk"]'::jsonb, now(), now()),
  ('mod_micro_volunteering','Intelligent Micro-Volunteering','Volunteer-task matching and lifecycle management.','["Faster matching","Higher volunteer engagement","Clear lifecycle"]'::jsonb,'Volunteering','product:embark','1.0.0','active',15,'["Admin","VolunteerLead"]'::jsonb,'sparkles','["volunteer","tasks"]'::jsonb, now(), now()),
  ('mod_comms_engagement','Communication and engagement','AI-driven automation for connections, content, and communication.','["Smoother communication","Less manual work"]'::jsonb,'Communication','product:embark','1.0.0','active',10,'["Admin","ProjectLead"]'::jsonb,'message-square','["comms","content"]'::jsonb, now(), now()),
  ('mod_rag','Content Augmentation & Retrieval (RAG)','AI-enhanced content ingestion, embedding, search, and generation.','["Faster answers","Better content reuse"]'::jsonb,'Reporting','product:embark','1.0.0','active',20,'["Admin","ProjectLead"]'::jsonb,'file-search','["rag","embedding"]'::jsonb, now(), now()),
  ('mod_email_mgmt','Email Management','AI-enabled email processing to support communication flow.','["Fewer missed messages","Faster responses"]'::jsonb,'Monitoring','product:embark','1.0.0','active',10,'["Admin","ProjectLead"]'::jsonb,'inbox','["email","workflow"]'::jsonb, now(), now()),
  ('mod_nmeo','New Member Engagement & Onboarding (NMEO)','AI-guided onboarding journeys to improve newcomer assimilation.','["Faster first contact","Higher newcomer retention"]'::jsonb,'Engagement','product:embark','2.0.0','active',15,'["Minister","Admin","VolunteerLead"]'::jsonb,'users','["onboarding","welcome"]'::jsonb, now(), now()),
  ('mod_social_media','Social Media Manager','AI-guided social media management.','["Consistent social presence","Better engagement"]'::jsonb,'Engagement','product:embark','1.0.0','active',10,'["Admin","ProjectLead"]'::jsonb,'megaphone','["social","content"]'::jsonb, now(), now())
on conflict (module_id) do update set
  name = excluded.name,
  description = excluded.description,
  expected_outcomes = excluded.expected_outcomes,
  category = excluded.category,
  owner = excluded.owner,
  version = excluded.version,
  status = excluded.status,
  estimated_setup_mins = excluded.estimated_setup_mins,
  roles_served = excluded.roles_served,
  icon = excluded.icon,
  tags = excluded.tags,
  updated_at = now();

-- Required (minimal) and Optional agent mappings
-- Clear any conflicting optional entries before inserting
delete from module_optional_agents mo
using module_required_agents mr
where mr.module_id = mo.module_id and mr.agent_id = mo.agent_id;

-- Required
insert into module_required_agents (module_id, agent_id) values
  ('mod_community_growth','agt_engagement_scoring_v1'),
  ('mod_pastoral_care','agt_disconnection_alert_v1'),
  ('mod_micro_volunteering','agt_micro_task_manager_v1'),
  ('mod_comms_engagement','agt_comm_generation_v1'),
  ('mod_rag','agt_rag_query_v1'),
  ('mod_email_mgmt','agt_email_classify_v1'),
  ('mod_nmeo','agt_newcomer_concierge_v1'),
  ('mod_social_media','agt_smm_content_gen_v1')
on conflict (module_id, agent_id) do nothing;

-- Optional (most agents selectable)
insert into module_optional_agents (module_id, agent_id) values
  -- Community Growth optional
  ('mod_community_growth','agt_personality_matcher_v1'),
  ('mod_community_growth','agt_life_event_matcher_v1'),
  ('mod_community_growth','agt_social_graph_analyzer_v1'),
  ('mod_community_growth','agt_relationship_strength_v1'),
  ('mod_community_growth','agt_small_group_manager_v1'),
  ('mod_community_growth','agt_profile_embedding_v1'),
  -- Pastoral Care optional
  ('mod_pastoral_care','agt_alert_routing_v1'),
  ('mod_pastoral_care','agt_care_comms_v1'),
  ('mod_pastoral_care','agt_daily_checkin_v1'),
  ('mod_pastoral_care','agt_alert_resolution_v1'),
  -- Micro-Volunteering optional
  ('mod_micro_volunteering','agt_volunteer_matcher_v1'),
  ('mod_micro_volunteering','agt_task_lifecycle_v1'),
  ('mod_micro_volunteering','agt_gamification_v1'),
  ('mod_micro_volunteering','agt_task_dispatcher_v1'),
  -- Communications optional
  ('mod_comms_engagement','agt_connection_ai_v1'),
  ('mod_comms_engagement','agt_volunteer_followups_v1'),
  ('mod_comms_engagement','agt_content_rag_v1'),
  ('mod_comms_engagement','agt_email_sync_v1'),
  ('mod_comms_engagement','agt_pastoral_coach_v1'),
  ('mod_comms_engagement','agt_admin_analytics_v1'),
  -- RAG optional
  ('mod_rag','agt_content_ingest_v1'),
  ('mod_rag','agt_embed_generator_v1'),
  ('mod_rag','agt_weekly_digest_v1'),
  -- Email Management optional
  ('mod_email_mgmt','agt_sentiment_priority_v1'),
  ('mod_email_mgmt','agt_routing_assignment_v1'),
  ('mod_email_mgmt','agt_response_tracking_v1'),
  ('mod_email_mgmt','agt_inbox_dashboard_v1'),
  -- NMEO optional
  ('mod_nmeo','agt_group_matchmaker_v1'),
  ('mod_nmeo','agt_serve_coordinator_v1'),
  ('mod_nmeo','agt_pastoral_triage_v1'),
  ('mod_nmeo','agt_followup_scheduler_v1'),
  ('mod_nmeo','agt_pathway_navigator_v1'),
  -- Social Media optional
  ('mod_social_media','agt_smm_stream_v1'),
  ('mod_social_media','agt_smm_distribution_v1'),
  ('mod_social_media','agt_smm_community_v1')
on conflict (module_id, agent_id) do nothing;

-- Bundles
insert into catalog_bundles (bundle_id, name, description, expected_outcomes, percent_users_using, tier, pricing, visibility, version, status, icon, tags, created_at, updated_at)
values
  ('bndl_foundation_plus','Foundation+','Everything a small church needs to get started fast—core management plus event-aware assistants.',
    '["Lower admin workload","Faster newcomer follow-up","Clear view of upcoming priorities"]'::jsonb, 54.3,
    'Starter','{"currency":"USD","model":"freemium","monthly":0,"notes":"Core functions free; assistants billed separately."}',
    'public','1.1.0','active','sparkle-pack','["starter","onboarding"]'::jsonb, now(), now()),
  ('bndl_operations_guarded','Operations Guarded','Comms, monitoring and care with governance-like safeguards.',
    '["Fewer misses","Automated follow-ups","Policy alignment"]'::jsonb, 41.2,
    'Growth','{"currency":"USD","model":"subscription","monthly":99,"notes":"Includes monitoring and follow-ups."}',
    'public','1.0.0','active','shield-stars','["operations","governance"]'::jsonb, now(), now()),
  ('bndl_execution_suite','Execution Suite','Full pipeline from engagement to delivery with reporting.','["Predictable delivery","Optimized schedules","Live health"]'::jsonb, 33.7,
    'Pro','{"currency":"USD","model":"subscription","monthly":199,"notes":"Adds advanced content and alert rules."}',
    'public','1.0.0','active','rocket','["execution","planning","monitoring"]'::jsonb, now(), now())
on conflict (bundle_id) do update set
  name = excluded.name,
  description = excluded.description,
  expected_outcomes = excluded.expected_outcomes,
  percent_users_using = excluded.percent_users_using,
  tier = excluded.tier,
  pricing = excluded.pricing,
  visibility = excluded.visibility,
  version = excluded.version,
  status = excluded.status,
  icon = excluded.icon,
  tags = excluded.tags,
  updated_at = now();

-- Bundle membership
insert into bundle_modules (bundle_id, module_id) values
  -- Foundation+: community, email, NMEO
  ('bndl_foundation_plus','mod_community_growth'),
  ('bndl_foundation_plus','mod_email_mgmt'),
  ('bndl_foundation_plus','mod_nmeo'),
  -- Operations Guarded: comms, pastoral care, micro-volunteering
  ('bndl_operations_guarded','mod_comms_engagement'),
  ('bndl_operations_guarded','mod_pastoral_care'),
  ('bndl_operations_guarded','mod_micro_volunteering'),
  -- Execution Suite: broader set
  ('bndl_execution_suite','mod_community_growth'),
  ('bndl_execution_suite','mod_comms_engagement'),
  ('bndl_execution_suite','mod_rag'),
  ('bndl_execution_suite','mod_email_mgmt'),
  ('bndl_execution_suite','mod_nmeo'),
  ('bndl_execution_suite','mod_micro_volunteering')
on conflict (bundle_id, module_id) do nothing;

commit;


