import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText,
  PlayCircle,
  Lock
} from "lucide-react";
import { USER_ROLES, DASHBOARD_ROUTES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface StepProgress {
  step_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  data: any;
  completed_at: string | null;
}

const PhaseDetail = () => {
  const { phaseNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<any>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepProgress, setStepProgress] = useState<Map<string, StepProgress>>(new Map());
  const [phaseProgress, setPhaseProgress] = useState<any>(null);
  const [churchId, setChurchId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !phaseNumber) return;
    loadData();
  }, [user, phaseNumber]);

  const loadData = async () => {
    // Fetch profile for church_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("church_id")
      .eq("id", user?.id)
      .single();

    if (!profile?.church_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Church not found.",
      });
      navigate("/clergy");
      return;
    }

    setChurchId(profile.church_id);

    // Fetch phase
    const { data: phaseData } = await supabase
      .from("clergy_phases")
      .select("*")
      .eq("phase_number", parseInt(phaseNumber!))
      .single();

    if (!phaseData) {
      navigate("/clergy/planning");
      return;
    }

    setPhase(phaseData);

    // Fetch steps for this phase
    const { data: stepsData } = await supabase
      .from("clergy_steps")
      .select("*")
      .eq("phase_id", phaseData.id)
      .order("step_number");

    setSteps(stepsData || []);

    // Fetch progress for this phase
    const { data: phaseProgressData } = await supabase
      .from("church_planning_progress")
      .select("*")
      .eq("church_id", profile.church_id)
      .eq("phase_id", phaseData.id)
      .single();

    setPhaseProgress(phaseProgressData);

    // Fetch progress for steps
    const { data: stepProgressData } = await supabase
      .from("church_step_progress")
      .select("*")
      .eq("church_id", profile.church_id)
      .in("step_id", stepsData?.map(s => s.id) || []);

    const progressMap = new Map<string, StepProgress>();
    stepProgressData?.forEach(sp => {
      progressMap.set(sp.step_id, sp);
    });
    setStepProgress(progressMap);

    setLoading(false);
  };

  const handleStepStart = async (stepId: string) => {
    if (!churchId) return;

    await supabase
      .from("church_step_progress")
      .upsert({
        church_id: churchId,
        step_id: stepId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });

    toast({
      title: "Step started",
      description: "You can begin working on this step.",
    });

    loadData();
  };

  const handleStepComplete = async (stepId: string) => {
    if (!churchId) return;

    await supabase
      .from("church_step_progress")
      .upsert({
        church_id: churchId,
        step_id: stepId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

    // Check if all steps are completed
    const allSteps = steps.length;
    const completedSteps = Array.from(stepProgress.values())
      .filter(sp => sp.status === 'completed').length;

    // Update phase completion percentage
    const completionPercent = allSteps > 0 
      ? Math.round(((completedSteps + 1) / allSteps) * 100)
      : 0;

    await supabase
      .from("church_planning_progress")
      .upsert({
        church_id: churchId,
        phase_id: phase?.id,
        completion_percentage: completionPercent,
        status: completionPercent === 100 ? 'completed' : 'in_progress',
        completed_at: completionPercent === 100 ? new Date().toISOString() : null,
      });

    toast({
      title: "Step completed!",
      description: completionPercent === 100 ? "Phase completed! 🎉" : `Progress: ${completionPercent}%`,
    });

    // Check for milestones
    checkMilestones(completionPercent);

    loadData();
  };

  const checkMilestones = async (percentage: number) => {
    const milestones = [25, 50, 75, 100];
    if (milestones.includes(percentage)) {
      // Record milestone achievement
      await supabase
        .from("church_planning_achievements")
        .insert({
          church_id: churchId,
          achievement_type: 'percentage',
          achievement_value: percentage.toString(),
        })
        .catch(() => {}); // Ignore if already exists

      toast({
        title: `🎉 Milestone achieved!`,
        description: `You've reached ${percentage}% completion!`,
      });
    }
  };

  const getStepIcon = (type: string) => {
    if (type === 'document') return FileText;
    if (type === 'survey') return FileText;
    return Circle;
  };

  const getStepStatusBadge = (stepId: string) => {
    const stepProg = stepProgress.get(stepId);
    const status = stepProg?.status || 'not_started';

    if (status === 'completed') {
      return <Badge className="bg-green-500">Completed</Badge>;
    } else if (status === 'in_progress') {
      return <Badge className="bg-blue-500">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getPhaseCompletion = () => {
    if (!phaseProgress || !steps.length) return 0;
    const completed = steps.filter(s => stepProgress.get(s.id)?.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  };

  if (loading || !phase) {
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/clergy/planning")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">
                {phase.phase_number}. {phase.title}
              </h1>
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Phase Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Phase Progress</CardTitle>
            <CardDescription>Steps completed in this phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={getPhaseCompletion()} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{getPhaseCompletion()}% Complete</span>
                <span>
                  {steps.filter(s => stepProgress.get(s.id)?.status === 'completed').length} / {steps.length} Steps
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = getStepIcon(step.type);
            const stepProg = stepProgress.get(step.id);
            const status = stepProg?.status || 'not_started';
            const isLocked = false; // Add prerequisite logic here if needed

            return (
              <Card key={step.id} className="hover:shadow-elegant-hover transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full p-2 bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Step {step.step_number}: {step.title}
                          {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                        </CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {step.estimated_minutes} minutes
                          </span>
                          {step.is_required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStepStatusBadge(step.id)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end gap-2">
                    {status === 'not_started' && !isLocked && (
                      <Button onClick={() => handleStepStart(step.id)}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Step
                      </Button>
                    )}
                    {status === 'in_progress' && (
                      <Button onClick={() => handleStepComplete(step.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Step
                      </Button>
                    )}
                    {status === 'completed' && (
                      <div className="text-sm text-muted-foreground">
                        Completed on {new Date(stepProg?.completed_at || '').toLocaleDateString()}
                      </div>
                    )}
                    {isLocked && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Complete previous steps to unlock
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default PhaseDetail;

