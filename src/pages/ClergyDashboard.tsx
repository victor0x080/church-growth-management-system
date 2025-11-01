import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ModuleManagerDrawer } from "@/components/ModuleManagerDrawer";
import { 
  Search, 
  ChevronRight, 
  Settings, 
  Play, 
  Pause, 
  StopCircle, 
  CheckCircle2, 
  Clock, 
  Puzzle, 
  Sparkles, 
  Filter, 
  X, 
  ShoppingCart, 
  Shield, 
  Users, 
  BookOpen, 
  HeartHandshake, 
  HandCoins, 
  Calendar, 
  Home, 
  LogOut,
  Bell
} from "lucide-react";
import { USER_ROLES, DASHBOARD_ROUTES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";

// Groups from sample codebase
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

// Fallback mapping to ensure each module belongs to exactly one group
const MODULE_CATEGORY_MAP: Record<string, string> = {
  "Core Data Cloud": "membership",
  "Connections & Community": "community",
  "Interactive Comms": "community",
  "Volunteer Ops": "community",
  "Donor Growth": "stewardship",
  "Care": "ministry",
  "Neighborhood Engagement": "community",
  "Finance & Accounting": "accounting",
  "Content & Distribution": "innovation",
  "Assessment Sprint": "planning",
  "Discernment Journey": "planning",
  "Grant/Appeal Builder": "stewardship",
  "Newcomer Launch Kit": "membership",
  "Community Growth and Strengthening": "community",
  "Proactive Pastoral Care Module": "ministry",
  "Intelligent Micro-Volunteering Module": "community",
  "Communication and engagement": "community",
  "Content Augmentation & Retrieval System (RAG)": "innovation",
  "Email Management": "community",
  "New Member Engagement & Onboarding (NMEO)": "membership",
  "Social Media Manager (placeholder)": "innovation",
  "Ministry Management": "ministry",
  "Micro-Volunteering": "community",
  "Social support": "community",
};

const ClergyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [purchasedBundles, setPurchasedBundles] = useState<any[]>([]);
  const [purchasedModules, setPurchasedModules] = useState<any[]>([]);
  const [availableAgentsForModules, setAvailableAgentsForModules] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState("community");
  const [showModuleDrawer, setShowModuleDrawer] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; intents?: string[]; plan?: any }>>([
    { 
      role: "assistant", 
      text: "Welcome! I can help you manage your ministry. What would you like to do?", 
      intents: []
    },
  ]);
  const [nowRunning, setNowRunning] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkClergyAccess();
  }, [user]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("cmd");
        el?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const checkClergyAccess = async () => {
    if (!user) return;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasClergyRole = roles && roles.some((r: { role: string }) => r.role === USER_ROLES.CLERGY);

    if (!hasClergyRole) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You don't have clergy privileges.",
      });
      navigate(DASHBOARD_ROUTES.PARISH);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, churches(name, denomination)")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    if (!(profile as any).onboarding_completed) {
      navigate("/onboarding");
      return;
    }

    setUserProfile(profile);
    setChurchId((profile as any).church_id || null);

    if ((profile as any).church_id) {
      loadPurchasedData((profile as any).church_id);
    }
    
    setLoading(false);
  };

  const loadPurchasedData = async (churchId: string) => {
    try {
      const { data: bundles } = await supabase
        .from("church_bundles")
        .select("bundle_id")
        .eq("church_id", churchId);

      if (bundles && bundles.length > 0) {
        const bundleIds = bundles.map((b: any) => b.bundle_id);
        const { data: bundleData } = await supabase
          .from("bundles")
          .select("*")
          .in("bundle_id", bundleIds);

        if (bundleData) {
          const bundlesWithModules = await Promise.all(
            bundleData.map(async (bundle: any) => {
              const { data: modules } = await supabase
                .from("bundle_modules")
                .select("module_name")
                .eq("bundle_id", bundle.bundle_id);

              return {
                ...bundle,
                modules: modules?.map((m: any) => m.module_name) || [],
              };
            })
          );
          setPurchasedBundles(bundlesWithModules);
        }
      }

      // Load modules with their categories and display names
      const { data: modules } = await supabase
        .from("church_modules")
        .select("*")
        .eq("church_id", churchId);

      if (modules) {
        // Fetch category for each module from available_modules and normalize to dashboard groups
        const CATEGORY_TO_GROUP: Record<string, string> = {
          Engagement: "community",
          Care: "ministry",
          Volunteering: "community",
          Communication: "community",
          Reporting: "innovation",
          Monitoring: "community",
          "Task Management": "planning",
        };
        const MODULE_ID_TO_GROUP: Record<string, string> = {
          mod_community_growth: "community",
          mod_pastoral_care: "ministry",
          mod_micro_volunteering: "community",
          mod_comms_engagement: "community",
          mod_rag: "innovation",
          mod_email_mgmt: "community",
          mod_nmeo: "membership",
          mod_social_media: "innovation",
        };
        const modulesWithCategories = await Promise.all(
          modules.map(async (module: any) => {
            const { data: moduleData } = await supabase
              .from("available_modules")
              .select("category, name")
              .eq("module_name", module.module_name)
              .single();
            const dbCategory = moduleData ? (moduleData as any).category : null;
            // Normalize DB category to a dashboard group id
            const normalized = dbCategory ? CATEGORY_TO_GROUP[dbCategory] : undefined;
            // Use fallback mapping if not found
            const category = normalized || MODULE_ID_TO_GROUP[module.module_name] || MODULE_CATEGORY_MAP[module.module_name] || "community";
            return {
              ...module,
              display_name: moduleData?.name || module.module_name,
              category,
            };
          })
        );
        setPurchasedModules(modulesWithCategories);

        // Load available agents for these enabled modules (for Ministry Helpers)
        const enabledModuleIds = modulesWithCategories.map((m: any) => m.module_name);
        if (enabledModuleIds.length > 0) {
          const { data: modAgents } = await supabase
            .from("module_agents")
            .select("module_name, agent_name, price")
            .in("module_name", enabledModuleIds);
          setAvailableAgentsForModules(modAgents || []);
        } else {
          setAvailableAgentsForModules([]);
        }
      }
      // We no longer restrict to only purchased agents; show all available agents for enabled modules
    } catch (error) {
      console.error("Error loading purchased data:", error);
    }
  };

  const submitCommand = (value: string) => {
    const intents = [];
    if (value.toLowerCase().includes("volunteer")) intents.push("volunteer_rostering");
    if (value.toLowerCase().includes("donor")) intents.push("donor_engagement");
    if (value.toLowerCase().includes("reconcile")) intents.push("bank_reconcile");

    setMessages((prev) => [
      ...prev, 
      { role: "user", text: value }, 
      { 
        role: "assistant", 
        text: "Here's what I'll do:", 
        intents: intents.length ? intents : ["classify", "route_to_agent"] 
      }
    ]);

    setNowRunning((prev) => [
      { 
        id: `run-${Date.now()}`, 
        agent: intents.includes("volunteer_rostering") ? "Volunteer Scheduler" : "Assistant", 
        status: "running", 
        detail: "Processing your request" 
      },
      ...prev
    ]);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAgentAction = (action: "run" | "pause" | "stop", agentId: string, agentName: string) => {
    toast({
      title: "Agent Action",
      description: `${action === "run" ? "Started" : action === "pause" ? "Paused" : "Stopped"} ${agentName}`,
    });
    
    // Add to running activities
    if (action === "run") {
      setNowRunning((prev) => [
        {
          id: `agent-${agentId}-${Date.now()}`,
          agent: agentName,
          status: "running",
          detail: "Agent is now running",
        },
        ...prev
      ]);
    }
  };

  // Generate contextual suggestions based on active group and available modules
  const getGroupSuggestions = (group: string, modules: any[]) => {
    const groupModules = modules.filter((m: any) => m.category === group);
    const moduleNames = groupModules.map((m: any) => m.module_name.toLowerCase());
    
    const suggestions: Record<string, string[]> = {
      accounting: ["View financial reports", "Reconcile transactions", "Generate budget analysis"],
      membership: ["View member directory", "Check attendance trends", "New member onboarding"],
      innovation: ["Generate content ideas", "Schedule social posts", "Analyze engagement"],
      discipleship: ["Track study progress", "View lesson plans", "Schedule sessions"],
      planning: ["Review strategic plan", "Generate assessment report", "View roadmap"],
      stewardship: ["View donation trends", "Generate giving report", "Track campaign progress"],
      community: ["Manage volunteers", "Match volunteers to tasks", "Schedule volunteer events"],
      ministry: ["Check care needs", "View pastoral notes", "Schedule follow-ups"],
    };

    // Base suggestions on group
    let baseSuggestions = suggestions[group] || ["View reports", "Check status", "Manage tasks"];
    
    // Customize based on actual modules
    if (moduleNames.some(m => m.includes("volunteer"))) {
      baseSuggestions = ["Manage volunteers", "Match tasks", "View volunteer calendar", ...baseSuggestions.slice(1)];
    }
    if (moduleNames.some(m => m.includes("donor") || m.includes("stewardship"))) {
      baseSuggestions = ["View donations", "Generate giving report", ...baseSuggestions.slice(1)];
    }
    if (moduleNames.some(m => m.includes("member") || m.includes("attendance"))) {
      baseSuggestions = ["Check attendance", "View member directory", ...baseSuggestions.slice(1)];
    }
    
    return baseSuggestions.slice(0, 3); // Return top 3
  };

  // Filter modules and agents by active group
  const visibleModules = useMemo(() => {
    return purchasedModules.filter((m: any) => m.category === activeGroup);
  }, [purchasedModules, activeGroup]);

  const visibleAgents = useMemo(() => {
    // Get modules in the active group
    const activeGroupModules = purchasedModules
      .filter((m: any) => m.category === activeGroup)
      .map((m: any) => m.module_name);
    // Show available agents for the enabled modules in this group
    return availableAgentsForModules.filter((agent: any) => activeGroupModules.includes(agent.module_name));
  }, [availableAgentsForModules, purchasedModules, activeGroup]);

  // Dynamic suggestions based on active group
  const dynamicSuggestions = useMemo(() => {
    return getGroupSuggestions(activeGroup, purchasedModules);
  }, [activeGroup, purchasedModules]);

  // Update welcome message when group changes
  useEffect(() => {
    if (purchasedModules.length > 0) {
      setMessages((prev) => {
        // Only update if it's still the welcome message
        if (prev.length === 1 && prev[0].role === "assistant" && prev[0].text.includes("Welcome")) {
          return [{
            role: "assistant",
            text: `Welcome! I can help you manage your ${GROUPS.find(g => g.id === activeGroup)?.name || "ministry"}. What would you like to do?`,
            intents: dynamicSuggestions
          }];
        }
        return prev;
      });
    }
  }, [activeGroup, dynamicSuggestions, purchasedModules.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-primary" />
              Shepherd Console
            </h1>
          </div>
          <div className="hidden md:block flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowModuleDrawer(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Manage Modules
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" /> Permissions
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Main Layout */}
      <div className="px-4 pt-4 grid grid-cols-12 gap-3">
        {/* Left Rail: Group Switcher & Module Quick Picks */}
        <div className="col-span-12 md:col-span-2 border-r border-border">
          <div className="grid gap-4">
            <div className="p-3">
              <h3 className="text-base font-bold uppercase tracking-wide mb-2">Focus</h3>
              <div className="flex flex-col gap-2">
                {GROUPS.map((g) => {
                  const Icon = g.icon;
                  const isActive = activeGroup === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveGroup(g.id)}
                      className={`flex items-center gap-2 rounded-xl border p-2 hover:shadow transition ${
                        isActive ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold uppercase tracking-wide">Pinned Modules</h3>
                <button className="text-sm opacity-70 hover:opacity-100">Edit</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleModules.slice(0, 6).map((m: any) => (
                  <span key={m.module_name} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs opacity-80">
                    {m.display_name || m.module_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Conversation & Review */}
        <div className="col-span-12 md:col-span-7 border-r border-border pr-3">
          {/* Shepherd Board */}
          <div className="p-4 mb-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold">Shepherd Board</div>
              <div className="text-xs opacity-60">Quick view of ministry health</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 p-3 border-r border-border/50">
                <div className="text-xs opacity-60">Attendance</div>
                <div className="text-2xl font-semibold">+6%</div>
                <div className="text-xs opacity-60">New families rising</div>
              </div>
              <div className="flex-1 p-3 border-r border-border/50">
                <div className="text-xs opacity-60">Giving Health</div>
                <div className="text-2xl font-semibold">Stable</div>
                <div className="text-xs opacity-60">All donors active</div>
              </div>
              <div className="flex-1 p-3 border-r border-border/50">
                <div className="text-xs opacity-60">Volunteers</div>
                <div className="text-2xl font-semibold">82%</div>
                <div className="text-xs opacity-60">Coverage good</div>
              </div>
              <div className="flex-1 p-3">
                <div className="text-xs opacity-60">Care Follow-ups</div>
                <div className="text-2xl font-semibold">5 open</div>
                <div className="text-xs opacity-60">In progress</div>
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="p-4 mb-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold">Guided Conversation</div>
              <div className="text-xs opacity-60">Tell me what you need</div>
            </div>
            <div className="space-y-3 min-h-[300px]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[72%] p-3 rounded-2xl ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <div className="prose-sm leading-relaxed">{m.text}</div>
                    {m.intents?.length && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.intents.map((i, iIdx) => (
                          <button
                            key={iIdx}
                            onClick={() => submitCommand(i)}
                            className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-xs hover:bg-primary/20 cursor-pointer transition-colors"
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <CommandInput onSubmit={submitCommand} />
          </div>

          {/* Recent Activity */}
          <div className="p-4">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-2">Recent Activity</h3>
            <div className="space-y-2">
              {nowRunning.length === 0 ? (
                <div className="text-center py-8 text-sm opacity-60">No recent activity</div>
              ) : (
                nowRunning.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{r.agent}</div>
                        <div className="text-xs opacity-60">{r.detail}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">View log</Button>
                      <Button variant="outline" size="sm">Undo</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Ministry Helpers */}
        <div className="col-span-12 md:col-span-3">
          <div className="p-3 sticky top-20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold uppercase tracking-wide">Ministry Helpers</h3>
              <Filter className="h-4 w-4 opacity-60" />
            </div>
            <div className="space-y-2">
              {visibleAgents.length === 0 ? (
                <div className="text-center py-4 text-xs opacity-60">No agents available for {GROUPS.find(g => g.id === activeGroup)?.name}</div>
              ) : (
                visibleAgents.map((agent: any) => {
                  const compositeId = `${agent.module_name}:${agent.agent_name}`;
                  return (
                  <div key={compositeId} className="p-3 border-b border-border/50">
                    <div className="font-medium">{agent.agent_name}</div>
                    <div className="text-xs opacity-60 mb-2">{agent.module_name}</div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAgentAction("run", compositeId, agent.agent_name)}
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Begin
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAgentAction("pause", compositeId, agent.agent_name)}
                      >
                        <Pause className="h-3.5 w-3.5 mr-1" />
                        Pause
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAgentAction("stop", compositeId, agent.agent_name)}
                      >
                        <StopCircle className="h-3.5 w-3.5 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>
                );})
              )}
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Module Manager Drawer */}
      <ModuleManagerDrawer
        open={showModuleDrawer}
        onOpenChange={setShowModuleDrawer}
        churchId={churchId}
        onBillingClick={() => {
          setShowModuleDrawer(false);
          navigate("/clergy/purchased-modules");
        }}
        onModuleToggle={() => {
          if (churchId) {
            loadPurchasedData(churchId);
          }
        }}
      />
    </div>
  );
};

// Command Input Component
const CommandInput = ({ onSubmit }: { onSubmit: (value: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onSubmit(value);
          setValue("");
        }
      }}
      className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2 mt-4 hover:border-primary/50 transition-colors"
    >
      <Search className="h-5 w-5 opacity-60" />
      <input
        id="cmd"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask for help or request an action…"
        className="w-full bg-transparent outline-none"
      />
      <kbd className="rounded border px-1.5 py-0.5 text-xs opacity-60">⌘K</kbd>
    </form>
  );
};

export default ClergyDashboard;
