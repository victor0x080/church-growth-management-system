import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, Circle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DASHBOARD_ROUTES } from "@/lib/constants";

interface Module {
  id: number;
  name: string;
  agents: Agent[];
  price: number | "CORE" | "FREE" | "per-task";
}

interface Agent {
  name: string;
  price: number | string;
}

const MODULES: Module[] = [
  {
    id: 1,
    name: "New Member Engagement & Onboarding (NME&O)",
    price: 299,
    agents: [
      { name: "Newcomer Concierge", price: 2.50 },
      { name: "Group Matchmaker", price: 3.00 },
      { name: "Serve Coordinator", price: 2.75 },
      { name: "Pastoral Triage Sentinel", price: 4.00 },
      { name: "Follow-Up Scheduler", price: 1.50 },
      { name: "Pathway Navigator", price: 3.50 },
    ],
  },
  {
    id: 2,
    name: "Member Management System",
    price: "CORE",
    agents: [
      { name: "Welcome Specialist", price: "Visitor follow-up" },
      { name: "Assimilation Coach", price: "Visitor follow-up" },
      { name: "Connection Facilitator", price: "Visitor follow-up" },
    ],
  },
  {
    id: 3,
    name: "Event Management System",
    price: "CORE",
    agents: [
      { name: "Event Coordinator", price: 129 },
      { name: "Registration Manager", price: 129 },
      { name: "Reminder Specialist", price: 129 },
    ],
  },
  {
    id: 4,
    name: "Group & Ministry Management",
    price: "CORE",
    agents: [
      { name: "Group Health Monitor", price: "Included" },
      { name: "Leader Coach", price: "Included" },
      { name: "Multiplication Facilitator", price: "Included" },
    ],
  },
  {
    id: 5,
    name: "Pastoral Care System",
    price: 179,
    agents: [
      { name: "Prayer Coordinator", price: "Included" },
      { name: "Pastoral Responder", price: "Included" },
      { name: "Follow-Up Specialist", price: "Included" },
      { name: "Crisis Coordinator", price: "Included" },
      { name: "Meal Train Organizer", price: "Included" },
      { name: "Team Dispatcher", price: "Included" },
      { name: "Risk Scoring Agent", price: 2.00 },
      { name: "Coping Coach", price: 3.00 },
    ],
  },
  {
    id: 6,
    name: "Volunteer Management",
    price: 149,
    agents: [
      { name: "Task Matcher", price: "Included" },
      { name: "Task Orchestrator", price: "Included" },
      { name: "Reputation Manager", price: "Included" },
      { name: "Gamification Manager", price: "Included" },
      { name: "Timeout Monitor", price: "Included" },
      { name: "Volunteer Matcher", price: 2.50 },
      { name: "Volunteer Reminder Agent", price: 0.75 },
    ],
  },
  {
    id: 7,
    name: "Communication System",
    price: "CORE",
    agents: [
      { name: "Content Augmentation Agent", price: 1.50 },
      { name: "Email Classifier", price: 0.50 },
      { name: "RSS Feed Importer", price: 49 },
    ],
  },
  {
    id: 8,
    name: "AI Companion Framework",
    price: 299,
    agents: [
      { name: "Connection Coach", price: 2.50 },
      { name: "Introduction Writer", price: 1.25 },
    ],
  },
  {
    id: 9,
    name: "Membership Onboarding System",
    price: 179,
    agents: [
      { name: "Class Coordinator", price: "Included" },
      { name: "Covenant Facilitator", price: "Included" },
      { name: "Milestone Tracker", price: "Included" },
    ],
  },
  {
    id: 10,
    name: "Skills Development System",
    price: 149,
    agents: [
      { name: "Training Coordinator", price: "Included" },
      { name: "Certification Tracker", price: "Included" },
      { name: "Progression Advisor", price: "Included" },
    ],
  },
  {
    id: 11,
    name: "Mentorship System",
    price: 149,
    agents: [
      { name: "MatchMaker", price: "Included" },
      { name: "Checkin Coordinator", price: "Included" },
      { name: "Goal Tracker", price: "Included" },
    ],
  },
  {
    id: 12,
    name: "Engagement Monitoring",
    price: 99,
    agents: [
      { name: "Engagement Monitor", price: "Included" },
      { name: "Outreach Strategist", price: "Included" },
      { name: "Community Health Analyst", price: "Included" },
    ],
  },
  {
    id: 13,
    name: "Church Accounting System",
    price: "CORE",
    agents: [
      { name: "Ingress Normalizer", price: "Included" },
      { name: "Identity Householding", price: "Included" },
      { name: "Assessment Outcome Scorer", price: "Included" },
      { name: "Engagement Uplift Modeler", price: "Included" },
      { name: "Follow-Up Orchestrator", price: "Included" },
      { name: "Volunteer Schedule", price: "Included" },
      { name: "Case Program", price: "Included" },
      { name: "Giving Pledge", price: "Included" },
      { name: "Policy Elicitation", price: "Included" },
      { name: "Data Gap Mapping", price: "Included" },
      { name: "Mission Ops Orchestrator", price: "Included" },
      { name: "Semantic Router", price: "Included" },
      { name: "Translator Contract", price: "Included" },
      { name: "Validator Registry", price: "Included" },
    ],
  },
  {
    id: 14,
    name: "Ministry Financial Management",
    price: 149,
    agents: [],
  },
  {
    id: 15,
    name: "Integration Hub",
    price: 199,
    agents: [],
  },
  {
    id: 16,
    name: "Resource Library",
    price: "FREE",
    agents: [],
  },
  {
    id: 17,
    name: "Services Marketplace",
    price: 99,
    agents: [],
  },
  {
    id: 18,
    name: "Church Network (Connect)",
    price: 179,
    agents: [],
  },
  {
    id: 19,
    name: "Workflow Automation System",
    price: 199,
    agents: [],
  },
  {
    id: 20,
    name: "Analytics & Reporting System",
    price: 229,
    agents: [],
  },
  {
    id: 21,
    name: "Task Management System",
    price: 99,
    agents: [],
  },
  {
    id: 22,
    name: "Photo & Media Management",
    price: "FREE",
    agents: [],
  },
  {
    id: 23,
    name: "Real-Time Collaboration",
    price: 149,
    agents: [],
  },
  {
    id: 24,
    name: "Security & Compliance",
    price: "CORE",
    agents: [],
  },
  {
    id: 25,
    name: "Mobile & QR Features",
    price: 99,
    agents: [],
  },
  {
    id: 26,
    name: "Social Connection Intelligence",
    price: 249,
    agents: [
      { name: "Connection Coach", price: 2.50 },
      { name: "Introduction Writer", price: 1.25 },
    ],
  },
  {
    id: 27,
    name: "Proactive Pastoral Care",
    price: 199,
    agents: [
      { name: "Risk Scoring Agent", price: 2.00 },
      { name: "Coping Coach", price: 3.00 },
    ],
  },
  {
    id: 28,
    name: "Intelligent Micro-Volunteering",
    price: 149,
    agents: [
      { name: "Task Matcher", price: "Included" },
      { name: "Task Orchestrator", price: "Included" },
      { name: "Reputation Manager", price: "Included" },
      { name: "Gamification Manager", price: "Included" },
      { name: "Timeout Monitor", price: "Included" },
    ],
  },
];

const Onboarding = () => {
  const [selectedModules, setSelectedModules] = useState<Set<number>>(new Set([2, 3, 4, 7, 13, 24])); // Default CORE modules
  const [selectedAgents, setSelectedAgents] = useState<Map<number, Set<string>>>(new Map());
  const [loading, setLoading] = useState(false);
  const [churchId, setChurchId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if onboarding already completed
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("church_id, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      navigate(DASHBOARD_ROUTES.PARISH);
      return;
    }

    setChurchId(profile?.church_id || null);
  };

  const toggleModule = (moduleId: number) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
      // Also remove selected agents for this module
      const newAgents = new Map(selectedAgents);
      newAgents.delete(moduleId);
      setSelectedAgents(newAgents);
    } else {
      newSelected.add(moduleId);
    }
    setSelectedModules(newSelected);
  };

  const toggleAgent = (moduleId: number, agentName: string) => {
    const newAgents = new Map(selectedAgents);
    const moduleAgents = newAgents.get(moduleId) || new Set<string>();
    const newModuleAgents = new Set(moduleAgents);
    
    if (newModuleAgents.has(agentName)) {
      newModuleAgents.delete(agentName);
    } else {
      newModuleAgents.add(agentName);
    }
    
    newAgents.set(moduleId, newModuleAgents);
    setSelectedAgents(newAgents);
  };

  const handleComplete = async () => {
    if (!user || !churchId) {
      console.error("Missing user or churchId:", { user, churchId });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing user or church information. Please try again.",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Starting onboarding completion...");
      console.log("Selected modules:", Array.from(selectedModules));
      console.log("Selected agents:", Object.fromEntries(selectedAgents));
      // Save selected modules
      const modulesData = Array.from(selectedModules).map(moduleId => {
        const module = MODULES.find(m => m.id === moduleId);
        return {
          church_id: churchId,
          module_name: module?.name || "",
          module_price: typeof module?.price === "number" ? module.price : null,
        };
      });

      if (modulesData.length > 0) {
        // Insert modules, ignoring duplicates
        const { error: modulesError } = await supabase
          .from("church_modules")
          .insert(modulesData)
          .select();

        if (modulesError) {
          console.error("Module insertion error:", modulesError);
          // Try to continue if it's a duplicate key error
          if (!modulesError.message?.includes('duplicate') && !modulesError.code === '23505') {
            throw modulesError;
          }
        }
      }

      // Save selected agents
      const agentsData: any[] = [];
      selectedModules.forEach(moduleId => {
        const module = MODULES.find(m => m.id === moduleId);
        const agents = selectedAgents.get(moduleId);
        if (module && agents && agents.size > 0) {
          agents.forEach(agentName => {
            const agent = module.agents.find(a => a.name === agentName);
            agentsData.push({
              church_id: churchId,
              module_name: module.name,
              agent_name: agentName,
              agent_price: typeof agent?.price === "number" ? agent.price : null,
            });
          });
        }
      });

      if (agentsData.length > 0) {
        // Insert agents, ignoring duplicates
        const { error: agentsError } = await supabase
          .from("church_agents")
          .insert(agentsData)
          .select();

        if (agentsError) {
          console.error("Agent insertion error:", agentsError);
          // Try to continue if it's a duplicate key error
          if (!agentsError.message?.includes('duplicate') && !agentsError.code === '23505') {
            throw agentsError;
          }
        }
      }

      // Mark onboarding as completed
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (updateError) throw updateError;

      console.log("Onboarding completed successfully!");

      toast({
        title: "Onboarding completed!",
        description: "Your church is now set up with the selected modules.",
      });

      // Small delay before navigation
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(DASHBOARD_ROUTES.PARISH);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to complete onboarding",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    selectedModules.forEach(moduleId => {
      const module = MODULES.find(m => m.id === moduleId);
      if (module && typeof module.price === "number") {
        total += module.price;
      }
      // Add agent prices
      const agents = selectedAgents.get(moduleId);
      if (module && agents) {
        agents.forEach(agentName => {
          const agent = module.agents.find(a => a.name === agentName);
          if (agent && typeof agent.price === "number") {
            total += agent.price;
          }
        });
      }
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Welcome! Let's Set Up Your Church</CardTitle>
            <CardDescription className="text-lg">
              Select the modules and agents you'd like to enable for your church. You can always add more later.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modules List */}
          <div className="lg:col-span-2 space-y-4">
            {MODULES.map((module) => (
              <Card
                key={module.id}
                className={`cursor-pointer transition-all ${
                  selectedModules.has(module.id) ? "border-primary shadow-md" : ""
                }`}
                onClick={() => toggleModule(module.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {selectedModules.has(module.id) ? (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        {module.agents.length > 0 && selectedModules.has(module.id) && (
                          <div className="mt-2 space-y-2">
                            {module.agents.map((agent) => (
                              <div
                                key={agent.name}
                                className="flex items-center justify-between p-2 bg-muted rounded hover:bg-muted/70"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAgent(module.id, agent.name);
                                }}
                              >
                                <span className="text-sm">{agent.name}</span>
                                {selectedAgents.get(module.id)?.has(agent.name) && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">
                        {typeof module.price === "number" ? `$${module.price}/mo` : module.price}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Selected Modules</CardTitle>
                <CardDescription>
                  {selectedModules.size} module{selectedModules.size !== 1 ? "s" : ""} selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.from(selectedModules).map((moduleId) => {
                    const module = MODULES.find(m => m.id === moduleId);
                    return (
                      <div key={moduleId} className="text-sm">
                        <div className="font-medium">{module?.name}</div>
                        <div className="text-muted-foreground">
                          {typeof module?.price === "number" ? `$${module.price}/mo` : module?.price}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Estimated Monthly Cost:</span>
                    <span>${calculateTotal()}/mo</span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleComplete();
                  }}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

