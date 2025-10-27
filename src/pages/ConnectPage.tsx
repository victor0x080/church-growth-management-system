import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  LogOut, 
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  X,
  Sparkles,
  Zap,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ConnectPage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [myProfileMatch, setMyProfileMatch] = useState({
    interests: ["Music", "Youth Ministry", "Photography"],
    personality: ["Creative", "Outgoing", "Faith-Focused"]
  });
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
      .select("*, churches(name)")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    loadConnections();
    setLoading(false);
  };

  const loadConnections = async () => {
    // Mock AI-powered matching data (Spark Fellowship concept: AI matchmaking)
    setSuggestedConnections([
      { 
        id: 1, 
        name: "Emily Rodriguez", 
        match: "92%", 
        interests: ["Music", "Youth Ministry", "Photography"],
        personality: ["Creative", "Passionate", "Mentor"],
        lifeStage: "Young Adult (25-30)",
        avatar: "/placeholder.svg",
        reason: "Both passionate about music and youth ministry. Emily leads the worship team.",
        suggestedActivity: "Coffee & discuss starting a photography ministry for teens",
        compatibilityScore: 92
      },
      { 
        id: 2, 
        name: "Michael Chen", 
        match: "88%", 
        interests: ["Photography", "Technology", "Teaching"],
        personality: ["Analytical", "Creative", "Helper"],
        lifeStage: "Professional (30-35)",
        avatar: "/placeholder.svg",
        reason: "Shared interest in photography and teaching. Both tech-savvy.",
        suggestedActivity: "Partner on creating digital media for church events",
        compatibilityScore: 88
      },
      { 
        id: 3, 
        name: "Rachel Thompson", 
        match: "85%", 
        interests: ["Bible Study", "Women's Ministry", "Leadership"],
        personality: ["Leader", "Encourager", "Organized"],
        lifeStage: "Professional (35-40)",
        avatar: "/placeholder.svg",
        reason: "Both lead groups and enjoy deep spiritual conversations.",
        suggestedActivity: "Start a women's Bible study together",
        compatibilityScore: 85
      },
      { 
        id: 4, 
        name: "David Park", 
        match: "82%", 
        interests: ["Service", "Community Outreach", "Praise & Worship"],
        personality: ["Servant-Heart", "Social", "Energetic"],
        lifeStage: "College Student (18-22)",
        avatar: "/placeholder.svg",
        reason: "Both love serving others and community outreach.",
        suggestedActivity: "Join forces on next community service project",
        compatibilityScore: 82
      },
      { 
        id: 5, 
        name: "Sarah Johnson", 
        match: "78%", 
        interests: ["Cooking", "Hospitality", "Fellowship"],
        personality: ["Warm", "Inclusive", "Nurturing"],
        lifeStage: "Parent (40-45)",
        avatar: "/placeholder.svg",
        reason: "Complementary strengths in hospitality and fellowship.",
        suggestedActivity: "Co-host welcome events for newcomers",
        compatibilityScore: 78
      },
    ]);

    setActiveConnections([
      { 
        id: 1, 
        name: "Pastor James", 
        status: "online", 
        lastActive: "Active now",
        connectionStrenght: "Strong",
        metAt: "Through worship team"
      },
      { 
        id: 2, 
        name: "Sister Anna", 
        status: "online", 
        lastActive: "Active 5min ago",
        connectionStrenght: "Medium",
        metAt: "Bible study group"
      },
      { 
        id: 3, 
        name: "Mike Johnson", 
        status: "away", 
        lastActive: "Active 2 hours ago",
        connectionStrenght: "Growing",
        metAt: "Small group meeting"
      },
    ]);
  };

  const handleConnect = (person: any) => {
    toast({
      title: "Connection Sent!",
      description: `You've sent a connection request to ${person.name}. AI will facilitate the introduction!`,
    });
    
    // Remove from suggested and add to active
    setSuggestedConnections(suggestedConnections.filter(p => p.id !== person.id));
    setActiveConnections([...activeConnections, { 
      id: person.id, 
      name: person.name, 
      status: "pending", 
      lastActive: "Awaiting response",
      connectionStrenght: "New",
      metAt: "AI-matched"
    }]);
  };

  const handlePass = (personId: number) => {
    setSuggestedConnections(suggestedConnections.filter(p => p.id !== personId));
    toast({
      title: "Passed",
      description: "We'll find better matches for you.",
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/parish")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Connect with Others</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered connection suggestions
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
        {/* AI Matching Info */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <CardTitle>AI Matchmaking Engine</CardTitle>
            </div>
            <CardDescription>
              Based on your profile, interests, and life stage, we've found {suggestedConnections.length} potential connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Your interests:</span>
              {myProfileMatch.interests.map((interest, i) => (
                <Badge key={i} variant="secondary">{interest}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Connections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Suggested Connections
            </CardTitle>
            <CardDescription>
              People who share your interests and values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestedConnections.map((person) => (
                <Card key={person.id} className="hover:shadow-elegant-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={person.avatar} />
                          <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{person.name}</CardTitle>
                          <CardDescription>{person.lifeStage}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white text-lg px-4 py-1">
                        {person.match} match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Why we think you'll connect:</p>
                      <p className="text-sm text-muted-foreground">{person.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Suggested activity:</p>
                      <p className="text-sm text-muted-foreground">{person.suggestedActivity}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-muted-foreground">Interests:</span>
                      {person.interests.map((interest: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{interest}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => handleConnect(person)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handlePass(person.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-primary" />
              Your Connections
            </CardTitle>
            <CardDescription>
              People you've connected with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeConnections.map((person) => (
                <div key={person.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${person.status === 'online' ? 'bg-green-500' : person.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'} rounded-full border-2 border-background`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{person.name}</div>
                    <div className="text-sm text-muted-foreground">{person.lastActive}</div>
                    <div className="text-xs text-muted-foreground mt-1">{person.metAt}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Message
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ConnectPage;

