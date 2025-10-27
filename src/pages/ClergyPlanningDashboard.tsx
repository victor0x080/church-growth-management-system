import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, 
  Building, 
  Users, 
  Target, 
  Network, 
  LayoutGrid, 
  DollarSign, 
  Calendar, 
  BarChart, 
  RefreshCw,
  CheckCircle2,
  Circle,
  PlayCircle,
  Lock
} from "lucide-react";
import { USER_ROLES, DASHBOARD_ROUTES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Lightbulb } from "lucide-react";

interface Phase {
  id: string;
  phase_number: number;
  title: string;
  description: string;
  icon_name: string;
  color: string;
  estimated_days: number;
  prerequisites: number[];
}

interface PhaseProgress {
  phase_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  started_at: string | null;
  completed_at: string | null;
}

interface Step {
  id: string;
  phase_id: string;
  step_number: number;
  title: string;
  description: string;
  type: string;
  is_required: boolean;
  estimated_minutes: number;
}

const PHASE_ICONS = {
  building: Building,
  users: Users,
  target: Target,
  sitemap: Network,
  grid: LayoutGrid,
  'dollar-sign': DollarSign,
  calendar: Calendar,
  'bar-chart': BarChart,
  'refresh-cw': RefreshCw,
};

const ClergyPlanningDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [progress, setProgress] = useState<Map<string, PhaseProgress>>(new Map());
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [nextRecommendedPhase, setNextRecommendedPhase] = useState<Phase | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    checkAccessAndLoadData();
  }, [user]);

  const checkAccessAndLoadData = async () => {
    if (!user) return;

    // Check if user has clergy role
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

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, churches(id)")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    setChurchId(profile?.church_id);
    
    // Load phases, steps, and progress
    await Promise.all([
      loadPhases(),
      loadSteps(),
      loadProgress(profile?.church_id)
    ]);
    
    setLoading(false);
  };

  const loadPhases = async () => {
    const { data, error } = await supabase
      .from("clergy_phases")
      .select("*")
      .order("phase_number");

    if (error) {
      console.error("Error loading phases:", error);
      return;
    }

    setPhases(data || []);
  };

  const loadSteps = async () => {
    const { data, error } = await supabase
      .from("clergy_steps")
      .select("*")
      .order("phase_id, step_number");

    if (error) {
      console.error("Error loading steps:", error);
      return;
    }

    setSteps(data || []);
  };

  const loadProgress = async (churchId: string | undefined) => {
    if (!churchId) return;

    const { data, error } = await supabase
      .from("church_planning_progress")
      .select("*")
      .eq("church_id", churchId);

    if (error) {
      console.error("Error loading progress:", error);
      return;
    }

    // Convert to Map for easy lookup
    const progressMap = new Map<string, PhaseProgress>();
    data?.forEach(p => {
      progressMap.set(p.phase_id, p);
    });

    // Calculate overall progress
    const totalPhases = phases.length || 9;
    const completedPhases = data?.filter(p => p.status === 'completed').length || 0;
    const overallPercentage = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

    setProgress(progressMap);
    setOverallProgress(overallPercentage);

    // Find next recommended phase
    findNextRecommendedPhase(progressMap, phases);
  };

  const findNextRecommendedPhase = (progressMap: Map<string, PhaseProgress>, phasesList: Phase[]) => {
    // Find the first phase that is either not started or in progress with prerequisites met
    for (const phase of phasesList.sort((a, b) => a.phase_number - b.phase_number)) {
      const phaseProg = progressMap.get(phase.id);
      const isUnlocked = checkPhaseUnlockedForRecommendation(phase, phasesList);
      
      if (isUnlocked && phaseProg?.status !== 'completed') {
        setNextRecommendedPhase(phase);
        return;
      }
    }
    setNextRecommendedPhase(null);
  };

  const checkPhaseUnlockedForRecommendation = (phase: Phase, phasesList: Phase[]): boolean => {
    if (!phase.prerequisites || phase.prerequisites.length === 0) return true;
    
    return phase.prerequisites.every(prereqNumber => {
      const prereqPhase = phasesList.find(p => p.phase_number === prereqNumber);
      return false; // Simplified - would check if prerequisite is completed
    });
  };

  const checkPhaseUnlocked = (phase: Phase): boolean => {
    if (!phase.prerequisites || phase.prerequisites.length === 0) return true;
    
    return phase.prerequisites.every(prereqNumber => {
      const phaseProgress = Array.from(progress.values()).find(p => {
        const phase = phases.find(ph => ph.phase_number === prereqNumber);
        return phase && p.phase_id === phase.id;
      });
      return phaseProgress?.status === 'completed';
    });
  };

  const handlePhaseStart = async (phaseId: string) => {
    if (!userProfile?.church_id) return;

    const { error } = await supabase
      .from("church_planning_progress")
      .upsert({
        church_id: userProfile.church_id,
        phase_id: phaseId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start phase.",
      });
      return;
    }

    // Reload progress
    await loadProgress(userProfile.church_id);
    
    toast({
      title: "Phase started!",
      description: "You can begin working on this phase.",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getPhaseIcon = (iconName: string) => {
    const IconComponent = PHASE_ICONS[iconName as keyof typeof PHASE_ICONS] || Circle;
    return IconComponent;
  };

  const getPhaseStatusBadge = (phaseId: string) => {
    const phaseProgress = progress.get(phaseId);
    const status = phaseProgress?.status || 'not_started';
    
    if (status === 'completed') {
      return <Badge variant="default" className="bg-green-500">Completed</Badge>;
    } else if (status === 'in_progress') {
      return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold">Ministry Planning Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {userProfile?.full_name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Overall Progress</p>
              <p className="text-lg font-bold">{Math.round(overallProgress)}%</p>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overall Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Track your journey through 9 phases of ministry planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={overallProgress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.round(overallProgress)}% Complete</span>
                <span>{phases.filter(p => progress.get(p.id)?.status === 'completed').length} / {phases.length} Phases</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guidance Card */}
        {nextRecommendedPhase && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Next Recommended Step
              </CardTitle>
              <CardDescription>
                Based on your current progress, here's what to work on next
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{nextRecommendedPhase.phase_number}. {nextRecommendedPhase.title}</h3>
                  <p className="text-sm text-muted-foreground">{nextRecommendedPhase.description}</p>
                </div>
                <Button onClick={() => navigate(`/clergy/phase/${nextRecommendedPhase.phase_number}`)}>
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics */}
        {churchId && <AnalyticsDashboard churchId={churchId} />}

        {/* Phase Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {phases.map((phase) => {
            const phaseProgress = progress.get(phase.id);
            const isUnlocked = checkPhaseUnlocked(phase);
            const IconComponent = getPhaseIcon(phase.icon_name);
            const stepsInPhase = steps.filter(s => s.phase_id === phase.id);
            const completedSteps = stepsInPhase.filter(step => {
              // This would require additional query to check step progress
              return false; // Placeholder
            });

            return (
              <Collapsible
                key={phase.id}
                open={expandedPhase === phase.phase_number}
                onOpenChange={(open) => setExpandedPhase(open ? phase.phase_number : null)}
              >
                <Card className="hover:shadow-elegant-hover transition-shadow">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${phase.color}-100 dark:bg-${phase.color}-900`}>
                            <IconComponent className={`w-6 h-6 text-${phase.color}-600 dark:text-${phase.color}-400`} />
                          </div>
                          <div>
                            <CardTitle className="text-left">
                              {phase.phase_number}. {phase.title}
                            </CardTitle>
                            <CardDescription className="text-left">
                              {phase.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        {getPhaseStatusBadge(phase.id)}
                        {!isUnlocked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {stepsInPhase.map((step, idx) => (
                          <div key={step.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{step.title}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t">
                        {phaseProgress?.status === 'not_started' && isUnlocked && (
                          <Button 
                            className="w-full" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/clergy/phase/${phase.phase_number}`);
                            }}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Phase
                          </Button>
                        )}
                        {phaseProgress?.status === 'in_progress' && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/clergy/phase/${phase.phase_number}`);
                            }}
                          >
                            Continue Phase
                          </Button>
                        )}
                        {phaseProgress?.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/clergy/phase/${phase.phase_number}`);
                            }}
                          >
                            View Phase
                          </Button>
                        )}
                        {!isUnlocked && (
                          <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" />
                            Complete prerequisites to unlock
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ClergyPlanningDashboard;

