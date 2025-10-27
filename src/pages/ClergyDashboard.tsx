import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Users, 
  BookOpen, 
  LogOut, 
  Target, 
  Settings, 
  FileText, 
  MessageSquare, 
  Heart,
  Award,
  BarChart3,
  Mail,
  Bell,
  Search
} from "lucide-react";
import { USER_ROLES, DASHBOARD_ROUTES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";

const ClergyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedPhases, setCompletedPhases] = useState(0);
  const [totalPhases, setTotalPhases] = useState(9);
  const [churchId, setChurchId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkClergyAccess();
  }, [user]);

  const checkClergyAccess = async () => {
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

    // Fetch user profile with onboarding status
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, churches(name, denomination)")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    // Check if onboarding is completed
    if (!(profile as any).onboarding_completed) {
      navigate("/onboarding");
      return;
    }

    setUserProfile(profile);
    setChurchId((profile as any).church_id || null);

    // Load planning progress if church exists
    if ((profile as any).church_id) {
      await loadPlanningProgress((profile as any).church_id);
    }

    setLoading(false);
  };

  const loadPlanningProgress = async (churchId: string) => {
    const { data: progressData } = await supabase
      .from("church_planning_progress")
      .select("*")
      .eq("church_id", churchId);

    if (progressData) {
      const completed = progressData.filter((p: any) => p.status === 'completed').length;
      setCompletedPhases(completed);
      setOverallProgress((completed / totalPhases) * 100);
    }
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
          <div>
            <h1 className="text-2xl font-display font-bold">Clergy Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {userProfile?.full_name}
            </p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Tracking Dashboard */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Overall Progress</span>
                <Badge variant="secondary">{Math.round(overallProgress)}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={overallProgress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {completedPhases} of {totalPhases} phases completed
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-elegant-hover transition-shadow" onClick={() => navigate("/clergy/planning")}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Ministry Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Continue Planning</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Continue your journey through ministry planning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Primary Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card 
            className="hover:shadow-elegant-hover transition-shadow cursor-pointer"
            onClick={() => navigate("/clergy/planning")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Ministry Planning
              </CardTitle>
              <CardDescription>
                Guide your church through 9 phases of ministry planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Planning</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Member management will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Church Members
              </CardTitle>
              <CardDescription>
                View and manage your church members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Manage Members</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Resources library will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Resources
              </CardTitle>
              <CardDescription>
                Access spiritual resources and materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Browse Resources</Button>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions - Communications & Engagement */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Messaging will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="w-4 h-4 text-primary" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Connect with members</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Announcements will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="w-4 h-4 text-primary" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Share updates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Calendar management will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-primary" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage church events</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Volunteer management will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="w-4 h-4 text-primary" />
                Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coordinate helpers</p>
            </CardContent>
          </Card>
        </div>

        {/* Tertiary Actions - Administrative Tools */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Reports will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-primary" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View analytics</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Documents will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage files</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Search will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="w-4 h-4 text-primary" />
                Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Find information</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Settings will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-4 h-4 text-primary" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure preferences</p>
            </CardContent>
          </Card>
        </div>

        {/* Church Info */}
        <Card>
          <CardHeader>
            <CardTitle>Church Information</CardTitle>
            <CardDescription>
              Manage your church profile and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">
                {(userProfile as any)?.churches?.name || "No church information available."}
              </p>
              {(userProfile as any)?.churches?.denomination && (
                <p className="text-sm text-muted-foreground">
                  Denomination: {(userProfile as any)?.churches?.denomination}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClergyDashboard;
