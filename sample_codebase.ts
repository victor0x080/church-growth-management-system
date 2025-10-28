import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Settings, MessageSquare, Play, Pause, StopCircle, CheckCircle2, Clock, Puzzle, Sparkles, Filter, Plus, X, ShoppingCart, Shield, Users, BookOpen, HeartHandshake, HandCoins, Calendar, Home, Building2 } from "lucide-react";

// --- Mock Data (derived from your Catalog sheet & UX groupings) ---
const GROUPS = [
  { id: "accounting", name: "Accounting", icon: HandCoins },
  { id: "membership", name: "Membership", icon: Users },
  { id: "innovation", name: "Innovation", icon: Sparkles },
  { id: "discipleship", name: "Discipleship", icon: BookOpen },
  { id: "planning", name: "Planning", icon: Calendar },
  { id: "stewardship", name: "Stewardship", icon: HandCoins },
  { id: "community", name: "Community", icon: HeartHandshake },
  { id: "ministry", name: "Ministry", icon: Home },
];

// Modules from your sheet (sample, trimmed). Each module can host multiple agents ("digital workers").
const MODULES = [
  { id: "core-data-cloud", name: "Core Data Cloud", group: "membership", type: "Platform" },
  { id: "connections-community", name: "Connections & Community", group: "community", type: "Operational Pack" },
  { id: "interactive-comms", name: "Interactive Comms", group: "community", type: "Operational Pack" },
  { id: "volunteer-ops", name: "Volunteer Ops", group: "community", type: "Operational Pack" },
  { id: "donor-growth", name: "Donor Growth", group: "stewardship", type: "Operational Pack" },
  { id: "care", name: "Care", group: "ministry", type: "Operational Pack" },
  { id: "neighborhood-engagement", name: "Neighborhood Engagement", group: "community", type: "Operational Pack" },
  { id: "finance-accounting", name: "Finance & Accounting", group: "accounting", type: "Operational Pack" },
  { id: "content-distribution", name: "Content & Distribution", group: "innovation", type: "Operational Pack" },
  { id: "assessment-sprint", name: "Assessment Sprint", group: "planning", type: "Episodic Pack" },
  { id: "discernment-journey", name: "Discernment Journey", group: "planning", type: "Episodic Pack" },
  { id: "grant-appeal-builder", name: "Grant/Appeal Builder", group: "stewardship", type: "Episodic Pack" },
  { id: "newcomer-launch", name: "Newcomer Launch Kit", group: "membership", type: "Episodic Pack" },
];

// A few sample agents tied to modules. In reality these would be discovered per-tenant via API.
const AGENTS = [
  { id: "agent-welcome", name: "Welcome Flow Worker", module: "newcomer-launch", skills: ["detect_new_visitor", "send_followup", "assign_greeter"], status: "idle" },
  { id: "agent-donor", name: "Donor Retention Worker", module: "donor-growth", skills: ["lapse_watch", "send_thank_you", "renew_pledge"], status: "running" },
  { id: "agent-volunteer", name: "Volunteer Scheduler", module: "volunteer-ops", skills: ["fill_roster", "handle_subs"], status: "paused" },
  { id: "agent-finance", name: "Auto Reconcile", module: "finance-accounting", skills: ["import_bank_feed", "flag_anomaly"], status: "idle" },
];

// Minimal in-memory "purchases" & toggles
const STARTER_STATE = {
  purchasedModules: new Set(["core-data-cloud", "donor-growth", "volunteer-ops", "finance-accounting", "newcomer-launch"]),
  purchasedAgents: new Set(["agent-welcome", "agent-donor", "agent-volunteer", "agent-finance"]),
};

// --- UI Components ---
const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs opacity-80">{children}</span>
);

const SectionTitle = ({ children, right }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">{children}</h3>
    <div>{right}</div>
  </div>
);

const ModuleToggle = ({ moduleId, active, onToggle, name, type }) => (
  <button onClick={() => onToggle(moduleId)} className={`w-full flex items-center justify-between rounded-xl border p-3 hover:shadow transition ${active ? "bg-white" : "bg-transparent"}`}>
    <div className="flex items-center gap-3">
      <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs opacity-60">{type}</div>
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs">
      <span className={`px-2 py-0.5 rounded-full border ${active ? "border-emerald-500 text-emerald-700" : "border-slate-300"}`}>{active ? "Enabled" : "Enable"}</span>
      <ChevronRight className="h-4 w-4 opacity-60" />
    </div>
  </button>
);

const AgentChip = ({ agent, status }) => {
  const Icon = status === "running" ? Play : status === "paused" ? Pause : Clock;
  return (
    <div className="flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
      <Icon className="h-3.5 w-3.5" />
      <span>{agent}</span>
      <span className="opacity-60">· {status}</span>
    </div>
  );
};

const ConversationBubble = ({ role = "user", text, intents }) => (
  <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[72%] rounded-2xl p-3 shadow-sm ${role === "user" ? "bg-black text-white" : "bg-white"}`}>
      <div className="prose-sm leading-relaxed">{text}</div>
      {intents?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {intents.map((i, idx) => (
            <Pill key={idx}>{i}</Pill>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

const CommandInput = ({ onSubmit, placeholder }) => {
  const [value, setValue] = useState("");
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("cmd");
        el?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <form onSubmit={(e) => {e.preventDefault(); if (value.trim()) onSubmit(value); setValue("");}} className="flex items-center gap-2 rounded-2xl border p-2">
      <Search className="h-5 w-5 opacity-60" />
      <input id="cmd" value={value} onChange={(e)=>setValue(e.target.value)} placeholder={placeholder} className="w-full bg-transparent outline-none" />
      <kbd className="rounded border px-1.5 py-0.5 text-xs opacity-60">⌘K</kbd>
    </form>
  );
};

// --- Root App ---
export default function App() {
  const [state, setState] = useState(STARTER_STATE);
  const [activeGroup, setActiveGroup] = useState("community");
  const [showModuleDrawer, setShowModuleDrawer] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Welcome, Pastor! I can be your ministry guide—summarize the health of your church and call on your Helpers to act. What would you like help with today?", intents: ["Prepare Sunday volunteers", "Welcome this week's newcomers", "Review giving and thank donors"] },
  ]);
  const [nowRunning, setNowRunning] = useState([
    { id: "run-1", agent: "Donor Retention Worker", status: "running", detail: "Scanning donor lapse risk (3/5)" },
  ]);

  const purchased = useMemo(()=>state.purchasedModules, [state]);
  const visibleModules = useMemo(()=>MODULES.filter(m=>purchased.has(m.id)),[state]);

  const submitCommand = (value) => {
    const intents = [];
    if (value.toLowerCase().includes("volunteer")) intents.push("volunteer_rostering");
    if (value.toLowerCase().includes("donor")) intents.push("donor_engagement");
    if (value.toLowerCase().includes("reconcile")) intents.push("bank_reconcile");

    setMessages((prev)=>[...prev, { role: "user", text: value }, { role: "assistant", text: "Planned actions — confirm to execute:", intents: intents.length?intents:["classify", "route_to_agent"] }]);

    setNowRunning((prev)=>[
      { id: `run-${Date.now()}`, agent: intents.includes("volunteer_rostering")?"Volunteer Scheduler":"Welcome Flow Worker", status: "running", detail: "Queued by command" },
      ...prev
    ]);
  };

  const toggleModule = (id) => {
    const next = new Set(state.purchasedModules);
    next.has(id) ? next.delete(id) : next.add(id);
    setState((s)=>({ ...s, purchasedModules: next }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold"><Puzzle className="h-5 w-5"/> Shepherd Console</div>
          <div className="hidden md:block flex-1" />
          <button onClick={()=>setShowModuleDrawer(true)} className="rounded-full border px-3 py-1.5 text-sm flex items-center gap-2 hover:shadow">
            <ShoppingCart className="h-4 w-4"/> Manage Modules
          </button>
          <button className="rounded-full border px-3 py-1.5 text-sm flex items-center gap-2 hover:shadow">
            <Shield className="h-4 w-4"/> Permissions
          </button>
          <button className="rounded-full border px-3 py-1.5 text-sm flex items-center gap-2 hover:shadow">
            <Settings className="h-4 w-4"/> Settings
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 pt-6 grid grid-cols-12 gap-4">
        {/* Left Rail: Group Switcher & Module Quick Picks */}
        <div className="col-span-12 md:col-span-3">
          <div className="grid gap-4">
            <div className="rounded-2xl border p-3 bg-white">
              <SectionTitle>Focus</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {GROUPS.map((g)=>{
                  const Icon = g.icon;
                  const isActive = activeGroup === g.id;
                  return (
                    <button key={g.id} onClick={()=>setActiveGroup(g.id)} className={`flex items-center gap-2 rounded-xl border p-2 hover:shadow ${isActive?"bg-black text-white":""}`}>
                      <Icon className="h-4 w-4"/> {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border p-3 bg-white">
              <SectionTitle right={<button className="text-sm opacity-70 hover:opacity-100">Edit</button>}>Pinned Modules</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {visibleModules.slice(0,6).map((m)=>(
                  <Pill key={m.id}>{m.name}</Pill>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Conversation & Review */}
        <div className="col-span-12 md:col-span-6">
          {/* ShepherdBoard: mentoring-oriented metrics + next steps */}
          <div className="rounded-3xl border bg-white p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Shepherd Board</div>
              <div className="text-xs opacity-60">A quick read on church health with suggested next steps</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs opacity-60">Attendance (last 4 weeks)</div>
                <div className="text-2xl font-semibold">+6%</div>
                <div className="text-xs opacity-60">New families rising—consider a newcomers lunch</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs opacity-60">Giving Health</div>
                <div className="text-2xl font-semibold">Stable</div>
                <div className="text-xs opacity-60">3 at-risk givers—send thank-yous and check-in</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs opacity-60">Volunteer Coverage (Sun 9am)</div>
                <div className="text-2xl font-semibold">82%</div>
                <div className="text-xs opacity-60">Greeters short by 2—invite last month's subs</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs opacity-60">Care Follow-ups</div>
                <div className="text-2xl font-semibold">5 open</div>
                <div className="text-xs opacity-60">2 are aging—suggest a call from Care Team</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-full border px-3 py-1.5 text-sm">Suggest a newcomers lunch</button>
              <button className="rounded-full border px-3 py-1.5 text-sm">Thank at-risk givers</button>
              <button className="rounded-full border px-3 py-1.5 text-sm">Fill greeter spots</button>
              <button className="rounded-full border px-3 py-1.5 text-sm">Review care list</button>
            </div>
          </div>
          <div className="rounded-3xl border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Guided Conversation</div>
              <div className="text-xs opacity-60">Ask in plain language; we'll counsel you and carry out the work</div>
            </div>
            <div className="space-y-3 min-h-[300px]">
              {messages.map((m, idx)=>(
                <ConversationBubble key={idx} role={m.role} text={m.text} intents={m.intents}/>
              ))}
            </div>
            <div className="mt-4">
              <CommandInput onSubmit={submitCommand} placeholder="Ask for guidance or request help… e.g., ‘Can you fill the 9am greeters and send confirmations?’"/>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border bg-white p-4">
            <SectionTitle>Recent Ministry Activity</SectionTitle>
            <div className="grid gap-2">
              {nowRunning.slice(0,4).map((r)=> (
                <div key={r.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 opacity-70"/>
                    <div>
                      <div className="font-medium">{r.agent}</div>
                      <div className="text-xs opacity-60">{r.detail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-full border px-2 py-1 text-xs">View log</button>
                    <button className="rounded-full border px-2 py-1 text-xs">Undo</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Ministry Helpers (stateful runtime) */}
        <div className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border p-3 bg-white sticky top-20">
            <SectionTitle right={<Filter className="h-4 w-4 opacity-60"/>}>Ministry Helpers</SectionTitle>
            <div className="grid gap-2">
              {AGENTS.filter(a=>state.purchasedAgents.has(a.id)).map((a)=> (
                <div key={a.id} className="rounded-xl border p-3">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs opacity-60 mb-2">From: {MODULES.find(m=>m.id===a.module)?.name}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {a.skills.map((s)=>(<Pill key={s}>{s}</Pill>))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-full border px-2 py-1 text-xs flex items-center gap-1"><Play className="h-3.5 w-3.5"/>Begin</button>
                    <button className="rounded-full border px-2 py-1 text-xs flex items-center gap-1"><Pause className="h-3.5 w-3.5"/>Pause</button>
                    <button className="rounded-full border px-2 py-1 text-xs flex items-center gap-1"><StopCircle className="h-3.5 w-3.5"/>Finish</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Drawer (Purchase/Enable/Disable without cluttering the main UI) */}
      <AnimatePresence>
        {showModuleDrawer && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/30" onClick={()=>setShowModuleDrawer(false)}>
            <motion.div initial={{x:400}} animate={{x:0}} exit={{x:400}} transition={{type:"spring", damping:20}} onClick={(e)=>e.stopPropagation()} className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Manage Modules</div>
                <button onClick={()=>setShowModuleDrawer(false)} className="rounded-full border p-1"><X className="h-4 w-4"/></button>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl border p-2">
                <Search className="h-4 w-4 opacity-60"/>
                <input placeholder="Search modules or packs…" className="w-full outline-none"/>
              </div>

              <div className="mt-4 space-y-5">
                {GROUPS.map((g)=>{
                  const groupModules = MODULES.filter(m=>m.group===g.id);
                  if (!groupModules.length) return null;
                  const Icon = g.icon;
                  return (
                    <div key={g.id}>
                      <div className="flex items-center gap-2 mb-2"><Icon className="h-4 w-4"/><h4 className="font-medium">{g.name}</h4></div>
                      <div className="grid gap-2">
                        {groupModules.map((m)=> (
                          <ModuleToggle
                            key={m.id}
                            moduleId={m.id}
                            name={m.name}
                            type={m.type}
                            active={state.purchasedModules.has(m.id)}
                            onToggle={toggleModule}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border p-3 bg-neutral-50">
                <div className="text-sm opacity-70 mb-2">Billing Preview</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">{Array.from(state.purchasedModules).length} modules</div>
                    <div className="text-xs opacity-60">Helpers billed per worker</div>
                  </div>
                  <button className="rounded-full border px-3 py-1.5 text-sm flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Checkout</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mx-auto max-w-7xl px-4 py-8 opacity-60 text-xs">
        Prototype UI — keyboard: ⌘/Ctrl+K to focus Command.
      </div>
    </div>
  );
}




