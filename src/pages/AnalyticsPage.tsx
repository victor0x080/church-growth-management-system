import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  LogOut, 
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Heart
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
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
    setLoading(false);
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
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Church Analytics</h1>
              <p className="text-sm text-muted-foreground">
                {userProfile?.churches?.name || "Your Church"}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" /> Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">425</div>
              <p className="text-xs text-muted-foreground mt-1">+15 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Weekly Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground mt-1">Average attendance rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4" /> Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground mt-1">Active participation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" /> Goals Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground mt-1">Annual goals completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Member growth over the last 12 months shows consistent upward trend.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>New Members This Month</span>
                  <span className="font-medium">+15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Membership Retention</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Small Groups</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Ministry Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Recent activity across all ministry areas.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Weekly Services</span>
                  <span className="font-medium">2x per week</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Small Groups</span>
                  <span className="font-medium">12 active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volunteer Hours</span>
                  <span className="font-medium">450/month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Annual Budget</div>
                <div className="text-2xl font-bold">$485,000</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Funds Raised</div>
                <div className="text-2xl font-bold">$470,000</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="text-2xl font-bold text-green-600">$15,000</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AnalyticsPage;

