import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Heart, 
  MessageSquare, 
  Users, 
  LogOut, 
  UserPlus, 
  Sparkles,
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  MapPin,
  Activity,
  TrendingUp,
  Star,
  Zap,
  Award,
  Trophy,
  CheckCircle2,
  Bot
} from "lucide-react";
import { USER_ROLES, DASHBOARD_ROUTES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";

const ParishDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [fellowshipStats, setFellowshipStats] = useState({
    activeConnections: 0,
    newSuggestions: 0,
    totalMembers: 0
  });
  const [engagementPoints, setEngagementPoints] = useState(0);
  const [engagementLevel, setEngagementLevel] = useState("Newcomer");
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);
  const [aiActivity, setAiActivity] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [user]);

  const checkAuth = async () => {
    if (!user) return;

    // Fetch user profile first to check onboarding status
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, churches(name), onboarding_completed")
      .eq("id", user.id)
      .single();

    // If onboarding not completed, redirect to onboarding
    if (!profile?.onboarding_completed) {
      navigate("/onboarding");
      return;
    }

    setUserProfile(profile);

    // Check if user has admin or clergy role and redirect
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (roles && roles.length > 0) {
      const userRole = roles[0].role;
      if (userRole === USER_ROLES.ADMIN) {
        navigate(DASHBOARD_ROUTES.ADMIN);
        return;
      } else if (userRole === USER_ROLES.CLERGY) {
        navigate(DASHBOARD_ROUTES.CLERGY);
        return;
      }
    }

    // Load dashboard data
    loadDashboardData();
    setLoading(false);
  };

  const loadDashboardData = async () => {
    // Mock data for now - would be replaced with actual Supabase queries
    setUpcomingEvents([
      { id: 1, title: "Sunday Service", date: "Jan 28, 2025", time: "10:00 AM", location: "Main Sanctuary" },
      { id: 2, title: "Prayer Meeting", date: "Jan 30, 2025", time: "7:00 PM", location: "Chapel" },
      { id: 3, title: "Youth Group", date: "Feb 1, 2025", time: "6:00 PM", location: "Youth Hall" },
    ]);

    setMyGroups([
      { id: 1, name: "Small Group Alpha", members: 12, meetingTime: "Wednesdays 7 PM" },
      { id: 2, name: "Bible Study", members: 8, meetingTime: "Saturdays 10 AM" },
    ]);

    setRecentActivity([
      { id: 1, type: "member", text: "Sarah joined the community", timestamp: "2 hours ago" },
      { id: 2, type: "event", text: "New event: Spring Retreat", timestamp: "5 hours ago" },
      { id: 3, type: "announcement", text: "Weekly Newsletter published", timestamp: "1 day ago" },
    ]);

    setAnnouncements([
      { id: 1, title: "Church Picnic This Weekend", content: "Join us for our annual picnic...", date: "Jan 25, 2025" },
      { id: 2, title: "New Small Groups Forming", content: "Connect with others in small groups...", date: "Jan 24, 2025" },
    ]);

    setSuggestedConnections([
      { id: 1, name: "John Smith", match: "85%", interests: ["Music", "Youth Ministry"], avatar: "/placeholder.svg" },
      { id: 2, name: "Mary Johnson", match: "92%", interests: ["Prayer", "Women's Ministry"], avatar: "/placeholder.svg" },
      { id: 3, name: "David Williams", match: "78%", interests: ["Teaching", "Men's Fellowship"], avatar: "/placeholder.svg" },
    ]);

    setActiveConnections([
      { id: 1, name: "Pastor James", status: "online", lastActive: "Active now" },
      { id: 2, name: "Sister Anna", status: "online", lastActive: "Active 5min ago" },
    ]);

    setFellowshipStats({
      activeConnections: 8,
      newSuggestions: 3,
      totalMembers: 250
    });

    setEngagementPoints(750);
    setEngagementLevel("Community Builder");

    setPrayerRequests([
      { id: 1, request: "Pray for healing for Sarah's mom", status: "Praying", responses: 5, date: "Jan 22" },
      { id: 2, request: "Pray for job opportunities for John", status: "Praying", responses: 3, date: "Jan 21" },
    ]);

    setAiActivity([
      { id: 1, type: "connection", message: "AI found 3 new connection matches for you", time: "Today at 10:30 AM" },
      { id: 2, type: "event", message: "Reminder: Small group meeting in 2 hours", time: "Today at 8:00 AM" },
      { id: 3, type: "prayer", message: "Your prayer request has 5 responses", time: "Yesterday at 3:45 PM" },
    ]);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleFindNewMatches = () => {
    toast({
      title: "Finding New Matches",
      description: "Our AI is analyzing community connections...",
    });
    // Simulate AI matching
    setTimeout(() => {
      toast({
        title: "New Matches Found!",
        description: "Refresh suggestions to see new connections.",
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin mx-auto" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold">Parish Dashboard</h1>
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

      <main className="px-4 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Quick Actions (Sticky) */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/parish/events")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Events
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/parish/profile")}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Update My Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/parish/groups")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Groups
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/parish/resources")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Resources
                </Button>
                <Separator className="my-2" />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/parish/prayer-requests")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Prayer Requests
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/parish/connect")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Connect with Others
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
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

        {/* AI Agent Activity Card - Spark Fellowship */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Bot className="w-5 h-5 text-purple-600" />
                    AI Agent Activity
                  </CardTitle>
                  <CardDescription>
                    Your AI assistant is working for you 24/7
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-background/50 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Points Card - Spark Fellowship */}
          <Card className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Trophy className="w-5 h-5 text-orange-600" />
                    Engagement Rewards
                  </CardTitle>
                  <CardDescription>
                    Track your community involvement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-4xl font-bold text-orange-600">{engagementPoints}</div>
                  <div className="text-sm text-muted-foreground mt-1">Points</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{engagementLevel}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {engagementLevel === "Community Builder" ? "500-1000 pts" : "Level info"}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Attended service: +100 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Joined small group: +150 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Connected with member: +50 pts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fellowship Stats Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Fellowship Community
                </CardTitle>
                <CardDescription>
                  {userProfile?.churches?.name || "Your Church"}
                </CardDescription>
              </div>
              <Button onClick={handleFindNewMatches} size="sm" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Find New Matches
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-primary">{fellowshipStats.activeConnections}</div>
                <div className="text-sm text-muted-foreground">Active Connections</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-primary">{fellowshipStats.newSuggestions}</div>
                <div className="text-sm text-muted-foreground">New Suggestions</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-primary">{fellowshipStats.totalMembers}</div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Prayer Requests - Spark Fellowship */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Prayer Requests
              </CardTitle>
              <CardDescription>
                Community prayer and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prayerRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="font-medium text-sm mb-1">{request.request}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {request.responses} praying
                      </span>
                      <span>{request.date}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  <Heart className="w-4 h-4 mr-2" />
                  Submit Prayer Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Suggested Connections
              </CardTitle>
              <CardDescription>
                AI-powered matching based on interests and life stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedConnections.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{person.name}</div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {person.interests.map((interest, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <Badge variant="outline" className="border-primary text-primary">
                          {person.match} match
                        </Badge>
                      </div>
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Active Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeConnections.map((person) => (
                  <div key={person.id} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{person.name}</div>
                      <div className="text-xs text-muted-foreground">{person.lastActive}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" /> {event.date} at {event.time}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                My Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myGroups.map((group) => (
                  <div key={group.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="font-medium">{group.name}</div>
                    <div className="text-sm text-muted-foreground">{group.members} members</div>
                    <div className="text-sm text-muted-foreground">{group.meetingTime}</div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  Join More Groups
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === 'member' && <UserPlus className="w-5 h-5 text-primary" />}
                      {activity.type === 'event' && <Calendar className="w-5 h-5 text-primary" />}
                      {activity.type === 'announcement' && <Bell className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.text}</div>
                      <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* View-Only Features Notice */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Limited Access Mode</div>
                <div className="text-sm text-muted-foreground">
                  As a parish member, you can view church information but have limited edit permissions. 
                  Contact church administrators for additional access.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div> {/* End main content area */}
        </div> {/* End flex container */}
      </main>
    </div>
  );
};

// Simple Loader component
const Loader = ({ className }: { className?: string }) => (
  <div className={`${className} border-4 border-primary/20 border-t-primary rounded-full`}></div>
);

export default ParishDashboard;
