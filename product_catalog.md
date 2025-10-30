## Agents

```json
{
  "agentId": "agt_planner_v1",
  "name": "Planner Agent",
  "description": "Parses strategic plans into measurable objectives.",
  "expectedOutcomes": ["Clear objectives", "Traceable scope", "Plan-to-task alignment"],
  "percentUsersUsing": null,
  "category": "Task Management",
  "capabilities": ["parse_plan", "define_objectives"],
  "eventTypesWatched": [],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": [],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "plan",
  "tags": ["planning", "wbs", "objectives"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_decomposer_v1",
  "name": "Decomposer Agent",
  "description": "Breaks objectives into EPIC → Story → Task (WBS).",
  "expectedOutcomes": ["Structured work breakdown", "Better estimations", "Dependency visibility"],
  "percentUsersUsing": null,
  "category": "Task Management",
  "capabilities": ["generate_wbs"],
  "eventTypesWatched": [],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": ["agt_planner_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "split",
  "tags": ["wbs", "decomposition"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_estimator_v1",
  "name": "Estimator Agent",
  "description": "Estimates effort, duration, and dates using historical velocity.",
  "expectedOutcomes": ["Realistic schedules", "Predictable delivery"],
  "percentUsersUsing": null,
  "category": "Task Management",
  "capabilities": ["estimate_effort", "estimate_duration"],
  "eventTypesWatched": [],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": ["agt_decomposer_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "gauge",
  "tags": ["estimation", "scheduling"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_assigner_v1",
  "name": "Assigner Agent",
  "description": "Assigns tasks to team members based on skills and capacity.",
  "expectedOutcomes": ["Balanced workload", "Higher throughput"],
  "percentUsersUsing": null,
  "category": "Task Management",
  "capabilities": ["auto_assign"],
  "eventTypesWatched": [],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": ["agt_estimator_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "users",
  "tags": ["assignment", "capacity"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_scheduler_v1",
  "name": "Scheduler Agent",
  "description": "Sequences tasks and computes the critical path.",
  "expectedOutcomes": ["Optimized schedules", "Critical path clarity"],
  "percentUsersUsing": null,
  "category": "Task Management",
  "capabilities": ["schedule", "critical_path"],
  "eventTypesWatched": [],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": ["agt_assigner_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "timeline",
  "tags": ["scheduling", "cpm"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_email_ingest_v1",
  "name": "Email Ingest Agent",
  "description": "Fetches inbound emails and normalizes content.",
  "expectedOutcomes": ["Reduced manual updates", "Faster status sync"],
  "percentUsersUsing": null,
  "category": "Monitoring",
  "capabilities": ["imap_poll", "webhook_ingest"],
  "eventTypesWatched": ["email.received"],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": ["email_integration"],
  "dependencies": [],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "inbox",
  "tags": ["email", "ingest"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_status_extractor_v1",
  "name": "Status Extractor Agent",
  "description": "Extracts structured task updates from email content.",
  "expectedOutcomes": ["Accurate status updates", "Lower admin work"],
  "percentUsersUsing": null,
  "category": "Monitoring",
  "capabilities": ["extract_status"],
  "eventTypesWatched": ["email.normalized"],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": ["email_integration"],
  "dependencies": ["agt_email_ingest_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "extract",
  "tags": ["nlp", "status"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_monitor_v1",
  "name": "Monitor Agent",
  "description": "Monitors SLAs, overdue tasks, and triggers follow-ups.",
  "expectedOutcomes": ["Fewer SLA breaches", "Early risk detection"],
  "percentUsersUsing": null,
  "category": "Monitoring",
  "capabilities": ["watch_tasks", "evaluate_sla", "trigger_followup"],
  "eventTypesWatched": ["task.updated", "task.created", "email.parsed"],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": ["agt_status_extractor_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "monitor",
  "tags": ["sla", "alerts"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_roadblock_v1",
  "name": "Roadblock Agent",
  "description": "Detects blockers and proposes mitigations.",
  "expectedOutcomes": ["Faster unblock", "Reduced cycle time"],
  "percentUsersUsing": null,
  "category": "Monitoring",
  "capabilities": ["detect_blockers", "propose_mitigations"],
  "eventTypesWatched": ["task.blocked", "task.at_risk"],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": ["agt_monitor_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "traffic-cone",
  "tags": ["risk", "mitigation"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_escalation_v1",
  "name": "Escalation Agent",
  "description": "Handles SLA breaches and escalates issues.",
  "expectedOutcomes": ["Timely escalation", "Resolved blockers"],
  "percentUsersUsing": null,
  "category": "Monitoring",
  "capabilities": ["escalate", "notify_owners"],
  "eventTypesWatched": ["task.sla_breach"],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": ["agt_roadblock_v1"],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "alert",
  "tags": ["escalation", "sla"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_reporter_v1",
  "name": "Reporter Agent",
  "description": "Generates periodic reports and digests.",
  "expectedOutcomes": ["Visibility", "Informed decisions"],
  "percentUsersUsing": null,
  "category": "Reporting",
  "capabilities": ["generate_reports", "weekly_digest"],
  "eventTypesWatched": ["schedule.tick.weekly"],
  "rolesServed": ["Admin", "ProjectLead"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": [],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "bar-chart",
  "tags": ["reporting", "analytics"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "agentId": "agt_governance_v1",
  "name": "Governance Agent",
  "description": "Enforces guardrails: PII redaction, citations, policy.",
  "expectedOutcomes": ["Compliance", "Safety"],
  "percentUsersUsing": null,
  "category": "Reporting",
  "capabilities": ["redact_pii", "enforce_policy", "check_citations"],
  "eventTypesWatched": [],
  "rolesServed": ["Admin"],
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": [],
  "compatibility": { "regions": ["US"], "languages": ["en"] },
  "telemetry": null,
  "icon": "shield-check",
  "tags": ["governance", "safety"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

## Modules (Crews)

```json
{
  "moduleId": "mod_planning_crew",
  "name": "Planning Crew",
  "description": "Planner → Decomposer → Estimator → Assigner → Scheduler to transform plans into executable, scheduled work.",
  "expectedOutcomes": ["Structured WBS", "Realistic estimates", "Optimized schedules"],
  "percentUsersUsing": null,
  "requiredAgentIds": ["agt_planner_v1", "agt_decomposer_v1", "agt_estimator_v1", "agt_assigner_v1", "agt_scheduler_v1"],
  "optionalAgentIds": [],
  "category": "Task Management",
  "owner": "module:agentic-task",
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": [],
  "estimatedSetupMins": 10,
  "rolesServed": ["Admin", "ProjectLead"],
  "metrics": null,
  "icon": "flow",
  "tags": ["planning", "wbs", "scheduling"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "moduleId": "mod_monitoring_crew",
  "name": "Monitoring Crew",
  "description": "Email ingest and status extraction feed SLA monitoring, with roadblock detection and escalation.",
  "expectedOutcomes": ["Fewer missed SLAs", "Faster unblock", "Live task health"],
  "percentUsersUsing": null,
  "requiredAgentIds": ["agt_email_ingest_v1", "agt_status_extractor_v1", "agt_monitor_v1", "agt_roadblock_v1", "agt_escalation_v1"],
  "optionalAgentIds": [],
  "category": "Monitoring",
  "owner": "module:agentic-task",
  "version": "1.0.0",
  "status": "active",
  "prerequisites": ["email_integration"],
  "dependencies": [],
  "estimatedSetupMins": 15,
  "rolesServed": ["Admin", "ProjectLead"],
  "metrics": null,
  "icon": "activity",
  "tags": ["monitoring", "sla", "alerts"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "moduleId": "mod_reporting_crew",
  "name": "Reporting Crew",
  "description": "Automated reporting and governance checks for compliance and visibility.",
  "expectedOutcomes": ["Consistent reporting", "Policy adherence"],
  "percentUsersUsing": null,
  "requiredAgentIds": ["agt_reporter_v1", "agt_governance_v1"],
  "optionalAgentIds": [],
  "category": "Reporting",
  "owner": "module:agentic-task",
  "version": "1.0.0",
  "status": "active",
  "prerequisites": [],
  "dependencies": [],
  "estimatedSetupMins": 5,
  "rolesServed": ["Admin", "ProjectLead"],
  "metrics": null,
  "icon": "clipboard-list",
  "tags": ["reporting", "governance"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

## Bundles

```json
{
  "bundleId": "bndl_foundation_plus",
  "name": "Foundation+",
  "description": "Everything needed to get started—planning, monitoring, and reporting crews.",
  "moduleIds": ["mod_planning_crew", "mod_monitoring_crew", "mod_reporting_crew"],
  "expectedOutcomes": ["Lower admin workload", "Faster execution", "Clear visibility"],
  "percentUsersUsing": 54.3,
  "tier": "Starter",
  "pricing": { "currency": "USD", "model": "freemium", "monthly": 0, "notes": "Core functions free; agents billed separately." },
  "visibility": "public",
  "version": "1.1.0",
  "status": "active",
  "icon": "sparkle-pack",
  "tags": ["starter", "onboarding"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "bundleId": "bndl_operations_guarded",
  "name": "Operations Guarded",
  "description": "Monitoring and reporting with governance for teams needing strong safeguards.",
  "moduleIds": ["mod_monitoring_crew", "mod_reporting_crew"],
  "expectedOutcomes": ["Fewer SLA breaches", "Automated reports", "Policy compliance"],
  "percentUsersUsing": 41.2,
  "tier": "Growth",
  "pricing": { "currency": "USD", "model": "subscription", "monthly": 99, "notes": "Includes monitoring alerts and weekly digests." },
  "visibility": "public",
  "version": "1.0.0",
  "status": "active",
  "icon": "shield-stars",
  "tags": ["operations", "governance"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```

```json
{
  "bundleId": "bndl_execution_suite",
  "name": "Execution Suite",
  "description": "Full pipeline from plan to execution with real-time monitoring and reporting.",
  "moduleIds": ["mod_planning_crew", "mod_monitoring_crew", "mod_reporting_crew"],
  "expectedOutcomes": ["Predictable delivery", "Optimized schedules", "Live health metrics"],
  "percentUsersUsing": 33.7,
  "tier": "Pro",
  "pricing": { "currency": "USD", "model": "subscription", "monthly": 199, "notes": "Adds advanced scheduling and alert rules." },
  "visibility": "public",
  "version": "1.0.0",
  "status": "active",
  "icon": "rocket",
  "tags": ["execution", "planning", "monitoring"],
  "createdAt": "2025-10-28T00:00:00Z",
  "updatedAt": "2025-10-28T00:00:00Z"
}
```


