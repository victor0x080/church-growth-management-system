import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Agent {
  module_name: string;
  agent_name: string;
  description: string | null;
  required: boolean;
  price?: number | null;
}

const OnboardingStep2Agents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [moduleAgentsMap, setModuleAgentsMap] = useState<Record<string, Agent[]>>({});

  // This would be populated from the database or a configuration file
  const MODULE_AGENTS: Record<string, { name: string; price: number | string; required?: boolean }[]> = {
    "Community Growth and Strengthening": [
      { name: "Personality Matcher", price: 2.50, required: false },
      { name: "Life Event Matcher", price: 3.00, required: false },
      { name: "Social Graph Analyzer", price: 2.75, required: false },
      { name: "Relationship Strength Calculator", price: 4.00, required: false },
      { name: "Small Group Manager", price: 1.50, required: true },
      { name: "Engagement Scoring Agent", price: 3.50, required: false },
      { name: "Profile Embedding Service", price: 2.00, required: false },
    ],
    "Member Management System": [
      { name: "Welcome Specialist", price: "Included", required: true },
      { name: "Assimilation Coach", price: "Included", required: true },
      { name: "Connection Facilitator", price: "Included", required: true },
    ],
    "Event Management System": [
      { name: "Event Coordinator", price: "Included", required: true },
      { name: "Registration Manager", price: "Included", required: true },
      { name: "Reminder Specialist", price: "Included", required: true },
    ],
    "Group & Ministry Management": [
      { name: "Group Health Monitor", price: "Included", required: true },
      { name: "Leader Coach", price: 2.50, required: false },
      { name: "Multiplication Facilitator", price: 2.50, required: false },
    ],
    "Proactive Pastoral Care Module": [
      { name: "Disconnection Alert System", price: "Included", required: true },
      { name: "Alert Routing and Assignment Agent", price: "Included", required: true },
      { name: "Communication Management Agent", price: 3.00, required: false },
      { name: "Daily Check-in Scheduler", price: 2.50, required: false },
      { name: "Alert Resolution Tracker", price: 2.00, required: false },
    ],
    "Intelligent Micro-Volunteering Module": [
      { name: "Micro-task Manager", price: "Included", required: true },
      { name: "Volunteer Matcher", price: 2.50, required: false },
      { name: "Task Lifecycle Agent", price: 2.00, required: false },
      { name: "Gamification & Reputation Agent", price: 3.00, required: false },
      { name: "Real-time Task Offer Dispatcher", price: 2.75, required: false },
    ],
    "Communication and Engagement": [
      { name: "Connection AI Agents", price: "Included", required: true },
      { name: "Volunteer Agents", price: 2.50, required: false },
      { name: "Content Agents", price: 3.00, required: false },
      { name: "Email Agents", price: 2.50, required: false },
      { name: "Communication Agents", price: "Included", required: true },
      { name: "Pastoral Care Agents", price: 2.75, required: false },
      { name: "Administrative Agents", price: 2.00, required: false },
    ],
    "Content Augmentation & Retrieval System (RAG)": [
      { name: "Content Ingestion Pipeline", price: "Included", required: true },
      { name: "Semantic Chunker & Embedding Generator", price: 3.50, required: false },
      { name: "RAG Query Processor", price: "Included", required: true },
      { name: "Weekly Digest Generator", price: 2.50, required: false },
    ],
    "Email Management": [
      { name: "Email Synchronization & Classification", price: "Included", required: true },
      { name: "Sentiment & Priority Scoring", price: 2.50, required: false },
      { name: "Routing & Assignment", price: "Included", required: true },
      { name: "Response Tracking", price: 2.00, required: false },
      { name: "Staff Inbox Dashboard", price: 2.50, required: false },
    ],
    "New Member Engagement & Onboarding (NME&O)": [
      { name: "Newcomer Concierge", price: 2.50, required: false },
      { name: "Group Matchmaker", price: 3.00, required: false },
      { name: "Serve Coordinator", price: 2.75, required: false },
      { name: "Pastoral Triage Sentinel", price: 4.00, required: false },
      { name: "Follow-Up Scheduler", price: 1.50, required: false },
      { name: "Pathway Navigator", price: 3.50, required: false },
    ],
    "Social Media Manager": [
      { name: "Service Streaming", price: "Included", required: true },
      { name: "Content Generation", price: 2.50, required: false },
      { name: "Content Distribution", price: 2.00, required: false },
      { name: "Community Engagement", price: 2.50, required: false },
    ],
    "Skills Development System": [
      { name: "Training Coordinator", price: "Included", required: true },
      { name: "Certification Tracker", price: 2.00, required: false },
      { name: "Progression Advisor", price: 2.50, required: false },
    ],
    "Mentorship System": [
      { name: "MatchMaker", price: "Included", required: true },
      { name: "Checkin Coordinator", price: 2.00, required: false },
      { name: "Goal Tracker", price: 2.50, required: false },
    ],
    "Engagement Monitoring": [
      { name: "Engagement Monitor", price: "Included", required: true },
      { name: "Outreach Strategist", price: 2.50, required: false },
      { name: "Community Health Analyst", price: 3.00, required: false },
    ],
    "Church Accounting System": [
      { name: "Ingress Normalizer", price: "Included", required: true },
      { name: "Identity Householding", price: "Included", required: true },
      { name: "Assessment Outcome Scorer", price: 3.50, required: false },
      { name: "Engagement Uplift Modeler", price: 3.00, required: false },
      { name: "Follow-Up Orchestrator", price: 2.50, required: false },
      { name: "Volunteer Schedule", price: 2.00, required: false },
      { name: "Case Program", price: 2.75, required: false },
      { name: "Giving Pledge", price: 2.00, required: false },
      { name: "Policy Elicitation", price: 2.50, required: false },
      { name: "Data Gap Mapping", price: 2.25, required: false },
      { name: "Mission Ops Orchestrator", price: 3.00, required: false },
      { name: "Semantic Router", price: 2.50, required: false },
      { name: "Translator Contract", price: 2.00, required: false },
      { name: "Validator Registry", price: 2.00, required: false },
    ],
    "Ministry Financial Management": [
      { name: "Financial Planner", price: "Included", required: true },
      { name: "Budget Tracker", price: 2.50, required: false },
      { name: "Reporting Agent", price: 2.00, required: false },
    ],
    "Integration Hub": [
      { name: "API Gateway", price: "Included", required: true },
      { name: "Data Synchronizer", price: 3.00, required: false },
    ],
    "Services Marketplace": [
      { name: "Marketplace Manager", price: "Included", required: true },
    ],
    "Workflow Automation System": [
      { name: "Workflow Designer", price: "Included", required: true },
      { name: "Automation Engine", price: 2.50, required: false },
    ],
    "Analytics & Reporting System": [
      { name: "Analytics Engine", price: "Included", required: true },
      { name: "Report Generator", price: 2.50, required: false },
      { name: "Data Visualizer", price: 3.00, required: false },
    ],
    "Task Management System": [
      { name: "Task Scheduler", price: "Included", required: true },
      { name: "Assignee Manager", price: 2.00, required: false },
    ],
    "Photo & Media Management": [
      { name: "Media Library", price: "Included", required: true },
      { name: "Album Manager", price: 2.00, required: false },
    ],
    "Real-Time Collaboration": [
      { name: "Collaboration Hub", price: "Included", required: true },
      { name: "Document Sync", price: 2.50, required: false },
    ],
    "Security & Compliance": [
      { name: "Security Monitor", price: "Included", required: true },
      { name: "Compliance Tracker", price: 2.00, required: false },
      { name: "Access Controller", price: 2.50, required: false },
    ],
    "Mobile & QR Features": [
      { name: "Mobile App", price: "Included", required: true },
      { name: "QR Generator", price: 2.00, required: false },
    ],
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load selected modules from session storage
    const stored = sessionStorage.getItem("selectedModules");
    if (stored) {
      const modules = JSON.parse(stored) as string[];
      setSelectedModules(modules);
    } else {
      navigate("/onboarding/step1-modules");
      return;
    }

    loadAgents();
  }, [user, navigate]);

  const loadAgents = async () => {
    try {
      // Fetch all agents from database
      const { data, error } = await supabase
        .from("module_agents")
        .select("*")
        .order("agent_name");

      if (error) throw error;
      
      if (data) {
        setAllAgents(data);
        
        // Group agents by module
        const grouped: Record<string, Agent[]> = {};
        data.forEach((agent) => {
          if (!grouped[agent.module_name]) {
            grouped[agent.module_name] = [];
          }
          grouped[agent.module_name].push(agent);
        });
        setModuleAgentsMap(grouped);
      }
    } catch (error) {
      console.error("Error loading agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = (moduleName: string, agentName: string) => {
    const agent = moduleAgentsMap[moduleName]?.find(a => a.agent_name === agentName);
    if (agent?.required) return; // Don't allow deselecting required agents

    const newAgents = new Map(selectedAgents);
    const moduleAgents = newAgents.get(moduleName) || new Set<string>();
    const newModuleAgents = new Set(moduleAgents);
    
    if (newModuleAgents.has(agentName)) {
      newModuleAgents.delete(agentName);
    } else {
      newModuleAgents.add(agentName);
    }
    
    newAgents.set(moduleName, newModuleAgents);
    setSelectedAgents(newAgents);
  };

  const handleBack = () => {
    navigate("/onboarding/step1-modules");
  };

  const handleNext = () => {
    // Store agent selections in session storage
    const agentData = Array.from(selectedAgents.entries()).map(([module, agents]) => ({
      module_name: module,
      agent_names: Array.from(agents)
    }));
    sessionStorage.setItem("agentSelections", JSON.stringify(agentData));
    navigate("/onboarding/step3-bundles");
  };

  const calculateTotalAgentPrice = () => {
    let total = 0;
    selectedAgents.forEach((agents, moduleName) => {
      agents.forEach(agentName => {
        const agent = moduleAgentsMap[moduleName]?.find(a => a.agent_name === agentName);
        if (agent && agent.price != null) {
          total += parseFloat(agent.price.toString());
        }
      });
    });
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Step 2: Configure Agents</CardTitle>
            <CardDescription className="text-lg">
              Select optional agents for your modules. Required agents are already included.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {selectedModules.map((moduleName) => {
            const agents = moduleAgentsMap[moduleName] || [];
            if (agents.length === 0) return null;

            return (
              <Card key={moduleName}>
                <CardHeader>
                  <CardTitle>{moduleName}</CardTitle>
                  <CardDescription>Choose agents for this module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent) => {
                      const isRequired = agent.required || false;
                      const isSelected = isRequired || selectedAgents.get(moduleName)?.has(agent.agent_name);
                      
                      return (
                        <div
                          key={agent.agent_name}
                          className={`p-4 border rounded-lg transition-all ${
                            isRequired ? "bg-primary/5 border-primary/20 cursor-not-allowed" : 
                            isSelected ? "border-primary bg-primary/5 cursor-pointer hover:bg-primary/10" : 
                            "border-muted cursor-pointer hover:border-primary/50 hover:bg-muted/50"
                          }`}
                          onClick={() => !isRequired && toggleAgent(moduleName, agent.agent_name)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{agent.agent_name}</span>
                            {isSelected && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          {agent.price != null && (
                            <div className="text-sm mt-1 font-medium">${agent.price.toFixed(2)}/mo</div>
                          )}
                          {agent.description && (
                            <div className="text-sm text-muted-foreground mt-1">{agent.description}</div>
                          )}
                          {isRequired && (
                            <div className="text-xs text-primary mt-1 font-semibold">Required (Auto-included)</div>
                          )}
                          {!isRequired && (
                            <div className="text-xs text-muted-foreground mt-1">Click to select</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Agent Selection Summary */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Selected Agents Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Total agents selected: {Array.from(selectedAgents.values()).reduce((sum, agents) => sum + agents.size, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Agent Subscription Cost</p>
                <p className="text-2xl font-bold">${calculateTotalAgentPrice().toFixed(2)}/mo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
          <Button onClick={handleNext}>
            Continue to Step 3: Select Bundles
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2Agents;

