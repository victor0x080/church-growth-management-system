import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  LogOut,
  PlusCircle,
  BarChart3,
  Calendar,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Circle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StrategicPlansPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [user]);

  const checkAuth = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, churches(name, denomination)")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    loadPlans();
    setLoading(false);
  };

  const loadPlans = async () => {
    setPlans([
      { 
        id: 1, 
        title: "Hope After School Program", 
        status: "In Progress",
        phase: "Fundraising",
        completion: 78,
        startDate: "Jan 2024",
        targetDate: "Sep 2024",
        budget: "$35,000",
        raised: "$27,300",
        description: "After-school care supporting academic success",
        mission: "Provide safe, nurturing after-school care",
        goals: ["Serve 40 children", "Build volunteer team of 15", "Achieve financial sustainability"],
        progressSteps: [
          { step: "Community Research", completed: true, date: "Jan 15" },
          { step: "Church Assessment", completed: true, date: "Jan 22" },
          { step: "Strategic Plan", inProgress: true },
          { step: "Fundraising", inProgress: true }
        ]
      },
      { 
        id: 2, 
        title: "Youth Ministry Expansion", 
        status: "Planning",
        phase: "Discovery",
        completion: 35,
        startDate: "Dec 2024",
        targetDate: "Jun 2025",
        budget: "$20,000",
        raised: "$7,000",
        description: "Expanding youth programs and activities",
        mission: "Engage and disciple the next generation",
        goals: ["Add 2 new programs", "Recruit 10 leaders", "Increase participation by 50%"],
        progressSteps: [
          { step: "Community Research", completed: true, date: "Dec 20" },
          { step: "Church Assessment", inProgress: true },
          { step: "Survey Creation", pending: true }
        ]
      },
    ]);
  };

  const handleCreatePlan = () => {
    toast({
      title: "Create New Strategic Plan",
      description: "Starting the guided planning process...",
    });
    navigate("/clergy/planning");
  };

  const handleViewReport = (planId: number) => {
    toast({
      title: "Viewing Report",
      description: "Generating comprehensive report...",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/clergy")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Strategic Plans</h1>
              <p className="text-sm text-muted-foreground">Manage your ministry strategic plans</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreatePlan}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{plans.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Strategic plans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{plans.filter(p => p.status === "In Progress" || p.status === "Planning").length}</div>
              <p className="text-xs text-muted-foreground mt-1">In development</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{plans.filter(p => p.status === "Completed").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Launched</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Funded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(
                  plans.reduce((acc, p) => acc + parseFloat(p.raised.replace(/[^0-9.]/g, "")), 0) /
                  1000
                ).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">Funds raised</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-elegant-hover transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{plan.title}</CardTitle>
                      <Badge variant={plan.status === "Completed" ? "default" : plan.status === "In Progress" ? "secondary" : "outline"}>
                        {plan.status}
                      </Badge>
                      <Badge variant="outline">{plan.phase}</Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewReport(plan.id)}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Mission Statement</h4>
                    <p className="text-sm text-muted-foreground">{plan.mission}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.goals.map((goal: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">{plan.completion}%</span>
                    </div>
                    <Progress value={plan.completion} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        Timeline
                      </div>
                      <div className="font-medium">{plan.startDate} - {plan.targetDate}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="w-4 h-4" />
                        Budget
                      </div>
                      <div className="font-medium">{plan.raised} / {plan.budget}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Project Timeline</h4>
                    <div className="space-y-2">
                      {plan.progressSteps.slice(0, 4).map((step: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : step.inProgress ? (
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={step.completed ? "text-muted-foreground" : ""}>
                            {step.step}
                          </span>
                          {step.date && (
                            <Badge variant="outline" className="text-xs ml-auto">{step.date}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StrategicPlansPage;

