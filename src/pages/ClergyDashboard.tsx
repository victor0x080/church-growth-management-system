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
  Search,
  UserPlus,
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  Activity,
  ChevronRight,
  Star,
  CheckCircle2,
  DollarSign,
  CircleDollarSign,
  CreditCard
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
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [volunteerNeeds, setVolunteerNeeds] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthRevenue: 0,
    monthExpenses: 0
  });
  const [accountingAccess, setAccountingAccess] = useState(false);
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

    // Load dashboard data
    loadDashboardData();
    
    setLoading(false);
  };

  const loadDashboardData = async () => {
    // Mock data for clergy dashboard
    setUpcomingEvents([
      { id: 1, title: "Sunday Service", date: "Jan 28, 2025", time: "10:00 AM", location: "Main Sanctuary" },
      { id: 2, title: "Leadership Meeting", date: "Jan 30, 2025", time: "2:00 PM", location: "Conference Room" },
      { id: 3, title: "Volunteer Training", date: "Feb 1, 2025", time: "6:00 PM", location: "Youth Hall" },
    ]);

    setSuggestedConnections([
      { id: 1, name: "John Smith", match: "85%", interests: ["Leadership", "Youth Ministry"] },
      { id: 2, name: "Mary Johnson", match: "92%", interests: ["Music", "Women's Ministry"] },
      { id: 3, name: "David Williams", match: "78%", interests: ["Teaching", "Men's Fellowship"] },
    ]);

    setAnnouncements([
      { id: 1, title: "Upcoming Special Services", content: "Join us for our upcoming series on community outreach...", date: "Jan 25, 2025" },
      { id: 2, title: "Volunteer Opportunities", content: "New volunteer positions available for ministry...", date: "Jan 24, 2025" },
    ]);

    setCampaigns([
      { id: 1, title: "Spring Outreach", status: "Active", participants: 45, goal: "$5,000", raised: "$3,200" },
      { id: 2, title: "Building Fund", status: "Ongoing", participants: 120, goal: "$50,000", raised: "$42,500" },
    ]);

    setVolunteerNeeds([
      { id: 1, role: "Sunday School Teachers", needed: 3, filled: 5, urgency: "High" },
      { id: 2, role: "Greeters", needed: 4, filled: 2, urgency: "Medium" },
      { id: 3, role: "Music Ministry", needed: 2, filled: 1, urgency: "Low" },
    ]);

    setFinancialData({
      totalRevenue: 475000,
      totalExpenses: 470000,
      netIncome: 5000,
      monthRevenue: 42000,
      monthExpenses: 39000
    });
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Announcements Section at Top */}
        <div className="mb-8">
          <Card className="border-l-4 border-l-primary shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Bell className="w-6 h-6 text-primary" />
                Announcements
              </CardTitle>
              <CardDescription>
                Latest updates from {userProfile?.churches?.name || "Your Church"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 bg-primary/5 border rounded-lg hover:bg-primary/10 transition-colors">
                    <div className="font-medium text-lg mb-2">{announcement.title}</div>
                    <div className="text-sm text-muted-foreground">{announcement.content}</div>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {announcement.date}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Church Info */}
        <Card className="mb-8">
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

        {/* Financial Overview - Embark5 */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-green-600" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${(financialData.monthRevenue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-muted-foreground mt-1">+12% from last month</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDollarSign className="w-5 h-5 text-red-600" />
                Monthly Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                ${(financialData.monthExpenses / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-muted-foreground mt-1">-3% from last month</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Net Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                ${(financialData.netIncome / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-muted-foreground mt-1">This month</div>
            </CardContent>
          </Card>
        </div>

        {/* Fundraising Campaigns - Embark5 */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CircleDollarSign className="w-6 h-6 text-purple-600" />
                  Fundraising Campaigns
                </CardTitle>
                <CardDescription>
                  Track your active fundraising initiatives
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Campaign Creation", description: "Launch 8-step campaign wizard" })}>
                <Target className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.map((campaign) => {
                const raisedNum = parseFloat(campaign.raised.replace(/[^0-9.]/g, ''));
                const goalNum = parseFloat(campaign.goal.replace(/[^0-9.]/g, ''));
                const progress = (raisedNum / goalNum) * 100;
                return (
                  <div key={campaign.id} className="p-4 bg-background/50 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{campaign.title}</div>
                      <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="text-sm flex items-center justify-between text-muted-foreground">
                      <span>{campaign.raised} / {campaign.goal}</span>
                      <span>{Math.round(progress)}% funded</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {campaign.participants} participants
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-primary" />
                  Ministry Planning
                </CardTitle>
                <CardDescription>
                  Track your progress through 9 phases of ministry planning
                </CardDescription>
              </div>
              <Button onClick={() => navigate("/clergy/planning")} size="sm" variant="outline">
                View Planning
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-primary">{Math.round(overallProgress)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-primary">{completedPhases}</div>
                <div className="text-sm text-muted-foreground">Completed Phases</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-primary">{totalPhases - completedPhases}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={overallProgress} className="h-3" />
            </div>
            </CardContent>
          </Card>

        {/* Primary Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
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

          <Card className="hover:shadow-elegant-hover transition-shadow cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Calendar management will be available soon." })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Church Events
              </CardTitle>
              <CardDescription>
                Manage church events and calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Calendar</Button>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Planning, Campaigns, Volunteers, Operations */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Strategic Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Strategic Plans
              </CardTitle>
              <CardDescription>
                Create and manage ministry strategic plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate("/clergy/planning")}>
                  <Target className="w-4 h-4 mr-2" />
                  Ministry Planning
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Create New Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Campaigns
              </CardTitle>
              <CardDescription>
                Manage church campaigns and initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="font-medium flex items-center justify-between">
                      {campaign.title}
                      <Badge>{campaign.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {campaign.participants} participants • {campaign.raised} / {campaign.goal}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  Create New Campaign
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manage Volunteers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Volunteer Management
              </CardTitle>
              <CardDescription>
                Coordinate and manage volunteers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {volunteerNeeds.map((need) => (
                  <div key={need.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="font-medium flex items-center justify-between">
                      {need.role}
                      <Badge variant={need.urgency === "High" ? "destructive" : need.urgency === "Medium" ? "default" : "secondary"}>
                        {need.urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {need.filled} filled of {need.needed} needed
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  Manage Volunteers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manage Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Operations
              </CardTitle>
              <CardDescription>
                Manage church operations and resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Events
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Manage Documents
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClergyDashboard;
